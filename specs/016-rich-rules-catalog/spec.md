# Feature Specification: Rich Descriptive Rules Catalog

**Feature Branch**: `016-rich-rules-catalog`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Ampliar y enriquecer el motor de reglas local de Faro (sin LLM ni APIs de IA) para análisis súper descriptivo en Java/Spring Boot, Liquibase, JavaScript/Node, React y Python — schema rico, señal del log, auto-hint multi-pack, packs ampliados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hallazgos descriptivos + señal del log (Priority: P1)

Un operador (técnico o no) hace click en un write-group Structured con un error conocido (p.ej. NPE Spring del demo). El panel de análisis muestra un **título claro**, qué pasó, por qué suele ocurrir, qué mirar en el log, pasos recomendados en español, y un bloque **“Señal en el log”** con la línea de error útil y hasta un par de frames del stack tomados del propio texto — sin inventar causas ni llamar a servicios externos.

**Why this priority**: Sin presentación rica, ampliar packs no cambia la experiencia; este slice es el MVP de “análisis útil”.

**Independent Test**: Analizar un write-group con error Spring conocido y verificar título, secciones descriptivas, señal del log y ausencia de llamadas de red por el análisis.

**Acceptance Scenarios**:

1. **Given** un write-group con NullPointerException (o fixture equivalente), **When** el operador analiza, **Then** ve al menos un hallazgo con título, resumen, porqué, qué mirar y recomendación(es) en español.
2. **Given** el mismo análisis, **When** se muestra el panel, **Then** aparece “Señal en el log” con una línea de error útil y hasta 1–2 frames de stack extraídos del texto analizado.
3. **Given** análisis en curso, **When** se completa, **Then** no se usa IA generativa ni se envían logs a ningún servicio externo.

---

### User Story 2 - Catálogo Spring Boot + Liquibase (Priority: P1)

El operador analiza errores típicos de aplicaciones Java/Spring Boot y migraciones Liquibase. Faro aplica un catálogo **amplio y específico** (no solo NPE/SQL genérico): arranque/beans, datos/pool, seguridad, clientes HTTP/timeouts, validación, memoria, y fallos Liquibase (lock, checksum, migration failed). Las reglas genéricas de “ERROR” quedan en severidad informativa y no compiten como críticas falsas.

**Why this priority**: Es el stack principal del demo y de muchos workloads EKS del proyecto; entrega valor inmediato junto a US1.

**Independent Test**: Fixtures Spring NPE + Liquibase changelog lock producen ≥1 hallazgo útil cada uno; texto INFO benigno no produce hallazgos críticos.

**Acceptance Scenarios**:

1. **Given** texto de error Spring Boot / JVM representativo, **When** se analiza con el pack Spring (explícito o por hint), **Then** hay ≥1 hallazgo específico útil (no solo “hubo un ERROR”).
2. **Given** texto de Liquibase con lock o fallo de migración, **When** se analiza con el pack Liquibase (explícito o por hint), **Then** hay ≥1 hallazgo que explica lock/migración y qué mirar.
3. **Given** solo líneas INFO sin error, **When** se analiza, **Then** no hay hallazgos de severidad crítica.

---

### User Story 3 - Catálogo Node, React y Python + auto-hint (Priority: P2)

El operador analiza errores de Node.js, React (frontend en logs de contenedor) o Python. Faro elige el pack adecuado cuando no se fuerza uno, o respeta el pack elegido en el panel. Cada tecnología tiene un catálogo con el volumen orientativo acordado y copy descriptivo en el mismo formato rico.

**Why this priority**: Amplía cobertura multi-stack; depende del schema/UI de US1 y del patrón de packs de US2.

**Independent Test**: Un fixture por tecnología (Node rejection, React chunk/hydration, Python traceback) produce ≥1 hallazgo; auto-hint enruta JVM→Spring, Liquibase→Liquibase, Node→Node, React→React, Python→Python; empate/cero → Spring por defecto.

**Acceptance Scenarios**:

