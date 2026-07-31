import type { AnalysisFinding } from "../../lib/ipc";
import { RULE_PACKS } from "../../lib/ipc";

type FindingPanelProps = {
  findings: AnalysisFinding[] | null;
  packId?: string | null;
  packDisplayName?: string | null;
  onPackChange?: (packId: string) => void;
  onClose: () => void;
};

export function FindingPanel({
  findings,
  packId,
  packDisplayName,
  onPackChange,
  onClose,
}: FindingPanelProps) {
  if (findings === null) return null;

  const label = packDisplayName?.trim() || "reglas locales";

  return (
    <aside className="finding-panel" aria-label="Análisis">
      <header>
        <h3>Hallazgos</h3>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </header>
      {(packDisplayName || onPackChange) && (
        <div className="finding-panel__pack">
          {packDisplayName && (
            <p className="finding-panel__pack-label">
              Paquete: <strong>{packDisplayName}</strong>
            </p>
          )}
          {onPackChange && (
            <label>
              Cambiar paquete{" "}
              <select
                aria-label="Paquete de reglas"
                value={packId ?? RULE_PACKS[0].id}
                onChange={(e) => onPackChange(e.target.value)}
              >
                {RULE_PACKS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      {findings.length === 0 ? (
        <p className="finding-panel__empty">
          Sin coincidencias en el paquete de reglas {label}.
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
