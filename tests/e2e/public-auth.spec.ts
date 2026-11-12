import { expect, test } from "@playwright/test";

test("login and signup expose accessible account forms on mobile", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "다시 만났어요" })).toBeVisible();
  await expect(page.getByLabel("이메일")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("비밀번호")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );

  await page.getByRole("link", { name: "회원가입" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: "끼니 시작하기" })).toBeVisible();
  await expect(page.getByLabel("부를 이름")).toHaveAttribute("autocomplete", "nickname");
  await expect(page.getByLabel("비밀번호")).toHaveAttribute("autocomplete", "new-password");
});

test("unauthenticated product navigation returns to login", async ({ page }) => {
  await page.goto("/home");

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "다시 만났어요" })).toBeVisible();
});

test("latest-profile API rejects an anonymous request", async ({ request }) => {
  const response = await request.get("/api/profile/latest");

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: "UNAUTHORIZED" },
  });

  const checksResponse = await request.get("/api/checks");
  expect(checksResponse.status()).toBe(401);
  await expect(checksResponse.json()).resolves.toMatchObject({
    error: { code: "UNAUTHORIZED" },
  });
});
