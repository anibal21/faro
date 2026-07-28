import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("chrome menubar integration outline (US1)", () => {
  it("MainShell no longer mounts EnvironmentSelector or ConnectionStatus header", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.tsx"),
      "utf8",
    );
    expect(src).toContain("AppMenubar");
    expect(src).not.toMatch(/EnvironmentSelector/);
    expect(src).not.toMatch(/ConnectionStatus/);
    expect(src).not.toMatch(/VerMenu/);
    expect(src).not.toMatch(/AmbienteMenu/);
  });
});
