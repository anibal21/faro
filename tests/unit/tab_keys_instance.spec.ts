import { describe, expect, it } from "vitest";
import { deployLogsNavKey } from "../../src/hooks/tabKeys";

describe("instance-scoped tab keys", () => {
  it("does not collide for the same resource in two environments", () => {
    const a = deployLogsNavKey("env-a", "default", "payments-api");
    const b = deployLogsNavKey("env-b", "default", "payments-api");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^env-a\|/);
  });
});

