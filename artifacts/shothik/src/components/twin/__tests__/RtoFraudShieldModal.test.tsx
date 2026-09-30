import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RtoFraudShieldModal } from "../RtoFraudShieldModal";

describe("Frontend AG-UI Component: RtoFraudShieldModal (Slice 77)", () => {
  it("renders modal with header, tabs, and prediction controls when open", () => {
    render(<RtoFraudShieldModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/RTO Fraud Shield & Courier Blacklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone & RTO Predictor/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Blacklist/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bKash Advance Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Run Credibility & RTO Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Benchmark Profiles/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<RtoFraudShieldModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("switches tabs between Predictor, Blacklist, and Advance Policy", () => {
    render(<RtoFraudShieldModal isOpen={true} onClose={() => {}} />);

    // Click Community Blacklist tab
    const blacklistTab = screen.getByText(/Community Blacklist/i);
    fireEvent.click(blacklistTab);

    expect(screen.getByText(/Report Malicious \/ Fake Order Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Fraud Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Blacklisted Numbers/i)).toBeInTheDocument();

    // Click bKash Advance Policy tab
    const advanceTab = screen.getByRole("button", { name: /bKash Advance Policy/i });
    fireEvent.click(advanceTab);

    expect(screen.getByText(/Pre-Formatted Customer WhatsApp Advance Request/i)).toBeInTheDocument();
    expect(screen.getByText(/SMS Notification Script/i)).toBeInTheDocument();
  });

  it("autofills chronic returner sample profile when clicked", () => {
    render(<RtoFraudShieldModal isOpen={true} onClose={() => {}} />);

    const chronicBtn = screen.getByText(/Chronic Returner/i);
    fireEvent.click(chronicBtn);

    const phoneInput = screen.getByDisplayValue("01899112233");
    expect(phoneInput).toBeInTheDocument();
  });

  it("conforms to WAI-ARIA modal dialog accessibility standards", () => {
    const handleClose = vitest.fn();
    render(<RtoFraudShieldModal isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "rto-fraud-title");

    const closeBtn = screen.getByRole("button", { name: /close rto fraud shield dialog/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Test Escape key dismissal
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
