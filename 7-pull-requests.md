# 7. Pull Requests

> Documentar ≥3 Pull Requests del desarrollo (enlace, resumen, review).  
> PR1 = entrega documental / Spec Kit. PR2+ = implementación (`/speckit-implement`, HU1–HU10 / T001–T085).

---

## Pull Request 1 — Entrega 1 (especificación y plan)

| Campo | Valor |
|-------|--------|
| **Título** | feat: Se hace entrega número 1 proyecto AI4Devs |
| **URL** | https://github.com/anibal21/faro/pull/1 |
| **Estado** | Open (hacia `develop`) |
| **Rama** | `feature-entrega1-AERC` → `develop` |
| **Fecha** | 2026-07-23 |
| **Alcance** | Documentación AI4Devs + Spec Kit (sin código de app `src/` / `src-tauri/`) |
| **Tickets / tasks** | Base de todos los tickets HU1–HU10; define `tasks.md` T001–T085 (aún no implementados) |

### Resumen

Primera entrega del proyecto Faro al máster AI4Devs. Sobre un `develop` que solo tenía el README inicial, esta PR aporta:

1. **Docs de entrega Example1** (`0`–`7`, `README`, `prompts.md`): producto, arquitectura, modelo de datos, IPC, 10 HU atómicas, 10 tickets, plantilla de PRs.
2. **Spec Kit** (`specs/001-eks-log-monitor/`): `spec.md`, `plan.md`, `research.md`, `data-model.md`, contratos IPC/UI, `quickstart.md`, `tasks.md` (T001–T085).
3. **Diagramas** draw.io + SVG (`docs/architecture/` 01–05): contexto, componentes, secuencia, ER SQLite, IPC.
4. **Wireframes** SVG (01 splash … 06 hallazgo Structured).
5. **Gobernanza:** constitución Spec Kit + registro de uso de IA.

Decisiones clave documentadas: desktop Tauri (no HTTP REST); splash + purge solo sesión; SQLite durable/session; logs Structured/Raw; análisis Spring Boot al click; 10 HU para control de desarrollo.

### Review / ajustes humanos

- Redacción y alcance de la descripción del PR revisados para dejar explícito que **no hay implementación** de la app en esta entrega.
- Historias desglosadas a **10 HU atómicas** (vs. modelo grueso inicial) para alinear tickets/tasks.
- Sección “API” de la plantilla AI4Devs renombrada a **Comandos y eventos IPC** (contrato real del producto).
- Numeración de wireframes unificada (01 = splash).
- Checklist de test del PR orientado a revisión documental (enlaces, coherencia HU↔tickets↔tasks, ausencia de `src/`).

### Artefactos principales tocados

- `README.md`, `0-ficha-del-proyecto.md` … `6-tickets-de-trabajo.md`, `prompts.md`
- `specs/001-eks-log-monitor/*`
- `docs/architecture/*`, `docs/SPEC.md`
- `.specify/` (Spec Kit)

---

## Pull Request 2

**Título:** \[Pendiente — p. ej. ambientes + connect / implementación\]  
**URL:** <!-- completar -->  
**Tickets / tasks:** HU2–HU4 (T022–T041) sugerido  
**Resumen:**  
**Review / ajustes humanos:**  

---

## Pull Request 3

**Título:** \[Pendiente — p. ej. catálogo + logs + analyze\]  
**URL:** <!-- completar -->  
**Tickets / tasks:** HU5–HU8 (T042–T071) sugerido  
**Resumen:**  
**Review / ajustes humanos:**  
