import type { AnalysisFinding } from "../../lib/ipc";

type FindingPanelProps = {
  findings: AnalysisFinding[] | null;
  onClose: () => void;
};

export function FindingPanel({ findings, onClose }: FindingPanelProps) {
  if (findings === null) return null;

  return (
    <aside className="finding-panel" aria-label="Análisis">
      <header>
        <h3>Hallazgos</h3>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </header>
      {findings.length === 0 ? (
        <p className="finding-panel__empty">
          Sin coincidencias en el paquete de reglas Spring Boot.
        </p>
      ) : (
        <ul>
          {findings.map((f) => (
            <li key={f.ruleId} data-severity={f.severity}>
              <strong>{f.severity}</strong> · <code>{f.ruleId}</code>
              <p>{f.explanation}</p>
              <p className="finding-panel__rec">{f.recommendation}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
