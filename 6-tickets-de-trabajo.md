# 6. Tickets de trabajo

> Generados desde Spec Kit (base [`tasks.md`](specs/001-eks-log-monitor/tasks.md) 2026-07-23 + UI 002–007).  
> **Tickets HU1–HU16**. Cada uno lista tareas Spec Kit.  
> Cubren backend (Rust/Tauri), frontend (React) y BD (SQLite) — requisito AI4Devs ≥3 tipos.  
> Estimaciones en puntos relativos (1 = pequeño, 5 = grande). Ajustar en review.

**Fuente de verdad de ejecución:** specs por feature (`001`…`007` `/tasks.md`).

---

## Ticket HU1 — Splash + purge sesión

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Backend + BD |
| **HU / US** | HU1 / US1 (P1 Must) |
| **Tasks** | T016–T021 (+ foundation T007–T009, T018) |
| **Estimación** | 3 |

### Descripción
Splash branded (imagen lighthouse) y `session_purge_ephemeral` que borra solo tablas `«session»`, conservando ambientes/prefs. Geometría actual: ver HU14–HU15.

### Criterios de aceptación
- [x] FR-023 / FR-024 (purge) + splash visual 006/007.
- [x] Tras dirty exit, relaunch limpia session y conserva durables.
- [x] Tests splash/purge verdes.

---

## Ticket HU2 — CRUD ambientes

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend + BD + Frontend |
| **HU / US** | HU2 / US2 (P1 Must) |
| **Tasks** | T022–T028 |
| **Estimación** | 3 |

### Descripción
CRUD de `connection_instance` (PEM path, SSH, IAM path, region, cluster); modal wireframe 03; sin secretos en SQLite.

### Criterios de aceptación
- [ ] Persistencia tras restart.
- [ ] Validación paths; rechazo de cuerpos de secreto.
- [ ] Tests T022–T023 verdes.

---

## Ticket HU3 — Cargar uno/varios + activo

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Backend |
| **HU / US** | HU3 / US3 (P1 Must) |
| **Tasks** | T029–T033 |
| **Estimación** | 2 |

### Descripción
`env_load` / `env_set_active`; selector y menú Ambiente; un solo activo; invalida ventanas live previas.

### Criterios de aceptación
- [ ] Carga múltiple en sidebar; un activo.
- [ ] Cambio de activo limpia contexto live previo.
- [ ] Test T029 verde.

---

## Ticket HU4 — Conectar / desconectar bastión

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend (SSH + EKS) + Frontend |
| **HU / US** | HU4 / US4 (P1 Must) |
| **Tasks** | T034–T041 |
| **Estimación** | 5 |

### Descripción
Túnel SSH (PEM path), token EKS desde archivo IAM, `env_connect` / `env_disconnect`, hydrate session cache (esqueleto), errores sin secretos.

### Criterios de aceptación
- [x] Connect OK con ambiente de prueba (o mocks).
- [x] Disconnect purga session del ambiente.
- [x] Tests T034–T035 verdes.

---

## Ticket HU5 — Deployments/Pods (cache)

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend + Frontend + BD session |
| **HU / US** | HU5 / US5 (P1 Must) |
| **Tasks** | T042–T048 |
| **Estimación** | 3 |

### Descripción
Listado desde cache de sesión; filtro por nombre; `catalog_refresh` / epoch; rail wireframe 04.

### Criterios de aceptación
- [x] UI lee cache post-hydrate (no re-list K8s en cada click).
- [x] Refresh regenera epoch.
- [x] Tests T042–T043 verdes.

---

## Ticket HU6 — ConfigMaps RO

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend + Frontend |
| **HU / US** | HU6 / US6 (P1 Must) |
| **Tasks** | T049–T054 |
| **Estimación** | 3 |

### Descripción
List/get ConfigMaps; vista Raw RO; truncado seguro de valores grandes/binarios.

