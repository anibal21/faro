# Implementation Plan: Release Harden & Splash Cold Start

**Branch**: `027-release-harden-splash` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/027-release-harden-splash/spec.md`

**Status**: Delivered (implemented on `develop`; product **v1.0.0** published)

## Summary

Endurecer el pipeline de GitHub Release post-026 (NSIS flaky, macOS updater tar, normalización de clave de firma), eliminar el flash blanco de cold start, documentar SmartScreen/ops EKS, y cortar **Faro 1.0.0**.

## Technical Context

**Language/Version**: GitHub Actions + Tauri 2 / Node 22 / Rust stable (igual que 026)  

**Primary Dependencies**: `@tauri-apps/cli`, `scripts/ci/prepare-tauri-signing.sh`, `tauri-plugin-updater` signing  

**Storage**: N/A (artifacts on GitHub Releases)  

**Testing**: CI verde en release `v1.0.0`; Vitest splash/window; manual cold start  

**Target Platform**: Windows / macOS x64 / Linux x64 (sin cambio de matriz 026)  

**Project Type**: Release engineering + cold-start UX  

**Constraints**: Sin Authenticode en este corte; sin notarización Apple; constitution VI  

## Constitution Check

- [x] Spec-driven artifacts under `specs/027-release-harden-splash/`
- [x] Secrets: solo clave updater Tauri en Actions; script no imprime el secret
- [x] No exfiltración en feed (solo URLs/firmas de instaladores)
- [x] Network/CI: reintentos/cache NSIS; sin cambiar runtime K8s
- [x] Desktop demonstrable vía release 1.0.0
- [x] Docs: `docs/RELEASE.md` fallos comunes

**Post-design re-check**: PASS — trabajo ya en código; plan documenta decisiones entregadas.

## Project Structure

### Documentation (this feature)

```text
specs/027-release-harden-splash/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ci-signing-prep.md
│   ├── macos-updater-bundles.md
│   └── cold-start-window.md
└── tasks.md
```

### Source (touched)

```text
.github/workflows/release-updater.yml
scripts/ci/prepare-tauri-signing.sh
docs/RELEASE.md
src-tauri/tauri.conf.json          # visible:false, backgroundColor
src-tauri/capabilities/default.json
src/App.tsx / src/lib/windowGeometry.ts / index.html
package.json + tauri/Cargo versions → 1.0.0
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Retry full `tauri build` on Windows | NSIS fetch is after long compile; cargo warm on retry | Only curl prefetch — Tauri still re-downloads/verifies unless cache hit |
| Hide window until splash paint | WebView2 white flash | `backgroundColor` alone insufficient on Windows |
