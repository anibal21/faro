# Feature Specification: Entrega final — documentación y guía demo

**Feature Branch**: `finalproject-AERC` (entrega AI4Devs; directorio Spec Kit independiente)

**Created**: 2026-09-04

**Status**: Delivered

**Input**: User description: "Quiero ya hacer la entrega final. Este proyecto tiene todo lo final. Hay que llenar las documentaciones, ya existe el pull request 2, llena esa documentación, y ahora haremos el pull request 3, con la documentación final. Esta documentación debe tener el enlace a la versión final apuntando a esta url de releases https://github.com/anibal21/faro/releases . Se debe especificar una parte bien detallada para el proyecto final. Para la prueba de como funciona tiene información DEMO, así que puede conectar con los fixtures que tiene. Haz un .md que quede visible en el readme, y que este explique paso a paso como probar las funcionaliadades de Faro con la data demo. No olvides ningún detalle."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar registro de PR2 y PR3 en la entrega (Priority: P1)

Como evaluador o lector del repositorio, quiero ver en la documentación de Pull Requests el PR #2 (entrega de producto operativo) ya documentado con enlace, resumen y review, y un PR #3 de **entrega final documental** que cierre el ciclo AI4Devs (releases, guía demo, ficha actualizada), para poder auditar las tres entregas sin buscar en GitHub a ciegas.

**Why this priority**: Sin el historial de PRs completo, la entrega Example1 queda incompleta; el usuario indicó explícitamente llenar PR2 y documentar PR3.

**Independent Test**: Abrir `7-pull-requests.md` y verificar que PR2 y PR3 tienen título, URL (o placeholder claro si el PR3 aún no está abierto), resumen, tickets/specs cubiertos y notas de review; el README enlaza a ese archivo.

**Acceptance Scenarios**:

1. **Given** el PR #2 ya existe en GitHub (`https://github.com/anibal21/faro/pull/2`), **When** se actualiza la documentación de PRs, **Then** aparece título, URL, estado, rama, alcance funcional (app Tauri operativa, specs 002–024+), resumen y review/ajustes humanos.
2. **Given** se prepara la entrega final, **When** se documenta el PR #3 (o el PR que se abra como tercera entrega formal), **Then** el documento describe el alcance de **documentación final** (releases, ficha, guía demo, sync README) y apunta a la versión publicada.
3. **Given** un lector del README, **When** consulta la sección de Pull Requests, **Then** encuentra enlaces a PR1, PR2 y PR3 sin huecos “Pendiente” en los campos obligatorios de la plantilla AI4Devs.

---

### User Story 2 - Enlace a la versión final en Releases (Priority: P1)

Como evaluador, quiero una URL clara a la versión final instalable del producto en la página de releases del repo, para descargar Faro sin clonar ni compilar.

**Why this priority**: Es el entregable demostrable del máster; la ficha y el README aún tenían placeholders (“quedará disponible al final”).

**Independent Test**: Abrir ficha del proyecto y README; el campo URL del proyecto (y/o “versión final”) apunta a `https://github.com/anibal21/faro/releases` y menciona la versión estable actual (p. ej. **1.3.0** / tag `v1.3.0`) y que allí están instaladores Windows/macOS/Linux.

**Acceptance Scenarios**:

1. **Given** releases publicados en GitHub, **When** un evaluador abre la URL documentada, **Then** llega a la lista de releases de Faro y puede elegir la última (p. ej. Faro 1.3.0) con instaladores.
2. **Given** la ficha del proyecto (`0-ficha-del-proyecto.md` y resumen en README), **When** se lee “URL del proyecto” / repositorio, **Then** aparecen: página de releases y URL del repositorio `https://github.com/anibal21/faro`.
3. **Given** la sección detallada de proyecto final, **When** se describe cómo obtener el binario, **Then** se indica no usar el zip “Source code” como instalador y sí los assets CI (NSIS, DMG, AppImage/deb, `latest.json`).

---

### User Story 3 - Guía paso a paso con fixtures demo (Priority: P1)

Como evaluador sin bastión ni cluster EKS real, quiero un documento Markdown enlazado desde el README que explique **paso a paso** cómo probar Faro usando solo datos DEMO (fixtures), para validar el flujo completo sin infraestructura cloud.

**Why this priority**: Demostrabilidad sin dependencias externas; el producto ya incluye “Usar fixtures demo” y catálogo rico (029).

**Independent Test**: Seguir el documento desde cero (instalador o `tauri dev`) hasta ver catálogo, logs, análisis, multi-ambiente y menús de ayuda, usando únicamente fixtures; cada paso tiene resultado esperado observable.

