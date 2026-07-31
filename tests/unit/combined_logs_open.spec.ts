import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("combined logs open (US2)", () => {
  it("openCombinedLogs fans in via logsOpen without pod filter and uses deployLogsNavKey", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    const block = src.slice(
      src.indexOf("const openCombinedLogs"),
      src.indexOf("const openPod"),
    );
    expect(block).toContain("deployLogsNavKey");
    expect(block).toMatch(/logsOpen\(\s*namespace,\s*owner\s*\)/);
    expect(block).not.toMatch(/logsOpen\(\s*namespace,\s*owner,\s*/);
  });

  it("openPod with owner delegates to openCombinedLogs", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    const openPod = src.slice(
      src.indexOf("const openPod"),
      src.indexOf("const openConfigMap"),
    );
    expect(openPod).toContain("openCombinedLogs(namespace, owner)");
  });

  it("LogWindow labels fan-in tabs with Deployment name", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toMatch(
      /if \(t\.kind === "deployment"\)[\s\S]*?return t\.deployment;/,
    );
  });
});
