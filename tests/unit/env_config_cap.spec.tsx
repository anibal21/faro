import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewEnvironmentModal } from "../../src/components/env/NewEnvironmentModal";

describe("environment configuration cap", () => {
  it("surfaces the backend limit message in Spanish", async () => {
    const user = userEvent.setup();
    render(
      <NewEnvironmentModal
        open
        onClose={() => undefined}
        onSave={vi.fn().mockRejectedValue(
          new Error("Máximo 10 configuraciones de conexión."),
        )}
      />,
    );
    const values: Record<string, string> = {
      "Nombre de la conexion": "once",
      "Host (bastion)": "bastion.example",
      "Puerto SSH": "22",
      "Username SSH": "ec2-user",
      Namespace: "default",
      region_name: "us-east-1",
      cluster_name: "cluster",
      "PEM (ruta)": "C:\\keys\\demo.pem",
    };
    for (const [label, value] of Object.entries(values)) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(
      await screen.findByText("Máximo 10 configuraciones de conexión."),
    ).toBeInTheDocument();
  });
});

