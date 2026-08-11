import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("status chrome (US5)", () => {
  it("does not seed iniciando on open", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/hooks/useWorkspaceTabs.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/status:\s*"iniciando"/);
  });

  it("LogWindow hides iniciando/starting", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toMatch(/iniciando\|starting/);
    expect(src).toContain("localizeStatus");
  });
});
