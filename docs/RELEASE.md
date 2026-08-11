# Faro releases — maintainer & team guide (026)

Product installers live on GitHub Releases for [`anibal21/faro`](https://github.com/anibal21/faro).  
**Source code (zip/tar.gz)** that GitHub attaches automatically is **not** the product — do not install from those archives.

## Mandatory assets (ready release)

| Platform | What to download | Notes |
|----------|------------------|--------|
| Windows | `*-setup.exe` | Per-user install (**no admin**) |
| Windows | `*-setup.exe.sig` | Updater signature (CI) |
| macOS | `*.dmg` | x64; **not** notarized |
| macOS | `*.app.tar.gz` (+ `.sig`) | Updater feed |
| Linux | `*.AppImage` (+ `.sig`) | Run / updater feed |
| Linux | `*.deb` | Manual install only (not in updater `platforms`) |
| All | `latest.json` | Updater feed |

If **any** of these build packages is missing, the release pipeline **fails** and the release is **not** ready for the team.

## Maintainer: cut a release

1. Ensure GitHub Actions secrets exist: `TAURI_SIGNING_PRIVATE_KEY` (+ optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
2. Bump version in `package.json` and `src-tauri/tauri.conf.json` (same SemVer).
3. Commit, push, tag, and publish:

```bash
git tag v0.2.0
git push origin v0.2.0
gh release create v0.2.0 --title "Faro 0.2.0" --notes "…" --latest
```

4. Wait for workflow **Release multi-platform packages** (jobs `build-windows`, `build-macos`, `build-linux`, `publish`) to go **green**.
5. Confirm the Release page lists NSIS, DMG, AppImage, `.deb`, and `latest.json` before announcing to the team.

Workflow: `.github/workflows/release-updater.yml`  
Verify script: `scripts/ci/verify-release-assets.sh`

## Team: install by OS

### Windows (no administrator)

1. Download `Faro_*_x64-setup.exe` from the Release (not Source code).
2. Run the installer — it installs for the **current user** (no UAC admin).
3. Launch Faro from the Start Menu / desktop shortcut.
4. Optional: **Ayuda → Buscar actualizaciones…** when a newer release exists.

### macOS (x64, Gatekeeper)

1. Download the `.dmg`.
2. Open the DMG and drag Faro to Applications (or run as shown).
3. If Gatekeeper blocks (“unidentified developer”):
   - System Settings → Privacy & Security → **Open Anyway**, or
   - Right-click the app → **Open** → confirm.
4. Apple Silicon: this MVP ships **x64** only; Rosetta may be required, or wait for a future arm64 build.

### Linux

**AppImage**

```bash
chmod +x Faro_*.AppImage
./Faro_*.AppImage
```

**.deb** (manual; not used by in-app auto-update)

```bash
sudo dpkg -i faro_*.deb
# or: sudo apt install ./faro_*.deb
```

## Updater feed

- URL: `https://github.com/anibal21/faro/releases/latest/download/latest.json`
- Platforms in JSON: `windows-x86_64`, `darwin-x86_64`, `linux-x86_64` (AppImage).
- **`.deb` is not** listed under `platforms` — download it from the Release page when needed.
- In-app **install** remains Windows-first (see feature 025); other OS get version awareness / manual download.
