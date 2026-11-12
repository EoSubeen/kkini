import type { FinancialProfile, RecipeSelection } from "@/lib/contracts";
import { buildEngineInput } from "./engine";
import {
  EVENTS,
  findBest,
  makeCtx,
  engFromProfile,
  monte,
  needs,
  parHp,
  run,
  runReportCase,
  sensitivity,
  type R6Result,
} from "./r6";

/** 2025 가계금융복지조사 50~59세 가구 평균(만 원). r6 데모·보고서 [표 1]과 같은 값. */
export const PEER_50S = {
  source: "2025 가계금융복지조사 50~59세 가구 평균",
  totalAssets: 66_205,
  debt: 11_044,
  netWorth: 55_161,
} as const;

export interface TimelineEvent {
  age: number;
  year: number;
  title: string;
  cashFlow: number;
}

/** r6 renderTime()과 같은 규칙으로 '돈이 부딪히는 해'를 뽑는다. */
export function timelineEvents(result: R6Result): TimelineEvent[] {
  const p = result.p;
  const a0 = p.age0;
  const kids = (p.kids as number[]) ?? [];
  const events: Array<[number, string]> = [];
  const two = result.rows.find((row) => row.col >= 2);
  if (two) events.push([two.age, "자녀 두 명이 동시에 대학에 다녀요"]);
  kids.forEach((kid, index) => {
    if (kid < 19) events.push([a0 + 19 - kid, `자녀${index + 1} 대학 입학`]);
  });
  if (p.peak_age > a0 && p.peak_cut > 0) {
    events.push([p.peak_age, `임금피크 시작 (소득 −${Math.round(p.peak_cut * 100)}%)`]);
  }
  if (p.retire >= a0) {
    events.push([p.retire, p.np_age > p.retire ? "정년 · 월급이 끊기고 연금 크레바스 시작" : "정년"]);
  }
  if (p.par_years > 0 && p.par_m > 0) events.push([a0 + p.par_years, "부모님 지원 종료 (입력한 기간 기준)"]);
  if (p.loan > 0) events.push([a0 + p.loan_n - 1, "주담대 마지막 상환"]);
  events.push([p.np_age, "국민연금 개시"]);
  if (p.dc0 > 0) events.push([p.retire + p.dc_n - 1, "퇴직연금 마지막 수령"]);
  if (result.deplete) events.push([result.deplete, "금융자산이 0 아래로 내려가요"]);
  return events
    .filter(([age]) => age >= a0 && age <= 95)
    .sort((left, right) => left[0] - right[0])
    .map(([age, title]) => ({
      age,
      year: 2026 + age - a0,
      title,
      cashFlow: result.rows[age - a0]?.S ?? 0,
    }));
}

export function analyzeProfile(profile: FinancialProfile, selection?: RecipeSelection) {
  const baseInput = buildEngineInput(profile);
  const baseResult = run(baseInput.engineInput);
  const selected = selection && selection.selectedRecipeIds.length > 0 ? buildEngineInput(profile, selection) : null;
  const appliedResult = selected ? run(selected.engineInput) : baseResult;
  return { base: baseInput.base, ctx: baseInput.ctx, baseInput, baseResult, selected, appliedResult };
}

/** 가족 안전망: 세 세대 재무상태와 필요보장액(니즈분석). r6 renderFamily()·needs()와 같은 식. */
export function familyView(profile: FinancialProfile, selection?: RecipeSelection) {
  const { base, ctx, baseResult, appliedResult } = analyzeProfile(profile, selection);
  const parentEstate = profile.parentEstateValue ?? 0;
  const financial = base.dep0 + (base.inv0 as number) + (base.dc0 as number) + (base.ps0 as number);
  const debt = (base.loan as number) + (base.mt0 as number);
  const ourNetWorth = financial + base.house + (base.car as number) - debt;
  const parentPension = base.par_house > 0 ? parHp(base, ctx.parBoth) : 0;
  const at65 = appliedResult.rows.find((row) => row.age === 65) ?? appliedResult.rows[appliedResult.rows.length - 1];
  const protection = needs(base);
  return {
    parentEstate,
    parentHome: base.par_house,
    parentAge: base.par_age,
    ourFinancial: financial,
    ourDebt: debt,
    ourNetWorth,
    familyNetWorth: parentEstate + ourNetWorth,
    childrenAges: base.kids.filter((age) => age > 0),
    monthlyParentSupport: base.par_m,
    parentPensionMonthly: parentPension,
    supportAfterParentPension: Math.max(0, base.par_m - parentPension),
    monthlyCashFlow: baseResult.m0,
    assetsAt65: at65.Z,
    inheritanceShare: parentEstate / ctx.sib,
    protection,
  };
}

export function peerComparison(profile: FinancialProfile) {
  const base = engFromProfile(profile);
  const total = base.house + (base.dep0 as number) + (base.inv0 as number) + (base.dc0 as number) + (base.ps0 as number) + (base.car as number);
  const debt = (base.loan as number) + (base.mt0 as number);
  return {
    applicable: base.age0 >= 50 && base.age0 <= 59,
    source: PEER_50S.source,
    rows: [
      { label: "총자산", ours: total, average: PEER_50S.totalAssets },
      { label: "부채", ours: debt, average: PEER_50S.debt },
      { label: "순자산", ours: total - debt, average: PEER_50S.netWorth },
    ],
  };
}

/** 충격 테스트: 사건 하나씩 적용한 결과(고른 레시피 기준). */
export function shockTests(profile: FinancialProfile, selection?: RecipeSelection) {
  const before = run(buildEngineInput(profile, selection).engineInput);
  return {
    before: { depletionAge: before.deplete, assetsAt95: before.z95 },
    events: EVENTS.map((event) => {
      const after = run(buildEngineInput(profile, selection, [event.id]).engineInput);
      return { id: event.id, title: event.t, description: event.d, depletionAge: after.deplete, assetsAt95: after.z95 };
    }),
  };
}

/** 몬테카를로 500회(시드 고정). 지금 그대로 / 고른 조합 / 가드레일. */
export function monteCarlo(profile: FinancialProfile, selection?: RecipeSelection, runs = 500) {
  const baseInput = buildEngineInput(profile).engineInput;
  const chosen = selection && selection.selectedRecipeIds.length ? buildEngineInput(profile, selection).engineInput : baseInput;
  return {
    runs,
    current: monte(baseInput, runs),
    selected: monte(chosen, runs),
    guardrail: monte(chosen, runs, true),
  };
}

export function assumptionSensitivity(profile: FinancialProfile, selection?: RecipeSelection) {
  return sensitivity(buildEngineInput(profile, selection).engineInput);
}

/** '추천 조합 찾기'. 가족 동의·계약이 필요한 수동 처방은 넣지 않는다. */
export function recommendRecipes(profile: FinancialProfile, keepHouse = false) {
  const base = engFromProfile(profile);
  const best = findBest(base, makeCtx(profile), { keepHouse });
  return {
    recipeIds: best.ids,
    monthlyCashFlow: best.result.m0,
    depletionAge: best.result.deplete,
    assetsAt95: best.result.z95,
    alreadyOk: best.alreadyOk,
  };
}

/** 제출 보고서 추천안(고정 사례) 계산 결과. */
export function reportCaseResult() {
  const result = runReportCase();
  return { monthlyCashFlow: result.m0, depletionAge: result.deplete, assetsAt95: result.z95 };
}
