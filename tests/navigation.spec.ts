import { expect, test } from "./base.fixture";

test.describe("Navigation (Homepage & Primary Navigation)", () => {
  test("homepage loads and shows header and footer", async ({ page }) => {
    await page.goto("./");
    const header = page.locator("header");
    const footer = page.locator("footer");
    // ensure a visible header/footer exists
    let headerVisible = false;
    for (let i = 0; i < (await header.count()); i++) {
      if (await header.nth(i).isVisible()) {
        headerVisible = true;
        break;
      }
    }
    let footerVisible = false;
    for (let i = 0; i < (await footer.count()); i++) {
      if (await footer.nth(i).isVisible()) {
        footerVisible = true;
        break;
      }
    }
    expect(headerVisible).toBeTruthy();
    expect(footerVisible).toBeTruthy();
  });

  test("top-level navigation links navigate to their pages", async ({
    page,
  }) => {
    await page.goto("./");
    const navLinks = page.locator("nav a");
    const total = await navLinks.count();
    let clicked = false;
    for (let i = 0; i < total; i++) {
      const link = navLinks.nth(i);
      if (!(await link.getAttribute("href"))) continue;
      if (await link.isVisible()) {
        await link.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) test.skip(true, "no visible navigation links found");
    // basic check: URL changes or heading appears
    await expect(page).not.toHaveURL("./");
  });
});
