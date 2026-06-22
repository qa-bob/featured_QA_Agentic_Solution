# Skills.md — Claude Code Slash Commands

This file documents all slash commands (skills) available when working in this repository with [Claude Code](https://code.claude.com). All skill definitions live as markdown files in `.claude/commands/` and are loaded into Claude's context when you invoke them.

Invoke any skill by typing `/command-name` in a Claude Code session.

---

## Available Skills

| Command | Definition file | Description |
|---------|----------------|-------------|
| `/analyze-site` | `.claude/commands/analyze-site.md` | Crawl the live site and update `site.config.json` |
| `/generate-full-suite` | `.claude/commands/generate-full-suite.md` | Generate complete POM + test suite from scratch |
| `/run-smoke` | `.claude/commands/run-smoke.md` | Run smoke tests and report pass/fail results |
| `/update-baseline` | `.claude/commands/update-baseline.md` | Refresh visual regression baseline screenshots |
| `/generate-report` | `.claude/commands/generate-report.md` | Generate a human-readable test results summary |

---

## /analyze-site

**Definition:** `.claude/commands/analyze-site.md`
**Delegated agent:** `site-analyzer`

Crawls the target website and updates `site.config.json` with discovered structure.

What it does:
1. Navigates to the URL in `site.config.json`, follows all redirects to resolve the canonical URL
2. Extracts `<title>`, `<meta description>`, nav links, headings, CTAs, and forms
3. Attempts to locate a contact page at `/contact`, `/contact-us`, `/get-in-touch`
4. Checks responsiveness at 390px (mobile) viewport
5. Sets flags: `hasContactForm`, `skipVisual`, `skipForms`, `auth.required`
6. Outputs a complete `site.config.json` block and an issues checklist

When to use:
- First-time setup when onboarding this framework to a new site
- After a site redesign when selectors or nav structure may have changed
- When tests are failing because `site.config.json` is out of date
- When `expectedNavItems` is empty and needs to be populated

```
/analyze-site
```

---

## /generate-full-suite

**Definition:** `.claude/commands/generate-full-suite.md`
**Delegated agent:** `test-generator`

Analyzes the site and generates a complete POM + test suite from scratch.

What it does:
1. Reads `site.config.json` (runs `/analyze-site` first if the config looks stale)
2. Fetches the live site to inspect pages, interactive elements, and forms
3. Creates or updates page object classes in `src/pages/`
4. Generates spec files for all suites: smoke, navigation, forms, functional, visual, responsive
5. Registers new page objects in `src/fixtures/site.fixture.ts`
6. Runs `npx tsc --noEmit` to verify TypeScript compiles cleanly
7. Reports what was created, updated, and skipped

When to use:
- Onboarding this framework to a brand-new site
- Rebuilding the test suite after a major site overhaul
- When `tests/custom/` is empty and you want site-specific coverage

```
/generate-full-suite
```

---

## /run-smoke

**Definition:** `.claude/commands/run-smoke.md`

Runs the `@smoke` test suite and produces a plain-English report.

What it does:
1. Executes `npm run test:smoke`
2. Parses `test-results/results.json`
3. Displays a formatted pass/fail table per test
4. For failures: shows the exact error message and a suggested fix
5. Advises whether it is safe to proceed to the full suite or open a PR

When to use:
- Quick sanity check before opening a PR
- After a site deployment to verify availability
- When you want a human-readable summary rather than raw Playwright output

```
/run-smoke
```

---

## /update-baseline

**Definition:** `.claude/commands/update-baseline.md`

Refreshes visual regression baseline screenshots after an intentional design change.

What it does:
1. Runs `npm run baseline` (`playwright test --grep @visual --update-snapshots`)
2. Reports which snapshot files in `__snapshots__/` were added, updated, or removed
3. Reminds you to review each screenshot visually before committing

When to use:
- After an intentional design, layout, font, or color change that makes `@visual` tests fail
- After updating viewport sizes in `playwright.config.ts`
- After any change that intentionally alters the visual appearance of the site

```
/update-baseline
```

> **Important:** Always review new screenshots before `git add __snapshots__/`. Committing unreviewed baselines defeats visual regression testing.

---

## /generate-report

**Definition:** `.claude/commands/generate-report.md`

Reads the most recent test results and produces a structured summary.

What it does:
1. Reads `test-results/results.json` from the last test run
2. Shows a summary table broken down by tag (`@smoke`, `@navigation`, etc.) and browser project
3. Lists all failed tests with error messages and file locations
4. Identifies flaky tests (passed on retry) with retry counts
5. Reports the slowest tests
6. Suggests next steps: fix failures, investigate flakes, update baselines

When to use:
- After running the full test suite to understand coverage and health
- When preparing a status update for stakeholders
- Before cutting a release to confirm all critical paths pass

```
/generate-report
```

---

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`

   Write it as natural-language instructions to Claude describing what to do when the command is invoked:

   ```markdown
   # /<skill-name>

   Short description of what this skill does.

   ## Steps

   1. Read site.config.json to get the target URL.
   2. ...
   3. Report results.

   ## Notes

   - Any edge cases or caveats.
   ```

2. Add an entry to this file (`Skills.md`) in the **Available Skills** table and as a new `## /skill-name` section

3. If the skill delegates to a sub-agent, also:
   - Create `.claude/agents/<agent-name>.md` with YAML frontmatter
   - Add an entry to `AGENTS.md`

4. If the skill runs shell commands not already allowed, update `.claude/settings.json`:
   ```json
   "permissions": {
     "allow": ["Bash(npm run new-command)"]
   }
   ```

5. Commit all changed files — all team members and Claude instances benefit immediately

---

## Related Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Documents sub-agents that skills delegate to |
| `CLAUDE.md` | Primary Claude Code instructions (imports `AGENTS.md`) |
| `.claude/settings.json` | Permissions for the shell commands skills may invoke |
| `.claude/rules/` | Path-scoped coding rules applied during skill execution |
