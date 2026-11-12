import type { DiagnosisResult, FinancialProfile, RecipeSelection } from "@/lib/contracts";
import {
  ASSUMPTION_VERSION,
  CALCULATION_BASIS,
  CALCULATION_VERSION,
  MONEY_UNIT,
} from "./assumptions";
import { normalizeFinanceInput } from "./normalize";
import { cfg, dsInfo, engFromProfile, hpMonthly, makeCtx, run, type R6Input, type R6Result } from "./r6";
import type { FinanceCalculation, FinanceTimelineRow } from "./types";

interface CalculateOptions {
  now?: Date;
  /** 충격 테스트용 사건 id(ev_job 등). 비우면 사건 없이 계산한다. */
  events?: string[];
}

/**
 * 입력 프로필과 레시피 선택을 r6 엔진 입력으로 바꾼다.
 * 이사 뒤 주택연금은 새 집 값과 부부 중 나이 적은 사람 기준으로 다시 추정한다.
 */
export function buildEngineInput(
  profile: FinancialProfile,
  recipeSelection?: RecipeSelection,
  events: string[] = [],
) {
  const input = normalizeFinanceInput(profile, recipeSelection);
  const base = engFromProfile(profile);
  const ctx = makeCtx(profile);
  ctx.ds = {
    ratio: input.recipeSelection.housing.downsizingRatio,
    age: input.recipeSelection.housing.downsizingAge ?? 0,
  };
  const o = cfg(base, ctx, input.appliedRecipeIds, events);
  const postMovePension =
    input.recipeSelection.housing.reverseMortgageEnabled && input.appliedRecipeIds.includes("down");
  if (postMovePension) {
    const move = dsInfo(base, ctx.ds);
    Object.assign(o, {
      hp_age: base.hp_start_age,
      hp_m: hpMonthly(move.N, base.hp_younger_age),
    });
  }
  return { input, base, ctx, engineInput: o, applied: o.__applied };
}

function toTimeline(result: R6Result): FinanceTimelineRow[] {
  return result.rows.map((row) => ({
    year: row.yr,
    age: row.age,
    spouseAge: row.sage > 0 ? row.sage : null,
    income: row.J,
    expense: row.R,
    cashFlow: row.S,
    liquidAssets: row.T,
    retirementPension: row.W,
    personalPension: row.Y,
    totalFinancialAssets: row.Z,
    universityChildren: row.col,
    highSchoolChildren: row.hs,
    wage: row.wage,
    nationalPension: row.np + row.snp,
    housingPension: row.hp,
    livingExpense: row.K,
    educationExpense: row.L,
    parentSupport: row.M,
    mortgagePayment: row.N,
    insurancePremium: row.O,
  }));
}

export function summarize(base: R6Input, result: R6Result) {
  const p = result.p;
  const y0 = result.rows[0];
  const monthlySpend = Math.max(1, y0.R / 12);
  const totalAssets = p.house + p.dep0 + p.inv0 + p.dc0 + p.ps0 + p.car;
  return {
    monthlyCashFlow: result.m0,
    depletionAge: result.deplete,
    assetsAt95: result.z95,
    crevasseShortfall: -Math.min(0, result.crev),
    health: {
      emergencyFundMonths: (p.dep0 - p.mt0) / monthlySpend,
      debtToIncomeRate: (p.loan + p.mt0) / Math.max(1, (p.net_m + p.sp_net_m) * 12),
      homeAssetRate: totalAssets > 0 ? p.house / totalAssets : 0,
      pensionGapYears: Math.max(0, p.np_age - p.retire),
      savingsRate: y0.S / Math.max(1, y0.wage + y0.credit),
      debtServiceRate: y0.N / Math.max(1, y0.wage),
    },
    assumptionsUsed: {
      nationalPensionEstimated: base.npEst,
      survivorPensionMonthly: base.survivor_m,
      housingPensionMonthly: base.hp_quote_m,
      housingPensionYoungerAge: base.hp_younger_age,
    },
  };
}

export function calculateFinance(
  profile: FinancialProfile,
  recipeSelection?: RecipeSelection,
  options: CalculateOptions = {},
): FinanceCalculation {
  const { input, base, engineInput, applied } = buildEngineInput(
    profile,
    recipeSelection,
    options.events ?? [],
  );
  const result = run(engineInput);
  const summary = summarize(base, result);

  const diagnosis: DiagnosisResult = {
    calculationVersion: CALCULATION_VERSION,
    moneyUnit: MONEY_UNIT,
    monthlyCashFlow: summary.monthlyCashFlow,
    depletionAge: summary.depletionAge,
    assetsAt95: summary.assetsAt95,
    health: {
      emergencyFundMonths: summary.health.emergencyFundMonths,
      debtToIncomeRate: summary.health.debtToIncomeRate,
      homeAssetRate: summary.health.homeAssetRate,
      pensionGapYears: summary.health.pensionGapYears,
    },
    generatedAt: (options.now ?? new Date()).toISOString(),
  };

  const notices = [
    "이 결과는 재무설계 교육·모의계산용이며 실제 결정 전 공식 기관 조회와 전문가 확인이 필요합니다.",
    "정기 월수지에는 해마다 달라지는 연말정산 환급을 넣지 않았어요.",
  ];
  if (base.npEst) notices.push("국민연금 예상액을 비워 두어 공단 간단계산 산식으로 추정했어요. 공단 조회값으로 바꿔 주세요.");
  if (applied.includes("hp")) {
    notices.push(
      `주택연금 월 ${Math.round(base.hp_quote_m)}만 원은 부부 중 나이가 적은 분(${base.hp_younger_age}세) 기준 일람표 추정값이에요. 가입 전 한국주택금융공사 조회가 필요해요.`,
    );
  }
  if (input.removedRecipeIds.includes("hp")) {
    notices.push("이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.");
  }
  if (input.recipeSelection.housing.reverseMortgageEnabled && input.downsizedHomeValue !== null) {
    notices.push("이사 후 주택연금 월액은 새 집의 예상 가격으로 다시 계산한 추정값입니다.");
  }

  return {
    ...diagnosis,
    assumptionVersion: ASSUMPTION_VERSION,
    appliedRecipeIds: applied as FinanceCalculation["appliedRecipeIds"],
    removedRecipeIds: input.removedRecipeIds,
    timeline: toTimeline(result),
    basis: CALCULATION_BASIS,
    notices,
    crevasseShortfall: summary.crevasseShortfall,
    savingsRate: summary.health.savingsRate,
    debtServiceRate: summary.health.debtServiceRate,
  };
}
