# Feature Specification: Session Keep-Alive

**Feature Branch**: `017-session-keep-alive`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Session keep-alive seleccionable para Faro: evitar que la conexión al ambiente se muera en silencio, con control explícito, heartbeat útil por la sesión remota (no localhost), estado visible y reconectar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Activar “Mantener conexión viva” (Priority: P1)

Un operador conecta un ambiente live y activa el interruptor **Mantener conexión viva**. Faro empieza a emitir pulsos periódicos baratos a través de la sesión remota ya establecida. El operador ve que el ambiente sigue **conectado** y cuándo fue el **último pulso** correcto, y puede dejar la app abierta mientras investiga logs sin sorpresas silenciosas.

**Why this priority**: Es el control explícito que pide el usuario; sin él no hay keep-alive.

**Independent Test**: Conectar ambiente → activar keep-alive → tras al menos un intervalo, la UI muestra último pulso reciente y estado conectado (sin ping a la máquina local como mecanismo principal).

**Acceptance Scenarios**:

1. **Given** un ambiente live conectado y keep-alive en OFF, **When** el operador lo enciende, **Then** Faro agenda pulsos periódicos y la UI refleja keep-alive activo.
2. **Given** keep-alive ON, **When** pasa el intervalo configurado, **Then** se registra un pulso exitoso y se actualiza “Último pulso”.
3. **Given** keep-alive OFF, **When** el intervalo transcurriría, **Then** no se envían pulsos de keep-alive.

---

### User Story 2 - Ver estado honesto de la sesión (Priority: P1)

El operador ve en todo momento si la sesión del ambiente está **conectada**, **degradada** o **desconectada**, en español, junto al último pulso OK cuando aplique. Los cambios de estado no spamean notificaciones cada minuto; solo se destacan fallos o transiciones relevantes.

**Why this priority**: Sin transparencia, el keep-alive no cumple el objetivo de “saber cuándo se murió”.

**Independent Test**: Observar la UI en conectado con pulsos OK; forzar/simular fallos de pulso → estado pasa a degradado/desconectado con copy claro.

**Acceptance Scenarios**:

1. **Given** keep-alive ON y pulsos OK, **When** el operador mira el ambiente, **Then** ve estado conectado y un último pulso reciente (relativo o hora).
2. **Given** fallos consecutivos de pulso (umbral del MVP), **When** se alcanza el umbral, **Then** el estado pasa a degradado o desconectado y deja de aparentar salud.
3. **Given** keep-alive OFF, **When** la app detecta que la sesión se cortó por otra vía, **Then** el estado mostrado sigue siendo honesto (no fingir conectado).

---

### User Story 3 - Reconectar tras fallo (Priority: P2)

Tras degradación/desconexión detectada por keep-alive (o corte detectado), el operador puede pulsar **Reconectar** sobre el mismo ambiente y recuperar la sesión sin volver a llenar el formulario de configuración.

**Why this priority**: Cierra el loop operativo; depende de estado visible (US2).

**Independent Test**: Simular fallo de sesión → aparece Reconectar → al usarlo, el ambiente vuelve a intento de conexión con la config guardada.

**Acceptance Scenarios**:

1. **Given** estado degradado o desconectado tras fallos de pulso, **When** el operador elige Reconectar, **Then** Faro intenta restablecer la sesión del mismo ambiente sin pedir PEM/host de nuevo.
2. **Given** reconexión exitosa, **When** keep-alive seguía ON, **Then** los pulsos se reanudan y el estado vuelve a conectado tras un pulso OK (o equivalente inmediato post-connect).

---

### Edge Cases

- Ambiente demo / offline: keep-alive no aplica o permanece deshabilitado (solo sesiones live que usan bastion/cluster).
- Varios ambientes conectados: cada uno tiene su propio toggle y estado (keep-alive por ambiente).
- Usuario apaga keep-alive a mitad de sesión: se dejan de enviar pulsos; el estado no se inventa.
- Fallo intermitente de un solo pulso: no saltar a desconectado de inmediato (usar umbral de fallos consecutivos).
- Cortar red del ISP: Faro no puede “arreglar” Internet; sí debe mostrar desconectado y ofrecer reconectar.
- Desconectar manualmente el ambiente: keep-alive se detiene para ese ambiente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to turn **Mantener conexión viva** ON/OFF for a **connected live environment** (per environment).
- **FR-002**: Keep-alive MUST default to **OFF** so behavior does not change until the operator opts in.
- **FR-003**: When keep-alive is ON, Faro MUST send a lightweight **read-only** remote heartbeat on a fixed **60 second** interval (MVP; not user-tunable in this release).
- **FR-004**: The heartbeat MUST travel the operator’s already-configured remote path (bastion / cluster session). Using laptop localhost ping as the primary keep-alive mechanism is **OUT OF SCOPE** / forbidden as the main design.
- **FR-005**: Heartbeats MUST NOT mutate the cluster and MUST NOT exfiltrate logs or secrets beyond what the existing session already uses for connectivity.
- **FR-006**: The UI MUST show session health for the environment as at least: **conectado**, **degradado**, **desconectado**, plus **last successful pulse** when available (Spanish copy).
- **FR-007**: After **3 consecutive** failed heartbeats, Faro MUST mark the session **degradado** or **desconectado** (MVP: after 3 failures → **desconectado** for honesty) and MUST stop presenting the session as healthy.
- **FR-008**: When the session is degradado/desconectado after detected failure, users MUST be offered **Reconectar** for that same saved environment without re-entering connection form fields.
- **FR-009**: When keep-alive is OFF, Faro MUST NOT schedule keep-alive heartbeats; if disconnection is detected by other means, status MUST still be honest.
- **FR-010**: Status changes MUST NOT spam a toast on every successful pulse; notify or emphasize only meaningful transitions/failures.
- **FR-011**: Must-Have behavior MUST be covered by automated tests (toggle schedules/cancels pulses; failure threshold updates status; reconnect affordance) and a short manual quickstart.

### Key Entities

- **Environment session**: Live connection to one saved environment (bastion/cluster path).
- **Keep-alive preference**: Per connected environment, ON/OFF (default OFF).
- **Session health**: conectado | degradado | desconectado, with last successful pulse timestamp.
- **Heartbeat**: Periodic read-only liveness check through the remote session.
- **Reconnect action**: Re-establish session for the same environment using stored non-secret config + local PEM path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With keep-alive ON, an operator sees a successful pulse update at least once within ~90 seconds of enabling (one interval + margin) in verification.
- **SC-002**: With keep-alive OFF, no keep-alive pulses are scheduled (automated check).
- **SC-003**: After three consecutive failed pulses, UI shows disconnected (or degraded then disconnected per FR-007) and offers Reconectar within the same interaction surface.
- **SC-004**: Reconectar restores a session for the same environment without re-filling bastion/cluster form fields in the happy path.
- **SC-005**: Operators can state in a demo whether the session is alive or dead without opening external terminals (qualitative).
- **SC-006**: Heartbeat design under test does not use localhost ping as the primary mechanism.

## Assumptions

- Keep-alive is **per connected live environment**, not a single global-only switch (globals may mirror later).
- Interval is **fixed at 60s** for MVP (configurable 30–120s deferred).
- Failure threshold is **3 consecutive** failed heartbeats → treat as **desconectado** and offer Reconectar.
- Demo/offline builtin environment does not use remote keep-alive.
- Performance charts / metrics APIs are out of scope (no metrics permissions confirmed).
- Faro cannot prevent all ISP outages; it improves honesty and recovery.
- Constitution: local-first, read-only cluster, no generative AI, no exfiltration of user-domain data.
