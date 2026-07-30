import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";

vi.mock("../../src/lib/appVersion", () => ({
  getAppVersionDisplay: async () => "v0.1.0",
}));

describe("Monitor rail branding (US2)", () => {
  it("shows Monitor title and version footer", async () => {
    render(
      <EnvTreeNav
        environments={[]}
        selectedId={null}
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

    expect(screen.getByText("Monitor")).toBeInTheDocument();
    expect(screen.queryByText(/^Ambientes$/)).toBeNull();
    await waitFor(() => {
      expect(screen.getByTestId("app-version")).toHaveTextContent("v0.1.0");
    });
  });
});
