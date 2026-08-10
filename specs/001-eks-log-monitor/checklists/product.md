# Product Requirements Checklist: Faro MVP

**Purpose**: Unit tests for English — validate clarity, completeness, and consistency of Faro product requirements before `/speckit-specify` formalizes `spec.md`.
**Created**: 2026-07-22
**Feature**: Seed docs — [`docs/SPEC.md`](../SPEC.md), [`5-historias-de-usuario.md`](../../5-historias-de-usuario.md), constitution v1.1.0; narrative from checklist intake (2026-07-22)
**Depth**: Standard
**Audience**: Author (pre-specify) / Reviewer at specify gate
**Decisions locked for this checklist**:
- Q1-C: MVP components = **Pods + ConfigMaps** (other AWS/K8s types = future vision)
- Q2-B: Logs grouped by **Deployment / workload** (“una sola ventanilla por artefacto”)
- Q3-C: **Log export OUT OF SCOPE** for v1 (user’s own responsibility outside Faro)

---

## Requirement Completeness

- [ ] CHK001 - Are desktop packaging requirements defined for **Windows, macOS, and Linux** executables/installers as Must vs Windows-first demo? [Completeness, Gap vs SPEC “Windows-first acceptable”]
- [ ] CHK002 - Are **connection instance** requirements complete (create/edit/delete/select N bastion+PEM+AWS+cluster profiles)? [Completeness, Spec seed §Persistencia]
- [ ] CHK003 - Is the MVP component catalog explicitly limited to **Pods + ConfigMaps**, with other types (queues, events, etc.) labeled Out of Scope / future? [Completeness, Decision Q1-C]
- [ ] CHK004 - Are ConfigMap visualization requirements specified (list fields, namespace scope, read-only view contents)? [Gap, Decision Q1-C]
- [ ] CHK005 - Are requirements defined for choosing **component type** in the UI before listing artifacts? [Completeness, Gap]
- [ ] CHK006 - Are live log-follow requirements specified for **each open artifact log window** (must update as pods write logs)? [Completeness, Conflict risk vs SPEC Should-Have follow]
- [ ] CHK007 - Are Spring Boot rules-engine requirements specified (min rule count, match fields, output shape)? [Completeness, Spec seed §Analizar]
- [ ] CHK008 - Is the **non-technical explanation** format required (qué pasó / qué significa / qué hacer) documented as acceptance content? [Gap, product decision]
- [ ] CHK009 - Is multi-environment access (N connection instances per user) specified with simultaneous vs one-active-connection rules? [Gap, Ambiguity]
- [ ] CHK010 - Is “log export to text file” explicitly documented as **Out of Scope v1**? [Completeness, Decision Q3-C]

## Requirement Clarity

- [ ] CHK011 - Is “artefacto” defined (Deployment? Service? app label?) for the single log window? [Clarity, Decision Q2-B]
- [ ] CHK012 - Is aggregation across replicas specified (how lines are merged, labeled by pod name, ordered)? [Clarity, Decision Q2-B]
- [ ] CHK013 - Is behavior defined when a Deployment has 0 ready pods or scaling to zero? [Clarity, Edge Case, Gap]
- [ ] CHK014 - Is “todos los pods del cluster que tiene acceso el bastión” scoped (cluster-wide vs selected namespaces)? [Ambiguity]
- [ ] CHK015 - Are PEM/SSH/AWS fields for a connection instance enumerated unambiguously (host, user, pem path, aws profile, region, cluster)? [Clarity, Spec seed §profiles]
- [ ] CHK016 - Is “motor de reglas por tipo de tecnología” clear that **only Spring Boot** ships in MVP, with Flask/NestJS as future stubs or omitted? [Clarity, Gap]
- [ ] CHK017 - Is “configuración” in the narrative disambiguated as **ConfigMaps** (K8s) vs app settings vs AWS configs? [Ambiguity, Decision Q1-C]
- [ ] CHK018 - Are severity levels for rule hits enumerated (e.g. critical/warn/info) with definitions? [Clarity, Gap]

## Requirement Consistency

- [ ] CHK019 - Do HU drafts still saying “por pod” align with Deployment-aggregated “una ventanilla”? [Conflict, 5-historias vs Decision Q2-B]
- [ ] CHK020 - Does SPEC E2E “elige namespace/pod” need update to “elige Deployment/artefacto (+ ConfigMaps)”? [Consistency, SPEC §Flujo E2E]
- [ ] CHK021 - Is live follow Must-Have consistent with constitution and SPEC Should-Have list? [Conflict, SPEC §Historias vs intake]
- [ ] CHK022 - Does excluding export stay consistent with constitution IV (no full log dumps in SQLite) without implying export features? [Consistency, Constitution IV, Q3-C]
- [ ] CHK023 - Are ConfigMap reads consistent with constitution III (read-only K8s only)? [Consistency, Constitution III]
- [ ] CHK024 - Are rules-engine “explicación simple” requirements consistent with constitution IV (local rules, no generative AI)? [Consistency, Constitution IV]

