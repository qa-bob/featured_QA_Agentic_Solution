# Skills.md — Claude Code Slash Commands

This file documents all slash commands (skills) available in this repository. Skills are defined in `.claude/commands/` and loaded automatically by Claude Code.

Invoke any skill by typing `/skill-name` in a Claude Code session, or let Claude invoke it automatically when the task matches the skill's description.

---

## Available Skills

| Command | File | Description |
|---------|------|-------------|
| `/analyze-site` | `.claude/commands/analyze-site.md` | Inspect the live site and populate `site.config.json` |
| `/generate-full-suite` | `.claude/commands/generate-full-suite.md` | Analyze the site and generate a complete POM + test suite |
| `/run-smoke` | `.claude/commands/run-smoke.md` | Run smoke tests and display a pass/fail summary |
| `/update-baseline` | `.claude/commands/update-baseline.md` | Refresh visual regression baseline screenshots |
| `/generate-report` | `.claude/commands/generate-report.md` | Parse test results and display a structured report |

---

## /analyze-site

**Trigger:** Site needs to be inspected or `site.config.json` needs updating.

**What it does:**
1. Navigates to the URL in `site.config.json` (or a URL you provide)
2. Extracts `<title>`, `<meta description>`, nav links, form presence, headings, CTAs
3. Attempts to locate a contact page at `/contact`, `/contact-us`, `/get-in-touch`
4. Checks responsiveness at 390px viewport
5. Outputs a complete `site.config.json` block and an issues checklist

**Usage:**
```
/analyze-site
/analyze-site https://featured.com
```

---

## /generate-full-suite

**Trigger:** New site onboarding, or a major site redesign requiring a fresh test suite.

**What it does:**
1. Reads `site.config.json`
2. Fetches the live site to discover all pages and interactive elements
3. Creates or updates page objects in `src/pages/`
4. Generates test files for all suites: smoke, navigation, forms, functional, visual, responsive
5. Runs `npm run typecheck` to verify TypeScript compiles cleanly

**Usage:**
```
/generate-full-suite
```

---

## /run-smoke

**Trigger:** Quick health check, or smoke gate before deeper test suites.

**What it does:**
1. Runs `npm run test:smoke`
2. Parses `test-results/results.json`
3. Displays a formatted pass/fail table
4. For failures, shows the error and a suggested fix

**Usage:**
```
/run-smoke
```

---

## /update-baseline

**Trigger:** After an intentional visual change (redesign, layout update).

**What it does:**
1. Runs `npm run baseline` (`playwright test --grep @visual --update-snapshots`)
2. Lists all updated baseline files from `__snapshots__/`
3. Reminds you to review screenshots before committing

**Usage:**
```
/update-baseline
```

**Important:** Always review the new screenshots before `git add __snapshots__/`. Committing unreviewed baselines defeats the purpose of visual regression testing.

---

## /generate-report

**Trigger:** After a test run completes and you need a structured summary.

**What it does:**
1. Parses `test-results/results.json`
2. Displays a summary table broken down by tag (`@smoke`, `@navigation`, etc.)
3. Lists all failed tests with error messages
4. Lists flaky tests with retry information
5. Suggests next steps (fix broken links, investigate flakes, update baselines)

**Usage:**
```
/generate-report
```

---

## Adding a New Skill

Create a file at `.claude/commands/<skill-name>.md`. The filename becomes the slash command:

```markdown
# /<skill-name>

Short description of what this skill does.

## Usage

```
/<skill-name> [optional-args]
```

## What this command does

1. Step one...
2. Step two...

## Notes

Any edge cases or caveats.
```

Or use the new skills format at `.claude/skills/<skill-name>/SKILL.md` with frontmatter:

```markdown
---
description: One sentence Claude uses to decide when to invoke this skill automatically.
---

## Instructions

...skill body...
```

Both formats work. Skills in `.claude/skills/` take precedence over `.claude/commands/` if names conflict.

---

## Related

- `AGENTS.md` — sub-agents Claude uses for delegation
- `CLAUDE.md` — primary Claude Code instructions
- `.claude/commands/` — skill definition files
