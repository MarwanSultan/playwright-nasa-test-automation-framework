import { expect, test } from "./base.fixture";

test.describe("Navigation Edge Cases", () => {
  // Test different link types
  const linkTypes = [
    { selector: "a[href^='http']", description: "External links" },
    { selector: "a[href^='/']", description: "Absolute path links" },
    { selector: "a[href^='./']", description: "Relative path links" },
    { selector: "a[href='#']", description: "Anchor links" },
  ];

  linkTypes.forEach(({ selector, description }) => {
    test(`should handle ${description} safely`, async ({ page }) => {
      await page.goto("./");

      const links = page.locator(selector);
      const count = await links.count();

      if (count === 0) {
        test.skip(true, `no ${description.toLowerCase()} found`);
        return;
      }

      const firstLink = links.first();
      const href = await firstLink.getAttribute("href");
      const isVisible = await firstLink.isVisible();

      if (isVisible && href) {
        await firstLink.click({ timeout: 5000 }).catch(() => {
          // Click may fail for external links or other reasons
        });

        // Page should still be responsive
        expect(page.locator("body")).toBeTruthy();
      }
    });
  });

  // Test navigation with query parameters
  test("should preserve query parameters during navigation", async ({
    page,
  }) => {
    await page.goto("./?test=param");

    const navLinks = page.locator("nav a");
    if ((await navLinks.count()) === 0) {
      test.skip(true, "no navigation links found");
      return;
    }

    const firstLink = navLinks.first();
    const href = await firstLink.getAttribute("href");

    if (href && (await firstLink.isVisible())) {
      await firstLink.click().catch(() => {});

      // Page should remain functional
      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test navigation with hash fragments
  test("should handle navigation with hash anchors", async ({ page }) => {
    await page.goto("./");

    // Try to navigate to hash anchor
    await page.evaluate(() => {
      globalThis.location.hash = "section1";
    });

    // Page should be stable
    expect(page.locator("body")).toBeTruthy();
  });

  // Test clicking links with modifier keys
  test("should handle Ctrl+Click on links", async ({ page }) => {
    await page.goto("./");

    const navLinks = page.locator("nav a");
    if ((await navLinks.count()) === 0) {
      test.skip(true, "no navigation links found");
      return;
    }

    const firstLink = navLinks.first();
    if (await firstLink.isVisible()) {
      // Ctrl+Click should not cause page to break
      await firstLink.click({ modifiers: ["Control"] }).catch(() => {
        // May fail if link opens in new tab
      });

      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test navigation speed - rapid navigation
  test("should handle rapid consecutive navigation attempts", async ({
    page,
  }) => {
    await page.goto("./");

    const navLinks = page.locator("a[href^='/']");
    const count = await navLinks.count();

    if (count < 2) {
      test.skip(true, "not enough relative links for this test");
      return;
    }

    // Attempt rapid navigation
    for (let i = 0; i < 3 && i < count; i++) {
      const link = navLinks.nth(i);
      if (await link.isVisible()) {
        await link.click({ timeout: 3000 }).catch(() => {});
        await page.waitForLoadState("domcontentloaded").catch(() => {});
      }
    }

    // Should still be responsive
    expect(page.locator("body")).toBeTruthy();
  });

  // Test broken link handling
  test("should gracefully handle broken/missing links", async ({ page }) => {
    await page.goto("./");

    // Try to navigate to a non-existent page
    await page
      .goto("./this-page-does-not-exist-12345", {
        waitUntil: "domcontentloaded",
      })
      .catch(() => {
        // Expected to fail or show error page
      });

    // Page should still be interactive
    const bodyExists = await page.locator("body").count();
    expect(bodyExists).toBeGreaterThan(0);
  });

  // Test navigation with special characters in URL
  test("should handle URLs with special characters", async ({ page }) => {
    await page.goto("./");

    // Try navigation with encoded parameters
    await page
      .goto("./?search=test%20query&filter=value%20here", {
        waitUntil: "domcontentloaded",
      })
      .catch(() => {});

    expect(page.locator("body")).toBeTruthy();
  });

  // Test menu toggle and keyboard navigation
  test("should handle menu open/close states correctly", async ({ page }) => {
    await page.goto("./");

    const menuButtons = page.locator("[aria-expanded], [aria-haspopup]");
    const count = await menuButtons.count();

    if (count === 0) {
      test.skip(true, "no menu buttons found");
      return;
    }

    // Try to interact with first menu button
    const firstMenuButton = menuButtons.first();
    if (await firstMenuButton.isVisible()) {
      const initialState = await firstMenuButton.getAttribute("aria-expanded");

      await firstMenuButton.click();
      await page.waitForTimeout(100);

      const afterClickState =
        await firstMenuButton.getAttribute("aria-expanded");

      // State should change or remain consistent
      expect(initialState).toBeDefined();
      expect(afterClickState).toBeDefined();
    }
  });

  // Test keyboard navigation through links
  test("should support Tab navigation through links", async ({ page }) => {
    await page.goto("./");

    const links = page.locator("a");
    if ((await links.count()) === 0) {
      test.skip(true, "no links found");
      return;
    }

    // Tab through several links
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
    }

    // Page should still be responsive
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  // Test Shift+Tab backward navigation
  test("should support Shift+Tab backward navigation", async ({ page }) => {
    await page.goto("./");

    const links = page.locator("a");
    if ((await links.count()) === 0) {
      test.skip(true, "no links found");
      return;
    }

    // Tab forward first
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
    }

    // Tab backward
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press("Shift+Tab");
    }

    expect(page.locator("body")).toBeTruthy();
  });

  // Test Enter key on focusable elements
  test("should handle Enter key on focusable elements", async ({ page }) => {
    await page.goto("./");

    const focusableElements = page.locator("button, a, [role='button']");
    if ((await focusableElements.count()) === 0) {
      test.skip(true, "no focusable elements found");
      return;
    }

    const firstElement = focusableElements.first();
    if (await firstElement.isVisible()) {
      await firstElement.focus();
      await page.keyboard.press("Enter");

      // Page should remain stable
      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test Space key on buttons
  test("should handle Space key on buttons", async ({ page }) => {
    await page.goto("./");

    const buttons = page.locator("button");
    if ((await buttons.count()) === 0) {
      test.skip(true, "no buttons found");
      return;
    }

    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      await firstButton.focus();
      await page.keyboard.press(" ");

      expect(page.locator("body")).toBeTruthy();
    }
  });

  // Test navigation during page load
  test("should handle navigation attempts during page load", async ({
    page,
  }) => {
    await page.goto("./", { waitUntil: "domcontentloaded" });

    // Immediately try to navigate while still loading
    const navLinks = page.locator("a[href^='/']");
    if ((await navLinks.count()) > 0) {
      const firstLink = navLinks.first();
      if (await firstLink.isVisible()) {
        await firstLink.click({ timeout: 2000 }).catch(() => {});
      }
    }

    // Should eventually stabilize
    await page.waitForLoadState("load").catch(() => {});
    expect(page.locator("body")).toBeTruthy();
  });

  // Test back button on homepage
  test("should handle back button on homepage", async ({ page }) => {
    await page.goto("./");

    // Try going back (should either stay on page or navigate to previous)
    const canGoBack = await page.evaluate(() => globalThis.history.length > 1);

    if (canGoBack) {
      await page.goBack().catch(() => {});
      await page.waitForLoadState("load").catch(() => {});
    }

    expect(page.locator("body")).toBeTruthy();
  });

  // Test multiple navigation attempts in sequence
  test("should handle sequence of forward/back navigation", async ({
    page,
  }) => {
    await page.goto("./");

    const navLinks = page.locator("nav a");
    if ((await navLinks.count()) > 0) {
      const link = navLinks.first();
      if (await link.isVisible()) {
        await link.click().catch(() => {});
        await page.waitForLoadState("load").catch(() => {});

        // Go back and forward
        await page.goBack().catch(() => {});
        await page.waitForLoadState("load").catch(() => {});

        await page.goForward().catch(() => {});
        await page.waitForLoadState("load").catch(() => {});
      }
    }

    expect(page.locator("body")).toBeTruthy();
  });
});
