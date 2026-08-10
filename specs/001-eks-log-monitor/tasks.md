# Tasks: Faro — EKS log monitor via bastion

**Input**: Design documents from `/specs/001-eks-log-monitor/`  
**Branch / feature**: `001-eks-log-monitor`  
**Decisions baked in**: 10 atomic US; splash purge ephemeral-only; SQLite durable+session; IPC commands/events (no HTTP); Structured default + Raw unmodified; analyze on click (no Analizar-todo / Export); theme Should (US9); desktop P3 (US10); paths-only secrets; catalog hydrate 1× per connect.

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: REQUIRED by constitution — unit and/or integration per Must-Have story; ≥1 E2E for primary flow (splash → env → connect → logs → analyze).

**Organization**: Phases by user story (US1–US10). Paths assume Tauri app at repo root (`src/`, `src-tauri/`) per plan.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no incomplete deps)
- **[Story]**: US1…US10 for story phases only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold desktop app and tooling

- [ ] T001 Create Tauri 2 + React + TypeScript + Vite project layout per plan at `src/` and `src-tauri/`
- [ ] T002 Initialize `src-tauri/Cargo.toml` with Tauri 2, `tauri-plugin-sql`, serde, and workspace crates stubs (`commands`, `ssh`, `k8s`, `db`, `rules`)
- [ ] T003 [P] Add frontend deps in `package.json` (`@tauri-apps/api`, React 18+, Vitest) and base `vite.config.ts`
- [ ] T004 [P] Configure ESLint/Prettier (TS) and `rustfmt`/`clippy` defaults for `src/` and `src-tauri/`
- [ ] T005 [P] Add CI skeleton (build + `pnpm test`/`npm test` + `cargo test`) in `.github/workflows/ci.yml`
- [ ] T006 [P] Create empty dirs `rules/`, `tests/unit/`, `tests/integration/`, `tests/e2e/` per plan

**Checkpoint**: App scaffolds and empty window builds locally

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: SQLite tiers, IPC shell, errors, prefs — MUST complete before story work

**⚠️ CRITICAL**: No user story implementation until this phase is done

- [ ] T007 Implement SQLite open + migrations runner in `src-tauri/src/db/mod.rs` and `src-tauri/src/db/migrations/`
- [ ] T008 Create durable tables (`connection_instance`, `ui_preferences`, `analysis_finding_history`, `schema_meta`) in `src-tauri/src/db/migrations/001_durable.sql` per [data-model.md](./data-model.md)
- [ ] T009 [P] Create session tables (`connection_session`, `cached_namespace`, `cached_deployment`, `cached_pod_replica`, `cached_configmap`, `cached_configmap_entry`) in `src-tauri/src/db/migrations/002_session.sql`
- [ ] T010 Define shared IPC error type (actionable, no secrets) in `src-tauri/src/error.rs`
- [ ] T011 [P] Register Tauri command stubs + event names from [contracts/ipc-commands-events.md](./contracts/ipc-commands-events.md) in `src-tauri/src/lib.rs` / `src-tauri/src/commands/mod.rs`
- [ ] T012 [P] Implement `prefs_get` / `prefs_set` in `src-tauri/src/commands/prefs.rs` against `ui_preferences`
- [ ] T013 [P] Add frontend IPC wrappers in `src/lib/ipc.ts` (typed invoke helpers + listen helpers)
- [ ] T014 [P] Add light/dark CSS variables shell in `src/styles/theme.css` (tokens only; toggle in US9)
- [ ] T015 Unit tests for migration apply + durable vs session table presence in `tests/unit/db_schema.rs` (or `src-tauri/src/db/tests.rs`)

**Checkpoint**: Foundation ready — story phases may begin

---

## Phase 3: User Story 1 — Splash startup and session purge (P1) 🎯 MVP slice

**Goal**: Minimal splash (Faro + BG slot + AWS tagline + *…preparando*) runs `session_purge_ephemeral`, then opens main window; durable data kept (FR-023, FR-024).

