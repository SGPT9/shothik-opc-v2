import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConnectExistingCompanyModal } from "../ConnectExistingCompanyModal";

describe("Connect Existing Website / BYOW Modal (ConnectExistingCompanyModal.tsx)", () => {
  it("scans existing website URL, extracts brand metadata, and activates outreach", async () => {
    render(<ConnectExistingCompanyModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Connect Existing Website or Business")).toBeInTheDocument();
    expect(screen.getByText("BYOW Autopilot")).toBeInTheDocument();

    const urlInput = screen.getByTestId("input-connect-url");
    const scanBtn = screen.getByTestId("button-scan-website");

    fireEvent.change(urlInput, { target: { value: "https://myb2bshop.com.bd" } });
    fireEvent.click(scanBtn);

    // Wait for the simulated crawler to finish
    await waitFor(
      () => {
        expect(screen.getByText("Website Analysis Verified")).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    expect(screen.getByText("Ready for Outreach")).toBeInTheDocument();
    expect(screen.getByTestId("button-activate-connected-outreach")).toBeInTheDocument();
  });
});
