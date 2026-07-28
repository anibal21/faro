# Feature Specification: Accordion navigation layout

**Feature Branch**: `002-accordion-nav-layout`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Debemos cambiar el layout de Faro. Debemos aprovechar lo que más podamos los espacios. Se debe establecer un menú en acordeón a la izquierda donde se vean como menú principal Pods, Configmaps, y debajo los pods y configmaps del ambiente. No debe tener un botón de ver logs, los menús deben poderse hacerse click."

## Clarifications

### Session 2026-07-27

- Q: ¿Se mantiene el buscador/filtro por nombre en el menú acordeón? → A: Eliminarlo; no se ve bien / no forma parte del layout deseado.
- Q: ¿Qué se hace clic para abrir logs bajo Pods? → A: *(superseded below)* Inicialmente “solo un pod”; luego aclarado: el **menú clicable** abre el log de **todas sus réplicas**.
- Q: ¿Qué pasa al hacer clic en un segundo ítem del menú? → A: Cada ítem abre una pestaña; todas quedan activas; no se repiten (si ya está abierta, se enfoca).
- Q: ¿“Todas activas” incluye follow en segundo plano? → A: Sí (opción A): cada pestaña de logs sigue recibiendo aunque no esté enfocada. Además: un menú ve el log de **todas sus réplicas**.
- Q: ¿Alcance del stream al abrir un ítem bajo Pods? → A: El ítem de menú clicable (workload / Deployment bajo la sección Pods) muestra logs agregados de **todas sus réplicas** (pods).
- Q: ¿Cómo se listan las réplicas / qué hay bajo la pestaña? → A: La pestaña trae logs de **todas las réplicas combinadas**; bajo la pestaña hay una **pequeña descripción** del workload/pod con: número de réplicas, RAM consumida, CPU consumido, tiempo vivo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate with left accordion (Priority: P1)

After the environment is connected and the catalog is available, the operator sees a left-hand accordion whose top-level sections are **Pods** and **ConfigMaps**. Expanding a section reveals the pods or ConfigMaps of the active environment. The rest of the window is a wide main work area (no wasted side columns for duplicate lists).

**Why this priority**: This is the core layout change; without it the new navigation model does not exist.

**Independent Test**: With a connected demo/catalog, open Faro and confirm only the left accordion lists Pods/ConfigMaps; the main area is free for content; space is used primarily by the work surface.

**Acceptance Scenarios**:

1. **Given** a connected environment with catalog data, **When** the operator views the main window, **Then** a left accordion shows top-level items **Pods** and **ConfigMaps** and **does not** show a search/filter field in that navigation.
2. **Given** the Pods section is expanded, **When** the catalog has workloads, **Then** clickable menu items appear under Pods (one per Deployment/workload); replica pods MAY be listed as secondary context under that item but the **clickable open target** is the workload menu entry.
3. **Given** the ConfigMaps section is expanded, **When** the catalog has ConfigMaps, **Then** those ConfigMaps appear under ConfigMaps.
4. **Given** the window is resized, **When** the operator works in the main area, **Then** the main content area uses the majority of the horizontal space (accordion remains a narrow navigation strip).

---

### User Story 2 - Open replica logs by clicking a Pods menu item (Priority: P1)

The operator opens live logs by **clicking a menu item under Pods** (a Deployment/workload). That tab shows live logs from **all replica pods** of that workload, **combined** in one stream. Directly under the tab (above the log body) a **compact description** shows replica count, RAM consumed, CPU consumed, and uptime. There is **no** separate “Ver logs” / “Abrir logs” button. Open log tabs that are not focused **keep receiving** log output (background follow).

**Why this priority**: Removes an extra control and matches clickable menus plus multi-replica incident viewing with at-a-glance resource/uptime context.

**Independent Test**: Connect → expand Pods → click a workload menu item → one tab shows combined live lines from all replicas and a summary strip with replicas / RAM / CPU / uptime; switch tabs and confirm background follow.

**Acceptance Scenarios**:

1. **Given** Pods is expanded and a workload with multiple replicas is listed, **When** the operator clicks that menu item, **Then** the main work area opens a tab whose live log view includes output from **all of that workload’s replicas**.
2. **Given** the connected workspace UI, **When** the operator inspects Pods navigation, **Then** there is no dedicated “Ver logs” / “Abrir logs” button.
3. **Given** logs are already open for one workload, **When** the operator clicks another workload menu item, **Then** a **new tab** opens for it (or the existing tab is focused if already open) and previously opened tabs remain available and **keep following**.
4. **Given** a workload’s log tab is already open, **When** the operator clicks the same menu item again, **Then** no duplicate tab is created; the existing tab is focused.
5. **Given** two log tabs are open, **When** the operator views tab B, **Then** tab A continues to receive live log chunks in the background.
6. **Given** a workload log tab is open, **When** the operator looks just below the tab chrome (above the log body), **Then** a compact summary shows at least: replica count, RAM consumed, CPU consumed, and uptime (“tiempo vivo”).

