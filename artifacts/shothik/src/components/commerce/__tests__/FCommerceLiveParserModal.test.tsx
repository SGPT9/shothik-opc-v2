/**
 * FCommerceLiveParserModal Component Test Suite
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FCommerceLiveParserModal } from "../FCommerceLiveParserModal";

describe("FCommerceLiveParserModal Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          orders: [
            {
              id: "ORD_9901",
              customerName: "ফারিয়া ইসলাম",
              phone: "01911223344",
              address: "মিরপুর ১০, ঢাকা",
              product: "সিল্ক থ্রি-পিস (লাল)",
              quantity: 1,
              priceBdt: 2450,
              bkashCheckoutUrl: "https://shothik.ai/pay/bKash/bk_9901",
              steadfastTrackingCode: "BD_ST_9901",
              status: "PARSED",
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders modal header and stream input", async () => {
    render(<FCommerceLiveParserModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/F-Commerce Live Connector/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Paste Facebook Live Video URL.../i)).toBeDefined();
  });

  it("triggers live connector and renders parsed orders", async () => {
    render(<FCommerceLiveParserModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/সুলতানা পারভীন/i)).toBeDefined();
    expect(screen.getByText(/তানভীর আহমেদ/i)).toBeDefined();
  });
});
