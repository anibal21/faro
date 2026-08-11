import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionLimitModal } from "../../src/components/env/ConnectionLimitModal";

describe("connection cap", () => {
  it("shows the Spanish third-connection explanation", () => {
    render(<ConnectionLimitModal open onClose={() => undefined} />);
    expect(screen.getByText("Límite de conexiones")).toBeInTheDocument();
    expect(screen.getByText(/dos ambientes conectados/)).toBeInTheDocument();
  });
});

