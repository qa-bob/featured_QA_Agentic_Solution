## Summary

<!-- What does this PR do? One to three bullet points. -->

-
-

## Test Coverage

<!-- Which pages or features are now covered? -->

-

## Checklist

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run test:smoke` passes locally
- [ ] Every new test has at least one tag (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`)
- [ ] New locators are in page object classes, not inline in spec files
- [ ] No `page.waitForTimeout()` calls introduced
- [ ] No form submissions (field interactions and validation only)
- [ ] No hardcoded URLs (`baseURL` from Playwright config is used)
- [ ] Visual baseline screenshots reviewed if `@visual` tests were added/changed
- [ ] `__snapshots__/` changes are intentional and reviewed before commit

## Pages / URLs Tested

<!-- List the specific pages this PR touches. -->

| Page | URL |
|------|-----|
| | |

## Related Issues

<!-- Link any issues this PR closes: "Closes #123" -->
