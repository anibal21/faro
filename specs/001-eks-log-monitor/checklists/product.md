# Product Requirements Checklist: Faro MVP

**Purpose**: Validate clarity, completeness, and consistency of Faro product requirements before implementation.
**Created**: 2026-07-22  
**Reviewed**: 2026-07-23 — mapped to formal [`spec.md`](../spec.md) (US1–US10, FR-001–026, SC-001–009) + plan/AI4Devs sync  
**Feature**: [`specs/001-eks-log-monitor/spec.md`](../spec.md)  
**Depth**: Standard  
**Audience**: Author / Reviewer at implement gate  
**Decisions locked for this checklist**:
- Q1-C: MVP components = **Pods + ConfigMaps** (other AWS/K8s types = future vision)
- Q2-B: Logs grouped by **Deployment / workload** (“una sola ventanilla por artefacto”)
- Q3-C: **Log export OUT OF SCOPE** for v1 (user’s own responsibility outside Faro)

**Status**: ✓ PASS (48/48) — residual gaps closed in spec review 2026-07-23 (severity enum, follow resume FR-026, Deployment discovery assumption).

---

## Requirement Completeness

- [x] CHK001 - Are desktop packaging requirements defined for **Windows, macOS, and Linux** executables/installers as Must vs Windows-first demo? [Completeness] → **US10, FR-015, SC-007** (Must all three OS; demo Windows-first acceptable)
- [x] CHK002 - Are **connection instance** requirements complete (create/edit/delete/select N bastion+PEM+AWS+cluster profiles)? [Completeness] → **US2, FR-001–003** (IAM = credentials **file path**, not in-app secrets)
- [x] CHK003 - Is the MVP component catalog explicitly limited to **Pods + ConfigMaps**, with other types (queues, events, etc.) labeled Out of Scope / future? [Completeness] → **FR-005 + Out of Scope**
- [x] CHK004 - Are ConfigMap visualization requirements specified (list fields, namespace scope, read-only view contents)? [Completeness] → **US6, FR-011** (+ truncate large/binary)
- [x] CHK005 - Are requirements defined for choosing **component type** in the UI before listing artifacts? [Completeness] → **FR-005**
- [x] CHK006 - Are live log-follow requirements specified for **each open artifact log window** (must update as pods write logs)? [Completeness] → **US7, FR-008, SC-003**
- [x] CHK007 - Are Spring Boot rules-engine requirements specified (min rule count, match fields, output shape)? [Completeness] → **FR-012–014, SC-004** (≥5 patterns; severity + explanation + action)
- [x] CHK008 - Is the **non-technical explanation** format required (qué pasó / qué significa / qué hacer) documented as acceptance content? [Completeness] → **FR-013, SC-005** (panel finding shape)
- [x] CHK009 - Is multi-environment access (N connection instances per user) specified with simultaneous vs one-active-connection rules? [Completeness] → **US3 + Assumptions** (N loaded, **one active**)
- [x] CHK010 - Is “log export to text file” explicitly documented as **Out of Scope v1**? [Completeness] → **FR-017 + Out of Scope**

## Requirement Clarity

- [x] CHK011 - Is “artefacto” defined (Deployment? Service? app label?) for the single log window? [Clarity] → **Key Entities + Assumptions** = Deployment/workload
- [x] CHK012 - Is aggregation across replicas specified (how lines are merged, labeled by pod name, ordered)? [Clarity] → **FR-007, SC-002**
- [x] CHK013 - Is behavior defined when a Deployment has 0 ready pods or scaling to zero? [Clarity] → **Edge Cases + FR-026 / `no_pods` status**
- [x] CHK014 - Is “todos los pods del cluster que tiene acceso el bastión” scoped (cluster-wide vs selected namespaces)? [Clarity] → **Assumptions** (listable namespaces + optional filter)
- [x] CHK015 - Are PEM/SSH/AWS fields for a connection instance enumerated unambiguously? [Clarity] → **FR-002** (host, port, user, pem_path, iam_credentials_path, region_name, cluster_name; optional namespace)
- [x] CHK016 - Is “motor de reglas por tipo de tecnología” clear that **only Spring Boot** ships in MVP? [Clarity] → **Out of Scope** (Flask/NestJS future only)
- [x] CHK017 - Is “configuración” disambiguated as **ConfigMaps** (K8s)? [Clarity] → **FR-011 + Key Entities**
- [x] CHK018 - Are severity levels for rule hits enumerated with definitions? [Clarity] → **FR-013** (`critical` | `warn` | `info`)

## Requirement Consistency

