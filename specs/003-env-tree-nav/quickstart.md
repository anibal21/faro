# Quickstart: Environment tree navigation (003)

## Prerequisites

- Faro runnable (`npm run tauri dev`)
- ≥2 saved environments (demo PEM/IAM fixtures OK for both)
- Feature branch / dir: `specs/003-env-tree-nav`

## Validate UI IA

1. Open Faro — left panel shows **tree of all saved envs** (name + cluster).
2. Confirm **no** right-side environment selector.
3. Confirm **no** standalone accordion-only Pods/ConfigMaps outside the tree.
4. Each root shows status icon (**red** when disconnected).

## Validate select vs connect

1. Left-click env A label → A selected; still disconnected (red).
2. Expand chevron → Pods + ConfigMaps sections appear; leaves empty/hint if not connected.
3. Right-click A → menu with **Conectar** → icon yellow then green; catalog leaves populate under A.
4. Right-click A → **Desconectar** → icon red; A’s leaves clear; tabs for A close.

## Validate multi-connect (SC-009)

1. Connect env A (green).
2. Connect env B without disconnecting A → **both green**.
3. Open a Pods leaf under A and a ConfigMap (or Pods) leaf under B → tabs show env attribution; catalogs do not mix.
4. Disconnect only B → B red; A remains green and its tabs continue.

## Validate library / a11y smoke

1. Keyboard: move focus through tree; expand/collapse; open context menu via keyboard equivalent; invoke Conectar/Desconectar.

## Automated

```bash
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

Expect new/updated tests for: tree roots = all saved; context-menu connect; multi-session peer retention; tab `navKey` includes `instanceId`.

## Contracts

- [ui-ia.md](./contracts/ui-ia.md)
- [ipc-multi-session.md](./contracts/ipc-multi-session.md)
- [data-model.md](./data-model.md)
