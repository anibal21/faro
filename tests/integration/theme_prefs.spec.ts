import { describe, expect, it } from "vitest";
import { prefsGet, prefsSet } from "../../src/lib/ipc";

describe("theme prefs (US9) — contract smoke", () => {
  it("exports prefs helpers", () => {
    expect(typeof prefsGet).toBe("function");
    expect(typeof prefsSet).toBe("function");
  });
});