- [x] CHK019 - Do HU drafts align with Deployment-aggregated “una ventanilla”? [Consistency] → **US5/US7** (no per-pod window model)
- [x] CHK020 - Does E2E use Deployment/artefacto (+ ConfigMaps)? [Consistency] → **US5–US8** + SC-001
- [x] CHK021 - Is live follow Must-Have consistent? [Consistency] → **FR-008 Must** (P1 US7)
- [x] CHK022 - Does excluding export stay consistent with constitution IV? [Consistency] → **FR-017** + no log dumps in SQLite (data-model)
- [x] CHK023 - Are ConfigMap reads consistent with constitution III (read-only)? [Consistency] → **FR-011** + Out of Scope mutations
- [x] CHK024 - Are rules-engine requirements consistent with constitution IV (local, no generative AI)? [Consistency] → **FR-014**

## Acceptance Criteria Quality

- [x] CHK025 - Can “una sola ventanilla por artefacto” be objectively tested? [Measurability] → **SC-002**
- [x] CHK026 - Are acceptance criteria defined for opening **multiple** artifact log windows with concurrent follow? [Acceptance] → **FR-009, US7 A4**
- [x] CHK027 - Are acceptance criteria for Spring Boot analysis measurable? [Measurability] → **SC-004**
- [x] CHK028 - Are packaging acceptance criteria measurable per OS? [Measurability] → **SC-007** + FR-015 formats note
- [x] CHK029 - Are connection-instance acceptance criteria measurable (persist; paths only)? [Measurability] → **SC-006, FR-003**

## Scenario Coverage

- [x] CHK030 - Are primary-flow requirements complete: instance → connect → Pods/ConfigMaps → logs → analyze? [Coverage] → **US2–US8 + SC-001**
- [x] CHK031 - Are alternate-flow requirements defined for switching connection instance / environment? [Coverage] → **US3** (invalidate live windows)
- [x] CHK032 - Are exception-flow requirements defined for bad PEM, bastion down, expired AWS creds, RBAC denied? [Coverage] → **Edge Cases + FR-016 + US4 A3**
- [x] CHK033 - Are exception requirements defined when Deployment pods restart mid-follow (stream reconnect)? [Coverage] → **FR-026** + Edge Cases
- [x] CHK034 - Are ConfigMap-not-found / empty ConfigMap scenarios specified? [Coverage] → **Edge Cases + US6**
- [x] CHK035 - Are zero-match analysis scenarios specified? [Coverage] → **US8 A2**

## Edge Case & Non-Functional Coverage

- [x] CHK036 - Are requirements defined for very high log volume? [NFR] → **Edge Cases** (drop oldest buffer; UI usable)
- [x] CHK037 - Are requirements defined for multi-container pods? [Edge Case] → **Assumptions + Edge Cases**
- [x] CHK038 - Are security requirements restated for no exfiltration (constitution VI)? [NFR] → **SC-008, FR-014**
- [x] CHK039 - Are offline/local analysis requirements explicit? [NFR] → **FR-014**
- [x] CHK040 - Are non-technical-user UX requirements specified for analysis panel copy? [NFR] → **FR-013, SC-005** + assumption (WCAG not separate MVP gate)

## Dependencies & Assumptions

- [x] CHK041 - Is the assumption documented that users have network path to bastion + valid PEM + IAM file? [Assumption] → **Assumptions**
- [x] CHK042 - Is RBAC assumption documented (list pods/ConfigMaps, get pods/log)? [Assumption] → **Assumptions**
- [x] CHK043 - Is Deployment discovery method assumed and documented? [Dependency] → **Assumptions** (Apps API + ownerReferences)
- [x] CHK044 - Is “tecnología Spring Boot” detection assumption documented? [Assumption] → **Assumptions** (rules on click; no mandatory language auto-detect)

## Ambiguities, Conflicts & Traceability

- [x] CHK045 - Is a requirement ID scheme established (FR/NFR/HU)? [Traceability] → **US1–US10, FR-001–026, SC-001–009**
- [x] CHK046 - Should Must-Have HU list include ConfigMaps + Deployment aggregation + live follow, and drop export? [Consistency] → **Done** (10 atomic US; export OoS)
- [x] CHK047 - Is future vision clearly separated from MVP acceptance? [Ambiguity] → **Out of Scope** section
- [x] CHK048 - Are AI4Devs docs (`1-`, `5-`) synced after decisions? [Traceability] → **Synced** (`5-historias`, `1-descripcion`, README, tickets)

## Notes

- Check items reflect **written requirements** in `spec.md` (2026-07-23), not code.
- Review closed three residual gaps: severity enum (FR-013), mid-follow resume (FR-026), Deployment discovery assumption.
- Export (Q3-C) remains Out of Scope; no product export feature.

## Intake summary (locked)

| Topic | Decision |
|-------|----------|
| Components MVP | Pods + ConfigMaps |
| Log window model | One window per Deployment/workload (aggregated replicas) |
| Export logs | Out of scope v1 |
| Rules MVP | Spring Boot; severity + plain explanation + action |
| Live updates | Must for open log windows (FR-008 / FR-026) |
