# Tasks: Professional workspace chrome

**Input**: Design documents from `/specs/004-pro-workspace-chrome/`  
**Branch / feature**: `004-pro-workspace-chrome`  
**Decisions baked in**: shadcn/ui + Tailwind; Menubar Ambientes|Temas; fixed left env tree; label-only select; context menu Edit; full-width logs; foldable analysis drawer below; absorbs unfinished `003-env-tree-nav` UI/runtime as needed.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit and/or integration per Must-Have story; ≥1 E2E for primary menubar → tree edit → logs drawer flow.

**Organization**: Phases by user story (US1–US3). Paths assume Tauri app at repo root (`src/`, `src-tauri/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete deps)
- **[Story]**: US1…US3 for story phases only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tailwind + shadcn toolchain and feature context

- [x] T001 Confirm agent context points at `specs/004-pro-workspace-chrome/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 Initialize Tailwind CSS for Vite in repo root (`package.json`, CSS entry, Vite config per shadcn Vite guide)
- [x] T003 Run shadcn init → `components.json` + CSS variables; set dense radius/spacing defaults in theme CSS
- [x] T004 [P] Add shadcn primitives used by chrome: `menubar`, `dropdown-menu`, `context-menu`, `dialog`, `button`, `input`, `label`, `scroll-area`, `separator`, `resizable`, `tabs`, `collapsible` under `src/components/ui/`

**Checkpoint**: `npm run build` succeeds with empty/smoke import of a `ui/button`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme bridge + shell grid + env-tree/multi-session baseline before story UI

**⚠️ CRITICAL**: No user story chrome until this phase is complete

- [x] T005 Bridge `useTheme` / `data-theme` (or `class="dark"`) to shadcn CSS variables in `src/hooks/useTheme.ts` + `src/styles/theme.css`
- [x] T006 [P] Add dense workspace layout tokens (fixed left nav + main) in `src/styles/workspace.css`
- [x] T007 Audit `003` delivery: if multi-session runtime missing, implement `sessions` map + `instanceId`-scoped connect/catalog/logs per `specs/003-env-tree-nav/contracts/ipc-multi-session.md` in `src-tauri/src/runtime.rs` + `commands/connect.rs` + `src/lib/ipc.ts`
- [x] T008 [P] Ensure frontend can list **all saved** environments (`env_list`) for tree roots in `src/hooks/useEnvironments.ts` (or thin `useEnvTreeData.ts`)

**Checkpoint**: Theme toggles via code; layout CSS ready; env list + connect path usable for tree work

---

## Phase 3: User Story 1 — Program menu and platform visual system (P1) 🎯 MVP

**Goal**: Ambientes | Temas menubar; remove bulky header; dense shadcn look on primary shell/dialogs.

**Independent Test**: Launch → only Ambientes/Temas at top; Temas changes theme and persists; no brand/status/selector strip.

### Tests

- [x] T009 [P] [US1] Vitest: AppMenubar renders Ambientes + Temas only in `tests/unit/app_menubar.spec.tsx`
- [x] T010 [P] [US1] Integration outline: no EnvironmentSelector / ConnectionStatus header in `tests/integration/chrome_menubar.spec.ts`

### Implementation

- [x] T011 [US1] Create `src/components/chrome/AppMenubar.tsx` (Ambientes: Nuevo/Editar/Eliminar + optional connect shortcuts; Temas: Claro/Oscuro → `useTheme`)
- [x] T012 [US1] Refactor `src/views/MainShell.tsx` to mount AppMenubar and remove bulky header (brand strip, ConnectionStatus row, EnvironmentSelector)
- [x] T013 [P] [US1] Restyle `src/components/env/NewEnvironmentModal.tsx` with shadcn `Dialog` / `Input` / `Button` (compact)
- [x] T014 [P] [US1] Replace or restyle `src/components/menus/AmbienteMenu.tsx` / `VerMenu.tsx` usage — Ver removed; logic lives in AppMenubar (delete unused menu components if orphaned)
- [x] T015 [US1] Apply dense typography defaults on shell/body in `src/styles/theme.css` + `src/styles/workspace.css` (text-xs/sm, tight padding)

**Checkpoint**: US1 demoable — professional menubar chrome only

---

## Phase 4: User Story 2 — Precise environment-tree interactions (P1)

**Goal**: Fixed left env tree; label-only select; context menu Conectar/Desconectar + Editar configuración.

**Independent Test**: Label click selects; padding click does not; right-click → Edit opens modal and saves.

### Tests

- [x] T016 [P] [US2] Vitest: label-only select hit target in `tests/unit/env_tree_label_select.spec.tsx`
- [x] T017 [P] [US2] Vitest: context menu includes Editar configuración in `tests/unit/env_tree_context_menu.spec.tsx`

### Implementation

- [x] T018 [US2] Create `src/components/catalog/EnvTreeNav.tsx` (all saved envs; name+cluster; status dots; Pods/ConfigMaps children; chevron ≠ select)
- [x] T019 [US2] Wire EnvTreeNav select/connect/disconnect/edit in `src/views/MainShell.tsx` (fixed left column); open edit via existing modal with `initial` env
- [x] T020 [P] [US2] Add shadcn `ContextMenu` actions on env root in `src/components/catalog/EnvTreeNav.tsx` (Conectar|Desconectar + Editar configuración)
- [x] T021 [US2] Remove `src/components/catalog/AccordionNav.tsx` from chrome (delete or stop importing); ensure catalog leaves still open tabs via `useWorkspaceTabs` with `instanceId` in navKey when multi-session exists
- [x] T022 [P] [US2] Status icon component `src/components/catalog/EnvTreeStatusDot.tsx` (green/yellow/red display-only)

**Checkpoint**: US2 independently demoable with tree + edit

---

## Phase 5: User Story 3 — Full-width logs + foldable below panel (P1)

**Goal**: Logs fill remaining width; analysis in closable/resizable drawer below logs.

**Independent Test**: Open log tab → no right findings column; open/resize/close drawer; analyze opens drawer with findings.

### Tests

- [x] T023 [P] [US3] Vitest: AnalysisDrawer open/close + height state in `tests/unit/analysis_drawer.spec.tsx`
- [x] T024 [P] [US3] Integration outline: log workspace layout (no right rail) in `tests/integration/log_workspace_layout.spec.ts`

### Implementation

- [x] T025 [US3] Create `src/hooks/useAnalysisDrawer.ts` (open/close/height; auto-open on analyze)
- [x] T026 [US3] Create `src/components/logs/AnalysisDrawer.tsx` hosting findings/inspector (migrate from side `FindingPanel`)
- [x] T027 [US3] Create `src/components/logs/LogWorkspace.tsx` with vertical shadcn `Resizable` (logs ScrollArea flex-1 | drawer)
- [x] T028 [US3] Refactor `src/views/LogWindow.tsx` to full-width tabs + LogWorkspace; remove permanent right FindingPanel column grid
- [x] T029 [US3] Wire analyze action to open drawer and render findings in `AnalysisDrawer` / `FindingPanel` composition
- [x] T030 [P] [US3] Compact toolbar/summary styles for log chrome in `src/styles/workspace.css`

**Checkpoint**: US3 independently testable

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: E2E, docs, density pass, 003/004 sync

- [x] T031 Implement primary E2E outline menubar → tree edit → logs drawer in `tests/e2e/pro_chrome_primary_flow.spec.ts`
- [x] T032 [P] Run [quickstart.md](./quickstart.md); note results in `TESTING.md` (004 section)
- [x] T033 [P] Sync AI4Devs `5-historias-de-usuario.md` / `6-tickets-de-trabajo.md` with HU pro chrome + task IDs
- [x] T034 Grep `src/` for EnvironmentSelector, VerMenu, AccordionNav, right finding column leftovers; remove orphans
- [x] T035 [P] Wireframe follow-up (`/speckit-wireframe-generate` + review) if not signed off in `spec.md`
- [x] T036 Visual density pass: reduce leftover spacious padding in `src/components/**` still on old CSS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1 → US2 → US3** → **Polish**
- Foundational **blocks** all stories (esp. T007 if multi-session missing)
- US2 tree should land before or with US3 (MainShell left column); US1 menubar can precede tree but share MainShell — prefer **US1 then US2 then US3** sequentially on `MainShell.tsx`

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|--------|
| US1 | Phase 2 | MVP menubar |
| US2 | US1 (same shell) | Tree replaces accordion in left pane |
| US3 | US2 preferred | Needs main column beside fixed tree |

### Parallel Opportunities

- T004 primitives ∥ after T003
- T009 ∥ T010 (US1 tests)
- T016 ∥ T017 (US2 tests)
- T023 ∥ T024 (US3 tests)
- T013 ∥ T014 after AppMenubar exists
- T032 ∥ T033 ∥ T035 (docs/wireframes)

### Parallel Example: User Story 2

```bash
Task: "Vitest label-only select in tests/unit/env_tree_label_select.spec.tsx"
Task: "Vitest context menu Edit in tests/unit/env_tree_context_menu.spec.tsx"
Task: "EnvTreeStatusDot in src/components/catalog/EnvTreeStatusDot.tsx"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 + 2 (shadcn + theme + env baseline)  
2. **US1** menubar chrome → validate  
3. **US2** env tree + edit  
4. **US3** log drawer  
5. Polish E2E + docs  

### Incremental Delivery

Each US checkpoint above is a demo stop.

### Notes

- Prefer custom/shadcn tree for label-only hits (research); RCT optional  
- No credential exfiltration; Dialog edit = paths only  
- Commit after each task or logical group  
- Next command: `/speckit-implement`
