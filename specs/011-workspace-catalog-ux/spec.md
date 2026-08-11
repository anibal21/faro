# Feature Specification: Workspace catalog & UI polish

**Feature Branch**: `011-workspace-catalog-ux`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Hay que arreglar las siguientes cosas en la visualización de pods: (1) Replicas/RAM/CPU/Uptime muestran N/D y no leen valores; (2) checkbox Pegar al final mal alineado con el texto; (3) scrolls nativos horribles — custom delgados acordes al diseño; (4) ítems de Pods/ConfigMaps con misma sangría que las glosas — deben ir más a la derecha; (5) ‘following’ en español; (6) exportar log y ConfigMap a archivo de texto; (7) agregar Services y Deployments además de Pods y ConfigMaps."

## Clarifications

### Session 2026-07-29

- Q: What should RAM/CPU in the summary strip represent? → A: Provisioned configuration (requests/limits), not live usage
- Q: How to display RAM/CPU when request and limit both exist? → A: Both as `request / limit` (Option B)
- Q: What text goes into a log export file? → A: Only the Raw chronological buffer (not Structured)
- Q: Catalog accordion section order? → A: Deployments → Pods → Services → ConfigMaps (Option A)
- Q: How to compute RAM/CPU when a Deployment has many pods/containers? → A: Show provisioned metrics for **one pod** (pod template), not multiplied by replica count

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Workload summary shows real metrics (Priority: P1)

An operator opens a Deployment (or equivalent workload) log tab and sees the summary strip with **Replicas**, **RAM**, **CPU**, and **Uptime**. **RAM** and **CPU** reflect **provisioned configuration** for **one pod** (the pod template: requests/limits, shown as `request / limit`), **not** live usage and **not** multiplied by the number of replicas. When those configured values (and replica/uptime data) exist, Faro shows them instead of perpetual “N/D”. “N/D” remains only when a value is genuinely unavailable in configuration/status.

**Why this priority**: The strip is currently misleading—operators cannot trust basic health context while reading logs.

**Independent Test**: Connect (demo or live) → open a workload with known metrics → strip shows non–N/D values where data exists; disconnect or missing metrics still show N/D only for those fields.

**Acceptance Scenarios**:

1. **Given** a connected environment and a workload with known replica counts, **When** the operator opens its log tab, **Then** Replicas shows the actual ready/desired (or product-equivalent) counts, not “N/D”.
2. **Given** resource **requests/limits** are defined on the workload’s **pod template**, **When** the summary strip is shown, **Then** RAM and CPU show provisioned values for **one pod** as **`request / limit`** (with clear units; N/D for a missing side), MUST NOT multiply by replica count, and MUST NOT present live usage as current consumption.
3. **Given** start/ready time is available, **When** the summary strip is shown, **Then** Uptime shows a human-readable duration, not “N/D”.
4. **Given** a metric cannot be obtained, **When** the strip renders, **Then** only that metric shows “N/D” (others still populate if available).

---

### User Story 2 - Stick-to-bottom control layout (Priority: P1)

The “Pegar al final” control shows the checkbox **immediately beside** its label in one horizontal group. The checkbox must not sit at the start of the toolbar row while the label appears at the opposite end.

**Why this priority**: Broken layout looks unfinished and confuses the control.

**Independent Test**: Open a Deployment log tab → visually confirm checkbox and “Pegar al final” text are adjacent; resize window → they stay together.

**Acceptance Scenarios**:

1. **Given** a Deployment log tab is open, **When** the toolbar is visible, **Then** the stick-to-bottom checkbox and its label appear as one adjacent pair.
2. **Given** the toolbar wraps on a narrow window, **When** layout reflows, **Then** the checkbox and label remain grouped (not split across the row).

---

### User Story 3 - Custom scrollbars (Priority: P1)

Scrollable areas in the main workspace (log panes, ConfigMap content, catalog tree, and similar panels) use **thin custom scrollbars** whose colors fit the Faro theme and remain clearly visible in both light and dark themes.

**Why this priority**: Default OS scrollbars clash with the compact professional chrome.

**Independent Test**: Overflow content in logs and ConfigMap → scrollbars are thin, themed, and usable; both themes checked.

**Acceptance Scenarios**:

1. **Given** log content overflows, **When** the operator views Raw or Structured, **Then** the scrollbar is thinner than the default OS bar and uses theme-aligned colors.
2. **Given** ConfigMap or catalog tree content overflows, **When** scrolling, **Then** the same scrollbar style applies consistently.
3. **Given** light or dark theme, **When** scrolling, **Then** the thumb/track remain visible enough to find and drag.

---

### User Story 4 - Catalog tree indentation (Priority: P1)

