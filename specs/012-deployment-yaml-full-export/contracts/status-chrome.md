# Contract: Status chrome

## Remove

- Default / placeholder status **`iniciando`** (and English `starting` if any) MUST NOT appear in the log toolbar during normal open/follow start.

## Keep

- Actionable follow states (e.g. `siguiendo`, pod-count variants).
- Error / disconnect messages (sanitized).
- Load-older messages (`Cargando…`, `Inicio del historial`, etc.).

## FE

- Do not initialize tab `status` to `"iniciando"`.
- Optional: hide status span when empty / whitespace.
