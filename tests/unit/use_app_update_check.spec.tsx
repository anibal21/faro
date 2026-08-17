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

describe("useAppUpdateCheck (025)", () => {
  beforeEach(() => {
    updateCheck.mockReset();
    updateInstall.mockReset();
  });

  it("invokes check once when ready", async () => {
    updateCheck.mockResolvedValue({
      status: "upToDate",
      current: "0.1.0",
      canInstall: true,
    });

    const { rerender } = renderHook(
      ({ ready }) => useAppUpdateCheck(ready),
      { initialProps: { ready: false } },
    );

    expect(updateCheck).not.toHaveBeenCalled();

    rerender({ ready: true });
    await waitFor(() => expect(updateCheck).toHaveBeenCalledTimes(1));

    rerender({ ready: true });
    await waitFor(() => expect(updateCheck).toHaveBeenCalledTimes(1));
  });

  it("opens offer on available; reject keeps session dismissed for later startup in same process", async () => {
    updateCheck.mockResolvedValue({
      status: "available",
      current: "0.1.0",
      available: "0.2.0",
      canInstall: true,
    });

    const { result } = renderHook(() => useAppUpdateCheck(true));

    await waitFor(() => expect(result.current.dialogOpen).toBe(true));
    expect(result.current.offer?.available).toBe("0.2.0");

    act(() => {
      result.current.reject();
    });
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.isSessionDismissed()).toBe(true);

    await act(async () => {
      await result.current.checkManual();
    });
    // Manual still shows offer even after session dismiss (user asked).
    await waitFor(() => expect(result.current.dialogOpen).toBe(true));
  });
});
