# Contract: Disable keep-alive end-to-end

## IPC `env_set_keep_alive`

### Invoke (frontend → Rust)

Flat arguments (preferred):

| Key | Type | Notes |
|-----|------|--------|
| `instanceId` | string | Environment id |
| `enabled` | boolean | **Must** serialize `false` when disabling |

### Response

| Field | On disable |
|-------|------------|
| `instanceId` | same id |
| `keepAlive` | `false` |

### Side effects on `enabled: false`

1. Persist preference `"false"`.
2. Stop heartbeat loop; runtime `keep_alive = false`.
3. Emit `session-health` with `keepAlive: false`.
4. Return response above.

## UI contract

1. Choosing **No mantener conexión viva** MUST invoke with `enabled: false`.
2. Within 1s of success, chrome shows **Keep-alive: OFF**.
3. Re-open menu → **Mantener conexión viva**.
4. On invoke failure → visible error; chrome must not claim OFF if still ON.

## Test contract (FR-007)

Automated test MUST fail if after the disable action the observed health state still has `keepAlive: true`.
