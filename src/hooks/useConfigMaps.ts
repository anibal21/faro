import { useCallback, useEffect, useState } from "react";
import {
  k8sGetConfigmap,
  k8sListConfigmaps,
  type ConfigMapDetail,
  type ConfigMapRow,
} from "../lib/ipc";

export function useConfigMaps(connected: boolean, liveGeneration: number) {
  const [items, setItems] = useState<ConfigMapRow[]>([]);
  const [selected, setSelected] = useState<ConfigMapDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!connected) {
      setItems([]);
      setSelected(null);
      return;
    }
    setError(null);
    try {
      setItems(await k8sListConfigmaps());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    }
  }, [connected]);

  useEffect(() => {
    void refresh();
  }, [refresh, liveGeneration, connected]);

  const open = useCallback(async (namespace: string, name: string) => {
    setError(null);
    try {
      setSelected(await k8sGetConfigmap(namespace, name));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return { items, selected, setSelected, open, refresh, error };
}
