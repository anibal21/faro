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

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage connection instances (Priority: P1)

A colleague who accesses several company environments (each with its own bastion host) opens Faro and creates a **connection instance** per environment: bastion host, SSH identity file path, cloud account settings needed to reach the cluster, and cluster identity. They can add as many instances as they have access to, edit them, and pick which one is active. Secrets themselves are never pasted into a shareable store—only references the user already has on their machine.

**Why this priority**: Without saved connections, every session requires repeating fragile manual setup; this is the gateway to all value.

**Independent Test**: Create two instances, restart the app, select each, and confirm details persist and only the selected instance is used for the next connect attempt.

**Acceptance Scenarios**:

1. **Given** a first-time user, **When** they create a connection instance with required fields and save, **Then** it appears in their instance list and survives app restart.
2. **Given** multiple saved instances, **When** they select one and connect, **Then** Faro uses only that instance’s bastion and cluster settings.
3. **Given** a saved instance, **When** they edit host or file path and save, **Then** subsequent connects use the updated values.
4. **Given** any instance, **When** data is stored, **Then** only local file paths and non-secret identifiers are retained—not the contents of PEM or IAM credential files.

---

### User Story 2 - Connect and browse Pods & ConfigMaps (Priority: P1)

After connecting through the active instance’s bastion, the user chooses a **component type**. For the MVP they can choose **Pods** (presented via workloads/Deployments) or **ConfigMaps**. They browse what their access allows, filter by name, and open the item they care about—without using a separate terminal for SSH or cluster CLI.

**Why this priority**: Discoverability of artifacts is the core monitoring job; Pods + ConfigMaps are the agreed MVP catalog.

**Independent Test**: With a valid instance, connect, switch between Pods and ConfigMaps, filter a known name, and open one item of each type.

**Acceptance Scenarios**:

1. **Given** a valid connection instance, **When** the user connects successfully, **Then** they see a component-type choice including Pods and ConfigMaps.
2. **Given** component type Pods, **When** the list loads, **Then** workloads/Deployments the user can access are listed (not requiring the user to SSH manually).
3. **Given** component type ConfigMaps, **When** the list loads, **Then** ConfigMaps in accessible namespaces are listed and the user can open a read-only view of keys/values they are allowed to see.
4. **Given** a long list, **When** the user filters by name, **Then** matching items remain visible and others are hidden.
5. **Given** bastion unreachable, bad key path, or insufficient cloud/cluster permissions, **When** connect or list fails, **Then** the user sees a clear, non-technical error and can retry or switch instance.

---

### User Story 3 - Live aggregated logs per Deployment (Priority: P1)

When the user opens logs for a **Deployment / workload artifact**, Faro shows **one window** for that artifact. Logs from all replicas (pods) of that Deployment appear in that single window, updating continuously as new log lines are written. The user can open several such windows for different artifacts at once. They can search within the buffer and keep watching without refreshing manually.

Each log window MUST offer **two view modes** the user can switch between:

1. **Raw view** — a fast, simple, terminal-like stream (as if watching `kubectl logs -f` / a console tail).
2. **Structured view** — the same live feed presented with **severity** and **detail** fields; when a line is detected as an **error**, it is actionable (clickable) so the user can invoke the rules engine for that line/context.

**Why this priority**: This is the primary “monitor without terminal” outcome; aggregation, live update, and dual raw/structured viewing were explicit product decisions.

**Independent Test**: Open one Deployment with ≥2 replicas; confirm a single window shows interleaved lines from replicas and new lines appear without manual refresh; switch between Raw and Structured modes; open a second artifact window concurrently.

**Acceptance Scenarios**:

1. **Given** a Deployment with multiple replicas, **When** the user opens its logs, **Then** a single window shows combined output from those replicas, with each line attributable to a replica/pod identity.
2. **Given** an open log window, **When** the workload writes new logs, **Then** the window updates continuously without the user pressing refresh (in the active view mode).
3. **Given** two artifacts, **When** the user opens both, **Then** each has its own live window updating independently.
4. **Given** visible logs, **When** the user searches for text, **Then** matching lines are highlighted or filtered according to the search control in the active view.
5. **Given** a Deployment with zero ready pods, **When** the user opens logs, **Then** the UI explains there is nothing to stream yet and recovers when pods appear (if still open).
6. **Given** an open log window, **When** it first opens, **Then** **Structured** view is active by default.
7. **Given** an open log window, **When** the user activates **Raw** via the dedicated control (button), **Then** they see an unmodified terminal-like dump of the stream (no grouping/columns/manipulation).
8. **Given** Structured view, **When** the pod writes to the log, **Then** each **write** appears as one structured entry (severity/detail); a typical stacktrace write is one entry.
9. **Given** Structured view and a write-group marked as a likely error (e.g. stacktrace write), **When** the user clicks it, **Then** the full rules engine runs for that group and a panel shows severity, plain-language explanation, and recommendation.

---

### User Story 4 - Spring Boot rules analysis (plain language) (Priority: P2)

