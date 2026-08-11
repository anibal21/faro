# Quickstart: 020 Keep-Alive Off Must Work

## Prerequisites

- Fresh `npm run tauri dev` after this feature’s code lands
- Live environment credentials available

## Automated

```powershell
npx vitest run tests/unit/keepalive_disable.spec.tsx tests/unit/session_keep_alive.spec.tsx
cargo test --manifest-path src-tauri/Cargo.toml keepalive
```

Expect: disable path leaves `keepAlive: false` in mocked/UI state; cargo stop tests green.

## Manual (required — SC-001…004)

1. Connect live env → confirm **Keep-alive: ON**.
2. Right-click → **No mantener conexión viva**.
3. Immediately: **Keep-alive: OFF**; no error alert unless real failure.
4. Re-open menu → **Mantener conexión viva**.
5. Wait ≥60s → still OFF.
6. Disconnect + reconnect → still OFF.
7. **Mantener conexión viva** → ON again.

Repeat steps 1–6 three times (SC-001).

## Pass

- [disable-keepalive-e2e.md](./contracts/disable-keepalive-e2e.md)
- Spec SC-001…SC-005
