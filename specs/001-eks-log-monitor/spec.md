# Feature Specification: Faro — EKS log monitor via bastion

**Feature Branch**: `001-eks-log-monitor`

**Created**: 2026-07-22

**Status**: Draft

**Input**: User description: Desktop app Faro for monitoring EKS artifacts via SSH bastion (.pem), multiple connection instances per environment, component types starting with Pods and ConfigMaps, Deployment-aggregated live logs, Spring Boot rules engine with plain-language findings; log export out of scope for v1.

## Clarifications

### Session 2026-07-22

- Q: What viewing modes does each log instance/window provide? → A: Two modes — (1) **Raw**: fast terminal-like stream of advancing lines; (2) **Structured**: lines shown with severity and detail; if a line is detected as an error, the user can click it to run the rules engine and open a panel with severity, plain-language explanation, and recommendation.
- Q: Default view when opening a log window? → A: **Structured** by default; **Raw** available via a button (optional switch).
- Q: When is a line an actionable “error” in Structured view? → A: **Lightweight live detection** (e.g. level/pattern) marks clickable errors; the **full rules engine runs on click**.
- Q: MVP Analyze entry points? What is a clickable “line”? → A: MVP = **click only** (no buffer-wide Analyze button). A clickable unit is a **complete stacktrace** (not a single physical log line).
- Q: How does Raw vs Structured treat stream chunks / stacktraces? → A: **Raw** only emits terminal output with **no manipulation**. **Structured** groups by **each write** to the log stream (a stacktrace is usually one write and thus one group).

### Session 2026-07-23 — Atomic user stories

- Q: Should MVP keep 5 coarse stories or split for development control? → A: **10 atomic** user stories (US1–US10) aligned to plan/wireframes/IPC; no new product scope beyond existing FR/plan. Theme light/dark is **Should (P2)**; desktop packaging remains **Must (P3)**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Splash startup and session purge (Priority: P1)

On launch, the user sees a **minimal splash** (brand Faro, background-image slot, AWS tagline, *…preparando aplicación*) while Faro purges leftover **ephemeral** session/log data, then the main window opens. Durable environments and prefs are kept.

**Why this priority**: Clean start after dirty exit without losing saved connections (FR-023, FR-024).

**Independent Test**: Force-kill after a connected session; relaunch; splash runs; environments still listed; session catalog empty until reconnect.

**Acceptance Scenarios**:

1. **Given** cold start, **When** Faro launches, **Then** splash shows Faro + tagline + preparing status before main UI.
2. **Given** leftover session-cache rows, **When** splash runs `session_purge_ephemeral`, **Then** those rows are gone and durable `connection_instance` rows remain.
3. **Given** purge completed, **When** main window opens, **Then** user can proceed to empty workspace or saved environments.

---

### User Story 2 - CRUD connection environments (Priority: P1)

The user creates, edits, and deletes **connection instances** (bastion SSH, PEM path, IAM credentials path, `region_name`, `cluster_name`, optional namespace). Only paths and non-secret identifiers are stored.

**Why this priority**: Gateway to all cluster work (FR-001–003).

**Independent Test**: Create two instances, edit one path, delete one, restart — surviving instance fields match.

**Acceptance Scenarios**:

1. **Given** first-time user, **When** they save a valid environment form, **Then** it appears in the list and survives restart.
2. **Given** a saved instance, **When** they edit host or path and save, **Then** later connects use updated values.
3. **Given** any instance, **When** stored, **Then** no PEM/IAM secret contents are in SQLite.

---

### User Story 3 - Load one or many environments; one active (Priority: P1)

Via **Ambiente** menu the user loads one or several saved environments into the sidebar and marks exactly one **active** for cluster ops.

**Why this priority**: Multi-env UX without concurrent tunnels (plan IA).

**Independent Test**: Load two environments; only active drives connect; switch active; prior live windows invalidate.

**Acceptance Scenarios**:

1. **Given** saved instances, **When** user loads several, **Then** all appear in sidebar.
2. **Given** multiple loaded, **When** user sets active, **Then** only that instance is used for connect/catalog.
3. **Given** open log windows, **When** active changes, **Then** windows close or show invalidated.

---

### User Story 4 - Connect and disconnect via bastion (Priority: P1)

The user connects the active environment (SSH tunnel + IAM file → EKS token) and can disconnect; errors are clear and non-secret.

**Why this priority**: Enables catalog and logs without manual SSH (FR-004, FR-016).

**Independent Test**: Connect with valid paths; disconnect; fail connect with bad PEM and see actionable error.

**Acceptance Scenarios**:

