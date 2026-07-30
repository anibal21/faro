import type { ServiceDetail } from "../../lib/ipc";

type ServiceDetailTabProps = {
  detail: ServiceDetail | null;
  name: string;
};

export function ServiceDetailTab({ detail, name }: ServiceDetailTabProps) {
  if (!detail) {
    return <p className="configmap-tab__empty">Sin datos para {name}</p>;
  }
  let ports: unknown = [];
  let selector: unknown = {};
  try {
    ports = detail.portsJson ? JSON.parse(detail.portsJson) : [];
  } catch {
    ports = detail.portsJson;
  }
  try {
    selector = detail.selectorJson ? JSON.parse(detail.selectorJson) : {};
  } catch {
    selector = detail.selectorJson;
  }
  return (
    <div className="configmap-tab" data-testid="service-detail">
      <header className="configmap-tab__head">
        <h3>
          {detail.namespace}/{detail.name}
        </h3>
        <span>solo lectura</span>
      </header>
      <div className="configmap-tab__keys">
        <div className="configmap-tab__entry">
          <div className="configmap-tab__key">Type</div>
          <pre>{detail.serviceType ?? "N/D"}</pre>
        </div>
        <div className="configmap-tab__entry">
          <div className="configmap-tab__key">Cluster IP</div>
          <pre>{detail.clusterIp ?? "N/D"}</pre>
        </div>
        <div className="configmap-tab__entry">
          <div className="configmap-tab__key">Ports</div>
          <pre>{JSON.stringify(ports, null, 2)}</pre>
        </div>
        <div className="configmap-tab__entry">
          <div className="configmap-tab__key">Selector</div>
          <pre>{JSON.stringify(selector, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
