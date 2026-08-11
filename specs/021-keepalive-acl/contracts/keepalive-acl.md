# Contract: Keep-Alive Toggle ACL

## Command (unchanged IPC)

`env_set_keep_alive` — flat args from 020:

| Arg | Type | Notes |
|-----|------|-------|
| `instanceId` | string | Environment instance |
| `enabled` | bool | `false` = OFF, `true` = ON |

IPC and behavior contracts remain in 017–020. **This contract only defines ACL.**

## Permissions (`src-tauri/permissions/faro.toml`)

```toml
[[permission]]
identifier = "allow-env-set-keep-alive"
description = "Allow env_set_keep_alive (session keep-alive toggle)"
commands.allow = ["env_set_keep_alive"]
```

## Capability (`src-tauri/capabilities/default.json`)

Include in the main window `permissions` array:

```json
"allow-env-set-keep-alive"
```

Place next to other env session allows (`allow-env-connect`, `allow-env-disconnect`, `allow-env-connection-states`).

## Checklist for any future session command

1. Implement + register in `src-tauri/src/lib.rs`
2. Add `allow-*` in `faro.toml`
3. Grant in `capabilities/default.json`
4. Restart `npm run tauri dev` / rebuild

Missing step 2 or 3 ⇒ invoke denied at ACL (symptom: UI action appears broken).

## Automated evidence (FR-005)

`tests/unit/keepalive_acl.spec.ts` MUST fail if either file lacks `allow-env-set-keep-alive`.
