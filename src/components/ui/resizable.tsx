import type { ComponentProps } from "react";
import { GripHorizontal } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

export function ResizablePanelGroup({
  className,
  direction = "horizontal",
  ...props
}: ComponentProps<typeof Group> & {
  direction?: "horizontal" | "vertical";
}) {
  return (
    <Group
      orientation={direction}
      className={cn(
        "flex h-full w-full data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

export const ResizablePanel = Panel;

export function ResizableHandle({
  withHandle,
  className,
  ...props
}: ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex items-center justify-center bg-border data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-3 w-8 items-center justify-center rounded-sm border border-border bg-card">
          <GripHorizontal className="size-2.5" />
        </div>
      )}
    </Separator>
  );
}
