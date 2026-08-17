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

1. **Signing secret (required — this is what failed CI):**
   - Local key file: `.tauri/faro.key` (generated with `npx tauri signer generate …`)
   - GitHub → Settings → Secrets and variables → Actions → `TAURI_SIGNING_PRIVATE_KEY`
   - Value = **entire file contents** of `.tauri/faro.key` (usually one long line).  
     Do **not** paste `.pub`, do **not** wrap in quotes, do **not** truncate.
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: leave **empty / unset** if the key has no password.
   - Error `Missing comment in secret key` = secret is wrong/incomplete.
2. Bump version in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` (same SemVer).
3. Commit, push, then create the tag + GitHub Release from `package.json` version:

```bash
npm run release
# preview only:
npm run release:dry
# custom notes:
npm run release -- --notes "Fixes and multi-platform installers"
```

(Equivalent manual: `git tag vX.Y.Z` + `gh release create …`.)

4. Wait for workflow **Release multi-platform packages** (jobs `build-windows`, `build-macos`, `build-linux`, `publish`) to go **green**.
5. Confirm the Release page lists NSIS, DMG, AppImage, `.deb`, and `latest.json` before announcing to the team.

### Common CI failures

| Symptom | Cause | What to do |
|---------|--------|------------|
| `failed to bundle … Peer disconnected` while `Downloading …/nsis-3.11.zip` | Transient GitHub download of the NSIS toolchain after a successful Rust compile | Re-run `build-windows` (workflow caches NSIS + retries) |
| `*.app.tar.gz: No such file` on macOS | Build used `--bundles dmg` only; updater tar needs the `app` bundle | Workflow must use `--bundles app,dmg` |
| `Invalid symbol 10` / `failed to decode base64 secret key` | Trailing/embedded newline in base64 private key | CI strips whitespace for base64 keys; re-copy `.tauri/faro.key` into the secret if it still fails |
| Rust `warning: … is never used` / `dead_code` | Unused items in the lib crate | Harmless — does **not** fail the job |
| `Missing comment in secret key` | Bad/truncated `TAURI_SIGNING_PRIVATE_KEY` | Fix the secret (see step 1 above) |

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
