// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TwinCtaCard } from "../TwinCtaCard";

describe("TwinCtaCard — Contextual Next-Step Bridge", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders commerce logistics context with action button", () => {
    render(
      <TwinCtaCard
        conversationId="conv_commerce_1"
        triggerContext={{
          eligible: true,
          triggerType: "COMMERCE_LOGISTICS",
          title: "Automate Parcel Tracking & Customer Replies",
          description: "Connect Steadfast / Pathao Courier APIs to answer queries.",
          actionText: "Connect Courier Twin",
          targetUrl: "/twin/new?track=connect&channel=courier",
          badgeText: "F-Commerce Automation",
        }}
      />
    );

    expect(screen.getByText("F-Commerce Automation")).toBeInTheDocument();
    expect(screen.getByText("Automate Parcel Tracking & Customer Replies")).toBeInTheDocument();
    expect(screen.getByText("Connect Courier Twin")).toBeInTheDocument();
  });

  it("renders academic publishing context with BoiMela action", () => {
    render(
      <TwinCtaCard
        conversationId="conv_academic_1"
        triggerContext={{
          eligible: true,
          triggerType: "ACADEMIC_PUBLISHING",
          title: "Turn Manuscript into a Print-Ready Book",
          description: "View 3D BoiMela flip preview and calculate Nilkhet costs.",
          actionText: "Open 3D Book Preview",
          targetUrl: "/books/active-draft",
          badgeText: "BoiMela Publishing",
        }}
      />
    );

    expect(screen.getByText("BoiMela Publishing")).toBeInTheDocument();
    expect(screen.getByText("Open 3D Book Preview")).toBeInTheDocument();
  });

  it("dismisses the card and persists dismissal in localStorage", () => {
    const { container } = render(
      <TwinCtaCard
        conversationId="conv_dismiss_test"
        triggerContext={{
          eligible: true,
          triggerType: "VENTURE_OPPORTUNITY",
          title: "Generate Pitch Deck",
          description: "Turn opportunity into investor deck.",
          actionText: "Build Pitch Deck",
          targetUrl: "/twin/new?track=build",
          badgeText: "Venture Operating Layer",
        }}
      />
    );

    const dismissBtn = screen.getByText("Keep chatting");
    fireEvent.click(dismissBtn);

    expect(localStorage.getItem("twin_cta_dismissed_conv_dismiss_test")).toBe("true");
    expect(container.firstChild).toBeNull();
  });
});
