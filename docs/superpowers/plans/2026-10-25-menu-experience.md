# Menu experience implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. The user delegated design decisions, implementation, incremental commits, verification, and a screenshot-rich PR.

**Goal:** Make choosing a campus/date and reading three meals clear, comfortable, accessible, and recoverable after network errors.

**Architecture:** Retain the Expo/React Native shared screen and Firestore boundary. Refine semantic tokens and component hierarchy; add retry to the existing cancellation-safe hook. Verify interactions in the actual web renderer and retain all core regressions.

**Tech stack:** Expo 54, React 19, React Native 0.81, TypeScript, Vitest, browser automation.

**Spec:** `docs/superpowers/specs/2026-10-25-menu-experience-design.md`.

## Global constraints

- Base: develop at caa1b78; branch: feature/menu-experience; PR target: develop.
- Keep Expo web/Android/iOS compatibility, Firestore schema, campus storage, local dates, and ±3 month navigation.
- Keep secrets, production responses, build output, and local tool logs out of commits.
- Do not invent operating hours, nutritional data, or meal availability.
- Use existing Ionicons and logo. Keep semantic color/spacing/type tokens in theme.ts.
- User explicitly delegated design decisions and continuous execution; no additional design/plan approval round.

## Review focus

- Retry during date/campus changes must not display stale data; verify deferred resolution and error recovery.
- Small phone, landscape, and enlarged text must keep menu text and control labels readable; inspect rendered bounding boxes and screenshots.
- Disabled date bounds and selected date/campus must be announced correctly; inspect roles/states and navigate by keyboard.
- Empty responses are unregistered menus, not proof of closed dining; inspect all-empty and partial-empty screens.
- Modal must support close/Escape/back and keyboard return; exercise open/close/focus behavior.

### Task 1: Visual system and accessible navigation

**Files:** theme.ts, styles.ts, CampusToggle.tsx, WeekDatePicker.tsx, MealCard.tsx, MenuScreen.tsx under src/features/menu-screen/; documentation above.

**Interfaces:** Existing campus/date callbacks remain unchanged. MealCard accepts mealType, label, items, optional stretch. theme.ts exports semantic colors, scale tokens, mealTheme.

- [ ] Capture baseline 375px and 1440px screens before product edits.
- [ ] Record failing browser checks for unnamed date arrows / missing selected states before implementation.
- [ ] Implement the chosen mint visual system, reduce nested surfaces, refine responsive layout, and add semantic labels and stable today shortcut.
- [ ] Verify campus switching, date changes, today return, bounds, menu wrapping, and actual rendered roles/states.
- [ ] Run typecheck and core tests; commit this independently working UI improvement.

### Task 2: Recovery and service information

**Files:** useMenuScreen.ts, MenuScreen.tsx, new focused feedback/about components if they simplify responsibilities; tests at the nearest consumer boundary.

**Interfaces:** useMenuScreen returns existing state plus reload(): void. Reload retains current campus/date and reruns cancellation-safe loading. Feedback receives loading/error/onRetry and renders semantic status/alert with a usable button.

- [ ] Demonstrate that an errored request has no retry action before implementation.
- [ ] Add a retry trigger to the existing effect without removing cancellation on dependency changes.
- [ ] Implement loading, empty, partial-empty, and error/retry presentations with honest copy.
- [ ] Refine information modal and links, accessible close control, focus handling, Escape/back behavior.
- [ ] Exercise error recovery, rapid selections, empty states, and modal keyboard navigation in the real browser; commit the passing behavior changes.

### Task 3: Verification evidence and PR

**Files:** docs/ui-review/menu-experience/ screenshots + QA notes; README.md when useful; this plan's evidence.

**Interfaces:** npm test, npm run test:coverage, npm run typecheck, npm run build:web. PR uses repository-rendered screenshot URLs at a pinned commit.

- [ ] Run full tests/coverage/typecheck and production web export. Expected: all tests pass and existing coverage thresholds remain 100% per core file.
- [ ] Check 375px/768px/1440px, landscape, enlarged text, contrast, keyboard focus, reduced motion, and console errors.
- [ ] Capture before/after desktop/mobile and feedback/modal screenshots; label any fixture data.
- [ ] Request a fresh read-only whole-branch review, address substantive findings, and rerun affected checks.
- [ ] Commit review evidence; push feature/menu-experience, create a detailed Korean PR into develop, attach it to this chat, and confirm images render.

## Execution ledger

- Baseline: 13 environment CLI tests + 86 source tests passed. Initial sandbox run could not rename Vitest's temporary SSR cache; the unchanged test suite passed with normal host permissions.
- Working copy was clean. Created feature/menu-experience directly in the existing checkout so installed dependencies and local Firebase config stay available; no additional worktree was needed.
- Browser tooling initially reached a different pre-existing app on port 8082. A dedicated local port is used for this task; no unrelated process is stopped.
