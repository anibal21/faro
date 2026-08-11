# Data Model: 020 Keep-Alive Off Must Work

No new persisted entities. Clarify the disable transition:

## KeepAlivePreference

| Event | Stored value | Runtime `keep_alive` | UI |
|-------|--------------|----------------------|-----|
| Disable success | `"false"` | `false` | Keep-alive: OFF |
| Enable success | `"true"` | `true` | Keep-alive: ON |
| Reconnect with `"false"` | unchanged | loop not started | OFF |

## Command result (authoritative for UI patch)

```text
{ instanceId: string, keepAlive: boolean }
```

After disable, `keepAlive` MUST be `false`. UI MUST apply this before trusting only polls.

## Invalid states (must not occur after successful disable)

- Pref `"false"` but UI shows ON for >1s without user enable.
- Pref `"false"` but heartbeat loop still running for that instance.
