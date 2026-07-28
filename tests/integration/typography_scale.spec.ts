import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("typography scale (US1)", () => {
  it("sets base UI font size to 13px (VS Code workbench scale)", () => {
    const css = readFileSync(resolve(__dirname, "../../src/index.css"), "utf8");
    expect(css).toMatch(/font-size:\s*13px/);
  });
});
