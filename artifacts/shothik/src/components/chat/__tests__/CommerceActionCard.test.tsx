import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommerceActionCard } from "../CommerceActionCard";

describe("CommerceActionCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders payment details and order information", () => {
    render(
      <CommerceActionCard
        payment={{
          trxId: "9X2A881K0Q",
          amount: 3400,
          provider: "bkash",
          senderPhone: "01711-223344",
          status: "verified",
        }}
        order={{
          invoiceNumber: "INV-9921",
          recipientName: "Rahim Chowdhury",
          recipientPhone: "01711-223344",
          recipientAddress: "House 12, Road 4, Dhanmondi, Dhaka",
          codAmount: 3400,
          deliveryCharge: 60,
        }}
      />
    );

    expect(screen.getByText("৳3,400")).toBeInTheDocument();
    expect(screen.getByText("9X2A881K0Q")).toBeInTheDocument();
    expect(screen.getByText("Rahim Chowdhury")).toBeInTheDocument();
    expect(screen.getByText("House 12, Road 4, Dhanmondi, Dhaka")).toBeInTheDocument();
    expect(screen.getByText("1-Click Dispatch to Steadfast")).toBeInTheDocument();
  });

  it("executes 1-click booking and displays consignment code on success", async () => {
    const onDispatchSuccess = vi.fn();

    // Mock fetch to API gateway
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        consignment: {
          consignment_id: 882194,
          tracking_code: "ST-882194",
        },
      }),
    } as any);

    render(
      <CommerceActionCard
        order={{
          invoiceNumber: "INV-9921",
          recipientName: "Rahim Chowdhury",
          recipientPhone: "01711-223344",
          recipientAddress: "House 12, Road 4, Dhanmondi, Dhaka",
          codAmount: 3400,
        }}
        onDispatchSuccess={onDispatchSuccess}
      />
    );

    const dispatchBtn = screen.getByRole("button", { name: /1-Click Dispatch to Steadfast/i });
    fireEvent.click(dispatchBtn);

    await waitFor(() => {
      expect(screen.getByText("Booked on Steadfast!")).toBeInTheDocument();
      expect(screen.getByText("ST-882194")).toBeInTheDocument();
    });

    expect(onDispatchSuccess).toHaveBeenCalledWith("882194", "ST-882194");
  });
});
