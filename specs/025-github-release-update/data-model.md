# Data Model: GitHub Release Update Check

## Entities

### InstalledVersion

| Field | Notes |
|-------|--------|
| version | SemVer string from running app |
| channel | implicit stable |

### RemoteRelease

| Field | Notes |
|-------|--------|
| version | SemVer from updater feed / latest |
| notes | Optional release notes text |
| pubDate | Optional RFC3339 |
| windowsAssetUrl | URL to NSIS setup (via feed platforms) |
| signature | Updater signature material for Windows asset |
| canInstall | true only on Windows in v1 when asset present |

### UpdateOffer

| Field | Notes |
|-------|--------|
| currentVersion | Installed |
| availableVersion | Remote |
| notes | Optional |
| canInstall | Platform gate |
| source | `startup` \| `manual` |

### UpdateDecision

| Field | Notes |
|-------|--------|
| action | `accept` \| `reject` \| `dismiss` |
| sessionOnly | Reject/dismiss suppresses re-prompt until next process start |

## Relationships

- One `UpdateOffer` per successful “remote newer” check.
- `accept` consumes offer → download/install pipeline for that `availableVersion` only.
- No durable skip-list entity in v1 (reoffer every launch).

## Validation

- Remote version must parse as SemVer; else treat as no-update / skip install.
- Offer install only if `canInstall` and asset+signature valid.
- Never attach user-domain fields to these entities.
