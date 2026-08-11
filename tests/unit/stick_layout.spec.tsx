import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("stick layout (US2)", () => {
  it("groups checkbox and label under log-window__stick", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/LogWindow.tsx"),
      "utf8",
    );
    expect(src).toMatch(/className="log-window__stick"/);
    expect(src).toMatch(
      /log-window__stick[\s\S]*?<input[\s\S]*?Pegar al final/,
    );
  });

  it("defines inline-flex stick CSS", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/styles/workspace.css"),
      "utf8",
    );
    expect(css).toMatch(/\.log-window__stick\s*\{[^}]*inline-flex/);
    expect(css).toMatch(/\.log-window__stick\s*\{[^}]*white-space:\s*nowrap/);
  });
});
