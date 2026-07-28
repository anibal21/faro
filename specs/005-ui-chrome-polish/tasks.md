# Tasks: UI chrome polish

**Input**: Design documents from `/specs/005-ui-chrome-polish/`  
**Branch / feature**: `005-ui-chrome-polish`  
**Decisions baked in**: VS Code–scale ~13px UI; lucide Plus/Minus expanders; Ambientes top menu = Nuevo… + Desconectar todo (always confirm); left rail title Monitor + version footer (context menu unchanged); custom undecorated TitleBar themed with Temas; splash ≥5s dwell.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit and/or integration per Must-Have story; ≥1 E2E outline for splash → menubar → Monitor chrome flow.

**Organization**: Phases by user story (US1–US4). Paths assume Tauri app at repo root (`src/`, `src-tauri/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete deps)
- **[Story]**: US1…US4 for story phases only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and version/API surface available

- [x] T001 Confirm agent context points at `specs/005-ui-chrome-polish/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Verify `@tauri-apps/api` exports used for window + version (`getCurrentWindow`, `getVersion`) are available to the frontend in `package.json` / docs
- [x] T003 [P] Confirm `lucide-react` is present for Plus/Minus icons in `package.json`

**Checkpoint**: Tooling ready; no new heavy deps required

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: App version helper + window decoration config before story UI

**⚠️ CRITICAL**: No user story chrome until this phase is complete

- [x] T004 Create `src/lib/appVersion.ts` wrapping `getVersion()` with safe fallback string (`unknown` / `v?`)
- [x] T005 Set `decorations: false` on the main window in `src-tauri/tauri.conf.json` (custom chrome prerequisite for US3)
- [x] T006 [P] Raise base UI font size to ~13px (VS Code workbench scale) in `src/index.css` and/or `src/styles/theme.css` (keep existing font families)

**Checkpoint**: Version helper works in Tauri; undecorated window config present; base type scale updated

---

## Phase 3: User Story 1 — Readable workbench typography and expand icons (P1) 🎯 MVP

**Goal**: Readable ~13px UI; tree expanders use lucide Plus/Minus icons (not chevron characters).

**Independent Test**: Main UI text reads at IDE scale; expand/collapse shows Plus when collapsed and Minus when expanded.

### Tests

- [x] T007 [P] [US1] Vitest: EnvTreeNav expanders render Plus/Minus (not `>`/`v`) in `tests/unit/env_tree_plus_minus.spec.tsx`
- [x] T008 [P] [US1] Integration outline: base font size / workbench scale noted in `tests/integration/typography_scale.spec.ts` (assert CSS entry or document contract check)

### Implementation

- [x] T009 [US1] Replace chevron text expanders with lucide `Plus`/`Minus` icons in `src/components/catalog/EnvTreeNav.tsx` (env roots + Pods/ConfigMaps sections)
- [x] T010 [P] [US1] Polish expander button hit targets/spacing for icon size in `src/components/catalog/EnvTreeNav.tsx` + dense rules in `src/styles/workspace.css` if needed
- [x] T011 [US1] Sweep remaining primary chrome surfaces still forcing micro `text-xs` where base 13px should apply (`src/components/chrome/AppMenubar.tsx`, `src/views/MainShell.tsx`) without breaking layout

**Checkpoint**: US1 demoable — typography + plus/minus icons

---

## Phase 4: User Story 2 — Simplified Ambientes menu and Monitor rail (P1)

**Goal**: Top Ambientes = Nuevo… + Desconectar todo (always confirm); rail title Monitor + version footer; left context menu unchanged.

**Independent Test**: Ambientes shows exactly two items; confirm always on Desconectar todo; Monitor + version footer; right-click env options unchanged.

### Tests

- [x] T012 [P] [US2] Vitest: AppMenubar Ambientes exposes only Nuevo… and Desconectar todo in `tests/unit/app_menubar_ambientes.spec.tsx`
- [x] T013 [P] [US2] Vitest: EnvTreeNav shows title Monitor and version footer in `tests/unit/monitor_rail_branding.spec.tsx`
- [x] T014 [P] [US2] Integration outline: Desconectar todo always confirms then clears sessions in `tests/integration/disconnect_all_confirm.spec.ts`

### Implementation

- [x] T015 [US2] Slim `src/components/chrome/AppMenubar.tsx` Ambientes menu to **Nuevo…** and **Desconectar todo** only (remove Edit/Delete/Load/Connect/single Disconnect)
- [x] T016 [US2] Wire Desconectar todo with **always-on confirmation** then disconnect all `connectedIds` + `workspace.closeAll` in `src/views/MainShell.tsx` (and/or AppMenubar callbacks)
- [x] T017 [US2] Rename left rail header to **Monitor** in `src/components/catalog/EnvTreeNav.tsx` (do **not** change context menu actions)
- [x] T018 [P] [US2] Render app version footer via `src/lib/appVersion.ts` at bottom of left rail in `src/components/catalog/EnvTreeNav.tsx`

**Checkpoint**: US2 independently demoable

---

## Phase 5: User Story 3 — Theme-colored custom program chrome (P1)

**Goal**: Custom TitleBar (no OS title bar); min/max/close; follows Temas with shell.

**Independent Test**: No classic OS title bar; drag works; Temas flips TitleBar + menubar + Monitor + main together.

### Tests

- [x] T019 [P] [US3] Vitest: TitleBar renders window controls (minimize/maximize/close affordances) in `tests/unit/title_bar.spec.tsx`
- [x] T020 [P] [US3] Integration outline: decorations false + TitleBar mounted from MainShell in `tests/integration/custom_chrome.spec.ts`

### Implementation

- [x] T021 [US3] Create themed `src/components/chrome/TitleBar.tsx` with `data-tauri-drag-region`, title, and min/max/close via `getCurrentWindow()`
- [x] T022 [US3] Mount TitleBar above AppMenubar in `src/views/MainShell.tsx` (and ensure splash/error paths still usable)
- [x] T023 [US3] Ensure TitleBar colors use theme tokens (`bg-card` / CSS variables) so Claro/Oscuro updates chrome with `src/hooks/useTheme.ts` bridge
- [x] T024 [P] [US3] Handle maximize/restore icon state if straightforward in `src/components/chrome/TitleBar.tsx`

**Checkpoint**: US3 independently testable

---

## Phase 6: User Story 4 — Minimum splash dwell (P1)

**Goal**: Splash visible ≥5s from show even if boot finishes early; then main.

**Independent Test**: Fast boot still shows splash ≥5.0s wall clock before MainShell.

### Tests

- [x] T025 [P] [US4] Unit/integration: splash dwell gate waits remaining time after early ready in `tests/unit/splash_dwell.spec.ts` (injectable minMs or fake timers)
- [x] T026 [P] [US4] Update `tests/integration/splash_purge.spec.tsx` expectations for dwell (fake timers / shorter test dwell hook if added)

### Implementation

- [x] T027 [US4] Implement `max(ready, 5s)` gate in `src/App.tsx` (record splash start; after purge/ready, sleep remaining ms)
- [x] T028 [P] [US4] Optional test-only dwell override (e.g. env/`__FARO_SPLASH_MIN_MS`) documented in `specs/005-ui-chrome-polish/contracts/splash-dwell.md` if needed for Vitest speed
- [x] T029 [US4] Preserve error-on-purge behavior (error may show without forcing success path through main) in `src/App.tsx`

**Checkpoint**: US4 independently testable

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: E2E outline, docs, quickstart, leftover sweeps

- [x] T030 Implement E2E outline splash → Ambientes/Monitor/TitleBar in `tests/e2e/ui_chrome_polish_flow.spec.ts`
- [x] T031 [P] Run [quickstart.md](./quickstart.md); note results in `TESTING.md` (005 section)
- [x] T032 [P] Sync AI4Devs `5-historias-de-usuario.md` / `6-tickets-de-trabajo.md` with HU chrome polish + task IDs
- [x] T033 Grep `src/` for leftover Ambientes rail title, chevron expanders, and Ambientes menu orphans; fix
- [x] T034 [P] Visual pass: TitleBar + Monitor + menubar density at 13px in `src/components/chrome/**` and `src/components/catalog/EnvTreeNav.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 → US2 → US3 → US4** → **Polish**
- Foundational **blocks** stories (version helper, decorations, base font)
- US3 depends on T005 decorations; US2 can proceed after US1 icons if preferred sequential on `EnvTreeNav.tsx`
- US4 is mostly `App.tsx` — can parallel after foundational if staffed separately

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| US1 | Phase 2 | Typography + icons MVP |
| US2 | US1 preferred (same EnvTreeNav) | Menu + Monitor branding |
| US3 | Phase 2 (decorations) | TitleBar; can parallel US2 if different owners |
| US4 | Phase 2 | Splash dwell in App.tsx |

### Parallel Opportunities

- T002 ∥ T003 (setup)
- T007 ∥ T008 (US1 tests)
- T012 ∥ T013 ∥ T014 (US2 tests)
- T019 ∥ T020 (US3 tests)
- T025 ∥ T026 (US4 tests)
- T031 ∥ T032 ∥ T034 (polish docs/visual)

### Parallel Example: User Story 2

```bash
Task: "Vitest AppMenubar Ambientes-only in tests/unit/app_menubar_ambientes.spec.tsx"
Task: "Vitest Monitor title + version in tests/unit/monitor_rail_branding.spec.tsx"
Task: "Version footer helper already in src/lib/appVersion.ts"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 + 2  
2. **US1** typography + Plus/Minus → validate  
3. **US2** Ambientes/Monitor  
4. **US3** TitleBar  
5. **US4** splash dwell  
6. Polish E2E + docs  

### Incremental Delivery

Each US checkpoint above is a demo stop.

### Notes

- Do **not** change left context menu actions (clarify)  
- Desconectar todo: confirm **always**  
- Custom chrome: `decorations: false` + TitleBar  
- Next command: `/speckit-implement`
