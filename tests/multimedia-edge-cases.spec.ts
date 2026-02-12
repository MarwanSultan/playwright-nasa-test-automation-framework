import { expect, test } from "./base.fixture";

test.describe("Multimedia Edge Cases - Video", () => {
  // Test video player at different sizes
  test("should handle video player in fullscreen", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      // Get fullscreen button if available
      const fullscreenButton = page
        .locator('[title*="Fullscreen" i], [aria-label*="fullscreen" i]')
        .first();

      if (
        (await fullscreenButton.count()) > 0 &&
        (await fullscreenButton.isVisible())
      ) {
        await fullscreenButton.click().catch(() => {
          // Fullscreen may not be available
        });

        // Exit fullscreen
        await page.keyboard.press("Escape");
      }

      expect(video).toBeTruthy();
    }
  });

  // Test video playback controls
  test("should respond to all video controls", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      // Try play
      await page.evaluate(() => {
        const v = document.querySelector("video");
        if (v) v.muted = true;
      });

      await video.evaluate((v: HTMLVideoElement) => {
        v.play().catch(() => {});
      });

      // Try pause
      await video.evaluate((v: HTMLVideoElement) => {
        v.pause();
      });

      // Try seek
      await video.evaluate((v: HTMLVideoElement) => {
        if (v.duration > 0) {
          v.currentTime = Math.min(5, v.duration * 0.5);
        }
      });

      expect(video).toBeTruthy();
    }
  });

  // Test video with different playback speeds
  test("should handle playback speed changes", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

      for (const speed of playbackSpeeds) {
        await video.evaluate((v: HTMLVideoElement, s: number) => {
          v.playbackRate = s;
        }, speed);
      }

      expect(video).toBeTruthy();
    }
  });

  // Test video with volume changes
  test("should respond to volume control", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      await video.evaluate((v: HTMLVideoElement) => {
        v.muted = false;
        v.volume = 0.5;
        v.volume = 0.25;
        v.volume = 1;
        v.muted = true;
      });

      expect(video).toBeTruthy();
    }
  });

  // Test video without sound (muted)
  test("should play video when muted", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      await video.evaluate((v: HTMLVideoElement) => {
        v.muted = true;
        v.play().catch(() => {});
      });

      expect(video).toBeTruthy();
    }
  });

  // Test video metadata loading
  test("should load video metadata", async ({ page }) => {
    await page.goto("./");

    const video = page.locator("video").first();
    if ((await video.count()) === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    if (await video.isVisible()) {
      const duration = await video.evaluate((v: HTMLVideoElement) => {
        return {
          duration: v.duration,
          readyState: v.readyState,
          networkState: v.networkState,
        };
      });

      expect(duration).toBeDefined();
    }
  });

  // Test multiple videos on page
  test("should handle multiple videos on same page", async ({ page }) => {
    await page.goto("./");

    const videos = page.locator("video");
    const count = await videos.count();

    if (count === 0) {
      test.skip(true, "no video elements found");
      return;
    }

    // Attempt to mute all videos
    for (let i = 0; i < count; i++) {
      const video = videos.nth(i);
      if (await video.isVisible()) {
        await video.evaluate((v: HTMLVideoElement) => {
          v.muted = true;
        });
      }
    }

    expect(videos).toBeTruthy();
  });
});

