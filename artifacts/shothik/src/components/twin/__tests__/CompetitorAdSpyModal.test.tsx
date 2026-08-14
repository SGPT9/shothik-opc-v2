import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CompetitorAdSpyModal } from "../CompetitorAdSpyModal";

describe("Competitor Ad Spy & Intelligence Scanner (CompetitorAdSpyModal.tsx)", () => {
  it("renders competitor overview, ad spend estimates, and active ads", () => {
    render(<CompetitorAdSpyModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Competitor Ad Spy & Intelligence Scanner/i)).toBeInTheDocument();
    expect(screen.getByText(/BYOW \/ User 2/i)).toBeInTheDocument();
    expect(screen.getByText(/competitor-shop.bd/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentic Imported Skincare/i)).toBeInTheDocument();
  });

  it("triggers new scan and generates counter-strike campaign angle", async () => {
    render(<CompetitorAdSpyModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const scanBtn = screen.getByTestId("button-scan-competitor");
    fireEvent.click(scanBtn);

    const counterBtns = screen.getAllByText(/Counter-Strike Angle/i);
    expect(counterBtns.length).toBeGreaterThan(0);
    fireEvent.click(counterBtns[0]);

    expect(screen.getByText(/AI Counter-Strike Ad Angle Generated/i)).toBeInTheDocument();
    expect(screen.getByText(/Why wait 48 hours and pay manual bKash charges/i)).toBeInTheDocument();
  });
});
