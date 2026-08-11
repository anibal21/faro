# Feature Specification: UI chrome polish

**Feature Branch**: `005-ui-chrome-polish`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "Vamos a modificar un poco más el estilo de la plataforma. Está bien los formatos y fuentes. Debemos cambiar la fuente está demasiado pequeña, propongo utilizar los tamaños de vscode po defecto. también cambia los íconos chevrón, se ven poco profesionales, reemplaza por + y -, pero íconos, no sólo el símbolo, coloca algo bonito. También cambia las opciones del menú Ambientes, sólo deja Nuevo... y Desconectar todo. También en el panel de la izquierda reemplaza el título Ambientes por Monitor. Cóloca la versión abajo del panel de la izquierda, la versión del proyecto tauri. También quiero que el panel del programa pueda cambiar de color con el tema del programa. Por otro lado, no estoy viendo la ventana de carga inicial, haz que dure 5 segundos mínimo auqnue esté todo listo."

## Clarifications

### Session 2026-07-27

- Q: Where do actions removed from Ambientes (Eliminar, Cargar, etc.) live? → A: **Top menubar only** is simplified; **left Monitor rail / tree context menu stays as it is today** (do not relocate or redesign those options in this feature).
- Q: Scope of theme-colored “program panel”? → A: **Custom window chrome** (no classic OS title bar)—the whole frame follows Faro light/dark theme.
- Q: Confirm before Desconectar todo? → A: **Always confirm** (even when nothing is connected).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Readable workbench typography and expand icons (Priority: P1)

An operator opens Faro and finds UI text sized like a normal desktop IDE workbench (comparable to Visual Studio Code’s default UI text scale)—no longer “micro” dense type that feels hard to read. Tree expand/collapse controls use clear **plus / minus style icons** (proper icon glyphs, not plain ASCII `+`/`-` or crude chevron characters), so expand/collapse looks professional.

**Why this priority**: Legibility and polish of everyday chrome affect every session.

**Independent Test**: Launch main window → compare body/menu/tree text scale to VS Code default feel; expand and collapse tree sections and confirm +/− style icons (not text chevrons).

**Acceptance Scenarios**:

1. **Given** the main workspace, **When** the operator views menus, tree, and primary panels, **Then** text uses a workbench-scale size comparable to VS Code’s default UI (larger than the previous ultra-compact micro size), while keeping the existing font family/format choices.
2. **Given** expandable nodes in the left tree, **When** collapsed, **Then** the control shows a professional **plus-style icon**; **When** expanded, **Then** it shows a professional **minus-style icon** (icon assets/glyphs, not raw keyboard characters alone).

---

### User Story 2 - Simplified Ambientes menu and Monitor rail branding (Priority: P1)

The **Ambientes** program menu contains **only**:
- **Nuevo…**
- **Desconectar todo**

This change applies **only to the top Ambientes program menu**. The **left Monitor rail** (tree, expanders, per-environment context menu options such as Conectar / Desconectar / Editar configuración) **MUST remain as it is today**—this feature does not move Eliminar/Cargar into the left rail or otherwise redesign left-rail actions. The left rail title reads **Monitor** (not “Ambientes”). At the **bottom** of the left rail, the operator sees the **application version** (the product/package version shipped with the desktop app).

**Why this priority**: Menu clutter and rail identity are immediate UX fixes requested for daily use.

**Independent Test**: Open Ambientes → only Nuevo… and Desconectar todo; left rail title “Monitor” and context options unchanged from today; version string at bottom of left rail; Desconectar todo clears all live connections.

**Acceptance Scenarios**:

1. **Given** the Ambientes menu, **When** opened, **Then** the operator sees exactly **Nuevo…** and **Desconectar todo** (no other Ambientes items).
2. **Given** the Ambientes menu, **When** the operator chooses **Desconectar todo**, **Then** the product **always** asks for confirmation first (including when nothing is connected); **only after** the operator confirms are all live connections torn down and connection-dependent workspace state cleared (or a no-op disconnect if none were connected).
3. **Given** the left rail, **When** viewed, **Then** the header title is **Monitor** and the **app version** appears at the bottom of that rail.

---

### User Story 3 - Theme-colored custom program chrome (Priority: P1)

When the operator switches **Temas** (light/dark), the **entire application frame** follows Faro’s theme—including a **custom window chrome** (no classic operating-system title bar). Menubar, window caption/controls region, left Monitor rail, and main content surfaces share the same light/dark look so nothing looks like an unthemed OS chrome strip.

**Why this priority**: Theme must feel whole-window, not content-only.

**Independent Test**: Switch Claro ↔ Oscuro → custom frame, menubar, Monitor rail, and main panels all follow; no classic OS title bar remains as a mismatched band.

**Acceptance Scenarios**:

1. **Given** light theme, **When** the operator switches to dark (and vice versa), **Then** the custom window chrome, menubar, left Monitor rail, and primary content backgrounds/foregrounds update to the new theme without a mismatched unthemed strip.
2. **Given** the main window, **When** inspected, **Then** window caption/controls are part of Faro’s themed chrome (not the classic OS title bar), and the overall surface reads as one themed application.

---

### User Story 4 - Minimum splash dwell (Priority: P1)

On launch, the operator **always** sees the initial loading (splash) screen for **at least five seconds**, even if the application finished preparing earlier. After the minimum dwell (and readiness), the main workspace appears.

