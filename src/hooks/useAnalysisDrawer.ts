import { useCallback, useState } from "react";

export function useAnalysisDrawer() {
  const [open, setOpen] = useState(false);
  const [heightPct, setHeightPct] = useState(28);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  return {
    open,
    heightPct,
    setHeightPct,
    openDrawer,
    closeDrawer,
    toggle,
    setOpen,
  };
}
