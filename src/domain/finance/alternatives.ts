// 분야별 대안(세금·복지·투자·집·상속) 계산. 식과 문안은 r6 데모의 같은 탭을 옮겼다. 금액 단위는 만 원.
import type { FinancialProfile, RecipeSelection } from "@/lib/contracts";
import { buildEngineInput } from "./engine";
import { cardInfo, margRate } from "./r6/planning.js";
import { cfg, dsInfo, engFromProfile, hpMonthly, makeCtx, run, type R6Input, type R6Result } from "./r6";

export type Tone = "good" | "warn" | "info";
export interface Note { title: string; tone: Tone; body: string }

function score(result: R6Result) {
  return result.deplete === null ? 1e9 + result.z95 : result.deplete * 1e6 + result.z95;
}

/** 세금·연말정산: 카드 결제 순서, 연금계좌 세액공제 */
export function taxAlternatives(profile: FinancialProfile) {
  const base = engFromProfile(profile);
  const ctx = makeCtx(profile);
  const card = (cardInfo as (o: R6Input, c: unknown) => { spend: number; rest: number; cur: { thr: number; ded: number }; opt: { ded: number }; rate: number; curRef: number; optRef: number; gain: number; thrLeft: number })(base, ctx);
  const creditRate = (base.gross as number) <= 5500 ? 0.165 : 0.132;
  const pensionPaid = (base.ps_m as number) * 12;
  const pensionRoom = Math.max(0, 900 - pensionPaid);
  const deps = 1 + (base.sage0 > 0 && base.sp_net_m === 0 ? 1 : 0) + base.kids.filter((k) => k <= 20).length + (base.par_age >= 60 ? 2 : 0);
  return {
    card: {
      spend: card.spend,
      threshold: card.cur.thr,
      currentRefund: card.curRef,
      optimizedRefund: card.optRef,
      gain: card.gain,
      creditUntilThreshold: Math.min(card.rest, card.thrLeft),
    },
    pension: {
      paid: pensionPaid,
      room: pensionRoom,
      creditRate,
      extraCreditIfFilled: pensionRoom * creditRate,
    },
    marginalRate: (margRate as (g: number, d: number) => number)(base.gross as number, deps),
    notes: [
      { title: "카드 결제 순서", tone: "good", body: "연봉의 25%까지는 공제가 없으니 혜택이 큰 신용카드로, 넘는 금액은 공제율 30%인 체크카드·현금영수증으로 결제해요. 전통시장·대중교통은 40%예요." },
      { title: "연금계좌 세액공제", tone: "info", body: `연금저축·IRP를 합쳐 연 900만 원까지 ${Math.round(creditRate * 1000) / 10}% 세액공제를 받아요. 다만 적자일 때 넣으면 마이너스통장 이자가 더 커질 수 있어 흑자 전환 뒤에 채워요.` },
      { title: "ISA", tone: "info", body: "예적금을 중개형 ISA로 옮기면 이자소득세 15.4% 대신 9.9% 분리과세(일반형 200만 원 비과세)예요. 만기 때 연금계좌로 옮기면 300만 원 한도로 추가 세액공제를 받아요. 손익통산·만기 조건이 있어 자동 계산에는 넣지 않았어요." },
      { title: "정기 월수지와 환급", tone: "warn", body: "연말정산 환급은 해마다 달라지는 돈이라 정기 월수지와 장기 계산에는 넣지 않았어요." },
    ] as Note[],
  };
}

/** 복지 혜택: 입력만으로 알 수 있는 조건과 공식 확인처 */
export function welfareAlternatives(profile: FinancialProfile) {
  const base = engFromProfile(profile);
  const both = profile.bothParentsAlive !== false;
  const income = profile.parentsMonthlyRecognizedIncome;
  const limit = both ? 395.2 : 247;
  const annual = (base.gross as number) + (base.sp_net_m as number) * 12 * 1.15;
  const earnedLimit = (base.sp_net_m as number) > 0 ? 4400 : base.sage0 > 0 || base.kids.some((k) => k < 18) ? 3200 : 2200;
  const items: Array<{ title: string; status: "추가 확인" | "조건상 제외"; body: string; url: string }> = [];
  const add = (title: string, excluded: boolean, body: string, url: string) =>
    items.push({ title, status: excluded ? "조건상 제외" : "추가 확인", body, url });
  if (base.par_age > 0) {
    add(
      "기초연금 (부모님)",
      base.par_age < 65 || (income !== null && income !== undefined && income > limit),
      `2026 ${both ? "부부" : "단독"} 소득인정액 기준 ${limit}만 원. ${income !== null && income !== undefined ? `입력 ${income}만 원` : "소득인정액 미입력"}. 받으면 부부 합계 월 최대 약 56만 원이에요.`,
      "https://www.bokjiro.go.kr",
    );
    add("노인장기요양·돌봄", false, "등급·서비스·본인부담을 확인한 뒤 돌봄비에서 확정 지원액만 빼서 비교해요.", "https://www.longtermcare.or.kr");
  }
  add("근로장려금", annual >= earnedLimit, `근로소득 근사 ${Math.round(annual).toLocaleString("ko-KR")}만 원 / 가구 기준 ${earnedLimit.toLocaleString("ko-KR")}만 원 미만. 재산 2.4억 원 미만 등 요건 확인.`, "https://www.hometax.go.kr");
  add("자녀장려금", annual >= 7000 || !base.kids.some((k) => k < 18), "총소득 7,000만 원 미만과 18세 미만 부양자녀 등 요건.", "https://www.hometax.go.kr");
  if (base.kids.length) add("국가장학금", false, "지원구간은 재단 심사로 정해져요. 월급·집값만으로 구간을 판정하지 않고, 계산에도 넣지 않았어요. 매 학기 꼭 신청해요.", "https://www.kosaf.go.kr");
  add("주택연금", base.house <= 0, "부부 중 1명이 55세 이상, 공시가격 12억 원 이하 주택. 월액은 부부 중 나이 적은 분 기준이에요.", "https://www.hf.go.kr");
  if (base.age0 >= 40) add("중장년 재취업·직업훈련", false, "고용24 중장년 생애경력설계와 국민내일배움카드로 정년 뒤 일자리를 미리 준비해요.", "https://www.work24.go.kr");
  return { items, parentIncomeLimit: limit };
}

