# Feature Specification: Compact fixed windows

**Feature Branch**: `007-compact-fixed-windows`

**Created**: 2026-07-27

**Status**: Implemented

**Input**: User description: "la vista de la ventana de carga debe ser pequeña, me abrió una ventana de casi 1024*768 pixeles, tiene que ser pequeña y de tamaño fijo cómo los programas profesionales, aparecer al centro de la pantalla, y lo mismo con la ventana, debe aparecer en un un tamaño fijo que caiga dentro de la pantalla y que se vea bien."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compact centered splash window (Priority: P1)

On cold start, the operator sees a **small, fixed-size loading window**—like professional desktop apps (e.g. IDE splash dialogs)—not a large ~1024×768 (or larger) content window. The splash artwork fills that compact frame. The window appears **centered on the primary screen** and does not invite resizing during load.

**Why this priority**: Current launch feels oversized for a load screen; first impression must match professional splash behavior.

**Independent Test**: Cold start → splash window is clearly smaller than a normal workspace window, fixed size, centered on screen; branded image still fills the splash content.

**Acceptance Scenarios**:

1. **Given** a cold launch, **When** the loading screen appears, **Then** its outer window is **compact** (visibly smaller than a typical workspace / much smaller than ~1024×768 “almost full” feel on a laptop).
2. **Given** the splash is visible, **When** the operator tries to resize it, **Then** the splash window size stays fixed (no free resize during load).
3. **Given** a multi-monitor or single-monitor desktop, **When** Faro starts, **Then** the splash window opens **centered** on the active/primary work area (not stuck in a corner).
4. **Given** the branded splash image from prior work, **When** shown in the compact window, **Then** the image still fills the splash content without a second large title overlay.

---

### User Story 2 - Sensible fixed main window on ready (Priority: P1)

After loading completes, the **main application window** opens at a **fixed product-chosen size** that **fits comfortably inside the visible screen** and looks balanced for daily work—not oversized past the display, and not a tiny gadget. It also appears **centered** (or equivalently well-placed) so the first workspace is immediately usable.

**Why this priority**: Splash and main are one launch experience; oversized main defeats “professional fixed footprint.”

**Independent Test**: After splash → main window has a stable default size that fits on a common laptop screen (e.g. 1366×768 / 1920×1080 class) without overflowing; centered/well placed; usable workspace layout.

**Acceptance Scenarios**:

1. **Given** boot finishes and the workspace appears, **When** the main window is shown, **Then** its default size is a **fixed product default** that fits within the available work area with margin (not larger than the usable screen).
2. **Given** a typical laptop display, **When** Faro opens the main window, **Then** chrome, menus, and workspace remain fully visible without requiring the operator to move/shrink the window first.
3. **Given** first open (no remembered custom size required for v1 of this feature), **When** the main window appears, **Then** it is **centered** on the screen / work area like the splash.
4. **Given** the operator later needs a different size (if the product still allows resize after ready), **When** they resize, **Then** that is optional polish—default launch must already look correct without them doing so.

---

### Edge Cases

- **Small laptop screens** (e.g. 1366×768): Main default MUST still fit with margin; splash stays compact and centered.
- **High-DPI / scaled displays**: Windows still appear centered and correctly sized relative to logical work area (no half-off-screen).
- **Splash → main transition**: No jarring jump to a huge off-center window; sizes may change from small splash to larger main, but both stay centered and intentional.
- **Very large monitors**: Fixed defaults remain the product sizes (do not stretch to fill the monitor by default).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The loading (splash) experience MUST present in a **small, fixed-size** window comparable to professional desktop splash dialogs—not a large workspace-sized frame (~1024×768 or larger as the splash footprint).
- **FR-002**: The splash window MUST open **centered** on the user’s screen / primary work area.
- **FR-003**: The splash window MUST NOT be freely resizable while loading (fixed size during splash).
- **FR-004**: After ready, the main application window MUST open at a **fixed default size** chosen for comfortable work that **fits within the visible screen** with margin on common laptop resolutions.
- **FR-005**: The main window MUST open **centered** (or equivalently well-placed) on first show after load so the operator does not need to reposition it.
- **FR-006**: Existing splash artwork, dwell timing, and branding rules from prior features MUST remain; this feature changes **window geometry and placement**, not splash art content or dwell policy.
- **FR-007**: Default sizes MUST supersede the previous “large IDE default” launch size when that conflicts with compact splash / fit-on-screen main requirements.

### Key Entities

- **Splash window geometry**: Compact width/height, fixed, centered placement for the loading phase.
- **Main window geometry**: Fixed product default width/height that fits on-screen, centered placement after ready.
- **Screen work area**: The usable desktop region used to center and clamp window placement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On cold start, reviewers agree the splash window is **visibly compact** (splash dialog class), not approximately a 1024×768+ workspace window.
- **SC-002**: 100% of cold starts place the splash window centered on the primary work area (no corner-stuck default).
- **SC-003**: Splash size cannot be changed by the operator during load (fixed footprint).
- **SC-004**: On a 1366×768-class display, the default main window opens fully on-screen with visible margin (no overflow off the edges).
- **SC-005**: After splash → main, operators can use the workspace immediately without first moving or shrinking the window to see chrome/content.
- **SC-006**: Splash dwell and branded image behavior from prior features still hold after geometry changes.

## Assumptions

- “Programas profesionales” for splash means a **small fixed splash dialog** (often roughly postcard / dialog scale), centered—not a full IDE-sized window showing the splash image.
- Exact sizes (product-confirmed): splash **576×324** centered; main **900×600** (clamp if work area is smaller).
- Main window “tamaño fijo” means a **product-chosen default footprint** that fits the screen; allowing resize **after** ready remains acceptable unless later clarified as fully locked.
- Centering uses the primary / active monitor work area (taskbar-aware when the platform provides it).
- Out of scope: remembering last window size/position across sessions (nice-to-have later); multi-window layouts; changing splash artwork or Ambientes/Temas behavior.
- This feature **revises** the prior assumption that launch should default to a large ~1400×900 IDE window for both splash and main.
