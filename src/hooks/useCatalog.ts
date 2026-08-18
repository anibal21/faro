import { useCallback, useEffect, useRef, useState } from "react";
import {
  k8sListConfigmaps,
  k8sListDeployments,
  k8sListPods,
  k8sListServices,
  type ConfigMapRow,
  type DeploymentRow,
  type FlatPodRow,
  type ServiceRow,
} from "../lib/ipc";

export type InstanceCatalog = {
  deployments: DeploymentRow[];
  pods: FlatPodRow[];
  services: ServiceRow[];
  configMaps: ConfigMapRow[];
  loading: boolean;
  error: string | null;
};

const emptyCatalog = (): InstanceCatalog => ({
  deployments: [],
  pods: [],
  services: [],
  configMaps: [],
  loading: false,
  error: null,
});

/** Per connected instance — avoids cross-env catalog bleed when switching focus (023/029). */
export function useCatalog(
  connectedIds: string[],
  focusId: string | null,
  liveGeneration: number,
) {
  const [byInstance, setByInstance] = useState<Record<string, InstanceCatalog>>(
    {},
  );
  const connectedRef = useRef(connectedIds);
  connectedRef.current = connectedIds;

  const refreshInstance = useCallback(async (instanceId: string) => {
    if (!instanceId) return;
    setByInstance((prev) => ({
      ...prev,
      [instanceId]: {
        ...(prev[instanceId] ?? emptyCatalog()),
        loading: true,
        error: null,
      },
    }));
    try {
      const [deps, podRows, svcRows, cmRows] = await Promise.all([
        k8sListDeployments(undefined, instanceId),
        k8sListPods(instanceId).catch(() => [] as FlatPodRow[]),
        k8sListServices(instanceId).catch(() => [] as ServiceRow[]),
        k8sListConfigmaps(instanceId).catch(() => [] as ConfigMapRow[]),
      ]);
      setByInstance((prev) => ({
        ...prev,
        [instanceId]: {
          deployments: deps,
          pods: podRows,
          services: svcRows,
          configMaps: cmRows,
          loading: false,
          error: null,
        },
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setByInstance((prev) => ({
        ...prev,
        [instanceId]: {
          ...emptyCatalog(),
          loading: false,
          error: message,
        },
      }));
    }
  }, []);

  const refreshAllConnected = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => refreshInstance(id)));
    },
    [refreshInstance],
  );

  // Drop cache rows for disconnected instances
  useEffect(() => {
    const connected = new Set(connectedIds);
    setByInstance((prev) => {
      const next: Record<string, InstanceCatalog> = {};
      for (const id of connected) {
        if (prev[id]) next[id] = prev[id];
      }
      return next;
    });
  }, [connectedIds]);

  // Load catalog for each newly connected instance
  useEffect(() => {
    for (const id of connectedIds) {
      void refreshInstance(id);
    }
  }, [connectedIds.join("|"), refreshInstance]);

  // Focus / workspace generation: refresh focused env (log tabs invalidate)
  useEffect(() => {
    if (focusId && connectedIds.includes(focusId)) {
      void refreshInstance(focusId);
    }
  }, [focusId, liveGeneration, connectedIds, refreshInstance]);

  const focused = focusId ? (byInstance[focusId] ?? emptyCatalog()) : emptyCatalog();

  return {
    byInstance,
    deployments: focused.deployments,
    pods: focused.pods,
    services: focused.services,
    configMaps: focused.configMaps,
    error: focused.error,
    loading: focused.loading,
    refresh: () => (focusId ? refreshInstance(focusId) : Promise.resolve()),
    refreshInstance,
    refreshAllConnected,
  };
}
