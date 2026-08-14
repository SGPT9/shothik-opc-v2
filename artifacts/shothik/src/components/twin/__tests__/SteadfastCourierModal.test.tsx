import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SteadfastCourierModal } from "../SteadfastCourierModal";

describe("Steadfast Courier COD & Shipping Automation (SteadfastCourierModal.tsx)", () => {
  it("renders parcel consignments, status badges, and payout stats", () => {
    render(<SteadfastCourierModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Steadfast Courier COD & Shipping Automation/i)).toBeInTheDocument();
    expect(screen.getByText(/All 64 Districts/i)).toBeInTheDocument();
    expect(screen.getByText(/ST-889102/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahmed Zubair/i)).toBeInTheDocument();
  });

  it("opens printable shipping label with QR code simulation", () => {
    render(<SteadfastCourierModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const printBtn = screen.getByTestId("button-print-label-ST-889102");
    fireEvent.click(printBtn);

    expect(screen.getByText(/Nationwide Express Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/COLLECT COD:/i)).toBeInTheDocument();
    expect(screen.getByText(/৳1250 BDT/i)).toBeInTheDocument();
  });
});
