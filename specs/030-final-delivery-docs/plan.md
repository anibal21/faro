# Implementation Plan: Entrega final — documentación y guía demo

**Branch**: `finalproject-AERC` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/030-final-delivery-docs/spec.md`

## Summary

Cerrar la entrega AI4Devs **solo con documentación**: completar `7-pull-requests.md` (PR2 real + PR3 de cierre), publicar URL de versión final en [Releases](https://github.com/anibal21/faro/releases), añadir `DEMO.md` paso a paso con fixtures, y un bloque detallado de **proyecto final** enlazado desde el README/ficha. Sin cambios de runtime del producto (FR-010).

## Technical Context

**Language/Version**: Markdown (español) + enlaces GitHub; sin código de producto obligatorio  
**Primary Dependencies**: Docs AI4Devs existentes (`0`–`7`, `README.md`); fixtures demo ya implementados (029); release **v1.3.0** publicado  
**Storage**: N/A (archivos en repo)  
**Testing**: Revisión manual de enlaces + checklist de contratos; tests de producto existentes (`TESTING.md` / 029) como referencia cruzada, no reescritura  
**Target Platform**: Lectores/evaluadores (GitHub + app Faro instalada o `tauri dev`)  
**Project Type**: Documentación de cierre / delivery pack  
**Performance Goals**: Evaluador encuentra Releases + DEMO + PRs en ≤2 min (SC-001); guía demo ≤15 min (SC-002)  
**Constraints**: No secretos reales en docs; fixtures marcados como placeholders; aclarar numeración AI4Devs vs números históricos de GitHub (#3 ya usado)  
**Scale/Scope**: ~6–10 archivos Markdown tocados; 1 guía nueva (`DEMO.md`); sync ficha/README/PRs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against `.specify/memory/constitution.md` (Faro v1.1.0+):

- [x] Spec-driven: `specs/030-final-delivery-docs/`
- [x] Secrets: docs no incluyen PEM/IAM reales; fixtures = placeholders
- [x] No exfiltration (VI): sin telemetría nueva; solo enlaces públicos a Releases/repo
- [x] Network: docs no piden egress nuevo; demo offline vía fixtures
- [x] Read-only K8s in v1: sin contratos mutantes
- [x] Local SQLite + rules analyzer: sin cambio de motor
- [x] Tests planned: validación documental (quickstart + contracts); producto ya tiene tests demo
- [x] Desktop demonstrable vía Releases + DEMO.md
- [x] AI4Devs docs sync: ficha `0`, producto `1` (si hace falta), PRs `7`, README, guía DEMO

**Post-design re-check**: PASS — contratos son de estructura documental; sin diseño que viole higiene de secretos ni exfiltración.

## Project Structure

### Documentation (this feature)

```text
specs/030-final-delivery-docs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── pr-register.md
│   ├── demo-guide.md
│   └── final-project-section.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks (no este comando)
```

### Source Code (repository root) — archivos a editar/crear

```text
README.md                          # enlaces Releases, DEMO, proyecto final, sync tabla docs
DEMO.md                            # NUEVO — guía paso a paso fixtures
0-ficha-del-proyecto.md            # URL proyecto + repo
1-descripcion-general-del-producto.md  # instalación vía Releases + enlace DEMO (si aplica)
7-pull-requests.md                 # PR2 completo + PR3 entrega final
# Opcional breve sync:
# TESTING.md                       # enlace a DEMO.md si aporta claridad
```

**Structure Decision**: Feature 100% documental en raíz AI4Devs + `DEMO.md` nuevo. No tocar `src/` / `src-tauri/` salvo que un enlace de ruta esté roto (fuera de alcance preferente).

## Complexity Tracking

> Sin violaciones de constitución. No aplica.
