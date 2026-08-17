# Implementation Plan: Demo Fixtures Repair & Rich Catalog

**Branch**: `029-demo-fixtures-repair` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/029-demo-fixtures-repair/spec.md`

**Note**: Optional wireframe pre-hook skipped — backend/catalog polish; no new screens.

## Summary

Restaurar **Usar fixtures demo** tras regresión (`fixtures/demo.pem` ausente + `*.pem` en gitignore). Versionar placeholder PEM, empaquetar `fixtures/` en el bundle Tauri, resolver rutas en runtime (dev + instalador), enriquecer `hydrate_demo_catalog` con ≥2 ítems por sección y 2 réplicas por deployment, y alinear logs demo a **2 pods** hijos. Validar dos ambientes fixture conectados en paralelo (023/024).

## Technical Context

**Language/Version**: Rust 2021 (Tauri 2) · TypeScript/React · SQLite session cache

**Primary Dependencies**: `is_fixture_backed`, `demo_fixture_paths`, `hydrate_demo_catalog`, `start_demo_follow` / `load_older_demo`, `NewEnvironmentModal` restore action

**Storage**: Sin cambios de schema; detección fixture por path (`fixtures/demo.pem`) + builtin `faro-demo`

**Testing**: `cargo test hydrate_demo_catalog` · `tests/unit/demo_fixtures.spec.ts` · `tests/unit/fixture_env_upsert.spec.ts` · `tests/integration/logs_fanin.spec.ts` · manual dual-env connect

**Target Platform**: Desktop Faro (Windows-first dev; bundle NSIS/DMG/AppImage)

**Project Type**: Desktop Tauri hybrid

**Performance Goals**: Precarga fixtures ≤ 5 s (SC-001)

**Constraints**: Constitution II — placeholder PEM only, path stored not contents; demo read-only (III); no new DB column unless necessary

**Scale/Scope**: ~8 archivos tocados; sin UI nueva

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Spec-driven: `specs/029-demo-fixtures-repair/spec.md` + this plan
- [x] Secrets: `demo.pem` es placeholder fake; perfil guarda **path** únicamente
- [x] No exfiltration (VI): fixtures offline; sin egress
- [x] Network: fixture connect = `ConnectMode::Demo`; sin bastion/EKS
- [x] Read-only K8s: hydrate demo es cache local sintético
- [x] Local SQLite + rules analyzer: sin cambios
- [x] Tests planned: Rust hydrate counts + Vitest source asserts + manual multi-env
- [x] Desktop demonstrable: flujo modal → connect → logs para capturas
- [x] AI4Devs docs sync: opcional post-tasks (`6-testing.md` escenario demo)

**Post-design re-check:** PASS — sin violaciones; Complexity Tracking vacío.

## Project Structure

### Documentation (this feature)

```text
specs/029-demo-fixtures-repair/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   ├── demo-fixture-paths.md
│   ├── demo-catalog-rich.md
│   └── dual-fixture-session.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
.gitignore                              # !fixtures/demo.pem exception
fixtures/
├── demo.pem                            # tracked placeholder
└── demo-iam-credentials                # existing optional IAM demo file
src-tauri/tauri.conf.json               # bundle.resources ../fixtures/ → fixtures/
src-tauri/src/commands/connect.rs       # resolve_demo_fixture_paths + AppHandle
src-tauri/src/k8s/catalog.rs            # hydrate_demo_catalog (2×2×2×2)
src-tauri/src/k8s/logs.rs                 # start_demo_follow / load_older_demo (2 pods)
src-tauri/src/db/connection_instance.rs   # is_fixture_backed (unchanged detection)
src/components/env/NewEnvironmentModal.tsx  # Usar fixtures demo (unchanged wiring)
tests/unit/demo_fixtures.spec.ts
tests/integration/logs_fanin.spec.ts
```

**Structure Decision**: Reparación acotada en backend Rust + assets versionados; reutiliza contrato 024 para hydrate por `instance_id`. Sin migraciones SQL.

## Complexity Tracking

> No constitution violations.
