import { beforeEach, describe, expect, it, vi } from "vitest";
import { kimSandProfile } from "@/domain/finance";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { getLatestState } from "./latest-state";

function queryReturning(data: unknown) {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
  query.select.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
}

describe("getLatestState", () => {
  beforeEach(() => vi.clearAllMocks());

  it("restores the latest empty recipe selection instead of an older selection", async () => {
    const inputQuery = queryReturning({ input: kimSandProfile, created_at: "2026-11-12T00:00:00Z" });
    const selectionQuery = queryReturning({
      selected_recipe_ids: [],
      housing: { downsizingRatio: 0.7, downsizingAge: null, reverseMortgageEnabled: false },
      created_at: "2026-11-12T00:01:00Z",
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(inputQuery)
      .mockReturnValueOnce(selectionQuery);
    createClient.mockResolvedValue({ from });

    const state = await getLatestState();

    expect(state.selection?.selectedRecipeIds).toEqual([]);
    expect(selectionQuery.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});
