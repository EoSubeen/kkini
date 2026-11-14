import { expect, test, type Page } from "@playwright/test";

async function expectProductLayout(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    header: document.querySelector(".app-header")?.getBoundingClientRect(),
    nav: document.querySelector(".bottom-nav")?.getBoundingClientRect(),
  }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  expect(sizes.header?.top).toBeGreaterThanOrEqual(0);
  expect(sizes.nav?.bottom).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight));

  const shellTargets = page.locator(".app-header button, .app-header a, .bottom-nav a");
  for (let index = 0; index < (await shellTargets.count()); index += 1) {
    const box = await shellTargets.nth(index).boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector(".bottom-nav")?.getBoundingClientRect();
    const lastContent = document.querySelector(".app-content")?.lastElementChild?.getBoundingClientRect();
    return nav && lastContent ? lastContent.bottom > nav.top : false;
  });
  expect(overlap).toBe(false);
}

test.describe("authenticated persistence", () => {
  test.skip(!process.env.RUN_SUPABASE_E2E, "requires the local Supabase stack");

  test("signup, diagnosis and checklist survive logout and login", async ({ page }) => {
    test.setTimeout(90_000);
    const emailDomain = process.env.E2E_EMAIL_DOMAIN ?? "example.test";
    const email = `qa-${Date.now()}@${emailDomain}`;
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
    const saveResponse = page.waitForResponse((response) =>
      response.url().endsWith("/api/checks") && response.request().method() === "PUT",
    );
    await expense.check();
    expect((await saveResponse).ok()).toBe(true);
    await expect(page.getByText("1개 완료 · 3개 남음", { exact: true })).toBeVisible();

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

    for (const viewport of [
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ["/home", "/diagnosis/current", "/recipe", "/check", "/settings"]) {
        await page.goto(route);
        await expectProductLayout(page);
      }
    }
  });
});