1. **Given** valid active instance, **When** connect succeeds, **Then** status is connected and catalog hydrate may run once.
2. **Given** connected, **When** disconnect, **Then** tunnel/kube tear down and session cache for that instance is cleared.
3. **Given** bad path or bastion down, **When** connect fails, **Then** error has no secret material.

---

### User Story 5 - Browse Deployments/Pods (cached catalog) (Priority: P1)

After connect, user browses **Deployments/Pods**, filters by name; list comes from session catalog hydrated **once per connect** (optional refresh).

**Why this priority**: Core discoverability for logs (FR-005–006).

**Independent Test**: Connect; list Deployments; navigate away/back without full re-list; `catalog_refresh` updates list.

**Acceptance Scenarios**:

1. **Given** connected, **When** Pods/Deployments selected, **Then** accessible workloads are listed.
2. **Given** long list, **When** filter by name, **Then** only matches show.
3. **Given** hydrate done, **When** user browses again in same session, **Then** UI may use session cache without mandatory full AWS re-list.

---

### User Story 6 - Browse ConfigMaps read-only (Priority: P1)

User lists ConfigMaps and opens a **read-only** key/value view (Raw-style; safe truncation for large/binary).

**Why this priority**: Agreed MVP second component type (FR-011).

**Independent Test**: Open a known ConfigMap; confirm keys visible; binary/large values truncated safely.

**Acceptance Scenarios**:

1. **Given** connected, **When** ConfigMaps selected, **Then** accessible ConfigMaps list.
2. **Given** a ConfigMap, **When** opened, **Then** keys/values are read-only.
3. **Given** large/binary value, **When** shown, **Then** UI remains safe/understandable (truncate/placeholder).

---

### User Story 7 - Live logs Structured + Raw (Priority: P1)

User opens one log window per Deployment: aggregated replicas, live follow, multi-window, search; **Structured** default and **Raw** via button without dropping follow.

**Why this priority**: Primary monitoring outcome (FR-007–010, FR-018–022).

**Independent Test**: Deployment with ≥2 replicas; Structured default; switch Raw; second window; search.

**Acceptance Scenarios**:

1. **Given** multi-replica Deployment, **When** logs open, **Then** one window shows attributable lines from >1 pod.
2. **Given** open window, **When** new logs write, **Then** UI updates within demo SLA without refresh.
3. **Given** open window, **When** first shown, **Then** Structured is active; Raw via button is unmodified dump.
4. **Given** two artifacts, **When** both opened, **Then** each follows independently; search works in active view.

---

### User Story 8 - Spring Boot analysis on click (Priority: P1)

In Structured view, user clicks a likely-error write-group/stacktrace; local rules return severity, plain explanation, recommendation. No buffer-wide Analyze.

**Why this priority**: Differentiator for non-technical readers (FR-012–014, FR-020). *Priority raised to P1 Must for atomic MVP delivery control (was P2 in coarse model).*

**Independent Test**: Click prepared stacktrace; panel shows finding or empty; no Analyze-all button.

**Acceptance Scenarios**:

1. **Given** marked stacktrace, **When** clicked, **Then** panel shows severity + plain explanation + recommendation.
2. **Given** no rule match, **When** analyze runs, **Then** empty result is explicit.
3. **Given** MVP chrome, **When** inspected, **Then** no buffer-wide Analyze / no Export.

---

### User Story 9 - Light / dark theme (Priority: P2)

Via **Ver** menu the user switches **Modo claro** / **Modo oscuro**; preference persists across restart.

**Why this priority**: Explicit product UX; not blocking connect/logs (Should).

**Independent Test**: Set dark; restart; theme still dark.

**Acceptance Scenarios**:

1. **Given** main window, **When** user selects Modo oscuro, **Then** chrome uses dark theme.
2. **Given** theme set, **When** app restarts, **Then** theme is restored from prefs.
3. **Given** Raw log panel, **When** theme changes, **Then** app chrome follows theme (Raw may keep terminal contrast).

---

### User Story 10 - Desktop packages Win / macOS / Linux (Priority: P3)

Faro ships as installable/runnable desktop apps for Windows, macOS, and Linux; no public URL required for evaluation.

**Why this priority**: Delivery shape (FR-015, SC-007).

**Independent Test**: Launch package on each OS to splash or connection UI.

**Acceptance Scenarios**:

1. **Given** a supported OS package, **When** installed/run, **Then** Faro reaches splash or main connection UI.
2. **Given** no public URL, **When** evaluated, **Then** local demo / recording suffices.

### Edge Cases

