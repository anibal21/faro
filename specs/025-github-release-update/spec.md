# Feature Specification: GitHub Release Update Check

**Feature Branch**: `025-github-release-update`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "Me gustaría que cada vez que se abra Faro, y cargue la pantalla principal, consulte por si es el último release, y no encuentra uno más nuevo se actualice apuntando al release de github. Si acepta, se actualice sólo a la nueva versión"

## Clarifications

### Session 2026-08-11

- Q: Cómo se aplica la actualización al aceptar → A: Descarga + inicia el instalador del release (in-app / sistema)
- Q: Si el usuario rechaza el aviso → A: Preguntar otra vez en cada arranque mientras siga habiendo versión más nueva (incluida la misma W rechazada)
- Q: Alcance de plataformas en v1 → A: Instalación automática solo Windows; otras OS: aviso informativo sin instalar (o sin oferta de install)
- Q: Repositorio GitHub oficial de releases → A: anibal21/faro
- Q: Comprobación manual además del check al arrancar → A: Sí: menú con “Buscar actualizaciones…” (mismo flujo que al arrancar)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detectar versión nueva al abrir el workspace (Priority: P1)

Cuando el usuario abre Faro y llega a la pantalla principal (workspace, tras el splash), Faro consulta en segundo plano si existe un release más reciente en GitHub que la versión instalada. Si hay una versión nueva, muestra una invitación clara a actualizar; si no hay (o no puede comprobarlo), el usuario continúa trabajando sin interrupción.

**Why this priority**: Es el valor central del pedido: enterarse a tiempo de releases sin salir de la app, sin bloquear el arranque.

**Independent Test**: Abrir Faro con una versión instalada menor a un release publicado de prueba; tras la pantalla principal debe aparecer el aviso de actualización. Abrir con la misma versión que el último release; no debe aparecer aviso de actualización.

**Acceptance Scenarios**:

1. **Given** Faro instalado en versión V y existe un release publicado más nuevo que V en GitHub, **When** el usuario completa el splash y ve la pantalla principal, **Then** se muestra un aviso de actualización con la versión disponible y la opción de aceptar o rechazar.
2. **Given** Faro instalado en la misma versión (o mayor) que el último release estable, **When** llega a la pantalla principal, **Then** no se muestra aviso de actualización y el workspace es usable de inmediato.
3. **Given** no hay red o el servicio de releases no responde, **When** Faro intenta comprobar, **Then** el fallo no bloquea ni degrada la pantalla principal (sin error modal agresivo; a lo sumo un estado silencioso o descartable).

---

### User Story 2 - Aceptar e instalar solo esa versión nueva (Priority: P1)

Si el usuario acepta actualizar, Faro **descarga el instalador** del release detectado desde GitHub e **inicia esa instalación** (el instalador del sistema puede pedir reinicio o elevación). La actualización es **únicamente** hacia la versión del release ofrecido, no hacia otro build arbitrario. Tras completar el proceso, el usuario termina en la versión aceptada.

**Why this priority**: Sin la instalación consentida, el check solo informa; el usuario pidió actualización real al aceptar.

**Independent Test**: Desde el aviso, aceptar; verificar que se descarga el artefacto del release anunciado y que, al finalizar, la versión reportada por Faro coincide con esa versión (no otra).

**Acceptance Scenarios**:

1. **Given** un aviso de actualización a la versión W, **When** el usuario acepta, **Then** Faro descarga el instalador del release W, inicia ese instalador y no instala otra versión distinta de W.
2. **Given** el usuario aceptó la actualización, **When** el proceso termina con éxito, **Then** al reabrir Faro la versión mostrada/reportada es W.
3. **Given** la descarga o instalación falla a mitad de camino, **When** el error ocurre, **Then** Faro informa el fallo de forma comprensible, deja la instalación anterior usable y no deja la app en un estado a medias sin explicación.

---

### User Story 3 - Rechazar o posponer (Priority: P2)

