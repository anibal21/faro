# Implementation Plan: GitHub Release Update Check

**Branch**: `025-github-release-update` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-github-release-update/spec.md`

## Summary

Tras la pantalla principal (y vía menú Ayuda), Faro consulta el latest release de **`anibal21/faro`**, compara con la versión instalada y, si hay novedad, ofrece actualizar. En **Windows**, al aceptar se descarga el instalador NSIS firmado/publicado y se lanza; en macOS/Linux v1 solo aviso informativo. Enfoque: `tauri-plugin-updater` + artefacto `latest.json` en GitHub Releases (CI), UI React no bloqueante.

## Technical Context

**Language/Version**: TypeScript (React 19) + Rust (edition 2021) / Tauri 2  

**Primary Dependencies**: `tauri-plugin-updater` (+ JS bindings), semver compare, existing AppMenubar / dialogs  

**Storage**: N/A for dismiss persistence (reoffer every launch); version from app package / Tauri  

**Testing**: Vitest (UI/menu/offer states) + cargo unit (version compare helpers if any) + manual quickstart Windows  

**Target Platform**: Windows-first install; macOS/Linux check+info only in v1  

**Project Type**: Desktop app (Tauri)  

**Performance Goals**: Check completes &lt;10s p95 with network (SC-001/SC-006); non-blocking UI  

**Constraints**: Constitution VI — only product version/release metadata+installer egress to GitHub; no user-domain data; optional consent; no force-update  

**Scale/Scope**: One check per launch + manual; single latest stable release offer  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/025-github-release-update/spec.md` approved via clarify
- [x] Secrets: no PEM/AWS in update path
- [x] No exfiltration (VI): only tool version + GitHub release metadata/installer assets
- [x] Network: GitHub Releases is the allowed non-user endpoint for update check (constitution VI example)
- [x] Read-only K8s: unchanged
- [x] Local SQLite + rules analyzer: unchanged
- [x] Tests planned: unit/integration + quickstart Windows install path
- [x] Desktop demonstrable
- [x] AI4Devs docs sync: note in TESTING / tickets after tasks

**Post-design re-check**: PASS — contracts limit payloads to version/release; no profile/log egress.

## Project Structure

### Documentation (this feature)

```text
specs/025-github-release-update/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── update-check-ui.md
│   ├── updater-ipc.md
│   └── github-release-feed.md
└── tasks.md              # via /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/chrome/AppMenubar.tsx          # Ayuda → Buscar actualizaciones…
├── components/update/UpdateAvailableDialog.tsx  # offer Accept/Reject
├── hooks/useAppUpdateCheck.ts                # post-ready + manual trigger
└── lib/appVersion.ts                         # existing version display helpers

src-tauri/
├── src/lib.rs / commands/update.rs           # check / download+install wrappers
├── capabilities/                             # updater ACL
└── tauri.conf.json                           # plugins.updater + createUpdaterArtifacts

.github/workflows/                            # publish latest.json + .sig on release (CI)
tests/unit/                                   # update_offer_ui, menubar_check_updates, …
```

**Structure Decision**: Extend existing Tauri+React app; no new top-level package. Windows uses official updater plugin against GitHub-hosted static JSON; other OS get check-only UI.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Egress to GitHub (non-user host) | Spec + constitution VI explicitly allow version/update check | Blocking all egress would make auto-update impossible |
