# Tasks: Release Harden & Splash Cold Start

**Input**: Design documents from `/specs/027-release-harden-splash/`  
**Branch / feature**: `027-release-harden-splash`  
**Status**: Delivered — all tasks completed on `develop`; product tag **v1.0.0**

## Phase 1: Setup

- [X] T001 Point Speckit agent context at `specs/027-release-harden-splash/plan.md`
- [X] T002 [P] Inventory post-026 CI failures (NSIS peer disconnect, macOS tar, symbol 10) into research.md

## Phase 2: Foundational CI harden

- [X] T003 Add Windows Tauri NSIS cache + build retry in `.github/workflows/release-updater.yml`
- [X] T004 Switch macOS build to `--bundles app,dmg` and stage `.app.tar.gz`(+sig)
- [X] T005 Harden `scripts/ci/prepare-tauri-signing.sh` for base64 whitespace / plaintext minisign
- [X] T006 [P] Document common CI failures in `docs/RELEASE.md`

## Phase 3: US2 Cold start (no white flash)

- [X] T007 Set main window `visible: false` + `backgroundColor: #0a192f` in `src-tauri/tauri.conf.json`
- [X] T008 Add `allow-show` / `allow-set-focus` capabilities
- [X] T009 Implement `showMainWindow` + splash preload/reveal in `src/App.tsx` / `windowGeometry.ts`
- [X] T010 [P] Inline splash fallback background in `index.html`

## Phase 4: US3 Product 1.0.0

- [X] T011 Bump version to **1.0.0** in package.json, package-lock, tauri.conf.json, Cargo.toml/lock, fixtures
- [X] T012 Publish GitHub Release **v1.0.0** via `npm run release` and confirm multiplatform assets

## Phase 5: Docs / out of scope

- [X] T013 [P] Note SmartScreen workaround (no Authenticode yet) for team installs
- [X] T014 [P] Note bastion `DescribeCluster` ResourceNotFound as ops (cluster name/region/account)
- [X] T015 Mark feature Delivered; cross-link from 026

## Notes

- Authenticode EV/OV = future feature (not tasked here).
- Do not commit private `.tauri/*.key`.
