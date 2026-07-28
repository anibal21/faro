import { useCallback, useState } from "react";
import {
  catalogRefresh,
  envConnect,
  envDisconnect,
  type ConnectResult,
} from "../lib/ipc";

export type ConnectionUiStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnecting";

export function useConnection(activeId: string | null) {
  const [status, setStatus] = useState<ConnectionUiStatus>("idle");
  const [result, setResult] = useState<ConnectResult | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [focusedInstanceId, setFocusedInstanceId] = useState<string | null>(
    null,
  );
  const [errorInstanceId, setErrorInstanceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (instanceId?: string) => {
      const id = instanceId ?? activeId;
      if (!id) {
        setError("Selecciona un ambiente activo antes de conectar");
        setStatus("error");
        return;
      }
      setStatus("connecting");
      setConnectingId(id);
      setError(null);
      setErrorInstanceId(null);
      try {
        const r = await envConnect(id);
        setResult(r);
        setStatus("connected");
        setFocusedInstanceId(id);
        setConnectedIds((prev) =>
          prev.includes(id) ? prev : [...prev, id],
        );
      } catch (e) {
        setStatus(connectedIds.length > 0 ? "connected" : "error");
        setErrorInstanceId(id);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setConnectingId(null);
      }
    },
    [activeId, connectedIds.length],
  );

  const disconnect = useCallback(
    async (instanceId?: string) => {
      const id = instanceId ?? focusedInstanceId;
      setStatus("disconnecting");
      setError(null);
      try {
        await envDisconnect(id ?? undefined);
        const next = id
          ? connectedIds.filter((x) => x !== id)
          : [];
        setConnectedIds(next);
        const nextFocus =
          focusedInstanceId && focusedInstanceId !== id
            ? focusedInstanceId
            : (next[0] ?? null);
        setFocusedInstanceId(nextFocus);
        if (next.length === 0) {
          setResult(null);
          setStatus("idle");
        } else {
          setStatus("connected");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [focusedInstanceId, connectedIds],
  );

  const refreshCatalog = useCallback(async () => {
    try {
      const r = await catalogRefresh();
      setResult((prev) =>
        prev
          ? { ...prev, catalogEpoch: r.catalogEpoch }
          : {
              status: "connected",
              clusterName: "",
              catalogEpoch: r.catalogEpoch,
              instanceId: focusedInstanceId ?? "",
            },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [focusedInstanceId]);

  return {
    status,
    result,
    error,
    connectedIds,
    connectingId,
    errorInstanceId,
    connectedInstanceId: focusedInstanceId,
    connected: connectedIds.length > 0,
    connect,
    disconnect,
    refreshCatalog,
    clearError: () => setError(null),
  };
}
