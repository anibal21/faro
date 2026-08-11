# Data Model: 017-session-keep-alive

## Entities

### SessionHealth (ephemeral, per connected instance)

| Field | Values / notes |
|-------|----------------|
| `instanceId` | Connection instance id |
| `status` | `connected` \| `degraded` \| `disconnected` |
| `keepAlive` | bool (desired; default false) |
| `lastPulseAt` | RFC3339 or null |
| `consecutiveFailures` | u32 (runtime only; may omit from IPC) |
| `mode` | `live` \| `demo` — keep-alive only for live |

### KeepAlivePreference (durable, light)

| Field | Notes |
|-------|--------|
| key | e.g. `keepalive.<instanceId>` in ui_preferences |
| value | `"true"` / `"false"`; missing → false |

### HeartbeatResult (ephemeral)

| Field | Notes |
|-------|--------|
| `ok` | bool |
| `at` | timestamp |
| `reason` | optional short code for tests (`kube_ok`, `kube_err`, `no_session`) |

## State transitions

```text
[not in runtime] --env_connect--> connected (keepAlive from pref, default false)

connected + keepAlive ON --pulse ok--> connected (lastPulseAt=now, failures=0)
connected + keepAlive ON --pulse fail--> degraded (failures+=1) if failures < 3
degraded --pulse ok--> connected (failures=0)
degraded|connected --failures >= 3--> disconnected (offer Reconectar; stop pretending healthy)
disconnected --Reconectar/env_connect ok--> connected (+ restart loop if keepAlive)
* --env_disconnect / keepAlive OFF--> stop timer; disconnect clears session
```

## Validation

- Heartbeat interval fixed **60s**.
- Threshold **3** consecutive failures → `disconnected`.
- Demo: `keepAlive` forced false / UI disabled.
