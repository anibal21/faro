# Data Model: Multi-Platform Release Artifacts

## Entities

### Product Release

| Field | Rules |
|-------|--------|
| `tag` | SemVer with `v` prefix (e.g. `v0.2.0`); matches app version |
| `version` | SemVer without requiring leading `v` in `latest.json` |
| `notes` | Optional human changelog |
| `status` | `ready` only if all **Required Packages** present; otherwise failed/not ready |

### Platform Package (Required)

| id | os | arch | format | Example asset pattern |
|----|-----|------|--------|------------------------|
| win-nsis | windows | x64 | nsis | `Faro_*_x64-setup.exe` (+ `.sig`) |
| mac-dmg | darwin | x64 | dmg | `Faro_*_x64.dmg` (and updater tar/sig as produced) |
| linux-appimage | linux | x64 | appimage | `Faro_*_amd64.AppImage` (+ `.sig` if generated) |
| linux-deb | linux | x64 | deb | `faro_*_amd64.deb` |

Validation: release gate MUST find all four formats; missing any → not ready.

### Update Feed Entry (`latest.json`)

| Field | Rules |
|-------|--------|
| `version` | Matches Product Release version |
| `notes` | Optional |
| `platforms.windows-x86_64` | `{ url, signature }` → NSIS |
| `platforms.darwin-x86_64` | `{ url, signature }` → macOS updater bundle |
| `platforms.linux-x86_64` | `{ url, signature }` → AppImage |

`.deb` is **not** required inside `platforms` (manual install only).

## Relationships

```text
Product Release 1──* Platform Package
Product Release 1──1 Update Feed Entry (published as latest.json asset)
```

## State transitions

```text
[tag created] → building → (all packages OK) → ready (assets + latest.json uploaded)
                     ↘ (any package fail) → failed (not ready for team)
```
