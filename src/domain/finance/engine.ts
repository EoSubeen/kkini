import type { DiagnosisResult, FinancialProfile, RecipeSelection } from "@/lib/contracts";
import {
  ASSUMPTIONS,
  ASSUMPTION_VERSION,
  CALCULATION_BASIS,
  CALCULATION_VERSION,
  MONEY_UNIT,
} from "./assumptions";
import { loanBalance, payment, reverseMortgageMonthly } from "./math";
import { normalizeFinanceInput } from "./normalize";
import type { FinanceCalculation, FinanceTimelineRow } from "./types";

interface CalculateOptions {
  now?: Date;
}

export function calculateFinance(
  profile: FinancialProfile,
  recipeSelection?: RecipeSelection,
  options: CalculateOptions = {},
): FinanceCalculation {
  const input = normalizeFinanceInput(profile, recipeSelection);
  const selected = new Set(input.appliedRecipeIds);
  const p = input.profile;
  const hasSpouse = p.spouseAge !== null && p.spouseAge > 0;
  const retirementExpense = selected.has("retm")
    ? Math.max(
        ASSUMPTIONS.minimumRetirementExpense,
        input.targetMonthlyRetirementExpense * 0.85,
      )
    : input.targetMonthlyRetirementExpense;
  const livingExpense = selected.has("basic")
    ? p.monthlyLivingExpense * 0.9
    : p.monthlyLivingExpense;
  const insurancePremium = selected.has("ins")
    ? p.monthlyInsurancePremium * (2 / 3)
    : p.monthlyInsurancePremium;
  const parentSupport = selected.has("par")
    ? p.monthlyParentSupport * 0.6
    : p.monthlyParentSupport;
  const retirementPensionYears = selected.has("dc15") ? 15 : 10;
  const monthlyPensionContribution = p.monthlyPersonalPensionContribution;
  const annualIrpContribution = selected.has("irp") ? 600 : 0;
  const reemploymentMonthly = selected.has("reemp") ? 200 : 0;
  const pensionStartAge = selected.has("np70")
    ? Math.min(70, p.nationalPensionStartAge + 5)
    : selected.has("np60")
      ? Math.max(60, p.nationalPensionStartAge - 5)
      : p.nationalPensionStartAge;
  const pensionTimingFactor =
    pensionStartAge < 65 ? 1 - 0.06 * (65 - pensionStartAge) : 1 + 0.072 * (pensionStartAge - 65);
  const mortgageAnnualPayment =
    p.mortgageBalance > 0 && p.mortgageYearsRemaining > 0
      ? payment(p.mortgageRate / 12, p.mortgageYearsRemaining * 12, p.mortgageBalance) * 12
      : 0;
  const reverseMortgageStartAge = 65;
  const reverseMortgageMonthlyAmount = input.reverseMortgageHomeValue
    ? reverseMortgageMonthly(input.reverseMortgageHomeValue, reverseMortgageStartAge)
    : 0;
  const downsizingAge =
    input.recipeSelection.housing.downsizingAge ?? p.retirementAge;
  const downsizingCash = input.downsizedHomeValue === null
    ? 0
    : Math.max(0, p.homeValue - input.downsizedHomeValue) * 0.96;

  let liquidAssets = p.deposits + p.investments - p.unsecuredDebt;
  let retirementPension = p.retirementPensionBalance;
  let personalPension = p.personalPensionBalance;
  const timeline: FinanceTimelineRow[] = [];

  for (let age = p.age; age <= ASSUMPTIONS.horizonAge; age += 1) {
    const offset = age - p.age;
    const year = ASSUMPTIONS.baseYear + offset;
    const inflation = Math.pow(1 + ASSUMPTIONS.inflationRate, offset);
    const pensionIndex = Math.pow(1 + ASSUMPTIONS.nationalPensionIndexRate, offset);
    const spouseAge = hasSpouse ? (p.spouseAge as number) + offset : null;
    const working = age < p.retirementAge;
    const wagePeak = age >= p.wagePeakAge;
    let wage = working
      ? Math.max(
          0,
          p.monthlyNetIncome * 12 -
            (wagePeak ? (input.annualGrossIncome * p.wagePeakReductionRate * 0.7) : 0),
        )
      : 0;
    if (age >= p.retirementAge && age < p.retirementAge + 5) {
      wage += reemploymentMonthly * 12;
    }
    if (spouseAge !== null && spouseAge < p.spouseRetirementAge) {
      wage += p.spouseMonthlyNetIncome * 12;
    }

    const childAges = p.childrenAges.map((childAge) => childAge + offset);
    const universityChildren = childAges.filter((childAge) => childAge >= 19 && childAge <= 22).length;
    const highSchoolChildren = childAges.filter((childAge) => childAge >= 16 && childAge <= 18).length;
    const educationExpense =
      (input.annualUniversityTuitionPerChild * universityChildren +
        input.monthlyAcademyCostPerHighSchoolChild * 12 * highSchoolChildren) *
      inflation;
    const nationalPension =
      age >= pensionStartAge
        ? input.nationalPensionMonthly * 12 * pensionTimingFactor * pensionIndex
        : 0;
    const spousePension =
      spouseAge !== null && spouseAge >= 65
        ? p.spouseNationalPensionMonthly * 12 * pensionIndex
        : 0;
    const pensionContribution = working
      ? monthlyPensionContribution * 12 + annualIrpContribution
      : 0;
    const pensionTaxCreditRate = input.annualGrossIncome <= 5_500 ? 0.165 : 0.132;
    const pensionTaxCredit = working
      ? Math.min(pensionContribution, 900) * pensionTaxCreditRate
      : 0;
    const educationTaxCredit = working
      ? Math.min(input.annualUniversityTuitionPerChild, 900) *
        universityChildren *
        0.15
      : 0;

    const retirementPensionWithdrawal =
      age >= p.retirementAge && age < p.retirementAge + retirementPensionYears && retirementPension > 0
        ? payment(
            ASSUMPTIONS.retirementReturnRate,
            p.retirementAge + retirementPensionYears - age,
            retirementPension,
          )
        : 0;
    const personalPensionWithdrawal =
      age >= p.retirementAge && age < p.retirementAge + 15 && personalPension > 0
        ? payment(
            ASSUMPTIONS.retirementReturnRate,
            p.retirementAge + 15 - age,
            personalPension,
          )
        : 0;
    const reverseMortgageIncome =
      age >= reverseMortgageStartAge ? reverseMortgageMonthlyAmount * 12 : 0;

    const income =
      wage +
      pensionTaxCredit +
      educationTaxCredit +
      nationalPension +
      spousePension +
      retirementPensionWithdrawal * (1 - ASSUMPTIONS.retirementTaxEffectiveRate * 0.7) +
      personalPensionWithdrawal * (1 - (age < 70 ? 0.055 : age < 80 ? 0.044 : 0.033)) +
      reverseMortgageIncome;

    const baseExpense =
      (working ? livingExpense : retirementExpense) * 12 * inflation;
    const supportExpense = offset < p.parentSupportYears ? parentSupport * 12 : 0;
    const mortgageExpense =
      offset < p.mortgageYearsRemaining &&
      !(input.downsizedHomeValue !== null && age >= downsizingAge)
        ? mortgageAnnualPayment
        : 0;
    const insuranceExpense = working ? insurancePremium * 12 : 0;
    const medicalExpense =
      ((age >= 65 ? 1 : 0) + (spouseAge !== null && spouseAge >= 65 ? 1 : 0)) *
      ASSUMPTIONS.medicalAnnualCostAt65 *
      ASSUMPTIONS.medicalSelfPayRate *
      Math.pow(1 + ASSUMPTIONS.medicalInflationRate, offset);
    const expense =
      baseExpense +
      educationExpense +
      supportExpense +
      mortgageExpense +
      insuranceExpense +
      medicalExpense +
      pensionContribution;
    const cashFlow = income - expense;

    if (input.downsizedHomeValue !== null && age === downsizingAge) {
      liquidAssets +=
        downsizingCash -
        loanBalance(
          p.mortgageBalance,
          p.mortgageRate,
          p.mortgageYearsRemaining,
          offset,
        );
    }

    const emergencyReserve = Math.min(Math.max(0, liquidAssets), expense / 2);
    const investable = Math.max(0, liquidAssets - emergencyReserve);
    const liquidReturn =
      liquidAssets >= 0
        ? ((emergencyReserve * ASSUMPTIONS.safeReturnRate * (1 - ASSUMPTIONS.interestTaxRate) +
            investable *
              (ASSUMPTIONS.safeReturnRate * 0.9 * (1 - ASSUMPTIONS.interestTaxRate) +
                ASSUMPTIONS.riskyReturnRate * 0.1)) /
            Math.max(1, liquidAssets))
        : 0;
    const debtInterest =
      liquidAssets < 0 ? Math.min(-liquidAssets, 5_000) * ASSUMPTIONS.unsecuredDebtRate : 0;

    liquidAssets = liquidAssets * (1 + liquidReturn) - debtInterest + cashFlow;
    const employerRetirementContribution = working
      ? (input.annualGrossIncome * (wagePeak ? 1 - p.wagePeakReductionRate : 1)) / 12
      : 0;
    retirementPension =
      retirementPension * (1 + ASSUMPTIONS.retirementReturnRate) +
      employerRetirementContribution -
      retirementPensionWithdrawal;
    personalPension =
      personalPension * (1 + ASSUMPTIONS.retirementReturnRate) +
      pensionContribution -
      personalPensionWithdrawal;

    timeline.push({
      year,
      age,
      spouseAge,
      income,
      expense,
      cashFlow,
      liquidAssets,
      retirementPension,
      personalPension,
      totalFinancialAssets: liquidAssets + retirementPension + personalPension,
      universityChildren,
      highSchoolChildren,
    });
  }

  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const monthlyExpense = first.expense / 12;
  const totalAssets =
    p.homeValue + p.deposits + p.investments + p.retirementPensionBalance + p.personalPensionBalance + p.otherAssets;
  const annualNetIncome = Math.max(1, p.monthlyNetIncome * 12 + p.spouseMonthlyNetIncome * 12);
  const result: DiagnosisResult = {
    calculationVersion: CALCULATION_VERSION,
    moneyUnit: MONEY_UNIT,
    monthlyCashFlow: first.cashFlow / 12,
    depletionAge: timeline.find((row) => row.liquidAssets < 0)?.age ?? null,
    assetsAt95: last.totalFinancialAssets,
    health: {
      emergencyFundMonths: (p.deposits - p.unsecuredDebt) / Math.max(1, monthlyExpense),
      debtToIncomeRate: (p.mortgageBalance + p.unsecuredDebt) / annualNetIncome,
      homeAssetRate: totalAssets > 0 ? p.homeValue / totalAssets : 0,
      pensionGapYears: Math.max(0, pensionStartAge - p.retirementAge),
    },
    generatedAt: (options.now ?? new Date()).toISOString(),
  };

  const notices = [
    "이 결과는 재무설계 교육·모의계산용이며 실제 결정 전 공식 기관 조회와 전문가 확인이 필요합니다.",
  ];
  if (input.removedRecipeIds.includes("hp")) {
    notices.push("이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.");
  }
  if (input.recipeSelection.housing.reverseMortgageEnabled && input.downsizedHomeValue !== null) {
    notices.push("이사 후 주택연금 월액은 새 집의 예상 가격으로 다시 계산한 추정값입니다.");
  }

  return {
    ...result,
    assumptionVersion: ASSUMPTION_VERSION,
    appliedRecipeIds: input.appliedRecipeIds,
    removedRecipeIds: input.removedRecipeIds,
    timeline,
    basis: CALCULATION_BASIS,
    notices,
  };
}
