# TESTING — Faro

## Automated

```bash
npm test
# With MSVC linker on PATH (Windows):
cargo test --manifest-path src-tauri/Cargo.toml
```

## 001-eks-log-monitor — Quickstart checklist

| Scenario | Result |
|----------|--------|
| V0 Splash purge | Covered by SplashView + `session_purge_ephemeral` + cargo purge test |
| V1 Empty + Ver theme | US9 `VerMenu` + `useTheme` prefs |
| V2 Configure & load | US2–US3 UI + IPC |
| V3 Catalog | Demo hydrate on connect; AccordionNav (Pods/ConfigMaps) |
| V4 Logs + analyze | Demo follow + Structured/Raw + FindingPanel |
| Package | `npm run tauri build` — see `tests/e2e/package_smoke.md` |

## 002-accordion-nav-layout — Quickstart

| Scenario | Result |
|----------|--------|
| Accordion layout | AccordionNav \| main (~grid 260px / 1fr); no CatalogFilter / Abrir logs / right rail |
| Click Deployment | Tab + WorkloadSummaryStrip + multi-pod fan-in (`-aaa/-bbb/-ccc`) |
| Tab dedupe + background | Re-click focuses; inactive tabs keep receiving `logs_chunk` |
| ConfigMap tab | Same strip; RO keys via `k8s_get_configmap` |
| Disconnect | `workspace.closeAll` + `logs_close` |

## 004-pro-workspace-chrome — Quickstart

| Scenario | Result |
|----------|--------|
| Menubar Ambientes \| Temas | `AppMenubar`; no brand/status/EnvironmentSelector header |
| Env tree | `EnvTreeNav` lists all saved envs; label-only select; context Conectar/Desconectar/Editar |
| Multi-session | Runtime `sessions` map; connect B does not tear down A |
| Logs + drawer | Full-width logs; `LogWorkspace` + foldable `AnalysisDrawer` below |
| Theme | Temas → Claro/Oscuro via `useTheme` + `.dark` / `data-theme` |
| Tests | `npm test` includes US1–US3 unit/integration + `pro_chrome_primary_flow` E2E outline |

## 005-ui-chrome-polish — Quickstart

| Scenario | Result |
|----------|--------|
| Typography ~13px | Base UI at VS Code workbench scale |
| Plus/Minus icons | lucide expanders in EnvTreeNav |
| Ambientes menu | Nuevo… + Desconectar todo (always confirm) |
| Monitor rail | Title Monitor + `getVersion()` footer |
| Custom chrome | `decorations: false` + TitleBar themed |
| Splash ≥5s | `getSplashMinMs()` gate in App.tsx |

## Security pass (T083)

- Secrets: paths only in `connection_instance`; IAM file read at connect, token dropped.
- No third-party egress for analysis (`analyze_write_group` local rules).
- Fixtures under `fixtures/` are placeholders, not real credentials.
