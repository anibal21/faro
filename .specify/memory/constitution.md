<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0 (MINOR: Principle II — live connect via bastion; IAM file optional/legacy)
- Modified principles: II. Credential & Secret Hygiene
- Added: none
- Removed sections: none
- Templates: plan Constitution Check still valid (PEM path-only / no secret persistence)
- Follow-up TODOs: none
-->

# Faro Constitution

## Core Principles

### I. Spec-Driven Development
All product work MUST follow Spec Kit order: constitution → specify →
(clarify) → plan → tasks → implement → converge. Code MUST NOT land without
an approved spec/plan for that scope. Human review MUST approve each phase
gate before advancing. Rationale: Faro is an AI4Devs E2E project; SDD keeps
scope honest and artifacts auditable.

### II. Credential & Secret Hygiene
The app MUST store only local **paths** (PEM path required for live SSH;
IAM credentials file path is **optional/legacy** and unused for live connect)
and non-secret identifiers (region, cluster name, bastion host), never PEM
contents, AWS access keys/secrets, or tokens in repo, config commits, or
SQLite dumps shared outside the machine. Live connect MUST obtain cluster
endpoint/CA and the Kubernetes bearer token via the **bastion** identity
(not by reading a laptop IAM credentials file). Faro MUST NOT persist those
secret values. TLS to the EKS API MUST use the cluster CA; production use
MUST NOT enable insecure TLS skip. Rationale: bastion + EKS credentials are
high-impact; colleagues should need only PEM + form identifiers.

### III. Read-Only Cluster Boundary (v1)
v1 MUST only perform read/observe operations against Kubernetes:
`get`/`list`/`watch` on pods and `get` on pods/log (and equivalent describe
reads needed to list). Exec, apply, delete, scale, and other mutating cluster
actions are OUT OF SCOPE for v1. Rationale: reduce blast radius while the
product proves value as a log viewer/analyzer.

### IV. Local-First, Deterministic Analysis
Persistence MUST use local SQLite for profiles, UI prefs, and light history.
Full log dumps MUST NOT be persisted in v1. Log analysis in v1 MUST use a
**local rules engine** (patterns + recommended actions), not generative AI
inside the product. Rationale: predictable offline behavior, lower risk, and
clear MVP scope.

### V. Quality & Demonstrability
Every Must-Have user story MUST be covered by automated tests
(unit and/or integration as appropriate). The primary E2E flow
(profile → connect → list → logs → analyze) MUST have at least one E2E test.
The deliverable MUST be demonstrable as a desktop app (installable or
`tauri dev`); a public URL is NOT required if evaluators can see it work.
Rationale: AI4Devs requires executable, tested software—not docs alone.

### VI. No Credential or User-Data Exfiltration (NON-NEGOTIABLE)
Faro, as a product, MUST NOT send user-provided credentials outside the
application to any third party, vendor backend, analytics, LLM API, crash
reporter, or Faro-operated service. Credentials include PEM material, SSH
passphrases, AWS keys/tokens, kube tokens, and equivalent secrets the user
supplies or that Faro derives for the user session.

User-loaded and user-domain data (connection profiles, cluster metadata the
user fetched for their own use, pod lists, log contents, analysis results
stored locally) MUST remain under the user's control on their machine and on
**only** the infrastructure endpoints the user configured (e.g. their bastion
and EKS API). Faro MUST NOT upload that data to external systems for
telemetry, training, support, or product analytics.

The **only** information that MAY leave the application toward
non-user-configured destinations is **information about the tool itself**
(e.g. Faro version string for an optional update check). Such egress MUST
NOT include credentials, profiles, hostnames of user bastions/clusters, logs,
or other user-domain payloads.

Allowed network use for product function: connections the user explicitly
configured (SSH to bastion, HTTPS to their EKS API via the tunnel). That is
user-domain traffic, not exfiltration.

Rationale: Faro is a trust boundary for ops credentials; any phone-home of
secrets or cluster data is an unbreakable prohibition.

## Product & Stack Constraints

- **Product**: Faro — desktop log viewer for EKS via SSH bastion
  (*Ilumina los logs. Gobierna el cluster.*).
- **Stack (v1)**: Tauri 2 + React + TypeScript + Vite; Rust commands;
  SQLite (`tauri-plugin-sql`); kube client; IAM credentials **file path**
  for EKS token (read at connect); SSH tunnel with PEM path.
- **Platforms**: Windows, macOS, and Linux MUST remain design targets;
  Windows-first packaging is acceptable for early demos.
- **Out of scope v1**: generative chat in-app, multi-cluster advanced UX,
  mutating cluster ops, replacing CloudWatch/OpenSearch as historical store,
  any SaaS backend that receives user credentials or user cluster/log data.
- **Seed decisions**: `docs/SPEC.md` is the product seed until superseded by
  Spec Kit `specs/` artifacts after `/speckit-specify` and `/speckit-plan`.

## Dual Documentation & Workflow

- **Spec Kit** owns technical truth under `.specify/` and `specs/`.
- **AI4Devs delivery** owns evaluator-facing docs: `readme.md`,
  `0`–`7-*.md`, `prompts.md` (Example1 index). Spec Kit does NOT replace them.
- After each approved Spec Kit phase, maintainers MUST sync the matching
  AI4Devs docs (specify → product/HU; plan → architecture/data/API;
  tasks → tickets; implement → PRs/testing).
- Workflow rule: discuss → decide → Spec Kit step → review → sync docs.
  One implementation task/PR at a time after documentation phases for the
  current delivery. First delivery targets architecture-oriented docs through
  **plan** (and optionally **tasks**), not full **implement**.
- Process detail: `prompts-flujo-trabajo-speckit.md`.

## Governance

This constitution supersedes informal chat decisions when they conflict.
Amendments MUST: (1) update this file, (2) bump `CONSTITUTION_VERSION`
(MAJOR = remove/redefine principles; MINOR = add/expand; PATCH = clarify),
(3) set **Last Amended** to the change date, (4) re-check plan/spec/tasks
templates' Constitution Check, (5) note the change in `prompts.md` when AI
assisted the amendment.

PRs and Spec Kit phase reviews MUST verify compliance with principles II–VI
before merge or phase approval. Principle **VI** is non-negotiable and MUST
NOT be waived via Complexity Tracking. Complexity beyond the stack above MUST
be justified in the plan's Complexity Tracking table (except VI).

Guidance: `docs/SPEC.md`, `readme.md`, and this constitution.

**Version**: 1.2.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-07-30
