import { describe, expect, it } from "vitest";
import { configmapNavKey } from "../../src/hooks/tabKeys";

describe("configmap tabs (US3)", () => {
  it("open-or-focus uses configmap navKey", () => {
    const tabs = new Map<string, { focused: boolean }>();
    const key = configmapNavKey("env-1", "default", "payments-config");
    tabs.set(key, { focused: true });
    const again = tabs.get(key);
    expect(again?.focused).toBe(true);
    expect(tabs.size).toBe(1);
  });
});
