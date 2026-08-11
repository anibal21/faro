# Feature Specification: Workspace Delivery Polish

**Feature Branch**: `023-workspace-delivery`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "Panel izquierdo redimensionable + app responsive con mínimos actuales; fixtures de prueba ricos; Eliminar en menú de ambiente (demo eliminable y restaurable vía fixture); color de ambiente (línea + borde de pestañas); multi-conexión con pestañas del mismo pod en ambientes distintos; máximo 2 conexiones simultáneas (modal si tercera); máximo 10 configuraciones (10 colores light/dark); instalador temático Faro (detalles a aclarar)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Panel y ventana redimensionables con mínimos (Priority: P1)

Un operador puede ensanchar o estrechar el panel izquierdo (árbol de ambientes/configuraciones). El área de contenido (workspace central) no puede quedar por debajo del ancho y alto mínimos equivalentes a su tamaño usable por defecto actual. La ventana completa de Faro también se puede redimensionar, pero no por debajo del tamaño mínimo por defecto actual de la app en estado listo para trabajar.

**Why this priority**: Base de usabilidad al comparar varios ambientes y tabs.

**Independent Test**: Arrastrar divisor del panel; intentar encoger contenido/ventana bajo el mínimo → se detiene en el mínimo; agrandar funciona.

**Acceptance Scenarios**:

1. **Given** el workspace principal visible, **When** el operador arrastra el borde del panel izquierdo, **Then** el panel cambia de ancho y el resto del layout se adapta sin romper menús ni tabs.
2. **Given** el panel o la ventana en el tamaño por defecto actual, **When** intenta reducir por debajo de ese mínimo, **Then** no puede quedar más pequeño que ese mínimo (panel de contenido y ventana completa según corresponda).
3. **Given** la ventana por encima del mínimo, **When** la agranda, **Then** panel y contenido siguen usables (layout responsive).

---

### User Story 2 - Fixtures de prueba ricos para toda la funcionalidad (Priority: P1)

Existe un conjunto de datos/fixtures de prueba que permite ejercer las capacidades actuales de Faro en modo demo o carga de fixture: catálogo, logs, análisis, configmaps, servicios, YAML, keep-alive UI donde aplique, y el nuevo menú Eliminar / colores / multi-conexión en la medida en que el demo lo soporte.

**Why this priority**: Necesario para validar la entrega final sin depender solo de clusters live.

**Independent Test**: Cargar/usar el fixture de pruebas y recorrer las pantallas/funciones principales con datos visibles.

**Acceptance Scenarios**:

1. **Given** el fixture de pruebas disponible, **When** el operador lo usa (demo o carga), **Then** ve datos suficientes para ejercitar los componentes principales actuales.
2. **Given** se eliminó el demo, **When** vuelve a crear/cargar desde el fixture de pruebas, **Then** el ambiente demo de prueba vuelve a estar disponible.

---

### User Story 3 - Eliminar configuración (incl. demo restaurable) (Priority: P1)

En el menú contextual del ambiente (junto a Conectar y Editar configuración) existe **Eliminar**, que quita esa configuración del sistema. El demo también se puede eliminar. Tras eliminarlo, sigue siendo posible volver a tenerlo creando/cargando de nuevo desde el fixture de pruebas.

**Why this priority**: Gestión completa del ciclo de vida de perfiles antes de entregar.

**Independent Test**: Eliminar un ambiente custom y el demo; confirmar que desaparecen de la lista; restaurar demo vía fixture.

**Acceptance Scenarios**:

1. **Given** un ambiente en el árbol, **When** elige **Eliminar** y confirma, **Then** esa configuración deja de listarse y no queda seleccionable.
2. **Given** el ambiente demo, **When** lo elimina, **Then** desaparece de la lista.
3. **Given** demo eliminado, **When** crea/carga otra conexión usando el fixture de pruebas, **Then** el demo (o equivalente de prueba) vuelve a estar disponible.

---

### User Story 4 - Color de ambiente en árbol y pestañas (Priority: P1)

A la izquierda del nombre de cada ambiente/cluster en el panel izquierdo hay una **línea vertical** con el color asignado a ese ambiente. Las pestañas abiertas desde ese ambiente muestran **borde** (o equivalente claro) en el mismo color, para distinguir de un vistazo a qué ambiente pertenece cada pestaña.

**Why this priority**: Diferenciación visual multi-ambiente (complementa US5).

**Independent Test**: Dos ambientes con colores distintos → líneas distintas; abrir tab de cada uno → bordes del color correspondiente.

**Acceptance Scenarios**:

1. **Given** al menos dos ambientes con color asignado, **When** mira el árbol, **Then** cada uno muestra una línea vertical de color distinta a la izquierda del nombre.
2. **Given** pestañas abiertas desde ambientes distintos, **When** mira la barra de pestañas, **Then** cada pestaña refleja el color de su ambiente de origen (borde u indicador equivalente inequívoco).
3. **Given** tema claro u oscuro, **When** compara los 10 colores del sistema, **Then** todos se distinguen de forma usable en ambos temas.

