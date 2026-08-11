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
| Menubar Ambientes \| Temas \| Ayuda | `AppMenubar`; Ayuda → Seguridad (022); no brand/status/EnvironmentSelector header |
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

## 023-workspace-delivery

Automatizado:

```bash
npx vitest run tests/unit/sidebar_width.spec.ts tests/unit/window_geometry_min.spec.ts tests/unit/env_colors.spec.ts tests/unit/tab_keys_instance.spec.ts tests/unit/workspace_tabs_multi_env.spec.ts tests/unit/connection_cap.spec.tsx tests/unit/env_config_cap.spec.ts tests/unit/nsis_faro_config.spec.ts tests/unit/demo_fixtures.spec.ts
cargo test --manifest-path src-tauri/Cargo.toml db::connection_instance
```

Validación manual:
- Conectar dos ambientes y abrir el mismo recurso en ambos; deben existir dos pestañas con bordes de color diferentes.
- Intentar una tercera conexión; debe aparecer “Límite de conexiones”.
- Desconectar o eliminar un ambiente; solo sus pestañas deben cerrarse.
- Eliminar `faro-demo`, refrescar y confirmar que no reaparece; “Usar fixtures demo / restaurar demo” debe recuperarlo.
- Arrastrar el separador del panel entre 200 y 360 px y reiniciar para verificar la preferencia.
- Construir NSIS y comprobar español, licencia MIT, publisher, iconos y accesos directos.

## 024-env-test-polish

Automatizado:

```bash
npx vitest run tests/unit/env_colors_fixed.spec.ts tests/unit/env_colors.spec.ts tests/unit/fixture_env_upsert.spec.ts tests/unit/stick_to_bottom_layout.spec.tsx tests/unit/workload_summary_visibility.spec.tsx
cargo test --manifest-path src-tauri/Cargo.toml fixture_backed
cargo test --manifest-path src-tauri/Cargo.toml hydrate_demo_catalog_scopes
```

Notas:
- Colores de ambiente: una sola paleta metálica (light === dark).
- Conectar un perfil con `fixtures/demo.pem` hidrata el catálogo demo para ese `instance_id` (multi-env de prueba).
- “Pegar al final”: grupo compacto alineado a la derecha del toolbar.
- RAM/CPU/Uptime en el strip solo si hay valor (sin `N/D`).

## 025-github-release-update

Automatizado:

```bash
npx vitest run tests/unit/update_offer_ui.spec.tsx tests/unit/use_app_update_check.spec.tsx tests/unit/update_install_accept.spec.tsx tests/unit/app_menubar_check_updates.spec.tsx
```

Release / `latest.json` (multiplatform — see also §026):

1. Generate signing keys once (`npx tauri signer generate -w .tauri/faro.key --ci`); put **private** key in GitHub secret `TAURI_SIGNING_PRIVATE_KEY`; keep **pubkey** in `src-tauri/tauri.conf.json`.
2. Publish a GitHub Release → workflow `.github/workflows/release-updater.yml` builds **Windows + macOS + Linux** packages, uploads assets, and publishes multiplatform `latest.json`.
3. Feed URL: `https://github.com/anibal21/faro/releases/latest/download/latest.json` (`windows-x86_64`, `darwin-x86_64`, `linux-x86_64`).
4. In-app **Accept → install** remains **Windows-first**; macOS/Linux use the feed for version checks / manual download from the Release page.

Manual (Windows):

| Scenario | Expect |
|----------|--------|
| Startup with older install vs feed | Dialog after main workspace (not during splash) |
| Accept | Download progress → NSIS (per-user, no admin); prior install usable if fail |
| Ahora no | Dismiss for session; next cold start re-offers if still newer |
| Ayuda → Buscar actualizaciones… | Offer / “Ya estás en la última versión” / clear error |
| Non-Windows | Informational copy; **Actualizar** disabled |

## 026-multi-platform-release

See **[docs/RELEASE.md](docs/RELEASE.md)** for maintainer cut-release and team install (Win / macOS Gatekeeper / Linux AppImage+.deb).

Automatizado:

```bash
npx vitest run tests/unit/release_bundle_conf.spec.ts tests/unit/nsis_faro_config.spec.ts tests/unit/latest_json_multiplatform.spec.ts
```

Quickstart: `specs/026-multi-platform-release/quickstart.md` (V0–V5).

| Check | Expect |
|-------|--------|
| `tauri.conf.json` | `installMode: currentUser`; targets include `nsis`, `dmg`, `appimage`, `deb` |
| Ready release | NSIS + DMG + AppImage + `.deb` + `latest.json` (Source code zip ≠ product) |
| Missing any package | CI `publish` / verify script fails (strict gate) |
| Notarization | None in workflow (document Gatekeeper bypass) |
