# Research: Workspace Delivery Polish

## R1 — Window & content minima

**Decision**: After splash→main, set Tauri min size to **900×600** (current `MAIN_*` defaults). Content area minimum = remaining space when sidebar is at its **maximum** allowed width such that center never drops below usable default (~640×~520 effective) OR equivalently: sidebar min 200 / default 240 / max ~360, window min 900×600 so center always ≥ ~540px at max sidebar.

**Rationale**: Spec anchors “default now” = post-007 main geometry; today there is no `setMinSize`.

**Alternatives**: Lock non-resizable (rejected — user asked resize). Min 320×240 clamp helpers only (too small).

## R2 — Resizable left panel

**Decision**: Replace fixed `w-60` with CSS width state (px) + drag handle on aside edge; persist optional `ui.sidebarWidth` pref; clamp [200, 360].

**Rationale**: Matches US1; grid legacy 200–260 unused.

**Alternatives**: Only CSS `resize` on aside (poor UX cross-WebView).

## R3 — Demo delete + restore

**Decision**: Remove `faro-demo` delete block; stop auto-`ensure_demo` on every `list_all` **or** gate re-seed behind explicit “restore demo / usar fixtures” action so delete sticks. Restore path: `demo_fixture_paths` + upsert/ensure once from UI.

**Rationale**: Spec requires delete demo and restore via fixture, not immortal row.

**Alternatives**: Soft-hide demo (rejected — user asked Eliminar).

## R4 — Max 10 configs + 10 colors

**Decision**: `color_index` INTEGER 0–9 on `connection_instance`; assign lowest free index on create; reject upsert when count≥10 (non-update). Palette in `src/lib/envColors.ts` with paired light/dark CSS vars `--env-color-0` … `--env-color-9`.

**Rationale**: Spec couples 10 configs ↔ 10 colors; stable index beats hash of name.

**Alternatives**: User-picked color (out of scope v1).

## R5 — Multi-session tabs without collision

**Decision**:
1. Prefix all `navKey`s with `instanceId` (e.g. `{instanceId}|deploy-logs:ns/dep`).
2. Store `instanceId` (+ `envColorIndex`) on each `WorkspaceTab`.
3. Before `logsOpen` / catalog reads for an env, **set focused session** to that `instanceId` (tree select + open-from-tree); ideally extend IPC with `instanceId` later—MVP = focus-then-invoke.
4. On disconnect, close only tabs for that `instanceId`, not `closeAll` blindly if another session remains.

**Rationale**: Today focused-only catalog/logs + navKeys without instance cause collisions; dual connect already exists in `sessions` map.

**Alternatives**: Full instanceId on every Rust command in one PR (better long-term; larger). Hybrid MVP above.

## R6 — Max 2 connections

**Decision**: In `env_connect`, if `sessions.len() >= 2` and id not already connected → error code/message `connection_limit`. FE catches → modal (Spanish) before/instead of generic alert. FE pre-check for snappy UX.

**Rationale**: Authoritative cap in Rust; modal is US6.

**Alternatives**: Soft warn only (rejected).

## R7 — Rich fixtures

**Decision**: Expand `hydrate_demo_catalog` / demo logs / YAML / services / configmaps so one demo run exercises tree sections + tabs + analyze rules on synthetic errors; keep PEM/IAM fixtures as today.

**Rationale**: Delivery validation without live EKS.

## R8 — NSIS branding

**Decision**: Configure Tauri 2 `bundle.windows.nsis` (and related): publisher **Aníbal Rodríguez**, copyright 2026, MIT license file, Spanish language, installer icons from existing `icons/`, brand header color, shortcuts Desktop+StartMenu, install mode current user / Program Files\Faro as supported by Tauri NSIS schema.

**Rationale**: Matches clarified FR-016; no new banner art (option A).

**Alternatives**: Custom full NSIS script (heavier).
