import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";

describe("AppMenubar (US1)", () => {
  it("renders Ambientes and Temas only", () => {
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
      />,
    );

    expect(screen.getByText("Ambientes")).toBeInTheDocument();
    expect(screen.getByText("Temas")).toBeInTheDocument();
    expect(screen.queryByText("Ver")).toBeNull();
  });
});
