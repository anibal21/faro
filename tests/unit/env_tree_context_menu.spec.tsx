import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";

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
  namespaceDefault: null,
  sortOrder: null,
  isFavorite: false,
  notes: null,
  createdAt: "",
  updatedAt: "",
};

describe("EnvTreeNav context menu (US2)", () => {
  it("exposes Editar configuracion on context menu", async () => {
    const user = userEvent.setup();
    render(
      <EnvTreeNav
        environments={[env]}
        selectedId="e1"
        connectedIds={[]}
        connectingId={null}
        connectionErrorId={null}
        catalogFocusId={null}
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

    expect(
      await screen.findByText(/Editar configuracion/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Conectar/i)).toBeInTheDocument();
  });
});
