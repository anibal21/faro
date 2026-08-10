# Research: Env Test Polish

## R1 — Fixed cross-theme env colors

**Decision**: Replace light/dark pairs with **one** bright metallic hex per index `0..9`. Set the same value on `:root` and `.dark` / `[data-theme="dark"]` for `--env-color-N`. Update `ENV_COLORS` in `envColors.ts` to a single `hex` (or `light === dark`).

**Rationale**: Spec FR-001; current CSS already diverges light vs dark pastels.

**Alternatives**: Keep dual tokens with same hex (redundant). User-selectable colors (out of scope).

**Candidate palette** (metallic / jewel, distinct): chrome-cyan, copper, gold, emerald, cobalt, violet, magenta, steel-blue, bronze, silver-rose — finalize in implement with contrast check on `#fff` and `#0a0a0a` backgrounds.

## R2 — Fixtures hydrate per environment

**Decision**: On connect, if instance is builtin demo **OR** profile uses test fixtures (e.g. PEM path resolves to `fixtures/demo.pem` / explicit `useTestFixtures` / same offline sentinel as demo fields), use `ConnectMode::Demo` and `hydrate_demo_catalog(&conn, &instance_id, &epoch)` for **that** id — not only `faro-demo`.

**Rationale**: Spec wants multi-env test: two fixture-backed envs each get catalog rows keyed by their `connection_instance_id`.

**Alternatives**: Only one global demo (status quo — fails US2). Full live connect to fake API (unnecessary).

**Detection**: Prefer path-suffix / canonical fixture path match or a stored flag `is_test_fixture` set when user clicks “Usar fixtures demo” on upsert. Flag is clearer for multi custom names.

## R3 — Pegar al final layout

**Decision**: Wrap checkbox+span in `label` with `display: inline-flex; align-items: center; gap: 0.35rem; margin-left: auto` (or toolbar `justify-between` / spacer) so the control group sits on the right next to each other. Remove any `flex-1` / `justify-between` inside the label that pushes text away.

**Rationale**: Current markup separates checkbox and text across the toolbar width.

**Alternatives**: Absolute positioning (fragile).

## R4 — Metrics visibility

**Decision**: In `WorkloadSummaryStrip`, build segments only for present values; omit RAM/CPU/Uptime when null/empty; keep Replicas if summary exists. When `summary` is null, show minimal “Replicas: …” loading or hide metrics line entirely (prefer short “Cargando resumen…” or replicas-only placeholder without fake N/D metrics).

**Rationale**: Spec FR-007/008; today `nd()` forces “N/D” for all.

**Alternatives**: Show “—” (still noise — rejected).
