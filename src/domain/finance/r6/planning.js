/* eslint-disable */
// r6 데모의 처방(레시피)·사건·모의실험·필요보장액 계산을 화면 코드와 분리해 옮긴 모듈.
// 원본은 전역 입력(P)과 선택(sel)을 읽었으므로, 여기서는 같은 값을 ctx로 넘겨받는다.
import { BASE, run, pmt, loanBal, npStart, safeRate } from "./engine-core.js";

export const NPS_A = 319.35, NPS_CAP = 659;
export function npEstimate(gross, retire) { const B = Math.min(NPS_CAP, gross / 12), yrs = Math.min(40, Math.max(10, retire - 27)); return Math.round(0.43 * (NPS_A + B) / 2 * yrs / 40); }

// 주택금융공사 일반주택·종신 정액형 월지급금(6억 원 기준, 만 원). 63세 값은 2026.6.1 일람표 조회값(1,410,020원).
const HP_POINTS = [[55, 93.6], [60, 126.4], [63, 141.0], [65, 151.7]];
export function hpMonthly(house, youngerAge) { const a = Math.max(55, Math.min(65, youngerAge)); let v = HP_POINTS[HP_POINTS.length - 1][1]; for (let k = 1; k < HP_POINTS.length; k++) { const [a0, v0] = HP_POINTS[k - 1], [a1, v1] = HP_POINTS[k]; if (a >= a0 && a <= a1) { v = v0 + (v1 - v0) * (a - a0) / (a1 - a0); break; } } return Math.round(v * house / 60000 * 10) / 10; }

export function parHp(o, parBoth) { const a = Math.max(65, Math.min(80, o.par_age - (parBoth ? 3 : 0))), pts = [[65, 75.85], [70, 92.3], [75, 114.3], [80, 144.9]]; let v = pts[0][1]; for (let k = 1; k < pts.length; k++) { const [a0, v0] = pts[k - 1], [a1, v1] = pts[k]; if (a >= a0 && a <= a1) v = v0 + (v1 - v0) * (a - a0) / (a1 - a0); } return v * o.par_house / 30000; }

