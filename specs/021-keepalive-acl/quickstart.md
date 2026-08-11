# Quickstart: Keep-Alive Toggle ACL (021)

## Prerequisites

- Artifacts under `specs/021-keepalive-acl/`
- Working tree includes ACL entries per [contracts/keepalive-acl.md](./contracts/keepalive-acl.md)
- **Restart** `npm run tauri dev` after any change to `faro.toml` / `default.json` (capabilities load at startup)

## Automated

```bash
npx vitest run tests/unit/keepalive_acl.spec.ts
```

Expected: both tests pass (permission present in `faro.toml`, grant present in `default.json`).

Optional regression:

```bash
npx vitest run tests/unit/keepalive_disable.spec.tsx
```

## Manual validation

### V1 — OFF authorized

1. Cold start / restart Faro after ACL change.
2. Connect a **live** environment; confirm **Keep-alive: ON**.
3. Context menu → **No mantener conexión viva**.
4. Expect: **Keep-alive: OFF** within ~1s; no ACL / “not allowed” error.
5. Wait ≥60s: stays OFF.
6. Disconnect + reconnect same env: stays OFF until **Mantener conexión viva**.

### V2 — ON still works

1. From OFF, choose **Mantener conexión viva**.
2. Expect: **Keep-alive: ON** and pulses resume.

## Contracts / model

- [contracts/keepalive-acl.md](./contracts/keepalive-acl.md)
- [data-model.md](./data-model.md)