---

### User Story 3 - Open ConfigMap by clicking the menu item (Priority: P1)

The operator opens a read-only ConfigMap by **clicking** its name under ConfigMaps in the accordion. It opens as a **tab** in the same main tab strip (no separate “open” button). Already-open ConfigMaps are focused, not duplicated.

**Why this priority**: Same interaction model as pods; ConfigMaps must not keep a parallel button-driven rail.

**Independent Test**: Expand ConfigMaps → click an item → keys/values appear read-only in the main area.

**Acceptance Scenarios**:

1. **Given** ConfigMaps is expanded, **When** the operator clicks a ConfigMap name, **Then** its read-only content appears in the main work area.
2. **Given** a ConfigMap is open, **When** the operator clicks another ConfigMap, **Then** a **new tab** opens for it (or the existing tab is focused if already open); previously opened tabs remain available.
3. **Given** a ConfigMap tab is already open, **When** the operator clicks the same ConfigMap again, **Then** no duplicate tab is created; the existing tab is focused.

---

### User Story 4 - Accordion collapse / expand and empty states (Priority: P2)

The operator can collapse or expand Pods and ConfigMaps independently to reclaim vertical space. Empty and disconnected states are clear.

**Why this priority**: Completes the accordion behavior and space-saving goal; secondary to the click-to-open flows.

**Independent Test**: Collapse both sections; expand one; disconnect and confirm empty/disabled messaging.

**Acceptance Scenarios**:

1. **Given** both sections are expanded, **When** the operator collapses Pods, **Then** only the Pods header remains and ConfigMaps (if expanded) still show their items.
2. **Given** the environment is not connected, **When** the operator views the accordion, **Then** sections explain that catalog items appear after connect (or show empty lists with a clear hint)—without inventing fake cluster data.
3. **Given** a section is expanded but the catalog has zero items, **When** the operator looks under that section, **Then** an explicit empty state is shown (not a broken blank panel).

---

### Edge Cases

- What happens when the catalog refreshes while a pod/ConfigMap is open? Selection remains if still present; otherwise the main area shows a clear “item no longer available” (or closes that view) without crashing.
- How does the system handle click when not connected? Clicks do nothing harmful; user sees connect guidance.
- What if the same name appears in different namespaces? List entries MUST show enough context (at least namespace + name) to disambiguate.
- What if many pods scroll the accordion? The left nav scrolls independently; the main area stays usable.
- There is no name-search / filter field in the accordion; long lists are handled by scrolling only.
- What if the operator opens many tabs? Each distinct nav item gets at most one tab; duplicates are not created. Tabs remain active (including background log follow) until the operator closes them.
- The clickable menu under Pods is the **workload** (Deployment); its tab aggregates logs from **all replica pods** in one combined view.
- Under each open log tab, a compact summary MUST show replica count, RAM, CPU, and uptime; if a metric is temporarily unavailable, show an explicit placeholder (e.g. “N/D”) rather than inventing values or hiding the whole strip.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The connected workspace MUST present a **left accordion navigation** with top-level sections **Pods** and **ConfigMaps**.
- **FR-002**: Under **Pods**, the system MUST list **clickable workload menu items** (Deployments) from the active environment’s catalog. Replica pods MAY appear as secondary context under each item.
- **FR-003**: Under **ConfigMaps**, the system MUST list the ConfigMaps available from the active environment’s catalog.
- **FR-004**: Clicking a **Pods menu item** (workload) MUST open or focus a **tab** whose live log view includes output from **all replica pods** of that workload.
- **FR-005**: Clicking a ConfigMap MUST open or focus a **tab** in the main work area with its read-only detail.
- **FR-013**: Each distinct accordion item (workload under Pods, or ConfigMap) MUST map to **at most one** open tab; clicking an already-open item MUST focus its existing tab and MUST NOT create a duplicate.
- **FR-014**: Open tabs MUST remain **active** until the operator closes them; opening another item MUST NOT auto-close prior tabs.
- **FR-015**: For open **log** tabs that are not focused, the product MUST **continue following** (receiving live log output) in the background.
- **FR-016**: Each open **Pods** (workload) log tab MUST show, **directly under the tab** and above the log body, a compact description including: **number of replicas**, **RAM consumed**, **CPU consumed**, and **uptime** (“tiempo vivo”).
- **FR-017**: Combined replica logs in a workload tab MUST appear as **one** live view (not one separate tab per replica).
- **FR-006**: The UI MUST NOT provide a dedicated **“Ver logs” / “Abrir logs”** (or equivalent) button for opening logs; opening MUST be via accordion item click.
- **FR-007**: The layout MUST prioritize usable space: the accordion is a narrow navigation strip; the main work area occupies the remaining width (no duplicate ConfigMaps rail or redundant list column that wastes horizontal space).
- **FR-008**: Accordion sections MUST be independently expandable and collapsible.
- **FR-009**: Ambiente / Ver (and connection status) remain available in the top chrome; this feature does not remove environment connect/load flows.
- **FR-010**: Structured / Raw log viewing and click-to-analyze behavior from the prior feature remain available once a log view is open; this feature only changes how the user **navigates to** those views.
- **FR-011**: When disconnected or catalog empty, accordion sections MUST show an explicit empty or “connect first” state rather than silent failure.
- **FR-012**: The left accordion MUST NOT include a name search / filter (“buscador”) control; catalog items are browsed by expand/scroll and opened by click only.

