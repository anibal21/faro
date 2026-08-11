# Feature Specification: Environment tree navigation

**Feature Branch**: `003-env-tree-nav`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "ME gustaría elegir una librería ui liviana que tenga soporte para tree con click, porque quiero hacer que se pueda listar en el panel de la izquierda un árbol con los ambientes."

## Clarifications

### Session 2026-07-27

- Q: What is the tree hierarchy under each environment? → A: Node shows **Nombre Ambiente** + **Cluster**; children are **Pods** (all pods/workloads) and **ConfigMaps** (all ConfigMaps). Shape: `EnvName + Cluster → Pods → (all pods) | ConfigMaps → (all configmaps)`.
- Q: What happens on environment root click / connect UX? → A: **Option C**: chevron expands/collapses; click on label **selects** (does not auto-connect). **Connect/disconnect** is available **on the environment root** (not via a right-side environment selector—that selector is removed). Beside the environment name: status icon **green** = connected, **yellow** = connecting, **red** = disconnected.
- Q: How is connect/disconnect triggered on the root? → A: **Right-click** the environment root opens a **context menu** with (for now) **one option** that connects or disconnects that environment when clicked (label reflects current state, e.g. Conectar vs Desconectar).
- Q: Which environments appear as tree roots? → A: **B** — **all saved** environments from the local store (not only “loaded” workspace subset).
- Q: If A is connected and operator connects B? → A: **Allow multiple connected environments**—the operator MAY connect **as many** environments as they want; connecting B does **not** force disconnect of A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse environments as a left-panel tree (Priority: P1)

An operator opens Faro and sees the left navigation panel present **environments as a tree**. Each environment node shows **nombre del ambiente** and **cluster**. Expanding an environment reveals two section nodes: **Pods** and **ConfigMaps**. Expanding Pods lists all pods/workloads of that environment’s catalog; expanding ConfigMaps lists all ConfigMaps.

**Why this priority**: Without an environment tree in the left panel, the requested navigation model does not exist.

**Independent Test**: With at least two environments, confirm each root shows name + cluster; expand → Pods / ConfigMaps → leaf items (when catalog available).

**Acceptance Scenarios**:

1. **Given** one or more **saved** environments exist, **When** the operator views the left panel, **Then** **all** of those saved environments appear as tree roots labeled with **name and cluster** (not only a “loaded” subset, and not only as a flat dropdown elsewhere).
2. **Given** an environment root is expanded, **When** the operator views its children, **Then** exactly two section nodes appear: **Pods** and **ConfigMaps**.
3. **Given** Pods (or ConfigMaps) is expanded and the environment has catalog data, **When** the operator views that section, **Then** **all** pods/workloads (or **all** ConfigMaps) for that environment’s catalog are listed under it.
4. **Given** no environments are configured yet, **When** the operator views the left panel tree, **Then** an explicit empty state invites configuring or loading an environment (not a blank broken panel).

---

### User Story 2 - Select, status, and connect from the environment root (Priority: P1)

The operator uses the environment **root** as the primary place to select and manage connection:

- **Chevron / expand control**: expands or collapses children (Pods / ConfigMaps).
- **Click on the label** (name/cluster): **selects/activa** that environment only—does **not** connect by itself.
- **Connect / disconnect**: via **right-click** on the environment root → **context menu** with a **single action** that connects if disconnected (or disconnects if connected) when the operator clicks that menu item. The status icon beside the name remains **display** of state (**green** / **yellow** / **red**), not the primary toggle.
- The previous right-side **environment selector** is **removed**; the tree is the place to see and choose environments.

**Why this priority**: Tree-with-click plus in-row status and context-menu connect replaces scattered chrome and matches the requested operator workflow.

**Independent Test**: Select env A via label; right-click → menu → connect/disconnect; confirm status icon colors; confirm no right-side environment selector.

**Acceptance Scenarios**:

