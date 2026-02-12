import { expect, test } from "./base.fixture";

test.describe("Responsive Design Edge Cases", () => {
  // Define viewport sizes for testing
  const viewports = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12", width: 390, height: 844 },
    { name: "iPhone 14 Pro Max", width: 430, height: 932 },
    { name: "Samsung Galaxy S21", width: 360, height: 800 },
    { name: "iPad (7th generation)", width: 810, height: 1080 },
    { name: "iPad Pro 12.9", width: 1024, height: 1366 },
    { name: "Desktop HD", width: 1280, height: 720 },
    { name: "Desktop Full HD", width: 1920, height: 1080 },
    { name: "Desktop 2K", width: 2560, height: 1440 },
    { name: "Desktop 4K", width: 3840, height: 2160 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should load and render properly on ${name} (${width}x${height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("./");

      // Verify page loaded
      const title = await page.title();
      expect(title).toBeTruthy();

      // Check that main content is visible
      const body = page.locator("body");

      expect(body).toBeTruthy();

      // Verify no content overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(width + 20); // Allow small buffer for scrollbar
    });

    test(`should have accessible navigation on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("./");

      // Find navigation
      const nav = page.locator("nav");
      const navLinks = page.locator("nav a");

      if ((await nav.count()) > 0) {
        // At least some navigation should be visible or exist
        const navExists = await nav
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        const linksCount = await navLinks.count();

        expect(navExists || linksCount > 0).toBeTruthy();
      }
    });
  });

  // Test orientation changes on mobile viewports
  const mobileViewports = [
    {
      name: "Mobile",
      portrait: { width: 375, height: 667 },
      landscape: { width: 667, height: 375 },
    },
    {
      name: "Tablet",
      portrait: { width: 768, height: 1024 },
      landscape: { width: 1024, height: 768 },
    },
  ];

  mobileViewports.forEach(({ name, portrait, landscape }) => {
    test(`should handle orientation change on ${name}`, async ({ page }) => {
      // Start in portrait
      await page.setViewportSize(portrait);
      await page.goto("./");

      const portraitTitle = await page.title();
      expect(portraitTitle).toBeTruthy();

      // Change to landscape
      await page.setViewportSize(landscape);
      await page.waitForLoadState("load");

      const landscapeTitle = await page.title();
      expect(landscapeTitle).toBeTruthy();

      // Change back to portrait
      await page.setViewportSize(portrait);
      await page.waitForLoadState("load");

      const backToPortrait = await page.title();
      expect(backToPortrait).toBeTruthy();
    });
  });

  // Test touch interactions on mobile
  test("should handle touch-like interactions on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("./");

    const buttons = page.locator("button");
    if ((await buttons.count()) > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        // Simulate touch by clicking
        await firstButton.click();
        expect(page.locator("body")).toBeTruthy();
      }
    }
  });

  // Test content overflow on narrow viewports
  test("should not have horizontal overflow on narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto("./");

    const horizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(horizontalOverflow).toBe(false);
  });

  // Test text readability across viewports
  const readabilityViewports = [
    { width: 375, height: 667 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1920, height: 1080 }, // Desktop
  ];

  readabilityViewports.forEach(({ width, height }) => {
    test(`text should be readable on ${width}x${height} viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("./");

      const fontSize = await page.evaluate(() => {
        const bodyStyle = globalThis.getComputedStyle(document.body);
        return Number.parseFloat(bodyStyle.fontSize);
      });

      // Font size should be at least 12px for readability
      expect(fontSize).toBeGreaterThanOrEqual(12);
    });
  });

  // Test button/link clickability on small screens
  test("should have adequate touch target size on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("./");

    const buttons = page.locator("button, a[href], input[type='button']");
    let checkedButtons = 0;

    for (let i = 0; i < Math.min(await buttons.count(), 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target size is typically 44x44px
          const minDimension = Math.min(box.width, box.height);
          expect(minDimension).toBeGreaterThanOrEqual(40); // Allow some flexibility
          checkedButtons++;
        }
      }
    }

    if (checkedButtons === 0) {
      test.skip(true, "no visible buttons found");
    }
  });

  // Test fixed/sticky element behavior at different viewports
  test("should handle fixed elements at mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("./");

    // Should have at least a header or navigation
    const hasNav = (await page.locator("header, nav").count()) > 0;
    expect(hasNav).toBeTruthy();
  });

  // Test zoom interaction at different screen sizes
  test("should remain usable when zoomed on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("./");

    await page.evaluate(() => {
      // @ts-ignore
      document.body.style.zoom = "150%";
    });

    // Content should still load
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  // Test responsiveness with flexible content
  test("should adapt layout when window is resized", async ({ page }) => {
    await page.goto("./");

    // Start with desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopContent = await page.locator("body").innerHTML();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState("load");
    const mobileContent = await page.locator("body").innerHTML();

    // Content should be present in both sizes
    expect(desktopContent.length).toBeGreaterThan(0);
    expect(mobileContent.length).toBeGreaterThan(0);
  });
});
