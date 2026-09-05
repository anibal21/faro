# 7. Pull Requests

> Documentar ≥3 Pull Requests del desarrollo (enlace, resumen, review).  
> Numeración **AI4Devs (entregas formales)** ≠ necesariamente el número histórico de cada PR en GitHub (ver apéndice).

---

## Pull Request 1 — Entrega 1 (especificación y plan)

| Campo | Valor |
|-------|--------|
| **Título** | feat: Se hace entrega número 1 proyecto AI4Devs |
| **URL** | https://github.com/anibal21/faro/pull/1 |
| **Estado** | Merged |
| **Rama** | `feature-entrega1-AERC` → `develop` |
| **Fecha** | 2026-07-23 |
| **Alcance** | Documentación AI4Devs + Spec Kit (sin código de app `src/` / `src-tauri/`) |
| **Tickets / tasks** | Base de tickets HU1–HU10; `tasks.md` T001–T085 (aún no implementados en esa entrega) |

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

## Pull Request 2 — Entrega 2 (producto operativo)

| Campo | Valor |
|-------|--------|
| **Título** | Entrega 2 — Faro: app desktop Tauri operativa (conexión EKS vía bastión, multi-ambiente, logs, reglas, keep-alive y empaquetado) |
| **URL** | https://github.com/anibal21/faro/pull/2 |
| **Estado** | Merged |
| **Rama** | `feature-entrega2-AERC` → `develop` |
| **Fecha** | 2026-08-10 |
| **Alcance** | Aplicación desktop real + incrementos de producto posteriores a la especificación inicial |
| **Tickets / specs** | HU1–HU16+; Spec Kit features **002–024** (layout/chrome, connect live, logs workspace, pods combinados, PEM-only, rules multi-pack, keep-alive 017–021, seguridad Chile 022, workspace delivery 023, polish 024) |

### Resumen

Segunda entrega formal: sobre la base documental de la Entrega 1, se entrega la **app usable de punta a punta** (Tauri 2 + React/TypeScript + Rust + SQLite):

1. **Producto E2E:** splash branded + purge de sesión; CRUD de ambientes (paths PEM/SSH; sin secretos en SQLite); conexión **vía bastión SSH**; catálogo Deployments/Pods/ConfigMaps/Services + YAML; workspace de logs (Structured/Raw, fan-in, stick-to-bottom); análisis local por reglas (packs Node/Spring/Python/React/Liquibase).
2. **UX / chrome:** árbol de ambientes, menubar, temas, sidebar, colores por ambiente, pestañas multi-instancia.
3. **Multi-ambiente:** hasta 10 configs / 2 conexiones concurrentes; fixtures demo hidratables; Eliminar + restaurar demo.
4. **Keep-alive** de sesión (pulso opcional, toggle, ACL).
5. **Cumplimiento / entrega:** Ayuda → Seguridad (marco Chile, sin falsa certificación); licencia MIT; tests y `TESTING.md`.

**Fuera de alcance de este PR (ya en Entrega 1):** README inicial, docs `0`–`7` base, Spec Kit `001`, diagramas y wireframes de arranque sin código de app.

### Review / ajustes humanos

- Descripción del PR acotada para dejar explícito el salto de **docs → producto ejecutable**.
- Alcance alineado a specs 002–024 (no reabrir Entrega 1).
- Test plan del PR: Vitest, `cargo test`, flujo demo fixtures, live opcional, multi-ambiente, keep-alive, NSIS.
- Revisión de que no se documenten secretos reales ni se prometan mutaciones de cluster.

### Artefactos principales

- `src/`, `src-tauri/`, `fixtures/`, `TESTING.md`
- Specs `002`…`024` + implementación asociada
- Empaquetado / branding NSIS

---

## Pull Request 3 — Entrega 3 (documentación final, Releases y guía DEMO)

| Campo | Valor |
|-------|--------|
| **Título** | Entrega 3 — Documentación final, Releases y guía DEMO |
| **URL** | *Completar al abrir el PR desde `finalproject-AERC` (próximo número en GitHub, p. ej. #6)* |
| **Estado** | En preparación / Open al publicar |
| **Rama** | `finalproject-AERC` → `develop` o `main` |
| **Alcance** | Cierre documental AI4Devs; **sin** cambio de runtime del producto (FR-010 / Spec Kit `030`) |
| **Tickets / specs** | Spec Kit [`030-final-delivery-docs`](specs/030-final-delivery-docs/) (T001–T022) |

### Resumen

Tercera entrega formal del máster. El producto ya está publicado (versión estable **Faro 1.3.0**). Esta PR cierra la documentación de evaluación:

1. **Ficha y README:** URL de versión final → [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases); URL del repositorio → [https://github.com/anibal21/faro](https://github.com/anibal21/faro).
2. **`DEMO.md`:** guía paso a paso para probar Faro **solo con fixtures demo** (sin bastión/EKS real).
3. **Registro de PRs:** completar Entrega 2 (este archivo) y documentar Entrega 3.
4. **Sección Proyecto final** en el README: entregables, cómo demostrar, mapa de tres entregas, fuera de alcance.
5. **Spec Kit 030:** spec/plan/tasks de cierre documental.

### Review / ajustes humanos

- Separar claramente **entregas AI4Devs (1–3)** de PRs históricos de GitHub con otros números.
- No usar el zip “Source code” de Releases como instalador; apuntar a assets NSIS/DMG/AppImage/deb.
- Guía DEMO debe ser reproducible por un evaluador sin AWS.
- Actualizar la URL de esta fila cuando el PR de GitHub exista.

### Artefactos principales

- `DEMO.md`, `README.md`, `0-ficha-del-proyecto.md`, `1-descripcion-general-del-producto.md`, `7-pull-requests.md`, `TESTING.md`
- `specs/030-final-delivery-docs/*`

---

## Apéndice — PRs intermedios en GitHub (no son las filas de plantilla AI4Devs)

Estos merges existieron en el repo **entre** o **después** de las entregas formales; no sustituyen Entrega 3:

| PR | Título (resumen) | Rol |
|----|------------------|-----|
| [#3](https://github.com/anibal21/faro/pull/3) | Se pasa versión final a producción | Merge intermedio (no es el cierre documental DEMO/Releases de Entrega 3) |
| [#4](https://github.com/anibal21/faro/pull/4) | Lógica de auto-actualización | Incremento de producto (updater) |
| [#5](https://github.com/anibal21/faro/pull/5) | Primera entrega formal de proyecto funcionando | Merge develop → main / producto |

La **Entrega 3** de esta plantilla es el PR de documentación final desde `finalproject-AERC` (fila anterior).
