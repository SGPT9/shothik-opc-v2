import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceCommerceModal } from "../VoiceCommerceModal";

describe("VoiceCommerceModal Component (VoiceCommerceModal.tsx)", () => {
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
      <VoiceCommerceModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders header, statutory badges, and KPI summary cards when open", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Vernacular Voice Commerce & WebRTC Banglish Agent/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Sub-150ms Banglish Speech-to-Intent & 1-Click bKash/i)).toBeInTheDocument();
    expect(screen.getByText(/Spoken Voice Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Spoken Voice Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Speech-to-Intent Latency/i)).toBeInTheDocument();
  });

  it("switches to Live WebRTC Voice Simulator tab and renders audio preset controls", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/WebRTC Audio Input Stream/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Bangla \/ Dhaka Banglish/i)).toBeInTheDocument();
    expect(screen.getByText(/Sylheti Dialect/i)).toBeInTheDocument();
    expect(screen.getByText(/Chittagonian \(Chittagong\) Dialect/i)).toBeInTheDocument();
  });

  it("switches to Voice Order Feed tab and renders order items", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    const feedTab = screen.getByRole("button", {
      name: /Voice Order Feed & Consignments/i,
    });
    fireEvent.click(feedTab);

    expect(screen.getByText(/Tamim Iqbal/i)).toBeInTheDocument();
    expect(screen.getByText(/Shafiqul Islam/i)).toBeInTheDocument();
    expect(screen.getByText(/Nusrat Jahan/i)).toBeInTheDocument();
  });

  it("switches to Dialect Adaptation Matrix tab and renders phonetic substitution rules", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    const matrixTab = screen.getByRole("button", {
      name: /Dialect Adaptation Matrix/i,
    });
    fireEvent.click(matrixTab);

    expect(screen.getByText(/Vernacular Acoustic & Phonetic Substitution Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Sylheti Node \(সিলেটি\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chittagonian Node \(চাটগাঁইয়া\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Noakhali Node \(নোয়াখালী\)/i)).toBeInTheDocument();
  });

  it("switches to 1-Click MFS SMS Dispatcher tab and renders SMS preview", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    const smsTab = screen.getByRole("button", {
      name: /1-Click MFS SMS Dispatcher/i,
    });
    fireEvent.click(smsTab);

    expect(screen.getByText(/Instant Dynamic 1-Click Payment Link SMS/i)).toBeInTheDocument();
    expect(screen.getByText(/SMS Preview \(Bangla \/ English Hybrid\):/i)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<VoiceCommerceModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
