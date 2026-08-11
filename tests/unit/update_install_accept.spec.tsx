import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAppUpdateCheck } from "../../src/hooks/useAppUpdateCheck";

const updateCheck = vi.fn();
const updateInstall = vi.fn();

vi.mock("../../src/lib/appUpdate", () => ({
  updateCheck: (...args: unknown[]) => updateCheck(...args),
  updateInstall: (...args: unknown[]) => updateInstall(...args),
  listenUpdateDownloadProgress: async () => () => undefined,
}));

describe("update install accept (025 US2)", () => {
  beforeEach(() => {
    updateCheck.mockReset();
    updateInstall.mockReset();
  });

  it("Accept calls updateInstall once", async () => {
    updateCheck.mockResolvedValue({
      status: "available",
      current: "0.1.0",
      available: "0.2.0",
      canInstall: true,
    });
    updateInstall.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppUpdateCheck(true));
    await waitFor(() => expect(result.current.dialogOpen).toBe(true));

    await act(async () => {
      await result.current.accept();
    });

    expect(updateInstall).toHaveBeenCalledTimes(1);
    expect(result.current.installMessage).toMatch(/instalador/i);
  });
});