**Acceptance Scenarios**:

1. **Given** Faro instalado o en `npm run tauri dev`, **When** el evaluador sigue la guía demo, **Then** puede precargar fixtures, conectar un ambiente demo y ver deployments/pods/services/configmaps de ejemplo (`payments-*`).
2. **Given** un ambiente demo conectado, **When** abre logs de un deployment y usa Structured/análisis, **Then** la guía indica qué observar (líneas, hallazgo de reglas, stick-to-bottom, etc.).
3. **Given** la guía, **When** el evaluador conecta un segundo ambiente fixture, **Then** se documenta que ambos conservan catálogo (fix multi-ambiente 1.3.0), límites de 2 sesiones y cómo restaurar demo tras eliminar.
4. **Given** el README, **When** se busca cómo probar sin AWS, **Then** hay un enlace visible y destacado al nuevo documento (nombre estable, p. ej. `DEMO.md` o `guia-demo-fixtures.md`).

---

### User Story 4 - Bloque detallado “proyecto final” en la documentación de entrega (Priority: P2)

Como evaluador del máster, quiero una sección bien detallada del **proyecto final** (qué se entrega, qué quedó fuera, cómo se demuestra, mapa de docs y releases), para entender el cierre del trabajo de punta a punta.

**Why this priority**: Complementa PRs y guía demo; cierra la narrativa AI4Devs (Example1 + producto + release).

**Independent Test**: Leer la sección de proyecto final (en README y/o documento dedicado enlazado) y comprobar que describe alcance final, versión, releases, guía demo, PRs 1–3 y referencias a specs 001–029 sin contradecir la constitución (solo lectura, secretos por path, local-first).

**Acceptance Scenarios**:

1. **Given** la entrega final, **When** se lee el bloque “Proyecto final”, **Then** resume producto Faro, stack a alto nivel (sin forzar cómo implementar), entregables (docs `0`–`7`, specs, instaladores, guía demo) y criterios de aceptación del curso.
2. **Given** cambios posteriores a Entrega 2 (fixtures 029, multi-catálogo, releases 1.0–1.3), **When** se documenta el cierre, **Then** esos incrementos quedan mencionados como parte del estado final, no solo el alcance MVP 001.

---

### Edge Cases

- ¿Qué pasa si el PR #3 de entrega final aún no tiene número de GitHub al escribir la doc? → Documentar título/alcance/rama y dejar URL para completar al abrir el PR, o actualizar en el mismo PR.
- ¿Qué pasa si hay un PR histórico #3 en GitHub con otro significado? → La documentación AI4Devs numera **entregas** (PR1/PR2/PR3 de la plantilla); si el número de GitHub no coincide con “tercera entrega”, aclarar en la tabla (entrega formal vs número de PR) y enlazar el PR correcto de cierre documental.
- ¿Qué pasa si el evaluador usa solo el zip Source code? → La guía y la ficha advierten que debe usar instaladores de Releases o `tauri dev` / build local.
- ¿Qué pasa si `fixtures/demo.pem` falta en un checkout incompleto? → La guía indica que el archivo debe existir en el repo / bundle y el síntoma (“demo fixtures not found”) + remedio (restaurar desde release/repo).
- ¿Qué pasa si se intenta una tercera conexión concurrente? → La guía documenta el mensaje de límite (2 sesiones).
- ¿Qué pasa si se elimina el ambiente demo builtin? → La guía documenta “Usar fixtures demo / restaurar demo”.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La documentación de Pull Requests MUST completar la entrada del **PR #2** con datos reales del PR existente en GitHub (título, URL, estado, rama, resumen de producto operativo, specs/alcance, review).
- **FR-002**: La documentación de Pull Requests MUST incluir una entrada de **PR #3 — entrega final** que cubra: documentación de cierre, enlace a releases, guía demo, actualización de ficha/README, y review esperado; si el PR aún no está abierto, MUST describir el alcance y actualizar la URL al publicarlo.
- **FR-003**: La ficha del proyecto y el README MUST publicar la **URL de versión final** apuntando a [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases), indicando la versión estable vigente (actualmente **1.3.0**) y el repositorio `https://github.com/anibal21/faro`.
- **FR-004**: MUST existir un archivo Markdown de guía demo (nombre estable en la raíz del repo, preferido `DEMO.md`) enlazado de forma visible desde el README (tabla de documentación y/o quick start).
- **FR-005**: La guía demo MUST explicar paso a paso, con resultados esperados, al menos: instalación o arranque; Usar fixtures demo / restaurar demo; conectar; explorar Deployments, Pods, Services, ConfigMaps; abrir logs (Structured/Raw); análisis al click; stick-to-bottom; segundo ambiente fixture sin pérdida de catálogo; límite de 2 conexiones; keep-alive ON/OFF (si aplica en UI); Ayuda → Seguridad y Acerca de Faro; tema claro/oscuro; nota de que fixtures no son credenciales reales.
- **FR-006**: MUST existir una sección detallada de **proyecto final** (en README y/o documento de entrega enlazado) que describa alcance entregado, demostración, releases, mapa de documentos `0`–`7`, Spec Kit y estado de cierre.
- **FR-007**: Los documentos de entrega existentes que aún digan “URL pendiente” o “PR pendiente” en ficha/PRs MUST actualizarse para reflejar el estado final (sin dejar placeholders vacíos en campos obligatorios).
- **FR-008**: La documentación MUST aclarar que la prueba principal de evaluación puede hacerse **sin cluster real** vía fixtures; el flujo live vía bastión es opcional y no bloquea la demostración.
- **FR-009**: La guía y/o sección final MUST listar instaladores típicos por plataforma presentes en Releases (Windows setup, macOS DMG/updater, Linux AppImage/deb) sin exigir que el evaluador compile.
- **FR-010**: Los cambios de esta feature son **documentación y enlaces**; MUST NOT alterar el comportamiento runtime de Faro salvo corrección documental de rutas/nombres de archivos.

