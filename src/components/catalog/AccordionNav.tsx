import type { ConfigMapRow, DeploymentRow } from "../../lib/ipc";
import { useState } from "react";

type AccordionNavProps = {
  connected: boolean;
  deployments: DeploymentRow[];
  configMaps: ConfigMapRow[];
  loading?: boolean;
  error?: string | null;
  onOpenDeployment: (namespace: string, name: string) => void;
  onOpenConfigMap: (namespace: string, name: string) => void;
  onRefresh?: () => void;
};

export function AccordionNav({
  connected,
  deployments,
  configMaps,
  loading,
  error,
  onOpenDeployment,
  onOpenConfigMap,
  onRefresh,
}: AccordionNavProps) {
  const [podsOpen, setPodsOpen] = useState(true);
  const [cmsOpen, setCmsOpen] = useState(true);

  return (
    <aside className="accordion-nav" aria-label="Catalogo">
      <header className="accordion-nav__head">
        <h3>Navegacion</h3>
        {connected && onRefresh && (
          <button type="button" onClick={onRefresh} title="Refrescar catalogo">
            Refrescar
          </button>
        )}
      </header>
      {!connected && (
        <p className="accordion-nav__hint">
          Conecta un ambiente para ver el catalogo.
        </p>
      )}
      {loading && <p className="accordion-nav__hint">Cargando…</p>}
      {error && <p className="accordion-nav__error">{error}</p>}

      <button
        type="button"
        className="accordion-nav__section"
        aria-expanded={podsOpen}
        onClick={() => setPodsOpen((v) => !v)}
      >
        {podsOpen ? "v" : ">"} Pods
      </button>
      {podsOpen && (
        <ul className="accordion-nav__list">
          {connected && deployments.length === 0 && (
            <li className="accordion-nav__empty">Sin deployments</li>
          )}
          {deployments.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="accordion-nav__item"
                onClick={() => onOpenDeployment(d.namespace, d.name)}
              >
                <span>{d.name}</span>
                <em>
                  {d.readyReplicas}/{d.replicaCount}
                </em>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="accordion-nav__section"
        aria-expanded={cmsOpen}
        onClick={() => setCmsOpen((v) => !v)}
      >
        {cmsOpen ? "v" : ">"} ConfigMaps
      </button>
      {cmsOpen && (
        <ul className="accordion-nav__list">
          {connected && configMaps.length === 0 && (
            <li className="accordion-nav__empty">Sin ConfigMaps</li>
          )}
          {configMaps.map((cm) => (
            <li key={cm.id}>
              <button
                type="button"
                className="accordion-nav__item"
                onClick={() => onOpenConfigMap(cm.namespace, cm.name)}
              >
                <span>{cm.name}</span>
                <em>{cm.keyCount} keys</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
