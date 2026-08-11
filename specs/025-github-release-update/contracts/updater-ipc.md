# Contract: Updater IPC (Tauri)

## Commands (illustrative names)

| Command | Purpose | Notes |
|---------|---------|--------|
| `update_check` | Compare installed vs remote feed | Returns `{ status: "upToDate" \| "available" \| "unavailable", current, available?, notes?, canInstall }` |
| `update_install` | Download + install offered version | Windows only; MUST target the version from the last check/offer; errors leave prior install usable |
| `get_app_version` | Installed version string | May already exist via Tauri API on FE |

## Events (optional)

| Event | Purpose |
|-------|---------|
| `update_download_progress` | Percent/bytes for UI progress |

## ACL

Capabilities MUST allow only these updater commands; no broadening to unrelated network.

## Privacy

Request/response payloads MUST NOT include connection profiles, bastion hosts, PEM paths, logs, or analysis results.
