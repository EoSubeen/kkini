import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { kimSandProfile } from "@/domain/finance";
import { OnboardingForm } from "./onboarding-form";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, prefetch: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  replace.mockClear();
  vi.unstubAllGlobals();
});

describe("OnboardingForm", () => {
  it("keeps the user on a step and explains which required input is missing", async () => {
    render(<OnboardingForm defaultName="QA샌드" setupMode />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByRole("heading", { level: 1, name: "가족" })).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("가족 단계의 필수 입력을 확인해 주세요.");
    await waitFor(() => expect(screen.getByLabelText("내 나이 (세)")).toHaveFocus());
  });

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

  it("shows all six steps and submits the Kim Sand report inputs unchanged", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<OnboardingForm initialProfile={kimSandProfile} />);

    for (const heading of ["버는 돈", "쓰는 돈", "가진 것과 빚", "보험·상속", "복지 확인"]) {
      fireEvent.click(screen.getByRole("button", { name: "다음" }));
      expect(screen.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }

    fireEvent.click(screen.getByRole("button", { name: "입력 끝내고 결과 보기" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(request.body));
    expect(payload.profile).toEqual(kimSandProfile);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/diagnosis/current"));
  });

  it("shows a recoverable error instead of appearing frozen when saving fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "저장에 실패했어요." } }),
    }));
    render(<OnboardingForm initialProfile={kimSandProfile} />);

    for (let index = 0; index < 5; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "다음" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "입력 끝내고 결과 보기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("저장에 실패했어요.");
    expect(screen.getByRole("button", { name: "입력 끝내고 결과 보기" })).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });
});
