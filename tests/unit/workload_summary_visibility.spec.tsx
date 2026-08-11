import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkloadSummaryStrip } from "../../src/components/logs/WorkloadSummaryStrip";

describe("workload summary visibility (024)", () => {
  it("omits RAM/CPU/Uptime when missing", () => {
    render(
      <WorkloadSummaryStrip
        summary={{
          namespace: "default",
          deployment: "api",
          replicaCount: 2,
          readyReplicas: 1,
          ramConsumed: null,
          cpuConsumed: null,
          uptime: null,
        }}
      />,
    );
    const text = screen.getByLabelText("Resumen del workload").textContent ?? "";
    expect(text).toContain("Replicas:");
    expect(text).not.toMatch(/RAM:/);
    expect(text).not.toMatch(/CPU:/);
    expect(text).not.toMatch(/Uptime:/);
    expect(text).not.toMatch(/N\/D/);
  });

  it("shows only metrics that have values", () => {
    render(
      <WorkloadSummaryStrip
        summary={{
          namespace: "default",
          deployment: "api",
          replicaCount: 2,
          readyReplicas: 2,
          ramConsumed: "256Mi / 512Mi",
          cpuConsumed: "",
          uptime: "3d4h",
        }}
      />,
    );
    const text = screen.getByLabelText("Resumen del workload").textContent ?? "";
    expect(text).toContain("RAM: 256Mi / 512Mi");
    expect(text).toContain("Uptime: 3d4h");
    expect(text).not.toMatch(/CPU:/);
  });
});
