import { describe, expect, it } from "vitest";
import { calculateRequestSchema, financialProfileSchema } from ".";

const kimSandProfile = {
  displayName: "김샌드",
  age: 50,
  spouseAge: 48,
  childrenAges: [21, 18],
  supportedParentAge: 78,
  monthlyNetIncome: 600,
  annualGrossIncome: 9000,
  monthlyLivingExpense: 258,
  deposits: 3500,
  investments: 2500,
  unsecuredDebt: 1500,
  homeValue: 60000,
  mortgageBalance: 18000,
};

describe("financial contracts", () => {
  it("normalizes the report example with safe defaults", () => {
    const parsed = financialProfileSchema.parse(kimSandProfile);

    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.childrenAges).toEqual([21, 18]);
    expect(parsed.retirementAge).toBe(60);
    expect(parsed.mortgageRate).toBe(0.042);
  });

  it("uses ten-thousand-won amounts and rejects invalid ages", () => {
    const result = calculateRequestSchema.safeParse({
      profile: { ...kimSandProfile, age: 19 },
    });

    expect(result.success).toBe(false);
  });

  it("defaults housing choices without enabling reverse mortgage", () => {
    const parsed = calculateRequestSchema.parse({ profile: kimSandProfile });

    expect(parsed.persist).toBe(true);
    expect(parsed.recipeSelection).toBeUndefined();
  });
});
