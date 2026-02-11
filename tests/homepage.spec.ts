import test from 'node:test';
import { expect, test as base } from './base.fixture';


test.describe('NASA.gov homepage', () => {
  base('should have the correct title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBe('NASA');
    });

});







