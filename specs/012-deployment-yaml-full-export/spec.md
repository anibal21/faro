# Feature Specification: Deployment YAML, Pod Logs & Full Export

**Feature Branch**: `012-deployment-yaml-full-export`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Los deployments deben traer la información del deployment (la configuración un archivo yaml), y los pods deben traer el log de todas las réplicas por pod cómo teníamos antes. EL log de la derecha dice iniciando, si no va a aportar nada sácalo nomás. y la ram y el cpu deberían salir de la información del deployment, no es necesario que esté full actualizado. Se debe exportar todo el log, no lo que está cargando solamente."

## Clarifications

### Session 2026-07-30

- Q: What should Deployments vs Pods catalog open? → A: **Deployments menu = YAML only** (no log stream / no Logs tab on Deployment). **Pods menu = logs as before**: opening a Pod that belongs to a Deployment fans in **all replica pods** of that owner Deployment with per-pod attribution (same multi-replica follow experience previously tied to opening a Deployment). Orphan / unowned pods open a single-pod follow only.
- Q: What does “export the full log” include? → A: **Option A** — On Export, Faro MUST gather by paging until the cluster has no more older history for the tab’s pods (exhaust available kube log history for that scope), then write that full gathered Raw text—not only the in-memory / on-screen buffer after initial load.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Open Deployment as YAML configuration (Priority: P1)

An operator expands the catalog, clicks a **Deployment**, and sees **only** that Deployment’s **configuration** as a readable **YAML** document. The Deployments menu MUST NOT open live logs or a Logs tab—YAML is the sole open result.

**Why this priority**: Separates “what is configured” from “what is logging”; matches the locked catalog rule for Deployments.

**Independent Test**: Connect (or demo) → open a known Deployment → YAML only; no follow status, no Raw/Structured log chrome for that open.

**Acceptance Scenarios**:

1. **Given** a connected environment with at least one Deployment, **When** the operator opens that Deployment from the **Deployments** catalog section, **Then** the workspace shows a read-only YAML view of that Deployment’s configuration and **does not** start a log follow for it.
2. **Given** the YAML view is open, **When** the operator compares it to the cluster resource they expect, **Then** name, namespace, and core spec fields (replicas, containers, resources, etc.) are present in the document.
3. **Given** the Deployment cannot be fetched, **When** open fails, **Then** a clear error is shown without secret material.

---

### User Story 2 — Pods menu restores multi-replica logs (Priority: P1)

An operator uses the **Pods** catalog menu to open logs. Behavior matches the **previous** multi-replica experience: for a Pod owned by a Deployment, Faro follows **all replica pods** of that Deployment, with lines attributable **per pod**. Deployments no longer own that log path.

**Why this priority**: Moves the prior Deployment fan-in logs to Pods while Deployments stay YAML-only.

**Independent Test**: Open a Pod under a multi-replica Deployment from **Pods** → see output from each replica, labeled by pod (as before when opening the workload for logs).

**Acceptance Scenarios**:

1. **Given** a Deployment with multiple ready replica pods, **When** the operator opens **any** of those pods from the **Pods** catalog section, **Then** logs from **all** matching replica pods of that Deployment appear, with pod identity visible per line or group.
2. **Given** only one replica exists (or an orphan pod with no Deployment owner), **When** they open that pod from **Pods**, **Then** logs for that single pod still work.
3. **Given** some replicas have no log yet, **When** others emit lines, **Then** the view still updates for the pods that produce output without blocking the whole tab.

---

### User Story 3 — Summary RAM/CPU from Deployment config (Priority: P1)

While viewing a log tab that is tied to a Deployment (or its pods), the summary strip shows **Replicas** and **RAM/CPU taken from the Deployment’s configured resources** (requests/limits on the pod template). Values do **not** need to be live cluster usage metrics; static/configured figures are enough. Missing fields show **N/D**.

**Why this priority**: Operators already asked for provisioned figures; this locks the source as Deployment configuration, not a live metrics pipeline.

**Independent Test**: Open a Deployment-linked log view whose template defines requests/limits → strip shows those (e.g. request/limit style); no requirement that numbers match live usage APIs.

**Acceptance Scenarios**:

1. **Given** a Deployment with memory/CPU requests and limits on its template, **When** the summary strip is shown for that workload’s log context, **Then** RAM and CPU reflect that configured information (not live usage).
2. **Given** requests or limits are absent, **When** the strip renders, **Then** the missing side shows N/D (or the whole pair is N/D per existing product rules).
3. **Given** replica counts are known from the Deployment, **When** the strip renders, **Then** Replicas reflects configured/ready counts available from that Deployment info.

---

### User Story 4 — Export the full log, not only the loaded window (Priority: P1)

An operator clicks **Export** on a log tab. Faro **pages older history until the cluster has nothing more** for that tab’s pods (exhaust available history), then offers a local text file with that **full gathered Raw log**—not merely the partial buffer already on screen.

**Why this priority**: Partial exports mislead incident handoffs; the user rejected “only what’s currently loaded.”

**Independent Test**: Follow a chatty workload with history deeper than the initial buffer; Export without manually clicking “load older” for every page → file contains lines beyond the initial on-screen set (markers/count prove exhaustion gather ran).

**Acceptance Scenarios**:

1. **Given** a log tab with more history available in the cluster than currently held in memory, **When** the operator exports, **Then** Faro gathers until history is exhausted for those pods and the saved file includes that full gathered content—not only the pre-export buffer.
2. **Given** the operator cancels the save dialog (or aborts export before a file is written), **When** cancel completes, **Then** no file is written.
3. **Given** export fails (disk/permission/gather error), **When** the error is shown, **Then** no secret material appears in the message.