### Criterios de aceptación
- [x] Solo lectura; sin mutaciones K8s.
- [x] Truncado seguro.
- [x] Tests T049–T050 verdes.

---

## Ticket HU7 — Logs Structured + Raw

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend + Frontend |
| **HU / US** | HU7 / US7 (P1 Must) |
| **Tasks** | T055–T063 |
| **Estimación** | 5 |

### Descripción
`logs_open`/`close` + events `logs_chunk`/`logs_status`; Structured default; Raw sin manipulación; multi-ventana; búsqueda; buffers en RAM.

### Criterios de aceptación
- [x] FR-018–022.
- [x] Sin dumps de logs en SQLite.
- [x] Tests T055–T056 verdes.

---

## Ticket HU8 — Análisis Spring Boot al click

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend (rules) + Frontend |
| **HU / US** | HU8 / US8 (P1 Must) |
| **Tasks** | T064–T071 |
| **Estimación** | 4 |

### Descripción
Detección ligera + `analyze_write_group` local; panel hallazgo; rule pack `rules/springboot/`; sin Analizar-todo / Export.

### Criterios de aceptación
- [x] Click → severidad + explicación + acción.
- [x] Sin egress del payload de análisis.
- [x] Tests T064–T065 verdes.

---

## Ticket HU9 — Tema claro / oscuro (Should)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + prefs BD |
| **HU / US** | HU9 / US9 (P2 Should) |
| **Tasks** | T072–T075 |
| **Estimación** | 2 |

### Descripción
Menú Ver → claro/oscuro; persistencia `prefs_*` (FR-025).

### Criterios de aceptación
- [x] Preferencia sobrevive restart.
- [x] Test T072 verde.

---

## Ticket HU10 — Empaquetado desktop multi-OS

| Campo | Valor |
|-------|--------|
| **Tipo** | DevOps / packaging |
| **HU / US** | HU10 / US10 (P3 Must) |
| **Tasks** | T076–T079 (+ polish T080) |
| **Estimación** | 4 |

### Descripción
Bundles Tauri Win/macOS/Linux; demo Windows primero; artefactos llegan a splash o UI de conexión.

### Criterios de aceptación
- [x] FR-015 / SC-007.
- [x] Build documentado en README/quickstart.

---

## Tickets transversales (capa AI4Devs Example1)

Para el formato clásico “≥3 tickets por capa”, agrupar así en PRs si hace falta:

| Capa | Tickets HU cubiertos | Tasks setup/foundation |
|------|----------------------|-------------------------|
| **BD** | HU1 (purge), HU2 (durable), HU5–HU6 (session) | T007–T009, T015 |
| **Backend** | HU4, HU5–HU8 | T036–T041, T044–T045, T057–T058, T066–T067 |
| **Frontend** | HU1, HU3, HU7–HU9, HU11–HU16 | T019–T020, T026–T033, T060–T069, T073–T074 + tasks 002–008 |

**Polish / E2E:** T080–T085 (no es HU; cierra primary flow).

---

## Ticket HU11 — Layout acordeón (002)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Backend |
| **HU / US** | HU11 / US1–US4 (002) |
| **Tasks** | T001–T037 (`specs/002-accordion-nav-layout/tasks.md`) |
| **Estimación** | 5 |

### Descripción
Sustituye el workspace de 3 columnas por acordeón | main: click en Deployment/ConfigMap abre pestañas (dedupe), fan-in multi-réplica, `workload_summary`, strip de métricas N/D.

### Criterios de aceptación
- [x] Sin buscador / Abrir logs / rail derecho ConfigMaps.
- [x] Tests unit/integration/E2E outline 002 verdes.

---

## Ticket HU12 — Professional workspace chrome (004)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Backend |
| **HU / US** | HU12 / US1–US3 (P1 Must) |
| **Tasks** | T001–T036 (`specs/004-pro-workspace-chrome/tasks.md`) |
| **Estimación** | 5 |

