# Quickstart: Branded splash and app icons (006)

## Prerequisites

- Artwork at `src-tauri/load-page/load_page.png`
- Icons under `src-tauri/icons/`
- Feature: `specs/006-branded-splash-icons/`

## Run

```bash
npm run tauri dev
```

## Validation

### V1 — Splash

1. Cold start: full-bleed lighthouse image fills window.
2. No large overlaid “Faro” / tagline text in the center.
3. If status/error shows, it is bottom-right only.
4. After ≥5s dwell (005), main workspace appears.

### V2 — Window size

1. Fresh launch ≈ 1400×900 (IDE-like), not 1100×720.
2. Window still resizable.

### V3 — Icons

1. Taskbar / window icon matches new Faro artwork.
2. `tauri.conf.json` `bundle.icon` paths all exist on disk.

## Automated

```bash
npm test
npm run build
```

## Contracts

- [contracts/splash-visual.md](./contracts/splash-visual.md)
- [contracts/window-icons.md](./contracts/window-icons.md)
