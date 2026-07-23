# 4. Especificaciones de la API

> Faro **no** expone API HTTP REST al usuario final. El contrato es **Tauri IPC** (commands + events).  
> Fuente: [`specs/001-eks-log-monitor/contracts/tauri-commands.md`](specs/001-eks-log-monitor/contracts/tauri-commands.md).  
> Sync plan 2026-07-23: splash purge + catálogo session-cache.

**Reglas transversales**

- Solo conexiones a bastión/EKS configurados por el usuario.
- Sin operaciones Kubernetes de mutación en v1.
- Errores accionables **sin** material secreto en mensajes.
- `analyze_write_group` **no** envía payload fuera de la máquina.

---

## 4.1. Ambientes

### `env_list` → `ConnectionInstance[]`

Lista perfiles persistidos (durables).

### `env_upsert`

- **Entrada:** campos del modelo (paths/identificadores). Rechaza PEM/IAM paths vacíos; nunca acepta cuerpo PEM ni valores secretos IAM.
- **Salida:** instancia creada/actualizada.
- **Formulario:** PEM + SSH + ruta IAM + `region_name` + `cluster_name`.

### `env_delete` (id)

### `env_load` (ids: UUID[])

Añade ambientes al conjunto **cargado** (sidebar). No implica conectar.

### `env_set_active` (id)

Marca ambiente activo; invalida sesiones live previas.

### `env_connect` / `env_disconnect`

Abre o cierra túnel SSH + cliente kube del ambiente activo. Al conectar: lee archivo IAM → token EKS usando `region_name` + `cluster_name`; hydrate de catálogo a tablas `«session»` (1×). Al desconectar: limpia cache de sesión de ese ambiente.

### `session_purge_ephemeral` (splash)

Durante la ventana mínima de arranque: borra residuos `«session»`/logs efímeros de un cierre sucio. **No** borra `connection_instance`, prefs ni historial ligero. Luego se abre la ventana principal.

---

## 4.2. Catálogo (solo lectura)

Tras hydrate, la UI **debe** preferir el cache SQLite de la sesión (`catalog_epoch` actual). Re-list live solo en hydrate / `catalog_refresh`.

| Command | Entrada | Salida |
|---------|---------|--------|
| `k8s_list_deployments` | `namespace?` | `DeploymentArtifact[]` (preferir cache) |
| `k8s_list_configmaps` | `namespace?` | `ConfigMapArtifact[]` (preferir cache) |
| `k8s_get_configmap` | `namespace`, `name` | keys/values (truncado; 1ª apertura llena `cached_configmap_entry`) |
| `catalog_refresh` | — | Nuevo `catalog_epoch`; reemplaza filas session del ambiente activo |

---

## 4.3. Logs

### `logs_open` (namespace, deployment)

Inicia follow agregado de réplicas → emite eventos `logs_chunk`.

### `logs_close` (window_id)

### `logs_set_view` (window_id, `structured` \| `raw`)

Solo modo UI; el stream continúa.

**Events**

| Evento | Contenido |
|--------|-----------|
| `logs_chunk` | payloads de escritura + identidad de pod + timestamps si hay |
| `logs_status` | following / idle / error / no pods |

Frontend: Structured agrupa por frontera de escritura; Raw renderiza texto/bytes **sin manipulación**. Buffers en **RAM** (no SQLite).

---

## 4.4. Análisis

### `analyze_write_group` (payload: texto del write-group)

Ejecuta reglas Spring Boot locales → `AnalysisFinding[]` (puede ser vacío). Opcional: resumen ligero a `analysis_finding_history` (sin cuerpo de stacktrace).

---

## 4.5. Preferencias y arranque

### `prefs_get` / `prefs_set`

Incluye `theme: light | dark`, `last_active_instance_id`.

### Secuencia de launch

1. Mostrar splash (`01-splash-preparing` intent; BG image en implement).  
2. `session_purge_ephemeral`.  
3. Abrir ventana principal (empty o prefs).

---

## Ejemplo (estilo OpenAPI-like) — `env_connect`

```yaml
operationId: env_connect
summary: Túnel SSH + cliente kube para el ambiente activo
requestBody:
  content:
    application/json:
      schema:
        type: object
        required: [instance_id]
        properties:
          instance_id: { type: string, format: uuid }
responses:
  "200":
    description: connected + catalog hydrated
    content:
      application/json:
        schema:
          type: object
          properties:
            status: { enum: [connected] }
            cluster_name: { type: string }
            catalog_epoch: { type: string }
  "4xx":
    description: túnel / credenciales / TLS (mensaje sin secretos)
```

Schemas JSON completos se fijan al implementar commands.
