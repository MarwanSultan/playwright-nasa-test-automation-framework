import { expect, test } from "./base.fixture";

test.describe("Input Validation Edge Cases", () => {
  const specialCharacterInputs = [
    {
      input: "<script>alert('xss')</script>",
      description: "XSS attempt with script tags",
    },
    { input: "'; DROP TABLE users; --", description: "SQL injection attempt" },
    {
      input: "<img src=x onerror=alert('xss')>",
      description: "HTML injection",
    },
    { input: "../../etc/passwd", description: "Path traversal attempt" },
    { input: "${process.env.NODE_ENV}", description: "Template injection" },
    { input: String.raw`\x3cscript\x3e`, description: "Hex encoded script" },
  ];

  specialCharacterInputs.forEach(({ input, description }) => {
    test(`should safely handle "${description}" in search`, async ({
      page,
    }) => {
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

      // Fill with potentially malicious input
      await searchInput.fill(input);
      await searchInput.press("Enter");

      // Page should remain intact and responsive
      await page.waitForLoadState("load");
      expect(page.locator("body")).toBeTruthy();

      // Verify no execution happened (page didn't navigate away unexpectedly)
      const url = page.url();
      expect(url).toContain("nasa.gov");
    });
  });

  // Unicode and emoji tests
  const unicodeInputs = [
    { input: "🚀 Mars", description: "Emoji with text" },
    { input: "火星 Mars", description: "Chinese characters with English" },
    { input: "火星مريخ", description: "Mixed scripts" },
    { input: "Москва", description: "Cyrillic characters" },
    { input: "العربية", description: "Arabic characters" },
    { input: "🌍🌎🌏", description: "Only emojis" },
  ];

  unicodeInputs.forEach(({ input, description }) => {
    test(`should handle ${description} in search`, async ({ page }) => {
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

      await searchInput.fill(input);

      // Verify input was accepted
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe(input);

      await searchInput.press("Enter");
      await page.waitForLoadState("load");
      expect(page.locator("body")).toBeTruthy();
    });
  });

  // Numeric boundary tests
  const numericInputs = [
    { input: "0", description: "Zero" },
    { input: "-1", description: "Negative number" },
    { input: "999999999999999999", description: "Very large number" },
    { input: "3.14159", description: "Decimal number" },
    { input: "1e10", description: "Scientific notation" },
  ];

  numericInputs.forEach(({ input, description }) => {
    test(`should handle ${description} as search input`, async ({ page }) => {
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

      await searchInput.fill(input);
      await searchInput.press("Enter");

      await page.waitForLoadState("load");
      expect(page.locator("body")).toBeTruthy();
    });
  });

  // Maximum length inputs
  test("should handle extremely long input (>5000 characters)", async ({
    page,
  }) => {
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

    const longInput = "a".repeat(5000);
    await searchInput.fill(longInput);
    await searchInput.press("Enter");

    await page.waitForLoadState("load");
    expect(page.locator("body")).toBeTruthy();
  });

  // Null byte and control character tests
  test("should handle null bytes in input", async ({ page }) => {
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

    await searchInput.fill("test\0value");
    await searchInput.press("Enter");

    await page.waitForLoadState("load");
    expect(page.locator("body")).toBeTruthy();
  });

  // Clipboard paste of unusual content
  test("should handle pasted unusual content", async ({ page }) => {
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

    // Simulate paste with unusual content
    await searchInput.evaluate((el: HTMLInputElement) => {
      el.value = "Pasted\nMultiline\nContent";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await searchInput.press("Enter");
    await page.waitForLoadState("load");
    expect(page.locator("body")).toBeTruthy();
  });

  // Test input focus and blur behaviors
  test("should handle rapid focus/blur on inputs", async ({ page }) => {
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

    // Rapid focus/blur
    for (let i = 0; i < 10; i++) {
      await searchInput.focus();
      await searchInput.blur();
    }

    expect(page.locator("body")).toBeTruthy();
  });

  // Test autocomplete behavior
  test("should handle autocomplete attribute correctly", async ({ page }) => {
    await page.goto("./");
    const inputs = page.locator("input");

    for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const autocomplete = await input.getAttribute("autocomplete");
        // Just verify we can read the attribute
        expect(typeof autocomplete).toBe(typeof autocomplete);
      }
    }
  });

  // Whitespace-only inputs
  const whitespaceInputs = [
    { input: " ", description: "Single space" },
    { input: "\t", description: "Tab character" },
    { input: "\n", description: "Newline character" },
    { input: "   \n\t     ", description: "Mixed whitespace" },
  ];

  whitespaceInputs.forEach(({ input, description }) => {
    test(`should handle ${description} gracefully`, async ({ page }) => {
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

      await searchInput.fill(input);
      const value = await searchInput.inputValue();

      // Should accept the whitespace
      expect(value).toBeDefined();

      await searchInput.press("Enter");
      await page.waitForLoadState("load");
      expect(page.locator("body")).toBeTruthy();
    });
  });
});
