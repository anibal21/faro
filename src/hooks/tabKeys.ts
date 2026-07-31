export function deploymentNavKey(namespace: string, name: string): string {
  return `deployment-yaml:${namespace}/${name}`;
}

export function deployLogsNavKey(namespace: string, deployment: string): string {
  return `deploy-logs:${namespace}/${deployment}`;
}

export function configmapNavKey(namespace: string, name: string): string {
  return `configmap:${namespace}/${name}`;
}