---

### User Story 5 — Remove non-useful “iniciando” status chrome (Priority: P2)

The right-side log chrome currently shows a status such as **“iniciando”** that does not help the operator. If that status does not convey actionable follow state, it is **removed** (errors and truly useful follow states may remain if they help; transient empty “starting” noise must go).

**Why this priority**: Reduces clutter; quick win once open behaviors and export are defined.

**Independent Test**: Open a log tab → no persistent “iniciando” label in the toolbar/status area during normal follow start.

**Acceptance Scenarios**:

1. **Given** a log tab is opening or following normally, **When** the operator looks at the right-hand log chrome, **Then** they do not see a useless “iniciando” (or equivalent idle/starting) status.
2. **Given** a real follow failure, **When** the error is known, **Then** an actionable error message may still appear (without secrets).

---

### Edge Cases

- Deployment YAML fetch fails or times out → error state; catalog siblings remain usable.
- Workload with zero pods → empty log state; YAML for Deployment may still open.
- Export gather may be large or slow → UI MUST indicate progress; operator can abort without writing a file; no full dump persisted into SQLite.
- Demo environment → Deployment YAML and pod logs use demo fixtures consistent with prior demo behavior.
- Opening the same Deployment’s different replica pods from **Pods** may open equivalent fan-in tabs (same owner scope); product MAY reuse an existing tab for that owner Deployment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Opening a **Deployment** from the **Deployments** catalog section MUST open a read-only **YAML configuration** view only. It MUST NOT open or start a log follow / Logs tab for that Deployment.
- **FR-002**: Opening a **Pod** from the **Pods** catalog section MUST restore the previous multi-replica log experience: if the pod has a Deployment owner, follow **all replica pods** of that Deployment with **per-pod attribution**; if the pod has no Deployment owner, follow that pod only.
- **FR-003**: Log follow entry points for workloads MUST be via the **Pods** menu (not via Deployments).
- **FR-004**: The workload summary strip MUST source **RAM and CPU from Deployment configuration** (pod template resources); live usage metrics are OUT OF SCOPE for this feature. Freshness beyond “whatever the Deployment document last provided this session” is NOT required.
- **FR-005**: Replicas (and ready counts when known) MUST come from Deployment status/spec information already used for summary—not from a separate live metrics product.
- **FR-006**: Log **Export** MUST, before writing, **page older history until exhausted** for the tab’s pods (all history the cluster still exposes for that scope), then write a local Raw text file of that full gather—not only the lines held in the visible/in-memory partial buffer after initial load.
- **FR-007**: Export cancel (save dialog cancel or abort before write) MUST write nothing; failures MUST NOT leak secrets.
- **FR-008**: The log toolbar MUST **not** show a non-actionable **“iniciando”** (or equivalent starting) status during normal operation; remove it if it adds no value.
- **FR-009**: Deployment YAML and log/export content MUST remain local / user-infrastructure only (no exfiltration); YAML and logs MUST NOT be auto-persisted as full dumps in durable app storage.
- **FR-010**: Existing catalog sections (Services, ConfigMaps) remain available; this feature does not remove them.

### Key Entities

- **Deployment configuration document**: Read-only YAML (or equivalent textual YAML) of the Deployment resource for the selected namespace/name.
- **Replica pod log stream**: Combined or parallel follow of pods belonging to a Deployment/workload, with pod identity on each contribution.
- **Workload summary (configured)**: Replicas + RAM/CPU from Deployment template/status; Uptime may remain N/D when unknown.
- **Full log export artifact**: Local text file of Raw (or product-standard) log text for the full export scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a demo or connected session, an operator opens a Deployment and sees recognizable YAML configuration for that resource within **10 seconds** of the open action under normal local conditions.
- **SC-002**: For a workload with **≥2** replica pods emitting lines, the multi-replica log view shows output attributable to **each** replica within **30 seconds** of open/follow start (demo or live).
- **SC-003**: When Deployment template resources are defined, **100%** of acceptance checks show strip RAM/CPU from that configuration (not live usage), with N/D only when the Deployment omits the field.
- **SC-004**: After export where cluster history is deeper than the initial on-screen buffer, the saved file includes content beyond that buffer (line count or markers)—proving exhaustion gather—on first attempt in the test plan.
- **SC-005**: In normal follow start, **0** occurrences of a visible “iniciando” (or equivalent non-actionable starting) status in the log chrome across the acceptance pass.
- **SC-006**: Cancelled export leaves **no** new file on disk in **100%** of cancel trials.

## Assumptions

- Bastion + path-only IAM (or current auth) and read-only cluster access remain as today; this feature does not introduce SSO.
- “YAML” means the Deployment’s configuration document as returned for read/observe (may be normalized); operators accept read-only viewing.
- Structured vs Raw log modes continue to exist for log tabs; export of logs remains **Raw text** unless a later clarify changes that (aligned with prior export decision).
- ConfigMap export behavior is unchanged unless touched incidentally.
- Demo mode provides enough Deployment YAML and multi-pod log content to demonstrate SC-001/SC-002 without a live cluster.
- Uptime may remain N/D when not available from Deployment info; not a blocker for this feature.

## Out of Scope

- Live cluster CPU/memory **usage** metrics (metrics-server, etc.).
- Editing/applying Deployment YAML back to the cluster.
- SSO / auto-refresh of AWS portal credentials.
- Persisting full log dumps or full YAML into SQLite for history.
- Changing Services/ConfigMap open semantics beyond what is needed for consistency.
