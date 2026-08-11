import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplashView } from "../../src/views/SplashView";

describe("SplashView visual (006 US1)", () => {
  it("renders full-bleed splash without brand/tagline overlays", () => {
    const { container } = render(<SplashView />);
    expect(container.querySelector(".splash")).toBeTruthy();
    expect(container.querySelector(".splash__bg")).toBeTruthy();
    expect(container.querySelector(".splash__brand")).toBeNull();
    expect(container.querySelector(".splash__tagline")).toBeNull();
    expect(screen.queryByRole("heading", { name: /Faro/i })).toBeNull();
  });

  it("shows status only bottom-right when provided", () => {
    const { container } = render(<SplashView status="…preparando" />);
    const status = container.querySelector(".splash__status");
    expect(status).toBeTruthy();
    expect(status).toHaveTextContent("…preparando");
    expect(status).not.toHaveClass("splash__status--error");
  });

  it("shows error bottom-right and overrides status", () => {
    const { container } = render(
      <SplashView status="…preparando" error="boot failed" />,
    );
    const status = container.querySelector(".splash__status");
    expect(status).toHaveTextContent("boot failed");
    expect(status).toHaveClass("splash__status--error");
    expect(screen.queryByText("…preparando")).toBeNull();
  });

  it("image-only when healthy with no status", () => {
    const { container } = render(<SplashView />);
    expect(container.querySelector(".splash__status")).toBeNull();
  });
});
