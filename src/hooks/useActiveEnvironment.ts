import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConnectionInstance, WorkspaceState } from "../lib/ipc";
import { envLoad, envSetActive, envWorkspaceGet } from "../lib/ipc";

const empty: WorkspaceState = {
  loadedIds: [],
  activeId: null,
  liveGeneration: 0,
};

export function useActiveEnvironment(
  allEnvironments: ConnectionInstance[],
  enabled = true,
) {
  const [workspace, setWorkspace] = useState<WorkspaceState>(empty);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await envWorkspaceGet();
      setWorkspace(state);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  const loaded = useMemo(
    () =>
      workspace.loadedIds
        .map((id) => allEnvironments.find((e) => e.id === id))
        .filter((e): e is ConnectionInstance => Boolean(e)),
    [workspace.loadedIds, allEnvironments],
  );

  const active = useMemo(
    () => loaded.find((e) => e.id === workspace.activeId) ?? null,
    [loaded, workspace.activeId],
  );

  const load = useCallback(async (ids: string[]) => {
    const state = await envLoad(ids);
    setWorkspace(state);
    return state;
  }, []);

  const setActive = useCallback(async (id: string) => {
    const state = await envSetActive(id);
    setWorkspace(state);
    return state;
  }, []);

  return {
    workspace,
    loaded,
    active,
    liveGeneration: workspace.liveGeneration,
    error,
    refresh,
    load,
    setActive,
  };
}
