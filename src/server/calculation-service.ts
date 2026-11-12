import type { CalculateRequest } from "@/lib/contracts";
import { calculateFinance } from "@/domain/finance";
import type { CalculationRepository } from "./calculation-repository";

export interface CalculationContext {
  userId?: string;
  repository?: CalculationRepository;
  now?: Date;
}

export async function calculateAndMaybePersist(
  request: CalculateRequest,
  context: CalculationContext = {},
) {
  const selection = request.recipeSelection ?? {
    selectedRecipeIds: [],
    housing: {
      downsizingRatio: 0.7,
      downsizingAge: null,
      reverseMortgageEnabled: false,
    },
  };
  const result = calculateFinance(request.profile, selection, { now: context.now });
  let snapshotId: string | null = null;

  if (request.persist && context.userId && context.repository) {
    snapshotId = await context.repository.persist({
      userId: context.userId,
      profile: request.profile,
      recipeSelection: selection,
      calculation: result,
    });
  }

  return { snapshotId, result };
}
