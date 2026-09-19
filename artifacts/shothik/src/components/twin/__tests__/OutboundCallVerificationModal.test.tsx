import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  OutboundCallVerificationModal,
  DEMO_CALL_QUEUE,
} from "../OutboundCallVerificationModal";

describe("OutboundCallVerificationModal Component", () => {
  it("renders header, compliance badges, and shortcut when open", () => {
    render(<OutboundCallVerificationModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Autonomous AI Outbound Calling & COD Verification")
    ).toBeInTheDocument();
    expect(screen.getByText("Slice 29")).toBeInTheDocument();
    expect(screen.getByText("BTRC Certified")).toBeInTheDocument();
    expect(screen.getByText("⌘O")).toBeInTheDocument();
  });

  it("renders regional dialect switchers and allows selection", () => {
    render(
      <OutboundCallVerificationModal
        open={true}
        onOpenChange={() => {}}
        defaultDialect="standard"
      />
    );

    const standardBtn = screen.getByRole("button", { name: /^Standard$/i });
    const dhakaiyaBtn = screen.getByRole("button", { name: /ঢাকা \(Dhakaiya\)/i });
    const sylhetiBtn = screen.getByRole("button", { name: /সিলেট \(Sylheti\)/i });
    const chatgayaBtn = screen.getByRole("button", { name: /চাটগাঁ \(Chatgaya\)/i });

    expect(standardBtn).toBeInTheDocument();
    expect(dhakaiyaBtn).toBeInTheDocument();
    expect(sylhetiBtn).toBeInTheDocument();
    expect(chatgayaBtn).toBeInTheDocument();

    fireEvent.click(dhakaiyaBtn);
    expect(dhakaiyaBtn).toHaveClass("bg-emerald-600");

    fireEvent.click(sylhetiBtn);
    expect(sylhetiBtn).toHaveClass("bg-emerald-600");
  });

  it("switches across the 3 navigation tabs properly", () => {
    render(<OutboundCallVerificationModal open={true} onOpenChange={() => {}} />);

    const liveStudioTab = screen.getByRole("button", { name: /Live Outbound Call Studio/i });
    const queueTab = screen.getByRole("button", { name: /COD Call Verification Queue/i });
    const btrcTab = screen.getByRole("button", { name: /BTRC & Fraud Defense Rules/i });

    expect(liveStudioTab).toBeInTheDocument();
    expect(queueTab).toBeInTheDocument();
    expect(btrcTab).toBeInTheDocument();

    // Default tab is live dialer
    expect(screen.getByText("Live Conversational Telephony Transcript")).toBeInTheDocument();

    // Switch to COD Call Queue
    fireEvent.click(queueTab);
    expect(screen.getByText("Pending COD Orders Verification Queue")).toBeInTheDocument();
    expect(screen.getByText("Md. Tanvir Hasan")).toBeInTheDocument();
    expect(screen.getByText("Syed Farhan Ahmed")).toBeInTheDocument();
    expect(screen.getByText("Nusrat Jahan")).toBeInTheDocument();

    // Switch to BTRC Rules Tab
    fireEvent.click(btrcTab);
    expect(screen.getByText("BTRC Statutory Calling Compliance Standard")).toBeInTheDocument();
    expect(screen.getByText("Daily: 09:00 - 20:00 BST (UTC+6)")).toBeInTheDocument();
  });

  it("renders live dialer audio visualizer and allows customer turn simulation", () => {
    render(<OutboundCallVerificationModal open={true} onOpenChange={() => {}} />);

    const speakBtn = screen.getByRole("button", { name: /Speak Turn/i });
    expect(speakBtn).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Simulate customer voice turn/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "হাঁ, সিলেট জিন্দাবাজারে পাঠাইয়া দেন।" } });
    fireEvent.click(speakBtn);

    expect(screen.getByText("হাঁ, সিলেট জিন্দাবাজারে পাঠাইয়া দেন।")).toBeInTheDocument();
  });

  it("highlights supervised human confirmation gate for high-value orders in the queue", () => {
    render(<OutboundCallVerificationModal open={true} onOpenChange={() => {}} />);

    const queueTab = screen.getByRole("button", { name: /COD Call Verification Queue/i });
    fireEvent.click(queueTab);

    expect(screen.getByText("Supervised Gate (> ৳10k)")).toBeInTheDocument();
    expect(screen.getByText("৳11,400")).toBeInTheDocument();
  });
});
