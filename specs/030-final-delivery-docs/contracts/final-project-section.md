# Contract: Final project section + ficha URLs

## Purpose

Cierre narrativo del máster + URLs instalables.

## Ficha (`0-ficha-del-proyecto.md` + eco README)

| Campo | Valor requerido |
|-------|-----------------|
| URL del proyecto (versión / demo instalable) | `https://github.com/anibal21/faro/releases` |
| URL del repositorio | `https://github.com/anibal21/faro` |
| Versión estable citada | `1.3.0` (o la vigente al momento del merge si se bumpa) |

## Sección “Proyecto final” (README)

MUST incluir, en lenguaje de producto:

- Qué es Faro al cierre (monitoreo EKS vía bastión; demo con fixtures)
- Entregables: docs `0`–`7`, Spec Kit, instaladores multi-OS, `DEMO.md`
- Cómo demostrar: Releases + guía DEMO (sin AWS obligatorio)
- Mapa de tres entregas (PR1 doc, PR2 producto, PR3 cierre)
- Fuera de alcance relevante (mutar cluster, secretos en SQLite, IA generativa in-app)
- Enlace explícito a Releases

## Acceptance check

- [ ] Ningún “quedará disponible al final” / HTML comment vacío en ficha 0.4–0.5  
- [ ] README menciona Releases y DEMO  
- [ ] Sección proyecto final legible en ≤5 minutos
