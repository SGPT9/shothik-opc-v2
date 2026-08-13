// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Transcript } from "@/components/chat/Transcript";

afterEach(() => {
  cleanup();
});
import { LowRamStylexOptimizerService } from "@/lib/infrastructure/low-ram-stylex-optimizer";
import { BuzzWhisperSpeechService } from "@/lib/infrastructure/buzz-whisper-service";
import { SalesNegotiationCourierService } from "@/lib/infrastructure/sales-negotiation-courier";
import type { ChatMessage } from "@/lib/chat/types";

// Mock LowRamStylexOptimizerService to simulate low-spec vs high-spec devices
vi.mock("@/lib/infrastructure/low-ram-stylex-optimizer", async () => {
  const actual = await vi.importActual<any>("@/lib/infrastructure/low-ram-stylex-optimizer");
  return {
    ...actual,
    LowRamStylexOptimizerService: {
      detectDeviceCapabilities: vi.fn(),
    },
  };
});

const generateTestMessages = (count: number): ChatMessage[] => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `msg_${i}`,
    role: i % 2 === 0 ? "user" : "assistant",
    content: `Test message ${i}`,
    status: "completed",
    createdAt: new Date().toISOString(),
  }));
};

describe("Demography-Aware System Tickets Suite", () => {
  
  describe("Ticket #1: Low-RAM Android Device Optimization & Virtualized Listing", () => {
    it("renders full transcript on high-spec devices without load-more button", () => {
      vi.mocked(LowRamStylexOptimizerService.detectDeviceCapabilities).mockReturnValue({
        deviceMemoryGb: 8,
        connectionType: "wifi",
        isLowEndDevice: false,
        virtualizationBatchSize: 50,
        stylexCompileTimeActive: true,
      });

      const messages = generateTestMessages(20);
      render(
        <Transcript
          messages={messages}
          isStreaming={false}
          onCopy={() => {}}
        />
      );

      // Verify all 20 messages are visible
      expect(screen.queryByText(/Load older messages/i)).toBeNull();
      expect(screen.getByText("Test message 0")).toBeInTheDocument();
      expect(screen.getByText("Test message 19")).toBeInTheDocument();
    });

    it("slices transcript and renders load-more button on low-spec devices", () => {
      vi.mocked(LowRamStylexOptimizerService.detectDeviceCapabilities).mockReturnValue({
        deviceMemoryGb: 2,
        connectionType: "3g",
        isLowEndDevice: true,
        virtualizationBatchSize: 10,
        stylexCompileTimeActive: true,
      });

      const messages = generateTestMessages(15);
      render(
        <Transcript
          messages={messages}
          isStreaming={false}
          onCopy={() => {}}
        />
      );

      // Verify load older messages button is visible showing 5 hidden messages
      expect(screen.getByText(/Load older messages \(5 hidden\)/i)).toBeInTheDocument();
      
      // Last messages should be visible, first messages should be hidden
      expect(screen.getByText("Test message 14")).toBeInTheDocument();
      expect(screen.queryByText("Test message 0")).toBeNull();

      // Click to load more
      fireEvent.click(screen.getByRole("button", { name: /Load older messages/i }));

      // Now older messages should be loaded and visible
      expect(screen.getByText("Test message 0")).toBeInTheDocument();
    });
  });

  describe("Ticket #2 & #4: 1-Tap Payments & Courier Trigger", () => {
    it("renders custom MFS Payment card when paymentInfo is in metadata", () => {
      const messages: ChatMessage[] = [
        {
          _id: "payment_msg",
          role: "assistant",
          content: "অর্ডারটি প্রসেস করতে বিকাশ এ পে করুন।",
          status: "completed",
          metadata: {
            paymentInfo: {
              provider: "bkash",
              amount: 550,
              orderId: "ORD9988",
              merchantPhone: "01700000000",
            },
          },
          createdAt: new Date().toISOString(),
        },
      ];

      render(
        <Transcript
          messages={messages}
          isStreaming={false}
        />
      );

      // Verify bKash 1-Tap card details
      expect(screen.getByText("bKash 1-Tap Payment")).toBeInTheDocument();
      expect(screen.getByText(/৳550 BDT/i)).toBeInTheDocument();
      expect(screen.getByText(/#ORD9988/i)).toBeInTheDocument();
      
      // Verify app deep-link button and fallback web link exist
      const appBtn = screen.getByRole("link", { name: /Open in bKash App/i });
      expect(appBtn).toHaveAttribute("href", "bkash://pay?merchant=01700000000&amount=550&ref=ORD9988");

      const webBtn = screen.getByRole("link", { name: /Web Checkout/i });
      expect(webBtn).toHaveAttribute("href", "https://pay.bkash.com.bd/checkout?ref=ORD9988&amount=550");
    });

    it("verifies renderBkashDeepLinkCard helper correctly formats payment details", () => {
      const details = SalesNegotiationCourierService.renderBkashDeepLinkCard({
        merchantPhone: "01700000000",
        amount: 1200,
        orderId: "ORD5544",
        provider: "nagad",
      });

      expect(details.provider).toBe("NAGAD");
      expect(details.deepLinkUrl).toBe("nagad://pay?merchant=01700000000&amount=1200&ref=ORD5544");
      expect(details.checkoutUrl).toBe("https://pay.nagad.com.bd/checkout?ref=ORD5544&amount=1200");
    });
  });

  describe("Ticket #3: Banglish Lexicon Voice Tuning", () => {
    it("returns correct dynamic VAD thresholds for quiet office vs noisy street environments", () => {
      // Quiet office (-60dB)
      const officeParams = BuzzWhisperSpeechService.tuneSpeechActivityThreshold(-60);
      expect(officeParams.energyThreshold).toBe(0.08);
      expect(officeParams.adaptiveGain).toBe(1.0);

      // Noisy street in Dhaka (-40dB)
      const streetParams = BuzzWhisperSpeechService.tuneSpeechActivityThreshold(-40);
      expect(streetParams.energyThreshold).toBe(0.25);
      expect(streetParams.adaptiveGain).toBe(1.5);
    });
  });
});