---

### User Story 5 - Varias conexiones y pestañas del mismo recurso en distintos ambientes (Priority: P1)

Faro permite estar conectado a más de un ambiente a la vez (hasta el límite de US6). El operador puede abrir pestañas del mismo pod/deployment (mismo nombre lógico) en ambientes distintos; las pestañas son independientes (no se pisan entre sí) y se distinguen por el color/contexto del ambiente (US4).

**Why this priority**: Caso real dev/qa/staging; corrige la ambigüedad actual de pestañas.

**Independent Test**: Conectar dos ambientes; abrir el mismo deployment/pod en ambos; dos pestañas activas con datos/contexto distintos y distinción visual.

**Acceptance Scenarios**:

1. **Given** dos ambientes conectados, **When** abre el mismo nombre de deployment/pod en cada uno, **Then** existen dos pestañas distintas (no se reemplaza una por la otra).
2. **Given** esas dos pestañas, **When** las alterna, **Then** cada una muestra el stream/contexto de su ambiente.
3. **Given** una sola conexión, **When** abre recursos, **Then** el comportamiento de pestañas sigue siendo usable (sin regresión).

---

### User Story 6 - Máximo dos conexiones simultáneas (Priority: P1)

Solo se permiten **dos** conexiones activas a la vez. Si el operador intenta conectar un tercero, Faro muestra un modal que explica que debe desconectarse de uno para abrir una nueva; no inicia la tercera conexión.

**Why this priority**: Límite de producto explícito para entrega.

**Independent Test**: Conectar A y B; intentar C → modal; tras desconectar uno, C puede conectar.

**Acceptance Scenarios**:

1. **Given** cero o una conexión, **When** conecta otro ambiente permitido, **Then** la conexión se establece.
2. **Given** ya hay dos conexiones activas, **When** intenta conectar un tercero, **Then** aparece un modal informativo y la tercera conexión no se abre.
3. **Given** el modal visible, **When** desconecta una de las dos y reintenta, **Then** puede conectar el nuevo ambiente.

---

### User Story 7 - Máximo 10 configuraciones y 10 colores (Priority: P1)

El sistema permite como máximo **10** configuraciones de conexión guardadas. Hay exactamente **10** colores de ambiente, pensados para verse bien en tema claro y oscuro; cada configuración usa uno (asignación estable y predecible).

**Why this priority**: Acopla capacidad de perfiles a la paleta visual.

**Independent Test**: Crear hasta 10; el 11.º se rechaza con mensaje claro; colores distintos y legibles en ambos temas.

**Acceptance Scenarios**:

1. **Given** menos de 10 configuraciones, **When** crea una nueva, **Then** se guarda con un color de la paleta.
2. **Given** ya hay 10 configuraciones, **When** intenta crear otra, **Then** no se crea y el operador recibe un mensaje claro del límite.
3. **Given** las 10 configuraciones, **When** cambia entre tema claro y oscuro, **Then** las líneas/bordes de color siguen siendo distinguibles.

---

### User Story 8 - Instalador temático Faro (Priority: P2)

El instalador de Faro deja de sentirse genérico: identidad visual y textos alineados con la marca Faro (nombre, iconografía, apariencia del asistente de instalación).

**Why this priority**: Imprescindible para sensación de producto final; detalles de marca/paquete pendientes de confirmación.

**Independent Test**: Generar instalador de la plataforma principal de entrega y revisar que nombre, iconos y aspecto del instalador reflejan Faro (no plantilla vacía genérica).

**Acceptance Scenarios**:

1. **Given** el paquete de instalación generado, **When** el evaluador lo ejecuta/inspecciona, **Then** el producto se identifica como Faro (nombre e iconos de marca).
2. **Given** la configuración de empaquetado acordada, **When** se construye el instalador, **Then** muestra publisher Aníbal Rodríguez, licencia MIT, UI en español, iconos Faro, shortcuts Escritorio+Inicio y ruta Program Files\Faro.

---

### Edge Cases

