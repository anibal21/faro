# Contract: Log workspace UI

## Scope

Operator-facing Deployment log tab and ConfigMap tab layout behaviors for feature 010.

## Deployment log toolbar

| Control | Behavior |
|---------|----------|
| Stick-to-bottom switch | Default **on** for new tabs. On → keep newest in view when new (follow) content arrives. Off → preserve scroll on new arrivals. |
| Auto-off | If switch is on and operator scrolls **up** away from bottom, switch turns **off**. |
| Toggle on | Turning on scrolls/jumps to newest content. |
| Load older | Explicit control; requests ~500 older lines **per matching Pod**; disabled/exhausted copy when beginning reached; shows loading while in flight. |
| Structured / Raw | Existing toggle; same follow session and same stick-to-bottom preference. |

## Scroll containers (Raw & Structured)

| Situation | Required behavior |
|-----------|-------------------|
| Stick on + new follow chunks | Viewport at (or within one screen of) newest end |
| Stick off + new follow chunks | Scroll position unchanged |
| Load older prepend | Preserve reading position via scrollHeight delta (no jump to top/bottom) |
| Analysis | Click error write-group → local rules analysis (existing); analysis drawer only on Deployment tabs |

## ConfigMap tab layout

| Requirement | Behavior |
|-------------|----------|
| Height | ConfigMap content uses maximum practical main-pane height below tab strip |
| No analysis chrome | MUST NOT show large empty lower analysis/log panel |
| Switch from Deployment | Leaving a log tab must not leave analysis footprint on ConfigMap |
| Switch back | Deployment log + analysis layout remains available |

## Copy (Spanish-friendly examples)

- Stick label: **Pegar al final** / **Auto-scroll** (match existing UI language)
- Load older: **Cargar 500 anteriores** (or equivalent)
- Exhausted: **Inicio del historial disponible**

## Accessibility

- Stick control is a switch/checkbox with accessible name.
- Load older is a button; disabled state announced when exhausted.

## Test doubles

- Scroll containers must be exercisable in jsdom/Testing Library (mock `scrollTop`/`scrollHeight` or thin helpers).
- `logs_load_older` mockable for prepend + exhaustion without live cluster.
