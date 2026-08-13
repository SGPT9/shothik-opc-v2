// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { SwarmAdversarialDebateModal } from "../SwarmAdversarialDebateModal";

describe("SwarmAdversarialDebateModal UI Component", () => {
  it("renders Agent Swarm Adversarial Debate Engine header and 3-agent perspectives", () => {
    render(<SwarmAdversarialDebateModal isOpen={true} onClose={vi.fn()} initialTopic="Test Topic" />);

    expect(screen.getByText(/Agent Swarm Adversarial Debate Engine/i)).toBeDefined();
    expect(screen.getAllByText(/Bull Growth Lead/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bear Risk Auditor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Consensus Chair/i).length).toBeGreaterThan(0);
  });
});