1. **Given** multiple environments in the tree, **When** the operator clicks the **label** of environment A, **Then** A becomes selected/active and is visually indicated; connection state does not change solely because of that label click.
2. **Given** environment A is selected, **When** the operator clicks the label of environment B, **Then** B becomes selected and A is no longer marked selected.
3. **Given** an environment root, **When** the operator uses the expand control, **Then** Pods/ConfigMaps children show or hide without changing selection or connection by itself.
4. **Given** an environment root that is disconnected (red), **When** the operator right-clicks the root and chooses the connect action in the context menu, **Then** connection starts, the icon becomes **yellow** while connecting, then **green** if successful (or **red** with an error if it fails)—**without** requiring other environments to disconnect first.
5. **Given** environment A is already connected (green), **When** the operator connects environment B the same way, **Then** **both** A and B MAY remain connected (each shows green); B’s connect does not auto-disconnect A.
6. **Given** an environment root that is connected (green), **When** the operator right-clicks and chooses the disconnect action in the context menu, **Then** **that** environment’s session stops and **its** icon becomes **red**; other connected environments are unaffected.
7. **Given** the context menu on an environment root, **When** it opens, **Then** it exposes (for this feature) **one** connect/disconnect action appropriate to current state—not a second parallel selector elsewhere.
8. **Given** connection states, **When** the operator views each root row, **Then** that row’s icon is **red** (disconnected), **yellow** (connecting), or **green** (connected) independently per environment.
9. **Given** the main window chrome, **When** the operator looks for a right-side environment dropdown/selector, **Then** it is **not** present; environments are chosen from the left tree.
10. **Given** keyboard focus on an environment label, **When** the operator activates it (Enter/Space as supported), **Then** selection matches mouse label-click (accessibility parity for select). A keyboard-accessible path to the same connect/disconnect action MUST exist (e.g. context-menu key or equivalent).

---

### User Story 3 - Browse Pods and ConfigMaps under an environment (Priority: P2)

Catalog navigation lives **inside** the environment tree (not a separate Pods/ConfigMaps accordion). After the relevant environment is connected (when required for live catalog), the operator expands Pods or ConfigMaps under that environment and clicks a leaf to open content in the main area (same click-to-open / tabs model as the prior accordion layout).

**Why this priority**: Delivers the nested hierarchy the operator asked for; secondary only to showing environment roots themselves.

**Independent Test**: Expand env → Pods → click a workload (or ConfigMaps → click a ConfigMap) → main area opens the expected tab; tree remains visible.

**Acceptance Scenarios**:

1. **Given** an environment is expanded and connected with catalog data, **When** the operator expands Pods and clicks a listed workload/pod item, **Then** the main area opens that item’s content (logs/tab behavior as already established for catalog clicks).
2. **Given** ConfigMaps is expanded under the same environment, **When** the operator clicks a ConfigMap leaf, **Then** its read-only content opens in the main tab strip (dedupe/focus as established).
3. **Given** the operator disconnects one environment, **When** viewing Pods/ConfigMaps under that environment, **Then** that environment’s catalog children show empty/disconnected hints; **other** still-connected environments keep their catalogs.
4. **Given** two environments are connected, **When** the operator opens a catalog leaf under environment A and another under B, **Then** main-area tabs remain attributable to their environment (no silent cross-mix of catalogs).
5. **Given** the left panel after this feature, **When** the operator looks for a standalone Pods/ConfigMaps accordion outside the environment tree, **Then** it is **not** present—the tree is the sole left catalog navigator.

---

### Edge Cases

- What if only one environment exists? The tree still shows that single node; empty-state copy is not shown.
- What if the operator deletes the currently selected environment? Selection moves to another saved environment if any, or to empty/no-active with a clear hint. If it was connected, only that connection is torn down.
- What if names collide? Nodes MUST show enough disambiguation (e.g. cluster/region or unique label) so two similarly named environments are distinguishable.
- What if the tree has many environments? The left panel scrolls independently; expand/collapse remains usable.
- Click on a disabled or incomplete environment (missing required paths)? Selection may occur, but connect/use MUST surface a clear error—not a silent failure.
- What if connection fails? Status returns to **red** (disconnected) and an error message is shown; the tree remains usable.
- What if another environment is already connected when connecting a second? **Allowed**—multiple environments MAY be connected at once; each root keeps its own status icon and catalog.
- What if many environments are connected? Each keeps independent connect state; resource limits are a planning concern, but the product MUST NOT force single-session disconnect-on-switch.
- What if the operator deletes a connected environment? That environment disconnects/cleans up; other connections remain.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The left navigation panel MUST present environments in a **tree** control that supports expand/collapse (when nodes have children) and **click** (or equivalent primary activate) on nodes.
- **FR-002**: The tree MUST list **all saved** environments from the local store as roots (the former “loaded-only” / right-selector subset is not the sole listing).
- **FR-003**: Clicking an environment **label** (name/cluster) MUST update the selected/active environment context and MUST NOT by itself start a connection.
- **FR-004**: The tree MUST show a clear visual selected/active state for the current environment node.
- **FR-005**: Empty, disconnected, and error states for the tree (and any child catalog nodes) MUST be explicit and MUST NOT invent fake environments or cluster resources.
- **FR-006**: Top chrome for Ambiente (new/edit/load/delete) and Ver MAY remain; the **right-side environment selector MUST be removed**. Environment choice and connect/disconnect MUST be available from the left environment tree roots.
- **FR-007**: The product MUST adopt a **lightweight UI component approach** that includes an accessible tree widget with click/activate support suitable for desktop use—chosen during planning for small bundle impact and maintainability—without pulling a heavyweight full design-system stack solely for this panel.
- **FR-008**: Tree hierarchy MUST be: **environment root** (display **name** + **cluster**) → child sections **Pods** and **ConfigMaps** → under Pods **all** pods/workloads of that environment’s catalog; under ConfigMaps **all** ConfigMaps of that catalog.
- **FR-009**: Environment root interaction MUST separate: **expand/collapse** via chevron (or equivalent); **select** via label click; **connect/disconnect** via **right-click context menu** on the root with a **single** action that connects or disconnects according to current state (menu item label reflects the available action).
- **FR-010**: The environment tree MUST **replace** the standalone left Pods/ConfigMaps accordion; catalog browsing occurs only as nodes under each environment as defined in FR-008.
- **FR-011**: Each environment root MUST show a status icon beside the name: **green** = connected, **yellow** = connecting, **red** = disconnected. The icon is a **status indicator**; it is not required to be the connect toggle (connect/disconnect is via the context menu per FR-009). Status is **per environment** (multiple greens allowed).
- **FR-012**: A keyboard-accessible equivalent to the connect/disconnect context-menu action MUST be available for the focused environment root.
- **FR-013**: The product MUST allow **more than one** environment to be **connected at the same time**. Connecting an additional environment MUST NOT automatically disconnect others. Disconnect affects only the targeted environment.
- **FR-014**: Catalog data and opened content MUST remain scoped to the environment they belong to when multiple environments are connected.

