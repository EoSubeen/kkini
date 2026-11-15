import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CalculationBasisDialog } from "./calculation-basis-dialog";

afterEach(cleanup);

describe("CalculationBasisDialog", () => {
  it("includes all eleven sections from the submitted calculation basis", () => {
    const { container } = render(<CalculationBasisDialog />);
    const summaries = Array.from(container.querySelectorAll("summary")).map((summary) => summary.textContent);
    expect(summaries).toHaveLength(11);
    expect(summaries).toEqual(expect.arrayContaining([
      expect.stringContaining("계산은 이렇게 해요"),
      expect.stringContaining("기본 가정값"),
      expect.stringContaining("연금과 세금"),
      expect.stringContaining("추천 조합"),
      expect.stringContaining("500번 모의실험"),
      expect.stringContaining("정년 뒤 몇 년"),
      expect.stringContaining("연금은 어떤 순서"),
      expect.stringContaining("건강이 나빠지거나"),
      expect.stringContaining("어떤 가정이 결과"),
      expect.stringContaining("공식 계산기"),
      expect.stringContaining("일부러 넣지 않은 것"),
    ]));
    expect(container).toHaveTextContent("95세 자산 −27.1억 원 → +3.2억 원");
    expect(container).toHaveTextContent("한국주택금융공사 일람표(2026.6.1)");
  });
});