const GRADE_NAMES = ["", "안정형", "안정추구형", "위험중립형", "적극투자형", "공격투자형"];
const MAT: Record<number, number[]> = { 1: [0, 0, 10, 20], 2: [0, 10, 20, 35], 3: [0, 20, 40, 55], 4: [0, 30, 50, 70], 5: [0, 40, 60, 80] };

/** 투자: 자금을 쓰는 시점별 네 바구니와 위험자산 비중(투자성향 기본 응답 57점·위험중립형 기준) */
export function investAlternatives(profile: FinancialProfile, selection?: RecipeSelection) {
  const { engineInput } = buildEngineInput(profile, selection);
  const result = run(engineInput);
  const p = result.p;
  const y0 = result.rows[0];
  const spend = Math.max(1, y0.R / 12);
  const emergency = (p.dep0 - p.mt0) / spend;
  const capped = y0.S < 0 || emergency < 3;
  const profileGrade = 3;
  const capacityGrade = Math.min(profileGrade, capped ? 2 : 5);
  const finalGrade = Math.min(profileGrade, capacityGrade);
  const longGrade = Math.min(profileGrade, capacityGrade + 1);
  const fin = p.dep0 + p.inv0 - p.mt0;
  const short = Math.max(0, Math.min(fin, spend * 6));
  const mid = Math.max(0, fin - short);
  const years = p.retire - p.age0;
  const pensions = p.dc0 + p.ps0;
  const bridge = Math.min(pensions, result.rows.filter((row) => row.age >= p.retire && row.age < p.np_age).reduce((sum, row) => sum + row.V + row.X, 0) / Math.pow(1.04, Math.max(0, years)));
  const long = Math.max(0, pensions - bridge);
  const buckets = [
    { name: "단기 (0~3년)", purpose: "비상자금 6개월치", amount: short, riskRate: MAT[finalGrade][0] },
    { name: "중기 (3~10년)", purpose: "나머지 예적금·투자", amount: mid, riskRate: MAT[finalGrade][1] },
    { name: "연결 (10~15년)", purpose: "정년~국민연금 사이에 꺼낼 연금", amount: bridge, riskRate: Math.min(70, MAT[finalGrade][2]) },
    { name: "장기 (15년 이상)", purpose: "그 뒤에 쓸 연금", amount: long, riskRate: Math.min(70, MAT[longGrade][3]) },
  ];
  return {
    profileGrade: GRADE_NAMES[profileGrade],
    capacityGrade: GRADE_NAMES[capacityGrade],
    finalGrade: GRADE_NAMES[finalGrade],
    capped,
    buckets,
    pensionRiskWeight: (engineInput.dc_w as number) ?? 0,
  };
}

