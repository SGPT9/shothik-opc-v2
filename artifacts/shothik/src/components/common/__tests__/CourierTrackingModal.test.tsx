/**
 * CourierTrackingModal Component Test Suite
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
    render(<CourierTrackingModal isOpen={true} onClose={() => {}} initialTrackingCode="BD_ST_755448" />);

    expect(screen.getByText(/Steadfast & Pathao Courier Live Tracking/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter Consignment or Tracking ID/i)).toBeDefined();
  });

  it("fetches tracking details and displays timeline", async () => {
    render(<CourierTrackingModal isOpen={true} onClose={() => {}} initialTrackingCode="BD_ST_755448" />);

    await waitFor(() => {
      expect(screen.getAllByText(/BD_ST_755448/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Steadfast Courier/i)).toBeDefined();
    });
  });
});
