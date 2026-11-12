import type { FinancialProfile, RecipeId, RecipeSelection } from "@/lib/contracts";
import { ASSUMPTIONS } from "./assumptions";
import type { NormalizedFinanceInput } from "./types";

function estimateNationalPension(annualGrossIncome: number, retirementAge: number) {
  const monthlyIncome = Math.min(
    ASSUMPTIONS.nationalPensionIncomeCap,
    annualGrossIncome / 12,
  );
  const contributionYears = Math.min(40, Math.max(10, retirementAge - 27));
  return Math.round(
    (0.43 * (ASSUMPTIONS.nationalPensionAValue + monthlyIncome) * contributionYears) /
      2 /
      40,
  );
}

export function normalizeFinanceInput(
  profile: FinancialProfile,
  selection?: RecipeSelection,
): NormalizedFinanceInput {
  const recipeSelection: RecipeSelection = selection ?? {
    selectedRecipeIds: [],
    housing: {
      downsizingRatio: 0.7,
      downsizingAge: null,
      reverseMortgageEnabled: false,
    },
  };
  const selected = new Set<RecipeId>(recipeSelection.selectedRecipeIds);
  const removedRecipeIds: RecipeId[] = [];

  // '집 줄여 이사'를 고르면 기존 집을 담보로 한 주택연금은 유지할 수 없다.
  // 새 집 기준 월액은 housing.reverseMortgageEnabled로 별도 선택한다.
  if (selected.has("down") && selected.delete("hp")) removedRecipeIds.push("hp");

  const downsizedHomeValue = selected.has("down")
    ? profile.homeValue * recipeSelection.housing.downsizingRatio
    : null;
  const reverseMortgageHomeValue = recipeSelection.housing.reverseMortgageEnabled
    ? downsizedHomeValue ?? profile.homeValue
    : selected.has("hp")
      ? profile.homeValue
      : null;
  const annualGrossIncome = profile.annualGrossIncome ?? profile.monthlyNetIncome * 12 * 1.25;

  return {
    profile,
    annualGrossIncome,
    nationalPensionMonthly:
      profile.nationalPensionMonthly ??
      estimateNationalPension(annualGrossIncome, profile.retirementAge),
    annualUniversityTuitionPerChild:
      profile.annualUniversityTuitionPerChild ?? ASSUMPTIONS.annualUniversityTuition,
    monthlyAcademyCostPerHighSchoolChild:
      profile.monthlyAcademyCostPerHighSchoolChild ??
      ASSUMPTIONS.monthlyHighSchoolAcademyCost,
    targetMonthlyRetirementExpense:
      profile.targetMonthlyRetirementExpense ??
      (profile.spouseAge === null
        ? ASSUMPTIONS.singleRetirementExpense
        : ASSUMPTIONS.coupleRetirementExpense),
    recipeSelection,
    appliedRecipeIds: [...selected],
    removedRecipeIds,
    downsizedHomeValue,
    reverseMortgageHomeValue,
  };
}
