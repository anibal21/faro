# Feature Specification: Env Test Polish

**Feature Branch**: `024-env-test-polish`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "Colores de ambiente fijos (10 brillantes/metálicos, mismos en claro/oscuro); cargar fixtures de prueba hidrata datos test en ese ambiente (multiambiente test); arreglar layout checkbox Pegar al final (derecha, junto al label); ocultar RAM/CPU/Uptime de pods si no hay datos y mostrarlos solo cuando existan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Colores de ambiente estables y metálicos (Priority: P1)

El operador ve los mismos 10 colores de ambiente en tema claro y en tema oscuro (no cambian al alternar el tema). Los colores son brillantes, con aspecto medio metálico, combinan con ambos fondos sin “perderse”, y se distinguen entre sí en el árbol y en el borde de las pestañas.

**Why this priority**: La diferenciación multi-ambiente falla si los colores se apagan o mutan con el tema.

**Independent Test**: Asignar varios ambientes; alternar claro/oscuro; verificar mismos hex/apariencia y contraste usable en ambos.

**Acceptance Scenarios**:

1. **Given** ambientes con colores 0–9, **When** el operador cambia de tema claro a oscuro (o viceversa), **Then** el color de cada ambiente (línea y borde de pestaña) es el mismo que antes del cambio.
2. **Given** los 10 colores en ambos temas, **When** un revisor los compara, **Then** todos se distinguen entre sí y no se confunden con el fondo.
3. **Given** el panel y las pestañas, **When** mira la UI, **Then** los colores se perciben brillantes / medio metálicos (no apagados ni pastel extremos).

---

### User Story 2 - Fixtures de prueba hidratan el ambiente cargado (Priority: P1)

Cuando el operador carga o asocia un ambiente con los fixtures de prueba, ese ambiente concreto recibe los datos de catálogo/logs de prueba, de modo que se pueden conectar varios ambientes en modo test y ejercitar multiambiente sin depender de clusters live distintos.

**Why this priority**: Permite validar multi-conexión y pestañas por ambiente con datos de prueba.

**Independent Test**: Crear/cargar dos ambientes vía fixtures; conectar ambos; ver datos de prueba en cada uno y abrir recursos en paralelo.

**Acceptance Scenarios**:

1. **Given** un ambiente vinculado a fixtures de prueba, **When** se conecta/carga, **Then** ese ambiente muestra datos de prueba (catálogo/recursos de test) asociados a él.
2. **Given** dos ambientes cargados con fixtures, **When** ambos están conectados, **Then** cada uno puede usarse en modo test (multiambiente) sin mezclar la identidad de pestañas/ambiente.
3. **Given** un ambiente live real (no fixture), **When** se conecta, **Then** no se le imponen por error los datos de fixture de otro ambiente.

---

### User Story 3 - Checkbox “Pegar al final” alineado al label (Priority: P1)

En la barra de controles del visor de logs, el checkbox **Pegar al final** aparece a la derecha del contenedor, inmediatamente junto al texto del label, con un pequeño espacio (padding/gap) para que no queden pegados ni el checkbox lejos a la izquierda mientras el texto queda al otro lado.

**Why this priority**: Defecto visual evidente en la entrega.

**Independent Test**: Abrir una pestaña de logs; inspeccionar la fila del control: checkbox + label agrupados a la derecha.

**Acceptance Scenarios**:

1. **Given** una pestaña de logs abierta, **When** mira el control “Pegar al final”, **Then** el checkbox está junto al label (no a muchos píxeles de distancia horizontal).
2. **Given** el mismo control, **When** mira la alineación del grupo, **Then** el conjunto checkbox+label está alineado hacia la derecha del contenedor (no el checkbox solo al inicio y el texto separado).
3. **Given** el grupo, **When** mide el espacio entre checkbox y texto, **Then** hay un pequeño padding/gap visible pero sin hueco grande.

---

### User Story 4 - Métricas de pod solo si hay datos (Priority: P1)

Si la app puede listar métricas de pod del tipo RAM / CPU / Uptime (p. ej. `256Mi / 512Mi`, `100m / 250m`, `3d4h`), esas cifras se muestran solo cuando hay datos reales disponibles. Si no hay datos, esos bloques se ocultan (no se muestran placeholders vacíos ni “N/D” ruidosos que ensucien la UI).

