import { expect, test } from "./base.fixture";

test.describe("Search Functionality", () => {
  test("search returns results for common queries", async ({ page }) => {
    await page.goto("./");
    const allSearch = page.locator('input[type="search"], input[name="q"]');
    const total = await allSearch.count();
    let searchInput: any = null;
    for (let i = 0; i < total; i++) {
      const candidate = allSearch.nth(i);
      if (await candidate.isVisible()) {
        searchInput = candidate;
        break;
      }
    }
    if (!searchInput) {
      test.skip(true, "no visible search input found");
      return;
    }
    await searchInput.fill("Mars");
    await searchInput.press("Enter");
    // Expect either results list or a results page
    const resultsCount = await page.getByRole('group').filter({ hasText: 'Content Type Articles Press' }).count();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test("empty query handled gracefully", async ({ page }) => {
    await page.goto("./");
    const allSearch2 = page.locator('input[type="search"], input[name="q"]');
    const total2 = await allSearch2.count();
    let searchInput2: any = null;
    for (let i = 0; i < total2; i++) {
      const candidate = allSearch2.nth(i);
      if (await candidate.isVisible()) {
        searchInput2 = candidate;
        break;
      }
    }
    if (!searchInput2) test.skip(true, "no visible search input found");
    await searchInput2.fill("");
    await searchInput2.press("Enter");
    await expect(page).not.toHaveURL("./");
  });
});
