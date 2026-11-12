import { describe, expect, it, vi } from "vitest";
import { calculateFinance, kimSandProfile } from "@/domain/finance";
import { SupabaseCalculationRepository } from "./calculation-repository";

describe("SupabaseCalculationRepository", () => {
  it("persists input, calculation and recipe through one database transaction", async () => {
    const snapshotId = "018f2cab-4f29-7b6a-9342-1234567890ab";
    const rpc = vi.fn().mockResolvedValue({ data: snapshotId, error: null });
    const repository = new SupabaseCalculationRepository({ rpc });
    const recipeSelection = {
      selectedRecipeIds: ["basic" as const],
      housing: {
        downsizingRatio: 0.7,
        downsizingAge: null,
        reverseMortgageEnabled: false,
      },
    };
    const calculation = calculateFinance(kimSandProfile, recipeSelection, {
      now: new Date("2026-11-12T00:00:00.000Z"),
    });

    const result = await repository.persist({
      userId: "user-1",
      profile: kimSandProfile,
      recipeSelection,
      calculation,
    });

    expect(result).toBe(snapshotId);
    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith(
      "persist_calculation_snapshot",
      expect.objectContaining({
        p_input: kimSandProfile,
        p_selected_recipe_ids: ["basic"],
      }),
    );
  });
});
