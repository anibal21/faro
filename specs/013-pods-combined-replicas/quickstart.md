# Quickstart: 013-pods-combined-replicas

## Prerequisites

- Faro with demo (or live) connected; multi-replica Deployment (demo `payments-api` has 2 pods).
- Contracts: [pods-menu-groups.md](./contracts/pods-menu-groups.md), [combined-logs-open.md](./contracts/combined-logs-open.md), [combined-export.md](./contracts/combined-export.md).

## Validation

### 1. Menu grouping

1. Connect demo → expand **Pods**.
2. **Expect**: one row like `payments-api (2)` (not two peer rows `…-aaa` / `…-bbb`).
3. **Expect**: orphans (if any) listed by pod name only.

### 2. Combined active logs

1. Click `payments-api (2)`.
2. **Expect**: log tab labeled with deployment; lines from both replica pod names.
3. Click same row again → same tab focused.

### 3. Export all replicas

1. On that tab → **Export** (allow gather).
2. **Expect**: saved file mentions both replica pod names.
3. Cancel save → no file.

## Automated

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass

SC-001…SC-005 from [spec.md](./spec.md).
