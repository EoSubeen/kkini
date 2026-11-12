import type { DiagnosisResult, FinancialProfile, RecipeId, RecipeSelection } from "@/lib/contracts";

export interface NormalizedFinanceInput {
  profile: FinancialProfile;
  annualGrossIncome: number;
  nationalPensionMonthly: number;
  annualUniversityTuitionPerChild: number;
  monthlyAcademyCostPerHighSchoolChild: number;
  targetMonthlyRetirementExpense: number;
  recipeSelection: RecipeSelection;
  appliedRecipeIds: RecipeId[];
  removedRecipeIds: RecipeId[];
  downsizedHomeValue: number | null;
  reverseMortgageHomeValue: number | null;
}

export interface FinanceTimelineRow {
  year: number;
  age: number;
  spouseAge: number | null;
  income: number;
  expense: number;
  cashFlow: number;
  liquidAssets: number;
  retirementPension: number;
  personalPension: number;
  totalFinancialAssets: number;
  universityChildren: number;
  highSchoolChildren: number;
  wage: number;
  nationalPension: number;
  housingPension: number;
  livingExpense: number;
  educationExpense: number;
  parentSupport: number;
  mortgagePayment: number;
  insurancePremium: number;
}

export interface FinanceCalculation extends DiagnosisResult {
  assumptionVersion: string;
  appliedRecipeIds: RecipeId[];
  removedRecipeIds: RecipeId[];
  timeline: FinanceTimelineRow[];
  basis: ReadonlyArray<{ key: string; label: string; value: string }>;
  notices: string[];
  /** 정년~국민연금 개시 사이 순현금흐름 부족액(양수, 만 원) */
  crevasseShortfall: number;
  savingsRate: number;
  debtServiceRate: number;
}
