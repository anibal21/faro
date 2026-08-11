# Quickstart: Live cluster connect (008)

## Prerequisites

- Dev: `npm run tauri dev`
- **Demo**: no bastion required
- **Live**: Windows **OpenSSH** (`ssh`) + **AWS CLI** (`aws`) installed; bastion PEM; IAM credentials file; reachable EKS; namespace with list rights

## V1 — Builtin demo

1. Launch Faro → tree shows **demo** first, **disconnected**.
2. Connect **demo** → sample Deployments/ConfigMaps (e.g. payments-*).
3. Confirm no Edit/Delete on demo (Connect/Disconnect only).
4. Restart app → demo disconnected again.

## V2 — Live environment

1. Nuevo ambiente: fill bastion/PEM/IAM/region/cluster/**namespace (required)** → save.
2. Connect that env (not demo).
3. Expect **real** workloads/ConfigMaps for that namespace (or honest empty/error—**not** payments-* demo set unless they exist for real).
4. Open a Deployment log / ConfigMap → live data (or clear error).
5. Fail a connect (bad host) → error, tree not filled with demo samples.

## V3 — Multi-connect isolation

1. Connect **demo** and one live env.
2. Confirm each shows its own catalog; actions on one do not rewrite the other’s cache.

## Automated

```bash
npm test
cd src-tauri && cargo test
```

Live AWS/bastion checks are manual (see V2); CI uses mocks + demo path.

## Contracts

- [contracts/connect-modes.md](./contracts/connect-modes.md)
- [contracts/live-k8s-session.md](./contracts/live-k8s-session.md)
