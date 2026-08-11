# Contract: NSIS Faro installer

## Branding (FR-016)

| Setting | Value |
|---------|--------|
| Product name | Faro |
| Publisher | Aníbal Rodríguez |
| Copyright year | 2026 |
| License | MIT (ship `LICENSE` / MIT text in installer) |
| Languages | Spanish |
| Icons | Existing `src-tauri/icons/*` |
| Visual | Brand color on NSIS header/sidebar (no new banner asset) |
| Shortcuts | Desktop + Start Menu |
| Default path | Program Files\Faro (current-user mode as supported) |

## Config locus

`src-tauri/tauri.conf.json` → `bundle` / `bundle.windows.nsis` (per Tauri 2 schema).

## Validation

Build `npm run tauri build` (Windows) → inspect NSIS artifact under `src-tauri/target/release/bundle/nsis/`; confirm name, publisher, shortcuts, license page.
