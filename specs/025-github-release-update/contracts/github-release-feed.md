# Contract: GitHub release feed

## Repository

`anibal21/faro` — official product releases.

## Primary feed

Static updater JSON (Tauri format), published with releases, e.g.:

`https://github.com/anibal21/faro/releases/latest/download/latest.json`

Must include:
- `version` (SemVer)
- `notes` (optional)
- `platforms.windows-x86_64.url` → NSIS setup asset
- `platforms.windows-x86_64.signature` → contents of `.sig`

## Rules

- Represent **latest stable** only (no drafts).
- macOS/Linux platform keys optional in v1; absence ⇒ `canInstall=false` on those OS.
- CI MUST upload NSIS + `.sig` + refresh `latest.json` when cutting a release.

## Allowed egress

HTTPS to GitHub release / updater endpoints for version metadata and installer bytes only.
