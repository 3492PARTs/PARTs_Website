# Test Coverage Implementation Progress

> **Multi-session document** — Update the "Current Status" section and check off completed items each session before starting work. Run `npm run test:ci` to get fresh metrics.

## How to Use This Document

1. **Start of session**: Run `npm run test:ci` to capture fresh metrics. Update "Current Status" section.
2. **Pick work**: Choose the highest-priority unchecked item from "Remaining Work" below.
3. **End of session**: Check off completed items, update metrics, commit.
4. **Command to run tests**: `CHROME_BIN=/usr/bin/google-chrome-stable ./node_modules/.bin/ng test --no-watch --code-coverage --browsers=ChromeHeadless`

---

## Current Status

*Last updated: 2026-07-25*

### Test Metrics
| Metric | Previous | **Current** | Goal |
|--------|----------|-------------|------|
| Total Tests | 132 | **2002** | — |
| Passing | 64 | **2002** | 2002 |
| Failing | 68 | **0** | 0 |
| Statements | 12.85% | **62.66%** | 100% |
| Branches | 5.7% | **46.5%** | 100% |
| Functions | 6.56% | **58.36%** | 100% |
| Lines | 13.29% | **63.5%** | 100% |

### Coverage by Module (current session)
| Module | Avg% | S% | B% | F% | L% |
|--------|------|----|----|----|-----|
| core/services | 90.0 | 91 | 90 | 88 | 91 |
| shared/pipes | 98.4 | 100 | 94 | 100 | 100 |
| shared/directives | ~100 | — | — | — | — |
| attendance/services | 96.4 | 96 | 100 | 92 | 96 |
| navigation/services | 92.2 | 95 | 88 | 86 | 100 |
| auth/services | 67.9 | 75 | 46 | 75 | 76 |
| scouting/services | 40.4 | 39 | 35 | 48 | 40 |
| user/services | 82.8 | 85 | 60 | 92 | 94 |
| core/utils | 81.1 | 82 | 74 | 87 | 81 |
| core/models | 79.8 | 82 | 80 | 75 | 82 |
| scouting/models | 61.1 | 62 | 58 | 62 | 62 |

---

## Files at 100% Coverage ✅ (49 files — do not revisit)

<details>
<summary>Click to expand full list</summary>

- `admin/components/error-log`
- `admin/components/meetings`
- `admin/components/security`
- `admin/components/team-application-form`
- `admin/components/team-contact-form`
- `admin/components/users`
- `attendance/components/attendance`
- `calendar/components/calendar`
- `navigation/components/sub-navigation`
- `public/components/event-competition`
- `public/components/first`
- `public/components/media/build-season`
- `public/components/media/community-outreach`
- `public/components/media/competition`
- `public/components/media/elements/return-card`
- `public/components/media/media`
- `public/components/media/wallpapers`
- `public/components/resources`
- `scouting/admin/components/manage-field-flow-conditions`
- `scouting/admin/components/manage-field-flows`
- `scouting/admin/components/manage-field-question-aggregates`
- `scouting/admin/components/manage-field-question-conditions`
- `scouting/admin/components/manage-field-questions`
- `scouting/admin/components/manage-pit-question-conditions`
- `scouting/admin/components/manage-pit-questions`
- `scouting/admin/components/manage-pit-responses`
- `scouting/admin/components/users`
- `scouting/components/elements/pit-result-display`
- `scouting/components/strategizing/metrics`
- `shared/components/atoms/box`
- `shared/components/atoms/box-side-nav-wrapper`
- `shared/components/atoms/button`
- `shared/components/atoms/button-ribbon`
- `shared/components/atoms/form`
- `shared/components/atoms/header`
- `shared/components/atoms/loading`
- `shared/components/atoms/main-view`
- `shared/components/atoms/pagination`
- `shared/components/atoms/return-link`
- `shared/components/atoms/tab`
- `shared/components/elements/blue-banners`
- `shared/components/elements/question-form-element`
- `shared/directives/click-inside`
- `shared/directives/click-outside`
- `shared/directives/click-outside-element`
- `shared/directives/full-screen`
- `shared/directives/linkify`
- `shared/directives/on-create`
- `sponsoring/components/sponsoring`

</details>

---

## Remaining Work (prioritized by impact)

