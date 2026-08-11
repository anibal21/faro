# Research: Live logs workspace UX

## Decision: Keep existing live follow + fan-in; document as product baseline

**Rationale**: `start_live_follow` already uses `follow=true`, `tail_lines ≈ 500` per matching pod, and fans chunks into the open tab. Clarify locked initial page size at ~500/pod. Spec work documents this and focuses implementation on remaining UX gaps.

**Alternatives considered**:
- Revert to one-shot dumps — rejected (operators need continuous follow).
- Single “primary” pod only — rejected (fan-in is required).

## Decision: Fan-in ordering stays arrival-order for v1 of this feature

**Rationale**: Clarify deferred timestamp-merge. Current streams emit as kube delivers; Raw shows chronological arrival. Re-sorting by parsed timestamps is brittle across formats and can reorder mid-stream.

**Alternatives considered**:
- Merge by parsed wall-clock — deferred (plan/tasks later if needed).
- Per-pod separate panes — rejected (single tab fan-in is the product model).

## Decision: Stick-to-bottom is per-tab UI state with auto-off on scroll up

**Rationale**: Clarify Option A. Default `true` on new Deployment log tabs. Scroll upward (away from bottom threshold) sets `stickToBottom=false`. Manual toggle on scrolls to newest and sets `true`. Applies to both Raw and Structured for that tab. Not persisted to SQLite (ephemeral; constitution IV / scope).

**Alternatives considered**:
- Soft stick without flipping the switch — rejected by clarify.
- Global app preference — deferred; per-tab is enough for v1.
- Keep forcing bottom while switch on even if user scrolls — rejected (unusable for investigation).

## Decision: Load-older via progressive larger `tail_lines` snapshots per pod

**Rationale**: Kubernetes pod log API does not provide a clean “lines before cursor” token. Practical approach:
1. Track `historyDepth` per pod (starts at 500 after open).
2. On load-older: one-shot (non-follow) log fetch with `tail_lines = historyDepth + 500` per matching pod.
3. Diff against already-buffered lines for that pod; **prepend** only the newly older unique prefix.
4. Set `historyDepth += 500` (or to lines returned).
5. Exhaustion when a pod returns ≤ current depth (or empty prefix) — mark pod exhausted; when all matching pods exhausted, disable/hide load-older with clear copy.

Follow stream continues independently; do not restart follow solely to page history.

**Alternatives considered**:
- `since_time` only — fragile without reliable timestamps on every line.
- Re-open follow with larger tail — disruptive; can drop live continuity.
- External log store (CloudWatch) — out of scope / constitution product constraints.

## Decision: Preserve viewport using scrollHeight delta on prepend

**Rationale**: Clarify Option A. Before prepend, record `scrollHeight` and `scrollTop`; after DOM update, set `scrollTop' = scrollTop + (scrollHeight' - scrollHeight)`. Shared helper for Raw and Structured scroll containers.

**Alternatives considered**: Jump to new block top / absolute top — rejected by clarify.

## Decision: ConfigMap layout = no LogWorkspace analysis chrome + explicit full-height flex

**Rationale**: `LogWindow` already routes ConfigMaps to `ConfigMapTab` (not `LogWorkspace`). Gap is CSS/layout: ensure parent and `ConfigMapTab` use `min-height: 0`, `flex: 1`, overflow inside content so the main pane is filled and no empty bordered analysis region appears.

**Alternatives considered**: Mount ConfigMap inside `LogWorkspace` with drawer forced closed — rejected (risk of empty panel footprint). Collapse drawer to zero height globally — would break Deployment analysis UX.

## Decision: Bastion-minted kube token remains the live auth path (document only if already implemented)

**Rationale**: Spec US5/FR-011. Research confirms product agreement; implementation lives under connect/auth (`eks_auth` / bastion exec). This feature plan does not redesign auth — only requires that log open/follow/load-older use the same live session credentials and that failures stay actionable without leaking tokens.

**Alternatives considered**: Require laptop IAM in aws-auth — rejected (operators cannot change cluster maps).

## Decision: Test strategy

**Rationale**:
- Unit/UI: stick-to-bottom toggle, auto-off on simulated scroll up, viewport preserve on prepend, ConfigMap full-height / absence of analysis drawer markers.
- Existing structured write-group tests remain authoritative for US2.
- Cargo: optional unit tests for history-depth / prefix-diff helpers if extracted.
- Live follow + real load-older: quickstart manual on operator cluster.

**Alternatives considered**: Full Tauri E2E for kube paging — heavier than needed for MVP; keep manual quickstart + focused unit tests.
