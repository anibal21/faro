# Feature Specification: Live cluster connect (keep demo)

**Feature Branch**: `008-live-cluster-connect`

**Created**: 2026-07-28

**Status**: Implemented

**Input**: User description: "Quiero que la plataforma FARO siga teniendo la opción de conectar demo, pero todas las demás conexiones que ingrese ya hagan conexiones reales. En este momento tengo un ambiente real conectado pero no veo nada."

## Clarifications

### Session 2026-07-28

- Q: How should Faro classify demo vs live environments? → A: Always keep a built-in **Demo** entry first in the Monitor tree (rename to “demo” only); every operator-added environment is **live** (real connect/catalog).
- Q: What live MVP scope for this feature? → A: **All existing product features** must work with live data on operator-added environments (not catalog-only); demo keeps sample data for the same features.
- Q: Which namespace(s) for live catalog/logs? → A: Namespace field is **mandatory** on environment config; Faro always uses the namespace the operator entered (never empty, never implicit `default` fallback).
- Q: What can the operator do with built-in **demo**? → A: Cannot edit or delete; **disconnected by default** on every app start; only **Connect** / **Disconnect** actions for now; user chooses when to connect.
- Q: Can demo and live be connected at once? → A: **Multi-connect**: every connected environment uses its **own** tunnel and configuration; sessions/catalogs/logs **must not mix** across environments.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real environments show real cluster inventory (Priority: P1)

An operator configures a **real** environment (their bastion, PEM path, IAM credentials path, region, cluster, **required namespace**) and connects. After a successful connect, Faro shows **that cluster’s** Deployments/Pods and ConfigMaps in the Monitor tree—not the fixed demo sample workloads. **All existing product capabilities** (catalog browse, ConfigMap raw view, Deployment log windows with live follow, Structured/Raw modes, click-to-analyze findings, refresh, disconnect) MUST operate against **live** session data for that environment. If the cluster has no matching resources (or the credentials cannot list them), the tree reflects that reality (empty or partial list) with a clear status—not silent sample data.

**Why this priority**: The operator already connected a real environment and saw nothing useful / only demo data; this is the core product promise.

**Independent Test**: Save a non-demo environment with valid access → Connect → tree lists workloads/ConfigMaps that match the real cluster (or empty with an honest empty/error state). Demo sample names must not appear unless they truly exist in that cluster.

**Acceptance Scenarios**:

1. **Given** a saved non-demo environment with working bastion and cluster access, **When** the operator connects, **Then** the UI reaches a connected state and the Monitor catalog shows Deployments/Pods and ConfigMaps from **that** cluster.
2. **Given** a successful real connect, **When** the operator browses Pods and ConfigMaps, **Then** they do **not** see Faro’s canned demo sample set presented as if it were that cluster.
3. **Given** a real connect where the cluster returns an empty list for the accessible namespace(s), **When** the catalog loads, **Then** the UI shows an empty/honest state (not demo placeholders).
4. **Given** a real connect fails (bastion unreachable, bad PEM, IAM denied, wrong cluster), **When** the error is shown, **Then** the message is actionable and contains **no** secret material (no PEM body, no access keys).
5. **Given** a successful live connect with at least one Deployment, **When** the operator opens logs / ConfigMap content / analysis on an error line, **Then** those features use **live** cluster data for that session (not demo stubs).
6. **Given** a live environment saved with namespace `N`, **When** connect and catalog/logs run, **Then** Faro only uses namespace `N` (no other namespaces).

---

### User Story 2 - Built-in Demo stays first in the tree (Priority: P1)

Faro always exposes a built-in **demo** environment as the **first** entry in the Monitor / environments tree (display name **demo**). Connecting that entry yields the familiar sample catalog for offline walkthroughs and is clearly labeled as demo. Any environment the operator **adds** (Nuevo…) is never demo—those are live-only.

**Why this priority**: Product must remain demonstrable without bastion access; constitution requires desktop demonstrability.

**Independent Test**: Open Faro → tree shows **demo** first → connect demo → sample Deployments/ConfigMaps; create another environment → connect → live catalog rules (US1).

