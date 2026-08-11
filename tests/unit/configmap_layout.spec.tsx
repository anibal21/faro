import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ConfigMap layout", () => {
  it("LogWindow routes ConfigMap outside LogWorkspace", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toContain("ConfigMapTab");
    expect(src).toMatch(/kind === "configmap"/);
    // ConfigMap branch should not wrap ConfigMapTab in LogWorkspace
    const cmIdx = src.indexOf('active?.kind === "configmap"');
    const cmBlock = src.slice(cmIdx, cmIdx + 900);
    expect(cmBlock).toContain("ConfigMapTab");
    expect(cmBlock).not.toContain("LogWorkspace");
    expect(cmBlock).toContain("Exportar");
  });

  it("workspace CSS gives ConfigMap full-height flex shell", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/styles/workspace.css"),
      "utf8",
    );
    expect(css).toContain(".configmap-tab-shell");
    expect(css).toContain(".configmap-tab__keys");
    expect(css).toMatch(/\.configmap-tab\s*\{[^}]*flex:\s*1/s);
  });
});
