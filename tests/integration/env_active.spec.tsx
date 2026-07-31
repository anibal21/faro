import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import type { ConnectionInstance, WorkspaceState } from "../../src/lib/ipc";

const purge = vi.fn();
const list = vi.fn();
const setActive = vi.fn();
const workspaceGet = vi.fn();

vi.mock("../../src/lib/ipc", () => ({
  sessionPurgeEphemeral: () => purge(),
  envList: () => list(),
  envUpsert: vi.fn(),
  envDelete: vi.fn(),
  envLoad: vi.fn(),
  envSetActive: (id: string) => setActive(id),
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
  analyzeWriteGroup: vi.fn(async () => ({
    findings: [],
    packId: "springboot",
    packDisplayName: "Spring Boot / JVM",
  })),
  prefsGet: vi.fn(async () => ({ theme: "light" })),
  prefsSet: vi.fn(),
  listenEvent: vi.fn(async () => () => undefined),
}));

function sample(id: string, name: string): ConnectionInstance {
  return {
    id,
    name,
    bastionHost: "h",
    sshPort: 22,
    sshUser: "u",
    pemPath: "C:\\a.pem",
    iamCredentialsPath: "C:\\iam",
    regionName: "us-east-1",
    clusterName: "c",
    namespaceDefault: null,
    sortOrder: null,
    isFavorite: false,
    notes: null,
    createdAt: "t",
    updatedAt: "t",
  };
}

function ws(partial: Partial<WorkspaceState> = {}): WorkspaceState {
  return {
    loadedIds: [],
    activeId: null,
    liveGeneration: 0,
    ...partial,
  };
}

describe("tree select (US3)", () => {
  beforeEach(() => {
    (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS = 0;
    purge.mockReset();
    list.mockReset();
    setActive.mockReset();
    workspaceGet.mockReset();
    purge.mockResolvedValue({ purged: true });
    list.mockResolvedValue([sample("a", "env-a"), sample("b", "env-b")]);
    workspaceGet.mockResolvedValue(ws({ activeId: "a", loadedIds: ["a"] }));
  });

  it("switches selection via tree label", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Selecciona y conecta/i)).toBeInTheDocument();
    });

    setActive.mockResolvedValue(
      ws({ loadedIds: ["a", "b"], activeId: "b", liveGeneration: 1 }),
    );
    await user.click(screen.getByRole("button", { name: /env-b/i }));

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith("b");
    });
  });
});