Work items are ordered by coverage gap size. Tackle top items first each session.

### 🔴 Priority 1 — Critical Low Coverage (<30%)

- [ ] **`scouting/components/field-scouting`** — 8.5% avg (S:12% B:1% F:11% L:11%)
- [ ] **`shared/components/atoms/whiteboard`** — 9.4% avg (S:15% B:0% F:7% L:15%)
- [ ] **`scouting/components/pit-scouting`** — 13.6% avg (S:19% B:4% F:12% L:19%)
- [ ] **`shared/components/elements/draw-question-svg`** — 14.8% avg (S:20% B:9% F:11% L:19%)
- [ ] **`shared/components/elements/manage-users`** — 20.6% avg (S:32% B:8% F:13% L:29%)
- [ ] **`scouting/components/strategizing/matches`** — 20.8% avg (S:26% B:8% F:22% L:27%)
- [ ] **`scouting/components/strategizing/match-planning`** — 23.9% avg (S:34% B:2% F:27% L:32%)
- [ ] **`scouting/components/elements/dashboard`** — 26.6% avg (S:36% B:8% F:24% L:39%)
- [ ] **`user/components/user/profile`** — 28.9% avg (S:36% B:20% F:26% L:34%)
- [ ] **`sponsoring/components/sponsoring/sponsor-shop`** — 29.4% avg (S:33% B:17% F:39% L:30%)

### 🟠 Priority 2 — Low Coverage (30–55%)

- [ ] **`shared/components/elements/question-aggregate-admin-form`** — 31.8% avg
- [ ] **`shared/components/elements/meeting-attendance`** — 32.6% avg
- [ ] **`shared/components/elements/display-question-svg`** — 36.6% avg (B:0%!)
- [ ] **`shared/components/elements/flow-admin-form`** — 38.3% avg
- [ ] **`shared/components/elements/question-admin-form`** — 39.4% avg
- [ ] **`navigation/components/navigation`** — 39.6% avg
- [ ] **`scouting/admin/components/activity`** — 40.4% avg
- [ ] **`scouting/services`** — 40.4% avg (S:39% B:35% F:48% L:40%)
- [ ] **`shared/components/elements/banners`** — 41.0% avg
- [ ] **`scouting/admin/components/manage-event`** — 41.3% avg
- [ ] **`public/components/recruitment/team-application`** — 43.9% avg
- [ ] **`scouting/components/field-scouting-responses`** — 44.5% avg
- [ ] **`auth/components/login`** — 46.0% avg
- [ ] **`scouting/admin/components/manage-team`** — 51.9% avg (B:0%!)
- [ ] **`scouting/components/elements/scout-pic-display`** — 52.6% avg
- [ ] **`shared/components/elements/flow-condition-admin-form`** — 53.0% avg
- [ ] **`shared/components/elements/question-condition-admin-form`** — 53.3% avg
- [ ] **`scouting/components/pit-scouting-responses`** — 53.3% avg
- [ ] **`shared/components/elements/form-manager`** — 55.5% avg

### 🟡 Priority 3 — Medium Coverage (55–80%)

- [ ] **`shared/components/atoms/table`** — 56.1% avg
- [ ] **`scouting/components/strategizing/team-notes`** — 57.6% avg
- [ ] **`scouting/models`** — 61.1% avg
- [ ] **`scouting/admin/components/manage-match`** — 61.2% avg
- [ ] **`scouting/components/strategizing/alliance-selection`** — 62.1% avg
- [ ] **`public/components/contact`** — 62.9% avg
- [ ] **`auth/services`** — 67.9% avg (B:46%!)
- [ ] **`scouting/components/scouting-portal`** — 67.9% avg
- [ ] **`shared/components/atoms/chart`** — 70.9% avg
- [ ] **`public/components/home`** — 71.5% avg (B:28%!)
- [ ] **`scouting/admin/components/graph-admin-form`** — 72.4% avg
- [ ] **`scouting/admin/components/manage-field-form`** — 73.6% avg
- [ ] **`admin/components/phone-types`** — 75.6% avg
- [ ] **`shared/components/atoms/form-element`** — 76.6% avg
- [ ] **`scouting/admin/components/manage-season`** — 77.4% avg
- [ ] **`admin/components/requested-items`** — 77.4% avg
- [ ] **`admin/components/alert-types`** — 79.0% avg
- [ ] **`core/models`** — 79.8% avg
- [ ] **`core/utils`** — 81.1% avg
- [ ] **`user/services`** — 82.8% avg
- [ ] **`admin/components/user-image-approval`** — 81.8% avg
- [ ] **`shared/components/atoms/side-nav`** — 82.0% avg
- [ ] **`shared/directives/tooltip`** — 83.8% avg (B:60%!)
- [ ] **`public/components/about`** — 84.6% avg (S:69%!)