### Key Entities

- **Environment node**: Connection instance/profile root in the tree; label includes **name** and **cluster**; includes **connection status** (disconnected / connecting / connected) reflected by the status icon—independent per environment.
- **Section node**: Fixed children **Pods** and **ConfigMaps** under an environment (expand/collapse containers, not leaf content).
- **Catalog leaf**: Workload/pod under Pods, or ConfigMap under ConfigMaps; click opens main-area content scoped to that environment.
- **Tree selection**: The environment currently marked active/selected from the tree (selection is independent of which environments are connected).
- **Connected set**: The zero-or-more environments currently in connected state simultaneously.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With two or more **saved** environments, an operator can select a different environment from the left tree in under 5 seconds without using a separate modal or right-side selector as the only path.
- **SC-002**: 100% of environment nodes that are selectable show a visible selected state within one interaction after click/activate.
- **SC-003**: In a guided demo, operators correctly identify which environment is selected from the tree alone on the first attempt (≥90% of trials).
- **SC-004**: Empty or zero-environment states show guidance copy in the left panel without appearing broken (validated in checklist/demo).
- **SC-005**: Adding the tree UI does not prevent completing the primary flow (select environment → connect → open workload/ConfigMap content) in a single session demo.
- **SC-006**: In the left panel, an operator can reach a Pods leaf and a ConfigMaps leaf under an environment root without using a separate accordion outside the tree.
- **SC-007**: In a guided demo, operators correctly map status icon colors (green/yellow/red) to connected/connecting/disconnected on the first attempt (≥90% of trials).
- **SC-008**: Operators can connect and disconnect an environment from its tree root **context menu** without using a right-side environment selector (selector absent).
- **SC-009**: With two saved environments, an operator can bring **both** to connected (green) in one demo session without being forced to disconnect the first.

## Assumptions

- Target users are the same Faro operators (engineers/ops) already using Ambiente menus and connection flows.
- “Lightweight UI library” means preferring a small, tree-capable component set (or equivalent focused tree control) over a large general-purpose design system; the concrete package is decided in `/speckit-plan`, not in this specification’s success criteria.
- Secret hygiene and local-first rules from the project constitution remain unchanged; the tree only displays non-secret environment identifiers.
- **Multiple concurrent connected environments are in scope**; each maintains its own connection status and catalog. Practical limits (resources, UI clutter) may be refined in planning but MUST NOT contradict FR-013.
- The distinct “load environments into workspace” step is no longer required for an environment to appear in the tree; saving (CRUD) is enough for listing. Ambiente → Cargar MAY be removed or reduced in planning if redundant.
- Theme (light/dark) continues to apply to the left panel and tree chrome.
- “All pods” under Pods means the full catalog list for that environment’s session (same population previously shown under the accordion Pods section), not a second inventado inventory.
- Catalog leaves under a non-connected environment show empty/disconnected hints until connect provides real data.
- Duplicate connection entry points in Ambiente menu (Conectar/Desconectar) MAY remain as secondary shortcuts but MUST stay consistent with per-root status and context-menu actions; the right-side selector is out.
- “Selected” environment (label click) is for UI focus/context and is **not** the same as “connected”; many may be connected while one is selected.
