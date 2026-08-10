# Contract: Pegar al final layout

## Markup / layout

- Checkbox and label text are one visual group.
- Group aligned to the **right** of the log toolbar row (or end of flex row).
- Gap between checkbox and text ≈ 4–8px (`gap-1` / `0.35rem`).
- Must not use a layout that places checkbox at flex-start and text at flex-end of the full toolbar.

## A11y

Keep `aria-label` / associated label text “Pegar al final”.
