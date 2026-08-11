# Quickstart: 019 Fix Keep-Alive Off & Drop Pulse Line

## Prerequisites

- `npm run tauri dev`
- Live environment connectable

## Automated

```powershell
cargo test --manifest-path src-tauri/Cargo.toml keepalive
npx vitest run tests/unit/session_keep_alive.spec.tsx
```

## Manual — OFF sticks

1. Connect live (keep-alive should start ON per 018).
2. Confirm chrome shows Keep-alive ON (or equivalent) and **no** “Último pulso”.
3. Right-click → **No mantener conexión viva**.
4. Confirm immediately: Keep-alive OFF + menu becomes **Mantener conexión viva**.
5. Wait ≥60s: still OFF.
6. Disconnect + reconnect same env: still OFF until you choose Mantener….

## Manual — pulse text gone

1. With keep-alive ON or OFF, scan env row status line.
2. Fail if any “Último pulso” / “hace Xs” appears.

## Pass

- SC-001…SC-004 from [spec.md](./spec.md)
- [keep-alive-off.md](./contracts/keep-alive-off.md), [ui-no-pulse.md](./contracts/ui-no-pulse.md)
