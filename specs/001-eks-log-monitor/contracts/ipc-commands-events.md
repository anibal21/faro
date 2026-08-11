# Contracts: Comandos y eventos IPC (Tauri)

**Feature**: 001-eks-log-monitor  
**Audience**: Frontend (React/TS) ↔ Backend (Rust)  
**Transporte**: Tauri IPC — **no HTTP**.  
**Network**: Commands MUST only open connections to user-configured bastion/EKS. No third-party telemetry payloads.

All mutating Kubernetes operations are **forbidden** in v1.

## Commands vs Events

| Tipo | Quién inicia | Patrón | Uso en Faro |
|------|--------------|--------|-------------|
| **Command** | UI (`invoke`) | request → response | CRUD, connect, analyze, purge |
| **Event** | Rust (`emit`) | push 0..N | Stream de logs / status |

```text
UI  --invoke(command, args)-->  Rust
UI  <-- Result / Error --------  Rust

Rust --emit(event, payload)-->  UI (listen)
```

---

## Mapa de commands (invoke)

| Command | Grupo | In | Out | Notas |
|---------|-------|----|-----|-------|
| `session_purge_ephemeral` | Startup | — | `{ purged: bool }` | Splash; solo tablas `«session»` |
| `env_list` | Ambientes | — | `ConnectionInstance[]` | Durable |
| `env_upsert` | Ambientes | campos data-model | `ConnectionInstance` | paths only; CRUD C/U |
| `env_delete` | Ambientes | `id` | — | CRUD D |
| `env_load` | Ambientes | `ids[]` | — | Sidebar; no connect |
| `env_set_active` | Ambientes | `id` | — | Invalida live previo |
| `env_connect` | Ambientes | `instance_id?` | `{ status, cluster_name, catalog_epoch }` | Túnel + hydrate 1× |
| `env_disconnect` | Ambientes | — | — | Tear-down + purge session del ambiente |
| `k8s_list_deployments` | Catálogo | `namespace?` | `DeploymentArtifact[]` | Preferir cache |
| `k8s_list_configmaps` | Catálogo | `namespace?` | `ConfigMapArtifact[]` | Preferir cache |
| `k8s_get_configmap` | Catálogo | `namespace`, `name` | keys/values | Lazy fill entries |
| `catalog_refresh` | Catálogo | — | `{ catalog_epoch }` | Nuevo epoch |
| `logs_open` | Logs | `namespace`, `deployment` | `{ window_id }` | Luego emite events |
| `logs_close` | Logs | `window_id` | — | Para el stream |
| `logs_set_view` | Logs | `window_id`, `structured\|raw` | — | UI only |
| `analyze_write_group` | Análisis | `{ text }` | `AnalysisFinding[]` | Local; no egress |
| `prefs_get` | Prefs | — | prefs map | theme, last_active… |
| `prefs_set` | Prefs | `{ key, value }` | — | |

### Detalle — Ambientes

**`env_upsert`**: Reject empty `pem_path` / `iam_credentials_path`; never accept PEM body or IAM secret values. Required: bastion SSH fields, `region_name`, `cluster_name`.

**`env_connect` / `env_disconnect`**: On connect — read IAM file in memory → EKS token; mint `catalog_epoch`; hydrate session-cache. On disconnect — DELETE session rows for that instance. Errors: actionable, no secrets.

**`session_purge_ephemeral`**: Splash; DELETE `«session»` only; KEEP durable environments/prefs/history.

### Detalle — Catálogo

UI SHOULD read SQLite session cache after hydrate. Live K8s only for hydrate / `catalog_refresh`.

### Detalle — Logs + Analysis

`logs_open` starts follow → events below. Frontend builds Structured write-groups; Raw unmodified. `analyze_write_group` MUST NOT send payload off-machine.

---

## Mapa de events (emit → listen)

| Event | Tras command | Payload | Notas |
|-------|--------------|---------|-------|
| `logs_chunk` | `logs_open` (mientras follow) | write payload + `pod_name` + timestamp? | Stream continuo |
| `logs_status` | `logs_open` / lifecycle | `following` \| `idle` \| `error` \| `no_pods` | Estado del follow |

No hay events para CRUD de ambientes: esas operaciones son solo commands request/response.

---

## Secuencias IPC (resumen)

### A — Arranque

```text
UI: show splash
UI --invoke session_purge_ephemeral--> Rust
UI <-- ok --
UI: open main window
```

### B — CRUD ambiente

```text
UI --invoke env_upsert--> Rust --> SQLite durable
UI <-- ConnectionInstance --
UI --invoke env_list--> Rust
UI <-- ConnectionInstance[] --
```

### C — Connect + catálogo

```text
UI --invoke env_connect--> Rust --> SSH / IAM / EKS
UI <-- { connected, catalog_epoch } --
UI --invoke k8s_list_deployments--> Rust --> SQLite session (prefer)
UI <-- DeploymentArtifact[] --
```

### D — Logs (command + events)

```text
UI --invoke logs_open--> Rust --> kube follow
UI <-- { window_id } --
Rust --emit logs_status(following)--> UI
Rust --emit logs_chunk--> UI   (N veces)
UI --invoke logs_close--> Rust
```

### E — Análisis

```text
UI --invoke analyze_write_group--> Rust --> rules engine
UI <-- AnalysisFinding[] --
```

Diagrama visual: [`docs/architecture/05-ipc-commands-events.drawio`](../../../docs/architecture/05-ipc-commands-events.drawio).

---

## App launch sequence

1. Show minimal splash (`01-splash-preparing.svg` intent).  
2. `session_purge_ephemeral`.  
3. Open main window → empty workspace or restore prefs (environments still present).
