import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WhatsAppCommerceModal, DEMO_CATALOG } from "../WhatsAppCommerceModal";

describe("WhatsAppCommerceModal Component", () => {
  it("renders header, badges, and verified business banner when open", () => {
    render(<WhatsAppCommerceModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("WhatsApp Business Multi-Dialect Commerce Bot")).toBeInTheDocument();
    expect(screen.getByText("Phase 26")).toBeInTheDocument();
    expect(screen.getByText("⌘W")).toBeInTheDocument();
    expect(screen.getByText("Shothik Merchant")).toBeInTheDocument();
    expect(screen.getByText(/Online • Dialect:/i)).toBeInTheDocument();
  });

  it("renders 4 regional dialect switchers and allows toggling", () => {
    render(<WhatsAppCommerceModal open={true} onOpenChange={() => {}} defaultDialect="dhakaiya" />);

    const dhakaiyaBtn = screen.getByRole("button", { name: /ঢাকা \(Dhakaiya\)/i });
    const sylhetiBtn = screen.getByRole("button", { name: /সিলেট \(Sylheti\)/i });
    const chatgayaBtn = screen.getByRole("button", { name: /চাটগাঁ \(Chatgaya\)/i });
    const standardBtn = screen.getByRole("button", { name: /^Standard$/i });

    expect(dhakaiyaBtn).toBeInTheDocument();
    expect(sylhetiBtn).toBeInTheDocument();
    expect(chatgayaBtn).toBeInTheDocument();
    expect(standardBtn).toBeInTheDocument();

    // Toggle to Sylheti
    fireEvent.click(sylhetiBtn);
    expect(screen.getByText(/Online • Dialect: SYLHETI/i)).toBeInTheDocument();

    // Toggle to Chatgaya
    fireEvent.click(chatgayaBtn);
    expect(screen.getByText(/Online • Dialect: CHATGAYA/i)).toBeInTheDocument();
  });

  it("renders merchant products in the quick-adder panel", () => {
    render(<WhatsAppCommerceModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Direct Product Quick-Add")).toBeInTheDocument();
    expect(DEMO_CATALOG.length).toBeGreaterThanOrEqual(5);

    expect(screen.getAllByText("Dhakai Jamdani Saree").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Royal Platinum Panjabi")).toBeInTheDocument();
    expect(screen.getByText("Sundarban Raw Honey")).toBeInTheDocument();
    expect(screen.getByText("Nilkhet Thesis Monograph")).toBeInTheDocument();
  });

  it("renders active WhatsApp cart and Steadfast delivery rules", () => {
    render(<WhatsAppCommerceModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Active WhatsApp Cart")).toBeInTheDocument();
    expect(screen.getByText("Steadfast Logistics Automated Rules")).toBeInTheDocument();
    expect(screen.getByText(/Inside Dhaka:/i)).toBeInTheDocument();
    expect(screen.getByText(/Outside Dhaka:/i)).toBeInTheDocument();
  });

  it("renders quick prompt buttons for rapid simulated interaction", () => {
    render(<WhatsAppCommerceModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByRole("button", { name: "দাম কত?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ডেলিভারি চার্জ?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "বিকাশ করব?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "TrxID 9K28A77123" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "পার্সেল ট্র্যাকিং?" })).toBeInTheDocument();
  });
});
