# Feature Specification: Keep-Alive Toggle ACL

**Feature Branch**: `021-keepalive-acl`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Keep-alive OFF requires Tauri ACL: allow-env-set-keep-alive in faro.toml and default capability"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apagar keep-alive está autorizado en la app (Priority: P1)

Un operador con un ambiente live conectado y keep-alive **ON** elige **No mantener conexión viva**. La aplicación **permite** esa acción (no la bloquea en silencio). Keep-alive pasa a **OFF**, el indicador muestra **Keep-alive: OFF**, y el menú ofrece **Mantener conexión viva**.

**Why this priority**: Sin autorización de la acción de apagado, el control parece roto aunque la lógica de keep-alive exista; es la causa raíz que dejó OFF inoperante tras 017–020.

**Independent Test**: En build actual, conectar live → **No mantener conexión viva** → UI queda en OFF sin mensaje de permiso denegado y sin volver sola a ON.

**Acceptance Scenarios**:

1. **Given** keep-alive ON en un ambiente live conectado, **When** el operador elige **No mantener conexión viva**, **Then** la acción se completa con éxito (no falla por falta de permiso de la app).
2. **Given** ese apagado exitoso, **When** mira el menú/indicador, **Then** ve **Keep-alive: OFF** y la acción para volver a encender.
3. **Given** keep-alive OFF, **When** elige **Mantener conexión viva**, **Then** vuelve a ON (la misma autorización sirve para encender y apagar).

---

### User Story 2 - Fallo de autorización no finge OFF (Priority: P2)

Si la acción de cambiar keep-alive no está permitida o falla por política de la app, el operador ve un error claro y el indicador **no** muestra OFF mientras keep-alive sigue activo.

**Why this priority**: Evita el falso “ya lo apagué” cuando la app rechazó la orden.

**Independent Test**: Sin el permiso de toggle (o simulando denegación), intentar apagar → error visible + indicador sigue ON.

**Acceptance Scenarios**:

1. **Given** la acción de toggle no está autorizada, **When** el operador intenta apagar keep-alive, **Then** recibe un aviso de error entendible.
2. **Given** esa denegación, **When** mira el indicador, **Then** no muestra OFF si keep-alive sigue activo.

---

### Edge Cases

- Ambiente demo: sin control de keep-alive (sin cambio).
- Otros comandos de sesión (conectar, desconectar, consultar estado) siguen autorizados como hoy.
- Tras agregar o corregir la autorización, hace falta reiniciar/reconstruir la app para que la política nueva aplique.
- Varios ambientes: autorizar el toggle no cambia el alcance por ambiente; solo habilita la acción.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La aplicación de escritorio MUST autorizar explícitamente la acción de activar/desactivar keep-alive de sesión para la ventana principal.
- **FR-002**: Con esa autorización presente, **No mantener conexión viva** MUST poder completar el apagado (no fallar solo por política de la app).
- **FR-003**: La misma autorización MUST cubrir tanto apagar como encender keep-alive.
- **FR-004**: Si el toggle se rechaza por falta de autorización, el usuario MUST ver error y el indicador MUST reflejar el estado real (no OFF falso).
- **FR-005**: MUST existir evidencia verificable (automatizada o checklist de release) de que la autorización del toggle está declarada junto al resto de acciones de entorno/sesión.
- **FR-006**: Documentación de feature MUST dejar constancia de que todo comando nuevo de sesión keep-alive requiere entrada en la política de permisos de la app, no solo registro del comando.

### Key Entities

- **Acción keep-alive toggle**: orden de la UI para poner keep-alive ON u OFF en un ambiente.
- **Política de autorización de la app**: conjunto de acciones que la ventana principal puede invocar; el toggle debe figurar ahí.
- **Estado keep-alive visible**: ON | OFF alineado con el resultado real del toggle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En ≥ 3 pruebas manuales conectar → apagar, el 100% completa el apagado sin error de “acción no permitida” / permiso denegado.
- **SC-002**: Tras apagar con autorización correcta, el indicador muestra OFF en ≤ 1 segundo y no vuelve a ON solo en ≥ 60 segundos.
- **SC-003**: Una verificación automatizada o de checklist falla si falta la autorización del toggle en la política de la app.
- **SC-004**: Encender tras apagar funciona en el 100% de esas pruebas (sin regresión de ON).

## Assumptions

- El síntoma “no se desactiva keep-alive” con lógica ya implementada se explica porque la orden de toggle no estaba en la política de permisos de la app (ACL), no porque el menú no enviara la intención.
- El mecanismo concreto en Faro es el mismo patrón que otros comandos: permiso dedicado + grant en la capability por defecto de la ventana principal (`allow-env-set-keep-alive` / equivalente documentado en plan).
- Features 017–020 cubren UX, IPC y runtime; este feature acota **autorizar** el comando de toggle.
- Reinicio de la app de desarrollo es necesario tras cambiar la política de permisos.
- No se cambia intervalo de pulso, umbral de degradación, ni el default ON al conectar sin preferencia OFF.
