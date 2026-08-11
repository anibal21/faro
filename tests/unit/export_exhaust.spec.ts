import { describe, expect, it, vi } from "vitest";
import { exhaustLogHistory } from "../../src/lib/fileExport";

describe("export exhaust (US4)", () => {
  it("pages until exhausted", async () => {
    let n = 0;
    const loadPage = vi.fn(async () => {
      n += 1;
      return n < 3 ? ("more" as const) : ("exhausted" as const);
    });
    const result = await exhaustLogHistory({
      isCancelled: () => false,
      loadPage,
    });
    expect(result).toBe("exhausted");
    expect(loadPage).toHaveBeenCalledTimes(3);
  });

  it("stops on cancel", async () => {
    let cancelled = false;
    const result = await exhaustLogHistory({
      isCancelled: () => cancelled,
      loadPage: async () => {
        cancelled = true;
        return "more";
      },
    });
    expect(result).toBe("cancelled");
  });
});
