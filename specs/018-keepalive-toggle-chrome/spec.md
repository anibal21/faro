# Feature Specification: Keep-Alive Toggle Chrome & Desktop Overscroll

**Feature Branch**: `018-keepalive-toggle-chrome`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "vi que aparece una nueva opción en el menú Mantener conexión viva, si le haces click no pasa nada, eso no está bien, debería cuando conecta estar por defecto en keepalive true, y debería el botón aparecer como No mantener conexión viva, si lo apretamos pasa a keepalive: false y el botón aparece como Mantener conexión viva, de este modo, sabemos cuando está activado y cuando no. Por otro lado, también me gustaría que la aplicación deshabilitara esa opción de mover todo el contenido de arriba y abajo, ese efecto como pull to refresh, la idea es que parezca lo más parecido a una aplicación de escritorio profesional."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle keep-alive con etiqueta de acción clara (Priority: P1)

Un operador conecta un ambiente live. Keep-alive queda **activo por defecto**. En el menú contextual del ambiente, la opción dice **No mantener conexión viva** (la acción disponible). Al elegirla, keep-alive se apaga de verdad (pulsos dejan de enviarse) y la etiqueta pasa a **Mantener conexión viva**. Al activarla de nuevo, vuelve a ON y la etiqueta otra vez a “No mantener…”. El operador siempre sabe el estado porque la etiqueta es la acción opuesta al estado actual, y un clic siempre produce un cambio visible.

**Why this priority**: El clic que “no hace nada” y el default OFF rompen la confianza en la función recién entregada (017).

**Independent Test**: Conectar live → menú muestra “No mantener conexión viva” → clic → etiqueta cambia a “Mantener conexión viva” y no hay pulsos; clic de nuevo → vuelve a “No mantener…” y hay pulsos/estado keep-alive activo.

**Acceptance Scenarios**:

1. **Given** un ambiente live recién conectado (sin preferencia previa que fuerce OFF), **When** el operador abre el menú contextual, **Then** keep-alive está ON y la opción visible es **No mantener conexión viva**.
2. **Given** keep-alive ON y la opción “No mantener conexión viva”, **When** el operador la elige, **Then** keep-alive queda OFF, los pulsos dejan de programarse, y la opción pasa a **Mantener conexión viva**.
3. **Given** keep-alive OFF y la opción “Mantener conexión viva”, **When** el operador la elige, **Then** keep-alive queda ON, los pulsos se reanudan según el intervalo ya definido, y la opción vuelve a **No mantener conexión viva**.
4. **Given** el operador elige la opción de keep-alive, **When** el menú se cierra, **Then** el cambio se refleja de inmediato en la UI (etiqueta y/o indicador de estado), sin quedar “como si no hubiera pasado nada”.

---

### User Story 2 - Sensación de app de escritorio (sin tirón/pull) (Priority: P1)

Al usar Faro en escritorio, el operador **no** puede “tirar” de la ventana o del contenido principal con un efecto elástico / pull-to-refresh que mueva toda la UI arriba y abajo. El desplazamiento vertical sigue existiendo **dentro** de paneles con lista o logs cuando el contenido es más alto que el área visible, pero sin el rebote o gesto de refrescar la página completa.

**Why this priority**: El efecto de “página web móvil” contradice el objetivo de producto de app de escritorio profesional.

**Independent Test**: Abrir Faro → intentar arrastrar/desplazar más allá del tope del contenido principal → no hay tirón elástico de toda la app ni gesto tipo pull-to-refresh; las listas internas siguen scrolleables.

**Acceptance Scenarios**:

1. **Given** la ventana principal de Faro abierta, **When** el operador intenta el gesto de tirar hacia abajo en el tope (o el equivalente en su plataforma), **Then** el contenido de la shell no se desplaza con efecto elástico/pull-to-refresh.
2. **Given** un panel con logs o catálogo más largo que el viewport, **When** el operador hace scroll normal, **Then** ese panel sigue desplazándose de forma usable.

---

### Edge Cases

