import { describe, expect, it } from "vitest";
import {
  findKnownStart,
  olderPrefixFromTail,
  splitLogLines,
} from "../../src/lib/logHistory";

describe("logHistory", () => {
  it("splitLogLines drops trailing empty", () => {
    expect(splitLogLines("a\nb\n")).toEqual(["a", "b"]);
  });

  it("findKnownStart locates known prefix inside fetched", () => {
    const fetched = ["o1", "o2", "k1", "k2", "k3"];
    const known = ["k1", "k2", "k3", "k4"];
    expect(findKnownStart(fetched, known)).toBe(2);
  });

  it("olderPrefixFromTail returns lines before known", () => {
    const fetched = "old-a\nold-b\nknown-1\nknown-2\n";
    const known = "known-1\nknown-2\nlive\n";
    const { older, exhausted } = olderPrefixFromTail(fetched, known);
    expect(exhausted).toBe(false);
    expect(older).toContain("old-a");
    expect(older).toContain("old-b");
    expect(older).not.toContain("known-1");
  });

  it("olderPrefixFromTail exhausted when known starts at index 0", () => {
    const fetched = "known-1\nknown-2\n";
    const known = "known-1\nknown-2\nmore\n";
    const { older, exhausted } = olderPrefixFromTail(fetched, known);
    expect(older).toBe("");
    expect(exhausted).toBe(true);
  });
});
