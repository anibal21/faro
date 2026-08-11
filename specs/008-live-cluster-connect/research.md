# Research: Live cluster connect (008)

All Technical Context items resolved; no remaining NEEDS CLARIFICATION.

## 1. Built-in demo identity

**Decision**: Stable durable/virtual instance id `faro-demo` (display name **`demo`**), always sorted first in `env_list`. Not deletable/editable via IPC (commands reject). Never auto-connected after splash purge—operator must `env_connect("faro-demo")`.

**Rationale**: Matches clarify (always first, name demo, connect/disconnect only, disconnected at start).

**Alternatives considered**: Frontend-only fake row — breaks `env_connect` id contract; path-heuristics for demo — rejected in clarify.

## 2. Demo vs live connect branch

**Decision**:
- `faro-demo` → validate nothing remote; `hydrate_demo_catalog`; demo logs/metrics stubs as today.
- Any other `instance_id` → **live pipeline only**; on failure return error; **never** call `hydrate_demo_catalog`.

**Rationale**: FR-002a, FR-004, FR-006 / US3.

**Alternatives considered**: Fallback to demo on live failure — explicitly forbidden.

## 3. SSH tunnel

**Decision**: Real **local port-forward per session** to the EKS API endpoint (via bastion). Prefer **`russh`** with local listener + channel forward so Faro does not require a system `ssh.exe`. Allocate an unused `local_port` per `SessionEntry` (not a shared 18443). `close_tunnel` kills forward + drops session client.

**Rationale**: Multi-connect isolation; Windows-friendly packaging; constitution keeps PEM path-only.

**Alternatives considered**: System OpenSSH subprocess — OK fallback if russh blocked, but path/quoting fragile on Windows; shared single port — breaks multi-connect.

## 4. EKS auth + cluster endpoint

**Decision**: At live connect, read IAM file into memory → AWS SDK config (region from env) → `DescribeCluster(cluster_name)` for API endpoint + CA → mint EKS token (SigV4 `k8s-aws-v1.` GetCallerIdentity token, same as `aws eks get-token`) → build `kube::Config` with server `https://127.0.0.1:{local_port}`, CA data, bearer token. Discard secret strings after client built (no log/persist).

**Rationale**: Aligns with 001 research (DescribeCluster + IAM file); constitution II.

**Alternatives considered**: Shell out to AWS CLI — weaker offline/packaging; embed secrets in SQLite — forbidden; skip TLS verify — forbidden for production use.

## 5. Catalog / ConfigMaps / logs live

**Decision**:
- `hydrate_live(conn, instance_id, epoch, namespace, client)` lists Deployments + Pods + ConfigMaps **in the mandatory namespace only**; write session cache.
- ConfigMap entry bodies: lazy get on open (existing pattern) via live client.
- Logs: replace `start_demo_follow` for live sessions with kube log stream/watch fan-in per Deployment replicas; demo id keeps demo follow.
- Workload summary: live metrics if cheap/available else honest N/D—**not** fake demo numbers on live.

**Rationale**: Full feature parity (clarify Q2); namespace mandatory (Q3).

**Alternatives considered**: Catalog-only MVP — rejected by user; all-namespaces list — out of scope.

## 6. Multi-connect isolation

**Decision**: `RuntimeInner.sessions: HashMap<instance_id, SessionEntry>` already; extend `SessionEntry` with `mode`, `kube` client handle, `local_port`. All list/log commands require `instance_id` (or focused id) and use **that** entry only.

**Rationale**: Clarify Q5 — own tunnels/configs, no mixing.

**Alternatives considered**: One global client — mixes clusters; disconnect-others-on-connect — rejected.

## 7. Namespace validation

**Decision**: `env_upsert` requires non-empty `namespace_default` for non-demo environments. UI modal: namespace required. Demo may use fixed internal namespace `default` for sample data without user edit.

**Rationale**: Clarify Q3.

## 8. Testing strategy

**Decision**: Trait/`LiveCluster` abstraction with mock implementation for cargo tests; demo path integration tests unchanged; UI tests for demo row constraints + namespace required; document manual live checklist in quickstart (real bastion).

**Rationale**: Constitution V without requiring evaluators’ AWS accounts in CI.

## 9. Revising 001 “no concurrent tunnels”

**Decision**: 001 research deferred concurrent tunnels; **008 clarify overrides** — multi-connect is in scope with isolation.

**Rationale**: Product decision 2026-07-28.