**Acceptance Scenarios**:

1. **Given** a fresh or normal workspace, **When** the operator views the environments tree, **Then** **demo** appears as the first environment entry (name exactly/clearly “demo”).
2. **Given** the operator connects **demo**, **When** connect succeeds, **Then** the Monitor shows the known demo catalog suitable for walkthroughs.
3. **Given** a fresh app start, **When** the workspace loads, **Then** **demo** is present and **disconnected** (operator must explicitly connect).
4. **Given** the built-in **demo** entry, **When** the operator uses context/menu actions, **Then** only **Connect** and **Disconnect** are available (no edit, no delete).
5. **Given** a demo session, **When** the operator looks at the UI chrome/status, **Then** it is clear the session is **demo** (not implied as their real cluster).
6. **Given** the operator adds any new environment and connects it, **When** catalog loads, **Then** behavior follows US1 (live data), not demo seeding.

---

### User Story 3 - No silent swap of real → demo (Priority: P1)

For non-demo environments, Faro must **never** quietly fill the tree with demo samples when live discovery fails or is unfinished. Failure stays failure (or empty), so the operator is not misled into thinking sample apps are their production cluster.

**Why this priority**: Trust and safety for ops; the current pain is exactly this mismatch.

**Independent Test**: Force a failed or empty live discovery on a real environment → UI does not show the canned demo catalog.

**Acceptance Scenarios**:

1. **Given** a real environment connect that cannot reach the cluster API, **When** the session ends in error or partial failure, **Then** demo sample workloads are **not** injected into the catalog.
2. **Given** the operator refreshes the catalog on a live session, **When** refresh runs, **Then** it reloads from the **live** source (or reports failure)—it does not re-seed demo data.
3. **Given** the operator disconnects a live session, **When** session cache is cleared, **Then** demo samples are not left behind labeled as that environment’s data.

---

### Edge Cases

- **Wrong region/cluster name**: Connect fails or catalog empty with a clear error; no demo fill-in.
- **IAM can authenticate but cannot list**: Honest empty/error; no secrets in messages.
- **Namespace scope**: Catalog and live features use **only** the environment’s configured namespace; that field is **required** (cannot be empty). No all-namespaces listing in this feature.
- **Switching / multi-connect**: Environments may be connected concurrently; each keeps an isolated tunnel/config/catalog/logs. Prior session data must not bleed across environments. Demo and live can be connected together without mixing.
- **Slow bastion/cluster**: Operator sees a loading/connecting state; timeout yields a clear error, not demo data.
- **Demo fixtures paths reused by mistake on a user-added env**: User-added environments are always live; wrong paths fail honestly—never treated as the built-in demo entry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Faro MUST always present a built-in **demo** environment as the **first** entry in the environments/Monitor tree (display name **demo**).
- **FR-001a**: Connecting **demo** MUST provide sample Deployments/Pods and ConfigMaps for offline/demo use.
- **FR-001b**: Built-in **demo** MUST NOT be editable or deletable. On every application start it MUST appear **disconnected**; the operator explicitly Connects or Disconnects. For this feature, Connect and Disconnect are the **only** actions exposed for **demo**.
- **FR-002**: Every environment the operator **creates/adds** MUST be treated as **live**: Connect MUST establish a real session to that environment’s bastion and cluster (using stored paths and identifiers only—never stored secret values).
- **FR-002a**: Operator-added environments MUST NOT use demo catalog seeding, even if credential file paths happen to match demo fixtures.
- **FR-003**: After a successful **live** connect, the Monitor catalog MUST show Deployments/Pods and ConfigMaps discovered from that cluster session (read-only observation).
- **FR-003a**: On a live session, **all existing Faro features** that today work against session/catalog/logs (including ConfigMap raw view, Deployment log follow, Structured/Raw, click-to-analyze, catalog refresh, disconnect) MUST use **live** data from that session—no demo stubs mixed into live workflows.
- **FR-003b**: On the built-in **demo** session, those same features MAY continue to use sample/demo data.
- **FR-004**: Live connect MUST NOT seed or display the canned demo catalog as a substitute for live discovery.
- **FR-005**: Demo sessions MUST be visually distinguishable from live sessions in the product UI (status, label, or equivalent).
- **FR-006**: Connect and catalog failures for live environments MUST surface clear, non-secret errors; Faro MUST NOT fall back to demo data on those failures.
- **FR-007**: Catalog refresh on a live session MUST re-query the live session (or fail clearly), not re-apply demo samples.
- **FR-008**: Disconnect MUST tear down the live session resources for that environment and clear that environment’s session catalog.
- **FR-009**: Existing splash purge, dwell, chrome, and environment CRUD behaviors MUST remain; this feature changes **connect/catalog source of truth** (demo vs live), not window chrome.
- **FR-010**: Faro MUST continue to store only credential **paths** and non-secret identifiers; secret material MUST NOT be persisted or sent to any third party.
- **FR-011**: For operator-added (live) environments, **namespace** MUST be required at save time (non-empty). Connect and all live catalog/log/ConfigMap operations MUST target **that** namespace only.
- **FR-012**: Faro MUST support **multi-connect**: multiple environments (including **demo** and live) MAY be connected concurrently. Each connected environment MUST use its **own** tunnel and configuration. Catalog, logs, ConfigMaps, and analysis for one environment MUST NOT mix with another’s session data.

