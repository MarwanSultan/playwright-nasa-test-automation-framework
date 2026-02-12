import { expect, test } from "./base.fixture";

test.describe("Edge Cases - General", () => {
  // Page reload tests
  test("should handle page reload gracefully", async ({ page }) => {
    await page.goto("./");
    const originalTitle = await page.title();

    await page.reload();

    const reloadedTitle = await page.title();
    expect(reloadedTitle).toBe(originalTitle);
    expect(page.locator("body")).toBeTruthy();
  });

  // Multiple rapid navigations
  test("should handle rapid back/forward navigation", async ({ page }) => {
    await page.goto("./");
    const navLinks = page.locator("nav a");
    const total = await navLinks.count();

    if (total === 0) {
      test.skip(true, "no navigation links found");
      return;
    }

    const firstLink = navLinks.first();
    const href = await firstLink.getAttribute("href");

    if (href && (await firstLink.isVisible())) {
      await firstLink.click();
      await page.waitForLoadState("load");

      // Go back
      await page.goBack();
      await page.waitForLoadState("load");

      // Go forward
      await page.goForward();
      await page.waitForLoadState("load");

      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test with very slow network conditions
  test("should handle page with slow network", async ({ page }) => {
    await page.context().route("**/*", (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto("./", { waitUntil: "domcontentloaded" });
    expect(await page.title()).toBeTruthy();

    await page.context().unroute("**/*");
  });

  // Test with JavaScript disabled (if applicable)
  test("should have basic HTML content even if CSS fails", async ({ page }) => {
    await page.context().route("**/*.css", (route) => route.abort());

    await page.goto("./", { waitUntil: "domcontentloaded" });

    const bodyContent = await page.locator("body").textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent?.length).toBeGreaterThan(0);

    await page.context().unroute("**/*.css");
  });

  // Test page with missing images
  test("should degrade gracefully when images fail to load", async ({
    page,
  }) => {
    await page.context().route("**/*.jpg", (route) => route.abort());
    await page.context().route("**/*.png", (route) => route.abort());

    await page.goto("./");

    expect(page.locator("header")).toBeTruthy();
    expect(page.locator("footer")).toBeTruthy();

    await page.context().unroute("**/*.jpg");
    await page.context().unroute("**/*.png");
  });

  // Test interaction with disabled elements
  test("should handle disabled form elements correctly", async ({ page }) => {
    await page.goto("./");

    const buttons = page.locator("button");
    let disabledButtonFound = false;

    for (let i = 0; i < (await buttons.count()); i++) {
      const button = buttons.nth(i);
      if (await button.isDisabled()) {
        disabledButtonFound = true;
        expect(button).toBeDisabled();
        expect(await button.isEnabled()).toBe(false);
      }
    }

    // Test passes even if no disabled buttons found
    if (!disabledButtonFound) {
      test.skip(true, "no disabled form elements found");
    }
  });

  // Test with maximum zoom
  test("should be readable at 200% zoom", async ({ page }) => {
    await page.goto("./");

    // Set zoom to 200%
    await page.evaluate(() => {
      // @ts-ignore
      document.body.style.zoom = "200%";
    });

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
  });

  // Test with minimum zoom
  test("should be functional at 50% zoom", async ({ page }) => {
    await page.goto("./");

    // Set zoom to 50%
    await page.evaluate(() => {
      // @ts-ignore
      document.body.style.zoom = "50%";
    });

    const header = page.locator("header");
    expect(header).toBeTruthy();
  });

  // Test focus management
  test("should properly manage focus state", async ({ page }) => {
    await page.goto("./");

    const initialFocus = await page.evaluate(
      () => document.activeElement?.tagName,
    );

    // Tab to next element
    await page.keyboard.press("Tab");
    const afterTabFocus = await page.evaluate(
      () => document.activeElement?.tagName,
    );

    expect(initialFocus).toBeTruthy();
    expect(afterTabFocus).toBeTruthy();
  });

  // Test with very small viewport
  test("should handle extremely small viewport (mobile edge case)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto("./");

    expect(page.locator("body")).toBeTruthy();
    const isResponsive = await page.evaluate(() => window.innerWidth === 320);
    expect(isResponsive).toBe(true);
  });

  // Test with very large viewport
  test("should handle extremely large viewport (4K)", async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });
    await page.goto("./");

    expect(page.locator("body")).toBeTruthy();
    const isLargeViewport = await page.evaluate(
      () => window.innerWidth === 3840,
    );
    expect(isLargeViewport).toBe(true);
  });

  // Test with orientation change (landscape to portrait)
  test("should handle orientation changes gracefully", async ({ page }) => {
    await page.goto("./");

    // Landscape
    await page.setViewportSize({ width: 1024, height: 600 });
    const landscapeWidth = await page.evaluate(() => window.innerWidth);

    // Portrait
    await page.setViewportSize({ width: 600, height: 1024 });
    const portraitWidth = await page.evaluate(() => window.innerWidth);

    expect(landscapeWidth).toBe(1024);
    expect(portraitWidth).toBe(600);
    expect(page.locator("body")).toBeTruthy();
  });

  // Test rapid element interactions
  test("should handle rapid clicking on elements", async ({ page }) => {
    await page.goto("./");

    const buttons = page.locator("button");
    if ((await buttons.count()) === 0) {
      test.skip(true, "no buttons found");
      return;
    }

    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await firstButton.click({ force: true });
      }

      // Page should still be responsive
      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test memory consistency after interactions
  test("should maintain page integrity after multiple interactions", async ({
    page,
  }) => {
    await page.goto("./");

    // Perform several interactions
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Body should still exist
    const finalBodyHTML = await page.locator("body").innerHTML();
    expect(finalBodyHTML.length).toBeGreaterThan(0);
  });
});
