# Tasks: Connection file browse

**Input**: Design documents from `/specs/009-connection-file-browse/`  
**Branch / feature**: `009-connection-file-browse`  
**Decisions baked in**: `@tauri-apps/plugin-dialog` `open()`; no filters; OS-default start folder; cancel leaves field unchanged; Save blocked while Browse broken (cancel ≠ broken); paths only; fixtures + manual entry when healthy.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/file-browse-ui.md](./contracts/file-browse-ui.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; mockable `openPathPicker` for jsdom.

**Organization**: Setup → Foundational (dialog plugin) → US1 (Browse) → US4 (Save block) → US2 (cancel) → US3 (manual/fixtures) → Polish. Paths at repo root (`src/`, `src-tauri/`, `tests/`).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context and npm dialog dependency

- [x] T001 Confirm agent context points at `specs/009-connection-file-browse/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 Add `@tauri-apps/plugin-dialog` to `package.json` and install dependencies
- [x] T003 [P] Add `tauri-plugin-dialog` crate dependency to `src-tauri/Cargo.toml`

**Checkpoint**: npm + Cargo resolve dialog plugin packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Register and authorize the native dialog plugin — MUST complete before Browse UI

**⚠️ CRITICAL**: Blocks US1–US4

- [x] T004 Register `tauri_plugin_dialog::init()` in `src-tauri/src/lib.rs` alongside existing plugins
- [x] T005 Add dialog open permission (e.g. `dialog:allow-open` / `dialog:default`) to `src-tauri/capabilities/default.json`
- [x] T006 Create injectable `openPathPicker()` in `src/lib/fileBrowse.ts` (no filters, single file, OS-default dir; returns absolute path | `null` cancel | throws on failure) per `contracts/file-browse-ui.md`
- [x] T007 [P] Add unit tests for result mapping (path / cancel / throw) in `tests/unit/fileBrowse.test.ts` with injected mock dialog

**Checkpoint**: Dialog plugin wired; `openPathPicker` mockable in Vitest

---

## Phase 3: User Story 1 — Browse PEM and IAM paths (P1) 🎯 MVP

**Goal**: Examinar next to PEM and IAM fills absolute path on selection; save still paths-only.

**Independent Test**: Open modal → Examinar PEM → select file → path shown; same for IAM → Guardar → reopen edit shows same paths.

### Tests

- [x] T008 [P] [US1] Integration: mock picker returns path; Examinar on PEM/IAM updates fields in `tests/integration/env_file_browse.spec.tsx` (or extend `tests/integration/env_crud.spec.tsx`)
- [x] T009 [P] [US1] Assert save payload still contains only path strings (no file body) in `tests/integration/env_file_browse.spec.tsx`

### Implementation

- [x] T010 [US1] Refactor path field rows in `src/components/env/NewEnvironmentModal.tsx` so PEM and IAM have an adjacent **Examinar** button
- [x] T011 [US1] Wire PEM Examinar to `openPathPicker` and set `pemPath` on selection in `src/components/env/NewEnvironmentModal.tsx`
- [x] T012 [US1] Wire IAM Examinar to `openPathPicker` and set `iamCredentialsPath` on selection in `src/components/env/NewEnvironmentModal.tsx`
- [x] T013 [P] [US1] Keep path inputs editable after Browse in `src/components/env/NewEnvironmentModal.tsx` (FR-004)

**Checkpoint**: Browse fills both paths; MVP demoable on desktop

---

## Phase 4: User Story 4 — Block Save while Browse is broken (P1)

**Goal**: Picker failure/unavailable sets `browseBroken`; Guardar disabled with clear message until Browse opens successfully again.

**Independent Test**: Mock throw from picker → Guardar blocked + message; mock open OK (select or cancel) → Guardar enabled again.

### Tests

- [x] T014 [P] [US4] Integration: simulated picker throw disables Guardar and shows message in `tests/integration/env_file_browse.spec.tsx`
- [x] T015 [P] [US4] Integration: recovery (next open succeeds, cancel or select) re-enables Guardar in `tests/integration/env_file_browse.spec.tsx`

### Implementation

- [x] T016 [US4] Add `browseBroken` state and Save disable + Spanish error message in `src/components/env/NewEnvironmentModal.tsx` (FR-010)
- [x] T017 [US4] On picker throw set `browseBroken=true`; on successful open (path or cancel) clear flag in `src/components/env/NewEnvironmentModal.tsx`
- [x] T018 [US4] Ensure typed paths alone cannot bypass Save while `browseBroken` in `src/components/env/NewEnvironmentModal.tsx`

**Checkpoint**: Failure gate matches US4 / SC-006

---

## Phase 5: User Story 2 — Cancel leaves field unchanged (P2)

**Goal**: Dismiss/cancel picker does not clear or change the path field; cancel is not a failure.

**Independent Test**: Pre-fill path → Examinar → Cancel → field unchanged; Guardar still allowed.

### Tests

- [x] T019 [P] [US2] Integration: cancel returns `null`; PEM/IAM field unchanged; Save not blocked in `tests/integration/env_file_browse.spec.tsx`

### Implementation

- [x] T020 [US2] Handle `null` from `openPathPicker` as no-op on field value in `src/components/env/NewEnvironmentModal.tsx`
- [x] T021 [US2] Ensure cancel does not set `browseBroken` in `src/components/env/NewEnvironmentModal.tsx` / `src/lib/fileBrowse.ts`

**Checkpoint**: Cancel semantics match US2

---

## Phase 6: User Story 3 — Manual entry + fixtures when healthy (P2)

**Goal**: Type/paste paths and “Usar fixtures demo” still work when Browse is healthy.

**Independent Test**: With healthy picker, type paths without Browse → save; fixtures button still fills paths.

### Tests

- [x] T022 [P] [US3] Keep/extend `tests/integration/env_crud.spec.tsx` typing PEM/IAM without Browse still saves
- [x] T023 [P] [US3] Unit/integration: fixtures button still sets both paths in `tests/integration/env_file_browse.spec.tsx` or existing modal test

### Implementation

- [x] T024 [US3] Verify `fillDemo` / fixtures path in `src/components/env/NewEnvironmentModal.tsx` unchanged and compatible with Browse UI
- [x] T025 [US3] Confirm healthy-path Save still works with only typed paths (no forced Browse) in `src/components/env/NewEnvironmentModal.tsx`

**Checkpoint**: US3 preserved alongside Browse

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs sync, quickstart pass, security spot-check

- [x] T026 [P] Sync AI4Devs UX note (Browse / Examinar on env form) into `5-historias-de-usuario.md` and/or `6-tickets-de-trabajo.md`
- [x] T027 [P] Update `README.md` or `specs/009-connection-file-browse/quickstart.md` if install steps for dialog plugin differ
- [x] T028 Run `npm test` and fix regressions in `tests/integration/env_crud.spec.tsx` / new browse specs
- [x] T029 Manual desktop pass of [quickstart.md](./quickstart.md) with `npm run tauri dev` (Browse both fields + cancel)
- [x] T030 Spot-check: no PEM/IAM file contents in form state, upsert payloads, or error toasts (SC-004)

**Checkpoint**: Feature ready for `/speckit-implement` completion / review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all stories
- **US1 (Phase 3)**: After Foundational — MVP
- **US4 (Phase 4)**: After US1 (shares modal + picker wiring)
- **US2 (Phase 5)**: After US1 (cancel handling on same controls); can overlap US4 if careful
- **US3 (Phase 6)**: After US1; verify non-regression with US4 Save gate
- **Polish (Phase 7)**: After desired stories complete

### User Story Dependencies

| Story | Depends on | Independently testable |
|-------|------------|------------------------|
| US1 Browse | Phase 2 | Yes — selection fills paths |
| US4 Save block | US1 picker wiring | Yes — mock throw / recover |
| US2 Cancel | US1 Examinar buttons | Yes — null → unchanged |
| US3 Manual/fixtures | US1 (non-breaking) | Yes — type/fixtures save |

### Parallel Opportunities

- T002 + T003 (npm vs Cargo) after T001
- T007 unit tests once T006 API shape exists
- T008 + T009; T014 + T015; T022 + T023 in parallel within their phases
- T026 + T027 docs in parallel during polish

### Parallel Example: User Story 1

```text
Task: T008 Integration browse fills PEM/IAM in tests/integration/env_file_browse.spec.tsx
Task: T009 Assert path-only save payload in tests/integration/env_file_browse.spec.tsx
# Then implement T010–T013 in NewEnvironmentModal.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup  
2. Phase 2 Foundational (dialog plugin + `fileBrowse.ts`)  
3. Phase 3 US1 Browse buttons  
4. **STOP** — validate Examinar on desktop  
5. Then US4 Save block (P1 product rule), then US2/US3 polish stories  

### Incremental Delivery

1. Setup + Foundational → picker callable  
2. US1 → Browse works (MVP)  
3. US4 → failure gate  
4. US2 → cancel correctness  
5. US3 → confirm typing/fixtures  
6. Polish → docs + quickstart  

---

## Notes

- Do **not** add file-type filters or custom `defaultPath` (clarify).
- Do **not** read PEM/IAM file contents into React state.
- Cancel (`null`) ≠ broken; only thrown/unavailable picker sets `browseBroken`.
- Suggested next command: `/speckit-implement`

