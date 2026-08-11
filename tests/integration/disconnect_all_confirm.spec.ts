import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("disconnect all confirm (US2)", () => {
  it("MainShell confirms before disconnecting all", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/views/MainShell.tsx"),
      "utf8",
    );
    expect(src).toMatch(/window\.confirm/);
    expect(src).toMatch(/Desconectar todos/);
    expect(src).toMatch(/connectedIds/);
  });
});
