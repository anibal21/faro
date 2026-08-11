# Feature Specification: Multi-Pack Rules Engine

**Feature Branch**: `015-rules-multi-pack`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Mejorar el motor de reglas: packs por tecnología (Spring Boot y otros), matching más útil, y auto-hint de stack a partir del texto del log / pistas del workload — sin LLM; click-to-analyze en Structured se mantiene."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Analyze with a richer Spring Boot pack (Priority: P1)

An operator clicks a marked error write-group from a Spring Boot / JVM log and gets useful findings (NPE, SQL, timeout, OOM, auth, generic ERROR) instead of an empty panel when the message matches common JVM patterns.

**Why this priority**: Fixes the primary “rules don’t work” pain for Faro’s current demo and many live Java workloads.

**Independent Test**: Demo or fixture with NullPointerException / SQLException → Structured → click ERROR group → panel shows ≥1 finding with explanation and recommendation.

**Acceptance Scenarios**:

1. **Given** a write-group whose text contains a known JVM exception pattern, **When** the operator analyzes it, **Then** at least one finding is returned with severity, explanation, and recommendation.
2. **Given** a write-group with only benign INFO text and no ERROR/exception markers, **When** analyzed, **Then** the panel may be empty or show only low-severity generic info — never invents a critical finding.
3. **Given** analysis runs, **When** findings are shown, **Then** no LLM or external AI service is used.

---

### User Story 2 — Multiple rule packs by technology (Priority: P1)

The product ships more than one local rule pack (at least Spring Boot/JVM plus one additional common stack, e.g. Node.js or generic HTTP/container). Analysis uses the selected or resolved pack instead of a single hard-coded Spring-only list.

**Why this priority**: Operators’ clusters are not only Spring Boot; empty results on other stacks is the main failure mode.

**Independent Test**: Analyze a Node-style (or other pack) error text with the corresponding pack → matching findings; Spring text still works with Spring pack.

**Acceptance Scenarios**:

1. **Given** at least two installed packs, **When** analysis runs with an explicit pack choice, **Then** only that pack’s rules are applied.
2. **Given** Spring Boot error text and the Spring pack, **When** analyzed, **Then** Spring rules still match as in US1.
3. **Given** error text for the second pack’s technology, **When** analyzed with that pack, **Then** ≥1 relevant finding appears and Spring-only needles alone would not have covered it.

---

### User Story 3 — Auto-hint chooses a pack (Priority: P2)

When the operator does not pick a pack, Faro chooses one using cheap local signals from the write-group text and optional workload hints (e.g. source hint already passed as namespace/deployment, or future labels/image cues if available without new cluster mutations).

**Why this priority**: Removes the need for operators to know which pack to select; improves “it just works.”

**Independent Test**: JVM-looking text → auto resolves to Spring/JVM pack; Node-looking text → second pack; ambiguous text → safe default pack documented in Assumptions.

**Acceptance Scenarios**:

1. **Given** write-group text with clear JVM markers (e.g. `java.lang.`, `.Exception`, `\tat `), **When** analyze runs without an explicit pack, **Then** the Spring/JVM pack is used.
2. **Given** write-group text with clear markers for the second pack, **When** analyze runs without an explicit pack, **Then** that pack is used.
3. **Given** ambiguous text, **When** analyze runs without an explicit pack, **Then** a documented default pack is used and analysis still completes (possibly zero findings).

---

### User Story 4 — Operator can see or override pack (Priority: P3)

The analysis UI shows which pack was used and allows overriding the pack for the next analyze (or for the current session/tab), so a wrong auto-hint is correctable.

**Why this priority**: Builds trust when auto-hint misfires; not required for MVP if US1–US3 land.

**Independent Test**: After analyze, UI shows pack id/name; change pack and re-analyze → findings follow the new pack.

**Acceptance Scenarios**:

1. **Given** a completed analyze, **When** the findings panel is open, **Then** the operator can see which rule pack was applied.
2. **Given** the operator selects another installed pack, **When** they analyze again, **Then** findings come from the newly selected pack.

---

### Edge Cases

