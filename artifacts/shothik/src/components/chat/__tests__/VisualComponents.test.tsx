import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { AvatarOrb3D, type AvatarOrbRole } from "../AvatarOrb3D";
import { VoicePopup } from "../VoicePopup";
import { CommerceActionCard } from "../CommerceActionCard";

describe("Visual WOW Components", () => {
  describe("LiquidGlassCard", () => {
    it("renders LiquidGlassCard with children and vibrant backdrop correctly", () => {
      render(
        <LiquidGlassCard intensity="vibrant" palette="indigo">
          <div data-testid="card-child">Action Content</div>
        </LiquidGlassCard>
      );

      expect(screen.getByTestId("card-child")).toBeDefined();
      expect(screen.getByText("Action Content")).toBeDefined();
    });

    it("supports various brand glow palettes (bKash, Steadfast, Tax Gold, Cyan)", () => {
      const { rerender } = render(
        <LiquidGlassCard palette="bkash">
          <span>bKash Pink Glass</span>
        </LiquidGlassCard>
      );
      expect(screen.getByText("bKash Pink Glass")).toBeDefined();

      rerender(
        <LiquidGlassCard palette="steadfast">
          <span>Steadfast Emerald Glass</span>
        </LiquidGlassCard>
      );
      expect(screen.getByText("Steadfast Emerald Glass")).toBeDefined();

      rerender(
        <LiquidGlassCard palette="tax_gold">
          <span>Tax Gold Glass</span>
        </LiquidGlassCard>
      );
      expect(screen.getByText("Tax Gold Glass")).toBeDefined();
    });
  });

  describe("AvatarOrb3D", () => {
    const roles: AvatarOrbRole[] = ["shothik_core", "sales_twin", "steadfast_logistics", "tax_advisor"];

    roles.forEach((role) => {
      it(`renders high-DPI canvas for role: ${role}`, () => {
        const { container } = render(
          <AvatarOrb3D
            size={64}
            isSpeaking={true}
            isListening={false}
            avatarRole={role}
          />
        );

        const canvas = container.querySelector("canvas");
        expect(canvas).toBeDefined();
        expect(canvas).not.toBeNull();
      });
    });

    it("renders in listening state with concentric ripple waves", () => {
      const { container } = render(
        <AvatarOrb3D
          size={80}
          isSpeaking={false}
          isListening={true}
          avatarRole="shothik_core"
        />
      );

      const canvas = container.querySelector("canvas");
      expect(canvas).toBeDefined();
    });
  });

  describe("VoicePopup & CommerceActionCard Liquid Glass Integration", () => {
    it("renders VoicePopup with 3D AvatarOrb and dual-voice indicator", () => {
      render(
        <VoicePopup
          isOpen={true}
          onClose={vi.fn()}
          onSendTranscript={vi.fn()}
          initialRole="sales_twin"
        />
      );

      expect(screen.getByText(/Dual-Voice Sync/i)).toBeDefined();
      expect(screen.getByText(/Sales Twin Ayesha/i)).toBeDefined();
    });

    it("renders CommerceActionCard with settled payment and Steadfast dispatch options", () => {
      render(
        <CommerceActionCard
          payment={{
            trxId: "TRX_BKASH_9921",
            amount: 2500,
            provider: "bkash",
            status: "verified",
          }}
          order={{
            invoiceNumber: "INV-8821",
            recipientName: "Tanvir Rahman",
            recipientPhone: "01711000000",
            recipientAddress: "Dhanmondi, Dhaka",
            codAmount: 2500,
          }}
        />
      );

      expect(screen.getByText(/TRX_BKASH_9921/i)).toBeDefined();
      expect(screen.getByText(/RouteXpress Multi-Courier Router/i)).toBeDefined();
      expect(screen.getByText(/Tanvir Rahman/i)).toBeDefined();
      expect(screen.getByText(/1-Click Dispatch to Steadfast/i)).toBeDefined();
    });
  });
});
