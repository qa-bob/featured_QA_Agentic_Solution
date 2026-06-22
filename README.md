# Featured — QA Agentic Solution

Playwright + TypeScript regression test suite for [featured.com](https://featured.com), built with the **Page Object Model (POM)** architecture and designed for agentic execution by [Claude Code](https://code.claude.com).

Tests cover smoke checks, navigation, form validation, functional flows, visual regression, and responsive layouts — **without account creation or form submission**.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Running Tests](#running-tests)
6. [Claude Code Integration](#claude-code-integration)
7. [.github Folder Contents](#github-folder-contents)
8. [AGENTS.md](#agentsmd)
9. [Skills.md](#skillsmd)
10. [Visual Regression](#visual-regression)
11. [CI/CD](#cicd)
12. [Contributor Rules](#contributor-rules)
13. [Environment Variables](#environment-variables)

---

## Purpose

This repository is the automated QA framework for **Featured** (https://featured.com), a B2B SaaS content automation platform. It validates every discoverable feature of the public website using:

- **Playwright** — cross-browser automation with Chromium, mobile (Pixel 5), and tablet (iPad Mini) projects
- **TypeScript** (strict mode) — type-safe, maintainable test code
- **Page Object Model (POM)** — locators and actions encapsulated in reusable page classes
- **OOP design** — every page inherits from `BasePage`; Playwright fixtures compose them into tests
- **Claude Code sub-agents** — AI-powered site analysis and test generation

| Suite | Tag | What it validates |
|-------|-----|-------------------|
| Smoke | `@smoke` | Site loads, HTTPS, title, no console errors |
| Navigation | `@navigation` | Nav links, routing, menus, 404 checks |
| Forms | `@forms` | Field rendering, validation messages, accessibility |
| Functional | `@functional` | Business features: CTAs, pricing, video, accordions |
| Visual | `@visual` | Screenshot regression at all viewports |
| Responsive | `@responsive` | Layout integrity at mobile, tablet, desktop |

---

## Quick Start

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20.x |
| npm | 10.x |
| Git | 2.x |
| Claude Code | latest (optional, for AI-assisted generation) |

### 1. Clone and install

```bash
git clone <repo-url>
cd featured_QA_Agentic_Solution
npm ci
```

### 2. Install Playwright browsers

```bash
# Chromium only (smoke, navigation, forms — fastest)
npx playwright install --with-deps chromium

# All browsers (full suite including mobile and tablet)
npx playwright install --with-deps
```

### 3. Verify TypeScript compiles

```bash
npm run typecheck
```

### 4. Run a smoke check to confirm the site is reachable

```bash
npm run test:smoke
```

### 5. (Optional) Copy the example env file

```bash
# Windows
copy .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

---

## Project Structure

```
featured_QA_Agentic_Solution/
├── README.md                    ← this file
├── AGENTS.md                    ← Claude Code sub-agent definitions
├── Skills.md                    ← slash command / skill documentation
├── CLAUDE.md                    ← Claude Code project instructions (imports AGENTS.md)
├── site.config.json             ← target site URL, test flags, expected nav items
├── playwright.config.ts         ← Playwright projects (desktop/mobile/tablet)
├── global-setup.ts              ← pre-run reachability check
├── tsconfig.json                ← TypeScript strict-mode configuration
├── .env.example                 ← environment variable reference
├── .gitignore
│
├── src/
│   ├── pages/                   ← Page Object Model classes (one per page/section)
│   │   ├── base.page.ts         ← BasePage — shared navigation, helpers
│   │   ├── home.page.ts         ← HomePage
│   │   ├── navigation.page.ts   ← NavigationPage
│   │   └── contact.page.ts      ← ContactFormPage
│   ├── fixtures/
│   │   └── site.fixture.ts      ← custom Playwright fixtures (exposes page objects to tests)
│   ├── utils/
│   │   ├── link-checker.ts      ← HTTP link validation helper
│   │   └── visual-helper.ts     ← screenshot utilities
│   └── types/
│       └── site-config.types.ts ← SiteConfig TypeScript interface
│
├── tests/
│   ├── smoke/                   ← @smoke — site availability, HTTPS, title, console errors
│   ├── navigation/              ← @navigation — nav links, menus, routing
│   ├── forms/                   ← @forms — field interactions, validation
│   ├── functional/              ← @functional — business features
│   ├── visual/                  ← @visual — screenshot regression
│   ├── responsive/              ← @responsive — viewport-specific layout
│   └── custom/                  ← site-specific generated tests (@custom)
│
├── .claude/
│   ├── settings.json            ← Claude Code permissions and configuration
│   ├── agents/                  ← sub-agent definitions (loaded by Claude at startup)
│   │   ├── site-analyzer.md     ← crawls live site → produces site.config.json
│   │   └── test-generator.md    ← generates Playwright tests from config
│   ├── rules/                   ← path-scoped coding rules for Claude
│   │   ├── testing.md           ← rules applied when Claude edits tests/**
│   │   └── page-objects.md      ← rules applied when Claude edits src/pages/**
│   └── commands/                ← slash command (skill) definitions
│       ├── analyze-site.md
│       ├── generate-full-suite.md
│       ├── run-smoke.md
│       ├── update-baseline.md
│       └── generate-report.md
│
└── .github/
    ├── CONTRIBUTING.md          ← contributor guide
    ├── pull_request_template.md ← PR checklist
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md        ← template for test failures / site defects
    │   └── test_request.md      ← template for requesting new test coverage
    └── workflows/
        └── playwright.yml       ← CI: typecheck → lint → smoke → full suite
```

---

## Architecture

### Page Object Model (POM)

Every page or major section has a dedicated class in `src/pages/`. All classes extend `BasePage` and enforce strict OOP conventions:

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class PricingPage extends BasePage {
  // Locators are readonly class properties — never created inside methods
  readonly planCards: Locator = this.page.locator('[data-testid="plan-card"]');
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /get started/i });

  // Methods represent user actions — never contain expect() calls
  async selectPlan(name: string): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }
}
```

**Rules:**
- Locators are `readonly Locator` properties on the class — never returned from or created inside methods
- Methods are named as user actions: `fillEmail()`, `clickCTA()`, `openMobileMenu()`
- No `expect()` assertions inside any page object method — assertions belong in tests
- Every new page class must be added to `src/fixtures/site.fixture.ts`

### Fixtures

`src/fixtures/site.fixture.ts` extends Playwright's `test` object with pre-built page objects and the loaded `SiteConfig`. All test files import from here:

```typescript
// CORRECT — import from the fixture
import { test, expect } from '@fixtures/site.fixture';

// WRONG — never import directly from @playwright/test
import { test, expect } from '@playwright/test';
```

### Test tags

Every test must carry at least one tag in the test title:

| Tag | Coverage |
|-----|----------|
| `@smoke` | Site reachable, HTTPS, title, no console errors |
| `@navigation` | Nav links, routing, menus, breadcrumbs |
| `@forms` | Field rendering, validation messages, accessibility |
| `@functional` | Business features: pricing, video, accordion, search |
| `@visual` | Screenshot regression with `toHaveScreenshot()` |
| `@responsive` | Viewport-specific layout at mobile/tablet/desktop |
| `@custom` | Site-specific tests generated by the `test-generator` agent |

---

## Running Tests

```bash
npm test                    # Full suite (all browsers + viewports)
npm run test:smoke          # @smoke — fast availability checks
npm run test:navigation     # @navigation — nav links and routing
npm run test:forms          # @forms — form field interactions
npm run test:visual         # @visual — screenshot regression
npm run test:responsive     # @responsive — viewport layout
npm run test:headed         # Open browser visually (debug mode)

npm run baseline            # Regenerate visual snapshots
npm run report              # Open last HTML report in browser
npm run lint                # ESLint check
npm run typecheck           # TypeScript strict-mode check
```

---

## Claude Code Integration

This repo is configured for agentic execution by [Claude Code](https://code.claude.com). Claude reads `CLAUDE.md` (which imports `AGENTS.md`) at the start of every session for persistent project instructions.

### How Claude is configured

| File/Directory | What it does |
|---------------|-------------|
| `CLAUDE.md` | Primary instructions: architecture rules, test conventions, do-nots |
| `AGENTS.md` | Documents available sub-agents and when to delegate to them |
| `Skills.md` | Documents available slash commands and when to use them |
| `.claude/settings.json` | Tool permissions: allowed/denied Bash commands, `autoMemoryEnabled` |
| `.claude/rules/testing.md` | Path-scoped rules loaded when Claude edits `tests/**` |
| `.claude/rules/page-objects.md` | Path-scoped rules loaded when Claude edits `src/pages/**` |
| `.claude/agents/` | Sub-agent definitions: `name`, `description`, `model`, `tools` frontmatter |
| `.claude/commands/` | Slash command definitions (one file per command) |

### Checking Claude Code initialization

A correctly initialized Claude Code project has:
- `CLAUDE.md` at the repo root with build commands, coding standards, and architecture notes
- `.claude/settings.json` with `permissions.allow` and `permissions.deny` lists
- `.claude/rules/` with path-scoped rule files (markdown with `paths:` frontmatter)
- `.claude/agents/` with sub-agent definitions (markdown with YAML frontmatter)
- `.claude/commands/` with slash command definitions

### Slash commands

See `Skills.md` for full documentation.

```
/analyze-site          # Inspect site structure, update site.config.json
/generate-full-suite   # Generate complete POM + tests from scratch
/run-smoke             # Run smoke tests, report results
/update-baseline       # Refresh visual regression baselines
/generate-report       # Generate human-readable test results summary
```

### Sub-agents

See `AGENTS.md` for full documentation.

| Agent | Invoked when |
|-------|-------------|
| `site-analyzer` | Crawling a live site to populate `site.config.json` |
| `test-generator` | Generating Playwright tests from site config |

---

## .github Folder Contents

The `.github/` folder contains repository-level documentation and automation understood by GitHub and by contributors.

### `CONTRIBUTING.md`

The contributor guide. Covers:
- Branch naming conventions: `feature/add-<page>-tests`, `fix/<description>`, `chore/<description>`
- Page Object Model rules with correct vs. incorrect TypeScript examples
- Test writing rules: imports, tagging, URL handling, waiting strategies, form rules
- TypeScript requirements: strict mode, no implicit `any`, `typecheck` before every PR
- Commit message conventions
- CI requirements (what must pass before a PR can merge)
- Claude Code workflow (available slash commands and when to use them)

**All contributors must read `CONTRIBUTING.md` before opening a PR.**

### `pull_request_template.md`

Automatically populates the PR description with a checklist. Verifies:
- TypeScript compiles cleanly (`npm run typecheck`)
- Lint passes (`npm run lint`)
- Smoke tests pass
- POM conventions followed (selectors in page objects, not in test bodies)
- Visual baselines updated if any `@visual` tests changed

### `ISSUE_TEMPLATE/bug_report.md`

Used when reporting a test failure or site defect. Captures:
- Affected test file and tag
- Expected vs. actual behavior
- Steps to reproduce
- Environment (browser, viewport, CI vs. local)
- Screenshot, trace, or `playwright-report` link

### `ISSUE_TEMPLATE/test_request.md`

Used when requesting new test coverage. Captures:
- Page or feature to test
- Why this coverage matters
- Relevant URLs and page paths
- Known selector hints or accessibility attributes

### `workflows/playwright.yml`

GitHub Actions CI pipeline triggered on every push and PR to `main`:

1. **TypeScript check + lint** — all other jobs depend on this passing first
2. **Smoke tests** — fast gate; if smoke fails, the full suite and navigation jobs are skipped
3. **Navigation tests** — runs in parallel after smoke
4. **Full suite** — runs only on push to `main` (not on PRs) to keep PR feedback fast

Test artifacts (HTML reports, screenshots, traces) are retained for 7–30 days.

---

## AGENTS.md

`AGENTS.md` (repository root) documents the Claude Code sub-agents defined in `.claude/agents/`. Claude reads this file alongside `CLAUDE.md` at the start of every session to understand which specialized agents are available and when to delegate work to them.

Sub-agents run in their own context windows with custom system prompts and restricted tool access, keeping the main conversation focused.

### Currently defined agents

| Agent | Definition file | When Claude uses it |
|-------|----------------|---------------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Crawling a live site to populate `site.config.json` |
| `test-generator` | `.claude/agents/test-generator.md` | Generating Playwright tests from site config |

### Adding a new sub-agent

1. Create `.claude/agents/<name>.md` with YAML frontmatter:
   ```yaml
   ---
   name: agent-name
   description: >
     One or two sentences that tell Claude when to delegate to this agent.
   model: sonnet
   tools:
     - Read
     - Write
     - WebFetch
   ---
   ```
2. Write the agent body: role, when to invoke, inputs, outputs, step-by-step instructions
3. Add an entry to `AGENTS.md` (root) describing the agent and its trigger conditions
4. Commit both files — all team members benefit immediately

Sub-agent definition files and `AGENTS.md` are committed to version control and shared across the team.

---

## Skills.md

`Skills.md` (repository root) documents the slash commands available in Claude Code sessions for this project. All command definitions live as markdown files in `.claude/commands/`.

### What Skills.md should contain

- A table of every available slash command with its definition file and one-line description
- Per-command sections explaining: what it does step by step, when to use it, usage example
- Instructions for adding a new skill

### Currently defined skills

| Command | Definition | What it does |
|---------|-----------|-------------|
| `/analyze-site` | `.claude/commands/analyze-site.md` | Crawls the site, updates `site.config.json` |
| `/generate-full-suite` | `.claude/commands/generate-full-suite.md` | Generates complete POM + tests from scratch |
| `/run-smoke` | `.claude/commands/run-smoke.md` | Runs smoke tests and reports pass/fail |
| `/update-baseline` | `.claude/commands/update-baseline.md` | Refreshes visual regression baselines |
| `/generate-report` | `.claude/commands/generate-report.md` | Generates a human-readable results summary |

See `Skills.md` for full per-command documentation.

---

## Visual Regression

Visual tests use Playwright's built-in `toHaveScreenshot()`. Baseline images are stored in `__snapshots__/` and committed to version control.

```bash
# Regenerate all baselines after an intentional design change
npm run baseline

# Via Claude Code
/update-baseline
```

**Always review new screenshots before committing.** CI fails if screenshots differ from committed baselines. Commit updated baselines in the same PR as the design change.

---

## CI/CD

The GitHub Actions workflow in `.github/workflows/playwright.yml` runs on every push and PR to `main`:

| Job | Trigger | What runs |
|-----|---------|-----------|
| TypeScript & Lint | All PRs and pushes | `npm run typecheck` + `npm run lint` |
| Smoke | After lint passes | `npm run test:smoke` on Chromium |
| Navigation | After smoke passes | `npm run test:navigation` on Chromium |
| Full Suite | Push to `main` only | `npm test` on all browsers |

Set the `SITE_URL` repository variable in GitHub Settings → Variables to target a staging environment.

---

## Contributor Rules

### Required before opening a PR

- [ ] `npm run typecheck` — zero TypeScript errors
- [ ] `npm run lint` — zero lint violations
- [ ] At least one test tag on every new test
- [ ] New page classes extend `BasePage` and are registered in `src/fixtures/site.fixture.ts`
- [ ] Visual baselines updated if any `@visual` tests changed

### What NOT to do

| Forbidden | Reason |
|-----------|--------|
| Submit any form | Could trigger real emails or lead capture |
| Create accounts or enter credentials | Never interact with auth flows unless `auth.required: true` |
| Hardcode `https://featured.com` in tests | Always use `baseURL` from Playwright config |
| Call `page.waitForTimeout()` | Use Playwright auto-waiting or `waitForSelector` instead |
| Put `expect()` in page object methods | Assertions belong exclusively in test files |
| Use `any` type without a JSDoc comment | Strict TypeScript is required |
| Commit `__snapshots__/` changes without visual review | Run `/update-baseline` and inspect screenshots first |
| Commit `.env` or `.claude/memory/` files | These are personal and git-ignored for a reason |

### Adding a new page

1. Create `src/pages/<page-name>.page.ts` extending `BasePage`
2. Add the fixture to `src/fixtures/site.fixture.ts`
3. Write tests in `tests/<suite>/<page-name>.spec.ts`
4. Run `npm run typecheck` — must pass with zero errors

### Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| New tests | `feature/add-<page>-tests` | `feature/add-pricing-tests` |
| Bug fix | `fix/<description>` | `fix/nav-link-404-check` |
| Maintenance | `chore/<description>` | `chore/update-playwright` |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | from `site.config.json` | Override the target URL for a run |
| `CI` | unset | Set by GitHub Actions; enables retries, parallel limits, `forbidOnly` |

Copy `.env.example` to `.env.local` for local overrides. `.env.local` is git-ignored.
