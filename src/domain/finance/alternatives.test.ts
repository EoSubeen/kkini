import { describe, expect, it } from "vitest";
import { houseAlternatives, inheritAlternatives, taxAlternatives } from "./alternatives";
import { familyView, shockTests, timelineEvents, analyzeProfile } from "./analysis";
import { kimSandProfile } from "./fixtures";

describe("alternatives and analyses for Kim Sand", () => {
  it("compares the four housing options like the report table 12", () => {
    // 보고서 [표 12]는 추천 조합(주택연금 제외)을 적용한 상태에서 비교한다.
    const house = houseAlternatives(kimSandProfile, {
      selectedRecipeIds: ["basic", "ins", "par", "term", "reemp", "retm", "npcont"],
      housing: { downsizingRatio: 0.7, downsizingAge: null, reverseMortgageEnabled: false },
    }, 0.6);
    if (!house.hasHome) throw new Error("expected a home");
    const [keep, pension, move, both] = house.scenarios;
    expect(keep.depletionAge).toBe(80);
    expect(pension.depletionAge).toBeNull();
    expect(pension.assetsAt95 / 10_000).toBeCloseTo(3.2, 0);
    expect(move.depletionAge).toBeNull();
    expect(both.depletionAge).toBeNull();
    expect(house.housingPensionMonthly).toBe(141);
  });

  it("finds the family protection gap near 2억 and the timeline events", () => {
    const family = familyView(kimSandProfile);
    expect(family.protection.need).toBeCloseTo(69_972, -1);
    expect(family.protection.gap / 10_000).toBeCloseTo(2.0, 1);
    const events = timelineEvents(analyzeProfile(kimSandProfile).baseResult);
    expect(events.map((event) => event.title)).toContain("금융자산이 0 아래로 내려가요");
  });

  it("produces tax, inheritance and shock-test numbers", () => {
    expect(taxAlternatives(kimSandProfile).card.threshold).toBe(2_250);
    expect(inheritAlternatives(kimSandProfile).siblings).toBe(2);
    expect(shockTests(kimSandProfile).events).toHaveLength(7);
  });
});