Si el usuario no quiere actualizar ahora, puede rechazar o cerrar el aviso y seguir usando Faro. En **ese mismo arranque** no se vuelve a insistir. En **cada nuevo arranque** de Faro, si sigue existiendo un release más nuevo que la versión instalada (incluida la misma versión W ya rechazada antes), Faro MUST volver a ofrecer la actualización.

**Why this priority**: El consentimiento es parte del pedido; la actualización no debe ser forzada.

**Independent Test**: Rechazar el aviso y confirmar que el workspace sigue operativo; volver a abrir Faro más tarde y ver que el check puede ofrecer de nuevo si aún hay release nuevo.

**Acceptance Scenarios**:

1. **Given** un aviso de actualización visible, **When** el usuario rechaza o cierra, **Then** el aviso desaparece y la sesión actual continúa en la versión instalada.
2. **Given** el usuario rechazó la oferta de la versión W en un arranque anterior y W sigue siendo más nueva que la instalada, **When** abre Faro de nuevo y llega a la pantalla principal, **Then** vuelve a recibir la oferta de actualización a W (u otra más nueva si ya existe).

---

### User Story 4 - Buscar actualizaciones desde el menú (Priority: P2)

El usuario puede disparar la misma comprobación de releases desde un ítem de menú (p. ej. Ayuda → “Buscar actualizaciones…”), sin reiniciar Faro. El flujo de aviso / aceptar / rechazar es el mismo que tras la pantalla principal.

**Why this priority**: Complementa el check al arranque; útil si se rechazó antes o se quiere verificar a demanda.

**Independent Test**: Con versión desactualizada, invocar el menú y obtener el mismo aviso de actualización que en el arranque.

**Acceptance Scenarios**:

1. **Given** Faro en la pantalla principal y existe release más nuevo, **When** el usuario elige “Buscar actualizaciones…”, **Then** se muestra el aviso de actualización (o el resultado “ya estás al día” si no hay novedad).
2. **Given** no hay red, **When** el usuario elige “Buscar actualizaciones…”, **Then** recibe un mensaje comprensible de fallo y el workspace sigue usable.

---

### Edge Cases

- Release en GitHub sin artefacto instalable para la plataforma del usuario (p. ej. solo assets de otra OS): no ofrecer “actualizar” como éxito; informar que no hay instalador aplicable o omitir la oferta de instalación.
- Versión instalada no parseable o “dev”/local: no romper el arranque; omitir o tratar como “sin actualización automática”.
- El usuario acepta pero cancela el instalador del sistema a mitad: Faro permanece en la versión anterior.
- Varios releases entre la versión instalada y el último: se ofrece **solo el último release estable** (o el marcado como latest), no un asistente multi-paso de versiones intermedias.
- Pre-releases / drafts en GitHub: no se ofrecen como actualización automática salvo que sean el “latest” estable publicado según la política de releases del repo.
- En **Windows**, aceptar implica descarga + lanzamiento del instalador. En **macOS/Linux** (v1), si se detecta versión nueva, el aviso puede ser solo informativo (sin instalación automática) o no ofrecer la acción de instalar hasta que exista flujo/artefacto aplicable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tras cargar la pantalla principal (workspace), Faro MUST comprobar si existe un release más reciente que la versión en ejecución publicado en el repositorio GitHub oficial del producto.
- **FR-002**: La comprobación MUST ejecutarse de forma que no bloquee el uso del workspace si tarda o falla.
- **FR-003**: Si hay versión más nueva, Faro MUST mostrar un aviso comprensible con al menos: versión actual, versión disponible y acciones Aceptar / Rechazar (o equivalente claro).
- **FR-004**: Si el usuario acepta en **Windows**, Faro MUST **descargar el instalador** del release ofrecido desde GitHub e **iniciar esa instalación**, actualizando **solo** a esa versión (W), no a otra distinta.
- **FR-004a**: En macOS/Linux en v1, Faro MUST NOT ejecutar instalación automática; MAY mostrar aviso informativo de versión nueva sin acción de instalar, o omitir la oferta de install si no hay artefacto/flujo aplicable.
- **FR-005**: Si el usuario rechaza, Faro MUST permanecer en la versión instalada, MUST permitir seguir trabajando en esa sesión sin re-mostrar el aviso, y MUST volver a ofrecer la actualización en el **próximo arranque** mientras la versión remota siga siendo más nueva (sin “olvidar” una versión solo porque fue rechazada).
- **FR-006**: La comprobación de actualización MUST enviar hacia fuera de la máquina del usuario únicamente información del producto necesaria para el check (p. ej. consulta al feed de releases / metadatos de versión), y MUST NOT incluir credenciales, perfiles de ambiente, hosts de bastión/cluster, logs ni datos de usuario (alineado con la constitución: check de versión permitido).
- **FR-007**: Si no hay red, el endpoint no responde, o no hay artefacto aplicable a la plataforma, Faro MUST fallar de forma segura sin impedir el uso principal.
- **FR-008**: Faro MUST usar como fuente de verdad de “última versión” los releases publicados del repositorio GitHub **`anibal21/faro`** (latest estable), no un canal de terceros no oficial.
- **FR-009**: Durante/tras la actualización consentida, Faro MUST dejar claro al usuario si se requiere reinicio o intervención del instalador del sistema.
- **FR-010**: Faro MUST exponer una acción de menú “Buscar actualizaciones…” (o etiqueta equivalente clara) que ejecute el mismo flujo de comprobación/oferta que el check al llegar a la pantalla principal.

