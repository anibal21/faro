# 6. Tickets de trabajo

> Documentar ≥3 tickets: backend, frontend y base de datos (como en Example1). Completar con estimación y detalle al ejecutar Spec Kit `/tasks`.

---

## Ticket 1 — Backend: túnel SSH + cliente EKS/kube

**Tipo:** Backend (Rust / Tauri)  
**Relacionado con:** HU-2  

### Descripción
Implementar commands para abrir túnel SSH con `.pem`, leer archivo IAM (ruta) → token EKS (`region_name` + `cluster_name`) y listar pods / stream de logs vía kube API en localhost.

### Criterios de aceptación
- [ ] Túnel estable con ambiente de prueba.
- [ ] Token EKS desde archivo IAM (path); sin persistir Access Key/Secret.
- [ ] `k8s_list_deployments` / logs operativos.
- [ ] Errores tipados y visibles en UI (sin secretos en mensajes).

---

## Ticket 2 — Frontend: visor de logs + Analizar

**Tipo:** Frontend (React)  
**Relacionado con:** HU-3  

### Descripción
Pantallas de explorador y visor: lista de pods, buffer de logs, búsqueda y botón Analizar con panel de hallazgos.

### Criterios de aceptación
- [ ] UI usable del flujo E2E.
- [ ] Orden por timestamp / búsqueda.
- [ ] Panel de hallazgos con severidad + acción recomendada.

---

## Ticket 3 — Base de datos: esquema SQLite y perfiles

**Tipo:** Base de datos  
**Relacionado con:** HU-1  

### Descripción
Esquema `profiles`, `ui_prefs`, `favorites`, `analysis_history`; migraciones y carga al arranque.

### Criterios de aceptación
- [ ] Migraciones aplicadas al iniciar.
- [ ] CRUD de perfiles funcional.
- [ ] Datos recuperables tras reiniciar la app.