**Why this priority**: Evita ruido cuando el resumen no trae métricas.

**Independent Test**: Caso sin métricas → sin filas RAM/CPU/Uptime; caso con métricas → se ven los valores.

**Acceptance Scenarios**:

1. **Given** un resumen de workload sin RAM/CPU/Uptime disponibles, **When** mira la franja de resumen, **Then** no aparecen esas métricas.
2. **Given** un resumen con al menos una métrica disponible, **When** mira la franja, **Then** solo se muestran las métricas que tienen valor.
3. **Given** las tres métricas disponibles, **When** mira la franja, **Then** se ven RAM, CPU y Uptime con sus valores.

---

### Edge Cases

- Tema claro con fondo claro: colores metálicos siguen contrastando.
- Tema oscuro: mismos colores sin volverse neón ilegibles.
- Fixture en un solo ambiente vs varios: identidad de ambiente/pestaña se mantiene.
- Ambiente demo builtin vs ambiente custom cargado con fixtures: ambos pueden llevar datos test según el flujo de carga.
- Resumen parcial (solo uptime): solo se muestra uptime.
- Checkbox en anchos estrechos: el grupo derecho no se solapa ilegible con otros controles (wrap aceptable si el resto del toolbar ya lo hace).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La paleta de 10 colores de ambiente MUST usar el mismo color por índice en tema claro y oscuro.
- **FR-002**: Los 10 colores MUST ser brillantes / medio metálicos, distinguibles entre sí y visibles sobre ambos fondos.
- **FR-003**: Al cargar un ambiente con fixtures de prueba, el sistema MUST hidratar datos de prueba en ese ambiente (no solo un demo global ambiguo).
- **FR-004**: MUST ser posible usar más de un ambiente con datos de prueba en paralelo para ejercitar multiambiente en modo test.
- **FR-005**: Ambientes no asociados a fixtures MUST NOT recibir datos de fixture de otros ambientes.
- **FR-006**: El control “Pegar al final” MUST mostrar checkbox y label como grupo compacto alineado a la derecha del contenedor, con pequeño gap entre checkbox y texto.
- **FR-007**: RAM, CPU y Uptime del resumen de pods/workload MUST ocultarse cuando no hay datos.
- **FR-008**: RAM, CPU y Uptime MUST mostrarse cuando sí hay datos (cada uno de forma independiente).

### Key Entities

- **Color de ambiente (índice 0–9)**: token visual fijo cross-theme.
- **Ambiente con fixtures**: configuración que, al cargar/conectar en modo prueba, obtiene catálogo/datos test propios.
- **Control Pegar al final**: checkbox + label de auto-scroll del visor de logs.
- **Métrica de workload**: RAM, CPU o Uptime opcionalmente presente en el resumen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al cambiar de tema, el 100% de los índices de color conservan la misma apariencia de color (sin variante light/dark distinta).
- **SC-002**: ≥2 revisores distinguen los 10 colores en claro y en oscuro.
- **SC-003**: En una sesión de prueba, 2 ambientes cargados con fixtures muestran datos test y permiten abrir pestañas por ambiente sin colisión de identidad.
- **SC-004**: En captura/revisión UI, la distancia visual checkbox–label de “Pegar al final” es un gap pequeño (no separación a lo ancho del contenedor).
- **SC-005**: En resumen sin métricas, 0 menciones visibles de RAM/CPU/Uptime; con métricas parciales, solo las disponibles.

## Assumptions

- Se mantienen 10 ranuras de color (límite de configs de 023).
- “Brillante / medio metálico” = saturación media-alta y luminosidad que funcione en ambos fondos; no requiere efecto chrome literal 3D.
- “Cargar con fixtures” incluye el flujo de usar fixtures demo / seed de prueba al crear o restaurar un ambiente de test.
- Si live metrics ya existen en el producto, solo cambia la condición de visibilidad; si a veces vienen vacías, se ocultan.
- Keep-alive, límites de 2 conexiones y resto de 023 se conservan.