**Independent Test**: Kill app with fake session rows; relaunch → splash → purge → main; environments still listed empty or prior durable fixtures.

### Tests

- [ ] T016 [P] [US1] Unit test: purge deletes session tables only in `tests/unit/session_purge.rs`
- [ ] T017 [P] [US1] Integration test: splash invoke → main chrome appears in `tests/integration/splash_purge.spec.ts`

### Implementation

- [ ] T018 [US1] Implement `session_purge_ephemeral` in `src-tauri/src/commands/session.rs` (DELETE `«session»` only)
- [ ] T019 [P] [US1] Build splash window UI in `src/views/SplashView.tsx` (+ asset slot `src/assets/splash-bg.placeholder.md`)
- [ ] T020 [US1] Wire splash lifecycle in `src-tauri/src/main.rs` / `src/App.tsx` (show splash → purge → open main)
- [ ] T021 [US1] Ensure durable fixtures survive purge (assert in T016 + smoke in `src/views/MainShell.tsx` empty state)

**Checkpoint**: US1 independently demoable

---

## Phase 4: User Story 2 — CRUD connection environments (P1)

**Goal**: Create/edit/delete environments (PEM path, SSH, IAM path, region, cluster); persist across restarts (FR-001–003).

**Independent Test**: Upsert three envs, restart app, list matches; delete one; never store secret bodies.

### Tests

- [ ] T022 [P] [US2] Unit tests for `env_upsert` validation (paths required, reject secret bodies) in `tests/unit/env_crud.rs`
- [ ] T023 [P] [US2] Integration test CRUD round-trip SQLite in `tests/integration/env_crud.spec.ts`

### Implementation

- [ ] T024 [P] [US2] Durable repo helpers for `connection_instance` in `src-tauri/src/db/connection_instance.rs`
- [ ] T025 [US2] Implement `env_list` / `env_upsert` / `env_delete` in `src-tauri/src/commands/env.rs`
- [ ] T026 [P] [US2] New-environment modal UI in `src/components/env/NewEnvironmentModal.tsx` (wireframe 03)
- [ ] T027 [US2] Ambiente menu “Configurar nuevo ambiente…” + edit/delete flows in `src/components/menus/AmbienteMenu.tsx`
- [ ] T028 [US2] Bind modal to IPC in `src/hooks/useEnvironments.ts`

**Checkpoint**: US2 independently testable with SQLite only (no cluster)

---

## Phase 5: User Story 3 — Load one/many; one active (P1)

**Goal**: Load one or several environments into chrome; only one active drives ops; switching active invalidates prior live windows (FR / IA).

**Independent Test**: Load two envs; set active A then B; UI shows B as active; no concurrent tunnel assumed yet.

### Tests

- [ ] T029 [P] [US3] Unit/integration tests for `env_load` + `env_set_active` in `tests/unit/env_active.rs`

### Implementation

- [ ] T030 [US3] Implement `env_load` / `env_set_active` in `src-tauri/src/commands/env.rs`
- [ ] T031 [P] [US3] Environment selector (top-right) in `src/components/env/EnvironmentSelector.tsx`
- [ ] T032 [US3] Menu items “Cargar ambiente…” / “Cargar varios…” in `src/components/menus/AmbienteMenu.tsx`
- [ ] T033 [US3] Session UI state: loaded list + active id + invalidate-live hook in `src/hooks/useActiveEnvironment.ts`

**Checkpoint**: US3 works offline against durable envs

---

## Phase 6: User Story 4 — Connect and disconnect via bastion (P1)

**Goal**: Connect active env (SSH PEM path + IAM file → EKS token); hydrate catalog once; disconnect tears down + purges session for instance (FR-004, FR-016).

**Independent Test**: Against demo bastion/cluster (or mocked tunnel): connect OK status; disconnect clears session rows; errors never leak secrets.

### Tests

