# Data Model: Live cluster connect (008)

## Entities

### ConnectionInstance (durable)

| Field | Notes |
|-------|--------|
| id | Stable; builtin demo = `faro-demo` |
| name | Builtin display **`demo`**; others operator-chosen |
| is_builtin_demo | true only for `faro-demo` (or infer from id) |
| bastion_host, ssh_port, ssh_user, pem_path, iam_credentials_path | Live required; demo may use placeholders/fixtures |
| region_name, cluster_name | Live required |
| namespace_default | **Required non-empty for live**; demo internal sample ns |
| sort_order | Builtin forced first |

**Validation (live)**: reject empty namespace; reject delete/update of builtin demo.

### SessionEntry (runtime, per instance_id)

| Field | Notes |
|-------|--------|
| mode | `demo` \| `live` |
| catalog_epoch | UUID |
| tunnel | Option\<TunnelHandle\> with unique `local_port` |
| kube | Option\<Client\> (live only; not persisted) |
| log_cancels | per deployment/window |

### Cluster catalog (session SQLite)

Unchanged tables (`cached_*`); always scoped by `instance_id` + `catalog_epoch`. Live hydrate fills from kube for **one** namespace; demo hydrate fills samples.

## State transitions

```text
App start → splash purge session → demo present, disconnected; lives disconnected
env_connect(faro-demo) → mode=demo → hydrate_demo → connected
env_connect(other) → SSH forward → DescribeCluster+token → kube client → hydrate_live(ns) → connected
  on any live step fail → error, no demo hydrate, teardown partial tunnel
env_disconnect(id) → close tunnel/client, purge session rows for id only
catalog_refresh(id) → re-hydrate same mode (live or demo)
```

## Isolation rules

- Session cache rows always filtered by `instance_id`.
- Log streams bound to session’s kube client / demo follower.
- Multi-connect: N sessions ⇒ N tunnels ⇒ N local ports.
