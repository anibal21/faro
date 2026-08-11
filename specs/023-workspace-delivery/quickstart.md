# Quickstart: Workspace Delivery (023)

## Prerequisites

- Artifacts under `specs/023-workspace-delivery/`
- `npm run tauri dev` (and later `tauri build` for installer)

## Automated

```bash
npx vitest run tests/unit/env_colors.spec.ts tests/unit/tab_keys_instance.spec.ts tests/unit/connection_cap.spec.tsx tests/unit/env_delete.spec.tsx
cargo test --manifest-path src-tauri/Cargo.toml
```

(Adjust names to match tasks.md when implemented.)

## Manual

### V1 — Resize
1. Main window cannot shrink below 900×600.
2. Drag sidebar; width clamps ~200–360; content usable.

### V2 — Fixtures
1. Connect demo / load fixtures; exercise catalog, logs, analyze, configmap/yaml/service tabs.

### V3 — Eliminar + restore
1. Eliminar custom env → gone.
2. Eliminar demo → gone after refresh.
3. Restaurar vía fixtures → demo returns.

### V4 — Colors
1. Multiple envs show distinct left color bars.
2. Tabs show matching border; check light and dark theme.

### V5 — Multi tabs
1. Connect env A and B (≤2).
2. Open same deployment name on both → two tabs; switching keeps separate streams.

### V6 — Cap 2
1. With A+B connected, connect C → modal; no third session.
2. Disconnect one → C connects.

### V7 — Cap 10
1. Create 10 configs → 11th blocked with message.

### V8 — Installer
1. `npm run tauri build` → NSIS shows Faro, Aníbal Rodríguez, MIT, ES, shortcuts.

## Contracts

- [layout-resize.md](./contracts/layout-resize.md)
- [env-color-limits.md](./contracts/env-color-limits.md)
- [multi-session-tabs.md](./contracts/multi-session-tabs.md)
- [connection-cap.md](./contracts/connection-cap.md)
- [env-delete-fixtures.md](./contracts/env-delete-fixtures.md)
- [nsis-faro.md](./contracts/nsis-faro.md)
