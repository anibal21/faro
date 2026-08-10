# Quickstart: 018 Keep-Alive Toggle Chrome & Overscroll

## Prerequisites

- Faro runnable (`npm run tauri dev`)
- A **live** environment configured (or observe UI with mocks in Vitest)
- Optional: prior `keepalive.<id>` preference cleared to test default ON

## Automated

```powershell
cargo test --manifest-path src-tauri/Cargo.toml keepalive
npx vitest run tests/unit/session_keep_alive.spec.tsx
```

Expect: preference default-ON tests; menu labels flip on toggle.

## Manual — keep-alive menu

1. Connect a live environment (no prior OFF preference).
2. Right-click env → see **No mantener conexión viva**.
3. Click it → menu later shows **Mantener conexión viva**; keep-alive indicator / pulses stop advancing.
4. Click **Mantener conexión viva** → back to **No mantener…**; pulses resume.
5. Demo env → no keep-alive item.

## Manual — overscroll

1. Open main window.
2. Try to pull content past the top of the window (trackpad/touchpad).
3. Expect: no elastic whole-app bounce.
4. Open a long log tab → scroll inside the log panel still works.

## Pass criteria

- SC-001…SC-005 from [spec.md](./spec.md)
- Contracts [keep-alive-toggle-ui.md](./contracts/keep-alive-toggle-ui.md) and [desktop-overscroll.md](./contracts/desktop-overscroll.md)
