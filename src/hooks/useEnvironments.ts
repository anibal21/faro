import { useCallback, useEffect, useState } from "react";
import {
  ConnectionInstance,
  EnvUpsertInput,
  envDelete,
  envList,
  envUpsert,
} from "../lib/ipc";

export function useEnvironments(enabled = true) {
  const [environments, setEnvironments] = useState<ConnectionInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await envList();
      setEnvironments(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  const upsert = useCallback(
    async (payload: EnvUpsertInput) => {
      const saved = await envUpsert(payload);
      await refresh();
      return saved;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await envDelete(id);
      await refresh();
    },
    [refresh],
  );

  return {
    environments,
    loading,
    error,
    refresh,
    upsert,
    remove,
  };
}
