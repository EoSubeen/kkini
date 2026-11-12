import { z } from "zod";

const optionalAmount = z.number().finite().nonnegative().nullable().default(null);
const amount = z.number().finite().nonnegative();
const age = z.number().int().min(0).max(120);

export const financialProfileSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  displayName: z.string().trim().min(1).max(40),
  age: age.min(25).max(80),
  spouseAge: age.nullable().default(null),
  childrenAges: z.array(age).max(3).default([]),
  supportedParentAge: age.nullable().default(null),
  parentNeedsCare: z.boolean().default(false),

  monthlyNetIncome: amount,
  annualGrossIncome: optionalAmount,
  spouseMonthlyNetIncome: amount.default(0),
  spouseRetirementAge: age.default(60),
  retirementAge: age.default(60),
  wagePeakAge: age.default(56),
  wagePeakReductionRate: z.number().min(0).max(1).default(0.2),
  nationalPensionMonthly: optionalAmount,
  nationalPensionStartAge: age.default(65),
  spouseNationalPensionMonthly: amount.default(0),

  monthlyLivingExpense: amount,
  monthlyInsurancePremium: amount.default(0),
  annualCardSpend: optionalAmount,
  checkCardCashReceiptRate: z.number().min(0).max(1).default(0),
  annualTraditionalMarketSpend: amount.default(0),
  annualTransitSpend: amount.default(0),
  monthlyParentSupport: amount.default(0),
  parentSupportYears: z.number().int().min(0).max(50).default(0),
  annualUniversityTuitionPerChild: optionalAmount,
  monthlyAcademyCostPerHighSchoolChild: optionalAmount,
  targetMonthlyRetirementExpense: optionalAmount,

  deposits: amount,
  investments: amount.default(0),
  unsecuredDebt: amount.default(0),
  homeValue: amount.default(0),
  mortgageBalance: amount.default(0),
  mortgageRate: z.number().min(0).max(1).default(0.042),
  mortgageYearsRemaining: z.number().int().min(0).max(50).default(0),
  retirementPensionBalance: amount.default(0),
  personalPensionBalance: amount.default(0),
  monthlyPersonalPensionContribution: amount.default(0),
  otherAssets: amount.default(0),

  deathBenefit: optionalAmount,
  cancerBenefit: optionalAmount,
  hasIndemnityInsurance: z.boolean().default(false),
  indemnityInsuranceGeneration: z
    .enum(["unknown", "1", "2", "3", "4", "5"])
    .default("unknown"),
  monthlyIndemnityPremium: optionalAmount,
  parentEstateValue: optionalAmount,
  parentHomeValue: optionalAmount,
  bothParentsAlive: z.boolean().default(true),
  siblingCountIncludingSelf: z.number().int().min(1).max(20).default(1),
  plannedGiftPerChild: amount.default(0),
  parentsMonthlyRecognizedIncome: optionalAmount,
  householdPropertyMonthlyIncomeEquivalent: optionalAmount,
});

export type FinancialProfile = z.infer<typeof financialProfileSchema>;

export const financialProfileInputSchema = financialProfileSchema.partial().extend({
  schemaVersion: z.literal(1).default(1),
});

export type FinancialProfileInput = z.infer<typeof financialProfileInputSchema>;