### Key Entities

- **Entrega AI4Devs**: Ciclo de tres hitos documentados (PR1 especificación, PR2 producto, PR3 cierre/docs + releases).
- **Release Faro**: Versión publicada en GitHub Releases (tag, notas, assets instalables, `latest.json`).
- **Ambiente demo / fixtures**: Perfil de conexión que usa `fixtures/demo.pem` (y assets asociados) y activa catálogo/logs demo sin bastión real.
- **Guía DEMO**: Documento Markdown de prueba manual reproducible enlazado desde el README.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un evaluador encuentra en ≤2 minutos desde el README: enlace a Releases, enlace a la guía demo y enlace a `7-pull-requests.md` con PR1–PR3 documentados.
- **SC-002**: Siguiendo solo la guía demo (sin cluster EKS), un evaluador completa el flujo connect → catálogo → logs → al menos una interacción de análisis en ≤15 minutos en una máquina con Faro instalado o en modo desarrollo.
- **SC-003**: El 100% de los placeholders obligatorios de ficha (URL proyecto / repo) y de entradas PR2/PR3 en `7-pull-requests.md` quedan resueltos o, para URL de PR3, marcados con instrucción explícita de completar al abrir el PR en el mismo cambio de entrega.
- **SC-004**: La sección de proyecto final menciona explícitamente la URL [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases) y la versión final publicada (p. ej. 1.3.0).
- **SC-005**: La guía demo cubre al menos 10 pasos numerados con resultado esperado, incluyendo multi-ambiente con fixtures y el límite de dos conexiones.

## Assumptions

- El producto funcional ya está implementado (Entrega 2 + incrementos posteriores hasta 1.3.0); esta feature es de **cierre documental**, no de nuevas capacidades de runtime.
- La versión final pública de referencia es la publicada en Releases; hoy **Faro 1.3.0** (`v1.3.0`), accesible desde [https://github.com/anibal21/faro/releases](https://github.com/anibal21/faro/releases).
- El PR de GitHub #2 ([Entrega 2](https://github.com/anibal21/faro/pull/2)) es la fuente de verdad para documentar la segunda entrega.
- El “PR 3” de la plantilla AI4Devs es la **tercera entrega formal** (documentación final + guía demo + sync de ficha/releases). Puede ser un PR nuevo en la rama de entrega (`finalproject-AERC` u otra); si el número de GitHub no es literalmente `#3` por historial del repo, la doc lo aclara.
- Fixtures (`fixtures/demo.pem`, catálogo `payments-*`) bastan para la demostración evaluable sin AWS.
- Idioma de la documentación de entrega: **español** (como el resto de docs AI4Devs del repo).
- No se requiere certificación de seguridad ni cluster live para aprobar la demo documentada.

## Out of Scope

- Reescribir desde cero todas las specs 001–029.
- Cambiar el producto (features nuevas) más allá de lo necesario para alinear textos.
- Publicar un release nuevo solo por esta documentación (usar el release ya publicado salvo que el autor decida bump aparte).
- Traducir toda la documentación a inglés.
- Automatizar la guía demo como E2E UI obligatorio en CI (los tests existentes en `TESTING.md` / 029 siguen siendo complemento, no sustituto del Markdown de evaluación).
