import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("scrollbar theme (US3)", () => {
  it("defines thin themed scrollbar rules for workspace surfaces", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/styles/workspace.css"),
      "utf8",
    );
    expect(css).toContain("scrollbar-width: thin");
    expect(css).toContain("scrollbar-color:");
    expect(css).toContain("::-webkit-scrollbar");
    expect(css).toContain(".log-window__body");
    expect(css).toContain(".env-tree__section-items");
    expect(css).toContain(".configmap-tab__keys");
  });
});