- Bastion SSH failure, wrong key path, or permission denied on key file.
- Cloud credentials missing/expired/unreadable in the IAM credentials file path.
- Missing or invalid `region_name` / `cluster_name`.
- Cluster API reachable but RBAC denies list/get on pods, logs, or ConfigMaps.
- Deployment scales to zero or pods crash-loop while a live window is open.
- Pods with multiple containers: user must be able to understand which container’s logs are shown (default + explicit choice when more than one).
- Very high log volume: UI remains usable (scroll/search still possible; user understands if older lines were dropped from the buffer).
- User switches active connection instance while windows are open: windows are closed or clearly invalidated.
- ConfigMap with no keys or binary/large values: read-only view remains safe and understandable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create, edit, delete, and select multiple **connection instances** (one per environment/bastion they use).
- **FR-002**: Each connection instance MUST capture bastion host, SSH port, SSH user, path to the user’s PEM file, path to a local IAM credentials file (`aws_access_key_id` / `aws_secret_access_key`), `region_name`, and `cluster_name` (plus optional default namespace) so Faro can reach that environment’s Kubernetes API via the bastion.
- **FR-003**: The system MUST persist connection instances locally across restarts without storing PEM contents or IAM secret values—only filesystem **paths** and non-secret identifiers (`region_name`, `cluster_name`, bastion fields). IAM material MUST be read from the credentials file at connect time.
- **FR-004**: Users MUST be able to connect using the active instance so that cluster browsing happens without manual terminal SSH for that session.
- **FR-005**: After connect, users MUST choose a component type; MVP MUST include **Pods** (via Deployment/workload grouping) and **ConfigMaps**.
- **FR-006**: For Pods, users MUST browse Deployments/workloads available to their access and open a **single log window per Deployment artifact**.
- **FR-007**: A Deployment log window MUST aggregate log lines from all replicas of that Deployment and label lines so the user can tell which replica produced them.
- **FR-008**: Each open log window MUST update continuously as new log lines are produced (live follow), without manual refresh.
- **FR-009**: Users MUST be able to keep multiple artifact log windows open concurrently, each following independently.
- **FR-010**: Users MUST be able to search or filter text within an open log window.
- **FR-011**: For ConfigMaps, users MUST list accessible ConfigMaps and open a **read-only** view of their data.
- **FR-012**: Users MUST obtain Spring Boot rules-engine analysis by **clicking a complete stacktrace** marked as a likely error in Structured view. A buffer-wide **Analyze** button is **OUT OF SCOPE** for MVP.
- **FR-013**: Each analysis finding MUST include severity (`critical` | `warn` | `info`), plain-language explanation (suitable for non-technical readers), and a recommended action.
- **FR-014**: Analysis MUST run locally on content already available in the app; it MUST NOT send log content or credentials to external AI/telemetry services.
- **FR-015**: The product MUST be distributable as desktop executables/installers for Windows, macOS, and Linux (concrete formats e.g. NSIS/MSI, DMG, AppImage/deb resolved at packaging; SC-007 is the measurable bar).
- **FR-016**: On connection/list/log failures, the system MUST show actionable errors without exposing secret material.
- **FR-017**: Log **export to files** is **OUT OF SCOPE** for this MVP; Faro MUST NOT advertise export as a feature in v1 (users who copy text themselves do so outside the product’s responsibility).
- **FR-018**: Each log window MUST provide a **Raw** view that shows the live stream **exactly as terminal output** — **no** reformatting, grouping, severity columns, or other manipulation.
- **FR-019**: Each log window MUST provide a **Structured** view that groups the live stream by **each write** to the log (one write → one structured entry). A Spring/Java stacktrace is typically emitted as a single write and therefore appears as one group.
- **FR-020**: In Structured view, the system MUST apply **lightweight live detection** on each write-group so likely **errors** (including stacktrace writes) are visually marked and **clickable**; clicking MUST invoke the **full** Spring Boot rules engine for that write-group/stacktrace and show a panel with severity, plain-language explanation, and recommendation (live follow MUST remain usable while only lightweight detection runs continuously).
- **FR-021**: Users MUST be able to switch between Raw and Structured views for the same log window without losing the live follow session.
- **FR-022**: When a log window opens, it MUST start in **Structured** view; **Raw** MUST be reachable via an explicit control (e.g. button), not as the default.
- **FR-023**: On application launch, Faro MUST first show a **minimal splash window** with the product name **Faro**, a **background image** (lighthouse / brand visual, full-bleed within the splash window; concrete image asset is supplied at implementation), the tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, and a preparing status (*…preparando aplicación*) before the main workspace appears.
- **FR-024**: During the splash, Faro MUST purge leftover **ephemeral session / log-related** local data from a prior run (including dirty exit). Faro MUST **NOT** delete durable data needed across sessions: connection instances (environments), UI preferences, light analysis history metadata, or schema metadata. After purge completes, the main window MAY open.
- **FR-025**: Users MUST be able to switch application chrome between **light** and **dark** theme via the **Ver** menu; the choice MUST persist across restarts in local prefs (US9).
- **FR-026**: If pods of an open Deployment restart, scale, or are replaced while follow is active, Faro MUST surface stream status (`following` | `idle` | `error` | `no_pods` via IPC) and MUST attempt to resume follow for current replicas without requiring the user to close/reopen the window when pods become available again.
### Key Entities

