# Contributing to Featured QA Agentic Solution

Thank you for contributing to this Playwright test suite. Please read these guidelines before opening a PR.

---

## Workflow Overview

1. Branch from `main`
2. Write or update tests following the rules below
3. Run `npm run typecheck && npm run lint` — both must pass
4. Open a PR using the PR template
5. All CI checks must pass before merge

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| New tests | `feature/add-<page>-tests` | `feature/add-pricing-tests` |
| Bug fix | `fix/<description>` | `fix/nav-link-404-check` |
| Chore | `chore/<description>` | `chore/update-playwright` |

Always branch from `main`. Force-push to `main` is blocked.

---

## Page Object Model Rules

Every page or section must have its own class in `src/pages/`. No exceptions.

```typescript
// CORRECT — locators and actions in the page object
export class PricingPage extends BasePage {
  readonly planCards: Locator = this.page.locator('[data-testid="plan-card"]');

  async selectPlan(name: string): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }
}

// WRONG — raw locators in the test body
test('pricing works', async ({ page }) => {
  await page.locator('[data-testid="plan-card"]').first().click(); // NO
});
```

### Page object checklist

- [ ] Class extends `BasePage` from `./base.page`
- [ ] All locators are `readonly Locator` properties on the class
- [ ] Methods represent user actions, not assertions
- [ ] No `expect()` calls inside any page object method
- [ ] New page objects are exported from and added to `src/fixtures/site.fixture.ts`

---

## Test Writing Rules

### Imports

Always import from the fixture, never from `@playwright/test` directly:

```typescript
// CORRECT
import { test, expect } from '@fixtures/site.fixture';

// WRONG
import { test, expect } from '@playwright/test';
```

### Tagging

Every test must have at least one tag. Tests without tags are not run in CI tag-filtered jobs.

```typescript
test('homepage hero is visible @smoke @functional', async ({ homePage }) => { ... });
```

| Tag | Use for |
|-----|---------|
| `@smoke` | Site loads, HTTPS, title, no console errors |
| `@navigation` | Nav links, menus, routing |
| `@forms` | Field interactions, validation |
| `@functional` | Business features |
| `@visual` | Screenshot regression |
| `@responsive` | Viewport-specific layout |

### URLs

Never hardcode the base URL:

```typescript
// CORRECT — uses Playwright's baseURL
await page.goto('/pricing');

// WRONG
await page.goto('https://featured.com/pricing');
```

### Waiting

Never use `waitForTimeout`. Use Playwright's built-in waiting:

```typescript
// CORRECT
await page.waitForSelector('.hero-section');
await expect(locator).toBeVisible();

// WRONG
await page.waitForTimeout(2000);
```

### Forms

Never submit a form. Test field interactions and validation only:

```typescript
// CORRECT
await contactPage.fillName('Test User');
await expect(contactPage.nameField).toHaveValue('Test User');

// WRONG — never submit
await contactPage.submitForm();
```

---

## TypeScript Rules

- Strict mode is enabled — all properties must be explicitly typed
- Never use `any` without a JSDoc comment explaining why
- Run `npm run typecheck` — zero errors required
- Page object properties must use `readonly` where the locator does not change

---

## Commit Messages

Use the imperative mood and be specific:

```
add pricing page POM and functional tests
fix nav link checker to handle relative hrefs
update visual baselines after homepage redesign
```

---

## CI Requirements

All of the following must pass before a PR can merge:

- [ ] TypeScript (`npm run typecheck`)
- [ ] Lint (`npm run lint`)
- [ ] Smoke tests (`npm run test:smoke`)
- [ ] No new `any` types introduced

Visual baseline diffs require manual review — open `playwright-report/index.html` before approving.

---

## Claude Code Workflow

If you use Claude Code in this repo, the following slash commands are available:

```
/analyze-site        # Inspect the site, update site.config.json
/generate-full-suite # Generate tests from scratch for a new site
/run-smoke           # Run and report smoke tests
/generate-report     # Summarize all test results
/update-baseline     # Refresh visual snapshots
```

See [Skills.md](../Skills.md) and [AGENTS.md](../AGENTS.md) for full documentation.

Do not commit files from `.claude/memory/` — those are personal auto-memory notes written by Claude Code during your session.
