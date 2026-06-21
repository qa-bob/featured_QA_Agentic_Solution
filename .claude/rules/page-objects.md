---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Rules

These rules apply when Claude is writing or editing any file under `src/pages/`.

## Class structure

- Every page class must extend `BasePage` from `./base.page`
- Constructor signature: `constructor(page: Page, config: SiteConfig)` — call `super(page, config)`
- Locators are declared as `readonly` properties of type `Locator` at the top of the class

## Locators

- Prefer semantic selectors: `getByRole`, `getByLabel`, `getByText` over CSS class-based selectors
- When CSS class selectors are necessary, prefer `[class*="partial-name"]` over exact matches
- Never select by test implementation details (generated IDs, internal React class names)
- All locators belong on the class — never returned from or created inside methods

## Methods

- Methods represent user actions: `fillEmail`, `clickSubmit`, `openMobileMenu`
- Methods must be `async` and return `Promise<void>` unless they return data
- No `expect()` or assertion calls inside any page object method
- No navigation inside a page object unless the method is explicitly named `navigate()` or `goto()`

## TypeScript

- All parameters and return types must be explicitly declared
- No implicit `any` — strict TypeScript is required
- Export each class as a named export at the end of the file or inline

## Example structure

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ExamplePage extends BasePage {
  readonly heading: Locator = this.page.getByRole('heading', { level: 1 });
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /get started/i });

  async clickCTA(): Promise<void> {
    await this.ctaButton.click();
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() ?? '';
  }
}
```
