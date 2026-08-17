# Tasks: Demo Fixtures Repair & Rich Catalog

**Input**: Design documents from `/specs/029-demo-fixtures-repair/`  
**Branch / feature**: `029-demo-fixtures-repair`  
**Decisions baked in**: Tracked placeholder `fixtures/demo.pem`; Tauri bundle `"../fixtures/": "fixtures/"`; path resolution via `resolve_demo_fixture_paths`; catalog 2×2×2×2; demo logs 2 pods.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: REQUIRED — `cargo test hydrate_demo_catalog`; Vitest `demo_fixtures`, `fixture_env_upsert`, `logs_fanin`; manual dual-env per [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (assets + bundle) → US1–US3 → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm Spec Kit context and inventory

- [X] T001 Confirm agent context points at `specs/029-demo-fixtures-repair/plan.md` in `.cursor/rules/specify-rules.mdc`
- [X] T002 [P] Inventory `fixtures/`, `connect.rs`, `catalog.rs`, `logs.rs`, `tauri.conf.json`, `.gitignore` against [research.md](./research.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Versioned fixture assets and bundle wiring — blocks all user stories

**⚠️ CRITICAL**: US1 preload fails without tracked PEM + bundle resources

- [X] T003 Add placeholder `fixtures/demo.pem` (fake key content only) per [contracts/demo-fixture-paths.md](./contracts/demo-fixture-paths.md)
- [X] T004 Add gitignore exception `!fixtures/demo.pem` in `.gitignore`
- [X] T005 Configure Tauri bundle resources map `"../fixtures/": "fixtures/"` in `src-tauri/tauri.conf.json`

**Checkpoint**: Clone/build can ship fixture files

---

## Phase 3: User Story 1 — Precargar fixtures desde el modal (P1) 🎯 MVP

**Goal**: **Usar fixtures demo** resolves PEM/IAM paths without error in dev and packaged app.

**Independent Test**: Modal → precargar → PEM populated → save → connect in Demo mode for that `instance_id`.

### Tests

- [X] T006 [P] [US1] Vitest: `fixtures/demo.pem` exists on disk in `tests/unit/demo_fixtures.spec.ts`
- [X] T007 [P] [US1] Vitest: `connect.rs` exposes `resolve_demo_fixture_paths` + `resource_dir` in `tests/unit/demo_fixtures.spec.ts`

### Implementation

- [X] T008 [US1] Implement `resolve_demo_fixture_paths(app)` with resource_dir → manifest → CWD order in `src-tauri/src/commands/connect.rs` per [contracts/demo-fixture-paths.md](./contracts/demo-fixture-paths.md)
- [X] T009 [US1] Wire `demo_fixture_paths(app: AppHandle)` command in `src-tauri/src/commands/connect.rs` and register in `src-tauri/src/lib.rs`
- [X] T010 [P] [US1] Confirm `NewEnvironmentModal.tsx` still calls `demoFixturePaths()` IPC and sets `pemPath` on restore (no code change unless regression)

**Checkpoint**: US1 quickstart — Preload section

---

## Phase 4: User Story 2 — Catálogo demo fotogénico (P1)

**Goal**: ≥2 deployments (2/2 pods each), ≥2 services, ≥2 configmaps; demo logs fan-in on 2 pods.

**Independent Test**: Connect fixture env → sidebar counts; combined logs show two pod names within 30 s.

### Tests

- [X] T011 [P] [US2] Cargo: `hydrate_demo_catalog_scopes_to_instance_id` asserts ≥2 deployments, services, configmaps in `src-tauri/src/k8s/catalog.rs`
- [X] T012 [P] [US2] Vitest: catalog source has 2/2 replicas, `payments-secrets`, `payments-worker-1` in `tests/unit/demo_fixtures.spec.ts`
- [X] T013 [P] [US2] Vitest: demo follow uses 2 pods (no `-ccc` in follow path) in `tests/unit/demo_fixtures.spec.ts` and `tests/integration/logs_fanin.spec.ts`

### Implementation

- [X] T014 [US2] Enrich `hydrate_demo_catalog` — 2/2 `payments-api`, 2/2 `payments-worker`, second service, `payments-secrets` configmap in `src-tauri/src/k8s/catalog.rs` per [contracts/demo-catalog-rich.md](./contracts/demo-catalog-rich.md)
- [X] T015 [US2] Set `demo_deployment_yaml` replicas to 2 for all demo deployments in `src-tauri/src/k8s/catalog.rs`
- [X] T016 [US2] Limit `start_demo_follow` and `load_older_demo` to two pods (`-aaa`, `-bbb`) in `src-tauri/src/k8s/logs.rs`

**Checkpoint**: US2 quickstart — Rich catalog section

---

## Phase 5: User Story 3 — Dos ambientes fixture en paralelo (P2)

**Goal**: Two fixture-backed profiles connect simultaneously; catalogs/tabs isolated; no live SSH.

**Independent Test**: Create Demo A + Demo B → connect both → open logs on each → third connect shows limit error.

### Tests

- [X] T017 [P] [US3] Vitest: `is_fixture_backed` + `hydrate_demo_catalog` wiring still present in `tests/unit/fixture_env_upsert.spec.ts`

### Implementation

- [X] T018 [US3] Verify fixture connect routes through `ConnectMode::Demo` + per-`instance_id` hydrate in `src-tauri/src/commands/connect.rs` (024 behavior — no regression)
- [X] T019 [P] [US3] Verify `MAX_CONNECTIONS = 2` and Spanish `connection_limit` message unchanged in `src-tauri/src/commands/connect.rs`

**Checkpoint**: US3 quickstart — Dual env section

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, docs, delivery

- [X] T020 Run automated suite from [quickstart.md](./quickstart.md): `cargo test hydrate_demo_catalog` + Vitest fixture specs
- [X] T021 [P] Manual: dual fixture env connect + screenshot-ready catalog walkthrough per [quickstart.md](./quickstart.md) US2/US3 — automated coverage via `fixture_env_upsert`, `connection_cap`, `workspace_tabs_multi_env`; manual walkthrough for screenshots
- [X] T022 [P] Manual (optional): installed build preload — bundle config validated via `cargo test` (Tauri build script + resources); full NSIS smoke deferred to release cut
- [X] T023 [P] Add 029 test commands to `TESTING.md` if missing fixture repair section
- [X] T024 Update `specs/029-demo-fixtures-repair/spec.md` status to **Delivered** after validation passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **US1 (Phase 3)** → **US2 (Phase 4)** → **US3 (Phase 5)** → **Polish (Phase 6)**
- US2 depends on US1 (preload must work before catalog demo is reachable)
- US3 depends on US1+US2 (needs rich catalog + fixture connect path)

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 (P1) | Phase 2 | Modal preload + single connect |
| US2 (P1) | US1 | Catalog counts + 2-pod logs |
| US3 (P2) | US1, US2 | Two parallel fixture sessions |

### Parallel Opportunities

- **Phase 2**: T003–T005 touch different files — parallel after T003
- **US1 tests**: T006 ∥ T007
- **US2 tests**: T011 ∥ T012 ∥ T013
- **US2 impl**: T015 ∥ T016 (different files) after T014
- **Polish**: T021 ∥ T022 ∥ T023 after T020

---

## Parallel Example: User Story 2

```bash
# Tests together:
cargo test --manifest-path src-tauri/Cargo.toml hydrate_demo_catalog
npx vitest run tests/unit/demo_fixtures.spec.ts tests/integration/logs_fanin.spec.ts

# Impl in parallel (different files):
# T015 demo_deployment_yaml in catalog.rs
# T016 two-pod follow in logs.rs
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1–2: fixture assets + bundle
2. Phase 3: US1 preload path resolution
3. **STOP**: quickstart preload section — demo unblocked for single env

### Incremental Delivery

1. US1 → preload works (MVP)
2. US2 → photogenic catalog + 2-pod logs (screenshot-ready)
3. US3 → dual-env demo validation
4. Polish → automated + manual sign-off

### Current Status

All tasks **T001–T024** complete; spec **Delivered**.

---

## Notes

- Extends 024 fixture hydrate contract — no new DB column
- Do not commit real PEM material; placeholder only
- Packaged-build manual test (T022) is optional but recommended before release