## Acceptance Criteria Quality

- [ ] CHK025 - Can “una sola ventanilla por artefacto” be objectively tested (one window per Deployment, N replicas visible as labels)? [Measurability, Q2-B]
- [ ] CHK026 - Are acceptance criteria defined for opening **multiple** artifact log windows with concurrent follow? [Acceptance Criteria, Gap]
- [ ] CHK027 - Are acceptance criteria for Spring Boot analysis measurable (e.g. ≥N rules, each hit has severity + simple explanation + recommended action)? [Measurability]
- [ ] CHK028 - Are packaging acceptance criteria measurable per OS (artifact type: msi/dmg/AppImage or equivalent)? [Measurability, Gap]
- [ ] CHK029 - Are connection-instance acceptance criteria measurable (persist after restart; PEM path only, never PEM bytes)? [Measurability, Constitution II]

## Scenario Coverage

- [ ] CHK030 - Are primary-flow requirements complete: add instance → connect → pick Pods or ConfigMaps → select artifact → live logs → analyze (Spring Boot)? [Coverage]
- [ ] CHK031 - Are alternate-flow requirements defined for switching connection instance / environment? [Coverage, Gap]
- [ ] CHK032 - Are exception-flow requirements defined for bad PEM, bastion down, expired AWS creds, RBAC denied? [Coverage, Gap]
- [ ] CHK033 - Are exception requirements defined when Deployment pods restart mid-follow (stream reconnect)? [Coverage, Recovery, Gap]
- [ ] CHK034 - Are ConfigMap-not-found / empty ConfigMap scenarios specified? [Coverage, Edge Case, Gap]
- [ ] CHK035 - Are zero-match analysis scenarios specified (no Spring Boot rules hit)? [Coverage, Edge Case, Gap]

## Edge Case & Non-Functional Coverage

- [ ] CHK036 - Are requirements defined for very high log volume (backpressure, buffer cap, UI freeze prevention)? [NFR, Gap]
- [ ] CHK037 - Are requirements defined for multi-container pods inside a Deployment (which container logs)? [Edge Case, Gap]
- [ ] CHK038 - Are security requirements restated for no exfiltration of credentials/logs (constitution VI) in the product spec? [NFR, Constitution VI]
- [ ] CHK039 - Are offline/local analysis requirements explicit (rules run on-device only)? [NFR, Constitution IV]
- [ ] CHK040 - Are accessibility or non-technical-user UX requirements specified for analysis panel copy? [Gap, product intent]

## Dependencies & Assumptions

- [ ] CHK041 - Is the assumption documented that users have AWS profile + network path to bastion + valid PEM? [Assumption]
- [ ] CHK042 - Is RBAC assumption documented (list pods/ConfigMaps, get pods/log)? [Assumption, Constitution III]
- [ ] CHK043 - Is Deployment discovery method assumed (label selectors, ownerReferences) and required to be specified in plan/spec? [Dependency, Gap]
- [ ] CHK044 - Is “tecnología Spring Boot” detection assumption documented (how Faro knows which rule pack to apply)? [Assumption, Gap]

## Ambiguities, Conflicts & Traceability

- [ ] CHK045 - Is a requirement ID scheme established (FR/NFR/HU) before specify so checklist items can map 1:1? [Traceability, Gap]
- [ ] CHK046 - Should Must-Have HU list be rewritten to include ConfigMaps + Deployment aggregation + live follow, and drop export? [Conflict, SPEC §Historias vs decisions]
- [ ] CHK047 - Is future vision (queues, events, Flask, NestJS) clearly separated from MVP acceptance so it cannot be scored as missing? [Ambiguity]
- [ ] CHK048 - Are AI4Devs docs (`1-`, `5-`) flagged to sync after these decisions land in `/speckit-specify`? [Traceability, Dual-doc workflow]

## Notes

- Check items off as the **written requirements** improve (SPEC / future `spec.md`), not as code is built.
- After `/speckit-specify`, move or copy this file under `specs/<feature>/checklists/product.md` and re-run checklist against formal FR IDs.
- Export (Q3-C): treat any residual “export logs” wording in seed docs as debt to remove or mark OoS.

## Intake summary (locked)

| Topic | Decision |
|-------|----------|
| Components MVP | Pods + ConfigMaps |
| Log window model | One window per Deployment/workload (aggregated replicas) |
| Export logs | Out of scope v1 |
| Rules MVP | Spring Boot; plain-language explanation + severity + action |
| Live updates | Required for open log instances (to be formalized as Must) |
