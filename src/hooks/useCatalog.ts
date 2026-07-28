import { useCallback, useEffect, useState } from "react";
import {
  k8sListDeployments,
  type DeploymentRow,
} from "../lib/ipc";

export function useCatalog(connected: boolean, liveGeneration: number) {
  const [deployments, setDeployments] = useState<DeploymentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!connected) {
      setDeployments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await k8sListDeployments();
      setDeployments(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    void refresh();
  }, [refresh, liveGeneration, connected]);

  return { deployments, error, loading, refresh };
}
