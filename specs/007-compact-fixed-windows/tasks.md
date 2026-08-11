# Tasks: Compact fixed windows

**Input**: Design documents from `/specs/007-compact-fixed-windows/`  
**Branch / feature**: `007-compact-fixed-windows`  
**Decisions baked in**: Splash **576×324** fixed + centered; main **900×600** centered (clamp to work area); single-window resize lifecycle; supersede 1400×900; keep dwell + splash art.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution.

**Organization**: US1 splash geometry, US2 main geometry.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Confirm agent context points at `specs/007-compact-fixed-windows/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Confirm `@tauri-apps/api` window APIs (`setSize`, `center`, `setResizable`, `currentMonitor`) available in `package.json`

---

## Phase 2: Foundational

- [x] T003 Add window geometry permissions to `src-tauri/capabilities/default.json` (`core:window:allow-set-size`, `allow-set-resizable`, `allow-center`, `allow-current-monitor`)
- [x] T004 Create `src/lib/windowGeometry.ts` with splash/main constants (576×324, 900×600), `clampToWorkArea`, `applySplashWindowGeometry`, `applyMainWindowGeometry`

**Checkpoint**: Helper + permissions ready

---

## Phase 3: User Story 1 — Compact centered splash (P1) 🎯 MVP

**Goal**: Cold start opens small fixed centered splash 576×324.

**Independent Test**: `tauri dev` → splash ~576×324, centered, not resizable.

### Tests

- [x] T005 [P] [US1] Update `tests/unit/window_geometry.spec.ts` — conf width 576, height 324, resizable false, center true; assert helper splash constants
- [x] T006 [P] [US1] Unit: `clampToWorkArea` never exceeds work area − margin in `tests/unit/window_geometry_clamp.spec.ts`

### Implementation

- [x] T007 [US1] Set `tauri.conf.json` main window to width 576, height 324, resizable false, center true (keep decorations false)
- [x] T008 [P] [US1] Call `applySplashWindowGeometry()` early in `src/App.tsx` boot (ensure fixed/centered)

**Checkpoint**: Splash compact on cold start

---

## Phase 4: User Story 2 — Main 900×600 (P1)

**Goal**: On ready, grow to 900×600 (clamped), center, allow resize.

**Independent Test**: After dwell → window ~900×600 centered; resizable; fits laptop screens.

### Tests

- [x] T009 [P] [US2] Assert MAIN_WIDTH/HEIGHT 900×600 and applyMain wired in App via `tests/e2e/compact_windows_flow.spec.ts`

### Implementation

- [x] T010 [US2] On phase → ready in `src/App.tsx`, await `applyMainWindowGeometry()` before showing MainShell (keep dwell gate)
- [x] T011 [P] [US2] Keep splash size on error phase (do not apply main geometry on boot error)

**Checkpoint**: Splash→main transition works

---

## Phase 5: Polish

- [x] T012 [P] Sync HU1 size note in `5-historias-de-usuario.md` if needed
- [x] T013 Run `npm test` and `npm run build`
- [x] T014 Mark all tasks `[x]` in this file

---

## Dependencies

- Setup → Foundational → US1 → US2 → Polish
- US2 depends on T004 helper

## MVP

US1 (splash size in conf) alone already fixes “opens huge”; US2 completes transition.
