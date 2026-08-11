import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("catalog indent (US4)", () => {
  it("wraps section children in env-tree__section-items", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/components/catalog/EnvTreeNav.tsx"),
      "utf8",
    );
    expect(src).toContain('className="env-tree__section-items"');
    expect(src).toContain("env-tree__section-title");
  });

  it("indents section items past titles in CSS", () => {
    const css = readFileSync(
      resolve(__dirname, "../../src/styles/workspace.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.env-tree__section-items\s*\{[^}]*margin-left:\s*1\.15rem/,
    );
  });
});
