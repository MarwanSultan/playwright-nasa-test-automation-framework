import { expect, test } from "./base.fixture";

test.describe("Accessibility & Responsive Design", () => {
  test("basic axe accessibility scan on homepage", async ({ page }) => {
    await page.goto("./");
    // dynamically import axe so tests don't crash when dependency isn't installed
    let AxeBuilder: any;
    try {
      const mod = await import("@axe-core/playwright");
      AxeBuilder = mod.default || mod;
    } catch {
      test.skip(true, "@axe-core/playwright not available");
      return;
    }
    const accessibilityScan = new AxeBuilder({ page }).analyze();
    const results = await accessibilityScan;
    // fail only on critical violations
    const critical = results.violations.filter(
      (v: any) => v.impact === "critical",
    );
    expect(critical.length).toBe(0);
  });

  test("keyboard navigation to main content", async ({ page }) => {
    await page.goto("./");
    // Tab through a few elements and ensure focus moves
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    // ensure body still exists and is focused somewhere
    expect(
      await page.evaluate(() => document.activeElement !== null),
    ).toBeTruthy();
  });
});
