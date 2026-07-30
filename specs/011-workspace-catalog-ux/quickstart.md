# Quickstart: Workspace catalog & UI polish

## Prerequisites

- `npm run tauri dev`
- Demo and/or live connected environment
- Contracts: [catalog-nav-ui.md](./contracts/catalog-nav-ui.md), [workload-summary.md](./contracts/workload-summary.md), [export-text.md](./contracts/export-text.md)

## Validate catalog sections

1. Connect an environment.
2. Confirm section order: **Deployments → Pods → Services → ConfigMaps**.
3. Child items indented past section titles.
4. Open one Deployment → fan-in logs; one Pod → pod logs; one Service → read-only detail; one ConfigMap → existing tab.

## Validate summary strip

1. Open a Deployment with known requests/limits and replicas.
2. Confirm Replicas populated; RAM/CPU as `request / limit` for **one pod**; Uptime when known; no live-usage wording.

## Validate stick + scrollbars + Spanish status

1. “Pegar al final” checkbox adjacent to its label.
2. Overflow logs/ConfigMap/tree → thin themed scrollbars (light + dark).
3. Follow status shows Spanish (e.g. **siguiendo**), not “following”.

## Validate export

1. Log tab with content → Export → save `.txt` → file is Raw buffer; cancel writes nothing.
2. ConfigMap tab → Export → file has keys/values; no secrets.

## Automated checks

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```
