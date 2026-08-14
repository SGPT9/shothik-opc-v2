import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TelegramVoiceBriefingModal } from "../TelegramVoiceBriefingModal";

describe("Telegram & WhatsApp Voice Briefing Autopilot (TelegramVoiceBriefingModal.tsx)", () => {
  it("renders voice briefing modal, preview text, and handles language toggles", () => {
    render(<TelegramVoiceBriefingModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Telegram & WhatsApp Voice Briefing Autopilot/i)).toBeInTheDocument();
    expect(screen.getByText(/User 4 \/ Non-Technical Operator/i)).toBeInTheDocument();
    expect(screen.getByText(/Shuvo Shokal! Gotokal apnar total bKash sales/i)).toBeInTheDocument();

    const banglaBtn = screen.getByText("Bangla");
    fireEvent.click(banglaBtn);

    expect(screen.getByText(/শুভ সকাল! গতকাল আপনার মোট bKash সেলস/i)).toBeInTheDocument();
  });

  it("dispatches test briefing when clicking button", () => {
    render(<TelegramVoiceBriefingModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const sendBtn = screen.getByTestId("button-send-test-briefing");
    fireEvent.click(sendBtn);

    expect(screen.getByText(/Voice & Text Briefing dispatched to Telegram/i)).toBeInTheDocument();
  });
});
