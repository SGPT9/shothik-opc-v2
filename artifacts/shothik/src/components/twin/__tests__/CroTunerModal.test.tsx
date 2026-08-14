import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CroTunerModal } from "../CroTunerModal";

describe("Self-Healing CRO Auto-Tuner (CroTunerModal.tsx)", () => {
  it("renders A/B variants, confidence score, and conversion lift", () => {
    render(<CroTunerModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Self-Healing CRO Auto-Tuner/i)).toBeInTheDocument();
    expect(screen.getByText(/98.4%/i)).toBeInTheDocument();
    expect(screen.getByText(/\+69.2%/i)).toBeInTheDocument();
    expect(screen.getByText(/WINNING VARIANT/i)).toBeInTheDocument();
  });

  it("promotes winning variant to production", () => {
    render(<CroTunerModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const promoteBtn = screen.getByTestId("button-promote-winner");
    fireEvent.click(promoteBtn);

    expect(screen.getByText(/Variant B headline has been automatically deployed/i)).toBeInTheDocument();
  });
});
