import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LiveSellingStudioModal } from "../LiveSellingStudioModal";

describe("LiveSellingStudioModal Component (LiveSellingStudioModal.tsx)", () => {
  it("renders header, live status badge, and viewer stats when open", () => {
    render(<LiveSellingStudioModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Social Commerce Live-Selling Studio")).toBeInTheDocument();
    expect(screen.getByText("LIVE NOW")).toBeInTheDocument();
    expect(screen.getByText("Viewers:")).toBeInTheDocument();
    expect(screen.getByText("Live GMV:")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <LiveSellingStudioModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs", () => {
    render(<LiveSellingStudioModal isOpen={true} onClose={() => {}} />);

    const commentsTab = screen.getByRole("button", { name: /Comment-to-Order Parser/i });
    const locksTab = screen.getByRole("button", { name: /15-Min Stock Locks/i });
    const ordersTab = screen.getByRole("button", { name: /Draft Orders & bKash Dispatch/i });
    const shortsTab = screen.getByRole("button", { name: /9:16 Shorts Generator/i });

    expect(commentsTab).toBeInTheDocument();
    expect(locksTab).toBeInTheDocument();
    expect(ordersTab).toBeInTheDocument();
    expect(shortsTab).toBeInTheDocument();

    // Default tab is comments
    expect(screen.getByText("Simulate Real-Time Live Stream Comment Ingestion")).toBeInTheDocument();
    expect(screen.getByText("Tanvir Hossain")).toBeInTheDocument();

    // Switch to 15-Min Stock Locks
    fireEvent.click(locksTab);
    expect(screen.getByText("15-Minute Live Stock Reservation & Lock Ledger")).toBeInTheDocument();
    expect(screen.getByText("SKU-PANJABI-BLK")).toBeInTheDocument();

    // Switch to Draft Orders & bKash Dispatch
    fireEvent.click(ordersTab);
    expect(screen.getByText("Draft Orders & 1-Tap bKash Dispatch")).toBeInTheDocument();

    // Switch to 9:16 Shorts Generator
    fireEvent.click(shortsTab);
    expect(screen.getByText("Automated 9:16 TikTok & Facebook Reels Promo Generator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Render 9:16 Promo Short/i })).toBeInTheDocument();
  });

  it("triggers shorts promo render when clicking the button", () => {
    render(<LiveSellingStudioModal isOpen={true} onClose={() => {}} />);

    const shortsTab = screen.getByRole("button", { name: /9:16 Shorts Generator/i });
    fireEvent.click(shortsTab);

    const renderBtn = screen.getByRole("button", { name: /Render 9:16 Promo Short/i });
    expect(renderBtn).toBeInTheDocument();
    fireEvent.click(renderBtn);

    expect(screen.getByText("Rendering 9:16 Video...")).toBeInTheDocument();
  });
});
