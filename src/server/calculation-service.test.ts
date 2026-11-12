import { describe, expect, it, vi } from "vitest";
import { kimSandProfile } from "@/domain/finance";
import type { CalculateRequest } from "@/lib/contracts";
import { calculateAndMaybePersist } from "./calculation-service";

const request: CalculateRequest = {
  profile: kimSandProfile,
  recipeSelection: {
    selectedRecipeIds: [],
    housing: {
      downsizingRatio: 0.7,
      downsizingAge: null,
      reverseMortgageEnabled: false,
    },
  },
  persist: true,
};

describe("calculateAndMaybePersist", () => {
  it("calculates without persistence for anonymous visitors", async () => {
    const response = await calculateAndMaybePersist(request, {
      now: new Date("2026-11-12T00:00:00.000Z"),
    });
    expect(response.snapshotId).toBeNull();
  });

  it("persists a snapshot for an authenticated user", async () => {
    const persist = vi.fn().mockResolvedValue("018f2cab-4f29-7b6a-9342-1234567890ab");
    const response = await calculateAndMaybePersist(request, {
      userId: "user-1",
      repository: { persist },
      now: new Date("2026-11-12T00:00:00.000Z"),
    });
    expect(persist).toHaveBeenCalledOnce();
    expect(response.snapshotId).toBe("018f2cab-4f29-7b6a-9342-1234567890ab");
  });
});