1. **Given** texto Node con rechazo de promesa / TypeError típico, **When** se analiza sin pack forzado (o con pack Node), **Then** ≥1 hallazgo Node útil.
2. **Given** texto React (ChunkLoadError, hydration, Minified React error, invalid hook), **When** se analiza, **Then** ≥1 hallazgo React útil.
3. **Given** Traceback Python (ModuleNotFound, Django/Flask/FastAPI o SQLAlchemy/psycopg típico), **When** se analiza, **Then** ≥1 hallazgo Python útil.
4. **Given** pack desconocido forzado desde el selector, **When** se analiza, **Then** el sistema cae a un pack por defecto seguro sin fallar.

---

### User Story 4 - Override de pack con contenido rico (Priority: P3)

Tras un análisis, el operador ve qué pack se usó, puede cambiarlo y re-analizar el mismo write-group; el panel sigue mostrando el formato descriptivo y la señal del log.

**Why this priority**: Ya existía en el feature multi-pack; aquí se valida que el override convive con el schema enriquecido.

**Independent Test**: Cambiar de Spring a Liquibase (o Node) sobre el mismo texto y ver hallazgos/pack label actualizados sin perder el layout rico.

**Acceptance Scenarios**:

1. **Given** hallazgos visibles con pack A, **When** el operador elige pack B y re-analiza, **Then** se muestran hallazgos del pack B (o vacío explícito) y el nombre del pack B.
2. **Given** vacío de coincidencias, **When** se muestra el empty state, **Then** menciona el nombre del pack usado.

---

### Edge Cases

- Write-group vacío o solo espacios → hallazgos vacíos; pack resuelto igual; señal del log ausente o vacía.
- Texto enorme → se analiza solo una porción acotada (~mismo límite interactivo actual); la UI sigue respondiendo.
- Varios packs podrían matchear → gana el de mayor puntuación de hint; empate → Spring Boot por defecto.
- Pack forzado sin reglas que matcheen → empty state claro, sin crash.
- Hallazgos antiguos con campos mínimos → el panel tolera ausencia de campos ricos (defaults seguros / mapeo desde texto legado).
- Recomendaciones no deben pedir mutar el cluster desde Faro (solo observación / acciones fuera de Faro).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El análisis al click de un write-group Structured MUST seguir siendo local, determinista y sin IA generativa ni envío de logs a terceros.
- **FR-002**: Cada hallazgo MUST poder mostrar: título, severidad, identificador de regla, resumen (qué pasó), porqué, lista “qué mirar”, y recomendación(es) accionables en español.
- **FR-003**: El catálogo de reglas MUST soportar campos enriquecidos con valores por defecto seguros cuando falten (compatibilidad con reglas/packs previos).
- **FR-004**: El resultado del análisis MUST incluir el pack aplicado (id y nombre para UI) y, cuando sea posible, una **señal del log** (línea de error útil + hasta 1–2 frames de stack) extraída del texto analizado, sin inventar contenido.
- **FR-005**: El panel de hallazgos MUST presentar el formato rico y el bloque “Señal en el log”; el empty state MUST citar el nombre del pack.
- **FR-006**: MUST existir/ampliarse un pack **Spring Boot / JVM** con catálogo específico orientativo de 25–40 reglas (arranque/beans, datos/pool, seguridad, HTTP/timeouts, validación, OOM/NPE, mensajería si aplica, etc.).
- **FR-007**: MUST existir un pack **Liquibase** (8–12 reglas) cubriendo al menos lock de changelog, fallo de checksum y migration failed / señales DATABASECHANGELOG.
- **FR-008**: MUST ampliarse el pack **Node.js** (15–20 reglas) cubriendo rechazos no manejados, TypeError, errores de filesystem/red comunes y stacks típicos de runtime Node / frameworks comunes.
- **FR-009**: MUST existir un pack **React** (8–12 reglas) cubriendo ChunkLoadError, hydration mismatch, Minified React error, invalid hook call y fallos de carga de chunks.
- **FR-010**: MUST existir un pack **Python** (15–20 reglas) cubriendo Traceback, ModuleNotFound/ImportError, KeyError/TypeError/AttributeError y patrones frecuentes Django/Flask/FastAPI y SQLAlchemy/psycopg.
- **FR-011**: Reglas genéricas de nivel ERROR/Exception MUST ser solo informativas y no generar críticos en logs INFO benignos; se MUST preferir reglas específicas (combinación de señales) para reducir falsos positivos.
- **FR-012**: Si el operador no elige pack, el sistema MUST auto-seleccionar entre Spring, Liquibase, Node, React y Python según marcadores del texto (y pista de origen si existe); empate o cero → Spring Boot por defecto.
- **FR-013**: Pack explícito conocido MUST respetarse; pack desconocido MUST caer a default seguro sin crash.
- **FR-014**: El selector de pack en el panel MUST permitir re-analizar el mismo write-group con otro pack manteniendo el layout rico.
- **FR-015**: Copy MUST ser español claro, tono colega ops; MUST NOT pedir mutaciones de cluster desde Faro; findings/historial MUST NOT incluir secretos (PEM, tokens, claves).
- **FR-016**: Must-Have stories MUST tener pruebas automatizadas (fixtures por tecnología, enrutado de hint, INFO benigno, panel con título/resumen/señal y override) y guía manual de verificación con un ejemplo por tecnología.

