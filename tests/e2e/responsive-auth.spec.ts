import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
}

async function expectMinimumTouchTargets(page: Page) {
  const targets = await page.locator("button, input, a[href]").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          element.getAttribute("aria-label") !== "Open Next.js Dev Tools"
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label:
            element.getAttribute("aria-label") ||
            element.textContent?.trim() ||
            element.getAttribute("name") ||
            element.tagName,
          width: rect.width,
          height: rect.height,
        };
      }),
  );

  for (const target of targets) {
    expect.soft(target.width, `${target.label} touch width`).toBeGreaterThanOrEqual(44);
    expect.soft(target.height, `${target.label} touch height`).toBeGreaterThanOrEqual(44);
  }
}

for (const viewport of [
  { width: 375, height: 812, label: "375 portrait" },
  { width: 390, height: 844, label: "390 portrait" },
  { width: 844, height: 390, label: "landscape" },
]) {
  test(`public auth layout fits ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "다시 만났어요" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectMinimumTouchTargets(page);

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "끼니 시작하기" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectMinimumTouchTargets(page);
  });
}

test("auth UI honors reduced motion and a narrow large-text proxy", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/login");

  await expectNoHorizontalOverflow(page);
  const motion = await page.getByRole("button", { name: "로그인" }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
  });
  expect(["0s", "0.00001s", "1e-05s"]).toContain(motion.animationDuration);
  expect(["0s", "0.00001s", "1e-05s"]).toContain(motion.transitionDuration);
});

test("public auth remains operable at 200% browser zoom", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "200%";
  });

  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByLabel("비밀번호")).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
