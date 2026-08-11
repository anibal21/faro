# Contract: Fixture env hydrate

## Behavior

When connecting an environment marked as test-fixture (or builtin demo):

1. `ConnectMode::Demo` (or equivalent offline path).
2. `hydrate_demo_catalog(conn, instance_id, catalog_epoch)` for **that** `instance_id`.
3. Logs/YAML/metrics demo helpers keyed by session as today.

## Multi-env

Two fixture-backed instances A and B → both hydrate; catalog rows scoped by `connection_instance_id`; tabs remain instance-scoped (023).

## Live envs

Real bastion/PEM profiles MUST NOT take Demo hydrate.

## Restore / “Usar fixtures”

Creating or updating an env via fixtures sets the test-fixture marker (or paths) so subsequent connect hydrates that env.
