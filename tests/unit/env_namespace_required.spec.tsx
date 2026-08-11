import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("namespace required (008 US1)", () => {
  it("modal enforces namespace before save", () => {
    const modal = readFileSync(
      resolve(__dirname, "../../src/components/env/NewEnvironmentModal.tsx"),
      "utf8",
    );
    expect(modal).toContain("Namespace es obligatorio");
    expect(modal).toContain("namespaceDefault");
  });
});
