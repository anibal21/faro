import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AboutFaroDialog } from "../../src/components/help/AboutFaroDialog";
import { AppMenubar } from "../../src/components/chrome/AppMenubar";
import {
  ABOUT_AUTHOR_NAME,
  ABOUT_DIALOG_TITLE,
  ABOUT_EMAIL,
  ABOUT_GITHUB_URL,
  ABOUT_LICENSE,
  ABOUT_LINKEDIN_URL,
  ABOUT_MESSAGE,
} from "../../src/content/aboutFaro";

describe("about Faro (028)", () => {
  it("dialog shows MIT, author, email, GitHub and LinkedIn", () => {
    render(<AboutFaroDialog open onOpenChange={() => undefined} />);
    expect(screen.getByText(ABOUT_DIALOG_TITLE)).toBeInTheDocument();
    expect(screen.getByText(ABOUT_LICENSE)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(ABOUT_AUTHOR_NAME)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(ABOUT_EMAIL)).toBeInTheDocument();
    expect(screen.getByText(ABOUT_GITHUB_URL)).toBeInTheDocument();
    expect(screen.getByText(ABOUT_LINKEDIN_URL)).toBeInTheDocument();
    expect(ABOUT_MESSAGE.toLowerCase()).toMatch(/gracias/);
    expect(ABOUT_MESSAGE).toMatch(/MIT/);
  });

  it("Ayuda → Acerca de Faro opens via callback", async () => {
    const user = userEvent.setup();
    const onOpenAbout = vi.fn();
    render(
      <AppMenubar
        theme="light"
        onTheme={() => undefined}
        onNew={() => undefined}
        onDisconnectAll={() => undefined}
        onOpenSecurity={() => undefined}
        onOpenAbout={onOpenAbout}
      />,
    );
    await user.click(screen.getByText("Ayuda"));
    await user.click(screen.getByText("Acerca de Faro"));
    expect(onOpenAbout).toHaveBeenCalledTimes(1);
  });
});
