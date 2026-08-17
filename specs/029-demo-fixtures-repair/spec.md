# Feature Specification: Demo Fixtures Repair & Rich Catalog

**Feature Branch**: `029-demo-fixtures-repair`

**Created**: 2026-08-17

**Status**: Delivered

**Input**: User description: "Dejó de funcionar los fixtures, la opción de precargarlos. Arreglarlos con dos hijos de cada componente para ver logs en vivo; el resto de componentes OK. Para sacar fotos de la demo en su esplendor. Poder probar subiendo 2 ambientes con fixtures."

## Clarifications

### Session 2026-08-17

- Q: ¿Cuántos “hijos” por componente en la demo? → A: **Dos** réplicas/pods por Deployment visible; secciones Deployments, Pods, Services y ConfigMaps con **al menos dos ítems** útiles para capturas.
- Q: ¿Alcance multi-ambiente? → A: Debe poder **conectar dos ambientes** creados con fixtures en paralelo (límite existente de 2 sesiones) para demo multi-tenant.
- Q: ¿Live vs offline? → A: Perfiles con fixtures usan modo **offline/demo** (sin bastion real); no mezclar datos fixture entre ambientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Precargar fixtures desde el modal (Priority: P1)

Como operador preparando una demo, uso **Usar fixtures demo / restaurar demo** en el modal de ambiente y el formulario se rellena con rutas válidas (PEM demo + valores placeholder) sin error.

**Why this priority**: Sin precarga, no hay demo reproducible en clones frescos ni en builds empaquetados.

**Independent Test**: Abrir modal → clic en precargar fixtures → PEM y campos mínimos poblados; guardar y conectar.

**Acceptance Scenarios**:

1. **Given** Faro en dev o build empaquetado, **When** pulso **Usar fixtures demo**, **Then** no aparece error del tipo “demo fixtures not found”.
2. **Given** el formulario precargado, **When** guardo el ambiente, **Then** el PEM apunta al fixture demo reconocido por el backend como fixture-backed.
3. **Given** un ambiente guardado con fixtures, **When** conecto, **Then** el catálogo demo se hidrata para **ese** `instance_id` (sin SSH live).

---

### User Story 2 - Catálogo demo “fotogénico” con dos hijos por componente (Priority: P1)

Como operador, al conectar un ambiente fixture veo un catálogo rico: cada Deployment con **2 pods**, al menos **2 Deployments**, **2 Services** y **2 ConfigMaps** (o entradas equivalentes), apto para abrir logs combinados de dos réplicas.

**Why this priority**: Las capturas de producto requieren árbol poblado y logs multi-pod creíbles.

**Independent Test**: Conectar fixture → expandir Deployments/Pods/Services/ConfigMaps → cada sección muestra ≥2 ítems; abrir logs de un Deployment muestra líneas de más de un pod.

**Acceptance Scenarios**:

1. **Given** ambiente fixture conectado, **When** miro Deployments, **Then** hay al menos dos deployments y cada uno declara **2/2** réplicas con dos pods en Pods.
2. **Given** el mismo catálogo, **When** miro Services y ConfigMaps, **Then** hay al least dos recursos en cada sección.
3. **Given** logs en modo demo para un deployment, **When** sigo en vivo, **Then** alternan (o mezclan) eventos de **dos** pods hijos, no un solo pod.

---

### User Story 3 - Dos ambientes fixture en paralelo (Priority: P2)

Como operador de demo, creo **dos** ambientes distintos usando fixtures, conecto ambos (hasta el límite de 2 sesiones) y cada uno mantiene catálogo/pestañas identificados por color/instancia.

**Why this priority**: Demuestra multi-ambiente sin clusters live.

**Independent Test**: Crear env A y env B con fixtures → conectar ambos → abrir recurso en cada uno; datos no se cruzan.

**Acceptance Scenarios**:

