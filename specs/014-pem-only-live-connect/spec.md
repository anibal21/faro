# Feature Specification: PEM-Only Live Connect

**Feature Branch**: `014-pem-only-live-connect`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Live connect sin archivo IAM local: discovery EKS vía bastion. Quitar Credenciales IAM; describe-cluster + get-token vía bastion; distribuir solo PEM + datos del formulario; demo sin cambios; sin SSO/~/.aws; migración legacy IAM ignorada."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create or edit a live environment without IAM file (Priority: P1)

An operator (or someone distributing Faro to colleagues) creates or edits a live environment using only: name, bastion host, SSH port, SSH user, PEM path (with browse), region, cluster name, and namespace. There is no “IAM credentials path” field to fill.

**Why this priority**: Removes the main distribution and expiry pain for non-AWS users.

**Independent Test**: Open New/Edit environment → form has no IAM credentials field → save with PEM + bastion/region/cluster/namespace succeeds.

**Acceptance Scenarios**:

1. **Given** the new-environment form, **When** an operator fills required fields without any cloud credentials file path, **Then** they can save the environment successfully.
2. **Given** an existing environment that previously stored an IAM credentials path, **When** an operator opens edit, **Then** they can save changes without providing or updating any IAM credentials path.
3. **Given** the new/edit form, **When** displayed, **Then** no control asks for an IAM/credentials file path.

---

### User Story 2 — Connect live using only PEM and form identifiers (Priority: P1)

An operator connects a live environment. Faro opens the SSH tunnel with the PEM and obtains cluster endpoint, certificate authority material, and the Kubernetes session credential using the **bastion’s** cloud identity and tools—not a credentials file on the laptop. Catalog and logs work as today.

**Why this priority**: Core outcome—colleagues with only PEM + form data can access.

**Independent Test**: Live environment with PEM + form fields only (no laptop credentials file) → Connect → catalog hydrates and logs can be opened.

**Acceptance Scenarios**:

1. **Given** a live environment configured with PEM and bastion/region/cluster/namespace only, **When** the operator connects, **Then** Faro reaches the cluster and shows the catalog without reading any local cloud credentials file.
2. **Given** a successful connect, **When** the operator opens combined or pod logs as today, **Then** live follow works under the same session.
3. **Given** the bastion cannot resolve cluster metadata or mint a session credential (missing tools, wrong region/cluster, or insufficient bastion permissions), **When** connect fails, **Then** the operator sees a clear actionable error that does not reveal PEM contents or session tokens.

---

### User Story 3 — Built-in demo unchanged (Priority: P2)

An operator uses the built-in demo environment without bastion, PEM, or any cloud credentials.

**Why this priority**: Demo remains the zero-setup path for evaluation.

**Independent Test**: Connect demo → sample catalog/logs; no bastion or credentials file required.

**Acceptance Scenarios**:

1. **Given** the built-in demo environment, **When** the operator connects, **Then** demo catalog/logs work as before without bastion or cloud credential files.

---

### User Story 4 — Legacy environments still open (Priority: P2)

Environments saved under the old model (with an IAM credentials path on disk) still appear and can be connected after this change; the stored IAM path is ignored for connect.

**Why this priority**: No broken installs for existing users.

**Independent Test**: Load a previously saved environment that has an IAM path → connect succeeds using bastion discovery (path unused).

**Acceptance Scenarios**:

1. **Given** a stored environment that still has a legacy IAM credentials path value, **When** the operator connects, **Then** connect does not require that file to exist or be valid.
2. **Given** such an environment, **When** the operator edits and saves, **Then** save succeeds without restoring an IAM field as required input.

---

### Edge Cases

