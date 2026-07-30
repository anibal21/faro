import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceDetailTab } from "../../src/components/catalog/ServiceDetailTab";

describe("ServiceDetailTab (US7)", () => {
  it("renders read-only service fields", () => {
    render(
      <ServiceDetailTab
        name="payments-api"
        detail={{
          id: "s1",
          namespace: "payments",
          name: "payments-api",
          serviceType: "ClusterIP",
          clusterIp: "10.96.0.1",
          portsJson: '[{"port":80}]',
          selectorJson: '{"app":"payments-api"}',
        }}
      />,
    );
    expect(screen.getByTestId("service-detail")).toBeInTheDocument();
    expect(screen.getByText(/solo lectura/i)).toBeInTheDocument();
    expect(screen.getByText("ClusterIP")).toBeInTheDocument();
    expect(screen.getByText("10.96.0.1")).toBeInTheDocument();
    expect(screen.getByText(/"port": 80/)).toBeInTheDocument();
  });

  it("shows empty state without detail", () => {
    render(<ServiceDetailTab name="x" detail={null} />);
    expect(screen.getByText(/Sin datos/i)).toBeInTheDocument();
  });
});
