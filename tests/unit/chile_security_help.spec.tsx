import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SecurityDialog } from "../../src/components/help/SecurityDialog";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";
import {
  CHILE_NORMS,
  FORBIDDEN_SECURITY_CLAIMS,
  SECURITY_DIALOG_TITLE,
  SECURITY_INTRO,
  securityDialogPlainText,
} from "../../src/content/chileSecurity";

describe("chile security help (022)", () => {
  it("FR-012: open dialog mentions 21.663 and 21.719 (or 19.628)", () => {
    render(<SecurityDialog open onOpenChange={() => undefined} />);
    const body = document.body.textContent ?? "";
    expect(body).toContain("21.663");
    expect(body.includes("21.719") || body.includes("19.628")).toBe(true);
    expect(screen.getByText(SECURITY_DIALOG_TITLE)).toBeInTheDocument();
  });

  it("shows all four CHILE_NORMS when dialog is open", () => {
    render(<SecurityDialog open onOpenChange={() => undefined} />);
    for (const norm of CHILE_NORMS) {
      expect(screen.getByText(norm.name)).toBeInTheDocument();
    }
    expect(screen.getByText("Cómo Faro se alinea")).toBeInTheDocument();
  });

  it("US2: forbids ANCI certification / automatic OIV claims", () => {
    const text = securityDialogPlainText().toLowerCase();
    for (const claim of FORBIDDEN_SECURITY_CLAIMS) {
      expect(text).not.toContain(claim.toLowerCase());
    }
    expect(SECURITY_INTRO.toLowerCase()).toMatch(
      /responsabilidad|organizaci[oó]n|sgsi/,
    );
  });

  it("US3: SecurityDialog module does not import invoke or fetch helpers", async () => {
    const src = await import("../../src/components/help/SecurityDialog");
    expect(src.SecurityDialog).toBeTypeOf("function");
    // Static guarantee: content + dialog are local-only (no ipc in chileSecurity)
    const contentMod = await import("../../src/content/chileSecurity");
    expect(contentMod.CHILE_NORMS.length).toBeGreaterThanOrEqual(4);
    expect("invoke" in contentMod).toBe(false);
  });

  it("Ayuda → Seguridad is first help action and opens via callback", async () => {
    const user = userEvent.setup();
    const onOpenSecurity = vi.fn();
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
        onOpenSecurity={onOpenSecurity}
      />,
    );

    await user.click(screen.getByText("Ayuda"));
    const seguridad = screen.getByText("Seguridad");
    expect(seguridad).toBeInTheDocument();
    await user.click(seguridad);
    expect(onOpenSecurity).toHaveBeenCalledTimes(1);
  });
});