- [ ] T034 [P] [US4] Unit tests for IAM-file read + token mint mocks in `tests/unit/eks_token.rs`
- [ ] T035 [P] [US4] Integration test connect/disconnect session lifecycle in `tests/integration/env_connect.spec.ts`

### Implementation

- [ ] T036 [US4] SSH tunnel module (PEM path only) in `src-tauri/src/ssh/tunnel.rs`
- [ ] T037 [US4] EKS token from IAM credentials **file path** in `src-tauri/src/k8s/eks_auth.rs`
- [ ] T038 [US4] Implement `env_connect` (tunnel + auth + mint `catalog_epoch` + hydrate trigger) in `src-tauri/src/commands/env.rs`
- [ ] T039 [US4] Implement `env_disconnect` (tear-down + DELETE session for instance) in `src-tauri/src/commands/env.rs`
- [ ] T040 [US4] Connect/Disconnect UI + status/errors in `src/components/env/ConnectionStatus.tsx` and Ambiente menu
- [ ] T041 [US4] Hydrate session cache writer (namespaces/deployments/configmaps skeleton) in `src-tauri/src/db/session_cache.rs` (full fill continues in US5/US6)

**Checkpoint**: US4 connects; catalog tables may be empty until US5/US6 fill

---

## Phase 7: User Story 5 — Browse Deployments/Pods (cached catalog) (P1)

**Goal**: List Deployments/Pods from session cache; filter by name; `catalog_refresh` regenerates epoch (FR-005–006).

**Independent Test**: After connect (or seeded cache), rail shows Deployments/Pods; refresh bumps epoch; UI does not re-hit K8s on every click.

### Tests

- [ ] T042 [P] [US5] Unit tests for cache read/filter in `tests/unit/catalog_deployments.rs`
- [ ] T043 [P] [US5] Integration test list + refresh epoch in `tests/integration/catalog_pods.spec.ts`

### Implementation

- [ ] T044 [US5] K8s list deployments/pods (RO) into session cache in `src-tauri/src/k8s/catalog.rs`
- [ ] T045 [US5] Implement `k8s_list_deployments` + `catalog_refresh` in `src-tauri/src/commands/catalog.rs`
- [ ] T046 [P] [US5] Deployments/Pods rail UI in `src/components/catalog/DeploymentsRail.tsx` (wireframe 04)
- [ ] T047 [US5] Name filter control in `src/components/catalog/CatalogFilter.tsx`
- [ ] T048 [US5] Wire refresh action to IPC in `src/hooks/useCatalog.ts`

**Checkpoint**: US5 browsable offline after hydrate

---

## Phase 8: User Story 6 — Browse ConfigMaps read-only (P1)

**Goal**: List ConfigMaps; open RO keys/values (Raw-style); truncate large/binary safely (FR-011).

**Independent Test**: Open ConfigMap from rail; values truncated; no mutate APIs.

### Tests

- [ ] T049 [P] [US6] Unit tests for safe truncation of ConfigMap values in `tests/unit/configmap_truncate.rs`
- [ ] T050 [P] [US6] Integration test list + get ConfigMap in `tests/integration/catalog_configmaps.spec.ts`

### Implementation

- [ ] T051 [US6] Extend hydrate/list ConfigMaps in `src-tauri/src/k8s/catalog.rs` + session tables
- [ ] T052 [US6] Implement `k8s_list_configmaps` / `k8s_get_configmap` in `src-tauri/src/commands/catalog.rs`
- [ ] T053 [P] [US6] ConfigMaps rail + Raw viewer tab in `src/components/catalog/ConfigMapsPanel.tsx` (wireframe 05)
- [ ] T054 [US6] Bind open/get to IPC in `src/hooks/useConfigMaps.ts`

**Checkpoint**: US6 RO ConfigMaps usable

---

## Phase 9: User Story 7 — Live logs Structured + Raw (P1)

**Goal**: One window per Deployment; multi-window; follow; search; Structured default; Raw unmodified dump; buffers in RAM (FR-007–010, FR-018–022).