### Key Entities

- **Accordion section**: Top-level nav group (Pods or ConfigMaps); expanded/collapsed.
- **Nav item**: A clickable catalog entry — a **workload (Deployment)** under Pods (opens multi-replica logs), or a **ConfigMap** under ConfigMaps — with display label including disambiguating context (e.g. namespace).
- **Main work area**: Primary content surface with a **tab strip** for open workload logs and ConfigMaps after nav clicks.
- **Active selection**: The focused tab; other open tabs remain active and reachable (log tabs keep following in background).
- **Replica set**: The pods belonging to a workload; their combined live output appears in that workload’s single log tab.
- **Workload summary strip**: Compact read-only facts under a log tab — replica count, RAM consumed, CPU consumed, uptime — for the opened workload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a connected session with a multi-replica workload, an evaluator can open its logs in **one click** on that Pods menu item; the view includes lines attributable to **more than one replica** when multiple replicas emit logs.
- **SC-002**: In the same session, an evaluator can open a ConfigMap in **one click** on its accordion item.
- **SC-003**: On a typical desktop window (≥1280px wide), the main work area uses **at least ~70%** of the horizontal width after layout (accordion remaining a compact strip).
- **SC-004**: **100%** of evaluators in a walkthrough find **no** “Ver logs” / “Abrir logs” control in the Pods navigation.
- **SC-005**: Collapse/expand of each accordion section completes without losing the ability to re-expand and click items again in the same session.
- **SC-006**: **100%** of evaluators in a walkthrough find **no** search/filter (“buscador”) field in the left accordion navigation.
- **SC-007**: Opening three different Pods menu items creates **exactly three** log tabs (no duplicates); clicking an already-open item focuses its tab without adding a fourth.
- **SC-008**: After opening a second item, the first item’s tab is still present and selectable without reopening from the accordion.
- **SC-009**: With two log tabs open, after focusing the second for at least 10 seconds, returning to the first shows **new** live lines arrived while it was in the background (follow continued).
- **SC-010**: On an open workload log tab, an evaluator can read **without scrolling the log body** the four summary fields: replica count, RAM, CPU, and uptime (or an explicit “N/D” placeholder per missing field).

## Assumptions

- Builds on Faro feature `001-eks-log-monitor` (environments, connect, session catalog, logs, ConfigMaps RO, theme).
- Under Pods, the clickable menu is the **workload (Deployment)**; one tab shows **all replica** logs combined. Earlier “single-pod-only stream” clarification is superseded.
- Main work area uses a shared tab model: each menu item opens a tab; all open tabs stay active (log follow continues in background); the same item never duplicates a tab.
- Workload log tabs include a compact summary (replicas, RAM, CPU, uptime). Metric sourcing is best-effort from the connected environment’s read-only observations; unavailable values show as N/D (details deferred to plan).
- Catalog refresh (if retained) MUST NOT live inside a search/filter bar; it MAY appear as a compact control near the accordion header or elsewhere outside the removed buscador.
- Splash, Ambiente CRUD/load/connect, and Ver theme are out of scope except for layout coexistence.
- No change to credential handling, read-only cluster boundary, or analysis rules in this feature.

## Out of Scope

- New cluster mutation actions
- Redesign of splash or new-environment modal fields
- Changing analysis rule packs
- Mobile/responsive phone layouts
- Name search / filter UI in the left accordion navigation
