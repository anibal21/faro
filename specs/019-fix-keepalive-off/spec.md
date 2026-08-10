# Feature Specification: Fix Keep-Alive Off & Drop Pulse Line

**Feature Branch**: `019-fix-keepalive-off`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "el botón de desactivar el keep-alive no funciona, se queda siempre en keepalive: true, detecta el error y corrígelo. Por otro lado, tiene un comentario del último pulso, sácalo no es necesario, con el keepAlive: <estado> es suficiente."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apagar keep-alive de verdad (Priority: P1)

Un operador tiene un ambiente live conectado con keep-alive activo. Elige **No mantener conexión viva**. Faro deja keep-alive en **OFF** de forma estable: la UI muestra el estado apagado, la opción del menú pasa a **Mantener conexión viva**, y no vuelve sola a ON mientras el operador no la reactive. Si vuelve a activarla, sí pasa a ON.

**Why this priority**: El control es inútil si solo enciende y no puede apagarse; es un defecto bloqueante sobre 018.

**Independent Test**: Con keep-alive ON → menú “No mantener conexión viva” → clic → estado keep-alive OFF y menú “Mantener conexión viva”; esperar al menos un intervalo de pulso → sigue OFF.

**Acceptance Scenarios**:

1. **Given** ambiente live conectado con keep-alive ON, **When** el operador elige **No mantener conexión viva**, **Then** el estado keep-alive queda OFF y la UI lo refleja de inmediato.
2. **Given** keep-alive acaba de apagarse, **When** pasa el tiempo de un ciclo de pulso (o más), **Then** keep-alive permanece OFF (no “salta” otra vez a ON).
3. **Given** keep-alive OFF, **When** el operador elige **Mantener conexión viva**, **Then** keep-alive queda ON y la etiqueta vuelve a **No mantener conexión viva**.
4. **Given** el operador apaga keep-alive, **When** desconecta y vuelve a conectar el mismo ambiente, **Then** keep-alive sigue OFF (preferencia persistida), hasta que el operador lo encienda de nuevo.

---

### User Story 2 - Quitar “Último pulso” de la UI (Priority: P1)

El operador ve junto al ambiente el estado de keep-alive (p. ej. keep-alive ON/OFF o equivalente claro), **sin** la línea o comentario de “Último pulso…”. Menos ruido; el estado ON/OFF basta.

**Why this priority**: Pedido explícito de simplificación; el texto de pulso añade ruido sin valor para el operador.

**Independent Test**: Ambiente conectado con keep-alive ON u OFF → no aparece “Último pulso” (ni variantes “hace Xs/Xm”) en el árbol/chrome del ambiente.

**Acceptance Scenarios**:

1. **Given** un ambiente conectado con keep-alive ON, **When** el operador mira la fila/detalle del ambiente, **Then** no ve texto de último pulso.
2. **Given** keep-alive OFF o degradado/desconectado, **When** mira la misma zona, **Then** tampoco ve último pulso; sí puede ver estado de sesión / keep-alive según lo ya definido.

---

### Edge Cases

- Demo: sigue sin opción de keep-alive.
- Fallo al apagar: si el apagado no puede aplicarse, el operador ve un error claro y el estado no finge OFF si sigue ON (o viceversa: no finge ON si quedó OFF).
- Varios ambientes: apagar uno no enciende ni apaga los demás.
- Reconectar tras desconexión por fallos: la preferencia OFF/ON guardada se respeta al reconectar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Elegir **No mantener conexión viva** MUST dejar keep-alive en OFF de forma efectiva (runtime + preferencia) para ese ambiente.
- **FR-002**: Tras apagar, keep-alive MUST NOT reactivarse solo (sin acción explícita del operador ni nueva conexión con preferencia ON).
- **FR-003**: La UI MUST reflejar el estado keep-alive real tras encender o apagar (etiqueta de menú y indicador de estado alineados).
- **FR-004**: La preferencia OFF MUST persistir entre desconexión y reconexión del mismo ambiente.
- **FR-005**: La UI MUST NOT mostrar “Último pulso” ni texto relativo de último pulso exitoso en el chrome del ambiente (árbol / línea de estado asociada).
- **FR-006**: La UI MUST seguir mostrando de forma clara si keep-alive está activo o no (p. ej. keepAlive / Keep-alive ON|OFF o la etiqueta de acción del menú).
- **FR-007**: El defecto actual (apagado que deja keep-alive en true) MUST corregirse; la causa MUST verificarse con pruebas que fallen antes del arreglo y pasen después.

### Key Entities

- **Preferencia keep-alive**: ON/OFF por ambiente; OFF explícito no puede sobrescribirse a ON sin acción del usuario o connect con default ON solo cuando no hay OFF guardado (comportamiento 018).
- **Indicador de estado keep-alive**: proyección UI sin línea de último pulso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En 100% de las pruebas de “apagar keep-alive”, el estado queda OFF tras el clic y sigue OFF tras ≥1 ciclo de pulso.
- **SC-002**: Tras apagar y reconectar el mismo ambiente, keep-alive permanece OFF sin intervención.
- **SC-003**: En una revisión visual del árbol con keep-alive ON y OFF, cero apariciones de “Último pulso” / “hace Ns”.
- **SC-004**: Activar de nuevo keep-alive tras apagarlo sigue funcionando (ON estable) en las mismas pruebas.

## Assumptions

- El intervalo y umbral de fallos de keep-alive (017) no cambian; solo se corrige el apagado y se simplifica la UI.
- “keepAlive: &lt;estado&gt;” significa indicador ON/OFF suficiente; no se pide un panel de depuración nuevo.
- El default ON al conectar sin preferencia OFF (018) se mantiene; este feature no vuelve el default a OFF.
- La causa del bug puede estar en persistencia, runtime del loop, o sincronización UI↔estado; la implementación debe localizarla y cubrirla con test.
