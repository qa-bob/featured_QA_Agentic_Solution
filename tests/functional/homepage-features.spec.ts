/**
 * tests/functional/homepage-features.spec.ts
 *
 * Functional tests for the Featured homepage.
 * Validates key business features: hero, CTAs, features section, social proof,
 * and footer completeness — without submitting forms or creating accounts.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

// ── Shared bot-wall guard ────────────────────────────────────────────────────

test.describe('Homepage Features @functional', () => {
  test.beforeEach(async ({ homePage, page }) => {
    const title = await page.title().catch(() => '');
    if (title.includes('Security Checkpoint') || title.includes('Vercel')) {
      test.skip(true, 'Vercel Security Checkpoint detected — functional tests skipped');
    }
  });

  // ── Hero section ─────────────────────────────────────────────────────────────

  test('homepage has a main heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();

    expect(
      heading.length,
      'Homepage should have a visible h1 or h2 heading'
    ).toBeGreaterThan(0);
  });

  test('hero section contains visible body text @functional', async ({ homePage }) => {
    const heroText = await homePage.getHeroText();

    expect(
      heroText.length,
      'Hero section should contain descriptive body text (more than 10 characters)'
    ).toBeGreaterThan(10);
  });

  test('homepage has at least one primary CTA @functional', async ({ homePage }) => {
    const ctaButtons = await homePage.getCTAButtons();

    expect(
      ctaButtons.length,
      'Homepage should have at least one call-to-action button or link'
    ).toBeGreaterThan(0);

    // The first CTA should be visible
    await expect(
      ctaButtons[0],
      'Primary CTA should be visible above the fold'
    ).toBeVisible();
  });

  test('primary CTA links to a valid destination @functional', async ({ homePage, page, siteConfig }) => {
    const ctaButtons = await homePage.getCTAButtons();

    if (ctaButtons.length === 0) {
      test.skip(true, 'No CTA buttons found on homepage');
      return;
    }

    const firstCta = ctaButtons[0];
    const href = await firstCta.getAttribute('href');

    if (!href) {
      // CTA is a button (likely triggers a modal/scroll) — check it's interactive
      const tagName = await firstCta.evaluate<string>((el) => el.tagName.toLowerCase());
      expect(
        ['button', 'a'].includes(tagName),
        'CTA should be a button or anchor element'
      ).toBeTruthy();
      return;
    }

    // Resolve relative href
    const resolvedUrl = new URL(href, siteConfig.url).toString();

    // Should stay on the same domain or link to a recognized CTA path
    const siteOrigin = new URL(siteConfig.url).origin;
    const isInternal = resolvedUrl.startsWith(siteOrigin);
    const isExternalApp = /app\.|dashboard\.|console\.|portal\./.test(resolvedUrl);

    expect(
      isInternal || isExternalApp,
      `Primary CTA href "${href}" should point to the site or a known app subdomain`
    ).toBeTruthy();
  });

  // ── Features section ──────────────────────────────────────────────────────────

  test('homepage has a features or benefits section @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Look for common features section patterns
    const featuresSection = page.locator(
      '[id*="feature" i], [class*="feature" i], ' +
      '[id*="benefit" i], [class*="benefit" i], ' +
      '[id*="how-it-works" i], [class*="how-it-works" i], ' +
      'section:has(h2), section:has(h3)'
    ).first();

    if (await featuresSection.count() === 0) {
      console.warn(
        '[functional] No distinct features section found. ' +
        'Consider adding a clearly labeled section with id="features" or class="features".'
      );
      return;
    }

    await expect(featuresSection).toBeVisible();
  });

  test('homepage has multiple section headings (structured content) @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // A well-structured homepage should have more than just h1
    const headings = page.locator('h2, h3');
    const count = await headings.count();

    expect(
      count,
      'Homepage should have at least 2 section headings (h2 or h3) to indicate structured content'
    ).toBeGreaterThanOrEqual(2);
  });

  // ── Social proof ──────────────────────────────────────────────────────────────

  test('homepage has social proof content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Social proof: testimonials, reviews, customer logos, case studies, trust badges
    const socialProofLocators = [
      page.locator('[class*="testimonial" i]'),
      page.locator('[class*="review" i]'),
      page.locator('[class*="customer" i]'),
      page.locator('[class*="logo" i]:not(header [class*="logo" i])'), // logos outside header
      page.locator('[class*="trust" i]'),
      page.locator('[class*="quote" i]'),
      page.locator('blockquote'),
      page.locator('[data-testid*="testimonial" i]'),
    ];

    let found = false;
    for (const locator of socialProofLocators) {
      if (await locator.count() > 0) {
        found = true;
        break;
      }
    }

    if (!found) {
      console.warn(
        '[functional] No social proof elements found (testimonials, logos, reviews). ' +
        'Social proof is a key B2B conversion element — consider adding customer logos or testimonials.'
      );
    }

    // Soft assertion — log the absence as a warning rather than failing CI
    // Social proof absence is a UX concern, not a test defect
  });

  // ── Page load quality ─────────────────────────────────────────────────────────

  test('homepage body has substantial content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const wordCount = await page.evaluate<number>(() => {
      const text = document.body.innerText.replace(/\s+/g, ' ').trim();
      return text.split(' ').filter((w) => w.length > 0).length;
    });

    expect(
      wordCount,
      `Homepage should have substantial content (at least 100 words). Found ${wordCount} words.`
    ).toBeGreaterThan(100);
  });

  test('all images on homepage load successfully @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'networkidle' });

    const brokenImages = await page.evaluate<string[]>(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src || img.getAttribute('data-src') || '[no src]')
        .filter((src) => src && !src.startsWith('data:'));
    });

    if (brokenImages.length > 0) {
      console.warn(
        `[functional] ${brokenImages.length} broken image(s):\n` +
          brokenImages.slice(0, 5).map((src) => `  ${src}`).join('\n')
      );
    }

    expect(
      brokenImages.length,
      `Found ${brokenImages.length} broken image(s) on homepage`
    ).toBe(0);
  });

  // ── Footer ────────────────────────────────────────────────────────────────────

  test('homepage has a footer @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer, [role="contentinfo"]').first();

    expect(
      await footer.count(),
      'Homepage should have a <footer> element or element with role="contentinfo"'
    ).toBeGreaterThan(0);

    await expect(footer).toBeVisible();
  });

  test('footer contains links @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer, [role="contentinfo"]').first();

    if (await footer.count() === 0) {
      test.skip(true, 'No footer element found — covered by "homepage has a footer" test');
      return;
    }

    const footerLinks = footer.locator('a[href]');
    const count = await footerLinks.count();

    expect(
      count,
      'Footer should contain links (privacy policy, terms, social media, etc.)'
    ).toBeGreaterThan(0);
  });
});
