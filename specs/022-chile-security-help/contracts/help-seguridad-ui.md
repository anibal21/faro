# Contract: Help → Seguridad UI

## Menubar

| Control | Label | Behavior |
|---------|-------|----------|
| Menu | `Ayuda` | New menu after existing ones (Ambientes, Temas) |
| First item | `Seguridad` | `onSelect` → open security dialog (`preventDefault` not required if dialog state is set) |

Usable with or without live session (no guards on `connectedIds`).

## Dialog

| Element | Content |
|---------|---------|
| Title | `Seguridad y marco normativo (Chile)` (or equivalent clear title) |
| Intro | 2–4 sentences: Faro facilitates security/privacy hygiene; formal compliance (SGSI / OIV duties) remains the organization’s responsibility |
| Norm list | Each: **name** + short **description** |
| Section heading | `Cómo Faro se alinea` |
| Alignment | Bullets per [data-model.md](../data-model.md) |
| Primary close | `Entendido` (closes dialog) |
| Secondary close | Overlay click / Escape via Dialog primitive OK |

### Required norms (order preferred)

1. Ley 21.663 — Ley Marco de Ciberseguridad  
2. ANCI / CSIRT Nacional  
3. Ley 19.628  
4. Ley 21.719  

### Forbidden claims (MUST NOT appear)

- Certificado por ANCI / certificación ANCI de Faro  
- Cumple automáticamente la Ley 21.663 como OIV  
- Equivalents that imply Faro replaces organizational compliance  

## Content module API (frontend)

```ts
// src/content/chileSecurity.ts
export const SECURITY_DIALOG_TITLE: string;
export const SECURITY_INTRO: string;
export const CHILE_NORMS: ReadonlyArray<{ id: string; name: string; description: string }>;
export const FARO_ALIGNMENT: ReadonlyArray<string>;
export const SECURITY_CLOSE_LABEL: string; // "Entendido"
```

Tests import `CHILE_NORMS` / render `SecurityDialog` open and assert copy.

## Network

Opening Seguridad: **no** IPC, **no** HTTP. Optional future official links: OS open only, no user/cluster query params.

## Non-goals

- CSIRT auto-report, SQLite encryption, PII redaction in logs, keep-alive/IPC changes.