### Key Entities

- **Environment (connection instance)**: Built-in **demo** (always first) or operator-added **live** settings for bastion/cluster.
- **Live session**: Active real tunnel/auth/catalog session for one environment.
- **Demo session**: Active sample catalog session for offline/demo.
- **Cluster catalog**: Deployments/Pods and ConfigMaps shown in Monitor after connect.
- **Connect error**: User-visible failure without secrets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a real environment with valid access, after Connect, reviewers confirm ≥1 real workload or ConfigMap from that cluster appears when such resources exist—or an honest empty state when none exist—**without** the canned demo set appearing falsely.
- **SC-001a**: On the same live session, opening a Deployment log window and/or ConfigMap content succeeds against live data (or fails with a clear non-secret error)—demo log/content stubs are not shown as if they were that cluster.
- **SC-002**: 100% of failed live connects in test runs show an error and **0%** inject the demo catalog into that environment’s tree.
- **SC-003**: Demo connect (built-in **demo** first in tree) still completes a walkthrough (sample apps visible) in under 2 minutes on a machine without bastion access.
- **SC-004**: Operators can identify the built-in **demo** entry vs live environments in the tree/UI without opening documentation (spot-check with 3 reviewers).
- **SC-005**: Switching or multi-connecting demo ↔ live never leaves catalogs/logs mixed across environments (manual checklist pass).
- **SC-005a**: With two environments connected, actions on environment A only affect A’s tunnel/catalog/logs (spot-check).
- **SC-006**: No connect/catalog error message in acceptance tests contains PEM contents or IAM key material.

## Assumptions

- **Built-in demo**: Always first tree entry named **demo**; sample catalog when connected. **Not** editable/deletable. **Disconnected by default** after every app start; only Connect/Disconnect actions in this feature.
- **Operator-added environments**: Always **live** (real bastion/cluster catalog). The “Usar fixtures demo” button may still help fill paths for testing, but those saved envs remain live and must not be confused with the built-in **demo** entry. **Namespace is mandatory** and is the sole namespace used for live operations.
- **MVP live scope** for this feature = **full parity**: every existing Faro capability used after connect must work with **live** data on operator-added environments (catalog, ConfigMaps, logs follow, Structured/Raw, analysis click, refresh, disconnect). Built-in **demo** keeps sample data for the same capabilities.
- Read-only observation only (list/get); no mutating cluster actions.
- Out of scope: all-namespaces browsing; third-party telemetry. Multi-connect **with isolation** is in scope (each env own tunnel/config).
- This feature **replaces** the current behavior where every successful connect hydrates the same demo catalog regardless of environment.
