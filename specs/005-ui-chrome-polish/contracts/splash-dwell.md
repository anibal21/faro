# Contract: Splash minimum dwell (005)

## Rule

```text
transition_allowed = boot_ready AND (now - splash_shown_at) >= 5000ms
```

## Phases

| Phase | UI | Exit condition |
|-------|-----|----------------|
| splash | SplashView (existing branding) | `transition_allowed` |
| ready | MainShell | — |
| error | SplashView + error | purge/boot failure (may show before 5s) |

## Test hooks

- Unit/integration: set `window.__FARO_SPLASH_MIN_MS = 0` (or other ms) to override dwell in Vitest; production default remains 5000.
- Manual: cold start, stopwatch ≥5s splash before workspace.

## Non-goals

- Redesign splash art/copy
- Skip button / early dismiss
- Network version check during splash
