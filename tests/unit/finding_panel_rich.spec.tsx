import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FindingPanel } from "../../src/components/analysis/FindingPanel";
import { AnalysisDrawer } from "../../src/components/logs/AnalysisDrawer";

const richFinding = {
  severity: "critical",
  ruleId: "springboot.npe",
  title: "NullPointerException",
  summary: "La aplicación intentó usar un objeto vacío (null).",
  why: "Suele ser un fallo de código.",
  whatToLookFor: ["NullPointerException"],
  recommendation: ["Revisa el stacktrace."],
};

describe("FindingPanel rich UI (016 US1/US4)", () => {
  it("shows title, summary, signal, and pack empty copy", () => {
    render(
      <FindingPanel
        findings={[]}
        packId="springboot"
        packDisplayName="Spring Boot / JVM"
        signalSnippet="java.lang.NullPointerException\n\tat com.example.Foo"
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText(/Paquete:/)).toBeInTheDocument();
    expect(screen.getByText(/Señal en el log/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sin coincidencias en el paquete de reglas Spring Boot \/ JVM/),
    ).toBeInTheDocument();
  });

  it("renders rich finding fields", () => {
    render(
      <FindingPanel
        findings={[richFinding]}
        packId="springboot"
        packDisplayName="Spring Boot / JVM"
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText("springboot.npe")).toBeInTheDocument();
    expect(
      screen.getByText(/La aplicación intentó usar un objeto vacío/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Por qué:/)).toBeInTheDocument();
    expect(screen.getByText(/Revisa el stacktrace/)).toBeInTheDocument();
  });

  it("select invokes onPackChange", async () => {
    const user = userEvent.setup();
    const onPackChange = vi.fn();
    render(
      <AnalysisDrawer
        findings={[richFinding]}
        packId="springboot"
        packDisplayName="Spring Boot / JVM"
        signalSnippet="NullPointerException"
        onPackChange={onPackChange}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText(/Señal en el log/)).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Paquete de reglas/i }),
      "liquibase",
    );
    expect(onPackChange).toHaveBeenCalledWith("liquibase");
  });
});
