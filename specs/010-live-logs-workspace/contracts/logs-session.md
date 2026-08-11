# Contract: Logs session (IPC)

## Scope

Tauri commands/events for Deployment log tabs: open follow, close, and load older history. Builds on existing `logs_open` / `logs_close` / `logs_chunk` patterns.

## Commands

### `logs_open` (existing; normative behavior)

| Input | Notes |
|-------|--------|
| environment + deployment identity + window/tab id | Live or demo |

| Behavior | Requirement |
|----------|-------------|
| Initial history | About **500 lines per matching Pod** then continue follow |
| Fan-in | Matching pods stream into same tab; pod name on chunks |
| Stop | Tab close or session end cancels follow |
| Empty pods | Clear empty/error status; no silent demo injection on live |

### `logs_close` (existing)

Cancels follow for that window/tab; no further chunks.

### `logs_load_older` (NEW)

| Input | Notes |
|-------|--------|
| `windowId` / tab id | Must match an open Deployment log session |
| environment + deployment identity | Same live session as follow |

| Behavior | Requirement |
|----------|-------------|
| Page size | About **500 additional older lines per matching Pod** |
| Method | One-shot history fetch (non-follow); must not kill active follow |
| Result payload | Older line batches **per pod** (or unified prepend list with pod attribution) + flags for which pods are exhausted |
| Exhaustion | When a pod has no additional older content, mark exhausted; when all exhausted, UI shows beginning reached |
| Errors | Actionable message; **MUST NOT** include bearer tokens / PEM / IAM secrets |
| Demo | May synthesize or page fixture history consistently with ~500 page size, or clearly indicate N/A — prefer same control UX |

### Out of scope for this contract

- Mutating kube APIs
- Persisting returned log bodies to SQLite
- Changing bastion token minting API (uses existing live session client)

## Events (existing)

| Event | Payload intent |
|-------|----------------|
| `logs_chunk` | Incremental text + pod attribution + window id |
| status events | `following`, errors, empty — no secrets |

Load-older may either:
- emit prepend-oriented chunk events with a `direction: "older"` (or equivalent) flag, **or**
- return older batches synchronously from `logs_load_older` for the FE to prepend.

Pick one in implementation; document the chosen shape in code comments and keep FE/Rust aligned. Prefer a clear `direction` or separate return path so stick-to-bottom does not treat older pages as “newest”.

## Security

- RAM only for log bodies.
- Errors redact credentials.
- Read-only log/get/list only.
