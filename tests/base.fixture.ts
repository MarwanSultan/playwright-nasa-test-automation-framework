import { test as base, Page } from '@playwright/test';

export const test = base.extend({
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page: Page = await context.newPage();
    await page.goto('./');
    await use(page);
    await context.close();
  },
});
                
export const expect = test.expect;