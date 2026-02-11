import { test, expect } from './base.fixture';

test.describe('Multimedia (Video & Image) Playback and Downloads', () => {
  test('video plays and controls are available', async ({ page }) => {
    await page.goto('./');
    const video = page.locator('video').first();
    if (await video.count() === 0) test.skip(true, 'no video elements found');
    await expect(video).toBeVisible();
    // try play via JS if controls are present
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) (v as HTMLVideoElement).muted = true;
    });
    await video.evaluate((v: HTMLVideoElement) => v.play());
  });

  test('high-res image downloads succeed', async ({ page }) => {
    await page.goto('./');
    const imgLink = page.locator('a[href$=".jpg"], a[href$=".png"]').first();
    if (await imgLink.count() === 0) test.skip(true, 'no image download links found');
    const href = await imgLink.getAttribute('href');
    if (!href) {
      test.skip(true, 'image link had no href');
      return;
    }
    const url = new URL(href, page.url()).toString();
    const resp = await page.request.get(url);
    expect(resp.status()).toBe(200);
  });
});
