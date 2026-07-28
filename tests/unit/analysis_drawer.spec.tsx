import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalysisDrawer } from "../../src/components/logs/AnalysisDrawer";
import { useAnalysisDrawer } from "../../src/hooks/useAnalysisDrawer";

function Harness() {
  const d = useAnalysisDrawer();
  return (
    <div>
      <button type="button" onClick={d.openDrawer}>
        open
      </button>
      <button type="button" onClick={d.closeDrawer}>
        close-hook
      </button>
      {d.open && (
        <AnalysisDrawer findings={[]} onClose={d.closeDrawer} />
      )}
      <span data-testid="open">{String(d.open)}</span>
    </div>
  );
}

describe("AnalysisDrawer (US3)", () => {
  it("opens and closes via hook", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByTestId("open")).toHaveTextContent("false");
    await user.click(screen.getByText("open"));
    expect(screen.getByTestId("open")).toHaveTextContent("true");
    expect(screen.getByText(/Analisis/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Cerrar/i }));
    expect(screen.getByTestId("open")).toHaveTextContent("false");
  });
});
