import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";

describe("AppMenubar Ambientes (US2)", () => {
  it("exposes only Nuevo… and Desconectar todo under Ambientes", async () => {
    const user = userEvent.setup();
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
        onOpenSecurity={() => undefined}
      />,
    );

    await user.click(screen.getByText("Ambientes"));
    expect(screen.getByText("Nuevo…")).toBeInTheDocument();
    expect(screen.getByText("Desconectar todo")).toBeInTheDocument();
    expect(screen.queryByText("Editar…")).toBeNull();
    expect(screen.queryByText(/Cargar/i)).toBeNull();
    expect(screen.queryByText("Conectar")).toBeNull();
  });
});
