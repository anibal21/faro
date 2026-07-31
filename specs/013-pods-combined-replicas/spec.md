# Feature Specification: Pods Combined Replicas

**Feature Branch**: `013-pods-combined-replicas`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "El menú Pods tiene que tener las réplicas combinadas, y los logs también, incluso la exportación de archivos."

## Clarifications

### Session 2026-07-30

- Q: How should the Pods menu present combined replicas? → A: In the **Pods** menu, entries represent **all replicas of a Deployment grouped together** (one group per Deployment). Opening that entry opens a tab showing the **active combined log** of those replicas (fan-in). Individual replica names are **not** separate peer menu buttons for that workload; they appear in the live log stream. Orphans without a Deployment owner remain separate entries.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pods menu shows combined replica groups (Priority: P1)

An operator expands **Pods** and sees **grouped entries**: each entry stands for **all replicas of one Deployment** (combined). The menu is the place to open **combined replica logs**, not a flat peer list of every pod name for owned replicas. Orphan pods without a Deployment owner remain listed individually.

**Why this priority**: Matches “réplicas combinadas” in the Pods menu as the primary browse/open model.

**Independent Test**: Multi-replica Deployment → Pods shows one grouped entry for that Deployment’s replicas (not N peer rows).

**Acceptance Scenarios**:

1. **Given** a Deployment with 3 replica pods, **When** the operator opens the **Pods** section, **Then** they see **one grouped entry** for that Deployment’s replicas (not three peer top-level entries).
2. **Given** an orphan pod with no Deployment owner, **When** Pods is shown, **Then** that pod still appears as its own entry.
3. **Given** two Deployments each with replicas, **When** Pods is shown, **Then** each Deployment has its own grouped entry.

---

### User Story 2 — Opening a grouped Pods entry shows active combined replica logs (Priority: P1)

An operator clicks a **grouped** Pods entry and gets one log tab with the **active combined log** of that Deployment’s replicas (live/follow fan-in, lines attributable per pod). Opening the same group again focuses the same tab.

**Why this priority**: Menu grouping must open the combined active log stream.

**Independent Test**: Click grouped entry for a 2+ replica workload → active log includes every replica with pod identity.

**Acceptance Scenarios**:

1. **Given** a grouped Pods entry for a multi-replica Deployment, **When** the operator opens it, **Then** the tab shows the **active combined** log of **all** matching replica pods with per-pod attribution.
2. **Given** that log tab is already open, **When** they open the same grouped entry again, **Then** the existing tab is focused (no duplicate window for the same owner).
3. **Given** an orphan pod entry, **When** opened, **Then** only that pod’s logs are followed.

---

### User Story 3 — Export includes all combined replicas’ logs (Priority: P1)

An operator exports from a fan-in / combined-replica log tab and the saved file contains the **combined** Raw log for **all replicas** in that follow scope (after exhausting available history as already required by product), not a single-replica subset.

**Why this priority**: Explicitly called out—“incluso la exportación.”

**Independent Test**: Open combined multi-replica logs → Export → file contains lines (or pod markers) for each replica in the group.

**Acceptance Scenarios**:

1. **Given** a combined fan-in tab with ≥2 pods emitting lines, **When** the operator exports successfully, **Then** the file includes content attributable to **each** replica in the combined scope.
2. **Given** the operator cancels export, **When** cancel completes, **Then** no file is written.
3. **Given** export gather/save fails, **When** the error is shown, **Then** no secret material appears.

---

### Edge Cases

- Workload with zero ready pods → combined entry may still appear with count 0 or be omitted; empty log state on open is acceptable if documented in UI (“Sin pods” / empty follow).
- Replica set changes while tab is open → follow continues for pods known to the session; refresh catalog may update the menu grouping without requiring this feature to hot-swap mid-follow.
- Single-replica Deployment → still one combined entry (count 1); open/export behave as one-pod fan-in of that owner.
- Demo mode → same combined menu + fan-in + export rules with fixture pods.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The **Pods** catalog section MUST list **grouped entries** where each group represents **all replicas of one Deployment** (not peer buttons for each owned replica).
- **FR-002**: Each grouped row MUST identify the Deployment and that replicas are combined (e.g. name and replica count).
- **FR-003**: Opening a grouped Pods row MUST open (or focus) a log tab showing the **active combined log** of **all** replica pods of that Deployment (fan-in with per-pod attribution).
- **FR-004**: Orphan pods (no Deployment owner) MUST remain openable as **single-pod** follow entries listed separately.
- **FR-005**: Log **Export** from that combined-replica tab MUST write Raw text covering **all replicas** in the follow scope (including exhaust-gather per existing product rules), not a single-pod subset.
- **FR-009**: The Pods menu MUST NOT require expanding nested per-replica children to obtain the combined active log; the group row itself is the open target for combined logs.
- **FR-006**: Export cancel MUST write nothing; errors MUST NOT leak secrets.
- **FR-007**: Deployments section YAML-only behavior (from prior feature) remains unchanged; this feature does not move logs back onto Deployments.
- **FR-008**: Services and ConfigMaps sections remain available and unchanged except for incidental catalog layout consistency.

### Key Entities

- **Combined replica group**: Catalog row representing all pods owned by one Deployment in a namespace; attributes: namespace, deployment name, replica/member count, member pod identities (for open/follow).
- **Fan-in log tab**: Existing multi-pod follow window scoped to one Deployment owner.
- **Combined export artifact**: Local Raw text file containing lines from all pods in the fan-in scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a demo or live workload with **≥2** replicas, the Pods menu shows **exactly one** combined primary entry for that owner (not ≥2 peer primary rows for those replicas) in **100%** of acceptance checks.
- **SC-002**: Opening that combined entry shows log attribution from **each** of the ≥2 replicas within **30 seconds** under normal local conditions.
- **SC-003**: A successful export from that tab includes identifiable content from **each** replica in the group (spot-check markers or pod names) on first attempt in the test plan.
- **SC-004**: Cancelled export leaves **no** new file in **100%** of cancel trials.
- **SC-005**: Operators can complete “open combined Pods → see multi-replica logs → export” without using the Deployments menu for logs.

## Assumptions

- “Réplicas combinadas” in the Pods menu means **one grouped entry per Deployment** whose open action shows the **active combined log** of that Deployment’s replicas; replica identity remains visible in the log stream, not as separate menu peers for owned pods.
- Exhaust-on-export behavior from feature 012 remains in force for how much history is gathered before write.
- Bastion/IAM auth and read-only cluster access unchanged.
- Demo fixtures already include multi-pod Deployments suitable for SC-001–SC-003.

## Out of Scope

- Changing Deployments from YAML-only back to log-open.
- Live CPU/memory usage metrics.
- Editing cluster resources.
- Persisting full log dumps to SQLite.
- SSO credential auto-refresh.
