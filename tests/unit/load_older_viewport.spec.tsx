import { describe, expect, it } from "vitest";
import { preserveScrollOnPrepend } from "../../src/lib/logScroll";

describe("load older viewport", () => {
  it("preserves reading position after prepend height growth", () => {
    const el = {
      scrollHeight: 2000,
      scrollTop: 400,
      clientHeight: 200,
    } as HTMLElement;
    const before = 1000;
    preserveScrollOnPrepend(el, before);
    expect(el.scrollTop).toBe(1400);
  });
});
