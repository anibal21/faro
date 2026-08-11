import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";
import type { ConnectionHealthState } from "../../src/lib/ipc";

vi.mock("../../src/lib/appVersion", () => ({
  getAppVersionDisplay: async () => "v0.1.0",
}));

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

const demo = {
  ...env,
  id: "faro-demo",
  name: "Demo",
  clusterName: "demo",
  isBuiltinDemo: true,
};

function renderTree(
  overrides: {
    connectedIds?: string[];
    healthById?: Record<string, ConnectionHealthState>;
    onSetKeepAlive?: (id: string, enabled: boolean) => void;
    onReconnect?: (id: string) => void;
  } = {},
) {
  return render(
    <EnvTreeNav
      environments={[env, demo]}
      selectedId="e1"
      connectedIds={overrides.connectedIds ?? ["e1"]}
      connectingId={null}
      connectionErrorId={null}
      catalogFocusId="e1"
      healthById={overrides.healthById ?? {}}
      onSetKeepAlive={overrides.onSetKeepAlive}
      onReconnect={overrides.onReconnect}
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
}

describe("session keep-alive UI (017/018/019)", () => {
  it("shows No mantener + Keep-alive: ON when keepAlive is true", async () => {
    const user = userEvent.setup();
    const onSetKeepAlive = vi.fn();
    renderTree({
      healthById: {
        e1: {
          instanceId: "e1",
          status: "connected",
          keepAlive: true,
          lastPulseAt: new Date().toISOString(),
          mode: "live",
        },
      },
      onSetKeepAlive,
    });

    expect(screen.getByTestId("session-health-e1")).toHaveTextContent(
      /Keep-alive:\s*ON/,
    );
    expect(screen.getByTestId("session-health-e1")).not.toHaveTextContent(
      /Último pulso/i,
    );

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: /staging/i }),
    });

    const item = await screen.findByText(/^No mantener conexión viva$/i);
    await user.click(item);
    expect(onSetKeepAlive).toHaveBeenCalledWith("e1", false);
  });

  it("shows Mantener + Keep-alive: OFF when keepAlive is false (019)", async () => {
    const user = userEvent.setup();
    const onSetKeepAlive = vi.fn();
    renderTree({
      healthById: {
        e1: {
          instanceId: "e1",
          status: "connected",
          keepAlive: false,
          lastPulseAt: new Date().toISOString(),
          mode: "live",
        },
      },
      onSetKeepAlive,
    });

    const row = screen.getByTestId("session-health-e1");
    expect(row).toHaveTextContent(/Keep-alive:\s*OFF/);
    expect(row).not.toHaveTextContent(/Último pulso/i);

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: /staging/i }),
    });

    const item = await screen.findByText(/^Mantener conexión viva$/i);
    await user.click(item);
    expect(onSetKeepAlive).toHaveBeenCalledWith("e1", true);
  });

  it("does not offer keep-alive on demo env", async () => {
    const user = userEvent.setup();
    renderTree({
      connectedIds: ["faro-demo"],
      healthById: {
        "faro-demo": {
          instanceId: "faro-demo",
          status: "connected",
          keepAlive: false,
          mode: "demo",
        },
      },
      onSetKeepAlive: vi.fn(),
    });

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: /Demo/i }),
    });

    expect(screen.queryByText(/Mantener conexión viva/i)).toBeNull();
    expect(screen.queryByText(/No mantener conexión viva/i)).toBeNull();
  });

  it("renders Degradado without Último pulso", () => {
    renderTree({
      healthById: {
        e1: {
          instanceId: "e1",
          status: "degraded",
          keepAlive: true,
          lastPulseAt: new Date(Date.now() - 15_000).toISOString(),
          mode: "live",
        },
      },
    });

    const row = screen.getByTestId("session-health-e1");
    expect(row).toHaveTextContent(/Degradado/);
    expect(row).toHaveTextContent(/Keep-alive:\s*ON/);
    expect(row).not.toHaveTextContent(/Último pulso/i);
  });

  it("shows Reconectar when disconnected after keep-alive and invokes callback", async () => {
    const user = userEvent.setup();
    const onReconnect = vi.fn();
    renderTree({
      connectedIds: [],
      healthById: {
        e1: {
          instanceId: "e1",
          status: "disconnected",
          keepAlive: false,
          lastPulseAt: new Date().toISOString(),
          mode: "live",
        },
      },
      onReconnect,
    });

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByRole("button", { name: /staging/i }),
    });

    const btn = await screen.findByText(/^Reconectar$/i);
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onReconnect).toHaveBeenCalledWith("e1");
  });
});
