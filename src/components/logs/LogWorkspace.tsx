import type { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AnalysisDrawer } from "./AnalysisDrawer";
import type { AnalysisFinding } from "../../lib/ipc";
import { Button } from "../ui/button";

type LogWorkspaceProps = {
  children: ReactNode;
  drawerOpen: boolean;
  findings: AnalysisFinding[] | null;
  packId?: string | null;
  packDisplayName?: string | null;
  signalSnippet?: string | null;
  onPackChange?: (packId: string) => void;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
};

export function LogWorkspace({
  children,
  drawerOpen,
  findings,
  packId,
  packDisplayName,
  signalSnippet,
  onPackChange,
  onCloseDrawer,
  onOpenDrawer,
}: LogWorkspaceProps) {
  if (!drawerOpen) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <div className="flex shrink-0 border-t border-border px-2 py-0.5">
          <Button type="button" variant="ghost" onClick={onOpenDrawer}>
            Abrir analisis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="vertical" className="min-h-0 flex-1">
      <ResizablePanel defaultSize="72%" minSize="35%">
        <div className="h-full min-h-0 overflow-hidden">{children}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="28%" minSize="12%">
        <AnalysisDrawer
          findings={findings}
          packId={packId}
          packDisplayName={packDisplayName}
          signalSnippet={signalSnippet}
          onPackChange={onPackChange}
          onClose={onCloseDrawer}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
