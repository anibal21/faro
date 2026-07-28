# Quickstart: Compact fixed windows (007)

## Prerequisites

- Feature artifacts under `specs/007-compact-fixed-windows/`
- Dev: `npm run tauri dev` (restart after conf/capability changes)

## Validation

### V1 — Splash

1. Cold start: splash window is **576×324**, centered — not ~1024×768+.
2. Window is **centered** on the screen.
3. Cannot resize during load.
4. Branded image still fills splash; dwell ≥5s still applies.

### V2 — Main

1. After ready: window grows to **900×600** (or clamped smaller on tiny displays).
2. Remains fully on-screen on 1366×768-class laptops.
3. Centered after transition; workspace usable without manual move/shrink.
4. Resize allowed after ready.

## Automated

```bash
npm test
npm run build
```

Asserts: conf splash size; geometry constants; no 1400×900 launch default.

## Contracts

- [contracts/window-geometry.md](./contracts/window-geometry.md)
