# Feature Specification: Branded splash and app icons

**Feature Branch**: `006-branded-splash-icons`

**Created**: 2026-07-27

**Status**: Implemented

**Input**: User description: "Quiero que utilices esta imágen como página de la carga inicial, si vas a colocar texto colócalo encima de eso, pero ya tiene el título así que si quieres agregar texto de carga o algo sería abajito a la derecha, si no pondremos nada, que cargue con la imágen y al tamaño de un programa serio como intellij. También cargué nuevos íconos para el ícono de la app, quiero que lo actualices."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Branded splash as the loading experience (Priority: P1)

On launch, the operator sees the **branded lighthouse splash image** as the full loading screen—no separate marketing layout that re-draws a large “Faro” title over the art (the image already includes the product title and tagline). If any status/loading text is shown, it appears only as a **small message in the bottom-right** over the image. The splash remains for the existing minimum dwell (from prior polish) and then yields to the main workspace.

**Why this priority**: First impression and brand identity on every cold start.

**Independent Test**: Cold start → full-bleed splash image fills the window; no duplicate large title block; optional status only bottom-right (or none); then main UI after dwell/ready.

**Acceptance Scenarios**:

1. **Given** a cold launch, **When** the splash is visible, **Then** the operator sees the provided branded splash image covering the content area (edge-to-edge within the app chrome).
2. **Given** the splash image already contains the product title/tagline, **When** the splash is shown, **Then** the product does **not** overlay a second large brand title/tagline in the center.
3. **Given** boot status or an error must be communicated, **When** text is shown on splash, **Then** it appears as compact copy in the **bottom-right** over the image (not covering the lighthouse/title composition).
4. **Given** no status text is required beyond the image, **When** boot is healthy, **Then** showing **image-only** (no status line) is acceptable.

---

### User Story 2 - Serious desktop window size on launch (Priority: P1)

The application window opens at a **default size comparable to a professional IDE** (e.g. IntelliJ-class desktop tool)—larger and more “serious” than a small utility window—so the splash and workspace feel like a full desktop application.

**Why this priority**: Window chrome size frames the splash and first workspace impression.

**Independent Test**: Fresh launch → default window size feels IDE-like (not a small gadget window); still resizable by the operator.

**Acceptance Scenarios**:

1. **Given** a first open (or default config), **When** the window appears, **Then** its default width/height match a professional desktop IDE scale (substantially larger than a compact ~1100×720 utility footprint).
2. **Given** the operator resizes the window, **When** they continue using Faro, **Then** resizing remains available (default size does not lock the window).

---

### User Story 3 - Updated application icons (Priority: P1)

The desktop product uses the **newly provided application icons** everywhere the OS and installer expect Faro’s icon (taskbar, window/app identity, packaged installers as configured for the product).

**Why this priority**: Brand consistency outside the splash.

**Independent Test**: Built/running app shows the new icon in the OS taskbar/window identity; packaged icon assets match the new set.

**Acceptance Scenarios**:

1. **Given** the new icon assets are in the project, **When** the app is run or packaged, **Then** Faro’s application icon reflects the new artwork (not the previous placeholder/default).
2. **Given** platform-specific icon variants required by the desktop packaging setup, **When** packaging config is reviewed, **Then** it references the updated icon set.

---

### Edge Cases

- **Slow image load**: Splash area still shows a dark branded fallback color until the image paints; avoid a blank white flash.
- **Error during boot**: Error message uses the same bottom-right overlay treatment over the splash image.
- **Very small resized window**: Bottom-right status remains readable; image scales with cover/contain behavior that preserves the composition without cropping the title awkwardly when possible.
- **Missing icon file in a broken checkout**: Build/packaging fails clearly or falls back with a documented error—prefer failing packaging over shipping silent wrong icons.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The initial loading screen MUST display the **provided branded splash image** as the primary visual (full content area).
- **FR-002**: The splash MUST NOT duplicate a large centered product title/tagline already present in the image artwork.
- **FR-003**: Any loading/status/error text on the splash MUST be placed in the **bottom-right** over the image, compact and secondary; image-only (no status text) is allowed when nothing needs to be said.
- **FR-004**: The default application window size MUST open at a **professional IDE-like** scale (comparable to IntelliJ-class defaults), and the window MUST remain resizable.
- **FR-005**: The product MUST use the **newly supplied application icon assets** for OS/app identity and packaging as configured for Faro.
- **FR-006**: Existing splash minimum dwell and boot readiness behavior (from prior polish) MUST continue to apply—this feature changes splash **visuals** and window **default size**/icons, not the dwell rule itself.

### Key Entities

- **Splash artwork**: The lighthouse/brand image used as the loading background.
- **Splash status overlay** (optional): Short bottom-right text for preparing/error states.
- **Application icon set**: The new multi-resolution icons used by the desktop package and OS shell.
- **Default window geometry**: Initial width/height for a serious desktop IDE footprint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On cold start, reviewers confirm the splash is the branded image full-bleed; no second large “Faro” title block is overlaid in the center.
- **SC-002**: If status text appears, 100% of instances are bottom-right; center/top overlays for status are absent.
- **SC-003**: Default launch window area is at least in the professional IDE range (e.g. roughly ≥1280×800 or equivalent product-chosen IDE default)—clearly larger than the prior compact utility default.
- **SC-004**: Taskbar/window icon on a demo machine matches the new Faro icon artwork (side-by-side with the supplied source).
- **SC-005**: Splash dwell ≥5s behavior from prior feature still holds after the visual swap.

## Assumptions

- Splash image source for the product is the artwork the user provided / placed for load page use (lighthouse + “Faro” / “Monitoreo AWS a medida”).
- Prefer **image-only** splash when boot is healthy; bottom-right status mainly for preparing/error when useful.
- “Tamaño de un programa serio como IntelliJ” means default geometry ~**1400×900** (or similar IDE default), not maximizing to full screen by force.
- New icons the user loaded into the project icon directories are the source of truth to wire into packaging/config.
- Custom title bar / theme chrome from prior features remain; splash fills the content area under that chrome (or fullscreen content during splash if the product already shows splash without main chrome—either is fine if the image dominates).
- Out of scope: redesigning the splash illustration itself; changing Temas; changing Ambientes menu; credential or cluster behavior.