**Independent Test**: Open logs → Structured default; toggle Raw without losing follow; search filters; no SQLite log dumps.

### Tests

- [ ] T055 [P] [US7] Unit tests for write-group aggregation (Structured) in `tests/unit/write_groups.spec.ts`
- [ ] T056 [P] [US7] Integration test logs_open → listen `logs_chunk` / `logs_status` in `tests/integration/logs_stream.spec.ts`

### Implementation

- [ ] T057 [US7] Implement `logs_open` / `logs_close` / kube follow in `src-tauri/src/commands/logs.rs` + `src-tauri/src/k8s/logs.rs`
- [ ] T058 [US7] Emit `logs_chunk` and `logs_status` events from Rust per IPC contract
- [ ] T059 [P] [US7] Implement `logs_set_view` (or UI-only view state) documented in `src/lib/ipc.ts` + `src-tauri/src/commands/logs.rs` if needed
- [ ] T060 [P] [US7] Structured log view in `src/components/logs/StructuredLogView.tsx`
- [ ] T061 [P] [US7] Raw log view (no manipulation) in `src/components/logs/RawLogView.tsx`
- [ ] T062 [US7] Log window shell (tabs, search, follow indicator) in `src/views/LogWindow.tsx`
- [ ] T063 [US7] Multi-window open from Deployments rail in `src/hooks/useLogWindows.ts`

**Checkpoint**: US7 live dual-view logs work

---

## Phase 10: User Story 8 — Spring Boot analysis on click (P1)

**Goal**: Lightweight live mark of errors/stacktraces; click runs full local rules engine; panel severity + plain explanation + action; no buffer-wide Analyze; no Export (FR-012–014, FR-020).

**Independent Test**: Click marked ERROR write-group → finding panel; empty explicit if no match; analyze stays on-device.

### Tests

- [ ] T064 [P] [US8] Unit tests for Spring Boot rule pack matching in `tests/unit/rules_springboot.rs`
- [ ] T065 [P] [US8] Integration test analyze_write_group IPC in `tests/integration/analyze_click.spec.ts`

### Implementation

- [ ] T066 [P] [US8] Ship rule pack JSON/YAML under `rules/springboot/`
- [ ] T067 [US8] Rules engine in `src-tauri/src/rules/engine.rs` + `analyze_write_group` in `src-tauri/src/commands/analyze.rs`
- [ ] T068 [P] [US8] Lightweight detection markers in Structured view `src/components/logs/StructuredLogView.tsx`
- [ ] T069 [US8] Finding detail panel in `src/components/analysis/FindingPanel.tsx` (wireframe 06)
- [ ] T070 [US8] Optional light history insert into `analysis_finding_history` in `src-tauri/src/db/analysis_history.rs` (metadata only)
- [ ] T071 [US8] Confirm chrome has **no** Analizar-todo / Export controls in `src/components/menus/` and log chrome

**Checkpoint**: US8 click-to-analyze complete

---

## Phase 11: User Story 9 — Light / dark theme (P2 Should)

**Goal**: Ver → Modo claro / Modo oscuro; persist via prefs (FR-025).

**Independent Test**: Toggle theme, restart, chrome follows last choice.

### Tests

- [ ] T072 [P] [US9] Integration test prefs theme persistence in `tests/integration/theme_prefs.spec.ts`

### Implementation

- [ ] T073 [US9] Ver menu Modo claro / Modo oscuro in `src/components/menus/VerMenu.tsx`
- [ ] T074 [US9] Apply theme class from `prefs_get`/`prefs_set` in `src/hooks/useTheme.ts` + `src/styles/theme.css`
- [ ] T075 [US9] Keep Raw terminal contrast readable under both themes in `src/components/logs/RawLogView.tsx`

**Checkpoint**: US9 Should complete (may ship after MVP P1)

---

## Phase 12: User Story 10 — Desktop packages Win / macOS / Linux (P3)

