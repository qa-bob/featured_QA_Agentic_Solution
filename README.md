# Featured — QA Agentic Solution

> Playwright + TypeScript regression test suite for [featured.com](https://featured.com), powered by Claude Code.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Prerequisites](#prerequisites)
3. [Development Setup](#development-setup)
4. [Project Architecture](#project-architecture)
5. [Running Tests](#running-tests)
6. [Claude Code Workflow](#claude-code-workflow)
7. [Contributor Rules](#contributor-rules)

---

## Purpose

This repository is the automated QA framework for **Featured** (https://featured.com), a B2B SaaS content automation platform. It validates every discoverable feature of the public website without requiring account creation or form submission.

**Test coverage goals:**

| Suite | Tag | What it validates |
|-------|-----|-------------------|
| Smoke | `@smoke` | Site loads, HTTPS, title, no console errors |
| Navigation | `@navigation` | Nav links, routing, menus, 404 checks |
| Forms | `@forms` | Field interactions, validation, accessibility |
| Functional | `@functional` | Business features: CTAs, pricing, video, accordions |
| Visual | `@visual` | Screenshot regression at all viewports |
| Responsive | `@responsive` | Layout integrity at mobile, tablet, desktop |

**Tech stack:** Playwright · TypeScript · Page Object Model (POM) · Claude Code

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Git | any | Source control |
| Claude Code | latest | AI-assisted test generation |

---

## Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/<org>/featured_QA_Agentic_Solution.git
cd featured_QA_Agentic_Solution
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

### 4. Verify TypeScript compiles cleanly

```bash
npm run typecheck
```

### 5. Run a smoke check to confirm the site is reachable

```bash
npm run test:smoke
```

### 6. (Optional) Copy the example env file

```bash
cp .env.example .env
```

The `.env` file lets you override the target URL without touching `site.config.json`:

```bash
SITE_URL=https://featured.com
```

---

## Project Architecture

This framework uses the **Page Object Model (POM)** pattern with **OOP** principles. Every distinct page or section is a class that inherits from `BasePage`.

```
featured_QA_Agentic_Solution/
├── site.config.json          # Target URL, flags, nav items
├── playwright.config.ts      # Browsers, viewports, reporters
├── global-setup.ts           # Pre-run reachability check
│
├── src/
│   ├── pages/                # Page Object classes (one per page/section)
│   │   ├── base.page.ts      # BasePage — shared locators and helpers
│   │   ├── home.page.ts      # HomePage
│   │   ├── navigation.page.ts
│   │   └── contact.page.ts
│   ├── fixtures/
│   │   └── site.fixture.ts   # Custom test fixtures (import test from here)
│   ├── utils/
│   │   ├── link-checker.ts
│   │   └── visual-helper.ts
│   └── types/
│       └── site-config.types.ts
│
├── tests/
│   ├── smoke/                # @smoke
│   ├── navigation/           # @navigation
│   ├── forms/                # @forms
│   ├── functional/           # @functional
│   ├── visual/               # @visual
│   └── responsive/           # @responsive
│
├── .claude/
│   ├── agents/               # Claude Code sub-agents (see AGENTS.md)
│   ├── commands/             # Slash commands / skills (see Skills.md)
│   ├── rules/                # Path-scoped coding rules
│   └── settings.json         # Claude Code permissions
│
└── .github/
    ├── workflows/            # CI/CD pipelines
    ├── ISSUE_TEMPLATE/       # Bug report & test request templates
    ├── pull_request_template.md
    └── CONTRIBUTING.md
```

### Page Object Model rules

- Every page or section has its own class in `src/pages/`
- All classes extend `BasePage`
- Locators are `readonly Locator` properties on the class
- Methods represent user actions — no `expect()` inside page objects
- Assertions belong exclusively in test files

### TypeScript rules

- Strict mode is enabled in `tsconfig.json`
- All page object properties must be explicitly typed
- Run `npm run typecheck` before every commit

---

## Running Tests

```bash
# Full suite
npm test

# By tag
npm run test:smoke
npm run test:navigation
npm run test:forms
npm run test:visual
npm run test:responsive

# Headed (visible browser)
npm run test:headed

# Update visual snapshots after intentional design changes
npm run baseline

# Open last HTML report
npm run report

# Lint
npm run lint

# TypeScript check
npm run typecheck
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | from `site.config.json` | Override the target URL |
| `CI` | unset | Set by GitHub Actions; enables stricter settings |

---

## Claude Code Workflow

This repo is designed for **agentic test generation** using Claude Code. The `.claude/` directory contains everything Claude needs to analyze the site and generate or maintain tests autonomously.

### Quick start with Claude Code

```bash
# Open the project in Claude Code
claude

# Analyze the site and update site.config.json
/analyze-site

# Generate a complete test suite from scratch
/generate-full-suite

# Run smoke tests and get a formatted report
/run-smoke

# Generate a detailed results report
/generate-report

# Refresh visual baselines after a redesign
/update-baseline
```

### Claude Code sub-agents

See [AGENTS.md](./AGENTS.md) for full documentation of the sub-agents Claude uses internally.

### Skills and commands

See [Skills.md](./Skills.md) for full documentation of all available slash commands.

---

## Contributor Rules

### What to do

- Read `site.config.json` before writing any test — it controls flags and expected nav items
- Fetch the live site (`WebFetch`) before writing selectors — don't guess at class names
- Write every selector in the page object class, not inline in the test body
- Tag every test with at least one of: `@smoke` `@navigation` `@forms` `@functional` `@visual` `@responsive`
- Run `npm run typecheck && npm run lint` before opening a PR

### What NOT to do

| Forbidden | Reason |
|-----------|--------|
| Submit any form | Could trigger real emails or lead capture |
| Create accounts or enter credentials | Never interact with auth flows |
| Hardcode the base URL | Always use `baseURL` from Playwright config |
| Call `page.waitForTimeout()` | Use Playwright auto-waiting or `waitForSelector` |
| Put `expect()` in page object methods | Assertions belong in test files |
| Use `any` type without justification | Strict TypeScript is required |
| Commit visual snapshots without review | Run `/update-baseline`, inspect screenshots first |

### Branch and PR conventions

- Branch from `main`: `feature/add-pricing-tests`, `fix/nav-link-404`
- One PR per test suite area or feature
- All CI checks must pass before merge
- Reference the relevant page URL in the PR description

### Adding a new page

1. Create `src/pages/<page-name>.page.ts` extending `BasePage`
2. Add the fixture to `src/fixtures/site.fixture.ts`
3. Write tests in `tests/<suite>/<page-name>.spec.ts`
4. Run `npm run typecheck` — must pass with zero errors

---

*This framework is maintained as part of the Phoenix Startup QA Agentic Solutions project.*
