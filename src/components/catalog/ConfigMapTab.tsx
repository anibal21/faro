import type { ConfigMapDetail } from "../../lib/ipc";

type ConfigMapTabProps = {
  name: string;
  detail: ConfigMapDetail | null;
};

export function ConfigMapTab({ name, detail }: ConfigMapTabProps) {
  if (!detail) {
    return <p className="configmap-tab__empty">Sin datos para {name}</p>;
  }
  return (
    <div className="configmap-tab">
      <header className="configmap-tab__head">
        <h3>
          {detail.namespace}/{detail.name}
        </h3>
        <span>solo lectura</span>
      </header>
      <div className="configmap-tab__keys">
        {detail.entries.map((entry) => (
          <div key={entry.keyName} className="configmap-tab__entry">
            <div className="configmap-tab__key">{entry.keyName}</div>
            <pre>
              {entry.isBinary
                ? `(binario, ${entry.byteLength ?? "?"} bytes)`
                : (entry.valueText ?? "")}
              {entry.isTruncated ? "\n…(truncado)" : ""}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
