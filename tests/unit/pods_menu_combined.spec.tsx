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

async function expandEnv(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Contraer|Expandir/i }));
  if (screen.queryByRole("button", { name: /Expandir/i })) {
    await user.click(screen.getByRole("button", { name: /Expandir/i }));
  }
}

describe("pods menu combined (US1)", () => {
  it("shows one grouped row per Deployment with replica count, not peer replicas", async () => {
    const user = userEvent.setup();
    const onOpenPod = vi.fn();
    render(
      <EnvTreeNav
        environments={[env]}
        selectedId={env.id}
        connectedIds={[env.id]}
        connectingId={null}
        connectionErrorId={null}
        catalogFocusId={env.id}
        deployments={[]}
        pods={[
          {
            id: "p1",
            namespace: "payments",
            podName: "payments-api-aaa",
            deploymentName: "payments-api",
            phase: "Running",
          },
          {
            id: "p2",
            namespace: "payments",
            podName: "payments-api-bbb",
            deploymentName: "payments-api",
            phase: "Running",
          },
          {
            id: "p3",
            namespace: "payments",
            podName: "orphan-1",
            deploymentName: null,
            phase: "Running",
          },
        ]}
        services={[]}
        configMaps={[]}
        onSelect={() => undefined}
        onConnect={() => undefined}
        onDisconnect={() => undefined}
        onEdit={() => undefined}
        onOpenDeployment={() => undefined}
        onOpenPod={onOpenPod}
        onOpenService={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );

    await expandEnv(user);
    // Pods section defaults open — do not toggle (click would collapse)
    expect(screen.getByText("payments-api (2)")).toBeTruthy();
    expect(screen.queryByText("payments-api-aaa")).toBeNull();
    expect(screen.queryByText("payments-api-bbb")).toBeNull();
    expect(screen.getByText("orphan-1")).toBeTruthy();

    await user.click(screen.getByText("payments-api (2)"));
    expect(onOpenPod).toHaveBeenCalledWith(
      "payments",
      "payments-api-aaa",
      "payments-api",
    );
  });
});
