# Research: 015-rules-multi-pack

## Decision: Second pack = Node.js

**Rationale**: Spec default; common in EKS alongside JVM; distinct log markers (`Error:`, `at Object.`, `node:internal`, `UnhandledPromiseRejection`). Spanish explanations same tone as Spring pack.

**Alternatives considered**: Generic HTTP/container only — weaker product story. .NET — fewer demo fixtures today.

## Decision: Embed packs with `include_str!`

**Rationale**: Offline, deterministic, already used for Spring pack; no runtime path discovery issues on Windows packaging.

**Alternatives considered**: Load from `rules/` at runtime — nicer for hot-edit, more packaging risk for v1.

## Decision: Matcher = `match_contains` ANY + optional `match_all_contains`

**Rationale**: Keep schema simple; add `match_all_contains` for AND needles to reduce false criticals. Generic ERROR rule requires ERROR/Exception presence (FR-007).

**Alternatives considered**: Full regex per rule — powerful but heavier review; defer unless needed. LLM — forbidden by constitution.

## Decision: Auto-hint scoring

**Rationale**: Score text (and optional `source_hint` lowercase) with weighted markers:

- JVM: `java.lang`, `NullPointerException`, `\tat `, `.Exception`, `org.springframework`, `Reactor`
- Node: `UnhandledPromiseRejection`, `node:internal`, `at Object.`, `TypeError:`, `ENOENT`, `Express`

Highest score wins; ties / zero → default `springboot`.

**Alternatives considered**: Always require UI pick — worse UX. ML classifier — out of scope.

## Decision: Analyze API returns `{ findings, packId, packDisplayName }`

**Rationale**: FR-008 / US4 need pack identity; keep findings array for backward-compatible UI mapping.

**Alternatives considered**: Return only findings + separate IPC for hint — extra round-trip.

## Decision: Truncate input at 64 KiB

**Rationale**: Interactive latency; stack traces that matter are at the start/end — use first 64 KiB (document in quickstart).

**Alternatives considered**: Full buffer always — risk of UI jank on huge groups.

## Decision: Severity sort

**Rationale**: Order findings `critical` → `warn` → `info` for panel readability.