- Empty write-group text → empty findings, no error crash.
- Very large write-group → analysis still finishes in interactive time (truncate or sample with clear behavior if needed).
- Multiple rules match → all matching findings returned (ordered by severity if defined).
- Unknown / missing pack id requested → fall back to default pack with non-secret error or silent fallback (document in Assumptions).
- Demo synthetic NPE lines must continue to produce findings under Spring/JVM pack.
- Rules remain local JSON (or equivalent local files); no network call for analysis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On-click analysis of a Structured write-group MUST continue to return local rule findings (severity, rule id, explanation, recommendation) without generative AI.
- **FR-002**: The product MUST support multiple named local rule packs (minimum: existing Spring Boot/JVM pack improved, plus at least one additional stack pack).
- **FR-003**: Analysis MUST honor an explicit pack selection when provided by the UI.
- **FR-004**: When no pack is selected, analysis MUST resolve a pack via local auto-hint from write-group text and optional non-secret source/workload hints.
- **FR-005**: Auto-hint MUST prefer clear JVM/Spring signals for the Spring/JVM pack and clear signals for the second pack; ambiguous input MUST use a documented default.
- **FR-006**: Spring/JVM pack matching MUST cover common exception and ERROR patterns with testable needles (substring and/or simple patterns) sufficient for demo NPE and typical SQL/timeout/OOM/auth cases.
- **FR-007**: Matching MUST NOT invent critical findings for benign INFO-only text that lacks error/exception markers (except an optional low-severity generic rule gated on ERROR/Exception presence).
- **FR-008**: The findings UI MUST show which pack was used (US4) once that story is in scope; MVP MAY omit override UI if auto-hint + packs land first, but pack identity SHOULD be available to the client in the analyze response.
- **FR-009**: Analysis MUST remain read-only regarding the cluster; no mutating Kubernetes calls for rule selection.
- **FR-010**: Rule packs and findings MUST NOT embed or echo PEM, IAM secrets, or bearer tokens.
- **FR-011**: Automated tests MUST cover at least: Spring pack hit on NPE, second pack hit on its fixture text, auto-hint routing for JVM vs second pack, and empty/benign text behavior.

### Key Entities

- **Rule pack**: Named local set of rules for a technology/stack (id, display name, rules).
- **Rule**: Local matcher (needles/patterns) + severity + explanation + recommendation.
- **Stack hint**: Result of auto-hint (pack id + optional confidence/reason for UI/debug).
- **Analysis result**: List of findings plus the pack id actually used.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of demo NPE write-group analyze trials, ≥1 finding is shown.
- **SC-002**: For the second pack’s fixture error text, analyze with that pack yields ≥1 finding in 100% of acceptance trials.
- **SC-003**: Auto-hint routes JVM-marker text to the Spring/JVM pack and second-pack-marker text to the second pack in ≥95% of the fixture suite cases.
- **SC-004**: Benign INFO-only fixture analyze returns 0 critical findings in 100% of trials.
- **SC-005**: Operators can complete “see ERROR group → click → understand cause suggestion” without leaving Faro and without any cloud AI call.
- **SC-006**: Spot-check of analyze payloads/UI shows no PEM/IAM/token material.

## Assumptions

- Primary stacks for v1 of this feature: **Spring Boot / JVM** (improved) and **one additional pack** (default choice: **Node.js** common error strings, unless plan selects Generic HTTP/container instead — Node.js is the default here).
- Default pack when ambiguous: Spring/JVM (preserves current product bias and demo).
- Structured click-to-analyze remains the trigger; no automatic analyze-all of the buffer.
- Constitution IV/VI: local rules only; no generative AI inside the product; no exfiltration.
- Workload hints for auto-hint may start from existing `sourceHint` (namespace/deployment) and log text; richer label/image signals can be added later if already available without new mutating APIs.
- Spanish explanations/recommendations in packs remain acceptable (current product language).

## Out of Scope

- Large language models or remote “AI ops” services.
- Training or uploading logs to third parties.
- Full language parsers (complete Java/JS AST).
- Auto-remediation / applying fixes in the cluster.
- Replacing Structured write-group UX with a different analysis entry point (may extend later).
- Exhaustive rule coverage for every framework.