### Key Entities

- **Rule pack**: Catálogo nombrado (Spring Boot/JVM, Liquibase, Node.js, React, Python) con reglas versionadas embebidas en el producto.
- **Rule**: Patrón(es) de coincidencia + severidad + campos descriptivos (título, resumen, porqué, qué mirar, recomendaciones, etiquetas opcionales).
- **Analysis result**: Conjunto de hallazgos + pack usado + señal del log opcional.
- **Stack hint**: Decisión efímera de qué pack aplicar cuando el operador no fuerza uno.
- **Signal snippet**: Fragmento literal derivado del write-group (línea de error + frames), no generado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el flujo demo / fixture Spring NPE, el operador obtiene ≥1 hallazgo descriptivo (título + qué/por qué/qué mirar/qué hacer) en una interacción de análisis típica.
- **SC-002**: Fixtures representativos de Liquibase, Node, React y Python producen cada uno ≥1 hallazgo útil en la primera pasada de verificación.
- **SC-003**: Texto INFO benigno no produce hallazgos críticos en verificación automatizada.
- **SC-004**: En pruebas de hint, al menos un ejemplo por cada una de las cinco tecnologías selecciona el pack esperado; casos ambiguos usan Spring Boot por defecto.
- **SC-005**: El panel muestra “Señal en el log” cuando el texto contiene una línea de error reconocible; el override de pack actualiza hallazgos y etiqueta de pack.
- **SC-006**: El análisis no realiza llamadas de red propias (sin IA/APIs externas); la percepción de respuesta sigue siendo interactiva para write-groups típicos.
- **SC-007**: Un evaluador no técnico entiende el hallazgo Spring del demo sin leer el stack completo (validación cualitativa en quickstart / demo).

## Assumptions

- Se parte del comportamiento multi-pack ya entregado (análisis al click, packs Spring/Node mínimos, override de pack, resultado con identidad de pack).
- Los volúmenes de reglas son orientativos Must-Have; calidad del copy importa más que superar el máximo del rango.
- “React” y “Python” se detectan por texto de log en contenedores, no por inspección de código fuente del repo.
- Default ante empate/cero es Spring Boot / JVM (alineado al demo actual).
- Incremental delivery sugerida: (1) schema rico + UI + señal del log, (2) Spring + Liquibase, (3) Node + React + Python + hint ampliado.
- Fuera de alcance: LLM/embeddings/APIs cloud; editor de reglas en UI; packs .NET/Go; mutar cluster; analizar masivamente todo el buffer de la ventana.
- Constitución Faro: reglas locales deterministas; sin exfiltración; cluster solo lectura.
