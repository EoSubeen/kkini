import type { FinancialProfile, RecipeSelection } from "@/lib/contracts";
import type { FinanceCalculation } from "@/domain/finance";

export interface PersistCalculationInput {
  userId: string;
  profile: FinancialProfile;
  recipeSelection: RecipeSelection;
  calculation: FinanceCalculation;
}

export interface CalculationRepository {
  persist(input: PersistCalculationInput): Promise<string>;
}

type QueryResult<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

interface SupabaseLike {
  rpc(functionName: string, args: Record<string, unknown>): QueryResult<string>;
}

export class SupabaseCalculationRepository implements CalculationRepository {
  constructor(private readonly client: SupabaseLike) {}

  async persist({
    profile,
    recipeSelection,
    calculation,
  }: PersistCalculationInput) {
    const { data, error } = await this.client.rpc("persist_calculation_snapshot", {
      p_input: profile,
      p_schema_version: profile.schemaVersion,
      p_calculation_version: calculation.calculationVersion,
      p_assumption_version: calculation.assumptionVersion,
      p_result: calculation,
      p_selected_recipe_ids: recipeSelection.selectedRecipeIds,
      p_housing: recipeSelection.housing,
    });
    if (error) throw new Error(`calculation snapshot transaction failed: ${error.message}`);
    if (typeof data !== "string") {
      throw new Error("calculation snapshot transaction did not return an id");
    }
    return data;
  }
}
