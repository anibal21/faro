# Tasks: Workspace Delivery Polish

**Input**: Design documents from `/specs/023-workspace-delivery/`  
**Branch / feature**: `023-workspace-delivery`  
**Decisions baked in**: Window min 900×600; sidebar 200–360px; `color_index` 0–9; navKey=`instanceId|…`; max 2 sessions; max 10 configs; demo deletable + fixture restore; NSIS FR-016.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: REQUIRED (constitution + plan) — Vitest for keys/colors/cap/delete/resize prefs; cargo for session cap + demo delete; installer manual/smoke.

**Organization**: Setup → Foundational (DB color + types) → US1…US8 → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm context and inventory

- [X] T001 Confirm agent context points at `specs/023-workspace-delivery/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `windowGeometry.ts`, `EnvTreeNav.tsx`, `useWorkspaceTabs.ts`, `tabKeys.ts`, `connection_instance.rs`, `tauri.conf.json` against [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema/types for colors, caps, and instance-scoped tabs

**⚠️ CRITICAL**: Complete before US4–US7 (and preferred before US5)

- [X] T003 Add `color_index` (0–9) to `connection_instance` schema/migrations and read/write in `src-tauri/src/db/connection_instance.rs` per [data-model.md](./data-model.md)
- [X] T004 Expose `colorIndex` on env IPC types in `src/lib/ipc.ts` and map from Rust env list/upsert responses
- [X] T005 [P] Create `src/lib/envColors.ts` with 10 light/dark color tokens and CSS variables in `src/index.css` / `src/styles/theme.css` per [contracts/env-color-limits.md](./contracts/env-color-limits.md)
- [X] T006 Update `src/hooks/tabKeys.ts` helpers to require `instanceId` prefix in all navKeys per [contracts/multi-session-tabs.md](./contracts/multi-session-tabs.md)
- [X] T007 [P] Add shared constants `MAX_CONNECTIONS = 2` and `MAX_ENV_CONFIGS = 10` in a small module e.g. `src/lib/limits.ts` (and mirror in Rust connect/env commands)

**Checkpoint**: Schema + palette + key helpers compile; no UI stories required yet

---

## Phase 3: User Story 1 — Panel y ventana redimensionables (P1) 🎯 MVP slice

**Goal**: Sidebar drag-resize; window min 900×600; layout stays usable.

**Independent Test**: Cannot shrink window below 900×600; sidebar clamps 200–360px.

### Tests

- [X] T008 [P] [US1] Vitest: sidebar width clamp helpers (200–360) in `tests/unit/sidebar_width.spec.ts`
- [X] T009 [P] [US1] Vitest or unit: `MAIN` min size constants 900×600 still exported / applied path in `tests/unit/window_geometry_min.spec.ts`

### Implementation

- [X] T010 [US1] Call Tauri `setMinSize(900, 600)` (or equivalent) from `src/lib/windowGeometry.ts` when applying main window geometry per [contracts/layout-resize.md](./contracts/layout-resize.md)
- [X] T011 [US1] Replace fixed `w-60` aside with controlled width + drag handle in `src/components/catalog/EnvTreeNav.tsx` and/or `src/views/MainShell.tsx`
- [X] T012 [P] [US1] Persist optional `ui.sidebarWidth` via prefs in `src/hooks/useEnvironments.ts` or prefs helper; restore on load
- [X] T013 [P] [US1] CSS for splitter/handle in `src/styles/workspace.css` / `MainShell.css`

**Checkpoint**: US1 quickstart V1

---

## Phase 4: User Story 2 — Fixtures de prueba ricos (P1)

**Goal**: Demo/fixture data exercises catalog, logs, analyze, configmaps, services, YAML.

**Independent Test**: Connect demo → walk main features with visible sample data.

### Tests

- [X] T014 [P] [US2] Cargo or Vitest smoke: demo hydrate exposes expected sample names (e.g. payments-api) in `src-tauri/src/k8s/catalog.rs` tests or `tests/unit/demo_fixtures.spec.ts`

### Implementation

- [X] T015 [US2] Enrich `hydrate_demo_catalog` / related demo helpers in `src-tauri/src/k8s/catalog.rs` (deployments, pods, services, configmaps) per [contracts/env-delete-fixtures.md](./contracts/env-delete-fixtures.md)
- [X] T016 [P] [US2] Enrich demo log stream / YAML samples in `src-tauri/src/k8s/logs.rs` and deployment YAML helper so analyze has synthetic errors
- [X] T017 [P] [US2] Ensure `fixtures/demo.pem` + `demo-iam-credentials` still resolve via `demo_fixture_paths` in `src-tauri/src/commands/connect.rs`

**Checkpoint**: US2 quickstart V2

---

## Phase 5: User Story 3 — Eliminar configuración + demo restaurable (P1)

**Goal**: Context menu Eliminar (incl. demo); restore via fixtures; no silent re-seed after delete.

**Independent Test**: Delete demo → gone; restore via fixtures → back.

### Tests

- [X] T018 [P] [US3] Cargo: `env_delete` allows `faro-demo` in `src-tauri/src/db/connection_instance.rs` tests
- [X] T019 [P] [US3] Vitest: EnvTreeNav exposes Eliminar and calls onDelete in `tests/unit/env_delete_menu.spec.tsx`

### Implementation

- [X] T020 [US3] Remove demo delete block; stop unconditional `ensure_demo` on every list (use dismiss/restore flag or explicit ensure) in `src-tauri/src/db/connection_instance.rs` per [contracts/env-delete-fixtures.md](./contracts/env-delete-fixtures.md)
- [X] T021 [US3] Add **Eliminar** + confirm; disconnect-if-needed; call `envDelete`; close instance tabs in `src/components/catalog/EnvTreeNav.tsx` + `src/views/MainShell.tsx` / `App.tsx` wiring `useEnvironments.remove`
- [X] T022 [US3] Restore-demo path from “Usar fixtures demo” / ensure in `src/components/env/NewEnvironmentModal.tsx` (or dedicated action) after delete

**Checkpoint**: US3 quickstart V3

---

## Phase 6: User Story 4 — Color de ambiente en árbol y pestañas (P1)

**Goal**: Vertical color bar on env rows; tab border matches env color; 10 colors OK light/dark.

**Independent Test**: Two envs → distinct bars; tabs inherit borders; toggle theme.

### Tests

- [X] T023 [P] [US4] Vitest: `envColors` exports 10 indices and light/dark values in `tests/unit/env_colors.spec.ts`

### Implementation

- [X] T024 [US4] Assign lowest free `color_index` on create in `src-tauri/src/db/connection_instance.rs` / `env_upsert`
- [X] T025 [US4] Render left color rail on env name rows in `src/components/catalog/EnvTreeNav.tsx`
- [X] T026 [US4] Apply env color border/accent on tabs in `src/views/LogWindow.tsx` using tab `colorIndex`

**Checkpoint**: US4 quickstart V4

---

## Phase 7: User Story 5 — Multi-conexión y pestañas por ambiente (P1)

**Goal**: Same resource name in two connected envs → two tabs; focus-on-open; disconnect closes only that env’s tabs.

**Independent Test**: Connect A+B; open same deploy on both → two tabs with separate context.

### Tests

- [X] T027 [P] [US5] Vitest: navKeys differ by `instanceId` for same ns/name in `tests/unit/tab_keys_instance.spec.ts`
- [X] T028 [P] [US5] Vitest: opening second instance same deploy does not reuse first tab in `tests/unit/workspace_tabs_multi_env.spec.tsx`

### Implementation

- [X] T029 [US5] Thread `instanceId` (+ color) through openDeployment/openPod/openConfigMap/openService in `src/hooks/useWorkspaceTabs.ts`; set focus to that instance before logs/catalog IPC
- [X] T030 [US5] Pass `instanceId` from `EnvTreeNav` / `MainShell` into workspace open handlers; ensure tree select focuses session in `src/hooks/useConnection.ts`
- [X] T031 [US5] On disconnect, close only tabs for that `instanceId` in `src/hooks/useWorkspaceTabs.ts` / `MainShell.tsx` (not blanket closeAll if other sessions remain)
- [X] T032 [P] [US5] Optional harden: accept `instance_id` on `logs_open` in `src-tauri/src/commands/logs.rs` if focus races appear

**Checkpoint**: US5 quickstart V5

---

## Phase 8: User Story 6 — Máximo dos conexiones (P1)

**Goal**: Third connect blocked with Spanish modal; Rust authoritative.

**Independent Test**: A+B connected → C shows modal; after disconnect one, C works.

### Tests

- [X] T033 [P] [US6] Cargo: third distinct `env_connect` fails when two sessions exist in `src-tauri/src/commands/connect.rs` tests
- [X] T034 [P] [US6] Vitest: connection-limit modal renders copy in `tests/unit/connection_cap.spec.tsx`

### Implementation

- [X] T035 [US6] Enforce max 2 sessions in `src-tauri/src/commands/connect.rs` per [contracts/connection-cap.md](./contracts/connection-cap.md)
- [X] T036 [US6] FE pre-check + `ConnectionLimitModal` in `src/components/env/ConnectionLimitModal.tsx`; wire from `MainShell` / `useConnection`
- [X] T037 [P] [US6] Map backend limit error to same modal in `src/hooks/useConnection.ts`

**Checkpoint**: US6 quickstart V6

---

## Phase 9: User Story 7 — Máximo 10 configuraciones (P1)

**Goal**: 11th create rejected; colors stay within 0–9.

**Independent Test**: 10 configs OK; 11th message; colors still distinct.

### Tests

- [X] T038 [P] [US7] Cargo: upsert create fails at count≥10 in `src-tauri/src/db/connection_instance.rs` or env command tests
- [X] T039 [P] [US7] Vitest: FE surfaces max-config error message in `tests/unit/env_config_cap.spec.tsx`

### Implementation

- [X] T040 [US7] Enforce max 10 on create in `src-tauri/src/commands/env.rs` / `connection_instance.rs` per [contracts/env-color-limits.md](./contracts/env-color-limits.md)
- [X] T041 [US7] Show clear Spanish error in `NewEnvironmentModal` / `useEnvironments` on limit

**Checkpoint**: US7 quickstart V7

---

## Phase 10: User Story 8 — Instalador temático Faro (P2)

**Goal**: NSIS branded per FR-016.

**Independent Test**: Built NSIS shows Faro, Aníbal Rodríguez, MIT, ES, shortcuts.

### Tests

- [X] T042 [P] [US8] Assert `tauri.conf.json` contains publisher / nsis language / license path keys in `tests/unit/nsis_faro_config.spec.ts`

### Implementation

- [X] T043 [US8] Configure `bundle` / `windows.nsis` in `src-tauri/tauri.conf.json` per [contracts/nsis-faro.md](./contracts/nsis-faro.md) (publisher, copyright 2026, MIT license file, Spanish, Desktop+Start, icons, brand color)
- [X] T044 [P] [US8] Ensure root `LICENSE` (MIT) exists or is referenced for the installer
- [X] T045 [US8] Document build/verify steps in `tests/e2e/package_smoke.md` or [quickstart.md](./quickstart.md) V8

**Checkpoint**: US8 installer smoke

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T046 Run full [quickstart.md](./quickstart.md) V1–V8 manually
- [X] T047 [P] Add HU27 (or next) notes to `5-historias-de-usuario.md` and `6-tickets-de-trabajo.md` for 023
- [X] T048 [P] Update `TESTING.md` with multi-env tab / connection cap / Eliminar checks
- [X] T049 Fix regressions in existing menubar/keepalive tests if props/APIs changed
- [X] T050 Mark feature ready for `/speckit-implement` completion review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (blocks US4–US7; US5 needs T006)
- **US1** can start after Setup (parallel with Foundational late tasks if careful)
- **US2** ∥ **US3** after Foundational (US3 touches demo seed)
- **US4** after T003–T005
- **US5** after T006 + US4 color on tabs preferred
- **US6** after Foundational limits constant; can ∥ US5
- **US7** after T003 color assignment
- **US8** independent after Setup
- **Polish** last

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Setup |
| US2 | Setup |
| US3 | Foundational demo policy |
| US4 | T003–T005 |
| US5 | T006 + focus wiring; benefits from US4 |
| US6 | T007 |
| US7 | T003 + T007 |
| US8 | Setup only |

### Parallel Opportunities

- T008 ∥ T009; T014 ∥ T016 ∥ T017; T018 ∥ T019; T023 alone then T025 ∥ T026; T027 ∥ T028; T033 ∥ T034; T038 ∥ T039; T042 ∥ T044; T047 ∥ T048

---

## Parallel Example: User Story 5

```text
Task: T027 Vitest tab_keys_instance.spec.ts
Task: T028 Vitest workspace_tabs_multi_env.spec.tsx
Task: T029 useWorkspaceTabs instanceId threading
Task: T030 MainShell/EnvTreeNav focus-on-open
Task: T031 disconnect closes only that instance tabs
```

---

## Implementation Strategy

### MVP First

1. Foundational (T003–T007)  
2. **US5 + US6** (multi-tab + cap 2) — highest delivery risk  
3. US4 colors + US1 resize  
4. US3 Eliminar + US2 fixtures  
5. US7 cap 10  
6. US8 installer  

### Suggested MVP for first demo slice

**T001–T007 + T027–T037** (foundation + multi-env tabs + connection cap). Then colors/resize/delete/fixtures/installer.

### Notes

- Prefer focus-then-IPC MVP; T032 only if races appear  
- Do not re-enable immortal demo via `list_all` after user delete  
- Keep keepalive/ACL/Help Seguridad untouched unless wiring conflicts  
