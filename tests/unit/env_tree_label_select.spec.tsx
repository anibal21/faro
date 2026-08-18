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

describe("EnvTreeNav label-only select (US2)", () => {
  it("selects via label text, not via expand icon", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <EnvTreeNav
        environments={[env]}
        selectedId={null}
        connectedIds={[]}
        connectingId={null}
        connectionErrorId={null}
        catalogByInstance={emptyCatalogByInstance()}
        onSelect={onSelect}
        onConnect={() => undefined}
        onDisconnect={() => undefined}
        onEdit={() => undefined}
        onOpenDeployment={() => undefined}
        onOpenPod={() => undefined}
        onOpenService={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: /prod/i }));
    expect(onSelect).toHaveBeenCalledWith("e1");

    onSelect.mockClear();
    await user.click(screen.getByRole("button", { name: /Expandir/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
