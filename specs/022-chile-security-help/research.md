# Research: Chile Security Help

## R1 — Where to place Ayuda

**Decision**: Add a third `MenubarMenu` **Ayuda** to `AppMenubar`, with first item **Seguridad**.

**Rationale**: `AppMenubar` already owns Ambientes/Temas; operators already look at the top menubar. Matches FR-001/002 without TitleBar clutter.

**Alternatives considered**:
- Context-only help — harder to discover.
- Separate window — overkill; spec requires in-app modal.

## R2 — Dialog primitive

**Decision**: Use existing `src/components/ui/dialog.tsx` (Radix Dialog) with a wider `className` than the default 28rem if content needs it (e.g. `min(36rem, 92vw)` + max-height scroll).

**Rationale**: Same pattern as other overlays; accessible title/close; no new dependency.

**Alternatives considered**:
- Custom `NewEnvironmentModal`-style only CSS — works but duplicates focus trap; prefer shared Dialog.
- Navigate to a full-page route — conflicts with workspace-tab model.

## R3 — Content module shape

**Decision**: `src/content/chileSecurity.ts` exports:

- `SECURITY_DIALOG_TITLE`
- `SECURITY_INTRO` (2–4 sentences)
- `CHILE_NORMS: { id, name, description }[]` — at least 21.663, ANCI/CSIRT, 19.628, 21.719
- `FARO_ALIGNMENT: string[]`
- `SECURITY_DISCLAIMER` (org responsibility)
- Optional `OFFICIAL_LINKS` empty or curated; default **no links in v1** to avoid egress/UX complexity unless trivial

**Rationale**: FR-011 single source of truth; tests import the same strings/ids.

**Alternatives considered**:
- Markdown file loaded at runtime — unnecessary for static short copy.
- Hardcode in JSX — fails maintainability FR.

## R4 — Honest language / forbidden claims

**Decision**: Explicitly ban phrases like “certificado por ANCI”, “cumple automáticamente la 21.663 como OIV”. Unit test asserts norms present and forbidden substrings absent from rendered text.

**Rationale**: US2 / FR-010; reduces legal/reputation risk.

**Alternatives considered**: Legal review gate only — still need automated regression on copy.

## R5 — First-run responsibility notice (Should / FR-015)

**Decision**: **Defer** first-run splash to a follow-up task unless trivial; Must path is Ayuda → Seguridad only.

**Rationale**: Spec marks FR-015 as Should; avoids blocking MVP of the dialog.

**Alternatives considered**: Prefs flag `securityNoticeSeen` — good later, not required for plan Must.

## R6 — No new network

**Decision**: Opening Seguridad performs zero `invoke` and zero `fetch`. If official links are added later, use OS open-URL only without query params containing user data.

**Rationale**: FR-009 / SC-006 / Constitution VI.
