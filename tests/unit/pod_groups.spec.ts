import { describe, expect, it } from "vitest";
import {
  combinedPodLabel,
  groupPodsByDeployment,
} from "../../src/lib/podGroups";
import type { FlatPodRow } from "../../src/lib/ipc";

function pod(
  partial: Partial<FlatPodRow> & Pick<FlatPodRow, "id" | "podName">,
): FlatPodRow {
  return {
    namespace: "default",
    phase: "Running",
    deploymentName: null,
    ...partial,
  };
}

describe("groupPodsByDeployment", () => {
  it("combines replicas under one Deployment group", () => {
    const { groups, orphans } = groupPodsByDeployment([
      pod({
        id: "1",
        podName: "payments-api-aaa",
        deploymentName: "payments-api",
      }),
      pod({
        id: "2",
        podName: "payments-api-bbb",
        deploymentName: "payments-api",
      }),
      pod({
        id: "3",
        podName: "payments-worker-0",
        deploymentName: "payments-worker",
      }),
    ]);
    expect(groups).toHaveLength(2);
    const api = groups.find((g) => g.deploymentName === "payments-api");
    expect(api?.replicaCount).toBe(2);
    expect(api?.memberPodNames).toEqual([
      "payments-api-aaa",
      "payments-api-bbb",
    ]);
    expect(combinedPodLabel(api!)).toBe("payments-api (2)");
    expect(orphans).toHaveLength(0);
  });

  it("treats __unassigned__ and missing owner as orphans", () => {
    const { groups, orphans } = groupPodsByDeployment([
      pod({ id: "1", podName: "lone", deploymentName: null }),
      pod({ id: "2", podName: "u1", deploymentName: "__unassigned__" }),
    ]);
    expect(groups).toHaveLength(0);
    expect(orphans.map((o) => o.podName).sort()).toEqual(["lone", "u1"]);
  });
});
