import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccordionNav } from "../../src/components/catalog/AccordionNav";

describe("AccordionNav empty/disconnected (US4)", () => {
  it("shows connect-first hint when disconnected", () => {
    render(
      <AccordionNav
        connected={false}
        deployments={[]}
        configMaps={[]}
        onOpenDeployment={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );
    expect(
      screen.getByText(/Conecta un ambiente para ver el catalogo/i),
    ).toBeInTheDocument();
  });

  it("shows empty lists when connected with no items", () => {
    render(
      <AccordionNav
        connected
        deployments={[]}
        configMaps={[]}
        onOpenDeployment={() => undefined}
        onOpenConfigMap={() => undefined}
      />,
    );
    expect(screen.getByText("Sin deployments")).toBeInTheDocument();
    expect(screen.getByText("Sin ConfigMaps")).toBeInTheDocument();
  });
});
