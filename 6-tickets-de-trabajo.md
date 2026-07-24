# 6. Tickets de trabajo

> Documentar ≥3 tickets: backend, frontend y base de datos (como en Example1).  
> Completar estimación y desglose fino con Spec Kit `/speckit-tasks` sobre las **10 HU atómicas** ([`5-historias-de-usuario.md`](5-historias-de-usuario.md) / `spec.md` US1–US10).  
> Los tickets abajo son **borrador de alineación**; no sustituyen `tasks.md`.

---

## Ticket 1 — Backend: túnel SSH + cliente EKS/kube

**Tipo:** Backend (Rust / Tauri)  
**Relacionado con:** HU4 (connect/disconnect); habilita HU5–HU7  

### Descripción
Implementar commands para abrir túnel SSH con `.pem`, leer archivo IAM (ruta) → token EKS (`region_name` + `cluster_name`) y listar pods / stream de logs vía kube API en localhost.

### Criterios de aceptación
- [ ] Túnel estable con ambiente de prueba.
- [ ] Token EKS desde archivo IAM (path); sin persistir Access Key/Secret.
- [ ] `k8s_list_deployments` / logs operativos.
- [ ] Errores tipados y visibles en UI (sin secretos en mensajes).

---

## Ticket 2 — Frontend: visor de logs + análisis al click

**Tipo:** Frontend (React)  
**Relacionado con:** HU7 (Structured/Raw) + HU8 (análisis al click)  

### Descripción
Pantallas de explorador y visor: lista de pods, buffer de logs, búsqueda, vistas Structured/Raw y panel de hallazgos al click (sin Analizar-todo / Export en MVP).

### Criterios de aceptación
- [ ] UI usable del flujo E2E.
- [ ] Structured por defecto; Raw sin manipulación.
- [ ] Panel de hallazgos con severidad + acción recomendada (click en error/stacktrace).

---

## Ticket 3 — Base de datos: esquema SQLite durable + session

**Tipo:** Base de datos  
**Relacionado con:** HU1 (purge splash) + HU2 (CRUD ambientes)  

### Descripción
Esquema durable (`connection_instance`, `ui_preferences`, …) + tablas de session cache; migraciones; purge efímero en splash sin borrar ambientes.

### Criterios de aceptación
- [ ] Migraciones aplicadas al iniciar.
- [ ] CRUD de ambientes funcional (paths/ids only).
- [ ] Splash purge solo `«session»`; datos duraderos recuperables tras reiniciar.
