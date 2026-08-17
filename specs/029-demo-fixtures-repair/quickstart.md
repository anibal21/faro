# Quickstart: Demo Fixtures Repair (029)

## Prerequisites

- Artifacts under `specs/029-demo-fixtures-repair/`
- `fixtures/demo.pem` present in repo (tracked)
- Node + Rust toolchain

## Automated

```bash
# Rust — catalog counts per instance
cargo test --manifest-path src-tauri/Cargo.toml hydrate_demo_catalog

# Vitest — fixture assets + source invariants
npx vitest run tests/unit/demo_fixtures.spec.ts tests/unit/fixture_env_upsert.spec.ts tests/integration/logs_fanin.spec.ts
```

**Expected**: all tests pass; `demo_fixtures.spec.ts` asserts ≥2 services/configmaps and 2/2 replica declarations.

## Manual — Preload (US1)

1. `npm run tauri dev`
2. Open **Nuevo ambiente** (or edit existing)
3. Click **Usar fixtures demo / restaurar demo**
4. **Expected**: PEM field populated; no *demo fixtures not found* toast/error
5. Save and **Conectar**

## Manual — Rich catalog (US2)

1. With fixture env connected, expand sidebar sections:
   - **Deployments**: `payments-api`, `payments-worker` — each **2/2**
   - **Pods**: 4 pods total (2 per deployment)
   - **Services**: 2 entries
   - **ConfigMaps**: `payments-config`, `payments-secrets`
2. Open combined logs for `payments-api`
3. Within ~30 s, **Expected**: log lines from at least two distinct pod name tags

## Manual — Dual env (US3)

1. Create **Demo A** and **Demo B** with fixtures; connect both
2. Open deployment logs on each
3. **Expected**: two tabs, distinct env colors; no cross-instance catalog bleed
4. Attempt third connect → **Expected**: connection limit message

## Packaged build (optional)

```bash
npm run tauri build
```

Install artifact; repeat preload step. PEM path should resolve without repo checkout.

## Contracts

- [demo-fixture-paths.md](./contracts/demo-fixture-paths.md)
- [demo-catalog-rich.md](./contracts/demo-catalog-rich.md)
- [dual-fixture-session.md](./contracts/dual-fixture-session.md)
