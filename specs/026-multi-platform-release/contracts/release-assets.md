# Contract: Required release assets

## Repository

`anibal21/faro`

## Mandatory assets (x64)

On a **ready** release, these MUST be present (names may include version; platform/format must be obvious):

| Platform | Format | Role |
|----------|--------|------|
| Windows | NSIS `*-setup.exe` | Install (current user, no admin) |
| Windows | `*-setup.exe.sig` | Updater signature |
| macOS | `*.dmg` | Manual install (unsigned / not notarized OK) |
| macOS | Updater bundle + `.sig` (e.g. `.app.tar.gz`) | Feed entry `darwin-x86_64` |
| Linux | `*.AppImage` | Manual run + feed `linux-x86_64` |
| Linux | AppImage `.sig` (if bundler emits) | Feed signature |
| Linux | `*.deb` | Manual install (apt/dpkg) |
| Cross | `latest.json` | Updater feed |

## Non-product

GitHub automatic **Source code (zip/tar.gz)** MAY appear. They MUST NOT be treated as installers.

## Naming

Asset names MUST allow identifying OS + format (+ arch x64/amd64) without opening the file (FR-003).
