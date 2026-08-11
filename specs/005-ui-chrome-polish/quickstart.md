# Quickstart: UI chrome polish (005)

## Prerequisites

- Feature context: `specs/005-ui-chrome-polish/`
- `npm install` · Rust toolchain for `tauri dev`
- Prior chrome (004) present (AppMenubar, EnvTreeNav, themes)

## Run

```bash
npm run tauri dev
```

## Validation scenarios

### V1 — Typography & icons

1. Open main workspace after splash.
2. Confirm menus/tree text read at IDE workbench scale (~13px), not micro.
3. Collapse/expand env and Pods/ConfigMaps: **Plus/Minus icons** (not `>`/`v`).

### V2 — Ambientes menu & Monitor

1. Ambientes menu → only **Nuevo…** and **Desconectar todo**.
2. Left title **Monitor**; footer shows `v0.1.0` (or current package version).
3. Right-click env: same context options as before (Conectar/Desconectar/Editar).
4. Desconectar todo → confirmation always → cancel leaves sessions; OK disconnects all.

### V3 — Custom chrome + theme

1. No classic OS title bar; Faro title bar with min/max/close.
2. Temas → Oscuro/Claro: title bar + menubar + Monitor + main all flip together.
3. Drag window from title bar region.

### V4 — Splash dwell

1. Quit and relaunch.
2. Splash visible **≥ 5 seconds** even if app is ready sooner.
3. Then main workspace appears.

## Automated

```bash
npm test
npm run build
```

Expect tests covering menubar item set, Monitor label, splash dwell gate, disconnect-all confirm path (see `tasks.md` after `/speckit-tasks`).

## Contracts

- [contracts/ui-chrome.md](./contracts/ui-chrome.md)
- [contracts/splash-dwell.md](./contracts/splash-dwell.md)
