import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import type { ConnectionInstance } from "../../src/lib/ipc";
import { setPathPickerForTests } from "../../src/lib/fileBrowse";

const purge = vi.fn();
const list = vi.fn();
const upsert = vi.fn();
const workspaceGet = vi.fn();
const demoFixturePaths = vi.fn();

vi.mock("../../src/lib/ipc", () => ({
  sessionPurgeEphemeral: () => purge(),
  envList: () => list(),
  envUpsert: (payload: unknown) => upsert(payload),
  envDelete: vi.fn(),
  envLoad: vi.fn(),
  envSetActive: vi.fn(),
  envWorkspaceGet: () => workspaceGet(),
  envConnect: vi.fn(),
  envDisconnect: vi.fn(),
  envConnectionStates: vi.fn(async () => []),
  demoFixturePaths: (...args: unknown[]) => demoFixturePaths(...args),
  k8sListDeployments: vi.fn(async () => []),
  k8sListConfigmaps: vi.fn(async () => []),
  k8sGetConfigmap: vi.fn(),
  catalogRefresh: vi.fn(),
  logsOpen: vi.fn(),
  logsClose: vi.fn(),
  logsSetView: vi.fn(),
  analyzeWriteGroup: vi.fn(async () => ({
    findings: [],
    packId: "springboot",
    packDisplayName: "Spring Boot / JVM",
  })),
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
    iamCredentialsPath: "",
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

async function openNewEnvDialog(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText("Bienvenido a Faro")).toBeInTheDocument();
  });
  await user.click(screen.getByRole("button", { name: "Nuevo ambiente" }));
  return screen.getByRole("dialog");
}

async function fillRequiredExceptPaths(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
) {
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
  await user.type(within(dialog).getByLabelText(/^Namespace$/i), "default");
  await user.type(within(dialog).getByLabelText(/region_name/i), "us-east-1");
  await user.type(within(dialog).getByLabelText(/cluster_name/i), "demo");
}

describe("env file browse", () => {
  beforeEach(() => {
    (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS = 0;
    purge.mockReset();
    list.mockReset();
    upsert.mockReset();
    workspaceGet.mockReset();
    demoFixturePaths.mockReset();
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
    setPathPickerForTests(null);
  });

  afterEach(() => {
    setPathPickerForTests(null);
  });

  it("fills PEM path via Examinar and saves without IAM field", async () => {
    const user = userEvent.setup();
    setPathPickerForTests(async () => "C:\\keys\\picked.pem");

    const dialog = await openNewEnvDialog(user);
    await fillRequiredExceptPaths(user, dialog);

    expect(
      within(dialog).queryByLabelText(/Credenciales IAM/i),
    ).toBeNull();
    const examinar = within(dialog).getAllByRole("button", { name: "Examinar" });
    expect(examinar).toHaveLength(1);
    await user.click(examinar[0]);

    await waitFor(() => {
      expect(within(dialog).getByLabelText(/PEM \(ruta/i)).toHaveValue(
        "C:\\keys\\picked.pem",
      );
    });

    list.mockResolvedValue([sample()]);
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(upsert).toHaveBeenCalled();
    });
    const payload = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.pemPath).toBe("C:\\keys\\picked.pem");
    expect(payload.iamCredentialsPath === "" || payload.iamCredentialsPath == null).toBe(
      true,
    );
    expect(JSON.stringify(payload)).not.toMatch(/BEGIN|AKIA|aws_secret/i);
  }, 15_000);

  it("keeps PEM path unchanged and Save enabled on cancel", async () => {
    const user = userEvent.setup();
    setPathPickerForTests(async () => null);

    const dialog = await openNewEnvDialog(user);
    await fillRequiredExceptPaths(user, dialog);
    await user.type(
      within(dialog).getByLabelText(/PEM \(ruta/i),
      "C:\\keys\\typed.pem",
    );

    await user.click(within(dialog).getAllByRole("button", { name: "Examinar" })[0]);

    expect(within(dialog).getByLabelText(/PEM \(ruta/i)).toHaveValue(
      "C:\\keys\\typed.pem",
    );
    expect(
      within(dialog).getByRole("button", { name: "Guardar" }),
    ).not.toBeDisabled();
  }, 15_000);

  it("blocks Save when picker throws until Browse recovers", async () => {
    const user = userEvent.setup();
    let fail = true;
    setPathPickerForTests(async () => {
      if (fail) {
        throw new Error("plugin missing");
      }
      return null;
    });

    const dialog = await openNewEnvDialog(user);
    await fillRequiredExceptPaths(user, dialog);
    await user.type(
      within(dialog).getByLabelText(/PEM \(ruta/i),
      "C:\\keys\\a.pem",
    );

    await user.click(within(dialog).getAllByRole("button", { name: "Examinar" })[0]);

    await waitFor(() => {
      expect(
        within(dialog).getByText(/selector de archivos no está disponible/i),
      ).toBeInTheDocument();
    });
    expect(within(dialog).getByRole("button", { name: "Guardar" })).toBeDisabled();

    fail = false;
    await user.click(within(dialog).getAllByRole("button", { name: "Examinar" })[0]);

    await waitFor(() => {
      expect(
        within(dialog).getByRole("button", { name: "Guardar" }),
      ).not.toBeDisabled();
    });
  }, 15_000);

  it("still fills PEM from Usar fixtures demo", async () => {
    const user = userEvent.setup();
    demoFixturePaths.mockResolvedValue({
      pemPath: "C:\\fixtures\\demo.pem",
      iamCredentialsPath: "",
    });

    const dialog = await openNewEnvDialog(user);
    await user.click(within(dialog).getByRole("button", { name: /Usar fixtures demo/i }));

    await waitFor(() => {
      expect(within(dialog).getByLabelText(/PEM \(ruta/i)).toHaveValue(
        "C:\\fixtures\\demo.pem",
      );
    });
    expect(
      within(dialog).queryByLabelText(/Credenciales IAM/i),
    ).toBeNull();
  }, 15_000);
});
