# 6. Tickets de trabajo

> Generados desde Spec Kit [`tasks.md`](specs/001-eks-log-monitor/tasks.md) (2026-07-23).  
> **10 tickets** = 1 por historia atómica (US1–US10). Cada uno lista tareas Spec Kit.  
> Cubren backend (Rust/Tauri), frontend (React) y BD (SQLite) — requisito AI4Devs ≥3 tipos.  
> Estimaciones en puntos relativos (1 = pequeño, 5 = grande). Ajustar en review.

**Fuente de verdad de ejecución:** `specs/001-eks-log-monitor/tasks.md` (T001–T085).

---

## Ticket HU1 — Splash + purge sesión

| Campo | Valor |
|-------|--------|
| **Tipo** | Frontend + Backend + BD |
| **HU / US** | HU1 / US1 (P1 Must) |
| **Tasks** | T016–T021 (+ foundation T007–T009, T018) |
| **Estimación** | 3 |

### Descripción
Splash mínimo (Faro + BG slot + tagline AWS + *…preparando*) y `session_purge_ephemeral` que borra solo tablas `«session»`, conservando ambientes/prefs.

### Criterios de aceptación
- [ ] FR-023 / FR-024 cumplidos.
- [ ] Tras dirty exit, relaunch limpia session y conserva durables.
- [ ] Tests T016–T017 verdes.

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
- [ ] Connect OK con ambiente de prueba (o mocks).
- [ ] Disconnect purga session del ambiente.
- [ ] Tests T034–T035 verdes.

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
- [ ] UI lee cache post-hydrate (no re-list K8s en cada click).
- [ ] Refresh regenera epoch.
- [ ] Tests T042–T043 verdes.

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
- [ ] Solo lectura; sin mutaciones K8s.
- [ ] Truncado seguro.
- [ ] Tests T049–T050 verdes.

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
- [ ] FR-018–022.
- [ ] Sin dumps de logs en SQLite.
- [ ] Tests T055–T056 verdes.

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
- [ ] Click → severidad + explicación + acción.
- [ ] Sin egress del payload de análisis.
- [ ] Tests T064–T065 verdes.

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
- [ ] Preferencia sobrevive restart.
- [ ] Test T072 verde.

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
- [ ] FR-015 / SC-007.
- [ ] Build documentado en README/quickstart.

---

## Tickets transversales (capa AI4Devs Example1)

Para el formato clásico “≥3 tickets por capa”, agrupar así en PRs si hace falta:

| Capa | Tickets HU cubiertos | Tasks setup/foundation |
|------|----------------------|-------------------------|
| **BD** | HU1 (purge), HU2 (durable), HU5–HU6 (session) | T007–T009, T015 |
| **Backend** | HU4, HU5–HU8 | T036–T041, T044–T045, T057–T058, T066–T067 |
| **Frontend** | HU1, HU3, HU7–HU9 | T019–T020, T026–T033, T060–T069, T073–T074 |

**Polish / E2E:** T080–T085 (no es HU; cierra primary flow).

---

## Orden sugerido de implementación

```text
Setup+Foundation (T001–T015)
  → HU1 → HU2 → HU3 → HU4
  → HU5 ∥ HU6
  → HU7 → HU8
  → HU9 (Should) → HU10 → E2E T080
```