- **Connection instance**: Named environment access profile (bastion SSH + PEM path + IAM credentials file path + `region_name` + `cluster_name`).
- **Component type**: Category of browsable resource (MVP: Pods/Deployments, ConfigMaps).
- **Deployment artifact**: Workload grouping that owns one aggregated log window.
- **Log window**: Live view of aggregated replica logs for one artifact, with Raw and Structured modes.
- **Raw view**: Unmodified terminal-like dump of the live stream (no manipulation).
- **Structured view**: Entries grouped by each log **write**, with severity/detail; error write-groups (often stacktraces) are clickable.
- **Log write group**: One unit in Structured view corresponding to a single write to the log stream (often one stacktrace).
- **Stacktrace (error unit)**: Typical error write-group for Spring Boot; analyzed as one clickable target.
- **Analysis finding**: Rule match with severity, plain explanation, recommended action.
- **ConfigMap view**: Read-only presentation of a ConfigMap’s keys/values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with a valid environment can go from cold start → select/create instance → connect → open a Deployment log window in under **5 minutes** on first use (with written quick-start).
- **SC-002**: For a Deployment with **2+ replicas**, **100%** of demonstrated trials show a **single** window with lines from more than one replica clearly attributable.
- **SC-003**: With an open log window, newly written lines become visible within **3 seconds** under normal demo load without manual refresh.
- **SC-004**: Clicking a prepared Spring Boot **stacktrace** produces **≥1** finding with severity + plain explanation + recommended action; the product ruleset includes **≥5** distinct Spring Boot patterns overall.
- **SC-005**: Non-technical reviewers can restate the meaning of a sample finding in their own words after reading the plain explanation (**spot check**, ≥4/5 correct in a small review).
- **SC-006**: Connection instances survive restart: **100%** of saved instances reappear with the same non-secret fields after relaunch.
- **SC-007**: Installable builds exist for **Windows, macOS, and Linux** and each can reach the connection screen in a clean demo environment.
- **SC-008**: In security review, no flow is found that transmits user credentials or log buffers to third-party services (only user-configured bastion/cluster paths).
- **SC-009**: In a demo, a log window opens in **Structured** by default; the user can switch to **Raw** via a button and back, and can open the analysis panel by clicking a detected **stacktrace** error in Structured view in under **30 seconds**.

## Out of Scope (MVP)

- Exporting logs to downloadable text/files as a product feature.
- Buffer-wide **Analyze** button (MVP analysis is click-on-stacktrace only).
- Component types beyond Pods/Deployments and ConfigMaps (queues, events, other AWS services) — vision only.
- Rules packs for Flask, NestJS, etc. (structure may allow future packs; only Spring Boot ships).
- Mutating cluster operations (exec, apply, delete, scale).
- Generative AI / cloud model analysis of logs.
- Public web hosting as the primary delivery channel.

## Assumptions

- Users already have network/VPN access policies of their company; Faro does not replace corporate network access.
- Users possess a valid SSH PEM file and a local IAM credentials file (Access Key + Secret) managed outside Faro, plus bastion reachability.
- Cluster RBAC grants at least list/get on relevant pods, pod logs, and ConfigMaps for the namespaces they use.
- “Artifact” for live logs means a **Deployment** (or equivalent workload) grouping pods that share that Deployment. Discovery: list Deployments via the Kubernetes Apps API in namespaces the credentials can access; associate Pods via `ownerReferences` / standard replica-set ownership (exact client calls belong in plan/implement, not alternate product meanings).
- One **active** connection instance at a time for browsing; switching instances closes or invalidates prior live windows.
- Namespace scope defaults to what the user’s credentials can list; the UI may offer namespace filter without requiring a single hard-coded namespace.
- Multi-container pods: default container is used unless the user picks another when more than one exists.
- “Spring Boot” rules apply when the user clicks an error write-group/stacktrace (not via mandatory auto-detection of every workload’s language).
- Structured grouping assumes the runtime emits a stacktrace (or other multi-line error) typically as **one write**; if a stacktrace were split across writes, each write is still one Structured entry (edge case).
- Desktop demo without a public URL is acceptable for academic/evaluator review.
- Analysis panel copy prioritizes plain language for non-technical readers (FR-013 / SC-005); broader WCAG accessibility is desirable but not a separate MVP acceptance gate.