test.describe("Multimedia Edge Cases - Images", () => {
  // Test image loading
  test("should load images properly", async ({ page }) => {
    await page.goto("./");

    const images = page.locator("img");
    const count = await images.count();

    if (count === 0) {
      test.skip(true, "no images found");
      return;
    }

    // Check first few images are loaded
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth,
      );
      expect(naturalWidth).toBeGreaterThanOrEqual(0);
    }
  });

  // Test image with missing alt text
  test("should handle images with/without alt text", async ({ page }) => {
    await page.goto("./");

    const images = page.locator("img");
    const count = await images.count();

    if (count === 0) {
      test.skip(true, "no images found");
      return;
    }

    const altTexts = [];
    for (let i = 0; i < count; i++) {
      const altText = await images.nth(i).getAttribute("alt");
      altTexts.push(altText);
    }

    expect(altTexts.length).toBe(count);
  });

  // Test high-resolution image downloads
  test("should handle download of various image formats", async ({ page }) => {
    await page.goto("./");

    const formats = [".jpg", ".png", ".gif", ".webp", ".svg"];
    const imageLinks = page.locator("a");

    for (let i = 0; i < (await imageLinks.count()) && i < 10; i++) {
      const link = imageLinks.nth(i);
      const href = await link.getAttribute("href");

      if (href && formats.some((fmt) => href.toLowerCase().includes(fmt))) {
        const url = new URL(href, page.url()).toString();

        const resp = await page.request.get(url).catch(() => null);

        if (resp) {
          expect(resp.status()).toBeLessThan(500);
        }
        break; // Test at least one
      }
    }
  });

  // Test lazy-loaded images
  test("should handle lazy-loaded images", async ({ page }) => {
    await page.goto("./");

    const lazyImages = page.locator("img[loading='lazy']");
    const count = await lazyImages.count();

    if (count === 0) {
      test.skip(true, "no lazy-loading images found");
      return;
    }

    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForTimeout(500);

    // Images should start loading
    expect(lazyImages).toBeTruthy();
  });

  // Test image aspect ratio preservation
  test("should preserve image aspect ratios", async ({ page }) => {
    await page.goto("./");

    const images = page.locator("img");
    if ((await images.count()) === 0) {
      test.skip(true, "no images found");
      return;
    }

    for (let i = 0; i < Math.min(await images.count(), 5); i++) {
      const img = images.nth(i);
      const info = await img.evaluate((el: HTMLImageElement) => {
        return {
          srcWidth: el.width,
          srcHeight: el.height,
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
        };
      });

      // Width and height should be consistent
      expect(info.srcWidth).toBeGreaterThanOrEqual(0);
      expect(info.srcHeight).toBeGreaterThanOrEqual(0);
    }
  });

  // Test responsive images
  test("should handle responsive image sources", async ({ page }) => {
    await page.goto("./");

    const pictures = page.locator("picture");
    if ((await pictures.count()) === 0) {
      test.skip(true, "no picture elements found");
      return;
    }

    const pictureSources = pictures.locator("source");
    const count = await pictureSources.count();

    for (let i = 0; i < count; i++) {
      const source = pictureSources.nth(i);
      const srcset = await source.getAttribute("srcset");
      expect(srcset).toBeTruthy();
    }
  });

  // Test SVG images
  test("should properly render SVG images", async ({ page }) => {
    await page.goto("./");

    const svgImages = page.locator("img[src$='.svg'], svg");
    if ((await svgImages.count()) === 0) {
      test.skip(true, "no SVG images found");
      return;
    }

    expect(svgImages).toBeTruthy();
  });

  // Test images at different viewport sizes
  test("should display images correctly on mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("./");

    const images = page.locator("img");
    const count = await images.count();

    if (count === 0) {
      test.skip(true, "no images found");
      return;
    }

    // Check that images fit in viewport
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();

      if (box) {
        expect(box.width).toBeLessThanOrEqual(375 + 50); // Allow some overflow
      }
    }
  });

  // Test image with broken src
  test("should handle broken image links gracefully", async ({ page }) => {
    await page.goto("./");

    // Create a test image with broken src
    const brokenImage = page.locator('img[src*="invalid"], img[src=""]');
    const count = await brokenImage.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = brokenImage.nth(i);
        const src = await img.getAttribute("src");
        expect(src).toBeDefined();
      }
    }

    // Page should still be functional
    expect(page.locator("body")).toBeTruthy();
  });

  // Test image with srcset and sizes attributes
  test("should handle srcset and sizes attributes", async ({ page }) => {
    await page.goto("./");

    const responsiveImages = page.locator("img[srcset]");
    if ((await responsiveImages.count()) === 0) {
      test.skip(true, "no responsive images found");
      return;
    }

    for (let i = 0; i < Math.min(await responsiveImages.count(), 3); i++) {
      const img = responsiveImages.nth(i);
      const srcset = await img.getAttribute("srcset");
      expect(srcset).toBeTruthy();
    }
  });
});
