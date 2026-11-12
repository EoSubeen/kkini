import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipeBuilder } from "./recipe-builder";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

afterEach(cleanup);

describe("RecipeBuilder", () => {
  it("opens the fixed report example without changing ingredient choices", () => {
    render(<RecipeBuilder />);

    const rye = screen.getByRole("button", { name: /호밀빵/ });
    expect(rye).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /보고서 추천안 불러오기/ }));

    expect(screen.getByText("김샌드 씨 · 보고서 추천안")).toBeInTheDocument();
    expect(screen.getByText("약 −12만 원")).toBeInTheDocument();
    expect(screen.getByText("약 3.2억 원")).toBeInTheDocument();
    expect(rye).toHaveAttribute("aria-pressed", "true");
  });

  it("clears the current-home reverse mortgage when downsizing is selected", () => {
    render(<RecipeBuilder />);

    const reverseMortgage = screen.getByRole("checkbox", { name: /본인 주택연금/ });
    const downsizing = screen.getByRole("checkbox", { name: /집 줄여 이사/ });
    expect(reverseMortgage).toBeChecked();

    fireEvent.click(downsizing);

    expect(reverseMortgage).not.toBeChecked();
    expect(reverseMortgage).toBeDisabled();
    expect(screen.getByText("이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.")).toBeInTheDocument();
  });
});
