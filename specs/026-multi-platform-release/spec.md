# Feature Specification: Multi-Platform Release Artifacts

**Feature Branch**: `026-multi-platform-release`

**Created**: 2026-08-11

**Status**: Delivered (MVP + gate; post-delivery harden/splash/1.0.0 → [027-release-harden-splash](../027-release-harden-splash/spec.md))

**Input**: User description: "Estaba viendo que el release me generó el código total del proyecto, la idea es que pueda generar el build, me refiero que el release debería tener todos los exportables, windows, macos y linux."

## Clarifications

### Session 2026-08-11

- Q: Si falla el build de una plataforma, ¿política del release? → A: Fallo estricto — si falta cualquier SO (Windows, macOS o Linux), el release falla / no se marca listo para el equipo. (Refinado en Q5: también aplica a cada formato Linux obligatorio.)
- Q: ¿Arquitecturas CPU por plataforma en el MVP? → A: Solo **x64** en Windows, macOS y Linux.
- Q: ¿Firma / Gatekeeper en macOS para el equipo interno? → A: Sin notarizar; documentar bypass de Gatekeeper.
- Q: ¿Formato del paquete Linux? → A: **AppImage y .deb** (x64) en cada release.
- Q: ¿Fallo estricto incluye ambos formatos Linux? → A: Ambos obligatorios — falta AppImage o .deb → el release falla.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descargar instalable de mi plataforma (Priority: P1)

Como miembro del equipo (u operador), abro la página del release de Faro y veo **instaladores/paquetes listos para usar** para Windows, macOS y Linux. Elijo el de mi sistema, lo descargo e instalо/ejecuto sin necesitar el código fuente del repositorio.

**Why this priority**: Hoy el release parece centrado en el código fuente (o solo en un artefacto incompleto); el valor del producto para el equipo es poder **instalar y usar** Faro en cada SO.

**Independent Test**: Publicar (o simular) un release y comprobar que aparecen assets descargables por plataforma y que el de Windows se puede instalar sin clonar el repo.

**Acceptance Scenarios**:

1. **Given** un release publicado de una versión nueva, **When** abro la página del release, **Then** veo al menos un paquete instalable/ejecutable etiquetado para Windows, uno para macOS, y en Linux tanto **AppImage** como **.deb** (además de cualquier archivo de soporte necesario para actualizaciones).
2. **Given** tengo Windows sin permisos de administrador, **When** descargo e ejecuto el instalador Windows del release, **Then** puedo instalar Faro para mi usuario sin UAC de administrador.
3. **Given** solo quiero usar la app, **When** reviso los assets del release, **Then** el entregable principal son los binarios/instaladores — no dependo de “Source code (zip)” para operar Faro.

---

### User Story 2 - Actualización automática alineada al feed multiplataforma (Priority: P2)

Como usuario con Faro ya instalado, la comprobación de actualización sigue apuntando al feed del latest release y puede ofrecer la versión nueva cuando exista artefacto para mi plataforma (Windows con instalación automática según el producto actual; otras plataformas al menos informadas cuando haya paquete).

**Why this priority**: Evita que el flujo de updates (feature 025) quede solo con Windows mientras el release ya publica los tres SO.

**Independent Test**: Con un `latest` que declare las tres plataformas, una instalación Windows antigua detecta oferta; en macOS/Linux se informa de versión nueva si el feed la incluye.

**Acceptance Scenarios**:

1. **Given** un latest feed publicado junto al release, **When** Faro consulta actualizaciones, **Then** la versión remota coincide con la del release y el feed referencia los artefactos publicados (no el zip de código fuente).
2. **Given** mi plataforma no tiene instalación automática en el producto, **When** hay versión nueva con paquete en el release, **Then** al menos puedo enterarme de la versión y descargar el paquete desde el release si aplica la política vigente de la app.

---

### User Story 3 - Publicar un release sin subir el repo como producto (Priority: P2)

Como mantenedor, al cortar un release el pipeline **construye** Faro en cada SO objetivo y **adjunta los exportables** al GitHub Release. No trato el archivo automático “Source code” de GitHub como el entregable del producto.

**Why this priority**: Corrige la expectativa de que “hacer un release” = entregar código; el proceso debe producir builds.

**Independent Test**: Tras publicar un tag/release, la lista de assets incluye los tres paquetes (o falla el job de forma visible si un SO no construyó).

**Acceptance Scenarios**:

1. **Given** un tag de versión publicado como release, **When** termina el pipeline de release, **Then** los assets incluyen instalador Windows, paquete macOS, AppImage Linux y .deb Linux (x64), con nombres claros.
2. **Given** falla el build de un exportable obligatorio (incluido AppImage o .deb), **When** reviso el resultado del release, **Then** el pipeline falla de forma visible y el release **no** se considera listo para el equipo.

---

### Edge Cases

