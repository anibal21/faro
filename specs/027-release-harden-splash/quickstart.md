# Quickstart: Release Harden & Splash Cold Start

## V0 — Conf / scripts present

1. `scripts/ci/prepare-tauri-signing.sh` exists and is invoked by Win/macOS/Linux jobs.
2. `release-updater.yml` Windows: cache Tauri NSIS + build retry loop.
3. macOS build uses `--bundles app,dmg`.
4. `tauri.conf.json` main window: `visible: false`, `backgroundColor: "#0a192f"`.

## V1 — Cold start (dev)

```bash
npm run tauri dev
```

Confirm no white flash; splash appears first.

## V2 — Cut release (maintainer)

```bash
# versions already 1.0.0 (or bump)
npm run release
```

Watch **Release multi-platform packages** → green; check Release assets.

## V3 — Ops notes

- SmartScreen: Más información → Ejecutar de todas formas (sin Authenticode aún).
- `bastion cannot describe cluster … ResourceNotFoundException`: fix cluster name + region + bastion account (`aws eks list-clusters` on bastion).

## V4 — Docs

`docs/RELEASE.md` § Common CI failures includes Peer disconnected, app.tar.gz missing, symbol 10.
