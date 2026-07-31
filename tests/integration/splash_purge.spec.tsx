import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App";

const purge = vi.fn();
const list = vi.fn();

vi.mock("../../src/lib/ipc", () => ({
  sessionPurgeEphemeral: () => purge(),
  envList: () => list(),
  envUpsert: vi.fn(),
  envDelete: vi.fn(),
  envLoad: vi.fn(),
  envSetActive: vi.fn(),
  envWorkspaceGet: vi.fn(async () => ({
    loadedIds: [],
    activeId: null,
    liveGeneration: 0,
  })),
  envConnect: vi.fn(),
  envDisconnect: vi.fn(),
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

describe("splash → purge → main (US1)", () => {
  beforeEach(() => {
    (window as Window & { __FARO_SPLASH_MIN_MS?: number }).__FARO_SPLASH_MIN_MS = 0;
    purge.mockReset();
    list.mockReset();
    purge.mockResolvedValue({ purged: true });
    list.mockResolvedValue([]);
  });

  it("shows branded splash without title overlay, then main after purge", async () => {
    const { container } = render(<App />);

    expect(container.querySelector(".splash")).toBeTruthy();
    expect(container.querySelector(".splash__bg")).toBeTruthy();
    expect(container.querySelector(".splash__brand")).toBeNull();
    expect(container.querySelector(".splash__tagline")).toBeNull();
    expect(
      screen.queryByText(
        /Herramienta de monitoreo infraestructura para ambiente AWS/,
      ),
    ).toBeNull();

    await waitFor(() => {
      expect(purge).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Bienvenido a Faro")).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(/No hay ambientes guardados/i).length,
    ).toBeGreaterThan(0);
  });

  it("keeps splash and shows error if purge fails", async () => {
    purge.mockRejectedValue(new Error("purge failed"));
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText("purge failed")).toBeInTheDocument();
    });
    expect(container.querySelector(".splash__status--error")).toBeTruthy();
  });
});
