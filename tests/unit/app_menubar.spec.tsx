import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";

describe("AppMenubar (US1)", () => {
  it("renders Ambientes, Temas, and Ayuda", () => {
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
        onOpenSecurity={() => undefined}
      />,
    );

    expect(screen.getByText("Ambientes")).toBeInTheDocument();
    expect(screen.getByText("Temas")).toBeInTheDocument();
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
    expect(screen.queryByText("Ver")).toBeNull();
  });
});
