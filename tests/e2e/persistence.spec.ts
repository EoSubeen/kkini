import { expect, test } from "@playwright/test";

test.describe("authenticated persistence", () => {
  test.skip(!process.env.RUN_SUPABASE_E2E, "requires the local Supabase stack");

  test("signup, diagnosis and checklist survive logout and login", async ({ page }) => {
    const email = `qa-${Date.now()}@example.test`;
    const password = "Kkini-test-2026!";

    await page.goto("/signup");
    await page.getByLabel("부를 이름").fill("QA샌드");
    await page.getByLabel("이메일").fill(email);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "계정 만들기" }).click();
    await expect(page).toHaveURL(/\/onboarding$/);

    await page.getByLabel(/내 나이/).fill("50");
    await page.getByRole("button", { name: "다음" }).click();
    await page.getByLabel("월 세후소득 (만 원)", { exact: true }).fill("600");
    await page.getByRole("button", { name: "다음" }).click();
    await page.getByLabel(/월 생활비/).fill("258");
    await page.getByRole("button", { name: "다음" }).click();
    await page.getByLabel(/예금·적금/).fill("3500");
    await page.getByRole("button", { name: "다음" }).click();
    await page.getByRole("button", { name: "다음" }).click();
    const submitDiagnosis = page.getByRole("button", { name: "입력 끝내고 결과 보기" });
    if (await submitDiagnosis.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await submitDiagnosis.evaluate((button: HTMLButtonElement) => button.click());
    }
    await page.waitForURL(/\/diagnosis\/current$/);
    await expect(page.getByText("이번 달 돈의 흐름")).toBeVisible();

    await page.goto("/check");
    const expense = page.getByRole("checkbox", { name: /생활비 10% 조정/ });
    await expect(expense).toBeEnabled();
    await expense.check();
    await expect(page.getByText(/1개 완료/)).toBeVisible();

    await page.goto("/settings");
    await page.getByRole("button", { name: /로그아웃/ }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel("이메일").fill(email);
    await page.getByLabel("비밀번호").fill(password);
    await page.getByRole("button", { name: "로그인" }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText("안녕하세요, QA샌드 님", { exact: true })).toBeVisible();

    await page.goto("/diagnosis/current");
    await expect(page.getByText("이번 달 돈의 흐름")).toBeVisible();
    await page.goto("/check");
    await expect(page.getByRole("checkbox", { name: /생활비 10% 조정/ })).toBeChecked();
  });
});
