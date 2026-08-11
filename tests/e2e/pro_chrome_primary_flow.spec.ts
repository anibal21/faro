import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * E2E outline: menubar → tree edit → logs drawer.
 * Full WebDriver automation is deferred; this guards the primary wiring.
 */
describe("pro chrome primary flow (E2E outline)", () => {
  it("wires AppMenubar, EnvTreeNav edit, and AnalysisDrawer path", () => {
    const shell = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.tsx"),
      "utf8",
    );
    const log = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(shell).toContain("AppMenubar");
    expect(shell).toContain("EnvTreeNav");
    expect(shell).toContain("onEdit");
    expect(shell).toContain("NewEnvironmentModal");
    expect(log).toContain("LogWorkspace");
    expect(log).toContain("openDrawer");
  });
});