### Descripción
shadcn/Tailwind; AppMenubar Ambientes|Temas; EnvTreeNav; LogWorkspace + AnalysisDrawer; sessions map multi-connect.

### Criterios de aceptación
- [x] Chrome denso sin header bulky.
- [x] Árbol + drawer + tests 004 verdes.

---

## Ticket HU13 — UI chrome polish (005)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Config Tauri |
| **HU / US** | HU13 / US1–US4 (P1 Must) |
| **Tasks** | T001–T034 (`specs/005-ui-chrome-polish/tasks.md`) |
| **Estimación** | 3 |

### Descripción
13px UI; lucide +/−; Ambientes mínimo; Monitor + version; TitleBar undecorated; splash dwell 5s.

### Criterios de aceptación
- [x] Contratos ui-chrome + splash-dwell cumplidos.
- [x] Tests 005 verdes.

---

## Ticket HU14 — Splash branded + iconos (006)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Config Tauri (bundle icons) |
| **HU / US** | HU14 / US1–US3 (006) |
| **Tasks** | T001–T019 (`specs/006-branded-splash-icons/tasks.md`) |
| **Estimación** | 2 |

### Descripción
Splash full-bleed con `load_page` art; sin título overlay; status/error abajo-derecha; iconos `src-tauri/icons/` en bundle.

### Criterios de aceptación
- [x] Contratos splash-visual + window-icons (icon paths).
- [x] Tests 006 verdes.

---

## Ticket HU15 — Ventanas compactas fijas (007)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Config Tauri |
| **HU / US** | HU15 / US1–US2 (007) |
| **Tasks** | T001–T014 (`specs/007-compact-fixed-windows/tasks.md`) |
| **Estimación** | 2 |

### Descripción
Splash **576×324** fija/centrada; al ready **900×600** centrada (clamp a work area); `windowGeometry.ts` + capabilities set-size/center.

### Criterios de aceptación
- [x] Contrato window-geometry.
- [x] Tests 007 verdes (conf + clamp + E2E outline).

---

## Ticket HU16 — Live cluster connect + demo (008)

| Campo | Valor |
|-------|--------|
| **Tipo** | Backend + Frontend + Config |
| **HU / US** | HU16 / US1–US3 (008) |
| **Tasks** | T001–T041 (`specs/008-live-cluster-connect/tasks.md`) |
| **Estimación** | 5 |

### Descripción
Builtin **demo** (`faro-demo`); live envs con SSH+AWS CLI EKS+kube; namespace obligatorio; multi-connect aislado; sin fallback demo.

### Criterios de aceptación
- [x] Contratos connect-modes + live-k8s-session.
- [x] Tests 008 verdes.

---

## Ticket HU17 — Examinar rutas PEM/IAM (009)

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Tauri plugin |
| **HU / US** | HU17 / US1–US4 (009) |
| **Tasks** | T001–T030 (`specs/009-connection-file-browse/tasks.md`) |
| **Estimación** | 2 |

### Descripción
Selector nativo (`@tauri-apps/plugin-dialog`) en modal de ambiente para PEM e IAM; paths only; Save bloqueado si Browse falla.

### Criterios de aceptación
- [x] Contratos file-browse-ui.
- [x] Tests 009 verdes.

---

## Orden sugerido de implementación

```text
Setup+Foundation (T001–T015)
  → HU1 → HU2 → HU3 → HU4
  → HU5 ∥ HU6
  → HU7 → HU8
  → HU9 (Should) → HU10 → E2E T080
  → HU11 (002 accordion T001–T037)
  → HU12 (004 pro chrome T001–T036)
  → HU13 (005 ui chrome polish T001–T034)
  → HU14 (006 branded splash T001–T019)
  → HU15 (007 compact windows T001–T014)
  → HU16 (008 live cluster connect T001–T041)
  → HU17 (009 connection file browse T001–T030)
```
