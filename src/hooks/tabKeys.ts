export function deploymentNavKey(namespace: string, name: string): string {
  return `deployment:${namespace}/${name}`;
}

export function configmapNavKey(namespace: string, name: string): string {
  return `configmap:${namespace}/${name}`;
}
