# Contract: Rich demo catalog hydrate

## Trigger

On connect when `is_fixture_backed(env)` OR builtin `faro-demo`:

1. `ConnectMode::Demo`
2. `hydrate_demo_catalog(conn, instance_id, catalog_epoch)` for **that** `instance_id`
3. `session_cache::purge_for_instance` before insert

## Minimum catalog counts (post-hydrate)

| Entity | Min count | Notes |
|--------|-----------|--------|
| Deployments | 2 | `payments-api`, `payments-worker` |
| Pods per deployment | 2 | Each deployment shows 2/2 |
| Services | 2 | api + worker |
| ConfigMaps | 2 | config + secrets |
| ConfigMap entries | 2 per map | 4 total entries |

## Demo YAML helper

`demo_deployment_yaml(namespace, name)` MUST declare `replicas: 2` and matching `status.readyReplicas: 2` for demo deployments.

## Demo logs alignment

When following logs for a deployment without explicit pod:

- Emit chunks tagged with **exactly two** pod name patterns: `{deployment}-aaa`, `{deployment}-bbb`
- `load_older_demo` MUST use the same two-pod set

## Live env exclusion

Profiles whose PEM path does NOT match fixture detection MUST use `hydrate_live_catalog` only — never this contract.
