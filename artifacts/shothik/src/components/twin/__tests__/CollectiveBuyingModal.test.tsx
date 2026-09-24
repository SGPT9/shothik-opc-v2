import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollectiveBuyingModal } from "../CollectiveBuyingModal";

describe("CollectiveBuyingModal Component (CollectiveBuyingModal.tsx)", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CollectiveBuyingModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, badges, and KPI summary metrics when open", () => {
    render(<CollectiveBuyingModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Micro-Merchant Collective Buying & Freight Pooling Hub/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/1688 \/ Yiwu LCL Pooling/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Buying Pools/i)).toBeInTheDocument();
    expect(screen.getByText(/Merchants Joined/i)).toBeInTheDocument();
  });

  it("switches to Start New Collective Pool tab and renders pool creation form", () => {
    render(<CollectiveBuyingModal isOpen={true} onClose={mockOnClose} />);

    const createTab = screen.getByRole("button", {
      name: /Start New Collective Pool/i,
    });
    fireEvent.click(createTab);

    expect(screen.getByText(/Collective Buying Pool Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Name & Specification/i)).toBeInTheDocument();
    expect(screen.getByText(/Target MOQ \(Units\)/i)).toBeInTheDocument();
  });

  it("switches to CBM Freight & Landed Cost Allocator tab and computes pooling savings", () => {
    render(<CollectiveBuyingModal isOpen={true} onClose={mockOnClose} />);

    const calcTab = screen.getByRole("button", {
      name: /CBM Freight & Landed Cost Allocator/i,
    });
    fireEvent.click(calcTab);

    expect(
      screen.getByText(/Volumetric CBM & Landed Cost Allocator/i)
    ).toBeInTheDocument();

    const calcBtn = screen.getByRole("button", {
      name: /Calculate Pooled Landed Cost/i,
    });
    fireEvent.click(calcBtn);

    expect(screen.getByText(/Wholesale Pooling Advantage:/i)).toBeInTheDocument();
    expect(screen.getByText(/CHEAPER/i)).toBeInTheDocument();
  });

  it("switches to Central Hub Parcel Splitter tab and renders merchant dispatch list", () => {
    render(<CollectiveBuyingModal isOpen={true} onClose={mockOnClose} />);

    const splitTab = screen.getByRole("button", {
      name: /Central Hub Parcel Splitter/i,
    });
    fireEvent.click(splitTab);

    expect(
      screen.getByText(/Domestic Hub Unboxing & Courier Dispatch/i)
    ).toBeInTheDocument();
  });
});
