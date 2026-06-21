# AGENTS.md — Claude Code Sub-Agents

This file documents the custom Claude Code sub-agents defined in `.claude/agents/`. Claude reads this file alongside `CLAUDE.md` at the start of every session to understand which specialized agents are available and when to delegate work to them.

> **Note for other AI tools:** This file uses the `AGENTS.md` convention. Claude Code reads `CLAUDE.md` as its primary instruction file and imports this file from there. See `CLAUDE.md` for the full project instructions.

---

## Overview

Sub-agents are specialized AI assistants that run in their own context windows with custom system prompts and tool restrictions. Claude delegates work to them when the task matches their description, keeping the main conversation clean.

| Agent | File | When Claude uses it |
|-------|------|---------------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Crawling a live site to populate `site.config.json` |
| `test-generator` | `.claude/agents/test-generator.md` | Generating Playwright test files from config |

---

## site-analyzer

**File:** `.claude/agents/site-analyzer.md`

**Purpose:** Crawls a live website and produces a fully-populated `site.config.json`. Use when onboarding a new site, verifying config accuracy after a redesign, or running `/analyze-site`.

**Capabilities:**
- Navigate pages using headless browser context
- Inspect DOM: text content, attributes, element counts
- Issue HTTP HEAD/GET requests to check link status codes
- Follow redirects and identify the canonical URL
- Set viewport to mobile/tablet/desktop sizes
- Dismiss cookie consent banners

**Key outputs:**
- Completed `site.config.json` with all fields populated
- Issues checklist (missing meta description, broken links, etc.)
- Confidence assessment (High/Medium/Low)

---

## test-generator

**File:** `.claude/agents/test-generator.md`

**Purpose:** Reads a populated `site.config.json` and generates site-specific Playwright test files beyond what the shared framework already covers. Output lands in `tests/custom/`.

**Capabilities:**
- Read and parse `site.config.json`
- Generate valid TypeScript Playwright test files
- Use the custom fixture (`import { test, expect } from '@fixtures/site.fixture'`)
- Apply correct `@tag` to all generated tests
- Follow POM conventions (selectors in page objects, not in spec bodies)

**When Claude invokes it:**
- Site has unique functionality not in the generic suites
- `expectedNavItems` lists pages that need dedicated tests
- Site-specific locators are needed because generic selectors fail
- Writing regression tests for a recently discovered bug

---

## Creating or Modifying Sub-Agents

Sub-agent files live in `.claude/agents/<name>.md` and use YAML frontmatter:

```yaml
---
name: agent-name
description: >
  One or two sentences Claude uses to decide when to delegate here.
  Be specific — vague descriptions cause incorrect delegation.
model: sonnet
tools:
  - Read
  - WebFetch
  - Bash
---

## Role
...instructions...
```

**Frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier; used to invoke with `/agents` |
| `description` | Yes | Claude reads this to decide when to delegate |
| `model` | No | Override model (sonnet, haiku, opus). Default: inherits |
| `tools` | No | Restrict which tools this agent can use |

Commit agent files to version control so the whole team benefits from improvements.

---

## Related

- `CLAUDE.md` — primary Claude Code instructions (imports this file)
- `Skills.md` — slash commands available in this repo
- `.claude/agents/` — agent definition files