1. **Given** dos perfiles guardados con PEM fixture, **When** conecto A y luego B, **Then** ambos quedan conectados (respetando tope de 2).
2. **Given** ambos conectados, **When** abro logs en A y en B, **Then** las pestañas y el catálogo reflejan la instancia correcta (023/024).
3. **Given** solo perfiles fixture, **When** conecto, **Then** nunca se intenta túnel SSH ni describe-cluster live.

---

### Edge Cases

- Repo clonado sin `fixtures/demo.pem` local (gitignore): precarga MUST seguir funcionando vía archivo versionado o recurso empaquetado.
- Build instalado (NSIS/DMG): rutas fixture MUST resolverse desde recursos del bundle, no solo CWD del repo.
- Ambiente live real con PEM distinto: MUST NOT usar hydrate demo.
- Tercer ambiente fixture: MUST respetar límite de 2 conexiones con mensaje existente.
- Demo builtin `faro-demo`: sigue conectando offline aunque el operador no use el botón de precarga.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Usar fixtures demo** MUST resolver rutas a `demo.pem` (y credencial demo opcional) sin error en dev y en app empaquetada.
- **FR-002**: El repositorio MUST incluir un `fixtures/demo.pem` placeholder versionado (no clave real) pese a reglas globales de ignore de `*.pem`.
- **FR-003**: Los fixtures demo MUST empaquetarse como recursos del instalador cuando aplique Tauri bundle.
- **FR-004**: `hydrate_demo_catalog` MUST poblar al menos **dos Deployments**, cada uno con **dos pods**; al menos **dos Services** y **dos ConfigMaps** (o equivalente en entradas).
- **FR-005**: Logs demo para un deployment MUST fan-out sobre **dos** pods hijos (no tres genéricos si el catálogo declara dos).
- **FR-006**: Dos ambientes con PEM fixture MUST poder conectarse en paralelo y hidratar catálogos aislados por `instance_id`.
- **FR-007**: Perfiles no fixture MUST NOT recibir catálogo demo por error.

### Key Entities

- **Fixture PEM path**: Marcador de perfil offline (`fixtures/demo.pem` o ruta empaquetada equivalente).
- **Demo catalog snapshot**: Deployments, pods, services, configmaps de sesión por instancia.
- **Fixture-backed environment**: Perfil durable que conecta en `ConnectMode::Demo`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de intentos de precarga fixtures en dev/clon fresco completan sin error en ≤ 5 s.
- **SC-002**: Tras conectar fixture, un revisor cuenta ≥2 ítems en Deployments, Services y ConfigMaps y ≥2 pods bajo cada deployment demo en ≤ 1 min.
- **SC-003**: Demo de logs combinados muestra texto de al menos **dos** nombres de pod distintos en ≤ 30 s de follow.
- **SC-004**: Sesión con dos ambientes fixture conectados permite abrir un recurso en cada uno sin mezcla de instancia (0 colisiones en prueba guiada).

## Assumptions

- Se reutiliza detección fixture-backed existente (`faro-demo` o PEM contiene `fixtures/demo.pem`) — sin columna DB nueva.
- Nombres de recursos demo pueden seguir familia `payments-*` (no renombrar a `agenda-api` salvo pedido explícito).
- IAM demo file (`demo-iam-credentials`) permanece opcional/legacy; live connect no lo usa (014).
- Límite de 2 conexiones simultáneas de 023 se mantiene.

## UI Mockup

Signed-off wireframes (light theme):

| ID | File | Screen |
|----|------|--------|
| 029:01 | [wireframes/01-fixtures-preload-modal.svg](./wireframes/01-fixtures-preload-modal.svg) | Modal con **Usar fixtures demo** y PEM precargado |
| 029:02 | [wireframes/02-demo-catalog-dual-env.svg](./wireframes/02-demo-catalog-dual-env.svg) | Catálogo rico + dos pestañas fixture (Demo A / Demo B) + logs 2-pod |
