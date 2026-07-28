import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import type { ConnectionInstance } from "../../src/lib/ipc";

const purge = vi.fn();
const list = vi.fn();
const upsert = vi.fn();
const del = vi.fn();
const workspaceGet = vi.fn();

vi.mock("../../src/lib/ipc", () => ({
  sessionPurgeEphemeral: () => purge(),
  envList: () => list(),
  envUpsert: (payload: unknown) => upsert(payload),
  envDelete: (id: string) => del(id),
  envLoad: vi.fn(),
  envSetActive: vi.fn(),
  envWorkspaceGet: () => workspaceGet(),
  envConnect: vi.fn(),
  envDisconnect: vi.fn(),
  envConnectionStates: vi.fn(async () => []),
  demoFixturePaths: vi.fn(),
  k8sListDeployments: vi.fn(async () => []),
  k8sListConfigmaps: vi.fn(async () => []),
  k8sGetConfigmap: vi.fn(),
  catalogRefresh: vi.fn(),
  logsOpen: vi.fn(),
  logsClose: vi.fn(),
  logsSetView: vi.fn(),
  analyzeWriteGroup: vi.fn(async () => []),
  prefsGet: vi.fn(async () => ({ theme: "light" })),
  prefsSet: vi.fn(),
  listenEvent: vi.fn(async () => () => undefined),
}));

function sample(partial: Partial<ConnectionInstance> = {}): ConnectionInstance {
  return {
    id: "id-1",
    name: "prod-eks",
    bastionHost: "bastion.example",
    sshPort: 22,
    sshUser: "ec2-user",
    pemPath: "C:\\keys\\a.pem",
    iamCredentialsPath: "C:\\aws\\creds",
    regionName: "us-east-1",
    clusterName: "demo",
    namespaceDefault: "default",
    sortOrder: null,
    isFavorite: false,
    notes: null,
    createdAt: "2026-07-23T00:00:00Z",
    updatedAt: "2026-07-23T00:00:00Z",
    ...partial,
  };
}

describe("env CRUD (US2)", () => {
  beforeEach(() => {
    (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS = 0;
    purge.mockReset();
    list.mockReset();
    upsert.mockReset();
    del.mockReset();
    workspaceGet.mockReset();
    purge.mockResolvedValue({ purged: true });
    list.mockResolvedValue([]);
    workspaceGet.mockResolvedValue({
      loadedIds: [],
      activeId: null,
      liveGeneration: 0,
    });
    upsert.mockImplementation(async (payload: { name: string }) =>
      sample({ name: payload.name, id: "new-id" }),
    );
    del.mockResolvedValue(undefined);
  });

  it("opens modal, saves environment, and lists it in tree", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Bienvenido a Faro")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: "Nuevo ambiente" }),
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/Configuracion nuevo ambiente/i),
    ).toBeInTheDocument();

    await user.type(
      within(dialog).getByLabelText(/Nombre de la conexion/i),
      "prod-eks",
    );
    await user.type(
      within(dialog).getByLabelText(/Host \(bastion\)/i),
      "bastion.example",
    );
    await user.clear(within(dialog).getByLabelText(/Puerto SSH/i));
    await user.type(within(dialog).getByLabelText(/Puerto SSH/i), "22");
    await user.type(within(dialog).getByLabelText(/Username SSH/i), "ec2-user");
    await user.type(within(dialog).getByLabelText(/PEM \(ruta/i), "C:\\keys\\a.pem");
    await user.type(
      within(dialog).getByLabelText(/Credenciales IAM/i),
      "C:\\aws\\creds",
    );
    await user.type(within(dialog).getByLabelText(/region_name/i), "us-east-1");
    await user.type(within(dialog).getByLabelText(/cluster_name/i), "demo");

    list.mockResolvedValue([sample()]);
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(upsert).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /prod-eks/i })).toBeInTheDocument();
    });
  });
});
