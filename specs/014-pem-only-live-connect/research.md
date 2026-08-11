# Research: 014-pem-only-live-connect

## Decision: Bastion `describe-cluster` via existing `ssh_exec`

**Rationale**: `mint_eks_token_via_bastion` already runs `aws eks get-token` over SSH with PEM. Endpoint/CA can use the same path with `aws eks describe-cluster --region … --name … --output json`, parsing `/cluster/endpoint` and `/cluster/certificateAuthority/data` (same JSON pointers as today’s local describe). Operator-verified on target bastion.

**Alternatives considered**:
- Keep local IAM file for describe only — rejected (expiry / distribution pain).
- SSO / `~/.aws` on laptop — out of scope.
- Embed static endpoint/CA in the environment form — brittle across cluster recreate; more operator knowledge.

## Decision: Connect sequence

**Rationale**: Tunnel needs API host from describe. Order:

1. Validate PEM path + required identifiers (no IAM file).
2. `describe_cluster_endpoint_via_bastion` → `(api_host, ca_b64)`.
3. `open_tunnel` to `api_host`.
4. `mint_eks_token_via_bastion`.
5. Build kube client + hydrate catalog.
6. On any step failure after tunnel open → close tunnel (existing pattern).

**Alternatives considered**: Open tunnel first — impossible without host. Parallel describe+token — token doesn’t need tunnel but describe must precede tunnel; sequential is clearer for errors.

## Decision: Soft-deprecate `iam_credentials_path`

**Rationale**: Column stays (`TEXT NOT NULL` can store `""` for new rows). Upsert stops `require_non_empty` on IAM. Connect never calls `validate_iam_credentials_file` or local `describe_cluster_endpoint(..., iam_path)`. UI removes IAM controls. Legacy non-empty values ignored (FR-008).

**Alternatives considered**:
- SQLite migration DROP COLUMN — unnecessary risk.
- Keep hidden required placeholder path — confuses distribution story.

## Decision: Error hygiene

**Rationale**: Reuse / extend `sanitize_aws_stderr` for bastion describe failures; never echo PEM bodies or token strings in `FaroError::Message`.

**Alternatives considered**: Raw AWS stderr to UI — rejected (constitution II/VI).

## Decision: Constitution II sync

**Rationale**: Product principle “paths only, no secret persistence” remains; connect-time **IAM file read** is retired for live. Plan AI4Devs + constitution amend note (MINOR): live connect uses bastion identity for describe + token; PEM path remains required.

**Alternatives considered**: Block feature until constitution amended first — rejected; plan documents justified gate + docs sync in tasks.

## Decision: Tests

**Rationale**:
- Cargo: JSON parse helpers for describe response; command string uses `--name` (not wrong flags); sanitize tests.
- Vitest: modal has no IAM label/control; save payload omits required IAM or sends empty.
- Assert connect command source / unit: no `validate_iam_credentials_file` on live path.
- Manual quickstart on real bastion (already proven CLI).

**Alternatives considered**: Full mocked SSH integration in CI — heavier; optional later.
