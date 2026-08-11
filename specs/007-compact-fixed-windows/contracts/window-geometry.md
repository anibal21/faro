# Contract: Window geometry (007)

## Initial window (`tauri.conf.json` → `app.windows[0]`)

| Property | Value |
|----------|--------|
| `width` | `576` |
| `height` | `324` |
| `resizable` | `false` |
| `center` | `true` |
| `decorations` | `false` (unchanged) |

## Runtime main geometry (`src/lib/windowGeometry.ts`)

| Constant / API | Value / behavior |
|----------------|------------------|
| `MAIN_WIDTH` | `900` |
| `MAIN_HEIGHT` | `600` |
| `WORK_AREA_MARGIN` | `48` |
| `applyMainWindowGeometry()` | clamp → `setSize(LogicalSize)` → `center()` → `setResizable(true)` |
| `applySplashWindowGeometry()` | optional ensure `576×324`, `setResizable(false)`, `center()` |

## Capabilities

`src-tauri/capabilities/default.json` MUST allow:

- `core:window:allow-set-size`
- `core:window:allow-set-resizable`
- `core:window:allow-center`
- monitor permission required by `currentMonitor` (e.g. `core:window:allow-current-monitor`)

## App wiring

`src/App.tsx`: when transitioning to `ready`, await `applyMainWindowGeometry()` before/while showing `MainShell`. Do not change dwell gate.

## Supersedes

006 contract values `width: 1400` / `height: 900` as launch defaults are **obsolete** for this product path.
