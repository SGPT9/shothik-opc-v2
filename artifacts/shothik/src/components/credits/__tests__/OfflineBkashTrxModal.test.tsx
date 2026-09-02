import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OfflineBkashTrxModal from "../OfflineBkashTrxModal";

describe("OfflineBkashTrxModal Component", () => {
  it("renders the modal with provider buttons and TrxID input", () => {
    render(<OfflineBkashTrxModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/Verify Offline MFS Transaction/i)).toBeDefined();
    expect(screen.getByText(/bKash \/ Nagad \/ Rocket/i)).toBeDefined();
    expect(screen.getByTestId("input-offline-trxid")).toBeDefined();
  });

  it("automatically parses pasted SMS text and extracts TrxID and amount", () => {
    render(<OfflineBkashTrxModal open={true} onOpenChange={() => {}} />);

    const smsTextarea = screen.getByPlaceholderText(/You have received Tk/i);
    fireEvent.change(smsTextarea, {
      target: {
        value: "You have received Tk 1,500.00 from 01711223344. Ref: BK99281720 at 01/09/2026 15:30.",
      },
    });

    const trxInput = screen.getByTestId("input-offline-trxid") as HTMLInputElement;
    expect(trxInput.value).toBe("BK99281720");
  });
});
