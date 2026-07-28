# Research: Compact fixed windows (007)

## 1. One window vs two windows

**Decision**: Keep a **single** Tauri window. Start at splash geometry; on ready, `setSize` + `center` + `setResizable(true)` for main.

**Rationale**: Current App already swaps SplashView → MainShell in one window; a second window adds capability/lifecycle complexity without UX gain.

**Alternatives considered**: Separate splash window closed on ready — more code, flicker risk, dual labels in capabilities.

## 2. Splash pixel size

**Decision**: **576×324** logical pixels (16:9, matches artwork aspect). Fixed (`resizable: false` while splash), centered. Far smaller than ~1024×768 complaint.

**Rationale**: Product owner chose this compact splash footprint; image `object-fit: cover` still works.

**Alternatives considered**: 720×405 — prior plan default, superseded by owner; 640×360; keep 1400×900 — rejected by spec.

## 3. Main pixel size

**Decision**: Product default **900×600**, then **clamp** to `currentMonitor()` work area minus margin (e.g. 48px) so small laptops never overflow (SC-004).

**Rationale**: Product owner chose 900×600; fits comfortably inside 1366×768-class displays; supersedes 1400×900 (FR-007).

**Alternatives considered**: 1100×680 — prior plan default, superseded by owner; maximize on start — rejected by “fixed footprint.”

## 4. Centering

**Decision**: `center: true` in `tauri.conf.json` for initial splash; call `getCurrentWindow().center()` again after applying main size.

**Rationale**: Spec FR-002/FR-005; Tauri 2 supports both conf and runtime center.

## 5. Resize policy

**Decision**: Splash phase non-resizable; after ready, **resizable true** (spec assumption: fixed *default*, resize after ready OK).

**Rationale**: Matches FR-003 and US2 scenario 4.

## 6. Permissions

**Decision**: Add Tauri 2 capability permissions: `core:window:allow-set-size`, `core:window:allow-set-resizable`, `core:window:allow-center`, and monitor read as required by API (`core:window:allow-current-monitor` / equivalent).

**Rationale**: Frontend geometry helper cannot call restricted APIs without capability entries.

## 7. Browser / Vitest

**Decision**: Geometry apply no-ops or soft-fails outside Tauri (vitest); unit tests assert constants + clamp math without needing a real window.

**Rationale**: Existing splash tests run in jsdom.