/** 집·부동산: 그대로 살기 / 주택연금 / 이사 / 이사+주택연금 비교 */
export function houseAlternatives(profile: FinancialProfile, selection?: RecipeSelection, ratio = 0.7, moveAge = 0) {
  const base = engFromProfile(profile);
  const ctx = makeCtx(profile);
  ctx.ds = { ratio, age: moveAge };
  const H = base.house;
  const total = H + (base.dep0 as number) + (base.inv0 as number) + (base.dc0 as number) + (base.ps0 as number) + (base.car as number);
  if (!H) return { hasHome: false as const, homeShare: 0 };
  const ids = (selection?.selectedRecipeIds ?? []).filter((id) => id !== "hp" && id !== "down");
  const A = cfg(base, ctx, ids);
  const x = dsInfo(base, ctx.ds);
  const hpAge = base.hp_start_age;
  const youngerAtMove = base.sage0 > 0 ? Math.min(Math.max(hpAge, x.age), base.sage0 + Math.max(hpAge, x.age) - base.age0) : Math.max(hpAge, x.age);
  const newHomePension = hpMonthly(x.N, youngerAtMove);
  const moved = { ...A, ds_age: x.age, ds_cash: x.cash, house: x.N };
  const scenarios = [
    { name: "그대로 살기", input: A, home: H, pension: false },
    { name: `${hpAge}세부터 주택연금`, input: { ...A, hp_age: hpAge, hp_m: base.hp_quote_m }, home: H, pension: true },
    { name: `${x.age}세에 집 줄여 이사`, input: moved, home: x.N, pension: false },
    { name: `이사 + ${Math.max(hpAge, x.age)}세 주택연금`, input: { ...moved, hp_age: Math.max(hpAge, x.age), hp_m: newHomePension }, home: x.N, pension: true },
  ].map((scenario) => {
    const result = run(scenario.input);
    const received = result.rows.reduce((sum, row) => sum + row.hp, 0);
    return {
      name: scenario.name,
      depletionAge: result.deplete,
      assetsAt95: result.z95,
      pensionReceived: scenario.pension ? received : 0,
      homeLeft: scenario.pension ? Math.max(0, scenario.home - received) : scenario.home,
      pension: scenario.pension,
      score: score(result),
    };
  });
  const best = scenarios.reduce((left, right) => (right.score > left.score ? right : left));
  return {
    hasHome: true as const,
    homeShare: total ? H / total : 0,
    taxFree: !x.high,
    move: { newHome: x.N, age: x.age, cost: x.cost, cash: x.cash, loanLeft: x.bal },
    scenarios,
    bestName: best.name,
    housingPensionMonthly: base.hp_quote_m,
    youngerAge: base.hp_younger_age,
  };
}

const BRACKETS: Array<[number, number, number]> = [[10_000, 0.1, 0], [50_000, 0.2, 1_000], [100_000, 0.3, 6_000], [300_000, 0.4, 16_000], [1e12, 0.5, 46_000]];
function taxOf(base: number) {
  if (!(base > 0)) return 0;
  const bracket = BRACKETS.find((row) => base <= row[0]) ?? BRACKETS[BRACKETS.length - 1];
  return Math.max(0, (base * bracket[1] - bracket[2]) * 0.97);
}

/** 상속·증여: 부모님 상속세 추정, 내 몫, 자녀 증여 */
export function inheritAlternatives(profile: FinancialProfile, selection?: RecipeSelection) {
  const base = engFromProfile(profile);
  const estate = profile.parentEstateValue ?? 0;
  const both = profile.bothParentsAlive !== false;
  const siblings = Math.max(1, profile.siblingCountIncludingSelf || 1);
  const gift = profile.plannedGiftPerChild || 0;
  const spouseShare = both ? Math.min(300_000, Math.max(50_000, (estate * 1.5) / (1.5 + siblings))) : 0;
  const tax1 = both ? taxOf(estate - 50_000 - spouseShare) : taxOf(estate - 50_000);
  const tax2 = both ? taxOf(spouseShare - 50_000) : 0;
  const myShare = Math.max(0, both ? estate - tax1 - tax2 : estate - tax1) / siblings;
  const giftTax = taxOf(gift - 5_000);
  const result = run(buildEngineInput(profile, selection).engineInput);
  const myEstate = base.house + Math.max(0, result.z95 / Math.pow(1.02, 95 - base.age0));
  const myTax = taxOf(myEstate - 50_000 - (base.sage0 > 0 ? 50_000 : 0));
  return {
    estate,
    parentTax: tax1 + tax2,
    myShare,
    siblings,
    giftPerChild: gift,
    giftTax,
    myEstate,
    myTax,
    notes: [
      { title: "상속은 계획에 넣지 않아요", tone: "info", body: "언제, 얼마나 받을지 모르는 돈이라 현금흐름 계산에는 넣지 않았어요. 받게 되면 마이너스통장 상환 → 비상자금 → 연금계좌 순서로 쓰는 걸 권해요." },
      { title: "부모님 빚부터 확인", tone: "warn", body: "상속은 재산과 빚을 같이 받아요. 정부24 '안심상속 원스톱서비스'로 한 번에 조회하고, 빚이 더 많으면 3개월 안에 상속포기나 한정승인을 해요." },
      { title: "부모님 생활비 지원은 증여세 대상이 아니에요", tone: "good", body: `부양 의무가 있는 가족에게 주는 생활비·병원비는 사회 통념 안이면 증여세가 없어요. 지금 드리는 월 ${Math.round(base.par_m)}만 원도 여기에 해당해요.` },
      { title: "자녀 결혼 지원은 공제 안에서", tone: "good", body: "성인 자녀는 10년간 5,000만 원, 혼인신고 전후 2년 안이면 1억 원을 더해 1인 최대 1억 5,000만 원까지 증여세가 없어요." },
      { title: "주택연금과 상속", tone: selection?.selectedRecipeIds.includes("hp") ? "warn" : "info", body: "주택연금은 두 분이 모두 돌아가신 뒤 집을 팔아 정산하고 남는 돈은 상속돼요. 받은 돈이 집값을 넘어도 자녀에게 청구하지 않아요." },
    ] as Note[],
  };
}
