import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";

vi.mock("../../src/lib/appVersion", () => ({
  getAppVersionDisplay: async () => "v0.1.0",
}));

const demo = {
  id: "faro-demo",
  name: "demo",
  bastionHost: "offline",
  sshPort: 22,
  sshUser: "offline",
  pemPath: "offline",
  iamCredentialsPath: "offline",
  regionName: "offline",
  clusterName: "demo-cluster",
  namespaceDefault: "default",
  sortOrder: 0,
  isFavorite: false,
  notes: null,
  createdAt: "",
  updatedAt: "",
  isBuiltinDemo: true,
};

describe("built-in demo environment", () => {
  it("is first and exposes only Connect/Disconnect actions", async () => {
    const user = userEvent.setup();
    render(
      <EnvTreeNav
        environments={[demo, { ...demo, id: "live", name: "live", clusterName: "live-cluster", isBuiltinDemo: false }]}
        selectedId="faro-demo"
        connectedIds={[]}
        connectingId={null}
        connectionErrorId={null}
        catalogFocusId={null}
        deployments={[]}
        configMaps={[]}
        onSelect={() => undefined}
        onConnect={() => undefined}
        onDisconnect={() => undefined}
        onEdit={() => undefined}
        onOpenDeployment={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );

    const demoButton = screen.getAllByRole("button", { name: /demo/i })
      .find((button) => button.textContent?.startsWith("demo"));
    expect(demoButton).toBeDefined();
    await user.pointer({ keys: "[MouseRight]", target: demoButton! });
    expect(await screen.findByText("Conectar")).toBeInTheDocument();
    expect(screen.queryByText(/Editar configuracion/i)).not.toBeInTheDocument();
  });
});
