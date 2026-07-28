import { cn } from "@/lib/utils";

export type EnvConnStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

const color: Record<EnvConnStatus, string> = {
  disconnected: "bg-red-600",
  connecting: "bg-yellow-500",
  connected: "bg-green-600",
  error: "bg-red-600",
};

const label: Record<EnvConnStatus, string> = {
  disconnected: "desconectado",
  connecting: "conectando",
  connected: "conectado",
  error: "error",
};

export function EnvTreeStatusDot({ status }: { status: EnvConnStatus }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", color[status])}
      title={label[status]}
      aria-label={label[status]}
    />
  );
}