- Release publicado solo con Source code (zip/tar) de GitHub y sin builds → se considera **fallido / no listo** (misma regla estricta de los tres SO).
- Fallo parcial (p. ej. Linux AppImage OK pero .deb falla, o macOS falla) → el conjunto del release falla; no se acepta “publicar solo lo que salió”.
- Usuario macOS con Gatekeeper y paquete no notarizado → MUST poder seguir las instrucciones documentadas (“Abrir de todas formas” / equivalente); no se exige notarización en este corte.
- Usuario en CPU **arm64** (p. ej. Mac Apple Silicon) → el paquete x64 del MVP puede no ser adecuado; arm64 queda fuera de alcance hasta un corte posterior.
- Usuario Linux sin AppImage ejecutable (permisos) → instrucciones mínimas de ejecución; alternativa documentada: instalar el **.deb** si aplica.
- Actualización automática en Windows debe seguir usando el instalador firmado del release, no un zip de fuentes.
- Versión del release (tag) y versión mostrada en la app deben coincidir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada release de producto MUST adjuntar paquetes instalables o ejecutables para **Windows**, **macOS** y **Linux** como assets del release (no solo código fuente). En Linux MUST incluir **AppImage y .deb** (x64).
- **FR-001a**: El conjunto mínimo de exportables de un release listo es: instalador Windows (x64), paquete macOS (x64), AppImage Linux (x64) y paquete .deb Linux (x64).
- **FR-002**: El instalador Windows MUST permitir instalación **por usuario actual** sin requerir privilegios de administrador (adecuado para equipos sin admin).
- **FR-003**: Los nombres o etiquetas de los assets MUST permitir identificar la plataforma, el formato (p. ej. AppImage vs .deb) y la arquitectura (**x64**) sin abrir el archivo.
- **FR-003a**: El MVP MUST publicar exactamente una arquitectura por SO: **x64** (amd64) para Windows, macOS y Linux; otras arquitecturas (p. ej. arm64) quedan fuera de este corte.
- **FR-004**: El proceso de publicación MUST construir estos paquetes de forma automatizada al publicar un release (o equivalente explícito de “cut release”), no depender de subir a mano el árbol del repositorio.
- **FR-005**: El feed de actualización del producto (`latest` / equivalente) MUST apuntar a los artefactos de build del release, no al zip/tarball de código fuente.
- **FR-006**: Si el build o la publicación de **cualquier** exportable obligatorio falla (Windows, macOS, Linux AppImage o Linux .deb), el proceso MUST fallar de forma visible y el release MUST NOT considerarse listo para el equipo; MUST NOT publicarse como completo con algún exportable faltante.
- **FR-007**: La documentación de entrega al equipo MUST indicar qué archivo bajar por SO y cualquier paso extra (Gatekeeper, permiso de ejecución en Linux).
- **FR-009**: El paquete macOS del MVP MUST publicarse **sin** notarización Apple; la documentación de entrega MUST indicar cómo abrir la app si Gatekeeper la bloquea (distribución interna).

### Key Entities

- **Product Release**: Versión etiquetada con notas y lista de assets descargables.
- **Platform Package**: Artefacto instalable/ejecutable para un SO (Windows / macOS / Linux) y arquitectura.
- **Update Feed Entry**: Metadatos de versión + URLs/firmas de paquetes por plataforma para la app instalada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En un release “completo”, un revisor encuentra en ≤ 1 minuto los paquetes Windows, macOS, Linux AppImage y Linux .deb en la página del release.
- **SC-002**: Un desarrollador Windows sin admin instala Faro desde el asset del release en ≤ 5 minutos sin clonar el repositorio.
- **SC-003**: 100% de los releases marcados como listos para el equipo incluyen Windows, macOS, Linux AppImage y Linux .deb (x64); si falta cualquiera, el pipeline falla y el release no se marca listo.
- **SC-004**: Ningún miembro del equipo necesita el zip “Source code” para instalar o actualizar Faro en su SO.
- **SC-006**: Un usuario macOS del equipo puede instalar/abrir Faro desde el asset del release siguiendo la guía documentada de Gatekeeper en ≤ 10 minutos en el primer intento (sin notarización).

## Assumptions

- El repositorio de producto sigue siendo `anibal21/faro`; los releases se publican ahí.
- Formatos por defecto: **Windows** instalador NSIS (usuario actual), **macOS** DMG (o app empaquetada equivalente), **Linux** **AppImage y .deb** (ambos x64) — coherentes con el empaquetado desktop ya previsto en el producto.
- Distribución inicial es **interna al equipo de desarrollo**; el MVP macOS **no** incluye notarización Apple — solo documentación del bypass de Gatekeeper. Firmas de tienda / Developer ID quedan fuera de este corte.
- Los archivos “Source code (zip/tar.gz)” que GitHub genera solos en todo Release **no se pueden eliminar** fácilmente; el éxito se mide por la presencia y prominencia de los **builds**.
- La feature 025 (chequeo de updates) permanece; esta feature amplía **qué se publica** y el modo de instalación Windows sin admin.
- Arquitectura del MVP: **solo x64** en Windows, macOS y Linux (un paquete por SO). arm64 / Apple Silicon fuera de este corte.