Items under accordion sections (Deployments, Pods, Services, ConfigMaps) are indented **to the right of** the section title, so hierarchy is visually obvious.

**Why this priority**: Flat alignment with section labels makes the tree hard to scan.

**Independent Test**: Expand a section → child rows sit clearly to the right of the section glosa.

**Acceptance Scenarios**:

1. **Given** an expanded catalog section, **When** items are listed, **Then** each item’s text starts further right than the section title.
2. **Given** multiple sections expanded, **When** comparing, **Then** indentation is consistent across Deployments, Pods, Services, and ConfigMaps.

---

### User Story 5 - Follow status in Spanish (Priority: P2)

Status text that currently shows English “following” (and close variants used for live/demo follow) is shown in **Spanish** so the UI language stays consistent.

**Why this priority**: Mixed language breaks the Spanish operator UX.

**Independent Test**: Open a following log tab → status reads Spanish (e.g. “siguiendo” / “siguiendo (N pods)”), not “following”.

**Acceptance Scenarios**:

1. **Given** a log tab is actively following, **When** the status area is visible, **Then** it does not display the English word “following”.
2. **Given** follow ends or is idle, **When** status updates, **Then** those messages remain Spanish and consistent with existing copy.

---

### User Story 6 - Export log or ConfigMap to a text file (Priority: P1)

The operator can export the **currently loaded Raw log buffer** of a Deployment/pod log tab (chronological text stream, regardless of Structured/Raw UI mode), or a ConfigMap tab’s readable content, to a **local text file** they choose (save dialog). Export is explicit and user-initiated; Faro does not silently write full dumps into app databases.

**Why this priority**: Operators need to share or archive what they see without copy-paste pain.

**Independent Test**: Open logs → Export → save text file → file contains Raw loaded log text; open ConfigMap → Export → file contains keys/values as text.

**Acceptance Scenarios**:

1. **Given** a Deployment (or pod) log tab with loaded content, **When** the operator chooses Export, **Then** a save dialog offers a text file and writing that file succeeds with the **Raw chronological buffer** (not Structured write-groups), even if Structured view is active.
2. **Given** a ConfigMap tab is active, **When** the operator chooses Export, **Then** a text file is saved with the ConfigMap’s keys and values (readable text; binary keys noted as binary/omitted per product rules).
3. **Given** the operator cancels the save dialog, **When** export is aborted, **Then** no file is written and the tab content is unchanged.
4. **Given** export runs, **When** complete, **Then** no credentials/secrets from connection config are added to the file—only the tab’s displayed domain content.

---

### User Story 7 - Catalog sections: Pods, Deployments, Services, ConfigMaps (Priority: P1)

The left catalog accordion includes **four** top-level resource groups, in this order: **Deployments**, **Pods**, **Services**, **ConfigMaps**. Operators can expand each, see items for the connected environment’s namespace scope, and open an appropriate tab:

- **Deployment** → existing log follow workspace (fan-in) as today  
- **Pod** → log view scoped to that pod  
- **Service** → read-only detail tab (name, type, ports, selectors / cluster IP as available)  
- **ConfigMap** → existing ConfigMap tab  

**Why this priority**: Operators asked to navigate the same resource types they use daily in the cluster.

**Independent Test**: After connect, expand each of the four sections → items list → open one of each type → correct tab/behavior.

**Acceptance Scenarios**:

1. **Given** a connected environment, **When** the catalog is shown, **Then** four sections exist in order: Deployments, Pods, Services, ConfigMaps.
2. **Given** Deployments are listed, **When** the operator opens one, **Then** the Deployment log workspace opens (follow / structured / raw as today).
3. **Given** Pods are listed, **When** the operator opens one, **Then** a log tab opens for that pod’s logs.
4. **Given** Services are listed, **When** the operator opens one, **Then** a read-only Service detail tab opens (no mutating actions).
5. **Given** ConfigMaps are listed, **When** the operator opens one, **Then** the existing ConfigMap tab behavior remains.
6. **Given** a section has no items, **When** expanded, **Then** an empty state is shown (not a crash or silent demo injection on live).

---

### Edge Cases

