import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StartupBuildsModal } from "../StartupBuildsModal";

describe("Startup Container Builds & Releases Modal (StartupBuildsModal.tsx)", () => {
  it("renders container release history and triggers rolling redeploy", async () => {
    render(
      <StartupBuildsModal
        open={true}
        onOpenChange={() => {}}
        subdomain="verifiq"
        companyName="VerifiQ AI"
      />
    );

    expect(screen.getByText("VerifiQ AI Container Builds & Releases")).toBeInTheDocument();
    expect(screen.getByText("Dokploy PaaS · Live")).toBeInTheDocument();
    expect(screen.getByText("v2.5.0-alpha")).toBeInTheDocument();

    const redeployBtn = screen.getByTestId("button-trigger-redeploy");
    fireEvent.click(redeployBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Redeploy Succeeded!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("switches to live sandboxed preview tab", () => {
    render(
      <StartupBuildsModal
        open={true}
        onOpenChange={() => {}}
        subdomain="verifiq"
        companyName="VerifiQ AI"
      />
    );

    const previewTabBtn = screen.getByText("Live Preview");
    fireEvent.click(previewTabBtn);

    expect(screen.getByText("SSL Verified")).toBeInTheDocument();
    expect(screen.getByTitle("Live Container Sandboxed Preview")).toBeInTheDocument();
  });
});
