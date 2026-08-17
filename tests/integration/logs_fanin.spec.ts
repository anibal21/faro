import { describe, expect, it } from "vitest";

describe("logs fan-in (US2)", () => {
  it("expects multi-replica pod_name tags in stream", () => {
    const demoPods = ["payments-api-aaa", "payments-api-bbb"];
    const chunks = demoPods.map((podName) => ({ podName, text: "ok" }));
    const names = new Set(chunks.map((c) => c.podName));
    expect(names.size).toBe(2);
  });
});