### 🟢 Priority 4 — High Coverage (80–99%)

- [ ] **`shared/components/atoms/form-element-group`** — 91.3% avg
- [ ] **`public/components/recruitment/electrical`** — 91.9% avg
- [ ] **`public/components/recruitment/impact`** — 91.9% avg
- [ ] **`public/components/recruitment/mechanical`** — 91.9% avg
- [ ] **`scouting/admin/components/schedule`** — 92.1% avg
- [ ] **`navigation/services`** — 92.2% avg
- [ ] **`public/components/recruitment/software`** — 92.2% avg
- [ ] **`shared/components/elements/question-display-form`** — 93.1% avg
- [ ] **`shared/components/atoms/modal`** — 95.4% avg
- [ ] **`shared/components/atoms/tab-container`** — 95.5% avg
- [ ] **`attendance/services`** — 96.4% avg
- [ ] **`scouting/admin/components/manage-field-responses`** — 96.4% avg
- [ ] **`public/components/media/elements/albums`** — 96.9% avg
- [ ] **`shared/pipes`** — 98.4% avg (B:94%)
- [ ] **`core/services`** — 90.0% avg

### ⚫ Not Yet Tracked in Coverage

- [ ] **`app.component`** — not showing in per-file report; verify coverage
- [ ] **`core/helpers/app.initializer`** — verify coverage (spec exists)
- [ ] **`core/helpers/http.interceptor`** — verify coverage (spec exists)
- [ ] **`core/classes/dexie-crud`** — verify coverage (spec exists)
- [ ] **`auth/helpers/auth.guard`** — verify coverage (spec exists)

---

## Infrastructure ✅ (completed, no action needed)

- [x] **karma.conf.js**: Coverage thresholds configured
- [x] **package.json**: `test:ci` and `test:coverage` scripts added
- [x] **TESTING.md**: Comprehensive testing documentation
- [x] **src/test-helpers.ts**: Reusable mock factories for common services
- [x] All spec files created (136/136 source files have spec)
- [x] All tests passing (2002/2002)

---

## Testing Commands

```bash
# Run all tests with coverage (use this to update metrics)
CHROME_BIN=/usr/bin/google-chrome-stable ./node_modules/.bin/ng test --no-watch --code-coverage --browsers=ChromeHeadless

# Development (interactive, watch mode)
npm test

# View HTML coverage report after running tests
open coverage/parts_website/index.html  # macOS
xdg-open coverage/parts_website/index.html  # Linux
```

---

## Architecture Notes

- **Standalone components**: All components use Angular standalone pattern. Tests use `imports: [Component]`, not `declarations`.
- **Test helpers**: Mock factories in `src/test-helpers.ts` — use these instead of creating inline mocks.
- **Scouting service**: Complex; uses Dexie.js IndexedDB and many HTTP endpoints. Prioritize mocking over real calls.
- **general.service.ts**: Contains `eval()` — tests exist but this is a known security risk outside testing scope.
- **Branch coverage** is the weakest metric at 46.5% — prioritize adding `if/else`, `null`, and error path tests.

---

## Known Issues

1. **`scouting/admin/components/manage-team` branches = 0%** — no branch tests at all; needs `if/else` coverage.
2. **`shared/components/elements/display-question-svg` branches = 0%** — same issue.
3. **`shared/components/atoms/whiteboard` branches = 0%** — complex canvas component; may need DOM mocking.
4. **`auth/services` branches = 46%** — auth flows have many untested conditional paths.

---

## Success Criteria

- [ ] All tests pass (`npm run test:ci` exits 0)
- [ ] Statements ≥ 100%
- [ ] Branches ≥ 100%
- [ ] Functions ≥ 100%
- [ ] Lines ≥ 100%
