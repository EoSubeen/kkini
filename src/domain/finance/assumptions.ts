export const CALCULATION_VERSION = "kkini-2026.11-v1";
export const ASSUMPTION_VERSION = "2026-11-03";
export const MONEY_UNIT = "KRW_10K" as const;

export const ASSUMPTIONS = {
  baseYear: 2026,
  horizonAge: 95,
  inflationRate: 0.02,
  nationalPensionIndexRate: 0.021,
  safeReturnRate: 0.0314,
  riskyReturnRate: 0.06,
  riskyAssetWeight: 0.1,
  retirementReturnRate: 0.04,
  retirementTaxEffectiveRate: 0.05,
  interestTaxRate: 0.154,
  unsecuredDebtRate: 0.055,
  medicalAnnualCostAt65: 550.8,
  medicalSelfPayRate: 0.2,
  medicalInflationRate: 0.03,
  minimumRetirementExpense: 216.6,
  coupleRetirementExpense: 298.1,
  singleRetirementExpense: 197.6,
  annualUniversityTuition: 823,
  monthlyHighSchoolAcademyCost: 79.3,
  nationalPensionAValue: 319.35,
  nationalPensionIncomeCap: 659,
} as const;

export const CALCULATION_BASIS = [
  { key: "money-unit", label: "금액 단위", value: "만원(KRW 10,000)" },
  { key: "inflation", label: "물가상승률", value: "연 2.0%" },
  { key: "safe-return", label: "안전자산 수익률", value: "연 3.14%" },
  { key: "risk-return", label: "위험자산 수익률", value: "연 6.0%" },
  { key: "pension-return", label: "연금자산 수익률", value: "연 4.0%" },
  { key: "horizon", label: "계산 기간", value: "기준연도부터 95세까지" },
] as const;

export const REPORT_RECOMMENDATION_CASE = {
  id: "kim-sand-report-v1",
  label: "김샌드 씨 · 보고서 추천안",
  fixedCase: true,
  sourceLabel: "제출 보고서의 고정 사례",
  monthlyCashFlow: -12,
  assetsAt95: 32_000,
  moneyUnit: MONEY_UNIT,
} as const;
