import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiDialectVoiceTwinModal } from "../MultiDialectVoiceTwinModal";

describe("MultiDialectVoiceTwinModal Component (MultiDialectVoiceTwinModal.tsx)", () => {
  it("renders modal header, Kokoro/Bangla VITS badge, and canvas audio visualizer", () => {
    render(<MultiDialectVoiceTwinModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Autonomous Multi-Dialect Voice Studio")).toBeInTheDocument();
    expect(screen.getByText("Kokoro & Bangla VITS")).toBeInTheDocument();
    expect(screen.getByTestId("voice-canvas-visualizer")).toBeInTheDocument();
    expect(screen.getByText(/24kHz PCM16 • Sub-40ms TTFB/)).toBeInTheDocument();
    expect(screen.getByText("Zero-Retention Voice Privacy")).toBeInTheDocument();
  });

  it("renders all 4 regional dialect profiles and allows switching between them", () => {
    render(<MultiDialectVoiceTwinModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId("profile-card-dhakaiya_panna")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card-chatgaya_nawab")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card-sylheti_surma")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card-standard_ananya")).toBeInTheDocument();

    // Switch to Chatgaya Nawab
    const chatgayaCard = screen.getByTestId("profile-card-chatgaya_nawab");
    fireEvent.click(chatgayaCard);

    // Initial greeting for Chatgaya should be appended
    expect(screen.getByText(/গম আছেন নি ভাই/)).toBeInTheDocument();
  });

  it("toggles microphone listening state and handles quick prompt turn", () => {
    render(<MultiDialectVoiceTwinModal open={true} onOpenChange={() => {}} />);

    const micButton = screen.getByTestId("voice-mic-toggle");
    expect(screen.getByText("Tap to Speak")).toBeInTheDocument();

    // Toggle mic
    fireEvent.click(micButton);
    expect(screen.getByText("Stop Listening")).toBeInTheDocument();

    // Click quick prompt
    const quickPrompt = screen.getByText("💸 বিকাশ সেলস ও প্রফিট");
    fireEvent.click(quickPrompt);

    expect(screen.getByText("আজকের বিকাশ সেলস এবং নেট প্রফিট কত হয়েছে জানাও")).toBeInTheDocument();
  });
});
