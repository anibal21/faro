# Research: UI chrome polish (005)

## 1. Typography scale (VS Code default)

**Decision**: Set app base UI size to **13px** (VS Code workbench default) via `html`/`body` / Tailwind base (`text-[13px]` or `font-size: 13px`), keep existing font families (Segoe UI / IBM Plex Sans stack). Prefer `text-sm`-class controls only where hierarchy needs a step up; avoid previous micro `text-xs`-everywhere default for primary chrome.

**Rationale**: Spec FR-001 / SC-001; user asked for VS Code default sizes, not a new typeface.

**Alternatives considered**: 14px (`text-sm` only) — slightly larger than VS Code default; keep 12px dense — rejected by user.

## 2. Plus / Minus expand icons

**Decision**: Use **lucide-react** `Plus` / `Minus` (or `PlusSquare` / `MinusSquare` if square affordance reads clearer) at ~14–16px in `EnvTreeNav` expanders. No ASCII `>`/`v` or raw `+`/`-` text.

**Rationale**: lucide already in package.json; matches “íconos, no sólo el símbolo”.

**Alternatives considered**: Heroicons / custom SVG — extra deps; emoji — rejected by assumptions.

## 3. Custom window chrome (Tauri 2)

**Decision**:
- `tauri.conf.json` → window `decorations: false`
- New `TitleBar.tsx`: `data-tauri-drag-region`, Faro title, themed min/max/close via `getCurrentWindow().minimize()` / `toggleMaximize()` / `close()`
- Place TitleBar above AppMenubar; both consume theme CSS variables

**Rationale**: Clarify option C; OS title-bar color APIs are incomplete/unreliable for full theming.

**Alternatives considered**: Keep decorations + Windows dark title bar only — fails FR-007; fully frameless without controls — fails FR-007a.

## 4. Application version footer

**Decision**: `getVersion()` from `@tauri-apps/api/app` at rail mount; display `v{version}`; fallback `"v?"` / `"unknown"` if invoke fails (web-only Vitest). Align with `tauri.conf.json` / `package.json` `0.1.0`.

**Rationale**: Matches shipped desktop package version; constitution VI allows tool metadata locally.

**Alternatives considered**: Hardcode from `package.json` import — can drift from Tauri bundle version.

## 5. Splash minimum dwell (5s)

**Decision**: In `App.tsx`, record `t0` when splash phase starts; `await sessionPurgeEphemeral()` (and existing boot); then `await sleep(max(0, 5000 - elapsed))` before `phase = "ready"`. Errors still surface on splash without shortening below 5s when recovering to ready is N/A (error path may stay on splash).

**Rationale**: FR-008 / SC-007; simple wall-clock gate.

**Alternatives considered**: Artificial delay inside SplashView only — easy to bypass if App flips phase early; CSS animation only — not measurable 5s gate.

## 6. Ambientes menu + Desconectar todo

**Decision**:
- AppMenubar Ambientes: only Nuevo… and Desconectar todo
- On Desconectar todo: **always** `window.confirm` (or shadcn AlertDialog); on OK → disconnect every `connectedIds` (or `env_disconnect` per id / disconnect-all helper) + `workspace.closeAll()`
- Left `EnvTreeNav` context menu **unchanged**

**Rationale**: Spec FR-003/003a/004 + clarifications.

**Alternatives considered**: Confirm only if connected — rejected (user chose always confirm).

## 7. Monitor rail title

**Decision**: Replace left header string `"Ambientes"` with `"Monitor"`; keep tree structure.

**Rationale**: FR-005.