- Ambiente **demo**: keep-alive sigue sin aplicar; la opción no aparece o permanece deshabilitada (comportamiento 017).
- Preferencia guardada OFF de una sesión anterior: al reconectar el mismo ambiente, se respeta la preferencia guardada (OFF) aunque el default para **primera** conexión / sin pref sea ON.
- Ambiente desconectado: la opción de keep-alive no se ofrece hasta estar conectado (live).
- Varios ambientes live: cada uno tiene su propio estado y etiqueta de menú independiente.
- Tras apagar keep-alive, el estado de salud de la sesión no debe fingir pulsos nuevos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al conectar con éxito un ambiente **live**, Faro MUST dejar keep-alive en **ON** por defecto cuando no exista una preferencia explícita previa en OFF para ese ambiente.
- **FR-002**: La etiqueta del ítem de menú MUST reflejar la **acción disponible**, no el estado actual como título estático: con keep-alive ON → **No mantener conexión viva**; con keep-alive OFF → **Mantener conexión viva**.
- **FR-003**: Elegir el ítem de menú MUST conmutar keep-alive (ON↔OFF), persistir la preferencia por ambiente, y actualizar la UI de inmediato (etiqueta y estado visible).
- **FR-004**: Con keep-alive OFF, Faro MUST dejar de enviar pulsos de keep-alive para ese ambiente; con ON, MUST retomar el comportamiento de pulso ya definido en la feature de sesión keep-alive (intervalo y reglas de salud existentes).
- **FR-005**: Un clic en el ítem MUST nunca dejar la UI sin feedback: si el cambio falla, MUST mostrarse un error entendible; si tiene éxito, la etiqueta MUST cambiar.
- **FR-006**: Faro MUST impedir el efecto de arrastre elástico / pull-to-refresh sobre la shell de la aplicación de modo que la ventana se sienta como app de escritorio, no como página web móvil.
- **FR-007**: El scroll útil dentro de regiones de contenido (árbol, logs, paneles) MUST seguir disponible cuando el contenido desborde.
- **FR-008**: Demo / offline MUST seguir excluidos de keep-alive (sin cambio de política respecto a 017).

### Key Entities

- **Preferencia keep-alive por ambiente**: valor ON/OFF asociado a un ambiente guardado; default efectivo ON al conectar live si no hay OFF guardado.
- **Ítem de menú de acción keep-alive**: copy en español que siempre describe lo que hará el siguiente clic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En 100% de las conexiones live nuevas (sin pref OFF previa), keep-alive queda activo y el menú muestra **No mantener conexión viva** en la primera apertura post-conexión.
- **SC-002**: Tras un clic en el ítem, en ≤ 1 segundo la etiqueta cambia al estado opuesto y el operador puede verificar el nuevo estado sin recargar la app.
- **SC-003**: Con keep-alive OFF tras el clic, no aparece un “último pulso” más reciente que el momento del apagado (salvo pulsos ya en vuelo previos al clic).
- **SC-004**: En una sesión de prueba de 5 minutos, el operador no puede provocar el tirón/pull-to-refresh de toda la ventana; el scroll interno de listas/logs sigue funcionando.
- **SC-005**: Demo no ofrece activar keep-alive; ningún clic en demo cambia preferencias de keep-alive live.

## Assumptions

- Esta feature **ajusta** el comportamiento de 017 (Session Keep-Alive): cambia el default a ON y corrige la UX del menú; no redefine el intervalo de pulso ni el umbral de fallos.
- “Sin preferencia previa” significa que nunca se guardó OFF (o no hay valor) para ese ambiente; si el usuario apagó keep-alive antes, esa elección se respeta en reconexiones.
- El efecto a eliminar es el overscroll/bounce/pull de la ventana o documento raíz, típico de WebView, no el scroll normal de paneles.
- Copy exacto solicitado por el usuario: **Mantener conexión viva** / **No mantener conexión viva**.
- No se pide un interruptor visual aparte del ítem de menú contextual en este incremento.
