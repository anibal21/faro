# Quickstart: Multi-Platform Release Artifacts

## Prerequisites

- Repo secrets: `TAURI_SIGNING_PRIVATE_KEY` (+ password if any)
- Push access to `anibal21/faro`
- Spec clarify decisions: x64 only; strict gate; AppImage+.deb; macOS unsigned

## V0 — Config locally

1. Confirm `src-tauri/tauri.conf.json`:
   - `bundle.windows.nsis.installMode` = `currentUser`
   - `bundle.targets` includes `nsis`, `dmg`, `appimage`, `deb`
2. Run unit assert (once implemented): `npx vitest run tests/unit/nsis_current_user.spec.ts` (or equivalent conf test)

**Expect**: Conf matches [release-assets.md](./contracts/release-assets.md) / FR-002.

## V1 — Cut a release

1. Bump version → commit → `git tag vX.Y.Z` → `gh release create vX.Y.Z --generate-notes`
2. Watch Actions: windows + macOS + linux builds → **publish**
3. Open release page

**Expect**: NSIS, DMG, AppImage, `.deb`, `latest.json` (+ sigs) visible in ≤1 min; Source code zips may also appear.

## V2 — Failure gate

1. Temporarily break one Linux bundle (or use a branch that fails deb)
2. Publish test release / dry-run

**Expect**: Pipeline red; release **not** announced as ready; no “success with missing .deb”.

## V3 — Team Windows (no admin)

1. On a non-admin Windows account, download NSIS from the release
2. Install and launch Faro

**Expect**: No admin UAC for install; app runs (SC-002).

## V4 — Team macOS / Linux smoke

1. macOS x64: open DMG per Gatekeeper doc (SC-006)
2. Linux: run AppImage; optionally install `.deb`

**Expect**: App launches without cloning the repo (SC-004).

## V5 — Updater feed

1. Fetch `…/releases/latest/download/latest.json`
2. Confirm `platforms.windows-x86_64`, `darwin-x86_64`, `linux-x86_64` URLs hit **binaries**, not source archives

**Expect**: Matches [latest-json-multiplatform.md](./contracts/latest-json-multiplatform.md).
