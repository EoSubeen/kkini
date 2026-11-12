import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { kimSandProfile } from "@/domain/finance";
import { OnboardingForm } from "./onboarding-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

afterEach(cleanup);

describe("OnboardingForm", () => {
  it("restores saved education and retirement expense values while editing", () => {
    render(
      <OnboardingForm
        initialProfile={{
          ...kimSandProfile,
          annualUniversityTuitionPerChild: 1_111,
          monthlyAcademyCostPerHighSchoolChild: 123,
          targetMonthlyRetirementExpense: 345,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByLabelText("자녀 1명 대학 등록금 (만 원/년)")).toHaveValue(1_111);
    expect(screen.getByLabelText("고교생 1명 학원비 (만 원/월)")).toHaveValue(123);
    expect(screen.getByLabelText("은퇴 뒤 목표 생활비 (만 원/월)")).toHaveValue(345);
  });
});
