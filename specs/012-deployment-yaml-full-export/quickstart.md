# Quickstart: 012-deployment-yaml-full-export

## Prerequisites

- Faro `npm run tauri dev` (or installed build) with demo and/or live env.
- For live: connected environment with a multi-replica Deployment and IAM/bastion as today.
- Contracts: [deployment-yaml.md](./contracts/deployment-yaml.md), [pod-fanin-logs.md](./contracts/pod-fanin-logs.md), [export-exhaust.md](./contracts/export-exhaust.md), [status-chrome.md](./contracts/status-chrome.md).

## Validation scenarios

### 1. Deployment → YAML only

1. Connect demo (or live).
2. Expand **Deployments** → open `payments-api` (or live Deployment).
3. **Expect**: YAML document with name/namespace/spec fields; **no** Raw/Structured log chrome; **no** follow “siguiendo” for this tab.
4. **Expect**: Completes within ~10s locally.

### 2. Pods → fan-in all replicas

1. Under **Pods**, open any replica of a multi-pod Deployment (demo: two pods under payments-api if present).
2. **Expect**: Log lines from **all** replicas; pod name visible per line/group.
3. Open a second replica of the **same** Deployment.
4. **Expect**: Same log tab reused/focused (not a second fan-in window), unless product documents otherwise.
5. Open an orphan pod if available → single-pod follow only.

### 3. Summary from Deployment config

1. On a fan-in log tab, check summary strip.
2. **Expect**: RAM/CPU as `request / limit` (or N/D) from Deployment template — not live usage.

### 4. Export exhaust

1. On a log tab with history deeper than the first page (demo or live after some load-older).
2. Note approximate on-screen line count → **Export**.
3. **Expect**: Progress while gathering; file larger / contains earlier lines than the pre-click buffer.
4. Cancel save dialog or Abort gather → **Expect**: no new file.

### 5. No “iniciando”

1. Open a Pod log tab.
2. **Expect**: toolbar never shows `iniciando` during normal start.

## Automated checks

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass criteria

SC-001…SC-006 from [spec.md](./spec.md) observed on demo and/or live.
