# Contract: Combined export

## Scope

Export from a **combined / fan-in** log tab MUST include Raw lines for **all pods** present in that tab’s chunk buffer after exhaust gather (012).

## Acceptance check

Given chunks from pods `A` and `B` of the same Deployment, `buildRawLogExport(chunks)` contains both `A` and `B` as pod name tokens.

## Non-goals

- Separate per-replica export files.
- Changing ConfigMap export.
