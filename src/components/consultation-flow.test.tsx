import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConsentStep, GoalStep } from "./consultation-flow";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, prefetch: vi.fn() }) }));

afterEach(() => { cleanup(); push.mockClear(); window.sessionStorage.clear(); });

describe("consultation setup flow", () => {
  it("requires all three promises before moving to goals", () => {
    render(<ConsentStep />);
    const next = screen.getByRole("button", { name: /모두 확인했어요/ });
    expect(next).toBeDisabled();
    for (const checkbox of screen.getAllByRole("checkbox")) fireEvent.click(checkbox);
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(push).toHaveBeenCalledWith("/consultation/goals");
  });

  it("keeps goal order, caps selection at three and continues to information input", () => {
    render(<GoalStep />);
    for (const name of ["부모님 부양", "자녀 교육", "내 노후", "집 지키기"]) fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
    expect(screen.getByRole("button", { name: /집 지키기/ })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: /3개 목표로 계속하기/ }));
    expect(JSON.parse(window.sessionStorage.getItem("kkini:selected-goals") ?? "[]")).toEqual(["parents", "education", "retirement"]);
    expect(push).toHaveBeenCalledWith("/onboarding");
  });
});
