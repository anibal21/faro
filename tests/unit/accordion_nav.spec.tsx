import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccordionNav } from "../../src/components/catalog/AccordionNav";

describe("AccordionNav (US1)", () => {
  it("expands/collapses Pods without a filter control", async () => {
    const user = userEvent.setup();
    render(
      <AccordionNav
        connected
        deployments={[
          {
            id: "d1",
            namespace: "default",
            name: "payments-api",
            replicaCount: 3,
            readyReplicas: 3,
            available: true,
            pods: [],
          },
        ]}
        configMaps={[]}
        onOpenDeployment={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );

    expect(screen.queryByPlaceholderText(/filtr|buscar/i)).toBeNull();
    expect(screen.getByText("payments-api")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Pods/i }));
    expect(screen.queryByText("payments-api")).toBeNull();

    await user.click(screen.getByRole("button", { name: /Pods/i }));
    expect(screen.getByText("payments-api")).toBeInTheDocument();
  });
});
