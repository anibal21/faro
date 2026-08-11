# Tasks: PEM-Only Live Connect

**Input**: Design documents from `/specs/014-pem-only-live-connect/`  
**Branch / feature**: `014-pem-only-live-connect`  
**Decisions baked in**: Bastion `describe-cluster` via `ssh_exec`; soft-deprecate `iam_credentials_path` (empty OK, ignored at connect); form without IAM field; demo unchanged; no SSO/~/.aws.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit/integration per Must-Have story; validate via [quickstart.md](./quickstart.md).

**Organization**: Setup → Foundational (bastion describe helper) → US1 (form/upsert) → US2 (connect) → US3 (demo assert) → US4 (legacy) → Polish.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context

- [x] T001 Confirm agent context points at `specs/014-pem-only-live-connect/plan.md` in `.cursor/rules/specify-rules.mdc`
- [x] T002 [P] Inventory live connect IAM usage in `src-tauri/src/commands/connect.rs`, `src-tauri/src/k8s/eks_auth.rs`, and IAM UI in `src/components/env/NewEnvironmentModal.tsx` against [plan.md](./plan.md)

**Checkpoint**: Context ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Bastion describe-cluster helper + shared parse/sanitize used by US2 (and tested early)

**⚠️ CRITICAL**: Connect path depends on this helper

- [x] T003 Add `describe_cluster_endpoint_via_bastion` (ssh_exec + JSON parse for endpoint/CA) in `src-tauri/src/k8s/eks_auth.rs` per [contracts/bastion-cluster-discovery.md](./contracts/bastion-cluster-discovery.md)
- [x] T004 [P] Cargo unit tests: describe JSON parse, `--name`/`--region` command shape, stderr sanitize in `src-tauri/src/k8s/eks_auth.rs` (tests module)

**Checkpoint**: Helper + cargo tests green (mocked/parse-only)

---

## Phase 3: User Story 1 — Form/upsert without IAM (P1) 🎯 MVP

**Goal**: New/edit environment has no IAM field; save works with PEM + form identifiers only.

**Independent Test**: Nuevo… → no IAM control → Guardar with PEM/bastion/region/cluster/namespace succeeds.

### Tests

- [x] T005 [P] [US1] Vitest: NewEnvironmentModal has no IAM credentials control in `tests/integration/env_file_browse.spec.tsx` and/or new `tests/unit/env_form_no_iam.spec.tsx` per [contracts/env-form-no-iam.md](./contracts/env-form-no-iam.md)
- [x] T006 [P] [US1] Cargo/integration assert upsert accepts empty `iam_credentials_path` in `src-tauri/src/db/connection_instance.rs` tests

### Implementation

- [x] T007 [US1] Allow empty `iam_credentials_path` on upsert (stop `require_non_empty` for IAM) in `src-tauri/src/db/connection_instance.rs` per [data-model.md](./data-model.md)
- [x] T008 [US1] Remove IAM path field and Examinar IAM from `src/components/env/NewEnvironmentModal.tsx`; keep PEM browse
- [x] T009 [P] [US1] Adjust `src/lib/ipc.ts` / upsert callers so IAM is optional or always sent as `""`

**Checkpoint**: SC-001 demoable

---

## Phase 4: User Story 2 — Connect PEM-only via bastion discovery (P1)

**Goal**: Live connect uses bastion describe + existing bastion token; no local IAM file read.

**Independent Test**: Env without credentials file → Connect → catalog + open logs.

### Tests

- [x] T010 [P] [US2] Source/unit assert live connect path does not call `validate_iam_credentials_file` or local IAM `describe_cluster_endpoint` in `tests/unit/connect_no_local_iam.spec.ts` (or cargo equivalent) per [contracts/connect-no-local-iam.md](./contracts/connect-no-local-iam.md)
- [x] T011 [P] [US2] Assert connect wires `describe_cluster_endpoint_via_bastion` before tunnel in `src-tauri/src/commands/connect.rs` (source or unit)

