import { useCallback, useEffect, useState } from "react";
import {
  k8sListDeployments,
  k8sListPods,
  k8sListServices,
  type DeploymentRow,
  type FlatPodRow,
  type ServiceRow,
} from "../lib/ipc";

export function useCatalog(connected: boolean, liveGeneration: number) {
  const [deployments, setDeployments] = useState<DeploymentRow[]>([]);
  const [pods, setPods] = useState<FlatPodRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!connected) {
      setDeployments([]);
      setPods([]);
      setServices([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [deps, podRows, svcRows] = await Promise.all([
        k8sListDeployments(),
        k8sListPods().catch(() => [] as FlatPodRow[]),
        k8sListServices().catch(() => [] as ServiceRow[]),
      ]);
      setDeployments(deps);
      setPods(podRows);
      setServices(svcRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDeployments([]);
      setPods([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    void refresh();
  }, [refresh, liveGeneration, connected]);

  return { deployments, pods, services, error, loading, refresh };
}
