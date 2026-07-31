import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("deployment YAML open (US1)", () => {
  it("openDeployment fetches YAML and does not call logsOpen", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    const openDep = src.slice(
      src.indexOf("const openDeployment"),
      src.indexOf("const openCombinedLogs"),
    );
    expect(openDep).toContain("k8sGetDeploymentYaml");
    expect(openDep).toContain("deployment-yaml");
    expect(openDep).not.toContain("logsOpen");
  });
});
