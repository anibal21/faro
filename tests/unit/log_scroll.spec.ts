import { describe, expect, it } from "vitest";
import {
  captureScrollHeight,
  isNearBottom,
  preserveScrollOnPrepend,
  scrollToEnd,
} from "../../src/lib/logScroll";

function mockEl(partial: Partial<HTMLElement> & {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}): HTMLElement {
  return partial as HTMLElement;
}

describe("logScroll", () => {
  it("detects near bottom", () => {
    const el = mockEl({ scrollHeight: 1000, scrollTop: 940, clientHeight: 50 });
    expect(isNearBottom(el)).toBe(true);
    el.scrollTop = 100;
    expect(isNearBottom(el)).toBe(false);
  });

  it("scrollToEnd sets scrollTop to scrollHeight", () => {
    const el = mockEl({ scrollHeight: 800, scrollTop: 0, clientHeight: 100 });
    scrollToEnd(el);
    expect(el.scrollTop).toBe(800);
  });

  it("preserveScrollOnPrepend adjusts scrollTop by height delta", () => {
    const el = mockEl({ scrollHeight: 1200, scrollTop: 200, clientHeight: 100 });
    preserveScrollOnPrepend(el, 800);
    expect(el.scrollTop).toBe(600);
  });

  it("captureScrollHeight handles null", () => {
    expect(captureScrollHeight(null)).toBe(0);
  });
});
