import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("log workspace layout (US3)", () => {
  it("LogWindow uses LogWorkspace and no permanent FindingPanel column", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toContain("LogWorkspace");
    expect(src).toContain("useAnalysisDrawer");
    expect(src).not.toMatch(/FindingPanel/);
    expect(src).not.toMatch(/grid-template-columns:\s*1fr/);
  });
});
