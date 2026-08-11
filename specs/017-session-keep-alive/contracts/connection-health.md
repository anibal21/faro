# Contract: Connection health

## Status labels (ES UI)

| status | Copy |
|--------|------|
| `connected` | Conectado |
| `degraded` | Degradado |
| `disconnected` | Desconectado |

## Last pulse

- Show when `lastPulseAt` present: `Último pulso: hace Xs` / `hace Ym` (or clock time).
- Hide or “—” when never pulsed (keep-alive just enabled / OFF).

## Failure rules

| consecutiveFailures | status |
|---------------------|--------|
| 0 | connected (if session up) |
| 1–2 | degraded |
| ≥3 | disconnected + stop healthy presentation + offer Reconectar |

## Events (optional)

`session-health` payload = one connection state object (same shape as list item).
