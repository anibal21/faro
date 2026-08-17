# Feature Specification: About Faro & Stick Checkbox Layout

**Feature Branch**: `028-about-faro-stick-fix`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Arreglar el espacio horrible entre el checkbox y el texto «Pegar al final» (deben quedar juntos, a unos píxeles). Agregar en Ayuda «Acerca de Faro» con licencia MIT, autor Aníbal Rodríguez, correo, GitHub y LinkedIn, agradecimiento formal e inspirativo. Subir versión a 1.1.0 y generar el release."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Checkbox «Pegar al final» legible y compacto (Priority: P1)

Como operador viendo logs, veo la opción **Pegar al final** con el cuadro de selección **junto** a su etiqueta (unos pocos píxeles de separación), sin un hueco vacío grande entre ambos.

**Why this priority**: El layout actual se ve roto y poco profesional en la barra de logs.

**Independent Test**: Abrir una pestaña de logs → inspeccionar visualmente el control «Pegar al final»; checkbox y texto forman una sola unidad compacta a la derecha de la barra.

**Acceptance Scenarios**:

1. **Given** una ventana de logs abierta, **When** miro el control «Pegar al final», **Then** el checkbox y el texto están adyacentes (separación mínima, del orden de unos pocos píxeles), sin un vacío ancho entre ellos.
2. **Given** la barra de herramientas se estrecha o envuelve, **When** el control se reacomoda, **Then** checkbox y etiqueta siguen viajando juntos como un solo grupo (no se separan entre sí).

---

### User Story 2 - Acerca de Faro en Ayuda (Priority: P1)

Como usuario, en el menú **Ayuda** elijo **Acerca de Faro** y leo un mensaje formal e inspirativo sobre el proyecto (licencia MIT, autor, contacto y enlaces profesionales), con un agradecimiento claro por usar el producto.

**Why this priority**: Da identidad profesional al producto 1.x y facilita contactar al autor.

**Independent Test**: Menú Ayuda → Acerca de Faro → diálogo con texto, licencia MIT, autor, correo y enlaces GitHub/LinkedIn accionables.

**Acceptance Scenarios**:

1. **Given** Faro abierto, **When** abro **Ayuda**, **Then** veo la entrada **Acerca de Faro** además de las opciones de ayuda ya existentes.
2. **Given** abro Acerca de Faro, **When** leo el contenido, **Then** veo que el proyecto es de licencia MIT, desarrollado por Aníbal Rodríguez, con correo `anibalrodriguez1990@gmail.com`, enlace a GitHub `https://github.com/anibal21` y LinkedIn `https://www.linkedin.com/in/anibalsci/`.
3. **Given** el diálogo Acerca de Faro, **When** lo leo, **Then** el tono es formal e inspirativo, agradece el uso del producto y expresa el deseo de que sea de gran utilidad, proyectando profesionalismo del autor.
4. **Given** los enlaces del diálogo, **When** los activo, **Then** puedo abrir correo / GitHub / LinkedIn con el destino correcto (sin inventar URLs).

---

### User Story 3 - Producto en versión 1.1.0 publicada (Priority: P2)

Como mantenedor, la versión del producto queda en **1.1.0** en todos los puntos de versión del proyecto y existe un GitHub Release **v1.1.0** con los instaladores multiplataforma del pipeline habitual.

**Why this priority**: Entrega al equipo la corrección de UI y Acerca de Faro de forma instalable.

**Independent Test**: Versiones alineadas a 1.1.0; release `v1.1.0` publicado; workflow de paquetes multiplataforma en curso o verde.

**Acceptance Scenarios**:

1. **Given** el repositorio tras el corte, **When** reviso la versión del producto, **Then** es **1.1.0** de forma consistente.
2. **Given** el release **v1.1.0**, **When** abro la página del release, **Then** el tag y las notas corresponden a esta versión (los assets los aporta el pipeline de release).

---

### Edge Cases

- Ventana de logs muy estrecha: el grupo checkbox+etiqueta no se parte; puede pasar a otra línea completo.
- Diálogo Acerca de Faro cerrado con Escape / botón cerrar: vuelve al workspace sin cambiar estado de logs.
- Enlaces externos: deben abrirse de forma segura según el mecanismo ya usado en la app para URLs externas (si aplica).
- Correo: enlace `mailto:` usable desde el diálogo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El control «Pegar al final» MUST mostrar checkbox y etiqueta como un único grupo visual compacto, con separación de a lo sumo unos pocos píxeles entre ambos.
- **FR-002**: El control de búsqueda u otros campos de la barra de logs MUST NOT estirar el checkbox de «Pegar al final» ni crear un hueco artificial entre checkbox y texto.
- **FR-003**: El menú **Ayuda** MUST incluir la entrada **Acerca de Faro**.
- **FR-004**: Acerca de Faro MUST presentar: nombre del proyecto Faro, licencia **MIT**, desarrollador **Aníbal Rodríguez**, correo **anibalrodriguez1990@gmail.com**, URL GitHub **https://github.com/anibal21**, URL LinkedIn **https://www.linkedin.com/in/anibalsci/**.
- **FR-005**: El texto de Acerca de Faro MUST ser formal e inspirativo, agradecer el uso del producto, desear que sea de gran utilidad, y transmitir una imagen profesional del autor.
- **FR-006**: Correo, GitHub y LinkedIn MUST ser accionables (enlace o acción equivalente) hacia esos destinos exactos.
- **FR-007**: La versión de producto MUST quedar en **1.1.0** en todos los archivos de versión del proyecto y MUST publicarse el release **v1.1.0**.

### Key Entities

- **Stick-to-bottom control**: Checkbox + etiqueta «Pegar al final» en la barra de logs.
- **About Faro dialog**: Contenido de identidad del producto (licencia, autor, contacto, enlaces, mensaje).
- **Product version 1.1.0**: Identificador SemVer del corte de entrega.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En revisión visual, 100% de los revisores confirman que checkbox y «Pegar al final» están juntos (sin hueco ancho comparable al de la captura reportada).
- **SC-002**: Un usuario encuentra y abre Acerca de Faro desde Ayuda en ≤ 10 segundos en el primer intento.
- **SC-003**: El diálogo muestra licencia MIT, autor, correo y ambos enlaces profesionales sin omisiones.
- **SC-004**: Tras el corte, la versión publicada al equipo es 1.1.0 (tag/release visibles en el repositorio de producto).

## Assumptions

- El menú Ayuda ya existe (Seguridad, Buscar actualizaciones…); Acerca de Faro se añade sin quitar esas entradas.
- El tono del mensaje es español, formal, profesional e inspirativo (adecuado a un producto de monitoreo interno).
- El pipeline multiplataforma de release existente (026/027) se reutiliza para generar instaladores de 1.1.0.
- No se requiere notarización Apple ni Authenticode Windows en este corte.
