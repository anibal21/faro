import { useCallback, useEffect, useRef, useState } from "react";
import {
  listenUpdateDownloadProgress,
  updateCheck,
  updateInstall,
  type UpdateCheckResult,
} from "../lib/appUpdate";

const INSTALL_HANDOFF_MSG =
  "El instalador se está iniciando. Faro puede cerrarse; vuelve a abrirlo cuando termine la instalación.";

export type UseAppUpdateCheckResult = {
  offer: UpdateCheckResult | null;
  dialogOpen: boolean;
  installing: boolean;
  progressPercent: number | null;
  installMessage: string | null;
  installError: string | null;
  manualMessage: string | null;
  clearManualMessage: () => void;
  checkManual: () => Promise<void>;
  accept: () => Promise<void>;
  reject: () => void;
  setDialogOpen: (open: boolean) => void;
  /** Test helper: whether this process already dismissed an offer. */
  isSessionDismissed: () => boolean;
};

/**
 * Startup check once after workspace ready; manual via `checkManual`.
 * Reject dismisses for the current process only (re-offer on cold start).
 */
export function useAppUpdateCheck(ready: boolean): UseAppUpdateCheckResult {
  const [offer, setOffer] = useState<UpdateCheckResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);
  const [manualMessage, setManualMessage] = useState<string | null>(null);
  const sessionDismissed = useRef(false);
  const startupRan = useRef(false);

  const applyCheck = useCallback(
    async (source: "startup" | "manual") => {
      try {
        const result = await updateCheck();
        if (result.status === "available") {
          if (source === "startup" && sessionDismissed.current) {
            return;
          }
          setOffer(result);
          setInstallError(null);
          setInstallMessage(null);
          setDialogOpen(true);
          if (source === "manual") setManualMessage(null);
          return;
        }
        if (source === "manual") {
          if (result.status === "upToDate") {
            setManualMessage("Ya estás en la última versión.");
          } else {
            setManualMessage(
              result.notes?.trim() ||
                "No se pudo consultar actualizaciones. Inténtalo más tarde.",
            );
          }
        }
      } catch (e) {
        if (source === "manual") {
          setManualMessage(
            e instanceof Error
              ? e.message
              : "No se pudo consultar actualizaciones.",
          );
        }
        // Startup failures stay silent (non-blocking).
      }
    },
    [],
  );

  useEffect(() => {
    if (!ready || startupRan.current) return;
    startupRan.current = true;
    void applyCheck("startup");
  }, [ready, applyCheck]);

  useEffect(() => {
    if (!installing) return;
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    void listenUpdateDownloadProgress((payload) => {
      if (cancelled) return;
      if (payload.percent != null) setProgressPercent(payload.percent);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [installing]);

  const checkManual = useCallback(async () => {
    await applyCheck("manual");
  }, [applyCheck]);

  const reject = useCallback(() => {
    sessionDismissed.current = true;
    setDialogOpen(false);
    setInstallError(null);
    setInstallMessage(null);
    setProgressPercent(null);
  }, []);

  const accept = useCallback(async () => {
    if (!offer?.canInstall || installing) return;
    setInstalling(true);
    setInstallError(null);
    setProgressPercent(null);
    setInstallMessage(null);
    try {
      await updateInstall();
      setInstallMessage(INSTALL_HANDOFF_MSG);
    } catch (e) {
      setInstallError(
        e instanceof Error
          ? e.message
          : "No se pudo instalar la actualización. Faro sigue usable.",
      );
    } finally {
      setInstalling(false);
    }
  }, [offer, installing]);

  const clearManualMessage = useCallback(() => {
    setManualMessage(null);
  }, []);

  return {
    offer,
    dialogOpen,
    installing,
    progressPercent,
    installMessage,
    installError,
    manualMessage,
    clearManualMessage,
    checkManual,
    accept,
    reject,
    setDialogOpen,
    isSessionDismissed: () => sessionDismissed.current,
  };
}