### Key Entities

- **Installed Version**: Versión del producto en ejecución en la máquina del usuario.
- **Remote Release**: Metadatos del release en GitHub (identificador de versión, notas opcionales, artefactos por plataforma).
- **Update Offer**: Propuesta puntual (versión remota vs instalada) mostrada al usuario tras el check.
- **Update Decision**: Aceptar o rechazar; si acepta, vínculo a la instalación de esa versión concreta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En al menos el 95% de los arranques con red disponible y releases alcanzables, la comprobación termina (éxito o “sin novedad”) en menos de 10 segundos sin bloquear la UI principal.
- **SC-002**: Cuando existe un release más nuevo, el 100% de las sesiones de prueba que llegan a la pantalla principal muestran el aviso de actualización en esa misma sesión de arranque.
- **SC-003**: Tras aceptar una actualización de prueba a la versión W, el 100% de las instalaciones exitosas reportan versión W al reabrir Faro.
- **SC-004**: Si el usuario rechaza, puede completar una tarea típica del workspace en esa sesión sin que el aviso reaparezca; en un nuevo arranque de prueba con la misma versión remota más nueva, el aviso vuelve a mostrarse.
- **SC-006**: En pruebas con versión desactualizada, invocar “Buscar actualizaciones…” desde el menú produce el aviso de actualización (o “al día”) en menos de 10 segundos con red disponible en al menos el 95% de los intentos.

## Assumptions

- El repositorio GitHub oficial del producto es **`anibal21/faro`** y publica releases con artefacto instalable **Windows (NSIS)** como prioridad de empaquetado actual; macOS/Linux pueden tener o no assets en v1.
- En v1, **instalación automática solo en Windows**; otras plataformas: como máximo aviso informativo.
- “Último release” significa el latest **estable** publicado en GitHub (no drafts; pre-releases solo si el equipo los marca como latest, lo cual se asume no habitual).
- La comprobación ocurre **después** de la pantalla principal (post-splash), no durante el splash, para no alargar la percepción de arranque.
- La actualización es **opcional** (consentimiento explícito); no hay force-update en v1 de esta feature.
- Rechazar no suprime futuras ofertas de la misma versión: se reofrece en **cada arranque** mientras el latest remoto siga siendo más nuevo que el instalado.
- Un solo check automático por arranque de aplicación es suficiente; además existe comprobación **manual** vía menú.
- “Sólo a la nueva versión” significa instalar exactamente el release ofrecido al usuario, no un canal distinto ni un build interno no publicado.
- Al aceptar, el flujo es **descarga del instalador del release + lanzamiento del instalador** (no basta con abrir el navegador ni dejar el archivo sin ejecutar).
- El check de versión es el único egress no configurado por el usuario permitido aquí, y se limita a metadatos/artefactos de release del producto (constitución VI).
