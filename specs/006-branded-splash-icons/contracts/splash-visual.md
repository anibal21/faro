# UI Contract: Splash visual (006)

## Layout

| Zone | Content |
|------|---------|
| Full window content | Branded splash image (`object-fit: cover` / CSS cover) |
| Center | **No** duplicate Faro title / tagline overlay |
| Bottom-right | Optional compact status or error text |
| Fallback | Solid dark navy until image paints |

## Props (SplashView)

| Prop | Behavior |
|------|----------|
| `status` | If provided and no error, may show bottom-right; empty/`null` → image-only OK |
| `error` | Bottom-right, error styling; takes precedence over status |

## Non-goals

- Redesign illustration
- Change splash dwell duration (owned by 005)
