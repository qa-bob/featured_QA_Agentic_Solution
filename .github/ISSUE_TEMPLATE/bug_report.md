---
name: Bug report — broken test
about: Report a test that is failing, flaky, or producing incorrect results
title: "[BUG] "
labels: bug, test-failure
assignees: ''
---

## Test that is failing

<!-- Paste the full test name including describe block and tag -->

```
Suite:  tests/<suite>/<file>.spec.ts
Test:   <describe block> > <test name>
Tag:    @<tag>
```

## How to reproduce

```bash
npm run test:<suite>
# or
npx playwright test tests/<suite>/<file>.spec.ts
```

## Actual behavior

<!-- What does the test do? Paste the error output. -->

```
Error: <paste error here>
```

## Expected behavior

<!-- What should the test do? -->

## Environment

| Item | Value |
|------|-------|
| Branch | |
| Node version | |
| Playwright version | |
| OS | |
| CI or local | |

## Possible cause

<!-- Optional: do you have a theory about why this is failing? -->

## Screenshots / traces

<!-- Attach `playwright-report/` artifacts or `test-results/` trace files if available. -->
