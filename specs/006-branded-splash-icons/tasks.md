# Tasks: Branded splash and app icons

**Input**: Design documents from `/specs/006-branded-splash-icons/`  
**Branch / feature**: `006-branded-splash-icons`  
**Decisions baked in**: Copy `load_page.png` → `src/assets/splash-load.png`; SplashView full-bleed image, no centered brand/tagline; status/error bottom-right only (image-only OK); window **1400×900** resizable; verify `src-tauri/icons/` + `bundle.icon` (regenerate only if missing); keep 005 dwell gate unchanged.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit and/or integration per Must-Have story; ≥1 E2E outline covering splash visual + window defaults.

**Organization**: Phases by user story (US1–US3). Paths assume Tauri app at repo root (`src/`, `src-tauri/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete deps)
- **[Story]**: US1…US3 for story phases only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and source assets on disk

- [x] T001 Confirm agent context points at `specs/006-branded-splash-icons/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Verify splash source exists at `src-tauri/load-page/load_page.png`
- [x] T003 [P] Verify icon set files exist under `src-tauri/icons/` (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`, `icon.png`)

**Checkpoint**: SpecKit context + source artwork/icons present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Vite-served splash asset ready before SplashView rewrite

**⚠️ CRITICAL**: US1 implementation needs the frontend asset copy

- [x] T004 Create `src/assets/` if missing and copy `src-tauri/load-page/load_page.png` → `src/assets/splash-load.png`
- [x] T005 Confirm `src/App.tsx` splash dwell gate (`getSplashMinMs` / `sleep`) stays unchanged — only SplashView props/visuals may change later (FR-006)

**Checkpoint**: `splash-load.png` importable from frontend; dwell rule preserved

---

## Phase 3: User Story 1 — Branded splash as the loading experience (P1) 🎯 MVP

**Goal**: Full-bleed lighthouse splash; no duplicate centered Faro/tagline; optional status/error bottom-right only.

**Independent Test**: Cold start → branded image fills window; no large centered title overlay; status (if any) bottom-right; after ≥5s dwell → main UI.

### Tests

- [x] T006 [P] [US1] Update `tests/integration/splash_purge.spec.tsx` — stop asserting splash-centered “Faro” / old tagline; assert no `.splash__brand` / `.splash__tagline`; assert splash root present then main workspace after dwell
- [x] T007 [P] [US1] Vitest unit: SplashView has no brand/tagline nodes; status uses bottom-right class; error overrides status — `tests/unit/splash_visual.spec.tsx` (align with `contracts/splash-visual.md`)

### Implementation

- [x] T008 [US1] Rewrite `src/views/SplashView.tsx`: import `src/assets/splash-load.png`; remove `.splash__brand` / `.splash__tagline`; render status/error only when non-empty (prefer image-only when healthy if `App` passes empty/`null` status)
- [x] T009 [US1] Rewrite `src/views/SplashView.css`: full-bleed cover background (or `<img object-fit: cover>`), fallback `#0a192f`, `.splash__status` absolute bottom-right; remove centered overlay layout for brand/tagline
- [x] T010 [P] [US1] Adjust `src/App.tsx` splash props only as needed for FR-003 (e.g. omit default preparing text for image-only healthy boot, or keep short preparing string — must remain bottom-right); do **not** change dwell timing

**Checkpoint**: US1 demoable — branded splash, no duplicate title, SC-005 dwell still holds

---

## Phase 4: User Story 2 — Serious desktop window size on launch (P1)

**Goal**: Default window **1400×900**, still resizable; decorations unchanged (`false`).

**Independent Test**: Fresh launch ≈ 1400×900 (not 1100×720); operator can still resize.

### Tests

- [x] T011 [P] [US2] Vitest/integration: assert `src-tauri/tauri.conf.json` main window `width === 1400`, `height === 900`, `resizable === true` in `tests/unit/window_geometry.spec.ts` (or `tests/integration/window_geometry.spec.ts`)

### Implementation

- [x] T012 [US2] Set main window `width: 1400` and `height: 900` in `src-tauri/tauri.conf.json`; keep `resizable: true` and `decorations: false`

**Checkpoint**: US2 independently verifiable via conf + cold `tauri dev` launch

---

## Phase 5: User Story 3 — Updated application icons (P1)

**Goal**: Packaging/OS identity uses the newly loaded `src-tauri/icons/` set referenced by `bundle.icon`.

**Independent Test**: All `bundle.icon` paths exist; running/packaged app shows new Faro icon artwork.

### Tests

- [x] T013 [P] [US3] Vitest/script-style unit: every path in `tauri.conf.json` `bundle.icon` resolves under `src-tauri/` in `tests/unit/bundle_icons.spec.ts`

### Implementation

- [x] T014 [US3] Audit `src-tauri/tauri.conf.json` `bundle.icon` against files on disk; update paths only if wrong; run `npm run tauri icon` from `src-tauri/icons/icon.png` **only if** required sizes are missing/stale
- [x] T015 [P] [US3] Confirm no stale placeholder icons remain referenced outside `bundle.icon` (quick grep of `src-tauri/` for old icon paths if any)

**Checkpoint**: US3 — icon bundle consistent with new artwork

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Docs, E2E outline, full validation

- [x] T016 [P] E2E outline: splash image → dwell → main + window default size note in `tests/e2e/branded_splash_icons_flow.spec.ts` (or extend existing chrome/splash E2E)
- [x] T017 [P] Sync AI4Devs docs if splash/window/icon stories need a short HU note (`5-historias-de-usuario.md` / related) — only if product docs still describe old gradient splash or 1100×720
- [x] T018 Run `npm test` and `npm run build`; manually spot-check [quickstart.md](./quickstart.md) V1–V3 when `tauri dev` is available
- [x] T019 Mark completed tasks in this `tasks.md` as `[x]` after implement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS US1** (asset copy)
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Can start after Setup (conf-only); parallel with US1/US3 after Phase 1
- **US3 (Phase 5)**: Can start after Setup (icons audit); parallel with US1/US2
- **Polish (Phase 6)**: After desired stories complete

### User Story Dependencies

- **US1 (P1)**: Needs T004 splash asset; no dependency on US2/US3
- **US2 (P1)**: Independent of splash UI (conf only)
- **US3 (P1)**: Independent of splash UI (icons + conf refs)

### Within Each User Story

- Write/update tests first where practical; ensure they fail against current gradient/title splash or old geometry before implementation
- SplashView markup before CSS polish; App props last within US1
- Icon audit before optional `tauri icon` regeneration

### Parallel Opportunities

```text
Phase 1: T002 || T003
Phase 3 tests: T006 || T007
Phase 4/5 after Setup: T011+T012 || T013+T014+T015 (alongside or after US1)
Polish: T016 || T017
```

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "Update tests/integration/splash_purge.spec.tsx for no brand/tagline"
Task: "Add tests/unit/splash_visual.spec.tsx for bottom-right status"

# Then implementation:
Task: "Rewrite SplashView.tsx with splash-load.png import"
Task: "Rewrite SplashView.css cover + bottom-right status"
Task: "Adjust App.tsx splash props only (no dwell change)"
```

---

## Parallel Example: US2 + US3 (after Setup)

```bash
Task: "Set tauri.conf.json window 1400x900 + window assert test"
Task: "Audit bundle.icon paths + bundle_icons.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 (asset copy)
2. Phase 3 US1 (splash visual)
3. **STOP and VALIDATE**: Cold start image + no duplicate title + dwell ≥5s
4. Then US2 window size and US3 icons (quick wins)

### Incremental Delivery

1. Setup + Foundational → asset ready
2. US1 → branded splash MVP
3. US2 → IDE-scale window
4. US3 → icon identity
5. Polish → tests green + quickstart

### Suggested MVP scope

**US1 only** (branded splash). US2/US3 are small config/audit slices and should ship in the same implement pass when capacity allows.

---

## Notes

- Do **not** redesign lighthouse artwork; do **not** change Ambientes/Temas/dwell rule
- Prefer failing packaging over silent wrong icons if a `bundle.icon` path is missing
- Format validation: every task uses `- [x] Tnnn …` with file paths; story tasks include `[USn]`
