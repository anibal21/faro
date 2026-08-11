import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("desktop overscroll (018)", () => {
  it("disables root overscroll bounce in index.css", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/index.css"),
      "utf8",
    );
    expect(css).toMatch(/html[\s\S]*overscroll-behavior:\s*none/);
    expect(css).toMatch(/#root[\s\S]*overflow:\s*hidden/);
  });

  it("keeps main-shell overscroll contained", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.css"),
      "utf8",
    );
    expect(css).toContain("overscroll-behavior: none");
    expect(css).toMatch(/\.main-shell[\s\S]*overflow:\s*hidden/);
  });
});