- Reducir ventana al mínimo con panel al máximo ancho permitido: el contenido central respeta su mínimo; el panel no puede “comerse” el mínimo del contenido.
- Eliminar un ambiente conectado: debe desconectarse/limpiar sesión de forma segura antes o como parte de eliminar.
- Eliminar demo con pestañas abiertas del demo: cerrar o invalidar esas pestañas de forma comprensible.
- Dos conexiones al límite + intento de tercera desde menú contextual o flujo Nuevo: mismo modal.
- Nombres de ambiente muy largos con línea de color: el layout no rompe la línea ni el texto (truncate aceptable).
- Colores: daltonismo parcial — prioridad a contraste light/dark; no se exige paleta certificada WCAG completa en v1 salvo lo razonable.
- Fixture: si falta el archivo de pruebas, mensaje claro (no crash).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel izquierdo MUST ser redimensionable horizontalmente por el usuario.
- **FR-002**: El panel de contenido (workspace) MUST respetar un ancho y alto mínimos iguales a su tamaño usable por defecto actual.
- **FR-003**: La ventana principal de Faro (estado listo) MUST ser redimensionable y MUST NOT reducirse por debajo del tamaño mínimo por defecto actual.
- **FR-004**: MUST existir un fixture/paquete de datos de prueba que cubra el ejercicio de los componentes funcionales actuales relevantes.
- **FR-005**: El menú contextual de ambiente MUST incluir **Eliminar** además de conectar y editar.
- **FR-006**: Eliminar MUST quitar la configuración del sistema tras confirmación; MUST permitir eliminar el demo.
- **FR-007**: Tras eliminar el demo, MUST ser posible restaurarlo creando/cargando desde el fixture de pruebas.
- **FR-008**: Cada ambiente MUST mostrar una línea vertical de color a la izquierda de su nombre en el panel izquierdo.
- **FR-009**: Las pestañas originadas en un ambiente MUST mostrar indicador de borde/color de ese ambiente.
- **FR-010**: MUST ser posible mantener más de una conexión activa (hasta el máximo de FR-012) y abrir pestañas del mismo recurso lógico en ambientes distintos sin colisión.
- **FR-011**: La identidad de pestaña MUST incluir el ambiente de origen (no solo namespace/nombre del recurso).
- **FR-012**: MUST limitarse a **dos** conexiones simultáneas; un intento de tercera MUST mostrar modal y MUST NOT conectar.
- **FR-013**: MUST limitarse a **diez** configuraciones guardadas; el intento de una undécima MUST fallar con mensaje claro.
- **FR-014**: MUST existir una paleta de **diez** colores de ambiente legibles en tema claro y oscuro.
- **FR-015**: El instalador MUST presentarse como producto Faro (no plantilla genérica sin marca), según parámetros acordados.
- **FR-016**: El instalador Windows (NSIS) MUST usar: producto **Faro**; publisher **Aníbal Rodríguez**; año **2026**; licencia **MIT**; iconos Faro existentes del proyecto; textos Faro; personalización de color de marca en el wizard (sin banner nuevo); idioma del asistente **español**; accesos directos en **Escritorio** y **Menú Inicio**; ruta por defecto tipo **Program Files\Faro**; instalación orientada al usuario actual salvo limitación de la herramienta de empaquetado.
- **FR-017**: Al eliminar un ambiente conectado, el sistema MUST liberar esa conexión de forma segura (contar para el límite de dos).

### Key Entities

- **Configuración de conexión**: perfil guardado (máx. 10) con color de ambiente asignado.
- **Color de ambiente**: uno de 10 tokens visuales (light/dark).
- **Conexión activa**: sesión live/demo conectada (máx. 2).
- **Pestaña de workspace**: vista ligada a un ambiente + recurso; identidad única por ambiente.
- **Fixture de pruebas**: paquete de datos para demo/restauración.
- **Modal de límite de conexiones**: aviso al intentar la tercera conexión.
- **Paquete instalador Faro**: artefacto de distribución con marca.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas manuales, el panel y la ventana no bajan del mínimo por defecto en el 100% de intentos de encoger.
- **SC-002**: Un recorrido de prueba con fixture cubre al menos catálogo, apertura de logs/tabs, y menú eliminar/conectar en una sola sesión de validación.
- **SC-003**: Eliminar + restaurar demo vía fixture funciona en el 100% de las pruebas del quickstart.
- **SC-004**: Con dos ambientes conectados y el mismo nombre de recurso, el 100% de los testers identifica qué pestaña es de qué ambiente en ≤ 5 segundos (color + contexto).
- **SC-005**: El 100% de intentos de tercera conexión muestran modal y no abren sesión.
- **SC-006**: El 100% de intentos de crear la 11.ª configuración son rechazados con mensaje.
- **SC-007**: Revisión visual de los 10 colores en claro y oscuro: todos distinguibles para al menos 2 revisores.
- **SC-008**: El instalador generado se reconoce como Faro (nombre + icono de marca) en revisión de entrega.

## Assumptions

- “Tamaño por defecto actual” = el tamaño de ventana y proporciones de panel/contenido del workspace listo (post-splash) vigentes al implementar esta feature; se fijan como mínimos sin rediseñar el layout.
- El límite de 2 conexiones es de producto (recursos/claridad), no una limitación del bastión.
- La asignación de color puede ser por orden de creación o índice estable entre 10 ranuras; no se pide selector manual de color en v1 salvo que el plan lo simplifique.
- Confirmación al eliminar es requerida (evitar borrado accidental).
- Multiplataforma de instalador: la entrega prioritaria sigue siendo Windows; macOS/Linux bundle se alinean en la medida de los targets ya previstos.
- Keep-alive, ACL y Ayuda → Seguridad existentes se conservan; esta feature no los rediseña.
- Instalador (FR-016) cerrado: Aníbal Rodríguez / 2026 / MIT; visual opción A (iconos+textos+color wizard); comportamiento opción A (ES, Desktop+Start, Program Files\Faro).
