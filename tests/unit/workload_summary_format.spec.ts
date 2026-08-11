import { describe, expect, it } from "vitest";
import type { WorkloadSummary } from "../../src/lib/ipc";

function formatStrip(summary: WorkloadSummary | null): string {
  if (!summary) {
    return "Replicas: N/D | RAM: N/D | CPU: N/D | Uptime: N/D";
  }
  const nd = (v: string | null | undefined) =>
    v == null || v === "" ? "N/D" : v;
  const replicas =
    summary.readyReplicas != null
      ? `${summary.readyReplicas}/${summary.replicaCount}`
      : String(summary.replicaCount);
  return `Replicas: ${replicas} | RAM: ${nd(summary.ramConsumed)} | CPU: ${nd(summary.cpuConsumed)} | Uptime: ${nd(summary.uptime)}`;
}

describe("workload summary format (US1)", () => {
  it("shows request / limit strings and ready/desired replicas", () => {
    const text = formatStrip({
      namespace: "ns",
      deployment: "payments-api",
      replicaCount: 3,
      readyReplicas: 3,
      ramConsumed: "256Mi / 512Mi",
      cpuConsumed: "100m / 250m",
      uptime: "3d4h",
      fetchedAt: "t",
    });
    expect(text).toContain("3/3");
    expect(text).toContain("256Mi / 512Mi");
    expect(text).toContain("100m / 250m");
    expect(text).not.toContain("N/D");
  });

  it("uses N/D for missing RAM/CPU", () => {
    const text = formatStrip({
      namespace: "ns",
      deployment: "x",
      replicaCount: 1,
      readyReplicas: null,
      ramConsumed: null,
      cpuConsumed: null,
      uptime: null,
      fetchedAt: "t",
    });
    expect(text).toContain("RAM: N/D");
    expect(text).toContain("CPU: N/D");
    expect(text).toContain("Uptime: N/D");
  });
});
