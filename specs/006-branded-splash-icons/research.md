# Research: Branded splash and app icons (006)

## 1. Splash image serving

**Decision**: Copy `src-tauri/load-page/load_page.png` → `src/assets/splash-load.png` and `import` it in `SplashView` (or place under `public/splash-load.png` and use absolute URL). Prefer `src/assets` + import for hashed cache-busting.

**Rationale**: Frontend cannot reliably load arbitrary paths under `src-tauri/` in Vite; asset must live in the web tree.

**Alternatives considered**: CSS `url()` to tauri path — fails in `tauri dev` webview; embed base64 — huge bundle.

## 2. Splash layout

**Decision**:
- Full-viewport `.splash` with `background-image` / `<img>` `object-fit: cover`, fallback `background-color: #0a192f`
- Remove `.splash__brand` and `.splash__tagline` from DOM
- `.splash__status` absolutely positioned `bottom` + `right` (e.g. 1rem); show only when `error` or when status string is intentionally passed; healthy boot may pass empty/`null` for image-only

**Rationale**: Spec FR-001–003; image already has title.

**Alternatives considered**: Keep centered “Faro” text — rejected by user/spec.

## 3. Window default size

**Decision**: `tauri.conf.json` main window `width: 1400`, `height: 900`, keep `resizable: true`, `decorations: false`.

**Rationale**: Spec assumption ~1400×900 IDE footprint; replaces 1100×720.

**Alternatives considered**: Maximize on start — too aggressive; 1280×800 — acceptable floor but 1400×900 matches stated assumption.

## 4. Application icons

**Decision**: User already replaced files under `src-tauri/icons/`. Verify `tauri.conf.json` `bundle.icon` entries point at existing files (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`). Regenerate missing platform sizes from `icon.png` via `npm run tauri icon` **only if** required files are missing or stale relative to source.

**Rationale**: Spec FR-005; avoid unnecessary regeneration if set is complete.

**Alternatives considered**: Always re-run `tauri icon` — may overwrite carefully crafted assets; only do if audit fails.

## 5. Splash vs TitleBar

**Decision**: Keep current App behavior: splash phase renders `SplashView` alone (no TitleBar). MainShell TitleBar appears after ready. Splash image fills the undecorated window.

**Rationale**: Maximizes brand art; matches “image as loading page.”

**Alternatives considered**: TitleBar over splash — crops art; skip unless user asks later.
