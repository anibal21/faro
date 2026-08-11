# Contract: Keep-alive OFF must stick

## Command `env_set_keep_alive`

### Disable (`enabled: false`)

1. Persist preference `"false"` for `keepalive.<instanceId>`.
2. Cancel heartbeat task for that session.
3. Set runtime `health.keep_alive = false`.
4. Emit `session-health` (or equivalent) with `keepAlive: false` for that `instanceId`.
5. Return `{ instanceId, keepAlive: false }`.

### Enable (`enabled: true`)

Unchanged from 018: persist true, `start_loop`, health `keepAlive: true`.

## `env_connection_states`

After disable, listed row for that instance MUST report `keepAlive: false` until enable or disconnect removes the session.

## Reconnect

If preference is `"false"`, `env_connect` MUST NOT start the keep-alive loop.

## Frontend

- Toggle OFF must call IPC with boolean `false`.
- After success (or optimistic + refresh), UI MUST show OFF; subsequent `session-health` events MUST NOT leave the UI stuck on ON without a matching runtime `keepAlive: true`.