Analysis is available from **Structured** view by **clicking a write-group** (typically a complete stacktrace write) that lightweight live detection marked as a likely error. Faro then applies the **full** **Spring Boot** rules engine for that group. Matches show severity, a **simple explanation** for non-technical readers, and a recommended action. No generative model is required; analysis runs locally. A separate **buffer-wide Analyze** control is **out of scope for MVP**.

**Why this priority**: Differentiates Faro from a raw tail; click-to-analyze on error write-groups/stacktraces is the primary path for non-technical users.

**Independent Test**: In Structured view, click a known Spring Boot error **stacktrace write-group**; panel shows severity, plain explanation, and recommended action.

**Acceptance Scenarios**:

1. **Given** Structured view with a stacktrace marked as a likely error, **When** the user clicks that stacktrace block, **Then** a findings panel shows severity, short plain-language explanation, and recommended action for that stacktrace.
2. **Given** no matching rules for the clicked stacktrace, **When** analysis runs, **Then** they see an explicit empty/no-match result (not a crash).
3. **Given** analysis results, **When** shown to a non-technical colleague, **Then** explanations avoid unexplained jargon or define it in plain terms.
4. **Given** the MVP UI, **When** inspecting the log window chrome, **Then** there is **no** buffer-wide Analyze button (click-on-stacktrace is the analysis entry point).

---

### User Story 5 - Installable desktop on major OSes (Priority: P3)

The product is delivered as a **desktop application** with installable/runnable packages for **Windows, macOS, and Linux**, so colleagues can run Faro without a public web URL.

**Why this priority**: Required product shape for distribution; can be validated after core flows exist.

**Independent Test**: Obtain the package for each target OS and launch Faro to the connection screen.

**Acceptance Scenarios**:

1. **Given** a supported OS package, **When** the user installs or runs it per project instructions, **Then** Faro starts and reaches the connection-instance UI.
2. **Given** no public hosted URL, **When** evaluators review the product, **Then** a live or recorded desktop demo plus local install instructions suffice.

---

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
- **FR-013**: Each analysis finding MUST include severity, plain-language explanation (suitable for non-technical readers), and a recommended action.
- **FR-014**: Analysis MUST run locally on content already available in the app; it MUST NOT send log content or credentials to external AI/telemetry services.
- **FR-015**: The product MUST be distributable as desktop executables/installers for Windows, macOS, and Linux.
- **FR-016**: On connection/list/log failures, the system MUST show actionable errors without exposing secret material.
- **FR-017**: Log **export to files** is **OUT OF SCOPE** for this MVP; Faro MUST NOT advertise export as a feature in v1 (users who copy text themselves do so outside the product’s responsibility).
- **FR-018**: Each log window MUST provide a **Raw** view that shows the live stream **exactly as terminal output** — **no** reformatting, grouping, severity columns, or other manipulation.
- **FR-019**: Each log window MUST provide a **Structured** view that groups the live stream by **each write** to the log (one write → one structured entry). A Spring/Java stacktrace is typically emitted as a single write and therefore appears as one group.
- **FR-020**: In Structured view, the system MUST apply **lightweight live detection** on each write-group so likely **errors** (including stacktrace writes) are visually marked and **clickable**; clicking MUST invoke the **full** Spring Boot rules engine for that write-group/stacktrace and show a panel with severity, plain-language explanation, and recommendation (live follow MUST remain usable while only lightweight detection runs continuously).
- **FR-021**: Users MUST be able to switch between Raw and Structured views for the same log window without losing the live follow session.
- **FR-022**: When a log window opens, it MUST start in **Structured** view; **Raw** MUST be reachable via an explicit control (e.g. button), not as the default.
- **FR-023**: On application launch, Faro MUST first show a **minimal splash window** with the product name **Faro**, a **background image** (lighthouse / brand visual, full-bleed within the splash window; concrete image asset is supplied at implementation), the tagline *Herramienta de monitoreo infraestructura para ambiente AWS*, and a preparing status (*…preparando aplicación*) before the main workspace appears.
- **FR-024**: During the splash, Faro MUST purge leftover **ephemeral session / log-related** local data from a prior run (including dirty exit). Faro MUST **NOT** delete durable data needed across sessions: connection instances (environments), UI preferences, light analysis history metadata, or schema metadata. After purge completes, the main window MAY open.

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
- “Artifact” for live logs means a **Deployment** (or equivalent workload) grouping pods that share that Deployment.
- One **active** connection instance at a time for browsing; switching instances closes or invalidates prior live windows.
- Namespace scope defaults to what the user’s credentials can list; the UI may offer namespace filter without requiring a single hard-coded namespace.
- Multi-container pods: default container is used unless the user picks another when more than one exists.
- “Spring Boot” rules apply when the user clicks an error write-group/stacktrace (not via mandatory auto-detection of every workload’s language).
- Structured grouping assumes the runtime emits a stacktrace (or other multi-line error) typically as **one write**; if a stacktrace were split across writes, each write is still one Structured entry (edge case).
- Desktop demo without a public URL is acceptable for academic/evaluator review.
