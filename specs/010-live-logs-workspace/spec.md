# Feature Specification: Live logs workspace UX

**Feature Branch**: `010-live-logs-workspace`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Agreguemos a la especificación todo lo que acordamos ahora para que quede en la documentación, y además necesitamos los siguientes arreglos: (1) switch para auto-scroll al final de los logs vs navegar libremente; (2) ConfigMaps deben usar la altura máxima disponible sin un panel inferior sobredimensionado."

## Clarifications

### Session 2026-07-29

- Q: If stick-to-bottom is on and the operator scrolls up, what happens? → A: Scroll up automatically turns the stick-to-bottom switch off (Option A)
- Q: How much historical log content on open, and can the operator load more? → A: Last 500 lines initially; operator can manually load another 500 repeatedly until the beginning
- Q: With multiple pods, what does each “load older 500” request fetch? → A: About 500 older lines per Pod (Option A)
- Q: When older history is prepended, what happens to scroll position? → A: Preserve the operator’s reading position (Option A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Live Deployment logs follow continuously (Priority: P1)

An operator connected to a **live** environment opens a Deployment log tab. Faro shows recent existing log content and **keeps updating** while that tab remains open (Structured and Raw). Closing the tab (or disconnecting) stops the follow. Multiple pods belonging to that Deployment contribute to the same tab (fan-in), clearly attributable per pod.

**Why this priority**: Operators already saw finite one-shot dumps; continuous follow is the core live log promise.

**Independent Test**: Connect live → open a Deployment with active pods → see recent lines → generate new log lines on the cluster → they appear without reopening the tab; close tab → updates stop.

**Acceptance Scenarios**:

1. **Given** a live connected environment and a Deployment with at least one running Pod, **When** the operator opens that Deployment’s log tab, **Then** they see the most recent historical log content capped at about **500 lines** per matching Pod (not an empty wait forever, and not an unbounded dump).
2. **Given** that tab remains open, **When** the application writes new log lines, **Then** those lines appear in Raw and Structured without reopening the tab.
3. **Given** the Deployment has multiple matching Pods, **When** logs stream, **Then** the tab includes content from those Pods (fan-in), each line/group attributable to a Pod name.
4. **Given** the operator closes the log tab (or disconnects the environment), **When** follow was active, **Then** Faro stops consuming new log updates for that tab.
5. **Given** no matching Pods, **When** the operator opens the Deployment log tab, **Then** they see a clear empty/error status (not silent demo sample logs).
6. **Given** older log content still exists beyond the current buffer, **When** the operator explicitly requests more history, **Then** Faro loads about **500 additional older lines per matching Pod** (prepended into the fan-in view), repeatable until each Pod’s available beginning is reached; when no older content remains for the tab, the control indicates that clearly.
7. **Given** the operator requests more older history while viewing mid-buffer content, **When** older lines are prepended, **Then** the viewport keeps the same reading position (does not jump to the absolute top or to the newest end).

---

### User Story 2 - Structured groups Spring Boot–style errors usefully (Priority: P1)

In Structured mode, live (and demo) logs are presented as **write-groups**: ordinary log entries and exception/stacktrace blocks stay together so the operator can click a group to run local Spring Boot analysis. Structured is not a single undifferentiated dump of the entire history.

**Why this priority**: Operators reported Structured “not working” with real Spring Boot logs when everything was one mega-block.

**Independent Test**: Open logs containing a multiline stacktrace → Structured shows that stacktrace as one clickable group (marked as error when appropriate) separate from surrounding INFO lines.

**Acceptance Scenarios**:

1. **Given** log content with a Spring-style ERROR plus following stack frames (`at …` / `Caused by`), **When** Structured view is active, **Then** those lines appear as **one** write-group.
2. **Given** subsequent independent INFO/WARN/ERROR entries, **When** Structured view is active, **Then** they appear as separate groups (not glued into the previous stacktrace).
3. **Given** a marked error group, **When** the operator clicks it, **Then** local analysis runs on that group’s text (same product rules as today—no external AI).
4. **Given** Raw view, **When** the operator toggles to Raw, **Then** they see the chronological text stream without losing the underlying follow session.

---

### User Story 3 - Auto-scroll switch for the log terminal (Priority: P1)

The log viewing area offers a **switch** (or equivalent control) so the operator can either:
- **Stick to bottom** (auto-scroll): the viewport stays pinned to the newest messages as they arrive; or
- **Free navigate**: the operator can scroll up to read older content **without** being yanked back to the end when new lines arrive.

**Why this priority**: Continuous follow is unusable for investigation if the view always jumps to the bottom.

**Independent Test**: With follow active, disable stick-to-bottom → scroll up → new lines arrive but scroll position stays; re-enable → viewport jumps/stays at the newest content.

**Acceptance Scenarios**:

1. **Given** a Deployment log tab with stick-to-bottom **on**, **When** new log content arrives, **Then** the viewport remains at (or moves to) the newest content.
2. **Given** stick-to-bottom **off**, **When** the operator scrolls to older content and new lines arrive, **Then** their scroll position is preserved (not forced to the end).
3. **Given** the operator toggles stick-to-bottom from off to on, **When** the toggle turns on, **Then** the viewport moves to the newest content.
4. **Given** a newly opened Deployment log tab, **When** the tab opens, **Then** stick-to-bottom defaults to **on** (follow-friendly default).
5. **Given** Structured or Raw mode, **When** the switch is used, **Then** the same stick-to-bottom preference applies to the active log content area for that tab.
6. **Given** stick-to-bottom **on**, **When** the operator scrolls upward away from the newest content, **Then** Faro automatically turns the stick-to-bottom switch **off** so further arrivals do not yank the viewport.

---

### User Story 4 - ConfigMap tabs use full content height (Priority: P1)

When a ConfigMap tab is active, the workspace shows ConfigMap keys/values using the **maximum practical height** of the main content area. There is **no** large empty lower panel (e.g. analysis drawer chrome reserved for logs) crowding the ConfigMap view.

**Why this priority**: Operators see an oversized empty bordered panel under ConfigMaps, wasting space.

**Independent Test**: Open a ConfigMap with several keys → content area fills available height below the tab strip; no large empty analysis-style panel below.

**Acceptance Scenarios**:

1. **Given** a ConfigMap tab is active, **When** the operator views the workspace, **Then** ConfigMap content occupies the available main pane height (scroll inside the content if needed).
2. **Given** a ConfigMap tab is active, **When** the layout is inspected, **Then** there is no large empty lower panel reserved for log analysis.
3. **Given** the operator switches from a Deployment log tab (with analysis UI) to a ConfigMap tab, **When** ConfigMap is shown, **Then** the ConfigMap layout does not inherit the empty analysis panel footprint.
4. **Given** the operator switches back to a Deployment log tab, **When** logs are shown, **Then** log + analysis layout for Deployments remains available as before this feature’s ConfigMap fix.

---

### User Story 5 - Live auth uses bastion identity for Kubernetes (documented agreement) (Priority: P2)

For live connect, Faro obtains the short-lived Kubernetes bearer token using the **bastion’s** cloud identity (the same path operators already use successfully with cluster tools on the bastion), while still using the operator’s configured local IAM file only for cluster discovery metadata needed to open the session (endpoint/CA). Operators without rights to change cluster access maps can still use Faro when bastion access already works for them.

**Why this priority**: Agreed in session so Faro works without new cluster IAM mapping for the laptop user.

**Independent Test**: With bastion kubectl already able to list resources, Faro live connect hydrates catalog/logs without requiring additional cluster access entries for the laptop IAM user.

**Acceptance Scenarios**:

1. **Given** bastion-side cluster access already works for the operator’s bastion login, **When** they connect the matching live environment in Faro, **Then** catalog/log access does not depend on mapping their laptop IAM user into the cluster.
2. **Given** token minting on the bastion fails, **When** connect or log open fails for that reason, **Then** the error is actionable and does not expose secrets.

---

### Edge Cases

- Pod restarts / new pods appear during follow: Faro should reasonably include matching pods for the Deployment without requiring the operator to reopen (best-effort; brief gaps acceptable).
- Very high log volume: UI remains usable (scroll/search still work; stick-to-bottom can be turned off); Faro may bound retained in-memory chunks for the tab without writing full dumps to durable storage.
- Load-older history: each manual request prepends about 500 older lines **per matching Pod**; if the platform cannot page further for a Pod, that Pod contributes nothing more; when all matching Pods have reached the beginning, Faro shows that clearly (no silent no-op). Viewport stays on the content the operator was reading while older lines prepend.
- ConfigMap with many/large keys: content scrolls within the expanded main pane; truncated values still follow existing product rules.
- Demo environment: continuous follow and Structured grouping remain available for offline demos; stick-to-bottom switch applies there too.
- Stick-to-bottom off at bottom of stream: new lines may extend content below the fold until the operator scrolls or re-enables stick-to-bottom.
- Stick-to-bottom on + operator scrolls up: the switch turns off automatically; the operator can turn it back on to jump to newest content.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For live environments, opening a Deployment log tab MUST show recent existing logs (about the last **500 lines** per matching Pod) and MUST continue receiving new logs while the tab remains open.
- **FR-001a**: The Deployment log tab MUST offer an explicit control to load about **500 additional older lines per matching Pod** at a time, repeatable until the available beginning of each pod’s log is reached; when no older content remains for the tab, Faro MUST indicate that clearly.
- **FR-001b**: When older history is prepended, Faro MUST preserve the operator’s current reading position in the viewport (no jump to absolute top or newest end).
- **FR-002**: Live Deployment log follow MUST stop when the tab is closed or the environment session ends.
- **FR-003**: Live Deployment logs MUST fan-in matching Pods for that Deployment into the same tab, with Pod identity visible on content.
- **FR-004**: Structured mode MUST group exception/stacktrace continuations with their triggering entry (write-groups), not treat an entire history dump as a single undifferentiated group by default.
- **FR-005**: Raw mode MUST show the chronological text stream for the same follow session as Structured.
- **FR-006**: Each Deployment log tab MUST provide a stick-to-bottom / free-navigate **switch** (or equivalent) controlling auto-scroll to newest messages.
- **FR-007**: Stick-to-bottom MUST default to **on** for newly opened Deployment log tabs.
- **FR-008**: With stick-to-bottom off, arriving log content MUST NOT force the viewport to the end.
- **FR-008a**: When stick-to-bottom is on and the operator scrolls upward away from the newest content, Faro MUST automatically turn stick-to-bottom **off**.
- **FR-009**: When a ConfigMap tab is active, ConfigMap content MUST use the maximum practical height of the main content area.
- **FR-010**: When a ConfigMap tab is active, the workspace MUST NOT show a large empty lower analysis/log panel reserved for Deployment log analysis.
- **FR-011**: Live Kubernetes API authentication for session operations that require a bearer token MUST use a token obtained via the bastion identity path (per US5), without requiring new cluster access mapping solely for the laptop IAM user when bastion access already works.
- **FR-012**: Faro MUST NOT persist full log dumps or secret material; in-tab buffers remain ephemeral session memory only.
- **FR-013**: Demo follow and Structured/Raw behaviors MUST remain available for offline demonstration, including the stick-to-bottom switch.

### Key Entities

- **Deployment log tab**: Ephemeral UI session for one Deployment’s fan-in follow; holds view mode (Structured/Raw), search, stick-to-bottom preference, and in-memory log chunks.
- **Write-group**: Operator-facing Structured unit (one log entry or entry+stacktrace) eligible for click-to-analyze.
- **ConfigMap tab**: Workspace tab showing ConfigMap keys/values without Deployment analysis chrome.
- **Live session**: Connected environment with bastion tunnel and cluster access for catalog/logs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a guided live test, new application log lines appear in an open Deployment tab within a few seconds of being written, without reopening the tab (≥90% of observed lines in a 2-minute window).
- **SC-001a**: Opening a live Deployment tab shows about the last 500 lines per matching Pod before follow continues; a scripted “load older” action prepends another ~500-per-Pod page when older content exists.
- **SC-001b**: In scripted “load older while mid-scroll” trials, 100% preserve the pre-load reading position (no forced jump to top or bottom).
- **SC-002**: In a fixture or live sample with a multiline stacktrace, Structured shows that stacktrace as a single clickable group in 100% of scripted checks.
- **SC-003**: With stick-to-bottom off, 100% of scripted “scroll up + new lines” trials preserve the operator’s scroll position.
- **SC-004**: With stick-to-bottom on, 100% of scripted “new lines” trials keep the newest content in view (or within one viewport of the end).
- **SC-005**: On ConfigMap tabs, evaluators confirm no large empty lower analysis panel; ConfigMap content uses the main pane height in a side-by-side comparison with the pre-fix layout.
- **SC-006**: A live connect that works with bastion cluster tools succeeds for catalog/logs without requiring a new laptop-user cluster access map (when bastion identity already has rights).
- **SC-007**: Security spot-check: no PEM/IAM secret values or full durable log dumps appear in SQLite or shared exports as a result of this feature.

## Assumptions

- Builds on live connect (tunnel + catalog) already available for operator-added environments; demo remains for offline walks.
- “Matching Pods” for a Deployment means Pods that operators would associate with that workload (name/labels/ownership conventions used in the product today).
- Stick-to-bottom is per log tab (not a global app preference) unless later UX decides otherwise; default on is enough for v1 of this feature.
- Analysis drawer/panel remains for Deployment log tabs only; ConfigMap tabs do not need that lower panel.
- Bastion has the tooling needed to mint a cluster token (same environment where operators already run cluster CLI successfully).
- Local IAM credentials file remains configured for cluster discovery metadata (endpoint/CA) as in prior live-connect agreements.
- High-volume buffering may drop oldest in-memory chunks; that is acceptable if follow continues and Raw/Structured stay responsive. If oldest chunks were dropped while follow continued, “load older” may be limited by what the cluster still exposes; Faro should not invent missing history.
- Initial history and each “load older” page are about 500 lines **per matching Pod**; exact platform APIs may deliver slightly more/less per request but the product intent is that page size.