**Goal**: Installers/runnables reach splash or connect UI on three OS (FR-015, SC-007).

**Independent Test**: Built artifact launches to splash on each target (CI or manual matrix).

### Tests

- [ ] T076 [P] [US10] Smoke script/docs for package launch in `tests/e2e/package_smoke.md` (or CI job notes)

### Implementation

- [ ] T077 [US10] Configure Tauri bundle targets in `src-tauri/tauri.conf.json` (nsis/dmg/appimage or equivalent)
- [ ] T078 [US10] Document build commands in `README.md` / `quickstart.md` cross-link
- [ ] T079 [US10] Produce at least Windows demo build first; verify macOS/Linux build configs compile

**Checkpoint**: US10 packaging demonstrable

---

## Phase 13: Polish & Cross-Cutting

**Purpose**: E2E primary flow, docs sync, security pass

- [ ] T080 Implement primary E2E: splash → CRUD env → load/active → connect → pods → logs → analyze in `tests/e2e/primary_flow.spec.ts`
- [ ] T081 [P] Sync AI4Devs `6-tickets-de-trabajo.md` task ID references after implement waves
- [ ] T082 [P] Run [quickstart.md](./quickstart.md) validation checklist and note results in `TESTING.md`
- [ ] T083 Security pass: grep for secret persistence / egress; confirm constitution VI in `src-tauri/` and `src/`
- [ ] T084 [P] Wireframe sign-off follow-up (`/speckit-wireframe-review`) if still pending
- [ ] T085 Performance: drop oldest buffer lines under load; verify SC-003 timing notes in `tests/integration/logs_perf.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → **US1…US10** → **Polish**
- Foundational **blocks** all stories
- Recommended sequential MVP: US1 → US2 → US3 → US4 → US5 → US7 → US8 (ConfigMaps US6 can parallel US5 after connect; theme US9 anytime after prefs; US10 late)

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP first slice |
| US2 | Phase 2 (+ US1 for main chrome preferred) | CRUD offline |
| US3 | US2 | Needs environments to load |
| US4 | US3 | Active env to connect |
| US5 | US4 | Needs hydrate/session |
| US6 | US4 | Parallelizable with US5 after connect |
| US7 | US5 | Needs Deployment selection |
| US8 | US7 | Needs Structured write-groups |
| US9 | Phase 2 prefs | Parallel after foundation |
| US10 | App builds (Phase 1+) | Soft-deps on US1 for splash demo |

### Parallel Opportunities

- T003–T006 (setup tooling)
- T008 vs T009 (SQL migrations)
- T011–T014 (IPC stubs / prefs / theme tokens / frontend wrappers)
- US5 ∥ US6 after US4
- US9 ∥ any post-foundation story
- Within US7: Structured ∥ Raw view components (T060 ∥ T061)

### Parallel Example: User Story 7

```bash
# After T057–T058 exist:
Task: "Structured log view in src/components/logs/StructuredLogView.tsx"
Task: "Raw log view in src/components/logs/RawLogView.tsx"
```

---

## Implementation Strategy

### MVP First (suggested)

1. Phase 1 + 2  
2. **US1** splash/purge → validate  
3. **US2–US4** environments + connect  
4. **US5 + US7 + US8** pods + logs + analyze (primary E2E value)  
5. **US6** ConfigMaps  
6. **US9** theme (Should)  
7. **US10** packages + Polish E2E (T080)

### Incremental Delivery

Each US checkpoint above is a demo stop. Do not start US7 before US4 connect works.

### AI4Devs tickets mapping

See [`6-tickets-de-trabajo.md`](../../6-tickets-de-trabajo.md) — one delivery ticket per user story, tracing to task IDs T016–T079.

---

## Notes

- No HTTP API — only Tauri IPC per contracts
- No full log dumps in SQLite
- No Analizar-todo / Export in MVP chrome
- Splash never deletes durable environments
- Commit after each task or logical group
- Stop at checkpoints to validate story independently
