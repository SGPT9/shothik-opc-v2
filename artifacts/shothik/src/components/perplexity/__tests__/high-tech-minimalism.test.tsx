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
    expect(screen.getByText("Voice Orb")).toBeDefined();
    expect(screen.getByText("Swarm Debate")).toBeDefined();
    expect(screen.getByText("550 Credits")).toBeDefined();

    // Verify static text badges are decluttered
    expect(screen.queryByText("Instant Speed")).toBeNull();
    expect(screen.queryByText("7-Day Autonomy")).toBeNull();
  });
});
