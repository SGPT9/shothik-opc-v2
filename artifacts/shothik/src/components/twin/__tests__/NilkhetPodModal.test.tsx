import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NilkhetPodModal } from "../NilkhetPodModal";

describe("NilkhetPodModal Component (NilkhetPodModal.tsx)", () => {
  it("renders modal header, spine metrics, and interactive cover wrap preview", () => {
    render(<NilkhetPodModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId("nilkhet-pod-modal")).toBeInTheDocument();
    expect(screen.getByText("Nilkhet POD Direct API & Imposition Hub")).toBeInTheDocument();
    expect(screen.getByText("FOGRA39 CMYK Direct Rail")).toBeInTheDocument();

    // Check spine metrics
    expect(screen.getByText("Spine Width")).toBeInTheDocument();
    expect(screen.getByText("Full Cover Wrap")).toBeInTheDocument();
    expect(screen.getByText("300 DPI Canvas")).toBeInTheDocument();
    expect(screen.getByText("Interactive Cover Wrap Preview")).toBeInTheDocument();
  });

  it("switches to Signatures & Plates tab and displays press imposition details", () => {
    render(<NilkhetPodModal open={true} onOpenChange={() => {}} />);

    // Click Signatures & Plates tab
    const tabButton = screen.getByText("Signatures & Plates");
    fireEvent.click(tabButton);

    expect(screen.getByText("Padded Page Count")).toBeInTheDocument();
    expect(screen.getByText("16-Up Signatures")).toBeInTheDocument();
    expect(screen.getByText("Offset Plates")).toBeInTheDocument();
    expect(screen.getByText("Paper Reams Required")).toBeInTheDocument();
    expect(screen.getByText("Standard 16-Page Nested Signature Imposition Map (Signature #1)")).toBeInTheDocument();
    expect(screen.getByText("Sheet 1: Front (Outer Plate)")).toBeInTheDocument();
    expect(screen.getByText("Sheet 1: Back (Inner Plate)")).toBeInTheDocument();
  });

  it("switches to Press Dispatch tab and dispatches print order to Bakushah Market", async () => {
    const onOpenChange = vi.fn();

    // Mock fetch for dispatch-hub endpoint
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ticketId: "JDF_TEST_TICKET_999",
          orderId: "POD_TEST_ORDER_999",
          hub: {
            name: "Bakushah Market Digital & Offset Press Complex",
            standardTurnaroundDays: 2,
          },
          courierConsignment: {
            partner: "Steadfast Courier Ltd",
            trackingCode: "ST_MOCK_TRK_777",
          },
        },
      }),
    } as any);

    render(<NilkhetPodModal open={true} onOpenChange={onOpenChange} />);

    // Click Press Dispatch tab
    const dispatchTab = screen.getByText("Press Dispatch");
    fireEvent.click(dispatchTab);

    expect(screen.getByText("Select Verified Print Complex")).toBeInTheDocument();
    expect(screen.getByText("Bakushah Market Digital & Offset Press Complex")).toBeInTheDocument();
    expect(screen.getByText("Katabon Academic & Monograph Press Works")).toBeInTheDocument();
    expect(screen.getByText("Steadfast Courier Delivery Consignment")).toBeInTheDocument();

    // Click Dispatch button
    const dispatchBtn = screen.getByText("1-Tap Dispatch Order to Press Hub");
    fireEvent.click(dispatchBtn);

    // Assert success ticket view
    const ticketHeading = await screen.findByText("Print Order Dispatched to Press Complex");
    expect(ticketHeading).toBeInTheDocument();
    expect(screen.getByText("JDF_TEST_TICKET_999")).toBeInTheDocument();
    expect(screen.getByText("ST_MOCK_TRK_777")).toBeInTheDocument();
  });
});
