# Data Model: Compact fixed windows (007)

No SQLite changes. Geometry configuration only.

## Entities

### SplashWindowGeometry

| Field | Value / notes |
|-------|----------------|
| width | 576 (logical) |
| height | 324 (logical) |
| resizable | false while splash/error |
| centered | true on show |

### MainWindowGeometry

| Field | Value / notes |
|-------|----------------|
| width | 900 (logical default) |
| height | 600 (logical default) |
| resizable | true after ready |
| centered | true on first show after ready |
| clamp | Fit within monitor work area − margin |

### ScreenWorkArea

| Field | Notes |
|-------|--------|
| size | From current monitor (logical) |
| margin | ~48px (product constant) |

## State transitions

```text
App launch → apply splash geometry (conf / ensure) → SplashView
phase ready → clamp(main) → setSize → center → setResizable(true) → MainShell
phase error → keep splash geometry (fixed, centered)
```

## Validation

- Splash conf MUST be **576×324**.
- Main default MUST be **900×600**; clamp MUST still prevent overflow on small work areas.
- MUST NOT leave 1400×900 as launch default.
