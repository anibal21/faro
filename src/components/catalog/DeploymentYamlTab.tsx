type DeploymentYamlTabProps = {
  name: string;
  namespace: string;
  yamlText: string | null;
};

export function DeploymentYamlTab({
  name,
  namespace,
  yamlText,
}: DeploymentYamlTabProps) {
  if (!yamlText) {
    return (
      <p className="configmap-tab__empty">Sin YAML para {namespace}/{name}</p>
    );
  }
  return (
    <div className="configmap-tab" data-testid="deployment-yaml">
      <header className="configmap-tab__head">
        <h3>
          {namespace}/{name}
        </h3>
        <span>solo lectura · YAML</span>
      </header>
      <div className="configmap-tab__keys">
        <pre className="configmap-tab__yaml whitespace-pre-wrap break-all p-2 font-mono text-[12px]">
          {yamlText}
        </pre>
      </div>
    </div>
  );
}
