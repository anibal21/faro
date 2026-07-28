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
- [x] Splash: imagen branded full-bleed (lighthouse); sin título/tagline overlay centrado; status/error solo abajo-derecha u image-only (FR-001–003, 006).
- [ ] `session_purge_ephemeral` solo borra `«session»` (FR-024).
- [ ] Ambientes/prefs/historial ligero persisten (SC-006).
- [ ] Tras purge → ventana principal.
- [x] Ventana: splash **576×324** fija centrada; principal **900×600** centrada (007); iconos desde `src-tauri/icons/`.

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

---

## HU11 — Navegación acordeón (002 / P1)

> Spec Kit: [`specs/002-accordion-nav-layout/spec.md`](specs/002-accordion-nav-layout/spec.md) · tasks T001–T037.

**Como** ingeniero/ops  
**Quiero** un acordeón izquierdo (Pods / ConfigMaps) y área principal amplia  
**Para** maximizar espacio de logs sin rails laterales ni “Abrir logs”.

### Criterios de aceptación
- [x] Accordion Pods/ConfigMaps; click abre pestaña (sin buscador ni CTA Abrir logs).
- [x] Logs multi-réplica combinados + follow en background; summary réplicas/RAM/CPU/uptime o N/D.
- [x] ConfigMaps en la misma tira de pestañas; dedupe por navKey.
- [x] Collapse/empty/disconnect limpia pestañas.

---

## HU12 — Chrome profesional (004 / P1)

> Spec Kit: [`specs/004-pro-workspace-chrome/spec.md`](specs/004-pro-workspace-chrome/spec.md) · tasks T001–T036.

**Como** ingeniero/ops  
**Quiero** menubar Ambientes|Temas, árbol de ambientes fijo, logs a ancho completo y panel de análisis plegable  
**Para** una UI densa y profesional (shadcn/Tailwind) sin header voluminoso.

### Criterios de aceptación
- [x] Solo menubar Ambientes|Temas; sin brand/status/selector en header.
- [x] Árbol: todos los ambientes; select solo en label; menú contextual Conectar/Desconectar/Editar.
- [x] Logs full-width; AnalysisDrawer debajo (cerrar/redimensionar); multi-sesión runtime.
- [x] Tests US1–US3 + outline E2E `pro_chrome_primary_flow`.

---

## HU13 — UI chrome polish (005 / P1)

> Spec Kit: [`specs/005-ui-chrome-polish/spec.md`](specs/005-ui-chrome-polish/spec.md) · tasks T001–T034.

**Como** ingeniero/ops  
**Quiero** tipografía legible, iconos +/−, menú Ambientes mínimo, rail Monitor con versión, chrome tematizado y splash ≥5s  
**Para** una experiencia de escritorio más profesional y clara.

### Criterios de aceptación
- [x] Texto ~escala VS Code; Plus/Minus lucide.
- [x] Ambientes: Nuevo… / Desconectar todo (confirm siempre); rail Monitor + versión.
- [x] TitleBar custom + Temas; splash mínimo 5s.
- [x] Tests T007–T030 verdes.
