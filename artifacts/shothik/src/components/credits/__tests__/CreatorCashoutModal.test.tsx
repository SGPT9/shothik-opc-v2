import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CreatorCashoutModal from "../CreatorCashoutModal";

describe("CreatorCashoutModal Component", () => {
  it("renders the modal with available balance and 10% NBR TDS breakdown", () => {
    render(<CreatorCashoutModal open={true} onOpenChange={() => {}} availableEarningsBdt={5000} />);

    expect(screen.getByText(/Withdraw Creator Earnings/i)).toBeDefined();
    expect(screen.getByText(/৳5,000 BDT/i)).toBeDefined();
    expect(screen.getByText(/NBR 10% TDS Withheld/i)).toBeDefined();
  });

  it("calculates net payout correctly when amount changes", () => {
    render(<CreatorCashoutModal open={true} onOpenChange={() => {}} availableEarningsBdt={5000} />);

    const amountInput = screen.getByTestId("input-payout-amount") as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: "3000" } });

    // 10% of 3000 = 300 TDS, Net = 2,700
    expect(screen.getByText(/-৳300 BDT/i)).toBeDefined();
    expect(screen.getAllByText(/৳2,700 BDT/i).length).toBeGreaterThan(0);
  });
});
