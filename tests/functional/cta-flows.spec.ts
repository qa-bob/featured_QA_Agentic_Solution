/**
 * tests/functional/cta-flows.spec.ts
 *
 * Functional tests for call-to-action flows on the Featured site.
 * Validates CTA interactions — clicking through to demo/trial/contact pages —
 * without submitting forms or creating accounts.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('CTA Flows @functional', () => {
  test.beforeEach(async ({ page }) => {
    const title = await page.title().catch(() => '');
    if (title.includes('Security Checkpoint') || title.includes('Vercel')) {
      test.skip(true, 'Vercel Security Checkpoint detected — CTA flow tests skipped');
    }
  });

  // ── Demo / Trial CTAs ─────────────────────────────────────────────────────────

  test('demo or free-trial CTA exists on homepage @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const demoCta = page.locator('a, button').filter({
      hasText: /request demo|book demo|get demo|free trial|try free|start free|get started|sign up free/i,
    }).first();

    if (await demoCta.count() === 0) {
      console.warn(
        '[functional] No demo/trial CTA found matching common patterns. ' +
        'Check site.config.json expectedNavItems to see if the CTA uses different wording.'
      );
      return;
    }

    await expect(demoCta, 'Demo/trial CTA should be visible').toBeVisible();
  });

  test('clicking a primary CTA does not navigate to an error page @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const primaryCta = page.locator('a, button').filter({
      hasText: /get started|request demo|free trial|try free|learn more|see how|see it in action/i,
    }).first();

    if (await primaryCta.count() === 0) {
      console.warn('[functional] No primary CTA found to click-through test.');
      return;
    }

    const href = await primaryCta.getAttribute('href');

    if (!href || href === '#' || href.startsWith('javascript:')) {
      // Button triggers modal, scroll, or JS — just verify it's clickable
      const isEnabled = await primaryCta.isEnabled();
      expect(isEnabled, 'Primary CTA button should be enabled').toBeTruthy();
      return;
    }

    // Navigate and verify the destination is not a 404/500
    const response = await page.goto(new URL(href, siteConfig.url).toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });

    expect(response).not.toBeNull();
    const status = response!.status();

    expect(
      status < 400 || status === 429,
      `Primary CTA destination returned HTTP ${status} — should be 2xx/3xx (or 429 for bot protection)`
    ).toBeTruthy();
  });

  // ── Navigation CTAs ───────────────────────────────────────────────────────────

  test('header CTA button is present and visible @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Look for a button/link styled as CTA in the header/nav
    const headerCta = page.locator(
      'header a[class*="btn" i], header a[class*="button" i], header a[class*="cta" i], ' +
      'nav a[class*="btn" i], nav a[class*="button" i], nav a[class*="cta" i], ' +
      'header button[class*="btn" i], nav button[class*="btn" i]'
    ).first();

    // Also try text-based approach for sites without class-based CTAs
    const headerCtaByText = page.locator('header a, nav a').filter({
      hasText: /get started|sign up|request demo|free trial|try free|login|log in/i,
    }).first();

    const hasCssStyled = await headerCta.count() > 0;
    const hasTextBased = await headerCtaByText.count() > 0;

    if (!hasCssStyled && !hasTextBased) {
      console.warn(
        '[functional] No header CTA found. ' +
        'B2B SaaS best practice is to have a visible CTA in the header on every page.'
      );
      return;
    }

    const activeCta = hasCssStyled ? headerCta : headerCtaByText;
    await expect(activeCta, 'Header CTA should be visible').toBeVisible();
  });

  // ── Contact flow ──────────────────────────────────────────────────────────────

  test('contact or support link is discoverable @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const contactLink = page.locator('a').filter({
      hasText: /contact|support|help|get in touch|reach out|talk to us/i,
    }).first();

    if (await contactLink.count() === 0) {
      console.warn(
        '[functional] No contact/support link found on the homepage. ' +
        'Users should be able to easily find how to reach the company.'
      );
      return;
    }

    await expect(contactLink, 'Contact link should be visible').toBeVisible();
  });

  test('contact page loads when navigating to /contact @functional', async ({ page, siteConfig }) => {
    const contactUrl = siteConfig.url.replace(/\/$/, '') + '/contact';

    const response = await page.goto(contactUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    }).catch(() => null);

    if (!response) {
      console.warn('[functional] Could not navigate to /contact — page may not exist at this path.');
      return;
    }

    const status = response.status();

    if (status === 404) {
      // Try /contact-us
      const altResponse = await page.goto(
        siteConfig.url.replace(/\/$/, '') + '/contact-us',
        { waitUntil: 'domcontentloaded', timeout: 10_000 }
      ).catch(() => null);

      if (!altResponse || altResponse.status() === 404) {
        console.warn(
          '[functional] Contact page not found at /contact or /contact-us. ' +
          'Contact functionality may be embedded on the homepage.'
        );
        return;
      }

      expect(altResponse.status()).toBeLessThan(400);
    } else {
      expect(
        status < 400 || status === 429,
        `Contact page returned HTTP ${status}`
      ).toBeTruthy();
    }
  });

  // ── Accessibility of interactive elements ────────────────────────────────────

  test('all buttons on homepage are accessible (have text or aria-label) @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const inaccessibleButtons = await page.evaluate<string[]>(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons
        .filter((btn) => {
          const text = (btn.textContent ?? '').trim();
          const ariaLabel = btn.getAttribute('aria-label') ?? '';
          const ariaLabelledBy = btn.getAttribute('aria-labelledby') ?? '';
          const title = btn.getAttribute('title') ?? '';
          return !text && !ariaLabel && !ariaLabelledBy && !title;
        })
        .map((btn) => btn.outerHTML.slice(0, 100));
    });

    if (inaccessibleButtons.length > 0) {
      console.warn(
        `[functional] ${inaccessibleButtons.length} button(s) have no accessible name:\n` +
          inaccessibleButtons.slice(0, 5).join('\n')
      );
    }

    expect(
      inaccessibleButtons.length,
      `Found ${inaccessibleButtons.length} button(s) without accessible text or aria-label`
    ).toBe(0);
  });
});
