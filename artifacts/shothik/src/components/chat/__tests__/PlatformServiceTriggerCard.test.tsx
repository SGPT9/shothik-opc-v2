import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PlatformServiceTriggerCard } from "../PlatformServiceTriggerCard";
import type { TwinTriggerContext } from "@/components/agents/hooks/useTwinHandoffDetector";

describe("PlatformServiceTriggerCard Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Developer Twin service card for DEVELOPER_TWIN trigger", () => {
    const context: TwinTriggerContext = {
      eligible: true,
      triggerType: "DEVELOPER_TWIN",
      serviceId: 11,
      pillarName: "AI Agent Services & Autonomous Developer",
      triad: "twin",
      title: "Dispatch Autonomous Developer Twin",
      description: "Run self-healing Red-Green-Refactor loop in isolated sandboxes.",
      actionText: "Open Developer Twin",
      targetUrl: "/twin?tab=developer",
      badgeText: "Developer Twin · AST Engine",
      hasStartupIntent: false,
    };

    render(
      <PlatformServiceTriggerCard
        conversationId="conv_dev_1"
        triggerContext={context}
      />
    );

    expect(screen.getByText(/PILLAR 11 · AI AGENT SERVICES/i)).toBeInTheDocument();
    expect(screen.getByText("Dispatch Autonomous Developer Twin")).toBeInTheDocument();
    expect(screen.getByText("Open Developer Twin")).toBeInTheDocument();
  });

  it("renders FinTech & MFS card for FINTECH_MFS trigger", () => {
    const context: TwinTriggerContext = {
      eligible: true,
      triggerType: "FINTECH_MFS",
      serviceId: 12,
      pillarName: "Payments & Monetization",
      triad: "twin",
      title: "Automate bKash & Nagad MFS Settlements",
      description: "Reconcile payment transactions directly on MFS rails.",
      actionText: "Open MFS Gateway",
      targetUrl: "/twin?tab=mfs",
      badgeText: "FinTech & MFS Rails",
      hasStartupIntent: false,
    };

    render(
      <PlatformServiceTriggerCard
        conversationId="conv_mfs_1"
        triggerContext={context}
      />
    );

    expect(screen.getByText(/PILLAR 12 · PAYMENTS & MONETIZATION/i)).toBeInTheDocument();
    expect(screen.getByText("Automate bKash & Nagad MFS Settlements")).toBeInTheDocument();
  });

  it("invokes onOpenPlatformServices when clicked", () => {
    const onOpenPlatformServices = vi.fn();
    const context: TwinTriggerContext = {
      eligible: true,
      triggerType: "DEVELOPER_TWIN",
      serviceId: 11,
      pillarName: "AI Agent Services",
      triad: "twin",
      title: "Dispatch Autonomous Developer Twin",
      description: "Run self-healing loop.",
      actionText: "Open Developer Twin",
      targetUrl: "/twin?tab=developer",
      badgeText: "Developer Twin",
      hasStartupIntent: false,
    };

    render(
      <PlatformServiceTriggerCard
        conversationId="conv_dev_2"
        triggerContext={context}
        onOpenPlatformServices={onOpenPlatformServices}
      />
    );

    const directoryBtn = screen.getByRole("button", { name: /All 12 Services/i });
    fireEvent.click(directoryBtn);
    expect(onOpenPlatformServices).toHaveBeenCalledTimes(1);
  });

  it("dismisses card when Keep chatting is clicked", () => {
    const context: TwinTriggerContext = {
      eligible: true,
      triggerType: "DEVELOPER_TWIN",
      serviceId: 11,
      pillarName: "AI Agent Services",
      triad: "twin",
      title: "Dispatch Autonomous Developer Twin",
      description: "Run self-healing loop.",
      actionText: "Open Developer Twin",
      targetUrl: "/twin?tab=developer",
      badgeText: "Developer Twin",
      hasStartupIntent: false,
    };

    const { rerender } = render(
      <PlatformServiceTriggerCard
        conversationId="conv_dev_3"
        triggerContext={context}
      />
    );

    const dismissBtn = screen.getByRole("button", { name: /Keep chatting/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId("platform-service-trigger-card")).not.toBeInTheDocument();
  });
});
