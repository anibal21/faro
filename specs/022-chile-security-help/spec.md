# Feature Specification: Chile Security Help

**Feature Branch**: `022-chile-security-help`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Chile security compliance baseline + Help → Seguridad — menú Ayuda con opción Seguridad que lista marco normativo chileno y alineación Faro; privacy/security by design sin SGSI completo ni certificaciones falsas; sin romper flujo local-first existente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar seguridad y marco normativo chileno (Priority: P1)

Un operador (con o sin ambiente conectado) abre el menú **Ayuda**, elige la primera opción **Seguridad**, y ve un diálogo o panel dentro de la app titulado de forma clara (p. ej. **Seguridad y marco normativo (Chile)**). Allí lee una introducción breve: Faro facilita higiene de seguridad/privacidad y el cumplimiento formal (p. ej. SGSI / obligaciones de operadores de importancia vital) sigue siendo de la organización. Luego ve una lista de normas y organismos chilenos con descripción corta, una sección **Cómo Faro se alinea** con puntos verificables del producto, y puede cerrar con **Entendido** (o equivalente) y seguir trabajando.

**Why this priority**: Es el entregable visible del feature y la forma de comunicar el baseline Chile sin inventar certificaciones.

**Independent Test**: Desde el chrome principal, sin depender de sesión live: Ayuda → Seguridad → diálogo con leyes listadas + alineación + cierre.

**Acceptance Scenarios**:

1. **Given** la app en el espacio de trabajo principal (conectado o no), **When** el operador abre **Ayuda**, **Then** ve **Seguridad** como primera opción del menú.
2. **Given** el menú Ayuda abierto, **When** elige **Seguridad**, **Then** se abre un diálogo/panel modal dentro de la app (no navega a un sitio externo como único resultado).
3. **Given** el diálogo abierto, **When** lee el contenido, **Then** ve introducción (2–4 frases) que distingue “Faro facilita cumplimiento” de “la organización es responsable del cumplimiento formal”.
4. **Given** el diálogo abierto, **When** revisa la lista normativa, **Then** aparecen al menos: Ley 21.663, ANCI/CSIRT Nacional, Ley 19.628 y Ley 21.719, cada una con nombre y descripción breve (1–2 oraciones) en español.
5. **Given** el diálogo abierto, **When** revisa **Cómo Faro se alinea**, **Then** ve bullets verificables: no persistir PEM/tokens/claves (solo rutas e IDs no secretos); tráfico solo a bastión/EKS del usuario; sin telemetría de credenciales/logs a terceros; K8s v1 solo lectura/observación; perfiles/prefs locales sin dumps completos de logs en v1.
6. **Given** el diálogo abierto, **When** elige **Entendido** / cerrar, **Then** el diálogo se cierra y el resto del trabajo sigue disponible.
7. **Given** el operador abre Seguridad, **When** observa la red/comportamiento de la app, **Then** no se envían datos de usuario ni del cluster a terceros solo por abrir ese diálogo.

---

### User Story 2 - Lenguaje honesto, sin certificaciones inventadas (Priority: P1)

El contenido de Seguridad usa tono profesional en español, sin legalese excesivo, y **no** afirma que Faro está certificado por ANCI ni que cumple automáticamente la Ley 21.663 como si fuera un operador de importancia vital.

**Why this priority**: Evita riesgo legal/reputacional y cumple el alcance explícito del pedido.

**Independent Test**: Revisar textos del diálogo: ausencia de frases de certificación ANCI / “cumple automáticamente como OIV”; presencia del disclaimer de responsabilidad organizacional.

**Acceptance Scenarios**:

1. **Given** el diálogo Seguridad, **When** se busca lenguaje de certificación, **Then** no hay afirmaciones de certificación ANCI ni de cumplimiento automático OIV/21.663.
2. **Given** el mismo diálogo, **When** se lee la introducción, **Then** queda claro que el SGSI / obligaciones formales son de la organización usuaria.

---

### User Story 3 - Baseline Chile documentado sin romper el producto (Priority: P2)

El feature deja constancia (en la especificación/plan de la feature) de que Faro se alinea a privacy/security by design con el marco chileno aplicable a esta herramienta, **sin** convertirse en un SGSI ni exigir que el usuario sea OIV, y **sin** cambiar el flujo existente (perfil → conectar → catálogo → logs → analizar → keep-alive) ni el modelo local-first.

**Why this priority**: Cumple el objetivo de alineación sin regresión de producto.

**Independent Test**: Checklist de alcance: sin nuevos destinos de red; sin quitar funciones; documentación de baseline “facilita cumplimiento”.

**Acceptance Scenarios**:

1. **Given** el alcance de esta feature, **When** se implementa, **Then** el flujo principal y keep-alive siguen disponibles como antes.
2. **Given** controles técnicos opcionales (Should), **When** se agregan, **Then** son aditivos (p. ej. aviso de responsabilidad o enlace desde Seguridad), no restrictivos del uso actual.

---

### Edge Cases

