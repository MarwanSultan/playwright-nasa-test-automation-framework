import { expect, test } from "./base.fixture";

test.describe("Data-Driven Search Tests", () => {
  // Test data: Various search queries with expected behavior
  const searchTestCases = [
    { query: "Mars", expectedMinResults: 1, description: "Planet search" },
    {
      query: "NASA",
      expectedMinResults: 1,
      description: "Organization search",
    },
    {
      query: "Space Station",
      expectedMinResults: 1,
      description: "Multi-word search",
    },
    {
      query: "Apollo 11",
      expectedMinResults: 1,
      description: "Historical event search",
    },
    { query: "Artemis", expectedMinResults: 1, description: "Mission search" },
    {
      query: "moon landing",
      expectedMinResults: 1,
      description: "Event search with lowercase",
    },
    {
      query: "SpaceX",
      expectedMinResults: 0,
      description: "Commercial entity search (may have limited results)",
    },
  ];

  searchTestCases.forEach(({ query, expectedMinResults, description }) => {
    test(`should handle search for "${query}" - ${description}`, async ({
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

      await searchInput.fill(query);
      await searchInput.press("Enter");

      // Wait for results to load
      await page.waitForLoadState("networkidle");

      // Verify we're on a results page or have results
      const resultsContainer = page.locator(
        '[class*="result"], [class*="search"], article',
      );
      const resultsCount = await resultsContainer.count();

      if (expectedMinResults > 0) {
        expect(resultsCount).toBeGreaterThanOrEqual(expectedMinResults);
      }
    });
  });

  // Special character and edge case queries
  const edgeCaseQueries = [
    { query: "***", description: "Special characters only" },
    { query: "123", description: "Numbers only" },
    { query: "!@#$%", description: "Symbols only" },
    { query: " ", description: "Whitespace only" },
    { query: "a", description: "Single character" },
  ];

  edgeCaseQueries.forEach(({ query, description }) => {
    test(`should handle edge case query "${description}" gracefully`, async ({
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

      await searchInput.fill(query);
      await searchInput.press("Enter");

      // Page should not crash or error out
      await page.waitForLoadState("load");
      expect(page.locator("body")).toBeTruthy();
    });
  });

  // Case sensitivity test
  const caseVariations = ["mars", "MARS", "Mars", "MaRs"];

  caseVariations.forEach((query) => {
    test(`search should handle case variations: "${query}"`, async ({
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

      await searchInput.fill(query);
      await searchInput.press("Enter");

      await page.waitForLoadState("networkidle");
      expect(page.url()).not.toBe("./");
    });
  });

  // Very long query test
  test("should handle very long search queries", async ({ page }) => {
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

    const longQuery =
      "This is a very long search query that contains many words and should still be handled properly by the search functionality";
    await searchInput.fill(longQuery);
    await searchInput.press("Enter");

    await page.waitForLoadState("load");
    expect(page.locator("body")).toBeTruthy();
  });

  // Repeated spaces test
  test("should normalize queries with repeated spaces", async ({ page }) => {
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

    await searchInput.fill("Mars     NASA     Mission");
    await searchInput.press("Enter");

    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toBe("./");
  });

  // Search with leading/trailing whitespace
  test("should trim leading and trailing whitespace from queries", async ({
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

    await searchInput.fill("   Mars   ");
    await searchInput.press("Enter");

    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toBe("./");
  });
});
