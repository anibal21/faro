import type { AnalysisFinding } from "../../lib/ipc";
import { RULE_PACKS } from "../../lib/ipc";
import { Button } from "../ui/button";

type AnalysisDrawerProps = {
  findings: AnalysisFinding[] | null;
  packId?: string | null;
  packDisplayName?: string | null;
  signalSnippet?: string | null;
  onPackChange?: (packId: string) => void;
  onClose: () => void;
};

export function AnalysisDrawer({
  findings,
  packId,
  packDisplayName,
  signalSnippet,
  onPackChange,
  onClose,
}: AnalysisDrawerProps) {
  const label = packDisplayName?.trim() || "reglas locales";

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-xs">
      <header className="flex items-center justify-between border-b border-border px-2 py-1">
        <h3 className="text-xs font-semibold">Analisis / Hallazgos</h3>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {(packDisplayName || onPackChange) && findings !== null && (
          <div className="mb-2 space-y-1 border-b border-border pb-2">
            {packDisplayName && (
              <p className="m-0 text-muted-foreground">
                Paquete:{" "}
                <strong className="text-foreground">{packDisplayName}</strong>
              </p>
            )}
            {onPackChange && (
              <label className="flex items-center gap-1.5">
                <span>Cambiar paquete</span>
                <select
                  aria-label="Paquete de reglas"
                  className="rounded border border-border bg-background px-1 py-0.5"
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
        {signalSnippet ? (
          <div className="mb-2 rounded border border-border bg-muted/40 p-2">
            <p className="m-0 mb-1 font-semibold">Señal en el log</p>
            <pre className="m-0 max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px]">
              {signalSnippet}
            </pre>
          </div>
        ) : null}
        {findings === null ? (
          <p className="text-muted-foreground">
            Selecciona un write-group Structured y analiza para ver hallazgos.
          </p>
        ) : findings.length === 0 ? (
          <p className="text-muted-foreground">
            Sin coincidencias en el paquete de reglas {label}.
          </p>
        ) : (
          <ul className="space-y-3">
            {findings.map((f) => (
              <li
                key={f.ruleId}
                className="border-b border-border pb-2"
                data-severity={f.severity}
              >
                <div className="font-semibold">
                  {f.title || f.ruleId}{" "}
                  <span className="uppercase text-muted-foreground">
                    ({f.severity})
                  </span>
                </div>
                <code className="text-[11px] text-muted-foreground">{f.ruleId}</code>
                {f.summary ? <p className="mt-1 m-0">{f.summary}</p> : null}
                {f.why ? (
                  <p className="m-0 mt-1 text-muted-foreground">
                    <strong>Por qué:</strong> {f.why}
                  </p>
                ) : null}
                {f.whatToLookFor?.length ? (
                  <div className="mt-1">
                    <strong>Qué mirar:</strong>
                    <ul className="m-0 mt-0.5 list-disc pl-4">
                      {f.whatToLookFor.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {f.recommendation?.length ? (
                  <div className="mt-1">
                    <strong>Recomendación:</strong>
                    <ul className="m-0 mt-0.5 list-disc pl-4 text-muted-foreground">
                      {f.recommendation.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
