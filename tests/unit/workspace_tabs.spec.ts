import { describe, expect, it } from "vitest";
import {
  configmapNavKey,
  deploymentNavKey,
  deployLogsNavKey,
} from "../../src/hooks/tabKeys";

describe("workspace tab navKeys (US2)", () => {
  it("builds stable deployment-yaml, deploy-logs, and configmap keys", () => {
    expect(deploymentNavKey("default", "payments-api")).toBe(
      "deployment-yaml:default/payments-api",
    );
    expect(deployLogsNavKey("default", "payments-api")).toBe(
      "deploy-logs:default/payments-api",
    );
    expect(configmapNavKey("default", "payments-config")).toBe(
      "configmap:default/payments-config",
    );
  });

  it("dedupes by navKey identity", () => {
    const open = new Map<string, string>();
    const key = deploymentNavKey("default", "payments-api");
    open.set(key, "tab-1");
    const existing = open.get(key);
    expect(existing).toBe("tab-1");
    expect(open.size).toBe(1);
  });
});
