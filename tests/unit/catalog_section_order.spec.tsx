import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";

vi.mock("../../src/lib/appVersion", () => ({
  getAppVersionDisplay: async () => "v0.1.0",
}));

const env = {
  id: "e1",
  name: "prod",
  bastionHost: "b",
  sshPort: 22,
  sshUser: "u",
  pemPath: "/p.pem",
  iamCredentialsPath: "/i",
  regionName: "us-east-1",
  clusterName: "eks-1",
  namespaceDefault: "payments",
  sortOrder: null,
  isFavorite: false,
  notes: null,
  createdAt: "",
  updatedAt: "",
  isBuiltinDemo: false,
};

describe("catalog section order (US7)", () => {
  it("renders Deployments → Pods → Services → ConfigMaps", async () => {
    const user = userEvent.setup();
    render(
      <EnvTreeNav
        environments={[env]}
        selectedId={env.id}
        connectedIds={[env.id]}
        connectingId={null}
        connectionErrorId={null}
        catalogFocusId={env.id}
        deployments={[
          {
            id: "d1",
            namespace: "payments",
            name: "payments-api",
            replicaCount: 1,
            readyReplicas: 1,
            available: true,
            pods: [],
          },
        ]}
        pods={[
          {
            id: "p1",
            namespace: "payments",
            podName: "payments-api-abc",
            deploymentName: "payments-api",
            phase: "Running",
          },
        ]}
        services={[
          {
            id: "s1",
            namespace: "payments",
            name: "payments-api",
            serviceType: "ClusterIP",
            clusterIp: "10.0.0.1",
          },
        ]}
        configMaps={[
          {
            id: "c1",
            namespace: "payments",
            name: "payments-config",
            keyCount: 1,
          },
        ]}
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

    await user.click(screen.getByRole("button", { name: /Contraer|Expandir/i }));
    // Ensure expanded
    if (screen.queryByRole("button", { name: /Expandir/i })) {
      await user.click(screen.getByRole("button", { name: /Expandir/i }));
    }

    const titles = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "")
      .filter((t) =>
        /Deployments|Pods|Services|ConfigMaps/.test(t),
      );
    const order = titles.join("|");
    expect(order.indexOf("Deployments")).toBeLessThan(order.indexOf("Pods"));
    expect(order.indexOf("Pods")).toBeLessThan(order.indexOf("Services"));
    expect(order.indexOf("Services")).toBeLessThan(order.indexOf("ConfigMaps"));
  });
});
