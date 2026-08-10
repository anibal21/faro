# Quickstart: 017-session-keep-alive

## Prerequisites

- Faro build with this feature; at least one **live** environment that can connect.
- Contracts: [keep-alive-api.md](./contracts/keep-alive-api.md), [connection-health.md](./contracts/connection-health.md), [ui-keep-alive.md](./contracts/ui-keep-alive.md).

## Validation

### 1. Toggle + pulse (SC-001, SC-002)

1. Connect a live environment.  
2. Confirm keep-alive is **OFF** by default (no pulses).  
3. Enable **Mantener conexión viva**.  
4. Within ~90s, **Expect**: status Conectado and **Último pulso** updates.

### 2. Failure → Reconectar (SC-003, SC-004)

1. With keep-alive ON, simulate session death (stop bastion network / invalidate tunnel — lab only) **or** use a test hook that forces heartbeat failures.  
2. **Expect**: after three failures → Desconectado + **Reconectar**.  
3. Click Reconectar → session restores without re-filling the form; if toggle still ON, pulses resume.

### 3. Demo

1. Connect demo.  
2. **Expect**: keep-alive control disabled/absent.

## Automated

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pass

SC-001…SC-006 from [spec.md](./spec.md).
