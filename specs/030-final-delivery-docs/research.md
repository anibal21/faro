# Research: 030-final-delivery-docs

## Decision: Nombre estable de la guía = `DEMO.md`

**Rationale**: Corto, visible en la raíz junto a `README.md`/`TESTING.md`, fácil de citar en ficha y PRs. Cumple FR-004.

**Alternatives considered**:
- `guia-demo-fixtures.md` — más descriptivo, menos descubrible.
- Solo sección larga en README — hincha el índice; peor para evaluación paso a paso.

## Decision: URL de versión final = página de Releases (no tag único fijo en ficha)

**Rationale**: Spec exige [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases). La página lista todas las versiones; el texto debe **mencionar** la estable vigente (**1.3.0** / `v1.3.0`) y que los instaladores viven ahí.

**Alternatives considered**:
- Solo `.../releases/tag/v1.3.0` — más preciso hoy, se desactualiza al próximo bump.
- URL del repo solamente — no lleva al instalador.

## Decision: Numeración AI4Devs PR1/PR2/PR3 ≠ números históricos de GitHub

**Rationale**: En el repo ya existen PRs #1–#5 mergeados. El **#3 de GitHub** (“Se pasa versión final a producción”) **no** es la plantilla de cierre AI4Devs pendiente en `7-pull-requests.md`.  
Mapeo de **entregas formales**:

| Entrega AI4Devs | GitHub PR | Rol |
|-----------------|-----------|-----|
| Entrega 1 (doc) | [#1](https://github.com/anibal21/faro/pull/1) | Spec Kit + docs base |
| Entrega 2 (producto) | [#2](https://github.com/anibal21/faro/pull/2) | App Tauri operativa |
| Entrega 3 (cierre) | [#6](https://github.com/anibal21/faro/pull/6) | Docs finales + DEMO + Releases |

Documentar en `7-pull-requests.md` una nota breve de que #3/#4/#5 fueron merges intermedios de producto/release, no las filas vacías de la plantilla.

**Alternatives considered**:
- Reutilizar el texto del GH #3 como “PR3” de plantilla — confunde: ese PR no contiene `DEMO.md` ni ficha con Releases.
- Renumerar historia de GitHub — imposible.

## Decision: Contenido mínimo de `DEMO.md` (≥10 pasos con resultado esperado)

Basado en `specs/029-demo-fixtures-repair/quickstart.md` + `TESTING.md` §029 + menús actuales:

1. Obtener Faro (Releases o `tauri dev`)
2. Splash / ventana principal
3. Nuevo / editar ambiente → **Usar fixtures demo / restaurar demo**
4. Guardar y Conectar
5. Catálogo: Deployments `payments-api` / `payments-worker` (2/2), Pods, Services, ConfigMaps
6. Abrir logs deployment → Structured
7. Hallazgo / click análisis (si hay ERROR)
8. Raw + Pegar al final
9. Segundo ambiente fixture → ambos conservan catálogo
10. Tercera conexión → límite 2
11. Keep-alive ON/OFF (contexto menú)
12. Ayuda → Seguridad / Acerca de Faro; tema claro/oscuro
13. Notas: fixtures ≠ credenciales reales; no usar zip Source code

**Rationale**: Cubre FR-005 y SC-005 sin cluster live.

## Decision: Bloque “Proyecto final” en README + refuerzo en ficha

**Rationale**: Evaluadores empiezan por README; ficha `0` debe tener URLs. Detalle largo puede vivir en README sección dedicada y/o subsección en `1-descripcion-general-del-producto.md` con enlace cruzado — preferir **README sección “Proyecto final”** + ficha URLs para no duplicar tres veces el mismo ensayo.

**Alternatives considered**: Solo archivo `8-proyecto-final.md` — válido pero la plantilla Example1 usa `0`–`7`; añadir 8 es opcional. Spec permite README y/o doc enlazado; README + ficha es suficiente.

## Decision: Sin cambios de runtime

**Rationale**: FR-010; producto ya en 1.3.0 con fixtures y multi-catálogo.

## Resolved clarifications

No quedaron `NEEDS CLARIFICATION` en Technical Context del plan.