/** FinancialProfile → r6 엔진 입력(eng()와 같은 규칙). 금액은 만 원. */
export function engFromProfile(p) {
  const n = (v, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  const o = {};
  o.age0 = n(p.age); o.sage0 = n(p.spouseAge) > 0 ? p.spouseAge : 0;
  o.kids = (p.childrenAges || []).filter((v) => Number.isFinite(v) && v >= 0);
  o.net_m = n(p.monthlyNetIncome); o.gross = p.annualGrossIncome == null ? o.net_m * 12 * 1.25 : n(p.annualGrossIncome);
  o.sp_net_m = n(p.spouseMonthlyNetIncome); o.sp_ret = n(p.spouseRetirementAge, 60);
  o.retire = n(p.retirementAge, 60); o.peak_age = n(p.wagePeakAge, o.retire); o.peak_cut = n(p.wagePeakReductionRate);
  o.npEst = p.nationalPensionMonthly == null; o.np_m = o.npEst ? npEstimate(o.gross, o.retire) : n(p.nationalPensionMonthly);
  o.np_age = n(p.nationalPensionStartAge, npStart(o.age0, 2026)); o.snp_m = n(p.spouseNationalPensionMonthly);
  o.basic_m = n(p.monthlyLivingExpense); o.ins_m = n(p.monthlyInsurancePremium);
  o.par_m = n(p.monthlyParentSupport); o.par_years = n(p.parentSupportYears);
  o.tuition = p.annualUniversityTuitionPerChild == null ? 823 : n(p.annualUniversityTuitionPerChild);
  o.hag_m = p.monthlyAcademyCostPerHighSchoolChild == null ? 79.3 : n(p.monthlyAcademyCostPerHighSchoolChild);
  o.ret_m = p.targetMonthlyRetirementExpense == null ? (o.sage0 > 0 ? 298.1 : 197.6) : n(p.targetMonthlyRetirementExpense);
  o.dep0 = n(p.deposits); o.inv0 = n(p.investments); o.mt0 = n(p.unsecuredDebt); o.house = n(p.homeValue);
  o.loan = n(p.mortgageBalance); o.loan_r = n(p.mortgageRate); o.loan_n = n(p.mortgageYearsRemaining);
  o.dc0 = n(p.retirementPensionBalance); o.ps0 = n(p.personalPensionBalance); o.ps_m = n(p.monthlyPersonalPensionContribution);
  o.car = n(p.otherAssets); o.par_house = n(p.parentHomeValue); o.ps_age = Math.max(55, o.retire); o.par_age = n(p.supportedParentAge);
  o.cover = n(p.deathBenefit); o.refund_y = 0; o.ins_ret_m = 0;
  // 확인값이 없는 항목은 r6 사례와 같은 규칙의 '사례 가정값'으로 채운다(화면에서 가정값임을 표시).
  o.survivor_m = o.sage0 > 0 ? Math.round(o.np_m * 0.6) : 0;
  o.par_new_m = Math.round(o.par_m * 0.4);
  o.hp_start_age = 65;
  const younger = o.sage0 > 0 ? Math.min(o.hp_start_age, o.sage0 + o.hp_start_age - o.age0) : o.hp_start_age;
  o.hp_quote_m = o.house > 0 ? hpMonthly(o.house, younger) : 0;
  o.hp_younger_age = younger;
  o.par_hp_quote_m = 0; o.par_hp_start = 0;
  ['care_m', 'care_months', 'care_support', 'care_support_months', 'leave_months', 'np_add_quote', 'sp_np_quote'].forEach((k) => (o[k] = 0));
  o.ret_min = Math.min(o.ret_m, o.sage0 > 0 ? 216.6 : 143.7);
  return o;
}

export function makeCtx(p) {
  const gen = p.indemnityInsuranceGeneration && p.indemnityInsuranceGeneration !== "unknown" ? p.indemnityInsuranceGeneration + "세대" : "모름";
  return {
    parBoth: p.bothParentsAlive !== false,
    silson: !!p.hasIndemnityInsurance, silGen: gen, silM: p.monthlyIndemnityPremium || 0,
    cardY: p.annualCardSpend, chkPct: (p.checkCardCashReceiptRate || 0) * 100, tradY: p.annualTraditionalMarketSpend || 0, busY: p.annualTransitSpend || 0,
    parEstate: p.parentEstateValue || 0, sib: Math.max(1, p.siblingCountIncludingSelf || 1),
    ds: { ratio: 0.6, age: 0 },
  };
}

export const termPrem = (age, amt) => amt / 10000 * (age < 40 ? 2 : age < 50 ? 3.5 : age < 60 ? 6 : 12);

export function needs(o) {
  const cover = o.cover || 0, kids = o.kids, yk = kids.length ? Math.max(0, 25 - Math.min(...kids)) : 0;
  const hasSp = o.sage0 > 0, spAt = o.sage0 + yk, yB = hasSp ? Math.max(0, 65 - spAt) : 0;
  const A = o.basic_m * 0.7 * 12 * yk, Ap = o.par_m * 12 * Math.min(o.par_years, yk);
  const B = 197.6 * 12 * yB;
  let C = 0; kids.forEach((k) => { for (let a = k; a <= 22; a++) { if (a >= 19) C += o.tuition; else if (a >= 16) C += o.hag_m * 12; } });
  const D = o.loan + o.mt0, E = 1500;
  const need = A + Ap + B + C + D + E;
  const F = o.dep0 + o.inv0, G = o.dc0 + o.ps0, Iv = hasSp ? o.survivor_m * 12 * (yk + yB) : 0;
  const Jv = hasSp ? o.sp_net_m * 12 * Math.max(0, Math.min(yk + yB, o.sp_ret - o.sage0)) : 0;
  const have = F + G + cover + Iv + Jv, gap = Math.max(0, need - have);
  return { cover, yk, yB, A, Ap, B, C, D, E, need, F, G, Iv, Jv, have, gap };
}

const brk = (v) => v < 5000 ? Math.min(v * 0.006, 25) : v < 20000 ? Math.min(v * 0.005, 80) : v < 90000 ? v * 0.004 : v < 120000 ? v * 0.005 : v < 150000 ? v * 0.006 : v * 0.007;
const acqR = (v) => v <= 60000 ? 0.01 : v <= 90000 ? (v / 10000 * 2 / 3 - 3) / 100 : 0.03;
export function dsInfo(o, ds) { const H = o.house, N = Math.round(H * ds.ratio), age = Math.max(o.age0 + 1, ds.age || o.retire); const sell = brk(H) * 1.1, buy = brk(N) * 1.1, acq = N * acqR(N) * 1.1, move = 300, cost = sell + buy + acq + move; return { H, N, age, sell, buy, acq, move, cost, cash: H - N - cost, bal: loanBal(o.loan, o.loan_r, o.loan_n, age - o.age0), high: H > 120000 }; }

function deps(o) { return 1 + (o.sage0 > 0 && o.sp_net_m === 0 ? 1 : 0) + o.kids.filter((k) => k <= 20).length + (o.par_age >= 60 ? 2 : 0); }
export function margRate(g, d) { const tb = g * 0.7 - 150 * d; return tb <= 1400 ? 0.066 : tb <= 5000 ? 0.165 : tb <= 8800 ? 0.264 : tb <= 15000 ? 0.385 : 0.418; }
export function cardDed(o) {
  const thr = o.gross * 0.25, items = [[o.credit, 0.15, 'c'], [o.check, 0.30, 'k'], [o.trad, 0.40, 't'], [o.bus, o.reform ? 0.15 : 0.40, o.reform ? 'c' : 't']].sort((a, b) => a[1] - b[1]);
  let left = thr, base = 0, extra = 0;
  items.forEach(([amt, r, k]) => { const ex = Math.max(0, amt - left); left = Math.max(0, left - amt); const d = ex * r; if (k === 't') extra += d; else base += d; });
  const baseCap = o.gross <= 7000 ? 300 : 250, exCap = o.reform ? (o.gross <= 7000 ? 200 : 100) : (o.gross <= 7000 ? 300 : 200);
  const used = Math.min(base + extra, baseCap), over = Math.max(0, base + extra - baseCap), add = Math.min(over, extra, exCap);
  const total = o.credit + o.check + o.trad + o.bus;
  return { thr, ded: used + add, total, over: Math.max(0, total - thr), baseCap, exCap };
}
export function cardInfo(o, ctx, reform = false) {
  const spend = ctx.cardY == null ? o.basic_m * 12 : ctx.cardY, trad = ctx.tradY, bus = ctx.busY, rest = Math.max(0, spend - trad - bus), ck = Math.min(100, Math.max(0, ctx.chkPct)) / 100;
  const cur = cardDed({ gross: o.gross, credit: rest * (1 - ck), check: rest * ck, trad, bus, reform });
  const thrLeft = Math.max(0, o.gross * 0.25 - trad - bus);
  const opt = cardDed({ gross: o.gross, credit: Math.min(rest, thrLeft), check: Math.max(0, rest - thrLeft), trad, bus, reform });
  const rate = margRate(o.gross, deps(o));
  return { spend, rest, ck, cur, opt, rate, curRef: cur.ded * rate, optRef: opt.ded * rate, gain: (opt.ded - cur.ded) * rate, thrLeft };
}
export function silInfo(ctx) { const g = parseInt(ctx.silGen) || 0, m = ctx.silM || 0, cut = g <= 2 ? 0.5 : g === 3 ? 0.4 : g === 4 ? 0.3 : 0; return { gen: ctx.silGen, g, m, cut, est: g === 3, ok: ctx.silson && g >= 1 && g <= 4 && m > 0 }; }

// 투자성향 설문 기본 응답(r6 ANS 기본값)과 자산배분 매트릭스
export const QS_DEFAULT_SCORE = 4 + 10 + 10 + 8 + 9 + 10 + 6; // 각 문항의 기본 선택 점수 합 = 57점(위험중립형)
const g5 = (x) => x > 80 ? 5 : x > 60 ? 4 : x > 40 ? 3 : x > 20 ? 2 : 1;
const MAT = { 1: [0, 0, 10, 20], 2: [0, 10, 20, 35], 3: [0, 20, 40, 55], 4: [0, 30, 50, 70], 5: [0, 40, 60, 80] };
const DC_RISK_CAP = 70;
export function allocOf(o, surveyScore = QS_DEFAULT_SCORE) {
  try {
    const r = run(o), p = r.p, y0 = r.rows[0], spendM = y0.R / 12, em = (p.dep0 - p.mt0) / spendM, sr = y0.S / Math.max(1, y0.wage + y0.credit), dsr = y0.N / Math.max(1, y0.wage), yrs = p.retire - p.age0;
    const pg = g5(surveyScore), cs = (em >= 6 ? 20 : em >= 3 ? 12 : em >= 1 ? 6 : 0) + (sr >= .2 ? 20 : sr >= .1 ? 14 : sr >= 0 ? 8 : 0) + (dsr <= .2 ? 20 : dsr <= .3 ? 14 : dsr <= .4 ? 8 : 0) + (yrs >= 20 ? 20 : yrs >= 10 ? 14 : yrs >= 5 ? 8 : 3) + (p.sp_net_m > 0 ? 20 : 12);
    const cg0 = g5(cs), cg = (y0.S < 0 || em < 3) ? Math.min(cg0, 2) : cg0, fg = [Math.min(pg, cg), Math.min(pg, cg), Math.min(pg, cg), Math.min(pg, cg + 1)];
    const pens = p.dc0 + p.ps0, bridge = Math.min(pens, r.rows.filter((x) => x.age >= p.retire && x.age < p.np_age).reduce((a, x) => a + x.V + x.X, 0) / Math.pow(1.04, Math.max(0, yrs))), long = Math.max(0, pens - bridge);
    const pb = Math.min(MAT[fg[2]][2], DC_RISK_CAP), pl = Math.min(MAT[fg[3]][3], DC_RISK_CAP);
    return { risk_w: MAT[fg[1]][1] / 100, dc_w: pens > 0 ? (bridge * pb + long * pl) / pens / 100 : pl / 100, profileGrade: pg, capacityGrade: cg, finalGrade: fg[1] };
  } catch (e) { return {}; }
}

/** 처방 목록. p(o, ctx, sel): 엔진 입력에 덮어쓸 값. ok(o, ctx, sel): 적용 가능 여부. manual: 자동 추천 제외. x: 같이 못 쓰는 처방. */
export const RECIPES = [
  { id: "basic", t: "생활비 다이어트", p: (o) => ({ basic_m: o.basic_m * 0.9 }) },
  { id: "card", t: "카드 결제 순서 바꾸기", manual: true, p: () => ({}), ok: (o, c) => { const x = cardInfo(o, c); return o.gross > 0 && x.gain >= 1; } },
  { id: "sil5", t: "5세대 실손으로 전환", manual: true, x: "ins", p: (o, c) => { const s = silInfo(c); return { ins_m: Math.max(0, o.ins_m - s.m * s.cut) }; }, ok: (o, c) => silInfo(c).ok },
  { id: "ins", t: "보험 리모델링", manual: true, x: "sil5", p: (o) => ({ ins_m: o.ins_m * 2 / 3 }), ok: (o) => o.ins_m > 0 },
  { id: "par", t: "부모 지원 조정", manual: true, x: "parhp", p: (o) => ({ par_m: Math.max(0, o.par_m - o.par_new_m) }), ok: (o) => o.par_m > 0 && o.par_new_m > 0 },
  { id: "term", t: "정기보험으로 사망보장 채우기", manual: true, p: (o) => { const nd = needs(o), gap = nd.gap, end = o.age0 + Math.max(1, nd.yk); return { term_cover: gap, term_m: termPrem(o.age0, gap), term_end: end }; }, ok: (o) => needs(o).gap > 0 },
  { id: "irp", t: "IRP 한도 채우기", p: () => ({ irp_y: 600 }) },
  { id: "spouse", t: "배우자 국민연금 임의가입", manual: true, p: (o) => ({ sp_prem: 9.623, sp_years: Math.max(0, 60 - o.sage0), snp_m: o.snp_m + Math.max(0, 60 - o.sage0) * 1.8 }), ok: (o) => o.sage0 > 0 && o.sage0 < 60 && o.sp_net_m === 0 },
  { id: "reemp", t: "정년 뒤 5년 재취업", p: () => ({ reemp_m: 200 }) },
  { id: "dc15", t: "퇴직연금 15년 나눠 받기", p: () => ({ dc_n: 15 }), ok: (o) => o.dc0 > 0 },
  { id: "down", t: "정년 때 집 줄여 이사", manual: true, p: (o, c) => { const x = dsInfo(o, c.ds); return { ds_age: x.age, ds_cash: x.cash, house: x.N }; }, ok: (o) => o.house >= 20000 },
  { id: "hp", t: "본인 주택연금", manual: true, p: (o) => ({ hp_age: o.hp_start_age, hp_m: o.hp_quote_m }), ok: (o, c, sel) => o.house > 0 && o.hp_quote_m > 0 && o.hp_start_age >= Math.max(o.age0, 55) && !sel.has("down") },
  { id: "retm", t: "은퇴 후 생활비 조정", p: (o) => ({ ret_m: Math.min(o.ret_m, Math.max(Math.min(o.ret_m, o.ret_min ?? (o.sage0 > 0 ? 216.6 : 143.7)), o.ret_m * 0.85)) }) },
  { id: "parhp", t: "부모님 주택연금으로 부모 지원 끝내기", manual: true, x: "par", p: (o, c) => ({ par_m: Math.max(0, o.par_m - parHp(o, c.parBoth)) }), ok: (o) => o.par_house > 0 && o.par_m > 0 && o.par_house <= 120000 },
  { id: "youth", t: "자녀 청년미래적금으로 결혼자금 스스로", manual: true, p: () => ({ wed_amt: 701 }), ok: (o) => o.kids.some((k) => k >= 15 && k <= 34) },
  { id: "isa", t: "ISA로 이자 세금 줄이기", manual: true, p: () => ({}) },
  { id: "npcont", t: "재취업 기간 국민연금 임의계속가입", manual: true, p: (o) => ({ np_add: 0.43 * (319.35 + (o.reemp_m || 200)) / 2 * 5 / 40, npc_m: (o.reemp_m || 200) * 0.095 }), ok: (o, c, sel) => sel.has("reemp") },
  { id: "prepay", t: "정년 때 퇴직금으로 남은 대출 갚기", manual: true, p: () => ({ prepay: true }), ok: (o) => o.loan > 0 && o.retire - o.age0 < o.loan_n },
  { id: "np70", t: "국민연금 5년 연기", manual: true, x: "np60", p: (o) => ({ np_age: Math.min(70, o.np_age + 5) }) },
  { id: "np60", t: "국민연금 5년 조기수령", manual: true, x: "np70", p: (o) => ({ np_age: Math.max(60, o.np_age - 5) }) },
];

export const EVENTS = [
  { id: "ev_job", t: "56세 권고사직", d: "56세부터 정년까지 근로소득이 절반으로 줄어요 (저임금 재취업 가정)" },
  { id: "ev_care", t: "부모님 요양", d: "4년 뒤부터 5년간 요양비 월 100만 원이 더 들어요" },
  { id: "ev_wed", t: "자녀 결혼 지원", d: "자녀가 32세가 되는 해에 1인당 약 3천만 원 (2026 결혼비용 조사, 신혼집 제외분의 절반)" },
  { id: "ev_rate", t: "예금금리 1%p 하락", d: "안전자산 수익률이 1%포인트 낮아져요" },
  { id: "ev_carejob", t: "부모 돌봄으로 1년 휴직", d: "4년 뒤 부모님 요양이 시작되며 1년간 무급 휴직해 근로소득이 끊겨요" },
  { id: "ev_loanrate", t: "주담대 금리 2%p 상승", d: "내년부터 대출 금리가 2%p 올라 원리금이 늘어요 (변동금리 가정)" },
  { id: "ev_inh", t: "부모님 상속", d: "부모님이 90세가 되는 해에 재산을 형제 수로 나눈 몫을 받아요 (상속세 없음 가정)" },
];

export function avail(base, ctx, sel) { return RECIPES.filter((rc) => !rc.ok || rc.ok(base, ctx, sel)); }

/** r6 cfg(): 기본 입력에 고른 처방과 사건을 덮어쓰고 투자 배분을 연결한다. */
export function cfg(base, ctx, selIds = [], evIds = []) {
  const sel = new Set(selIds);
  const valid = new Set(avail(base, ctx, sel).map((r) => r.id));
  for (const id of [...sel]) if (!valid.has(id)) sel.delete(id);
  const o = Object.assign({}, base);
  RECIPES.forEach((r) => { if (sel.has(r.id)) Object.assign(o, r.p(Object.assign({}, o), ctx, sel)); });
  evIds.forEach((e) => (o[e] = true));
  if (o.ev_inh) { const pa = base.par_age || 0; o.inh_age = pa > 0 ? Math.max(1, 90 - pa) : 0; o.inh_amt = (ctx.parEstate - (sel.has("parhp") ? (o.par_house || 0) : 0)) / ctx.sib; }
  Object.assign(o, allocOf(o));
  o.__applied = [...sel];
  return o;
}

export function rngSeed(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** 몬테카를로 모의실험(시드 20261103 고정, 재현 가능). guard=true면 인출 가드레일 적용. */
export function monte(o, N = 500, guard = false) {
  const R = rngSeed(20261103), gref = guard ? run(o).rows.map((r) => r.Z) : null, g = () => { let u = 0, v = 0; while (!u) u = R(); v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const n = (o.horizon || 95) - o.age0 + 1, safe = o.safe_r ?? BASE.safe_r, dw = o.dc_w ?? BASE.dc_w; let ok = 0, cut = 0; const z = [], dep = [], gl = [];
  const t5 = () => { const z0 = g(); let c = 0; for (let j = 0; j < 5; j++) { const y = g(); c += y * y; } return z0 / Math.sqrt(c / 5) * Math.sqrt(3 / 5); };
  for (let k = 0; k < N; k++) {
    const seq = Array.from({ length: n }, () => { const sf = Math.max(-0.99, safe + 0.008 * g()), rk = Math.max(-0.99, 0.06 + 0.18 * t5()), inf = Math.max(-0.99, 0.02 + 0.01 * g()); return { sf, rk, inf, d: sf * (1 - dw) + rk * dw }; });
    const r = run(Object.assign({}, o, { seq, gref })); z.push(r.z95); gl.push(r.gLow); if (r.cuts) cut++; if (r.deplete === null) ok++; else dep.push(r.deplete);
  }
  z.sort((a, b) => a - b); dep.sort((a, b) => a - b); const q = (x) => z[Math.floor(x * (N - 1))];
  return { p: ok / N, p10: q(0.1), p50: q(0.5), p90: q(0.9), dmed: dep.length ? dep[Math.floor(dep.length / 2)] : null, cut: cut / N, g10: gl.sort((a, b) => a - b)[Math.floor(0.1 * (N - 1))] };
}

function score(r) { return r.deplete === null ? 1e9 + r.z95 : r.deplete * 1e6 + r.z95; }

/** r6 '추천 조합 찾기'. 적자 먼저 → 가족 보장 → 효과 큰 순서로 더한다. 수동 처방은 넣지 않는다. */
export function findBest(base, ctx, { keepHouse = false } = {}) {
  const sel = new Set();
  const runSel = () => run(cfg(base, ctx, [...sel]));
  let cur = runSel(), guard = 0;
  const A = avail(base, ctx, sel).filter((r) => !r.manual && !(keepHouse && r.id === "hp")), wasNeg = cur.m0 < 0;
  if (cur.deplete === null && cur.z95 >= 0) return { ids: [], result: cur, wasNeg, alreadyOk: true };
  for (const id of ["basic", "ins", "par"]) { if (cur.m0 >= 0) break; if (!A.find((r) => r.id === id)) continue; sel.add(id); cur = runSel(); }
  if (A.find((r) => r.id === "term")) { sel.add("term"); cur = runSel(); }
  while (guard++ < A.length) {
    let best = null, bs = score(cur);
    A.forEach((rc) => { if (sel.has(rc.id) || (rc.x && sel.has(rc.x))) return; sel.add(rc.id); const r = runSel(); sel.delete(rc.id); if (score(r) > bs) { bs = score(r); best = [rc.id, r]; } });
    if (!best) break; sel.add(best[0]); cur = best[1]; if (cur.deplete === null && cur.z95 >= 0) break;
  }
  for (const id of ["isa", "npcont"]) { const rc = RECIPES.find((r) => r.id === id); if (!rc || sel.has(id) || (rc.ok && !rc.ok(base, ctx, sel))) continue; sel.add(id); const r = runSel(); if (r.z95 > cur.z95) cur = r; else sel.delete(id); }
  return { ids: [...sel], result: cur, wasNeg, alreadyOk: false };
}

/** 가정값 민감도: 하나씩 상·하향해 95세 자산 차이를 본다. */
export const SENS = [
  ["np_m", "국민연금 예상액", "±20%", (o, s) => ({ np_m: o.np_m * (1 + 0.2 * s) })],
  ["basic_m", "현재 생활비", "±10%", (o, s) => ({ basic_m: o.basic_m * (1 + 0.1 * s) })],
  ["ret_m", "은퇴 후 생활비", "±10%", (o, s) => ({ ret_m: o.ret_m * (1 + 0.1 * s) })],
  ["net_m", "월 소득", "±10%", (o, s) => ({ net_m: o.net_m * (1 + 0.1 * s), gross: o.gross * (1 + 0.1 * s) })],
  ["dc_r", "연금계좌 수익률", "±1%p", (o, s) => ({ dc_r: 0.04 + 0.01 * s })],
  ["safe_r", "예금금리", "±1%p", (o, s) => ({ safe_r: 0.03 + 0.01 * s })],
  ["infl", "물가상승률", "±0.5%p", (o, s) => ({ infl: 0.02 + 0.005 * s })],
  ["retire", "정년", "±2년", (o, s) => ({ retire: o.retire + 2 * s, peak_age: Math.min(o.peak_age, o.retire + 2 * s) })],
  ["peak_cut", "임금피크 세후감액률", "±10%p", (o, s) => ({ peak_cut: Math.max(0, o.peak_cut + 0.1 * s) })],
  ["tuition", "대학 등록금", "±10%", (o, s) => ({ tuition: o.tuition * (1 + 0.1 * s) })],
  ["med_s", "노후 의료비 본인부담", "±10%p", (o, s) => ({ med_s: 0.2 + 0.1 * s })],
];
export function sensitivity(o) {
  const b = run(o);
  return { base: b.z95, rows: SENS.map((x) => { const lo = run(Object.assign({}, o, x[3](o, -1))), hi = run(Object.assign({}, o, x[3](o, 1))); return { key: x[0], label: x[1], range: x[2], low: lo.z95, high: hi.z95, lowDeplete: lo.deplete, highDeplete: hi.deplete, width: Math.abs(hi.z95 - lo.z95) }; }).sort((a, c) => c.width - a.width) };
}

/** 제출 보고서 추천안(고정 사례). r6 REPORT_CASE 입력을 그대로 돌린다. */
export const REPORT_CASE = { "age0": 50, "net_m": 600, "gross": 9000, "sp_net_m": 0, "sp_ret": 60, "peak_age": 55, "retire": 60, "np_m": 174, "np_age": 65, "snp_m": 0, "basic_m": 232.20000000000002, "ins_m": 30, "par_m": 30, "par_years": 11, "tuition": 823, "hag_m": 79.3, "ret_m": 253.38500000000002, "dep0": 3500, "inv0": 2500, "mt0": 1500, "house": 60000, "loan": 18000, "loan_n": 15, "dc0": 11000, "ps0": 1800, "ps_m": 25, "car": 2000, "par_house": 30000, "sage0": 48, "peak_cut": 0.2, "loan_r": 0.042, "kids": [21, 18], "npEst": false, "ps_age": 60, "par_age": 78, "cover": 10000, "refund_y": 0, "survivor_m": 104, "ins_ret_m": 0, "par_new_m": 20, "care_m": 0, "care_months": 0, "care_support": 0, "care_support_months": 0, "leave_months": 0, "hp_quote_m": 141, "hp_start_age": 65, "par_hp_quote_m": 0, "par_hp_start": 0, "np_add_quote": 0, "sp_np_quote": 0, "ret_min": 216.6, "safe_r": 0.03, "risk_w": 0.1, "dc_w": 0.22027590665571584, "term_cover": 20000, "term_m": 12, "term_end": 57, "reemp_m": 200, "reemp_n": 5, "isa_cap": 0, "np_add": 13.957531249999999, "npc_m": 19, "hp_age": 65, "hp_m": 141 };
export function runReportCase() { return run(REPORT_CASE); }
export { run, safeRate, pmt, loanBal, npStart };
