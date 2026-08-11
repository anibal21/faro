function scoped(instanceId: string, kindKey: string): string {
  return `${instanceId}|${kindKey}`;
}

export function deploymentNavKey(instanceId: string, namespace: string, name: string): string {
  return scoped(instanceId, `deployment-yaml:${namespace}/${name}`);
}

export function deployLogsNavKey(instanceId: string, namespace: string, deployment: string): string {
  return scoped(instanceId, `deploy-logs:${namespace}/${deployment}`);
}

export function podNavKey(instanceId: string, namespace: string, name: string): string {
  return scoped(instanceId, `pod:${namespace}/${name}`);
}

export function configmapNavKey(instanceId: string, namespace: string, name: string): string {
  return scoped(instanceId, `configmap:${namespace}/${name}`);
}

export function serviceNavKey(instanceId: string, namespace: string, name: string): string {
  return scoped(instanceId, `svc:${namespace}/${name}`);
}
