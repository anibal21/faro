# 5. Historias de usuario

> Spec Kit: [`specs/001-eks-log-monitor/spec.md`](specs/001-eks-log-monitor/spec.md) — **10 historias atómicas** (US1–US10) para control de desarrollo.  
> IPC: [`4-comandos-y-eventos-ipc.md`](4-comandos-y-eventos-ipc.md).  
> Tickets / tasks: [`6-tickets-de-trabajo.md`](6-tickets-de-trabajo.md) · [`tasks.md`](specs/001-eks-log-monitor/tasks.md) (T001–T085).

---

## HU1 — Splash y purge de sesión (P1 / Must)

**Como** usuario de Faro  
**Quiero** un splash al abrir que limpie residuos de sesión/logs  
**Para** arrancar limpio sin perder ambientes guardados.

### Criterios de aceptación
- [ ] Splash: Faro + BG image (asset en implement) + tagline AWS + *…preparando aplicación* (FR-023).
- [ ] `session_purge_ephemeral` solo borra `«session»` (FR-024).
- [ ] Ambientes/prefs/historial ligero persisten (SC-006).
- [ ] Tras purge → ventana principal.

---

## HU2 — CRUD de ambientes (P1 / Must)

**Como** ingeniero/ops  
**Quiero** crear/editar/eliminar instancias (PEM+SSH+IAM path+region+cluster)  
**Para** no repetir configuración frágil.

### Criterios de aceptación
- [ ] CRUD completo de instancias.
- [ ] Persisten al reiniciar.
- [ ] Solo paths e identificadores; sin secretos en SQLite (FR-001–003).

---

## HU3 — Cargar uno/varios; un activo (P1 / Must)

**Como** ingeniero/ops  
**Quiero** cargar uno o varios ambientes y marcar uno activo  
**Para** trabajar con varios perfiles sin túneles concurrentes.

### Criterios de aceptación
- [ ] Menú Ambiente: cargar / cargar varios.
- [ ] Solo el activo alimenta connect/catálogo.
- [ ] Cambio de activo invalida ventanas live previas.

---

## HU4 — Conectar / desconectar (P1 / Must)

**Como** ingeniero/ops  
**Quiero** conectar vía bastión y desconectar  
**Para** operar el cluster sin SSH manual.

### Criterios de aceptación
- [ ] Connect: túnel + IAM file → token; hydrate catálogo 1× (FR-004).
- [ ] Disconnect limpia session cache del ambiente.
- [ ] Errores claros sin secretos (FR-016).

---

## HU5 — Explorar Deployments/Pods (cache) (P1 / Must)

**Como** ingeniero/ops  
**Quiero** listar Deployments/Pods con catálogo cacheado  
**Para** encontrar workloads rápido sin re-listar siempre.

### Criterios de aceptación
- [ ] Lista de workloads accesibles; filtro por nombre (FR-005–006).
- [ ] UI puede leer cache de sesión tras hydrate.
- [ ] `catalog_refresh` regenera epoch.

---

## HU6 — Explorar ConfigMaps (P1 / Must)

**Como** ingeniero/ops  
**Quiero** listar y abrir ConfigMaps en solo lectura  
**Para** ver configuración sin kubectl.

### Criterios de aceptación
- [ ] Lista de ConfigMaps accesibles (FR-011).
- [ ] Vista keys/values read-only (estilo Raw).
- [ ] Valores grandes/binarios truncados de forma segura.

---

## HU7 — Logs Structured + Raw (P1 / Must)

**Como** ingeniero/ops  
**Quiero** logs agregados en vivo con Structured (default) y Raw  
**Para** monitorear sin terminal.

### Criterios de aceptación
- [ ] Una ventana por Deployment; multi-ventana; follow; búsqueda (FR-007–010).
- [ ] Structured default; Raw sin manipulación (FR-018–022).
- [ ] Buffers en RAM; no dumps en SQLite.

---

## HU8 — Análisis Spring Boot al click (P1 / Must)

**Como** colega técnico o no técnico  
**Quiero** click en un error/stacktrace Structured  
**Para** ver severidad, explicación simple y acción.

### Criterios de aceptación
- [ ] Detección ligera + click → motor completo (FR-012–014, FR-020).
- [ ] Vacío explícito si no hay match.
- [ ] Sin Analizar-todo / sin Export en MVP.

---

## HU9 — Tema claro / oscuro (P2 / Should)

**Como** usuario  
**Quiero** cambiar modo claro/oscuro en **Ver**  
**Para** comodidad visual; que persista al reiniciar.

### Criterios de aceptación
- [ ] Ver → Modo claro / Modo oscuro (FR-025).
- [ ] Preferencia en `ui_preferences` sobrevive restart.
- [ ] Chrome sigue el tema (Raw puede mantener contraste terminal).

---

## HU10 — Desktop Win / macOS / Linux (P3 / Must)

**Como** evaluador/colega  
**Quiero** instalar o ejecutar Faro en los tres SO  
**Para** demostrar sin URL pública.

### Criterios de aceptación
- [ ] Paquetes alcanzan splash o UI de conexión (FR-015, SC-007).
- [ ] Demo local/grabación aceptable sin URL pública.

---

## Fuera de alcance (MVP)

- Exportar logs; Analizar buffer completo; colas/eventos; reglas no-Spring Boot; mutar cluster; IA generativa.
