// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ChatHeader } from "@/components/agents/components/ChatHeader";

describe("High-Tech UI/UX Decluttering & Minimalist Standard", () => {
  it("renders decluttered ChatHeader without static text badge noise", () => {
    render(
      <ChatHeader
        currentPersona="general"
        executionMode="realtime"
        activeTab={null}
        onTabChange={() => {}}
        onToggleSidebar={() => {}}
        sidebarOpen={false}
        onVoiceOrbClick={() => {}}
        onSwarmDebateClick={() => {}}
        onPaywallClick={() => {}}
      />
    );

    // Verify key action controls remain present
    expect(screen.getByText("550")).toBeDefined();

    // Verify Swarm and Voice controls are decluttered from header (migrated to Composer/Orb)
    expect(screen.queryByText("Voice Orb")).toBeNull();
    expect(screen.queryByText("Swarm Debate")).toBeNull();

    // Verify static text badges are decluttered
    expect(screen.queryByText("Instant Speed")).toBeNull();
    expect(screen.queryByText("7-Day Autonomy")).toBeNull();
  });
});