- Sin ambiente conectado: Ayuda → Seguridad funciona igual.
- Varios ambientes / demo: el menú no depende del tipo de ambiente.
- Reabrir Seguridad varias veces: el contenido es estable y coherente.
- Enlaces oficiales (si existen): solo fuentes oficiales; apertura segura; no obligatorios para entender el contenido.
- Usuario cierra el diálogo con Escape o botón de cierre además de Entendido (si el chrome lo permite): mismo resultado que cerrar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La aplicación MUST exponer un menú **Ayuda** en el chrome principal (barra superior o equivalente existente).
- **FR-002**: La primera opción de **Ayuda** MUST ser **Seguridad**.
- **FR-003**: Al activar **Seguridad**, la app MUST mostrar un diálogo/panel modal interno titulado de forma inequívoca sobre seguridad y marco normativo chileno.
- **FR-004**: El diálogo MUST incluir una introducción breve (2–4 frases) que indique que Faro facilita higiene de seguridad/privacidad y que el cumplimiento formal organizacional (p. ej. SGSI / OIV) es responsabilidad del operador/empresa.
- **FR-005**: El diálogo MUST listar, como mínimo, Ley 21.663, ANCI/CSIRT Nacional, Ley 19.628 y Ley 21.719, cada una con nombre oficial reconocible y descripción breve en español.
- **FR-006**: El diálogo MUST incluir la sección **Cómo Faro se alinea** con los bullets verificables del alcance (secretos no persistidos; tráfico solo a infraestructura del usuario; sin telemetría de credenciales/logs a terceros; K8s v1 lectura; datos locales sin dumps completos de logs en v1).
- **FR-007**: El diálogo MUST ofrecer una forma clara de cerrar (p. ej. **Entendido**) tras la cual el usuario recupera el uso normal de la app.
- **FR-008**: **Ayuda** / **Seguridad** MUST funcionar con y sin sesión live conectada.
- **FR-009**: Abrir **Seguridad** MUST NOT enviar datos de usuario, perfiles, hosts, logs ni credenciales a terceros.
- **FR-010**: Los textos MUST estar en español, tono profesional, y MUST NOT afirmar certificación ANCI ni cumplimiento automático como OIV bajo la 21.663.
- **FR-011**: El contenido normativo MUST estar centralizado de forma mantenible (una fuente de verdad editable), no repartido de manera inconsistente en la UI.
- **FR-012**: MUST existir evidencia automatizada de que la opción Seguridad presenta contenido que menciona Ley 21.663 y Ley 21.719 (o, en su defecto, 19.628 además de 21.663).
- **FR-013**: La documentación de la feature MUST registrar el baseline Chile: el producto facilita cumplimiento; no sustituye un SGSI ni otorga certificación regulatoria.
- **FR-014**: Esta feature MUST NOT introducir nuevos destinos de red de producto ni eliminar funciones existentes del flujo principal.
- **FR-015** (Should): Cualquier control aditivo (aviso de responsabilidad al primer uso o enlace desde el diálogo) MUST ser opcional respecto al uso diario y MUST NOT bloquear el flujo principal de forma permanente.

### Key Entities

- **Menú Ayuda**: entrada de chrome con opciones de asistencia; primera = Seguridad.
- **Diálogo Seguridad**: contenido modal con introducción, lista normativa Chile, alineación Faro, cierre.
- **Entrada normativa**: nombre + descripción breve de una ley u organismo (21.663, ANCI/CSIRT, 19.628, 21.719).
- **Punto de alineación Faro**: afirmación verificable del comportamiento del producto (no certificación externa).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de testers encuentra **Ayuda → Seguridad** y abre el diálogo en ≤ 30 segundos sin instrucciones adicionales más allá de “busca Ayuda”.
- **SC-002**: El 100% de revisiones del diálogo identifica las cuatro entradas normativas mínimas (21.663, ANCI/CSIRT, 19.628, 21.719) y la sección de alineación Faro.
- **SC-003**: El 100% de revisiones confirma ausencia de afirmaciones de certificación ANCI / cumplimiento automático OIV.
- **SC-004**: Abrir y cerrar Seguridad no interrumpe el trabajo posterior (catálogo/logs) en pruebas manuales repetidas (≥ 3 ciclos).
- **SC-005**: Una prueba automatizada falla si el contenido de Seguridad no menciona Ley 21.663 y Ley 21.719 (o 19.628 junto con 21.663).
- **SC-006**: Abrir Seguridad no genera envío de datos de usuario/cluster a destinos no configurados por el usuario (verificado por diseño/revisión: cero nuevas llamadas externas para esa acción).

## Assumptions

- El chrome principal ya existe; se añade **Ayuda** de forma mínima y coherente con el diseño actual (sin rediseño de marketing).
- “Cumplir leyes chilenas” en este feature significa **informar + alinear by design**, no emitir dictamen jurídico ni certificar al cliente.
- Vigencia orientativa de la Ley 21.719 (plena ~1 dic 2026) puede mencionarse como contexto; no se requiere actualizar textos automáticamente por calendario.
- Enlaces a BCN/LeyChile o anci.gob.cl son opcionales; el diálogo debe ser comprensible sin ellos.
- Fuera de alcance: SGSI completo, reporte automático a CSIRT, cifrado obligatorio de base local, redacción avanzada de PII en logs, cambios de keep-alive/IPC.
- Se respetan los principios de constitución Faro (higiene de secretos, solo lectura K8s v1, local-first, no exfiltración).
- Keep-alive y el resto del MVP siguen igual; esta feature no los modifica.
- **FR-015 (Should)** — aviso de responsabilidad al primer uso: **diferido**; el Must se cubre con Ayuda → Seguridad.
