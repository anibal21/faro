# Feature Specification: Professional workspace chrome

**Feature Branch**: `004-pro-workspace-chrome`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Quiero aplicar Shadcn la librería react a toda la plataforma. No quiero una barra superior como la que está, quiero que sea como un menú de programa normal con sólo Ambientes y reemplaza Ver por Temas. Los menús del árbol de ambiente no quiero que sea todo un rectángulo, quiero que el label sea donde hacer click. También quiero la opción además de conectar/desconectar en el label del ambiente, quiero otra opción que sea Editar configuración. Además quiero que la vista donde aparecen logs sea del ancho total, si el texto de análisis a la derecha. Quiero que se abra un panel debajo de los logs, que pueda subir y bajar. Ocupa textos pequeños y no llenes espacios, quiero que se vea súper profesional."

## Clarifications

### Session 2026-07-27

- Q: Content / role of the area below logs (and width of logs)? → A: **Left menu fixed**; **logs use the full remaining width** (no side analysis column stealing log width). A **foldable panel opens below the logs** and **can be closed**. (Supersedes “analysis permanently on the right of logs” as the primary layout.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Program menu and platform visual system (Priority: P1)

An operator opens Faro and sees a **compact, professional** desktop chrome: a normal **application menu bar** with **Ambientes** and **Temas** only (no bulky top toolbar like the current header strip). Theme switching lives under **Temas** (replacing the former **Ver** menu). The whole product UI uses one cohesive component look-and-feel suitable for a dense ops tool—small type, tight spacing, no padded “marketing” whitespace.

**Why this priority**: Without the new chrome and visual system, the rest of the workspace polish has no consistent shell.

**Independent Test**: Launch Faro → confirm menu bar is Ambientes | Temas only; open Temas and switch theme; confirm body text/controls look dense and professional (small type, minimal empty padding).

**Acceptance Scenarios**:

1. **Given** the main window, **When** the operator views the top chrome, **Then** they see a program-style menu with **Ambientes** and **Temas** and **do not** see the previous wide header bar (brand strip + status + environment selector layout).
2. **Given** the Temas menu, **When** the operator chooses a theme option, **Then** the workspace appearance updates and the preference persists as today for theme.
3. **Given** primary screens (tree, logs, dialogs), **When** inspected visually, **Then** typography is compact (small UI text) and layout avoids large unused empty regions.

---

### User Story 2 - Precise environment-tree interactions (Priority: P1)

In the left environment tree, the operator **clicks the text label** of a node to select/activate it—not a full-row rectangle hit target that feels like a big button. On an environment root, the context menu still offers **Conectar** / **Desconectar** (as established) and adds **Editar configuración**, which opens the environment edit flow for that instance.

**Why this priority**: Tree precision and edit-from-tree are core daily actions for multi-environment work.

**Independent Test**: Click only the label vs empty row padding; right-click root → see Conectar/Desconectar and Editar configuración; edit saves and tree label updates.

**Acceptance Scenarios**:

1. **Given** an environment root, **When** the operator clicks the **name/cluster label text**, **Then** that environment becomes selected; clicking empty padding beside the label does **not** have to select (hit target is the label, not a full-width row block).
2. **Given** an environment root, **When** the operator opens the context menu, **Then** options include connect/disconnect (per current state) **and** **Editar configuración**.
3. **Given** Editar configuración, **When** the operator completes a valid edit, **Then** the saved environment reflects the changes in the tree (name/cluster as applicable) without inventing secrets into the UI.

---

### User Story 3 - Full-width logs and foldable below panel (Priority: P1)

The left environment menu stays **fixed**. When viewing logs, the log stream uses the **entire remaining width** beside that left menu. Below the logs, a **foldable panel** can **open** and **close**; when open, the operator can adjust how much vertical space it uses (drag up/down). Analysis/findings and related secondary content belong in that foldable below area when shown—not in a permanent right column that shrinks the log width. Layout stays dense and professional.

**Why this priority**: This is the primary reading surface; full-width logs plus an optional below drawer define daily usability.

**Independent Test**: Open a log tab → logs span all width right of the fixed left menu; open the below panel, resize, close it; confirm logs reclaim height when closed.

**Acceptance Scenarios**:

1. **Given** a log tab is active, **When** the operator views the main pane, **Then** the left environment menu remains fixed and the log stream uses the **full remaining horizontal width** (no permanent right-hand column reducing log width).
2. **Given** the log workspace, **When** the operator opens the foldable panel below the logs, **Then** the panel appears under the log stream and can be resized vertically (up/down).
3. **Given** the below panel is open, **When** the operator closes it, **Then** the panel is hidden and the log stream reclaims that vertical space.
4. **Given** the log + optional below panel layout, **When** resized or toggled, **Then** typography stays compact and large empty filler regions are avoided.

---

### Edge Cases

- What if the window is narrow? Menus remain usable; the fixed left column may shrink to a minimum width and logs keep the remaining width; below panel still resizes within a minimum height when open.
- What if analysis has no findings yet? The foldable below panel shows a compact empty hint when opened—not a huge blank card.
- What if the below panel is closed? Logs use full remaining height beside the fixed left menu; a clear control remains to reopen the panel.
- What if Editar configuración is used on a connected environment? Edit is allowed for non-secret path fields; reconnect guidance if connection-critical fields change.
- Theme menu with only one theme available? Still shows Temas with current options (at least light/dark as today).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST present a **program-style menu bar** whose top-level menus are **Ambientes** and **Temas** only (Temas replaces the former Ver menu for appearance).
- **FR-002**: The previous bulky top application header (brand/status/selector strip as currently laid out) MUST NOT remain as the primary chrome.
- **FR-003**: Theme changes MUST be reachable from **Temas** and MUST persist per existing preference behavior.
- **FR-004**: Across primary UI surfaces, the product MUST apply a **single cohesive component system** for controls, menus, dialogs, tree, tabs, and splitters—visually dense and professional (small text, tight spacing).
- **FR-005**: Environment tree **primary click** for selection MUST target the **label text**, not a full-row rectangular hit area.
- **FR-006**: Environment root context menu MUST include **Editar configuración** in addition to connect/disconnect actions.
- **FR-007**: Editar configuración MUST open the existing environment configuration edit experience for that environment.
- **FR-008**: The left environment navigation MUST remain a **fixed** left column while the main work area shows logs.
- **FR-009**: In the log workspace, the log stream MUST use the **full remaining width** to the right of the fixed left menu (no permanent right column that reduces log width).
- **FR-010**: The log workspace MUST provide a **foldable panel below the logs** that the operator can **open** and **close**; when open, its height MUST be adjustable by dragging a vertical splitter (up/down).
- **FR-011**: Secondary content for log analysis/findings (and related inspector text) MUST appear in the foldable below panel when that panel is open—not as a fixed right-hand column beside the logs.
- **FR-012**: UI density MUST favor small type and minimal unused whitespace on tree, menus, logs, and panels (professional ops-tool look, not spacious marketing layout).
- **FR-013**: Connection status for environments MUST remain visible in the environment tree (status indicators), since the old header status strip is removed.
- **FR-014**: Ambientes menu MUST continue to support environment lifecycle actions needed when the tree is empty or for create/delete flows (at least create/new; load/delete as already product-relevant).

### Key Entities

- **Application menu**: Top-level Ambientes and Temas entries.
- **Environment label hit target**: Text label used for select; distinct from expand chevron and status icon.
- **Context menu actions**: Connect/Disconnect, Editar configuración.
- **Log workspace layout**: Fixed left menu; full-remaining-width log stream; foldable/closable below panel with vertical resize.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a guided demo, operators locate Ambientes and Temas in the menu bar and change theme in under 20 seconds without using the removed header strip.
- **SC-002**: 100% of observed “select environment” actions in usability check succeed when clicking the label text; full-row-only click is not required.
- **SC-003**: Operators open Editar configuración from the environment context menu and complete an edit in one attempt (≥90% of trials).
- **SC-004**: With a log tab open, operators confirm logs use the full width beside the fixed left menu, can open/close the below panel, and move its splitter within 15 seconds on first try (≥90%).
- **SC-005**: Side-by-side visual review vs prior chrome shows reduced empty padding and smaller body text on the primary workspace (checklist sign-off).

## Assumptions

- Builds on the environment-tree / multi-connect direction from feature `003-env-tree-nav` (tree of environments, status icons, context-menu connect). This feature refines chrome, hit targets, edit action, and log layout density.
- The concrete UI kit for FR-004 is **shadcn/ui** (React), applied across the platform during planning/implementation; the specification requires the cohesive professional result, not a particular import path.
- Temas exposes at least the existing light/dark modes unless later clarified.
- Secret hygiene unchanged: edit configuration still stores paths/identifiers only.
- Analysis remains local rules-based (constitution); only placement/chrome changes.
- OS window title may show the app name; that is not a substitute for Ambientes/Temas menus.
