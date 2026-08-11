# Data Model: Branded splash and app icons (006)

No SQLite changes. Configuration/UI entities only.

## Entities

### SplashArtwork

| Field | Notes |
|-------|--------|
| sourcePath | Canonical file e.g. `src-tauri/load-page/load_page.png` |
| frontendAsset | Vite-served copy e.g. `src/assets/splash-load.png` |
| fallbackColor | `#0a192f` (or equivalent dark navy) |

### SplashOverlay

| Field | Notes |
|-------|--------|
| statusText | Optional preparing message |
| errorText | Optional error |
| placement | Bottom-right only |
| visible | True only when error or non-empty status to show |

### DefaultWindowGeometry

| Field | Value |
|-------|--------|
| width | 1400 |
| height | 900 |
| resizable | true |

### AppIconBundle

| Field | Notes |
|-------|--------|
| root | `src-tauri/icons/` |
| confRefs | Paths listed in `tauri.conf.json` → `bundle.icon` |

## State

```text
App splash phase → SplashView (artwork ± bottom-right text)
App ready → MainShell (unchanged dwell gate)
```

## Validation

- Splash DOM MUST NOT include large brand title/tagline nodes.
- Window conf width≥1280 and height≥800 (target 1400×900).
- Every `bundle.icon` path MUST exist on disk.
