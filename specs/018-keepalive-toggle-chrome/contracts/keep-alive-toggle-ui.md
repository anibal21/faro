# Contract: Keep-alive toggle UI

## Menu item (EnvTreeNav context menu)

**Visible when**: environment is **live**, **connected** or **degraded** (same gate as 017).  
**Hidden**: demo / disconnected (except reconnect path which does not show keep-alive until connected).

### Labels (action-oriented)

| `keepAlive` from health/states | Item text |
|--------------------------------|-----------|
| `true` | `No mantener conexión viva` |
| `false` | `Mantener conexión viva` |

### Behavior on select

1. Invoke `env_set_keep_alive` with `enabled = !keepAlive`.
2. On success: update local health map so next menu open shows flipped label within **1s** (optimistic + `env_connection_states` refresh).
3. On failure: show error string; label unchanged.

### Default after connect

After successful live `env_connect` with **no** stored OFF preference:

- Runtime `keepAlive` / loop = **true**
- First menu open shows **No mantener conexión viva**

## IPC (unchanged commands)

- `env_set_keep_alive({ instanceId, enabled })`
- `env_connection_states` → includes `keepAlive`

Preference read semantics: **missing key = true** (018 change from 017).
