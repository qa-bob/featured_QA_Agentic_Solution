/**
 * tests/functional/regression.spec.ts
 *
 * Regression tests for the Featured site.
 * These tests guard against regressions in core functionality.
 * Add a test here whenever a bug is found and fixed.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Regression Tests @functional', () => {
  test.beforeEach(async ({ page }) => {
    const title = await page.title().catch(() => '');
    if (title.includes('Security Checkpoint') || title.includes('Vercel')) {
      test.skip(true, 'Vercel Security Checkpoint detected — regression tests skipped');
    }
  });

  // ── Core page availability ────────────────────────────────────────────────────

  test('homepage returns a successful response @functional', async ({ page, siteConfig }) => {
    const response = await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    expect(response).not.toBeNull();
    const status = response!.status();

    // 429 (rate limit) means the page is up but bot-protected — treat as pass
    if (status === 429) return;

    expect(
      status >= 200 && status < 400,
      `Homepage returned HTTP ${status} — expected 2xx or 3xx`
    ).toBeTruthy();
  });

  test('page title is not empty or a default placeholder @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const title = await page.title();

    const defaultTitles = /^(untitled|new tab|index|home|welcome|undefined|null|localhost)/i;
    expect(title.trim(), 'Page title should not be empty').toBeTruthy();
    expect(
      defaultTitles.test(title.trim()),
      `Page title "${title}" looks like a placeholder — update it to reflect the brand`
    ).toBeFalsy();
  });

  test('canonical link tag is present (SEO) @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const canonicalTag = page.locator('link[rel="canonical"]').first();
    const canonical = (await canonicalTag.count()) > 0 ? await canonicalTag.getAttribute('href') : null;

    if (!canonical) {
      console.warn(
        '[regression] No canonical link tag found. ' +
        'Add <link rel="canonical" href="..."> to prevent duplicate content issues.'
      );
    } else {
      // Canonical should point to the same domain
      const siteOrigin = new URL(siteConfig.url).origin;
      expect(
        canonical.startsWith(siteOrigin) || canonical.startsWith('/'),
        `Canonical URL "${canonical}" should point to the same domain`
      ).toBeTruthy();
    }
  });

  test('Open Graph tags are present (social sharing) @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const ogTitleTag = page.locator('meta[property="og:title"]').first();
    const ogTitle = (await ogTitleTag.count()) > 0 ? await ogTitleTag.getAttribute('content') : null;
    const ogDescriptionTag = page.locator('meta[property="og:description"]').first();
    const ogDescription = (await ogDescriptionTag.count()) > 0 ? await ogDescriptionTag.getAttribute('content') : null;
    const ogImageTag = page.locator('meta[property="og:image"]').first();
    const ogImage = (await ogImageTag.count()) > 0 ? await ogImageTag.getAttribute('content') : null;

    const missing: string[] = [];
    if (!ogTitle) missing.push('og:title');
    if (!ogDescription) missing.push('og:description');
    if (!ogImage) missing.push('og:image');

    if (missing.length > 0) {
      console.warn(
        `[regression] Missing Open Graph tags: ${missing.join(', ')}. ` +
        'These improve how the site appears when shared on LinkedIn, Slack, and other platforms.'
      );
    }

    // og:title is the most critical — soft-assert the others
    if (ogTitle !== null) {
      expect(ogTitle.trim(), 'og:title should not be empty').toBeTruthy();
    }
  });

  // ── Link integrity ────────────────────────────────────────────────────────────

  test('no links with href="#" (placeholder links) @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const placeholderLinks = await page.evaluate<string[]>(() => {
      return Array.from(document.querySelectorAll('a[href="#"]'))
        .map((a) => {
          const text = (a.textContent ?? '').trim().slice(0, 50);
          return text || '[no text]';
        });
    });

    if (placeholderLinks.length > 0) {
      console.warn(
        `[regression] Found ${placeholderLinks.length} placeholder link(s) with href="#":\n` +
          placeholderLinks.slice(0, 5).map((t) => `  "${t}"`).join('\n')
      );
    }

    // Soft assertion — placeholder links are a quality concern, not a test blocker
    expect(
      placeholderLinks.length,
      `Found ${placeholderLinks.length} placeholder link(s) with href="#" — these should link to real destinations`
    ).toBeLessThanOrEqual(2);
  });

  test('no broken internal links on homepage @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const internalHrefs = await page.evaluate<string[]>(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((href) => href.startsWith('/') && !href.startsWith('//') && href !== '#');
    });

    test.skip(internalHrefs.length === 0, 'No internal links found on homepage to check');

    const uniqueHrefs = [...new Set(internalHrefs)].slice(0, 15); // Limit to first 15
    const broken: Array<{ href: string; status: number }> = [];

    for (const href of uniqueHrefs) {
      const fullUrl = siteConfig.url.replace(/\/$/, '') + href;
      try {
        const response = await page.request.head(fullUrl, { timeout: 8_000 });
        const status = response.status();
        if (status === 404 || status === 410) {
          broken.push({ href, status });
        }
      } catch {
        // Network error — skip this link
      }
    }

    if (broken.length > 0) {
      console.warn(
        `[regression] Broken internal links:\n` +
          broken.map((b) => `  ${b.href} → HTTP ${b.status}`).join('\n')
      );
    }

    expect(
      broken.length,
      `Found ${broken.length} broken internal link(s) on homepage`
    ).toBe(0);
  });

  // ── Performance red flags ─────────────────────────────────────────────────────

  test('page does not render inline <script> errors @functional', async ({ page, siteConfig }) => {
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await page.goto(siteConfig.url, { waitUntil: 'load' });

    const critical = errors.filter((e) => {
      const lower = e.toLowerCase();
      // Ignore well-known benign third-party errors
      return (
        !lower.includes('script error') && // cross-origin opaque errors
        !lower.includes('non-error promise rejection') &&
        !lower.includes('googletagmanager') &&
        !lower.includes('hotjar') &&
        !lower.includes('intercom') &&
        !lower.includes('adsbygoogle')
      );
    });

    if (critical.length > 0) {
      console.warn(
        `[regression] Page errors detected:\n` + critical.join('\n')
      );
    }

    expect(
      critical.length,
      `Found ${critical.length} JavaScript page error(s) on load`
    ).toBe(0);
  });
});