### Implementation

- [x] T012 [US2] Rewrite live branch in `src-tauri/src/commands/connect.rs`: bastion describe → tunnel → bastion get-token → hydrate; remove IAM validate + local describe
- [x] T013 [US2] Ensure tunnel cleanup on describe/token/hydrate failure still holds in `src-tauri/src/commands/connect.rs`
- [x] T014 [P] [US2] Keep local `describe_cluster_endpoint` / `mint_eks_token` only if still needed for tests; mark dead or gate behind test helpers in `src-tauri/src/k8s/eks_auth.rs`

**Checkpoint**: SC-002 / SC-003 / SC-004 (errors sanitized)

---

## Phase 5: User Story 3 — Demo unchanged (P2)

**Goal**: Built-in demo still connects without bastion/IAM.

**Independent Test**: Connect demo → sample catalog/logs.

### Tests

- [x] T015 [P] [US3] Assert demo branch in `src-tauri/src/commands/connect.rs` still skips bastion describe/IAM (source or existing demo connect tests)

### Implementation

- [x] T016 [US3] Smoke-verify demo hydrate path untouched in `src-tauri/src/commands/connect.rs` / `src-tauri/src/k8s/catalog.rs`; fix only if US2 regresses demo

**Checkpoint**: SC-005

---

## Phase 6: User Story 4 — Legacy IAM path ignored (P2)

**Goal**: Old rows with `iam_credentials_path` set still connect without that file.

**Independent Test**: Legacy row + missing IAM file on disk → Connect OK (bastion works).

### Tests

- [x] T017 [P] [US4] Unit/DB: load/upsert environment with non-empty legacy IAM path still valid in `src-tauri/src/db/connection_instance.rs` tests

### Implementation

- [x] T018 [US4] Confirm connect ignores stored IAM path (no file existence check) in `src-tauri/src/commands/connect.rs`; edit/save without IAM field in `src/components/env/NewEnvironmentModal.tsx`

**Checkpoint**: SC-006

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T019 [P] Sync constitution II / AI4Devs notes: live connect no longer requires IAM file — `.specify/memory/constitution.md` (MINOR note), `5-historias-de-usuario.md`, `6-tickets-de-trabajo.md` (HU22)
- [x] T020 [P] Run `npm test` and `cargo test --manifest-path src-tauri/Cargo.toml`
- [x] T021 Manual pass of [quickstart.md](./quickstart.md) (bastion + demo)
- [x] T022 Security spot-check: connect errors / SQLite omit PEM bodies and tokens (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** → **Foundational** (bastion describe)
- **US1** after Foundational (MVP form) — can overlap with US2 prep but upsert should land before relying on empty IAM in UI
- **US2** after Foundational (+ preferably US1 so operators can save PEM-only envs)
- **US3** after US2 (regression check)
- **US4** after US2 (legacy ignore)
- **Polish** last

### User Story Dependencies

| Story | Notes |
|-------|--------|
| US1 | Form + upsert empty IAM |
| US2 | Depends on T003 helper; delivers PEM-only connect |
| US3 | Assert demo not broken by US2 |
| US4 | Assert legacy path ignored |

### Parallel Opportunities

- T001 ∥ T002  
- T004 after T003  
- T005 ∥ T006 after upsert rules known  
- T010 ∥ T011 ∥ T014  
- T015 ∥ T017  
- T019 ∥ T020  

---

## Parallel Example: US1

```text
Task: "env_form_no_iam.spec.tsx + connection_instance empty IAM upsert test"
Task: "NewEnvironmentModal remove IAM field"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Setup + bastion describe helper  
2. Form/upsert without IAM  
3. **STOP and VALIDATE** SC-001  
4. Then US2 connect → US3/US4 → polish  

### Suggested MVP scope

**US1 + US2** (form + connect); US3/US4 are short regression asserts.

---

## Notes

- [P] = different files, no incomplete dependency  
- Do not add SSO or `~/.aws`  
- Commit when user asks  
