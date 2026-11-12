import { describe, expect, it } from "vitest";
import { REPORT_RECOMMENDATION_CASE } from "./assumptions";
import { calculateFinance } from "./engine";
import { kimSandProfile } from "./fixtures";
import { loanBalance, payment } from "./math";
import { normalizeFinanceInput } from "./normalize";

const fixedNow = new Date("2026-11-12T00:00:00.000Z");

describe("finance math", () => {
  it("amortizes zero-rate and normal mortgages", () => {
    expect(payment(0, 10, 1_000)).toBe(100);
    expect(loanBalance(1_000, 0, 10, 5)).toBe(500);
    expect(payment(0.042 / 12, 15 * 12, 18_000)).toBeGreaterThan(100);
  });
});

describe("normalizeFinanceInput", () => {
  it("removes reverse mortgage on the old home when downsizing is selected", () => {
    const normalized = normalizeFinanceInput(kimSandProfile, {
      selectedRecipeIds: ["down", "hp"],
      housing: {
        downsizingRatio: 0.7,
        downsizingAge: 60,
        reverseMortgageEnabled: false,
      },
    });

    expect(normalized.appliedRecipeIds).toEqual(["down"]);
    expect(normalized.removedRecipeIds).toEqual(["hp"]);
    expect(normalized.reverseMortgageHomeValue).toBeNull();
  });

  it("uses the new home value when post-move reverse mortgage is enabled", () => {
    const normalized = normalizeFinanceInput(kimSandProfile, {
      selectedRecipeIds: ["down", "hp"],
      housing: {
        downsizingRatio: 0.6,
        downsizingAge: 60,
        reverseMortgageEnabled: true,
      },
    });

    expect(normalized.reverseMortgageHomeValue).toBe(36_000);
  });
});

describe("calculateFinance", () => {
  it("is deterministic for the same input and clock", () => {
    const first = calculateFinance(kimSandProfile, undefined, { now: fixedNow });
    const second = calculateFinance(kimSandProfile, undefined, { now: fixedNow });
    expect(second).toEqual(first);
    expect(first.timeline).toHaveLength(46);
    expect(first.timeline[0].age).toBe(50);
    expect(first.timeline.at(-1)?.age).toBe(95);
  });

  it("keeps the original demo's Kim Sand current cash-flow regression", () => {
    const result = calculateFinance(kimSandProfile, undefined, { now: fixedNow });
    // Original HTML run(eng()) = -47.250895...; the extracted domain engine keeps
    // the user-facing value within one 만원 while moving timestamps outside formulas.
    expect(result.monthlyCashFlow).toBeCloseTo(-47.25, 0);
    expect(result.moneyUnit).toBe("KRW_10K");
  });

  it("exposes the fixed submitted-report case separately from user calculations", () => {
    expect(REPORT_RECOMMENDATION_CASE.sourceLabel).toBe("제출 보고서의 고정 사례");
    expect(REPORT_RECOMMENDATION_CASE.monthlyCashFlow).toBe(-12);
    expect(REPORT_RECOMMENDATION_CASE.assetsAt95).toBe(32_000);
  });

  it("adds the required housing notice after downsizing deselects old-home pension", () => {
    const result = calculateFinance(
      kimSandProfile,
      {
        selectedRecipeIds: ["down", "hp"],
        housing: {
          downsizingRatio: 0.7,
          downsizingAge: 60,
          reverseMortgageEnabled: false,
        },
      },
      { now: fixedNow },
    );
    expect(result.removedRecipeIds).toContain("hp");
    expect(result.notices).toContain(
      "이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.",
    );
  });
});
