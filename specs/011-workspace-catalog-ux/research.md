# Research: Workspace catalog & UI polish

## Decision: Live summary from Deployment status + pod template requests/limits

**Rationale**: Clarify requires provisioned `request / limit` for **one pod**, not metrics-server usage and not × replicas. Today `live_summary` returns zeros/nulls. Plan: read Deployment (replicas/ready, creation/available for uptime best-effort) and sum container requests/limits from `spec.template.spec.containers` (+ init containers only if product later expands; v1 = app containers). Format strings as `256Mi / 512Mi` or `N/D / 512Mi` when one side missing.

**Alternatives considered**:
- Metrics API usage — rejected by clarify.
- Multiply by replicas — rejected by clarify.
- First container only — rejected in favor of sum across containers of one pod.

## Decision: Rename/restructure tree: Deployments → Pods → Services → ConfigMaps

**Rationale**: Clarify Option A order. Today “Pods” lists Deployments — confusing. Split: Deployments open fan-in logs; Pods list individual pods (from catalog hydration already fetching pods) and open pod-scoped logs; Services new list+detail; ConfigMaps unchanged.

**Alternatives considered**: Keep Deployments under “Pods” label — rejected (operator asked for both sections).

## Decision: Pod-scoped logs via existing follow with single-pod match

**Rationale**: Prefer extending `logs_open` with optional `podName` (or dedicated command) that follows only that pod, reusing stream/chunk pipeline. Avoids reinventing UI.

**Alternatives considered**: Only show pod metadata without logs — weaker than spec US7.

## Decision: Spanish status at emission (Rust) with optional FE map

**Rationale**: Emit `siguiendo` / `siguiendo (N pods)` / Spanish idle/error strings from `logs.rs` so all clients stay consistent. FE may keep a small fallback map for legacy English if any linger.

**Alternatives considered**: FE-only translate — risk of missing Rust variants.

## Decision: Export via `@tauri-apps/plugin-dialog` `save()` + write text

**Rationale**: Browse already uses dialog `open`. Add `save` capability; write UTF-8 text of Raw buffer or ConfigMap serialization. Cancel = no write. Not SQLite.

**Alternatives considered**: Clipboard-only — rejected (spec wants file). Rust-only file write without dialog — worse UX on desktop.

## Decision: Custom scrollbars via CSS (WebKit + standard `scrollbar-*` where supported)

**Rationale**: Thin thumb/track using theme CSS variables on workspace scroll containers. No new dependency.

**Alternatives considered**: Custom JS scrollbars — heavier; out of scope.

## Decision: Stick-to-bottom layout fix with dedicated CSS group

**Rationale**: Toolbar flex/`ml-auto` or missing `inline-flex` grouping splits checkbox and label. Fix with `.log-window__stick { display: inline-flex; align-items: center; gap: …; white-space: nowrap; }` and ensure label wraps the input.

**Alternatives considered**: Move control out of toolbar — unnecessary if CSS fixed.

## Decision: Services are read-only detail tabs

**Rationale**: Spec FR-013/014. List Services in namespace; open tab with type, ports, selector, cluster IP. No port-forward.

**Alternatives considered**: Open logs for Service — not defined; Services don’t have pod logs directly without endpoint resolution (defer).
