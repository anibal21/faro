# Implementation Plan: Multi-Platform Release Artifacts

**Branch**: `026-multi-platform-release` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/026-multi-platform-release/spec.md`

## Summary

Ampliar el pipeline de GitHub Release para que **construya y publique** exportables x64 de **Windows (NSIS currentUser)**, **macOS (DMG, sin notarizar)** y **Linux (AppImage + .deb)**, con **fallo estricto** si falta cualquiera. Generar `latest.json` multiplataforma para el updater (025). Documentar descarga/instalación para el equipo (Gatekeeper, AppImage, .deb). Los zip “Source code” de GitHub pueden seguir existiendo; no son el entregable.

## Technical Context

**Language/Version**: GitHub Actions (YAML) + existing Tauri 2 / Node 22 / Rust stable build toolchain  

**Primary Dependencies**: `@tauri-apps/cli`, `tauri-plugin-updater` signing (`TAURI_SIGNING_PRIVATE_KEY`), `gh` CLI for asset upload  

**Storage**: N/A (artifacts on GitHub Releases only)  

**Testing**: Workflow job assertions (required assets present); unit check of `tauri.conf.json` installMode/targets; manual quickstart install on each OS  

**Target Platform**: CI matrix — `windows-latest`, `macos-13` (Intel x64) or equiv. x86_64 macOS runner, `ubuntu-22.04` × x64  

**Project Type**: Desktop app packaging / release engineering (extends Faro Tauri app)  

**Performance Goals**: Full matrix release build completes within Actions timeouts; assets discoverable in ≤1 min on release page (SC-001)  

**Constraints**: x64 only; no Apple notarization; Windows no-admin (`currentUser`); secrets only for updater signing key; constitution VI — feed carries only version/installer URLs  

**Scale/Scope**: Four mandatory packages + signatures + one `latest.json` per published release  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/026-multi-platform-release/spec.md` + clarify session
- [x] Secrets: only Tauri updater signing private key in Actions secrets; never PEM/AWS
- [x] No exfiltration (VI): release/feed expose product binaries + version metadata only
- [x] Network: unchanged product runtime; CI egress to GitHub for upload only
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules analyzer: unchanged
- [x] Tests planned: conf/unit checks + quickstart multi-OS + CI gate job
- [x] Desktop demonstrable via published installers
- [x] AI4Devs docs: `TESTING.md` / `docs/RELEASE.md` + tickets after tasks

**Post-design re-check**: PASS — contracts limit assets and feed to build artifacts; Source code zips acknowledged as non-product.

## Project Structure

### Documentation (this feature)

```text
specs/026-multi-platform-release/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── release-assets.md
│   ├── ci-release-gate.md
│   ├── latest-json-multiplatform.md
│   └── team-install.md
└── tasks.md              # via /speckit-tasks
```

### Source Code (repository root)

```text
src-tauri/tauri.conf.json          # installMode currentUser; targets += deb
.github/workflows/
  release-updater.yml              # replace/extend → matrix Win/macOS/Linux + gate
docs/RELEASE.md                    # maintainer + team download guide (or TESTING §026)
tests/unit/
  nsis_current_user.spec.ts        # conf assert currentUser + targets
```

**Structure Decision**: No new app modules; release engineering + conf + docs. Reuses 025 updater pubkey/endpoints.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Multi-OS CI matrix | Spec requires Win+macOS+Linux packages | Windows-only workflow (025) fails FR-001/FR-006 |
| Dual Linux formats | Clarify Q4–Q5: AppImage +.deb both mandatory | AppImage-only rejected by clarify |
