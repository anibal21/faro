import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useConnectionHealth } from "../../src/hooks/useConnectionHealth";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";
import type { ConnectionHealthState } from "../../src/lib/ipc";

vi.mock("../../src/lib/appVersion", () => ({
  getAppVersionDisplay: async () => "v0.1.0",
}));

const envSetKeepAlive = vi.fn();
const envConnectionStates = vi.fn();
const listenEvent = vi.fn(async () => () => undefined);

vi.mock("../../src/lib/ipc", async () => {
  const actual =
    await vi.importActual<typeof import("../../src/lib/ipc")>(
      "../../src/lib/ipc",
    );
  return {
    ...actual,
    envSetKeepAlive: (...args: unknown[]) => envSetKeepAlive(...args),
    envConnectionStates: (...args: unknown[]) => envConnectionStates(...args),
    listenEvent: (...args: unknown[]) => listenEvent(...args),
  };
});

const env = {
  id: "e1",
  name: "staging",
  bastionHost: "b",
  sshPort: 22,
  sshUser: "u",
  pemPath: "/p.pem",
  iamCredentialsPath: "/i",
  regionName: "us-east-1",
  clusterName: "eks-s",
  namespaceDefault: "default",
  sortOrder: null,
  isFavorite: false,
  notes: null,
  createdAt: "",
  updatedAt: "",
  isBuiltinDemo: false,
};

describe("keepalive disable (020)", () => {
  beforeEach(() => {
    envSetKeepAlive.mockReset();
    envConnectionStates.mockReset();
    listenEvent.mockReset();
    listenEvent.mockResolvedValue(() => undefined);
    envConnectionStates.mockResolvedValue([]);
  });

  it("FR-007: setKeepAlive(false) leaves keepAlive false from command result", async () => {
    envSetKeepAlive.mockResolvedValue({
      instanceId: "e1",
      keepAlive: false,
    });
    envConnectionStates.mockResolvedValue([
      {
        instanceId: "e1",
        status: "connected",
        keepAlive: false,
        mode: "live",
      } satisfies ConnectionHealthState,
    ]);

    const { result } = renderHook(() => useConnectionHealth(true));

    await act(async () => {
      await result.current.setKeepAlive("e1", false);
    });

    expect(envSetKeepAlive).toHaveBeenCalledWith("e1", false);
    await waitFor(() => {
      expect(result.current.byId.e1?.keepAlive).toBe(false);
    });
  });

  it("US2: on reject, does not leave keepAlive false if server still true", async () => {
    envSetKeepAlive.mockRejectedValue(new Error("boom"));
    envConnectionStates.mockResolvedValue([
      {
        instanceId: "e1",
        status: "connected",
        keepAlive: true,
        mode: "live",
      } satisfies ConnectionHealthState,
    ]);

    const { result } = renderHook(() => useConnectionHealth(true));

    await act(async () => {
      await expect(result.current.setKeepAlive("e1", false)).rejects.toThrow(
        /boom/,
      );
    });

    await waitFor(() => {
      expect(result.current.byId.e1?.keepAlive).toBe(true);
    });
  });

  it("No mantener invokes callback with false", async () => {
    const user = userEvent.setup();
    const onSetKeepAlive = vi.fn();
    render(
      <EnvTreeNav
        environments={[env]}
        selectedId="e1"
        connectedIds={["e1"]}
        connectingId={null}
        connectionErrorId={null}
        catalogFocusId="e1"
        healthById={{
          e1: {
            instanceId: "e1",
            status: "connected",
            keepAlive: true,
            mode: "live",
          },
        }}
        onSetKeepAlive={onSetKeepAlive}
        deployments={[]}
        pods={[]}
        services={[]}
        configMaps={[]}
        onSelect={() => undefined}
        onConnect={() => undefined}
        onDisconnect={() => undefined}
        onEdit={() => undefined}
        onOpenDeployment={() => undefined}
        onOpenPod={() => undefined}
        onOpenService={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: /staging/i }),
    });
    await user.click(await screen.findByText(/^No mantener conexión viva$/i));
    expect(onSetKeepAlive).toHaveBeenCalledWith("e1", false);
  });
});
