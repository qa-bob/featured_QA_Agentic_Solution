---
name: Test coverage request
about: Request test coverage for a feature, page, or user flow not currently tested
title: "[TEST] "
labels: enhancement, test-coverage
assignees: ''
---

## Feature or page to test

<!-- What should be tested? Be specific: a page URL, a component, a user flow. -->

**URL or path:** `https://featured.com/<path>`

**Feature:** <!-- e.g., "Pricing page plan selector", "FAQ accordion", "Newsletter signup form validation" -->

## Why this needs coverage

<!-- Is this a regression risk? A recently shipped feature? A critical conversion path? -->

## Test type

<!-- Which suite(s) should this land in? -->

- [ ] `@smoke` — basic availability check
- [ ] `@navigation` — link or routing behavior
- [ ] `@forms` — form field interactions / validation
- [ ] `@functional` — business logic / UI behavior
- [ ] `@visual` — screenshot regression
- [ ] `@responsive` — viewport-specific layout

## Scenarios to cover

<!-- List the specific things to assert. No form submissions. No auth. -->

1.
2.
3.

## Acceptance criteria

<!-- How will we know the tests are good enough? -->

- [ ]
- [ ]

## Notes

<!-- Anything special about this page? Dynamic content, animations, third-party embeds, auth gates? -->
