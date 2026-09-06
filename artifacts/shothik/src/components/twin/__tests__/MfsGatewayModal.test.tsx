import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MfsGatewayModal } from "../MfsGatewayModal";

describe("bKash & Nagad MFS Payment Gateway Modal (MfsGatewayModal.tsx)", () => {
  it("renders credentials view and saves merchant configuration", async () => {
    render(<MfsGatewayModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/bKash & Nagad MFS Payment Gateway/i)).toBeInTheDocument();
    expect(screen.getByText(/1.85% Fee Math Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Merchant App Key/i)).toBeInTheDocument();

    const saveBtn = screen.getByTestId("button-save-mfs-credentials");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Credentials Saved & Verified!/i)).toBeInTheDocument();
    });
  });

  it("switches to checkout simulator and progresses through bKash payment steps", async () => {
    render(<MfsGatewayModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const simTabBtn = screen.getByText("Checkout Simulator");
    fireEvent.click(simTabBtn);

    expect(screen.getByText(/Your bKash Account Number/i)).toBeInTheDocument();

    const confirmBtn = screen.getByTestId("button-confirm-simulator");
    expect(confirmBtn).toHaveTextContent("Next: Send OTP");

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verification Code \(OTP\)/i)).toBeInTheDocument();
    });
  });

  it("switches to manual TrxID settlement tab and displays 4 canonical micro-pass tiers", async () => {
    render(
      <MfsGatewayModal
        open={true}
        onOpenChange={() => {}}
        companyName="VerifiQ AI"
        initialTab="manual_trx"
      />
    );

    expect(screen.getByText(/Offline MFS & Retail Agent Shop TrxID Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/৳100 Quick Pass/i)).toBeInTheDocument();
    expect(screen.getByText(/৳350 Student Pack/i)).toBeInTheDocument();
    expect(screen.getByText(/৳750 Pro Creator/i)).toBeInTheDocument();
    expect(screen.getByText(/৳1,500 F-Commerce/i)).toBeInTheDocument();

    const trxInput = screen.getByTestId("input-manual-trxid");
    expect(trxInput).toBeInTheDocument();
  });
});
