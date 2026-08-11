import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewEnvironmentModal } from "../../src/components/env/NewEnvironmentModal";

describe("env form no IAM (US1)", () => {
  it("modal has no IAM credentials control", () => {
    render(
      <NewEnvironmentModal
        open
        onClose={() => undefined}
        onSave={async () => undefined}
      />,
    );
    expect(screen.queryByLabelText(/Credenciales IAM/i)).toBeNull();
    expect(screen.getByLabelText(/PEM \(ruta/i)).toBeTruthy();
    expect(screen.getByText(/sin archivo IAM/i)).toBeTruthy();
  });
});

describe("connect no local IAM (US2)", () => {
  it("live connect uses bastion describe and skips validate_iam / local describe", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    const live = src.slice(src.indexOf("} else {"), src.lastIndexOf("let session_id"));
    expect(live).toContain("describe_cluster_endpoint_via_bastion");
    expect(live).toContain("mint_eks_token_via_bastion");
    expect(live).not.toContain("validate_iam_credentials_file");
    expect(live).not.toMatch(
      /describe_cluster_endpoint\(\s*&env\.region_name/,
    );
    const describeIdx = live.indexOf("describe_cluster_endpoint_via_bastion");
    const tunnelIdx = live.indexOf("open_tunnel");
    expect(describeIdx).toBeGreaterThanOrEqual(0);
    expect(tunnelIdx).toBeGreaterThan(describeIdx);
  });

  it("demo branch still hydrates without bastion describe", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src-tauri/src/commands/connect.rs"),
      "utf8",
    );
    expect(src).toContain("hydrate_demo_catalog");
    expect(src).toContain("is_builtin_demo");
  });
});
