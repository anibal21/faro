import { useCallback, useEffect, useState } from "react";
import {
  envConnectionStates,
  envSetKeepAlive,
  listenEvent,
  type ConnectionHealthState,
} from "../lib/ipc";

function normalizeHealth(
  raw: Partial<ConnectionHealthState> & Record<string, unknown>,
): ConnectionHealthState | null {
  const instanceId =
    (raw.instanceId as string | undefined) ??
    (raw.instance_id as string | undefined);
  if (!instanceId) return null;
  const keepAliveRaw = raw.keepAlive ?? raw.keep_alive;
  const keepAlive = keepAliveRaw === true;
  const status = (raw.status as string | undefined) ?? "connected";
  const lastPulseAt =
    (raw.lastPulseAt as string | null | undefined) ??
    (raw.last_pulse_at as string | null | undefined) ??
    null;
  const mode = (raw.mode as string | undefined) ?? "live";
  return { instanceId, status, keepAlive, lastPulseAt, mode };
}

export function useConnectionHealth(pollWhen: boolean) {
  const [byId, setById] = useState<Record<string, ConnectionHealthState>>({});

  const refresh = useCallback(async () => {
    try {
      const list = await envConnectionStates();
      const next: Record<string, ConnectionHealthState> = {};
      for (const row of list) {
        const n = normalizeHealth(
          row as ConnectionHealthState & Record<string, unknown>,
        );
        if (n) next[n.instanceId] = n;
      }
      setById(next);
    } catch {
      // ignore poll errors
    }
  }, []);

  useEffect(() => {
    if (!pollWhen) return;
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => window.clearInterval(id);
  }, [pollWhen, refresh]);

  useEffect(() => {
    let un: (() => void) | undefined;
    void listenEvent<ConnectionHealthState & Record<string, unknown>>(
      "session-health",
      (payload) => {
        const n = normalizeHealth(payload);
        if (!n) return;
        setById((prev) => ({
          ...prev,
          [n.instanceId]: n,
        }));
      },
    ).then((fn) => {
      un = fn;
    });
    return () => {
      un?.();
    };
  }, []);

  const setKeepAlive = useCallback(
    async (instanceId: string, enabled: boolean) => {
      const on = enabled === true;
      let snapshot: Record<string, ConnectionHealthState> = {};
      setById((prev) => {
        snapshot = prev;
        const cur = prev[instanceId];
        return {
          ...prev,
          [instanceId]: {
            instanceId,
            status: cur?.status ?? "connected",
            keepAlive: on,
            lastPulseAt: cur?.lastPulseAt ?? null,
            mode: cur?.mode ?? "live",
          },
        };
      });
      try {
        const result = await envSetKeepAlive(instanceId, on);
        // Authoritative patch from command result (020)
        setById((prev) => {
          const cur = prev[instanceId];
          return {
            ...prev,
            [instanceId]: {
              instanceId: result.instanceId,
              status: cur?.status ?? "connected",
              keepAlive: result.keepAlive === true,
              lastPulseAt: cur?.lastPulseAt ?? null,
              mode: cur?.mode ?? "live",
            },
          };
        });
        await refresh();
      } catch (e) {
        setById(snapshot);
        await refresh();
        throw e;
      }
    },
    [refresh],
  );

  return {
    byId,
    refresh,
    setKeepAlive,
  };
}
