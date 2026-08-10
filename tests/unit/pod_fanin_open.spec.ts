import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("pod fan-in open (US2)", () => {
  it("openPod with owner fans in via openCombinedLogs / deploy-logs key", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    expect(src).toContain("openCombinedLogs");
    expect(src).toContain("deployLogsNavKey");
    const openCombined = src.slice(
      src.indexOf("const openCombinedLogs"),
      src.indexOf("const openPod"),
    );
    expect(openCombined).toContain(
      "logsOpen(namespace, owner, undefined, instanceId)",
    );
    const openPod = src.slice(
      src.indexOf("const openPod"),
      src.indexOf("const openConfigMap"),
    );
    expect(openPod).toContain("__unassigned__");
    expect(openPod).toContain(
      "logsOpen(namespace, dep, podName, instanceId)",
    );
  });
});
