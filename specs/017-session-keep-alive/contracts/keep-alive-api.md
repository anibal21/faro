# Contract: Keep-alive API

## Commands

### `env_set_keep_alive`

**Input**

```text
{ instanceId: string, enabled: boolean }
```

**Behavior**

- Reject / no-op for demo or unknown session (clear error if not connected).
- Persist preference; start/stop 60s heartbeat task for that live session.
- Default when never set: `enabled=false`.

**Output**: `{ instanceId, keepAlive: boolean }` or void + rely on states.

### `env_connection_states` (extend)

**Output** (array):

```text
{
  instanceId: string,
  status: "connected" | "degraded" | "disconnected",
  keepAlive: boolean,
  lastPulseAt: string | null,  // ISO-8601
  mode?: "live" | "demo"
}
```

Notes:

- Instances only in runtime map appear; after forced disconnect from heartbeat failure, either keep a stub row with `disconnected` until user reconnects/dismisses, **or** remove from map and surface disconnect via event — **prefer**: mark disconnected, clear kube/tunnel, keep stub health until reconnect or explicit dismiss (document in implement). Simpler MVP: on 3 fails, run disconnect cleanup + emit event `session-health` with disconnected so UI shows Reconectar even if not in sessions map.

### Reconnect

No new command required: UI calls existing `env_connect({ instanceId })`.

## Heartbeat (internal)

- Interval: 60s.
- Primary: read-only kube check via session client.
- Optional: token refresh if near expiry.
- Must not use localhost ping as primary.
