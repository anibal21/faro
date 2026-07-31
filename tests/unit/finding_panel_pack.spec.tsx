import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FindingPanel } from "../../src/components/analysis/FindingPanel";

describe("FindingPanel pack UI (US4)", () => {
  it("shows pack display name and empty copy uses it", () => {
    render(
      <FindingPanel
        findings={[]}
        packId="springboot"
        packDisplayName="Spring Boot / JVM"
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText(/Paquete:/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sin coincidencias en el paquete de reglas Spring Boot \/ JVM/),
    ).toBeInTheDocument();
  });

  it("select invokes onPackChange", async () => {
    const user = userEvent.setup();
    const onPackChange = vi.fn();
    render(
      <FindingPanel
        findings={[
          {
            severity: "critical",
            ruleId: "springboot.npe",
            explanation: "npe",
            recommendation: "fix",
          },
        ]}
        packId="springboot"
        packDisplayName="Spring Boot / JVM"
        onPackChange={onPackChange}
        onClose={() => undefined}
      />,
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Paquete de reglas/i }),
      "nodejs",
    );
    expect(onPackChange).toHaveBeenCalledWith("nodejs");
  });
});
