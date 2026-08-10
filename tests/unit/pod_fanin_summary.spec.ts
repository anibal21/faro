import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("pod fan-in summary (US3)", () => {
  it("fan-in path requests workloadSummary for owner deployment", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    const openCombined = src.slice(
      src.indexOf("const openCombinedLogs"),
      src.indexOf("const openPod"),
    );
    expect(openCombined).toContain("workloadSummary(namespace, owner)");
    expect(openCombined).toContain(
      "logsOpen(namespace, owner, undefined, instanceId)",
    );
    // Summary must not block tab open
    expect(openCombined).not.toMatch(
      /Promise\.all\(\s*\[\s*logsOpen[\s\S]*workloadSummary/,
    );
  });
});
