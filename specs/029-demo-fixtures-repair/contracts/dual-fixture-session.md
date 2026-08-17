# Contract: Dual fixture session

Extends [024 fixture-env-hydrate](../../024-env-test-polish/contracts/fixture-env-hydrate.md) with repair/regression guarantees.

## Setup

1. Create environment **A** via **Usar fixtures demo** → save with unique name.
2. Create environment **B** the same way → save with different name.
3. Both profiles MUST have `pem_path` containing `fixtures/demo.pem` (or packaged equivalent).

## Connect behavior

| Step | Expected |
|------|----------|
| Connect A | Demo mode; catalog rows keyed `connection_instance_id = A` |
| Connect B (A still connected) | Both sessions active; B gets own catalog rows |
| Connect C (A+B connected) | Error `connection_limit` (Spanish message) |

## Isolation

- Opening `payments-api` logs on A and B yields **two tabs** with distinct `instance_id` in nav keys (023).
- Catalog list for focused env shows only that instance's cached rows.
- No SSH tunnel or live `describe-cluster` for either profile.

## Regression checks

- Fresh git clone with tracked `fixtures/demo.pem`: preload works without manual file creation.
- Installed build (post-bundle): preload resolves PEM from `$RESOURCE/fixtures/`.
