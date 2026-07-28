import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TitleBar } from "../../src/components/chrome/TitleBar";

describe("TitleBar (US3)", () => {
  it("renders title and window controls", () => {
    render(<TitleBar />);
    expect(screen.getByText("Faro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Minimizar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Maximizar|Restaurar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cerrar/i })).toBeInTheDocument();
  });
});
