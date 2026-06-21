---
paths:
  - "tests/**/*.ts"
  - "tests/**/*.spec.ts"
---

# Test File Rules

These rules apply when Claude is writing or editing any file under `tests/`.

## Required

- Import `test` and `expect` from `@fixtures/site.fixture`, never from `@playwright/test`
- Every test must have at least one tag in the test title: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, or `@responsive`
- Use page object methods from fixtures (`homePage`, `navigationPage`, `contactPage`) — no raw `page.locator()` calls in the test body
- Use `baseURL` from Playwright config — never hardcode `https://featured.com` in a test

## Forbidden

- `page.waitForTimeout()` — use `waitForSelector`, `waitForLoadState`, or Playwright auto-waiting
- `expect()` calls inside imported page object methods
- Form submission — test field interactions and validation only; never call submit
- Account creation or credential entry
- `any` type without an explicit JSDoc `/* eslint-disable */` comment

## Naming and structure

- One `test.describe()` block per feature or page in each spec file
- Test names must be descriptive and end with the tag(s): `'homepage hero is visible @smoke'`
- `test.beforeEach` should handle navigation; individual tests should not call `goto` unless testing navigation itself

## Visual tests

- Every `toHaveScreenshot()` call must include a meaningful snapshot name
- Run `/update-baseline` after any intentional visual change before committing snapshots
