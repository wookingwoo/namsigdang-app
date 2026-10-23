# Core regression coverage implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. The user authorized continuous implementation, intermediate commits, verification, and a PR.

**Goal:** Protect date navigation, menu document decoding, and Firebase configuration with deterministic tests and secret-free CI.

**Architecture:** Retain the existing Node tests for the environment-validation CLI. Add Vitest for TypeScript source modules, mocking only external Firebase boundaries. Keep the current UI, Firestore schema, and valid-date behavior; fix a production defect only after a regression test demonstrates it.

**Tech stack:** TypeScript, Node test runner, Vitest with V8 coverage, GitHub Actions.

**Spec:** User request in this chat: create a feature branch following Git Flow, strengthen tests, verify thoroughly, commit incrementally, and open a well-written PR.

## Global constraints

- Base and PR target: develop; branch: feature/test-coverage. Work in the current clean checkout as requested.
- Never include .env, credentials, production responses, or build output in commits.
- Tests must run without Firebase credentials or network access.
- Existing Node 20 deployment tooling remains supported; use a compatible Vitest release.
- Coverage gates apply only to the explicitly listed non-UI source modules, not the whole application.

## Review focus

- Local-calendar behavior at month/year boundaries, leap years, DST, and the inclusive three-month window.
- Short and long date strips must keep the selected date visible; disabled dates remain governed by the existing picker contract.
- Dongjak/Eunpyeong prefixes, month documents, missing/malformed meal values, and read errors.
- Independent results for absent documents: consumers must not mutate a shared empty-day object.
- Firebase initialization cache, existing app reuse, missing config, and development-only diagnostics without leaking values.

### Task 1: Date regression suite and TypeScript harness

Files: package.json, package-lock.json, vitest.config.mts, .gitignore, src/features/menu-screen/date.test.ts.

Interfaces: existing date.ts exports remain the public boundary; npm test runs both existing CLI and new source tests.

- [ ] Install compatible test-only dependencies and configure scoped coverage reporting.
- [ ] Add literal, table-driven cases for formatting, leap/month/year transitions, three-month clamping, and five/seven-day navigation.
- [ ] Run the new suite, reproduce any actual bug before touching production, and keep compatibility for existing picker behavior.
- [ ] Commit the independently passing harness and date tests.

### Task 2: Menu and Firebase regression suites

Files: src/services/menu.test.ts, src/config/firebase.test.ts, scripts/validate-firebase-env.test.js; production fixes limited to reproduced defects.

Interfaces: getMenuByDate(campus, dateKey) returns MenuDay; Firebase functions retain their current signatures.

- [ ] Verify document paths and per-campus/per-meal decoding with complete relevant fixtures; mock only network/initialization boundaries.
- [ ] Cover missing documents/fields, whitespace, malformed values, invalid input, SDK rejection, and independent empty results.
- [ ] Verify cached initialization, existing apps, every missing config field, development/production diagnostics, and retry after failures.
- [ ] Expand CLI parser/precedence/exit-code cases, using isolated temporary folders with guaranteed cleanup.
- [ ] Watch defect regressions fail, make minimal fixes, rerun the full suite, and commit each logical passing unit.

### Task 3: Enforced coverage, CI, documentation, and PR

Files: .github/workflows/test.yml, README.md, final Vitest coverage thresholds.

Interfaces: npm test, npm run test:coverage, npm run typecheck; Node 20/22/24; UTC/Asia/Seoul/America/Los_Angeles.

- [ ] Add credential-free CI checks for supported Node versions, Windows/Linux, and representative time zones.
- [ ] Enforce coverage for date.ts, menu.ts, and firebase.ts; document the precise scope and exclusions.
- [ ] Run clean npm ci, full tests/coverage/typecheck, timezone runs, and web build using local config only.
- [ ] Request one read-only whole-branch review, address substantive findings with regression tests, and commit final changes.
- [ ] Push feature/test-coverage; open and attach a Korean PR targeting develop with reproduction, coverage, validation, and clear limitations.

## Execution evidence

- Baseline: develop 07fc28d; existing Node tests: 3 passed, 0 failed.
- Dependency decision: Vitest 5 requires Node 22+, so use the compatible Vitest 4 line to preserve Node 20 CI support.
