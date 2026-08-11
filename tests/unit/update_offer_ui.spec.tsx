import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdateAvailableDialog } from "../../src/components/update/UpdateAvailableDialog";

describe("UpdateAvailableDialog (025)", () => {
  it("shows current/available versions and Accept/Reject actions", () => {
    render(
      <UpdateAvailableDialog
        open
        currentVersion="0.1.0"
        availableVersion="0.2.0"
        canInstall
        onAccept={() => undefined}
        onReject={() => undefined}
        onOpenChange={() => undefined}
      />,
    );

    expect(screen.getByText("Actualización disponible")).toBeInTheDocument();
    expect(screen.getByText("0.1.0")).toBeInTheDocument();
    expect(screen.getByText("0.2.0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualizar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Ahora no" })).toBeEnabled();
  });

  it("disables install CTA when canInstall is false (non-Windows)", () => {
    render(
      <UpdateAvailableDialog
        open
        currentVersion="0.1.0"
        availableVersion="0.2.0"
        canInstall={false}
        onAccept={() => undefined}
        onReject={() => undefined}
        onOpenChange={() => undefined}
      />,
    );

    expect(
      screen.getByText(/instalación automática está disponible en Windows/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualizar" })).toBeDisabled();
  });

  it("Reject does not call Accept", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onReject = vi.fn();
    render(
      <UpdateAvailableDialog
        open
        currentVersion="0.1.0"
        availableVersion="0.2.0"
        canInstall
        onAccept={onAccept}
        onReject={onReject}
        onOpenChange={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ahora no" }));
    expect(onReject).toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
  });
});
