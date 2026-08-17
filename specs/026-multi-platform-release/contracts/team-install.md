# Contract: Team install guide (content requirements)

Documentation shipped for the team (`docs/RELEASE.md` and/or `TESTING.md` §026) MUST include:

## Windows

- Download NSIS `*-setup.exe` from the Release (not Source code).
- Install **without administrator** (per-user).
- Optional: use in-app **Buscar actualizaciones** after older installs exist.

## macOS (x64)

- Download DMG.
- If Gatekeeper blocks: documented steps for **Open Anyway** / right-click Open (no notarization in MVP).
- Note: Apple Silicon may need Rosetta or a future arm64 build (out of scope).

## Linux

- **AppImage**: download, `chmod +x`, run.
- **.deb**: download and install via `dpkg`/`apt` as documented.
- Both formats appear on every ready release.

## Maintainer

- Bump version in `package.json` + `tauri.conf.json`.
- Tag `vX.Y.Z` and publish GitHub Release → wait for green matrix.
- Confirm four packages + `latest.json` before announcing to the team.
