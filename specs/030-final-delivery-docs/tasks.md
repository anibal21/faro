# Tasks: Entrega final — documentación y guía demo

**Input**: Design documents from `/specs/030-final-delivery-docs/`  
**Branch / feature**: `finalproject-AERC` / `030-final-delivery-docs`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: Feature **documental** (FR-010). Validación = checklist de contratos + [quickstart.md](./quickstart.md). No se añaden tests Vitest/Cargo nuevos (producto demo ya cubierto en `TESTING.md` / 029). Excepción de constitución justificada: no hay runtime nuevo que cubrir.

**Organization**: Setup → Foundational (inventario fuentes) → US1–US4 → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (archivos distintos, sin dependencia incompleta)
- **[Story]**: US1…US4 según [spec.md](./spec.md)

## Path Conventions

Docs AI4Devs en raíz del repo: `README.md`, `DEMO.md`, `0-ficha-del-proyecto.md`, `1-descripcion-general-del-producto.md`, `7-pull-requests.md`, `TESTING.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar contexto Spec Kit y fuentes de verdad (PRs / Releases)

- [X] T001 Confirm `.cursor/rules/specify-rules.mdc` apunta a `specs/030-final-delivery-docs/plan.md`
- [X] T002 [P] Collect PR #2 metadata (title, URL, state, branch, body summary) for `7-pull-requests.md` from https://github.com/anibal21/faro/pull/2
- [X] T003 [P] Confirm Releases page and stable version **1.3.0** at https://github.com/anibal21/faro/releases for ficha/README/DEMO

**Checkpoint**: Fuentes listas para redactar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Inventario de gaps documentales — bloquea implementación coherente

**⚠️ CRITICAL**: No reescribir docs a ciegas sin saber placeholders actuales

- [X] T004 Inventory placeholders in `0-ficha-del-proyecto.md`, `README.md` (URL proyecto/repo), and empty PR2/PR3 sections in `7-pull-requests.md`
- [X] T005 [P] Skim `specs/029-demo-fixtures-repair/quickstart.md` and `TESTING.md` §029 for DEMO step facts (catalog names, dual-env, connection limit)

**Checkpoint**: Gaps y hechos demo confirmados

---

## Phase 3: User Story 1 — Completar registro PR2 y PR3 (P1) 🎯 MVP

**Goal**: `7-pull-requests.md` documenta Entrega 2 (GH #2) y Entrega 3 (cierre documental) sin huecos “Pendiente”.

**Independent Test**: Abrir `7-pull-requests.md` → PR2 con URL real; PR3 con alcance Releases+DEMO+ficha; nota sobre PRs históricos #3–#5 si aplica. Contrato: [contracts/pr-register.md](./contracts/pr-register.md).

### Implementation

- [X] T006 [US1] Fill **Pull Request 2** section in `7-pull-requests.md` (title, URL https://github.com/anibal21/faro/pull/2, state, branch, tickets/specs, resumen, review) per [contracts/pr-register.md](./contracts/pr-register.md)
- [X] T007 [US1] Write **Pull Request 3 / Entrega 3** section in `7-pull-requests.md` (cierre docs, DEMO, Releases, rama `finalproject-AERC`, URL placeholder o real al abrir PR) per [research.md](./research.md) numbering decision
- [X] T008 [US1] Add short appendix/note in `7-pull-requests.md` clarifying GitHub PRs #3–#5 are intermediate merges, not AI4Devs template Entrega 3

**Checkpoint**: US1 independiente — registro de PRs completo

---

## Phase 4: User Story 2 — Enlace a versión final en Releases (P1)

**Goal**: Ficha y README apuntan a Releases + repo; sin “quedará disponible al final”.

**Independent Test**: `0-ficha-del-proyecto.md` 0.4/0.5 y eco en `README.md` → https://github.com/anibal21/faro/releases y https://github.com/anibal21/faro. Contrato: [contracts/final-project-section.md](./contracts/final-project-section.md) (parte URLs).

### Implementation

- [X] T009 [P] [US2] Update `0-ficha-del-proyecto.md` fields 0.4 (Releases URL + versión 1.3.0) and 0.5 (repo URL); refresh Spec Kit pointers if stale
- [X] T010 [P] [US2] Update README ficha summary section (`## 0. Ficha del proyecto`) with Releases + repo URLs matching `0-ficha-del-proyecto.md`
- [X] T011 [US2] Update install/obtain wording in `1-descripcion-general-del-producto.md` to point at Releases assets (not Source code zip) and link `DEMO.md` when present

**Checkpoint**: US2 — evaluador llega a instaladores desde ficha/README

---

## Phase 5: User Story 3 — Guía paso a paso DEMO con fixtures (P1)

**Goal**: `DEMO.md` en raíz, ≥10 pasos con resultado esperado, enlazado desde README.

**Independent Test**: Seguir `DEMO.md` sin cluster; README muestra enlace visible. Contrato: [contracts/demo-guide.md](./contracts/demo-guide.md).

### Implementation