**Why this priority**: Splash is currently missed; branding/boot feedback is required.

**Independent Test**: Cold start with fast boot → splash visible ≥ 5 seconds before main UI; slow boot → splash lasts until ready **and** still respects the 5-second minimum from splash start.

**Acceptance Scenarios**:

1. **Given** a launch where preparation finishes in under five seconds, **When** timing from splash appearance, **Then** the splash remains visible for **at least five seconds** before the main workspace is shown.
2. **Given** a launch where preparation takes longer than five seconds, **When** preparation completes after five seconds, **Then** the splash stays until ready and only then transitions (never cutting the splash short of five seconds from its start).

---

### Edge Cases

- **Desconectar todo** with nothing connected: menu item remains available; choosing it **still** shows the confirmation; after confirm, action is a safe no-op without error noise.
- **Desconectar todo** confirmation cancelled: no connections change; workspace stays as-is.
- **Version string missing** in a broken package: rail still shows a clear fallback label (e.g. unknown) rather than crashing.
- **Theme change while splash visible**: splash may keep its branded look; after transition, main workspace (including custom chrome) matches the persisted theme.
- **Very slow first launch**: splash duration = max(5 seconds, time until ready)—never less than 5 seconds from splash start.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST use UI text sizes aligned with Visual Studio Code’s **default workbench** text scale (readable IDE-like), while retaining the already accepted font families/formats.
- **FR-002**: Expand/collapse controls in the left tree MUST use professional **plus** and **minus** style **icons** (not plain character chevrons or bare `+`/`-` text alone).
- **FR-003**: The top **Ambientes** program menu MUST expose **only** **Nuevo…** and **Desconectar todo**.
- **FR-003a**: The left Monitor rail’s environment actions / context menu MUST remain behaviorally unchanged from the current product (no relocation of removed top-menu items into the left rail as part of this feature).
- **FR-004**: **Desconectar todo** MUST **always** prompt for confirmation before acting (including when zero environments are connected). Only after the operator confirms MUST the product disconnect **all** currently connected environments and clear connection-dependent workspace state as a full disconnect would (no-op if none connected). Cancelling the confirmation MUST leave connections unchanged.
- **FR-005**: The left rail title MUST display **Monitor** instead of “Ambientes”.
- **FR-006**: The left rail MUST show the **desktop application version** (product package version) at the **bottom** of the rail.
- **FR-007**: The product MUST use **custom window chrome** (no classic OS title bar) so the window frame, caption/controls region, menubar, Monitor rail, and main panels all follow the selected Temas light/dark colors as one cohesive shell.
- **FR-007a**: Custom chrome MUST still provide the essential window actions the operator expects (at least minimize, maximize/restore, and close), themed with the rest of the shell.
- **FR-008**: The initial loading/splash screen MUST remain visible for a **minimum of five (5) seconds** from when it is shown, even if preparation completed earlier; transition to the main workspace MUST wait for both readiness and that minimum dwell.

### Key Entities

- **Application version**: The version identifier of the shipped desktop product shown in the Monitor rail footer.
- **Splash dwell**: The minimum wall-clock time the loading screen must remain visible before the main workspace may appear.
- **Program chrome**: Custom window frame (no classic OS title bar), menu bar, Monitor rail, primary panels, and themed window controls that follow the selected theme.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a side-by-side visual check, Faro UI text reads at a scale comparable to VS Code’s default workbench text (not the previous micro size); operators can read tree labels and menus without straining at normal desktop distance.
- **SC-002**: 100% of expandable Monitor-rail tree nodes use plus/minus style icons for expand/collapse (no chevron-character expanders).
- **SC-003**: Opening Ambientes shows exactly two actions (Nuevo…, Desconectar todo); a reviewer finds no other Ambientes items.
- **SC-004**: Choosing Desconectar todo always shows a confirmation; after confirm with N≥1 connected environments, zero remain connected and connection-dependent tabs/workspace clear; after cancel, connections are unchanged.
- **SC-005**: Monitor title and version footer are visible on the left rail in both empty and populated states.
- **SC-006**: Switching theme updates custom window chrome + menubar + Monitor rail + main panels in the same action; no classic OS title bar remains as an unthemed band.
- **SC-007**: On a fast-boot machine, measured splash visibility is ≥ 5.0 seconds before main workspace appears (wall clock from splash show).

## Assumptions

- Font **families** and overall layout formats from the prior chrome work stay; only **size scale** moves toward VS Code defaults (typically ~13px UI class), not a redesign of typefaces.
- Plus/minus icons come from the product’s existing icon set / vector icons already used for a professional look—not emoji.
- Only the **top** Ambientes menu is reduced to Nuevo… / Desconectar todo. Left-rail options stay as today; this feature does not invent new homes for Eliminar/Cargar if they were only in the top menu.
- **Desconectar todo** means all live sessions, consistent with multi-environment connect behavior.
- Application version is the same version the desktop package declares for the product (e.g. the project’s published app version), shown in a short human-readable form (e.g. `v0.1.0`).
- “Panel del programa” means **custom window chrome** (no classic OS title bar); minimize/maximize/close remain available and themed.
- Splash content (branding, tagline, preparing copy) remains; this feature adds the **minimum dwell**, not a new splash design.
- Out of scope: changing Temas menu structure, log drawer behavior, analysis rules, or credential handling.
