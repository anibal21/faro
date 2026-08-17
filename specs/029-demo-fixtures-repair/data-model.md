# Data Model: Demo Fixtures Repair & Rich Catalog

## FixtureAsset (repo + bundle)

| Field | Notes |
|-------|--------|
| `demo.pem` | Placeholder SSH key file; tracked; fake content |
| `demo-iam-credentials` | Optional legacy IAM demo file; fake keys |

No persisted entity — files on disk / in `$RESOURCE/fixtures/`.

## ConnectionInstance (unchanged schema)

| Field | Fixture relevance |
|-------|-------------------|
| `pem_path` | When normalized path contains `fixtures/demo.pem` → fixture-backed |
| `id` | `faro-demo` builtin always fixture-backed |

Detection via `is_fixture_backed()` — no new column.

## DemoCatalogSnapshot (session cache, per instance)

Scoped by `connection_instance_id` + `catalog_epoch`.

### Deployments (≥2)

| name | replicas | ready | available |
|------|----------|-------|-----------|
| `payments-api` | 2 | 2 | true |
| `payments-worker` | 2 | 2 | true |

### Pods (4 total)

| pod_name | deployment |
|----------|------------|
| `payments-api-7d9f8b-aaa` | payments-api |
| `payments-api-7d9f8b-bbb` | payments-api |
| `payments-worker-0` | payments-worker |
| `payments-worker-1` | payments-worker |

### Services (≥2)

| name | type | clusterIP |
|------|------|-----------|
| `payments-api` | ClusterIP | 10.96.0.10 |
| `payments-worker` | ClusterIP | 10.96.0.11 |

### ConfigMaps (≥2)

| name | entries |
|------|---------|
| `payments-config` | `application.yml`, `feature.flags` |
| `payments-secrets` | `db.url`, `api.token` |

## ConnectSession (runtime)

| Field | Fixture value |
|-------|---------------|
| `mode` | `ConnectMode::Demo` |
| `instance_id` | Per connected env |
| SSH/tunnel | Not opened |

## DemoLogStream (ephemeral)

| Field | Notes |
|-------|--------|
| `deployment` | Target deployment name |
| `pod_names` | Default fan-in: 2 synthetic suffixes `-aaa`, `-bbb` |
| persistence | RAM only (constitution IV) |

## Validation rules

- Live profile (PEM not fixture) MUST NOT receive demo catalog hydrate.
- Max 2 simultaneous connected sessions (023).
- Third connect attempt returns existing `connection_limit` error.
