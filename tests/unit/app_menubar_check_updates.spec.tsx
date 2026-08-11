import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";

describe("AppMenubar check updates (025 US4)", () => {
  it("Ayuda → Buscar actualizaciones… invokes callback", async () => {
    const user = userEvent.setup();
    const onCheckUpdates = vi.fn();
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
        onOpenSecurity={() => undefined}
        onCheckUpdates={onCheckUpdates}
      />,
    );

    await user.click(screen.getByText("Ayuda"));
    await user.click(screen.getByText("Buscar actualizaciones…"));
    expect(onCheckUpdates).toHaveBeenCalledTimes(1);
  });
});