- [X] T012 [US3] Create `DEMO.md` at repo root with objective, obtain Faro (Releases **1.3.0** or `tauri dev`), prerequisites, fixture disclaimer per [contracts/demo-guide.md](./contracts/demo-guide.md)
- [X] T013 [US3] Add ≥10 numbered steps with **Resultado esperado** in `DEMO.md` covering: fixtures preload, connect, catalog `payments-*`, logs Structured/Raw, analysis click, stick-to-bottom, second fixture env (no catalog bleed), 3rd connection limit, keep-alive, Ayuda Seguridad/Acerca, theme
- [X] T014 [US3] Add troubleshooting section in `DEMO.md` (fixtures not found, Source code zip, no AWS required)
- [X] T015 [US3] Link `DEMO.md` from `README.md` (quick start + documentation table) so it is visible without hunting

**Checkpoint**: US3 — guía demo usable sola

---

## Phase 6: User Story 4 — Bloque detallado proyecto final (P2)

**Goal**: Sección **Proyecto final** en README (y refuerzo ficha) con entregables, demo, PRs, fuera de alcance.

**Independent Test**: Leer sección en ≤5 min; menciona Releases, DEMO, entregas 1–3. Contrato: [contracts/final-project-section.md](./contracts/final-project-section.md).

### Implementation

- [X] T016 [US4] Add **Proyecto final** section to `README.md` (product summary at close, deliverables `0`–`7` + Spec Kit + installers + DEMO, how to demo, three deliveries, out of scope) per [contracts/final-project-section.md](./contracts/final-project-section.md)
- [X] T017 [P] [US4] Sync documentation table statuses in `README.md` for `0`–`7`, `DEMO.md`, and Spec Kit 030 if listed
- [X] T018 [P] [US4] Align brief description in `0-ficha-del-proyecto.md` with final state (fixtures demo, multi-env, Releases) without inventing unreleased features

**Checkpoint**: US4 — narrativa de cierre completa

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Coherencia de enlaces y validación final

- [X] T019 [P] Add cross-link to `DEMO.md` from `TESTING.md` (short note under §029 or top) without replacing automated test docs
- [X] T020 Verify all new/updated Markdown links (Releases, repo, PR #1/#2, DEMO, specs) by opening paths locally per [quickstart.md](./quickstart.md)
- [X] T021 Mark `specs/030-final-delivery-docs/spec.md` status **Delivered** (or Ready for PR) after content lands; leave GitHub PR3 URL update as last edit when PR is opened
- [X] T022 Prepare Entrega 3 PR description (body points to Releases + DEMO + docs list) for branch `finalproject-AERC` — update URL in `7-pull-requests.md` when PR exists

**Checkpoint**: Listo para `/speckit-implement` completion + abrir PR

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 Setup** → no deps  
- **Phase 2 Foundational** → after Setup  
- **US1 / US2 / US3** → after Foundational (pueden paralelizarse en gran parte)  
- **US4** → after US2 (URLs) y US3 (`DEMO.md` link targets exist); ideally after US1 for PR map mentions  
- **Polish** → after US1–US4

### User story dependencies

```text
Setup → Foundational → US1 (PRs)
                      ↘ US2 (Releases URLs)
                      ↘ US3 (DEMO.md)
                           ↓
                         US4 (Proyecto final + table) → Polish
```

### Parallel opportunities

- T002 ∥ T003 (Setup)  
- T009 ∥ T010 (US2)  
- T017 ∥ T018 (US4)  
- T019 ∥ T020 (Polish)  
- Within Foundational: T005 ∥ after T004 starts reading  

### Independent tests (per story)

| Story | Test |
|-------|------|
| US1 | `7-pull-requests.md` has real PR2 + Entrega 3 scope |
| US2 | Ficha/README → Releases + repo |
| US3 | `DEMO.md` ≥10 steps; README links it |
| US4 | README “Proyecto final” complete |

---

## Parallel example: US2 + US3 (after Foundational)

```text
# Parallel batch A
T009 0-ficha URLs
T010 README ficha echo
T012 Create DEMO.md skeleton

# Then
T011 1-descripcion install
T013–T015 DEMO steps + README link
```

---

## Implementation strategy

### MVP (mínimo evaluable)

1. Phase 1–2  
2. **US1** (T006–T008) + **US2** (T009–T011) + **US3** (T012–T015)  
3. Stop → evaluador ya tiene PRs, Releases y DEMO  

### Incremental

4. **US4** narrativa proyecto final  
5. Polish + abrir PR Entrega 3 + T021–T022 URL  

### Notes

- No tocar `src/` / `src-tauri/`  
- Idioma: español  
- Fixtures = placeholders only  

---

## Task count summary

| Phase | Tasks | Count |
|-------|-------|-------|
| Setup | T001–T003 | 3 |
| Foundational | T004–T005 | 2 |
| US1 | T006–T008 | 3 |
| US2 | T009–T011 | 3 |
| US3 | T012–T015 | 4 |
| US4 | T016–T018 | 3 |
| Polish | T019–T022 | 4 |
| **Total** | | **22** |

**MVP scope**: US1 + US2 + US3 (T006–T015) after Setup/Foundational  
**Format validation**: All tasks use `- [ ]`, `Tnnn`, optional `[P]`, story labels on US phases only, and include file paths.

