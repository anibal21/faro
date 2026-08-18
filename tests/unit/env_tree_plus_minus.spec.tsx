import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvTreeNav } from "../../src/components/catalog/EnvTreeNav";
import { emptyCatalogByInstance } from "../helpers/catalogByInstance";

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
  namespaceDefault: null,
  sortOrder: null,
  isFavorite: false,
  notes: null,
  createdAt: "",
  updatedAt: "",
};

describe("EnvTreeNav plus/minus (US1)", () => {
  it("uses Plus when collapsed and Minus when expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <EnvTreeNav
        environments={[env]}
        selectedId={null}
        connectedIds={[]}
        connectingId={null}
        connectionErrorId={null}
        catalogByInstance={emptyCatalogByInstance()}
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

    expect(container.textContent).not.toMatch(/>\s*prod|v\s*prod/);
    const expand = screen.getByRole("button", { name: /Expandir/i });
    expect(expand.querySelector("svg")).toBeTruthy();

    await user.click(expand);
    expect(screen.getByRole("button", { name: /Contraer/i })).toBeInTheDocument();
  });
});
