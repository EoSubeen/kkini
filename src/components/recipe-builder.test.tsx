import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { kimSandProfile } from "@/domain/finance";
import { RecipeBuilder } from "./recipe-builder";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const savedSelection = {
  selectedRecipeIds: ["basic", "reemp", "hp"] as ("basic" | "reemp" | "hp")[],
  housing: { downsizingRatio: 0.7, downsizingAge: null, reverseMortgageEnabled: false },
};

describe("RecipeBuilder", () => {
  it("restores saved ingredient choices from the saved recipe ids", () => {
    render(<RecipeBuilder initialSelection={savedSelection} />);
    fireEvent.click(screen.getByRole("tab", { name: "소스" }));
    expect(screen.getByRole("button", { name: /마요네즈/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("tab", { name: "치즈" }));
    expect(screen.getByRole("button", { name: /고다/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /브리/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the fixed report example without changing ingredient choices", () => {
    render(<RecipeBuilder reportCase={{ monthlyCashFlow: -12.04, depletionAge: null, assetsAt95: 32_200 }} />);

    const rye = screen.getByRole("button", { name: /호밀빵/ });
    fireEvent.click(rye);
    expect(rye).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /보고서 추천안 불러오기/ }));

    expect(screen.getByText("김샌드 씨 · 보고서 추천안")).toBeInTheDocument();
    expect(screen.getByText("약 −12만 원")).toBeInTheDocument();
    expect(screen.getByText("약 3.2억 원")).toBeInTheDocument();
    expect(rye).toHaveAttribute("aria-pressed", "true");
  });

  it("clears the current-home reverse mortgage when downsizing is selected", () => {
    render(<RecipeBuilder initialSelection={savedSelection} />);

    const reverseMortgage = screen.getByRole("checkbox", { name: /본인 주택연금/ });
    const downsizing = screen.getByRole("checkbox", { name: /집 줄여 이사/ });
    expect(reverseMortgage).toBeChecked();

    fireEvent.click(downsizing);

    expect(reverseMortgage).not.toBeChecked();
    expect(reverseMortgage).toBeDisabled();
    expect(screen.getByText("이사 후 주택연금은 새 집 기준으로 월액을 다시 확인해 주세요.")).toBeInTheDocument();
  });

  it("shows the completed sandwich with a top bread after saving", async () => {
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: { monthlyCashFlow: -45, depletionAge: 60, assetsAt95: -227_000 } }),
    }));
    render(<RecipeBuilder initialProfile={kimSandProfile} initialSelection={savedSelection} />);

    fireEvent.click(screen.getByRole("button", { name: "샌드위치 완성하기" }));

    expect(await screen.findByRole("heading", { name: "김샌드 님의 실행 샌드위치" })).toBeVisible();
    expect(screen.getByAltText("샌드위치를 덮은 윗빵")).toBeVisible();
    expect(screen.getByRole("button", { name: "실행 계획 보기" })).toBeVisible();
  });
});