- Metrics partially available: mix of real values and N/D per field; RAM/CPU N/D when the pod template has no resource requests/limits; many replicas still show one-pod provisioned RAM/CPU.
- Demo environment: summary metrics may be synthetic but must not all stay N/D if demo fixtures can supply values; follow status still Spanish.
- Export with empty buffer: Export disabled or saves an empty/minimal file with a clear outcome—prefer disable with short explanation.
- Very large in-memory log buffer: export may take a moment; UI remains responsive enough to cancel the dialog; no upload off-machine.
- Live RBAC: if Services/Deployments/Pods list fails, show actionable error in that section without breaking other sections.
- Stick-to-bottom label wrapping: keep control usable on narrow toolbars.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workload summary strip MUST display Replicas, RAM, CPU, and Uptime from available session/cluster **configuration and status** when present; MUST use “N/D” only when that specific value is unavailable. RAM and CPU MUST represent **provisioned** resources for **one pod** (pod template requests/limits as **`request / limit`**, N/D for a missing side), MUST NOT scale by replica count, and MUST NOT use live usage metrics. When the pod template has multiple containers, values MUST be the **sum across containers of that one pod**.
- **FR-002**: The stick-to-bottom control MUST render checkbox and label as an adjacent horizontal group.
- **FR-003**: Primary scrollable workspace surfaces MUST use thin, theme-aligned custom scrollbars that remain visible in light and dark themes.
- **FR-004**: Catalog child items MUST be indented further right than their section title.
- **FR-005**: Follow-related status strings shown to the operator MUST be in Spanish (no English “following”).
- **FR-006**: Deployment/pod log tabs MUST offer Export to a user-chosen local text file containing the currently loaded **Raw** chronological log content only (MUST NOT export Structured write-group formatting as the file body).
- **FR-007**: ConfigMap tabs MUST offer Export to a user-chosen local text file containing readable key/value content.
- **FR-008**: Canceling the export save dialog MUST NOT write a file.
- **FR-009**: Export MUST NOT include connection secrets (PEM/IAM material, tokens); only tab domain content.
- **FR-010**: The catalog MUST list four sections in this order: Deployments, Pods, Services, ConfigMaps.
- **FR-011**: Opening a Deployment MUST open the existing Deployment log workspace behavior.
- **FR-012**: Opening a Pod MUST open a log tab scoped to that pod.
- **FR-013**: Opening a Service MUST open a read-only Service detail tab.
- **FR-014**: Listing and opening catalog resources MUST remain read-only (no create/update/delete of cluster objects).
- **FR-015**: Export is operator-initiated local save only; Faro MUST NOT auto-persist full log dumps into SQLite as part of this feature.

### Key Entities

- **Workload summary**: Replica counts; provisioned memory/CPU for **one pod** as `request / limit` (sum containers in the pod template; never × replicas); uptime (or N/D per field) — not live usage samples.
- **Catalog section**: Named group in fixed order (Deployments → Pods → Services → ConfigMaps) with indented child items.
- **Service detail**: Read-only view of a Service’s identifying and networking attributes.
- **Export artifact**: Local text file chosen by the operator; log exports = Raw buffer only; ConfigMap exports = readable key/value text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a guided check on a workload with known configured resources, at least Replicas and provisioned RAM/CPU as `request / limit` for **one pod** (when defined) populate in 100% of trials; values are not multiplied by replica count; Uptime populates when start/ready time is available (N/D only when missing). Strip does not claim live usage.
- **SC-002**: In a visual review, 100% of reviewers confirm stick-to-bottom checkbox and label are adjacent (not split across the toolbar).
- **SC-003**: In a visual review of overflow panes, 100% of reviewers confirm thinner themed scrollbars vs default OS bars, visible in both themes.
- **SC-004**: Catalog children are visibly indented past section titles in 100% of expanded-section checks.
- **SC-005**: With follow active, status contains no English “following” in 100% of checks.
- **SC-006**: Export log produces a readable local text file matching the **Raw** loaded buffer (not Structured view) in 100% of save-completed trials; Export ConfigMap matches on-screen readable keys/values; cancel writes 0 files.
- **SC-007**: After connect, operators can open at least one item from each of Pods, Deployments, Services, and ConfigMaps with the behaviors above in a scripted walkthrough.

## Assumptions

- RAM/CPU on the summary strip are **provisioned** configuration for **one pod** (`request / limit`, sum of containers in the pod template), never × replicas and never live usage from a metrics API in this feature.
- Catalog section order is **Deployments → Pods → Services → ConfigMaps**.
- “Pods” section lists individual pods; “Deployments” lists Deployments (Deployment open keeps today’s fan-in log workspace).
- Service detail is informational only (ports, type, selectors, cluster IP when available)—no port-forward or mutate.
- Export of logs writes only the **Raw** chronological buffer already loaded in the tab (not Structured grouping, not a full historical re-download beyond the buffer).
- Spanish status for follow uses wording consistent with the rest of the UI (e.g. “siguiendo” / “siguiendo (N pods)”).
- Custom scrollbars apply to main workspace surfaces; OS-native dialogs (export save) may keep OS chrome.
- Builds on existing live/demo connect and log workspace from prior features; does not change bastion/IAM secret handling.
- Constitution: read-only cluster access; local export is user-directed file save on their machine, not third-party exfiltration and not SQLite full-dump persistence.
