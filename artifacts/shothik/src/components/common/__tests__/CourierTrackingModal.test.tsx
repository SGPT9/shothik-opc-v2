/**
 * CourierTrackingModal Component Test Suite
 */

import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CourierTrackingModal } from "../CourierTrackingModal";

describe("CourierTrackingModal Component", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        parcel: {
          trackingCode: "BD_ST_755448",
          provider: "Steadfast Courier",
          recipientName: "মুহাম্মদ সাকিব",
          city: "Dhaka (Dhanmondi Hub)",
          codAmountBdt: 1450,
          status: "IN_TRANSIT",
          statusBangla: "যাত্রাপথে আছে (ধানমন্ডি ডেলিভারি হাব)",
          timeline: [
            { status: "BOOKED", time: "আজ সকাল ১০:১৫", note: "নীলক্ষেত প্রেস থেকে পার্সেল বুকিং সম্পন্ন" },
          ],
        },
      }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders modal header and tracking input", async () => {
    await act(async () => {
      render(<CourierTrackingModal isOpen={true} onClose={() => {}} initialTrackingCode="BD_ST_755448" />);
    });

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(screen.getByText(/Steadfast & Pathao Courier Live Tracking/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Consignment or Tracking ID/i)).toBeInTheDocument();
  });

  it("fetches tracking details and displays timeline and formatted COD currency", async () => {
    await act(async () => {
      render(<CourierTrackingModal isOpen={true} onClose={() => {}} initialTrackingCode="BD_ST_755448" />);
    });

    expect(screen.getByLabelText("Enter Consignment or Tracking ID")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/BD_ST_755448/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Steadfast Courier/i)).toBeInTheDocument();
      expect(screen.getByText(/COD: ৳ 1,450/i)).toBeInTheDocument();
    });
  });

  it("handles close button click and Escape key dismissal", async () => {
    const handleClose = vi.fn();
    await act(async () => {
      render(<CourierTrackingModal isOpen={true} onClose={handleClose} initialTrackingCode="BD_ST_755448" />);
    });

    const closeBtn = screen.getByRole("button", { name: /close tracking modal/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
