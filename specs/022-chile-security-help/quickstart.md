# Quickstart: Chile Security Help (022)

## Prerequisites

- Feature artifacts under `specs/022-chile-security-help/`
- App workspace visible (`npm run tauri dev` or frontend test harness)

## Automated

```bash
npx vitest run tests/unit/chile_security_help.spec.tsx
```

Expected:

- Content/module or rendered dialog mentions **21.663** and **21.719** (or **19.628** with 21.663)
- Forbidden certification phrases absent
- (If covered) Ayuda → Seguridad path sets dialog open / shows title

## Manual validation

### V1 — Menú y diálogo

1. Abrir Faro en MainShell (demo o live; no hace falta conectar).
2. Menú **Ayuda** → primera opción **Seguridad**.
3. Verificar título tipo **Seguridad y marco normativo (Chile)**.
4. Verificar intro con disclaimer de responsabilidad organizacional.
5. Verificar las cuatro entradas: 21.663, ANCI/CSIRT, 19.628, 21.719.
6. Verificar sección **Cómo Faro se alinea** (5 temas del spec).
7. **Entendido** → diálogo cierra; catálogo/menús siguen usables.

### V2 — Sin sesión live

1. Sin ambientes conectados, repetir V1 pasos 2–7.

### V3 — Honestidad

1. Confirmar que el texto **no** dice que Faro está certificado por ANCI ni que cumple automáticamente como OIV.

## Contracts / model

- [contracts/help-seguridad-ui.md](./contracts/help-seguridad-ui.md)
- [data-model.md](./data-model.md)