- Bastion reachable by SSH but cloud CLI missing or `describe-cluster` / session credential command fails → connect fails with clear message; tunnel cleaned up.
- Wrong region or cluster name → clear failure; no partial “connected” state with broken catalog.
- PEM path missing or unreadable → same path validation as today; no secret contents in errors.
- Network cannot reach bastion → clear connectivity error.
- Operator still has a local credentials file on disk but does not configure it in Faro → Faro must not require or read it for live connect.
- Cluster authorization remains the bastion identity; laptop user IAM mapping is not required (unchanged product rule).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Creating or editing a live environment MUST NOT require an IAM/cloud credentials file path.
- **FR-002**: The new/edit environment UI MUST omit the IAM credentials path control; required live fields remain name, bastion host, SSH port, SSH user, PEM path, region, cluster name, and namespace.
- **FR-003**: Live connect MUST obtain cluster endpoint and certificate authority material via the bastion (same SSH/PEM path used for the tunnel), not via a laptop credentials file.
- **FR-004**: Live Kubernetes session credentials MUST continue to be obtained via the bastion identity path (unchanged product rule).
- **FR-005**: Live connect MUST succeed when only PEM path plus bastion/region/cluster/namespace identifiers are configured—no local cloud credentials file.
- **FR-006**: On connect failure related to bastion discovery or session credential minting, Faro MUST show actionable errors that MUST NOT include PEM file contents, cloud secret values, or raw session tokens.
- **FR-007**: The built-in demo environment MUST continue to connect without bastion or cloud credentials.
- **FR-008**: Environments that still store a legacy IAM credentials path MUST remain loadable and connectable; that path MUST NOT be required or used for live connect.
- **FR-009**: Catalog hydration and live log follow after connect MUST behave as in the current product once the session is established.
- **FR-010**: Faro MUST NOT introduce SSO start URLs, Identity Center login, or reading of the user’s `~/.aws` directory as part of this feature.
- **FR-011**: Faro MUST NOT persist PEM contents, cloud secret keys, or session tokens in durable storage; PEM remains path-only.
- **FR-012**: Cluster access remains read/observe only; this feature MUST NOT add mutating cluster operations.

### Key Entities

- **Connection environment (live)**: Named access profile with bastion SSH fields, PEM **path**, region, cluster name, and namespace. IAM credentials path is no longer a required attribute for operators.
- **Legacy IAM path**: Optional leftover value on older saved environments; ignored at connect.
- **Bastion-mediated cluster discovery**: Endpoint and CA obtained through the bastion using the operator’s configured region and cluster name.
- **Live session**: Tunnel + Kubernetes client established after successful discovery and bastion-minted session credential.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of acceptance checks, a live environment can be saved without providing any cloud credentials file path.
- **SC-002**: An operator with only PEM + form identifiers (no laptop credentials file) completes Connect → catalog visible on first successful attempt in the test plan when bastion discovery works.
- **SC-003**: After connect, opening logs for a known workload succeeds under the same session without asking for cloud credentials files.
- **SC-004**: Connect failures from bastion discovery/session issues show a user-visible error in 100% of forced-failure trials, and spot-checks find no PEM body or session token material in that message.
- **SC-005**: Built-in demo connect remains successful without bastion or credentials files in 100% of demo trials.
- **SC-006**: A previously saved environment that still contains a legacy IAM path connects successfully without that file being present (when bastion discovery works) in the migration test plan.

## Assumptions

- Target bastions already have cloud tooling and permissions equivalent to successful `describe-cluster` and session-credential minting for the configured region/cluster (verified on the operator’s bastion before this feature).
- Distributing Faro to colleagues means sharing the PEM and non-secret form values out of band; packaging/installer for PEM distribution is out of scope.
- Possession of the PEM grants bastion-equivalent cluster visibility; org access control is “who gets the PEM,” not per-laptop IAM users.
- Existing browse-PEM UX remains; only the IAM path control is removed from the required operator path.
- Constitution secret hygiene continues to apply: paths and identifiers only in durable storage; no exfiltration of user credentials or cluster data.

## Out of Scope

- AWS IAM Identity Center / SSO login or silent refresh from portal URLs or `~/.aws`.
- Changing which AWS/Kubernetes identity authorizes cluster reads (remains bastion identity).
- Installer or secure delivery channel for PEM files.
- Removing PEM or SSH from the connect model.
- Mutating Kubernetes or AWS resources.
