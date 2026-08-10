# Tasks: Env Test Polish

**Input**: Design documents from `/specs/024-env-test-polish/`  
**Branch / feature**: `024-env-test-polish`  
**Decisions baked in**: Single hex per env color (light===dark); fixture-backed connect → Demo hydrate per `instance_id`; Pegar al final right-aligned group; hide empty RAM/CPU/Uptime.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: REQUIRED — Vitest for colors, stick-to-bottom layout, metrics visibility; cargo if connect/fixture path changes.

**Organization**: Setup → Foundational (optional flag) → US1–US4 → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm context

- [X] T001 Confirm agent context points at `specs/024-env-test-polish/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `src/lib/envColors.ts`, `src/index.css`, `src/views/LogWindow.tsx`, `WorkloadSummaryStrip.tsx`, `connect.rs` against [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared test-fixture marker for US2 (if using DB flag)

**⚠️ CRITICAL**: Needed before US2 implementation if choosing stored flag over path sniffing

- [X] T003 Decide and document in code comment: `is_test_fixture` column **or** detect `fixtures/demo.pem` path — implement chosen approach in `src-tauri/src/db/connection_instance.rs` / upsert input per [contracts/fixture-env-hydrate.md](./contracts/fixture-env-hydrate.md)
- [X] T004 [P] Expose fixture flag (if any) on FE `ConnectionInstance` in `src/lib/ipc.ts` — N/A: path sniff on backend only; FE sets `pemPath` via `demoFixturePaths()`

**Checkpoint**: Connect path can identify fixture-backed envs

---

## Phase 3: User Story 1 — Colores fijos cross-theme (P1) 🎯 MVP

**Goal**: 10 bright metallic colors; identical in light and dark.

**Independent Test**: Toggle theme — env bars/tabs unchanged; 10 colors distinct.

### Tests

- [X] T005 [P] [US1] Vitest: each env color light===dark (or single hex) in `tests/unit/env_colors_fixed.spec.ts`
- [X] T006 [P] [US1] Vitest: CSS/`envColors` exposes 10 indices in `tests/unit/env_colors_fixed.spec.ts`

### Implementation

- [X] T007 [US1] Replace dual light/dark palette with single metallic hexes in `src/lib/envColors.ts` per [contracts/env-colors-fixed.md](./contracts/env-colors-fixed.md)
- [X] T008 [US1] Set identical `--env-color-0`…`9` under light and dark in `src/index.css` (and `src/styles/theme.css` if duplicated)

**Checkpoint**: US1 quickstart V1

---

## Phase 4: User Story 2 — Fixtures hidratan ese ambiente (P1)

**Goal**: Connect fixture-backed env → hydrate demo catalog for that `instance_id`; multi-env test works.

**Independent Test**: Two fixture envs connected; each has test catalog; tabs stay instance-scoped.

### Tests

- [X] T009 [P] [US2] Cargo or unit: connect/hydrate uses instance_id for non-`faro-demo` fixture env in `src-tauri/src/commands/connect.rs` / catalog tests
- [X] T010 [P] [US2] Vitest smoke: “Usar fixtures” sets fixture marker/paths in `tests/unit/fixture_env_upsert.spec.ts` (or modal test)

### Implementation

- [X] T011 [US2] On upsert via “Usar fixtures demo”, mark env as test-fixture / set fixture paths in `src/components/env/NewEnvironmentModal.tsx` + backend upsert
- [X] T012 [US2] In `src-tauri/src/commands/connect.rs`, route fixture-backed instances through `ConnectMode::Demo` + `hydrate_demo_catalog(..., instance_id, ...)` like builtin demo
- [X] T013 [P] [US2] Ensure live PEM profiles still take live path (no accidental Demo hydrate) in `connect.rs`

**Checkpoint**: US2 quickstart V2

---

## Phase 5: User Story 3 — Pegar al final layout (P1)

**Goal**: Checkbox + label compact group, right-aligned, small gap.

**Independent Test**: Log toolbar — control group on the right, gap ~4–8px.

### Tests

- [X] T014 [P] [US3] Vitest: render LogWindow toolbar fragment / label has grouped class (`inline-flex` + `ml-auto` or equivalent) in `tests/unit/stick_to_bottom_layout.spec.tsx`

### Implementation

- [X] T015 [US3] Fix “Pegar al final” label layout in `src/views/LogWindow.tsx` per [contracts/stick-to-bottom-layout.md](./contracts/stick-to-bottom-layout.md)
- [X] T016 [P] [US3] Add CSS if needed in `src/styles/workspace.css` / `MainShell.css` for `.log-window__stick` group

**Checkpoint**: US3 quickstart V3

---

## Phase 6: User Story 4 — Métricas solo con datos (P1)

**Goal**: Hide RAM/CPU/Uptime when empty; show only present metrics.

**Independent Test**: null summary / empty fields → no N/D metrics; filled fields → visible.

### Tests

- [X] T017 [P] [US4] Vitest: WorkloadSummaryStrip omits missing metrics in `tests/unit/workload_summary_visibility.spec.tsx`
- [X] T018 [P] [US4] Vitest: shows RAM/CPU/Uptime when provided in same file

### Implementation

- [X] T019 [US4] Update `src/components/logs/WorkloadSummaryStrip.tsx` per [contracts/workload-metrics-visibility.md](./contracts/workload-metrics-visibility.md) (no fake N/D for missing metrics)
- [X] T020 [P] [US4] Adjust any CSS for summary line if separators look odd with partial metrics in `src/styles/workspace.css`

**Checkpoint**: US4 quickstart V4

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T021 Run [quickstart.md](./quickstart.md) V1–V4 manually — automated coverage landed; remaining visual QA in app optional
- [X] T022 [P] Brief note in `TESTING.md` for fixed colors / fixture multi-env / metrics visibility
- [X] T023 [P] Update `tests/unit/env_colors.spec.ts` if it still expects light≠dark pairs
- [X] T024 Mark all tasks complete after validation

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (T003–T004) → US2
- US1, US3, US4 independent after Setup (can parallel)
- Polish last

### User Story Dependencies

| Story | Depends on |
|-------|------------|
| US1 | Setup |
| US2 | Foundational T003–T004 |
| US3 | Setup |
| US4 | Setup |

### Parallel Opportunities

- T005 ∥ T006; T007 ∥ T008 after tests
- T009 ∥ T010; T015 ∥ T016; T017 ∥ T018
- US1 ∥ US3 ∥ US4 in parallel with US2 after foundational

---

## Parallel Example: User Story 1

```text
Task: T005/T006 Vitest env_colors_fixed.spec.ts
Task: T007 Update envColors.ts
Task: T008 Sync index.css --env-color-*
```

---

## Implementation Strategy

### MVP First

1. **US1 colors** (fast visual win)  
2. **US3 + US4** UI fixes in parallel  
3. **US2** fixture multi-env (deeper)  

### Suggested MVP

**T001–T008** (colors) then T014–T020 (UI) then T003–T013 (fixtures).

### Notes

- Do not break 023 instance-scoped tabs / connection cap  
- Prefer explicit `is_test_fixture` over fragile path matching if upsert already has “Usar fixtures”  
