import { describe, expect, it } from "vitest";
import { deploymentNavKey } from "../../src/hooks/tabKeys";

describe("workspace tabs across environments", () => {
  it("keeps same-named resources as separate tabs", () => {
    const tabs = new Map<string, string>();
    tabs.set(deploymentNavKey("env-a", "default", "payments-api"), "A");
    tabs.set(deploymentNavKey("env-b", "default", "payments-api"), "B");
    expect([...tabs.values()]).toEqual(["A", "B"]);
  });
});

