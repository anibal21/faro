import type { WorkloadSummary } from "../../lib/ipc";

type WorkloadSummaryStripProps = {
  summary: WorkloadSummary | null;
};

function present(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

export function WorkloadSummaryStrip({ summary }: WorkloadSummaryStripProps) {
  if (!summary) {
    return (
      <div className="workload-summary" aria-label="Resumen del workload">
        Cargando resumen…
      </div>
    );
  }

  const replicas =
    summary.readyReplicas != null
      ? `${summary.readyReplicas}/${summary.replicaCount}`
      : String(summary.replicaCount);

  const parts: string[] = [`Replicas: ${replicas}`];
  const ram = present(summary.ramConsumed);
  const cpu = present(summary.cpuConsumed);
  const uptime = present(summary.uptime);
  if (ram) parts.push(`RAM: ${ram}`);
  if (cpu) parts.push(`CPU: ${cpu}`);
  if (uptime) parts.push(`Uptime: ${uptime}`);

  return (
    <div className="workload-summary" aria-label="Resumen del workload">
      {parts.join(" | ")}
    </div>
  );
}
