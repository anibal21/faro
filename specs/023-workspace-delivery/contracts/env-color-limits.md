# Contract: Env colors & config limit

## Palette

- Exactly **10** colors: indices `0..9`.
- Each defines light + dark values (CSS variables `--env-color-0` … `--env-color-9`).
- Must be visually distinct in both themes (manual SC-007).

## Assignment

- On create: lowest free `color_index`.
- On delete: index returns to pool.
- Updates of existing env keep color.

## UI

- Tree row: 3–4px vertical bar left of env name using `var(--env-color-N)`.
- Workspace tab from that env: border (or left accent) same color.
- Tab label may include short env name prefix (optional UX); color is required.

## Limit

- `env_upsert` create path: if `COUNT(*) >= 10` → error `"Máximo 10 configuraciones de conexión."` (or stable code + FE message).
- Updates to existing ids always allowed.
