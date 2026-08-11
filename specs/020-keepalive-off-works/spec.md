# Feature Specification: Keep-Alive Off Must Work

**Feature Branch**: `020-keepalive-off-works`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "aún no funciona el botón de sacar el keepalive, revísalo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desactivar keep-alive funciona de punta a punta (Priority: P1)

Un operador tiene un ambiente live conectado con keep-alive activo (ve **Keep-alive: ON** y la opción **No mantener conexión viva**). Elige esa opción. Sin pasos extra, keep-alive queda **OFF**: el texto pasa a **Keep-alive: OFF**, el menú pasa a **Mantener conexión viva**, y el estado no vuelve solo a ON. El arreglo anterior (019) no bastó; hay que revisar el flujo completo del clic hasta el estado persistente y corregir la causa real.

**Why this priority**: El control sigue roto en uso real; sin apagar, keep-alive no es opt-in confiable.

**Independent Test**: Conectar live → confirmar ON → clic en **No mantener conexión viva** → ON deja de mostrarse y no reaparece tras reabrir el menú ni tras ~1 minuto; reconectar el mismo ambiente mantiene OFF.

**Acceptance Scenarios**:

1. **Given** keep-alive ON en un ambiente live conectado, **When** el operador elige **No mantener conexión viva**, **Then** en ≤ 1 segundo la UI muestra **Keep-alive: OFF**.
2. **Given** acaba de apagar keep-alive, **When** vuelve a abrir el menú contextual, **Then** ve **Mantener conexión viva** (no sigue ofreciendo solo apagar).
3. **Given** keep-alive OFF tras el clic, **When** espera al menos un ciclo de pulso habitual, **Then** el estado sigue OFF (no regresa a ON solo).
4. **Given** keep-alive OFF, **When** desconecta y reconecta el mismo ambiente, **Then** keep-alive sigue OFF hasta que elija **Mantener conexión viva**.
5. **Given** keep-alive OFF, **When** elige **Mantener conexión viva**, **Then** vuelve a ON de forma estable (regresión: encender sigue funcionando).

---

### User Story 2 - Fallo visible si el apagado no puede aplicarse (Priority: P2)

Si por cualquier razón el apagado no se puede completar, el operador **no** queda con la sensación de “no pasó nada”: recibe un mensaje de error claro, y el indicador de keep-alive coincide con el estado real (no finge OFF si sigue ON).

**Why this priority**: Evita falsos negativos y facilita validar el arreglo.

**Independent Test**: Forzar fallo controlado (si es posible en prueba) o simular error de apagado → mensaje visible y estado coherente.

**Acceptance Scenarios**:

1. **Given** un error al apagar keep-alive, **When** el operador intenta desactivarlo, **Then** ve un aviso de error entendible.
2. **Given** ese error, **When** mira el indicador, **Then** no muestra OFF si keep-alive sigue activo.

---

### Edge Cases

- Ambiente demo: sin opción de keep-alive (sin cambio).
- Varios ambientes: apagar uno no afecta el keep-alive de otro.
- Clic repetido rápido en apagar/encender: el estado final coincide con la última acción exitosa.
- App recién reconstruida tras cambios: el comportamiento se valida en la build actual (no asumir que 019 quedó aplicado en la sesión anterior).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La acción **No mantener conexión viva** MUST desactivar keep-alive de forma efectiva en la sesión actual (no solo cambiar copy temporalmente).
- **FR-002**: Tras un apagado exitoso, la UI MUST mostrar keep-alive OFF y MUST mantenerlo OFF sin reactivación espontánea.
- **FR-003**: La preferencia OFF MUST persistir al reconectar el mismo ambiente.
- **FR-004**: La acción **Mantener conexión viva** MUST seguir activando keep-alive correctamente (sin regresiones).
- **FR-005**: El equipo MUST revisar el camino completo clic → comando → estado → UI (incluyendo menú contextual y sincronización de estado) y corregir la causa que deja keep-alive en ON pese al clic.
- **FR-006**: Si el apagado falla, el usuario MUST recibir feedback de error y el indicador MUST reflejar el estado real.
- **FR-007**: MUST existir evidencia automatizada de que el apagado deja keep-alive OFF en el estado que consume la UI (no solo un test de etiqueta estática).

### Key Entities

- **Acción de menú keep-alive**: apagar / encender según estado.
- **Estado keep-alive visible**: ON | OFF alineado con la sesión y la preferencia guardada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas manuales repetidas (al menos 3 ciclos conectar → apagar), el 100% deja **Keep-alive: OFF** tras el clic de apagado.
- **SC-002**: Tras apagar, en ≥ 60 segundos el indicador no vuelve a ON sin acción del usuario.
- **SC-003**: Tras apagar + reconectar, keep-alive permanece OFF en el 100% de esas pruebas.
- **SC-004**: Encender de nuevo tras apagar funciona en el 100% de esas pruebas.
- **SC-005**: Una prueba automatizada falla si el flujo de apagado no deja el estado keep-alive en false de forma observable para la UI.

## Assumptions

- El problema reportado es sobre el producto en uso real tras 017–019; 019 no resolvió el síntoma del usuario.
- No se pide cambiar el intervalo de pulso ni el umbral de fallos.
- Default ON al conectar sin preferencia OFF (018) se mantiene; este feature se centra en que **apagar sí apague**.
- “Revisarlo” implica diagnóstico de la causa raíz (clic, envío de orden, runtime, o refresco de UI) y corrección verificable, no solo reintentar el mismo parche superficial.
