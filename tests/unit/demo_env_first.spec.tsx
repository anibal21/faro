import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

const live = {
  ...demo,
  id: "live-1",
  name: "prod",
  clusterName: "prod-cluster",
  isBuiltinDemo: false,
};

describe("demo env first (008 US2)", () => {
  it("lists demo before other environments", () => {
    render(
      <EnvTreeNav
        environments={[live, demo] as never}
        selectedId={null}
        connectedIds={[]}
        connectingIds={[]}
        catalogFocusId={null}
        deployments={[]}
        configMaps={[]}
        catalogLoading={false}
        onSelect={() => undefined}
        onConnect={() => undefined}
        onDisconnect={() => undefined}
        onEdit={() => undefined}
        onOpenDeployment={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );
    const text = document.body.textContent ?? "";
    expect(text.indexOf("demo")).toBeLessThan(text.indexOf("prod"));
  });
});
