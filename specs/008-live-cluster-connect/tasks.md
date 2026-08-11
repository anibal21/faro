# Tasks: Live cluster connect (keep demo)

**Input**: Design documents from `/specs/008-live-cluster-connect/`  
**Branch / feature**: `008-live-cluster-connect`  
**Decisions baked in**: Builtin id `faro-demo` named **demo** (first, connect/disconnect only, disconnected at start); operator envs always **live** (SSH+EKS+kube, mandatory namespace); no live→demo fallback; multi-connect isolated tunnels; full feature parity on live.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; mocks for live; demo path covered.

**Organization**: US2 (demo) → US1 (live) → US3 (no silent fallback). Paths at repo root (`src/`, `src-tauri/`).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm context and add Rust dependencies

- [x] T001 Confirm agent context points at `specs/008-live-cluster-connect/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 Add live-stack crates to `src-tauri/Cargo.toml` (`russh` and/or SSH forward deps, `aws-config`, `aws-sdk-eks`, `kube`, `k8s-openapi`, `tokio` as needed per research)
- [x] T003 [P] Document required Windows OpenSSH/russh notes in `specs/008-live-cluster-connect/quickstart.md` if packaging assumptions change

**Checkpoint**: Cargo resolves new deps

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mode branch, builtin demo id, namespace rule, session isolation hooks — MUST complete before story UI/live work

**⚠️ CRITICAL**: Blocks US1–US3

- [x] T004 Define connect mode helpers (`is_builtin_demo`, `DEMO_INSTANCE_ID = "faro-demo"`) in `src-tauri/src/db/connection_instance.rs` (or `src-tauri/src/k8s/mode.rs`)
- [x] T005 Ensure builtin **demo** row exists / is injected on list in `src-tauri/src/db/connection_instance.rs` + `src-tauri/src/commands/env.rs` (`env_list` sorts demo first; name `demo`)
- [x] T006 Reject `env_upsert` / `env_delete` for builtin demo in `src-tauri/src/commands/env.rs` + `connection_instance.rs`
- [x] T007 Require non-empty `namespace_default` on upsert for non-demo envs in `src-tauri/src/db/connection_instance.rs` (and FE modal later)
- [x] T008 Extend `SessionEntry` in `src-tauri/src/runtime.rs` with `mode` (`demo`|`live`) and placeholders for kube client / local_port
- [x] T009 Split `hydrate_catalog` in `src-tauri/src/k8s/catalog.rs` into `hydrate_demo_catalog` (existing) vs `hydrate_live_catalog` stub that errors until implemented (live must not call demo)
- [x] T010 Branch `env_connect` in `src-tauri/src/commands/connect.rs`: demo id → demo hydrate only; other ids → live path stub (error if not ready) — **never** demo-hydrate on live id

**Checkpoint**: Demo id stable; live connect no longer silently seeds demo

---

## Phase 3: User Story 2 — Built-in Demo first in tree (P1)

**Goal**: **demo** always first, disconnected at start, Connect/Disconnect only; sample catalog on connect.

**Independent Test**: Launch → demo first + disconnected → connect → payments-* samples; no edit/delete.

### Tests

- [x] T011 [P] [US2] Cargo/Vitest: `env_list` / UI shows demo first named `demo` in `tests/unit/demo_env_first.spec.tsx` (and/or Rust list test)
- [x] T012 [P] [US2] Vitest: demo context actions only Connect/Disconnect in `tests/unit/demo_env_actions.spec.tsx`
- [x] T013 [P] [US2] Integration: connect demo hydrates sample catalog; app start leaves demo disconnected in `tests/integration/demo_connect.spec.tsx`

### Implementation

- [x] T014 [US2] FE: pin/render **demo** first in `src/components/catalog/EnvTreeNav.tsx`; restrict context menu to Connect/Disconnect for builtin
- [x] T015 [P] [US2] FE: block edit/delete flows for demo in `src/views/MainShell.tsx` / menubar handlers
- [x] T016 [US2] Complete demo `env_connect` / `env_disconnect` path using `hydrate_demo_catalog` + demo logs in `src-tauri/src/commands/connect.rs`
- [x] T017 [P] [US2] Visual distinction demo vs live (badge/label) in `EnvTreeNav.tsx` / connection status UI

**Checkpoint**: Demo walkthrough works offline without live stack

---

## Phase 4: User Story 1 — Live environments full feature parity (P1) 🎯 MVP

**Goal**: Operator-added envs use real tunnel + EKS + kube for catalog, ConfigMaps, logs, analysis inputs; mandatory namespace.

**Independent Test**: Save live env with namespace → connect → real Deployments/CMs (or honest empty/error); open logs/CM live; no payments-* unless real.

### Tests

- [x] T018 [P] [US1] Cargo: namespace required on upsert in `src-tauri/src/db/connection_instance.rs` tests
- [x] T019 [P] [US1] Cargo: mock `LiveCluster` hydrate writes session rows for namespace only (no demo names) in `src-tauri/src/k8s/` tests
- [x] T020 [P] [US1] Vitest: NewEnvironmentModal requires namespace in `tests/unit/env_namespace_required.spec.tsx`
- [x] T021 [P] [US1] Integration outline: live connect uses live branch (not demo seed) in `tests/integration/live_connect_branch.spec.ts`

### Implementation

- [x] T022 [US1] Implement real SSH local port-forward with unique `local_port` per session in `src-tauri/src/ssh/tunnel.rs` + `close_tunnel`
- [x] T023 [US1] Implement DescribeCluster + EKS token from IAM file (memory only) in `src-tauri/src/k8s/eks_auth.rs`
- [x] T024 [US1] Create `src-tauri/src/k8s/client.rs` building `kube::Client` via localhost forward + CA + token
- [x] T025 [US1] Implement `hydrate_live_catalog` (Deployments/Pods/ConfigMaps in env namespace) in `src-tauri/src/k8s/catalog.rs`
- [x] T026 [US1] Wire live `env_connect` end-to-end in `src-tauri/src/commands/connect.rs` (tunnel → auth → client → hydrate → SessionEntry)
- [x] T027 [US1] Live ConfigMap get on open in `src-tauri/src/commands/catalog.rs` (use session client; no demo body)
- [x] T028 [US1] Live log follow fan-in in `src-tauri/src/k8s/logs.rs` + `src-tauri/src/commands/logs.rs` (demo path unchanged for `faro-demo`)
- [x] T029 [P] [US1] Live workload summary honest N/D or real metrics in `src-tauri/src/k8s/metrics.rs` / `commands/workload.rs` (no fake demo numbers on live)
- [x] T030 [US1] FE: require namespace in `src/components/env/NewEnvironmentModal.tsx` + types in `src/lib/ipc.ts` / env types
- [x] T031 [US1] Ensure list/log/refresh commands resolve `instance_id` → that session only (`catalog.rs`, `logs.rs`, `connect.rs` refresh)

**Checkpoint**: Real env connect shows live catalog/logs for configured namespace

---

## Phase 5: User Story 3 — No silent real→demo swap (P1)

**Goal**: Live failures/empty never inject demo catalog; refresh stays live; disconnect clears only that env.

**Independent Test**: Force live connect failure → no payments-* in that env’s tree; refresh live does not demo-seed.

### Tests

- [x] T032 [P] [US3] Cargo: live connect failure does not call `hydrate_demo_catalog` in `src-tauri/src/commands/connect.rs` / catalog tests
- [x] T033 [P] [US3] Cargo/integration: `catalog_refresh` on live re-lists live (mock); demo refresh re-seeds demo only for demo id
- [x] T034 [P] [US3] Assert error messages omit PEM/IAM secret material in `src-tauri/src/k8s/eks_auth.rs` / connect tests

### Implementation

- [x] T035 [US3] Audit all live error paths in `connect.rs` / `catalog.rs` / `tunnel.rs` / `eks_auth.rs` for teardown without demo hydrate
- [x] T036 [US3] `catalog_refresh` mode-aware in `src-tauri/src/commands/catalog.rs`
- [x] T037 [P] [US3] Disconnect purges only target `instance_id` session rows + closes that tunnel/client in `src-tauri/src/commands/connect.rs`

**Checkpoint**: US3 acceptance scenarios pass under tests

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T038 [P] E2E outline multi-connect isolation in `tests/e2e/live_cluster_connect_flow.spec.ts`
- [x] T039 [P] Sync AI4Devs docs HU16 (`5-historias-de-usuario.md`, `6-tickets-de-trabajo.md`, README) for 008
- [x] T040 Run `npm test`, `cargo test`, and spot-check [quickstart.md](./quickstart.md) V1–V3 when bastion available
- [x] T041 Mark all tasks `[x]` in this `tasks.md` after implement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** → **US2 (demo)** → **US1 (live)** → **US3 (hardening/tests)** → **Polish**
- US3 tests can start once T010 exists; full US3 after US1 connect path

### User Story Dependencies

- **US2**: After Foundational — restores safe demo while live builds
- **US1**: After Foundational (+ preferably US2 so demo remains usable)
- **US3**: After US1 live path exists (validates no fallback)

### Parallel Opportunities

```text
Phase 1: T002 then T003
Phase 2: T004–T008 mostly sequential; T005∥T007 after T004
Phase 3 tests: T011∥T012∥T013
Phase 4 tests: T018∥T019∥T020∥T021
Phase 4 impl: T022→T023→T024→T025→T026 then T027∥T028∥T029; T030∥T031
Phase 5: T032∥T033∥T034 then T035–T037
Polish: T038∥T039
```

---

## Parallel Example: User Story 2

```bash
Task: "tests/unit/demo_env_first.spec.tsx"
Task: "tests/unit/demo_env_actions.spec.tsx"
Task: "EnvTreeNav demo-first + Connect/Disconnect only"
```

---

## Parallel Example: User Story 1 (after tunnel+auth+client)

```bash
Task: "hydrate_live_catalog in catalog.rs"
Task: "live ConfigMap get in commands/catalog.rs"
Task: "live log follow in k8s/logs.rs"
Task: "namespace required in NewEnvironmentModal.tsx"
```

---

## Implementation Strategy

### MVP First

1. Setup + Foundational (stop silent demo on live)
2. US2 demo UX (product still demoable)
3. US1 live connect + catalog (unblocks “no veo nada”)
4. US1 logs/ConfigMaps parity
5. US3 failure guarantees + polish

### Suggested MVP scope

**Foundational + US2 + US1 catalog hydrate** (logs can follow immediately after in same implement pass per full-parity clarify).

---

## Notes

- Never persist IAM/PEM contents; never demo-hydrate on live ids
- Multi-connect: unique `local_port` per `SessionEntry`
- Format: every task `- [x] Tnnn …` with paths; story tasks include `[USn]`
