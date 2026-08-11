/** Chilean security/privacy help copy — single source of truth (022). */

export const SECURITY_DIALOG_TITLE =
  "Seguridad y marco normativo (Chile)";

export const SECURITY_INTRO =
  "Faro está diseñado con higiene de seguridad y privacidad en mente: facilita buenas prácticas alineadas al marco chileno, sin sustituir el cumplimiento formal de tu organización. " +
  "Las obligaciones de un Sistema de Gestión de Seguridad de la Información (SGSI), de un operador de importancia vital (OIV) o el reporte de incidentes siguen siendo responsabilidad del operador o de la empresa. " +
  "Este panel resume el marco normativo de referencia y cómo Faro se comporta hoy. " +
  "No constituye asesoría jurídica ni una certificación regulatoria.";

export type ChileNorm = {
  id: string;
  name: string;
  description: string;
};

export const CHILE_NORMS: ReadonlyArray<ChileNorm> = [
  {
    id: "ley-21663",
    name: "Ley 21.663 — Ley Marco de Ciberseguridad",
    description:
      "Establece el marco nacional de ciberseguridad, crea la Agencia Nacional de Ciberseguridad (ANCI) y define deberes reforzados para servicios esenciales y operadores de importancia vital (gestión de riesgos, continuidad e incidentes). Faro no convierte al usuario en OIV; es una herramienta que puede usarse dentro del SGSI de la organización.",
  },
  {
    id: "anci-csirt",
    name: "ANCI / CSIRT Nacional",
    description:
      "La ANCI coordina y supervisa la ciberseguridad a nivel país; el CSIRT Nacional articula la respuesta y recepción de reportes de incidentes relevantes. Faro no reporta automáticamente a estos organismos y no posee aval regulatorio de la ANCI.",
  },
  {
    id: "ley-19628",
    name: "Ley 19.628 — Protección de la vida privada",
    description:
      "Marco vigente de protección de datos personales en Chile hasta la reforma plena. Orienta el tratamiento responsable de información que pueda identificar o relacionarse con personas (p. ej. en logs o metadatos).",
  },
  {
    id: "ley-21719",
    name: "Ley 21.719 — Protección de datos personales (reforma)",
    description:
      "Moderniza la protección de datos, crea la Agencia de Protección de Datos Personales y refuerza principios como minimización, seguridad del tratamiento y límites al envío indebido a terceros. Vigencia plena orientativa desde el 1 de diciembre de 2026.",
  },
];

export const FARO_ALIGNMENT: ReadonlyArray<string> = [
  "No persiste PEM, tokens ni claves: solo rutas locales e identificadores no secretos (región, cluster, bastión).",
  "El tráfico de producto va solo hacia el bastión y el EKS que configuraste; no a backends de Faro ni a analítica de terceros.",
  "Sin telemetría de credenciales ni de contenidos de logs hacia terceros.",
  "En v1, las operaciones contra Kubernetes son de lectura/observación (listar, ver logs, analizar en local).",
  "Perfiles y preferencias viven en SQLite local; v1 no guarda dumps completos de logs en disco.",
];

export const SECURITY_CLOSE_LABEL = "Entendido";

/** Phrases that MUST NOT appear in Seguridad copy (FR-010 / US2). */
export const FORBIDDEN_SECURITY_CLAIMS: ReadonlyArray<string> = [
  "certificado por ANCI",
  "certificación ANCI",
  "certificado por la ANCI",
  "cumple automáticamente la Ley 21.663",
  "cumple automáticamente como OIV",
  "Faro está certificado",
];

export function securityDialogPlainText(): string {
  const norms = CHILE_NORMS.map(
    (n) => `${n.name}. ${n.description}`,
  ).join("\n");
  const align = FARO_ALIGNMENT.map((b) => `- ${b}`).join("\n");
  return [
    SECURITY_DIALOG_TITLE,
    SECURITY_INTRO,
    norms,
    "Cómo Faro se alinea",
    align,
    SECURITY_CLOSE_LABEL,
  ].join("\n");
}
