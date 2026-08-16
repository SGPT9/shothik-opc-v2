// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwarmAdversarialDebateModal } from "../SwarmAdversarialDebateModal";

describe("SwarmAdversarialDebateModal UI Component", () => {
  it("renders Autonomous Multi-Agent Swarm Deliberation header and agent perspectives", () => {
    render(<SwarmAdversarialDebateModal isOpen={true} onClose={vi.fn()} initialTopic="Test Topic" />);

    expect(screen.getByText(/Autonomous Multi-Agent Swarm Deliberation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bull Growth Lead/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bear Risk Auditor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tech Architect/i).length).toBeGreaterThan(0);
  });

  it("switches tabs to round-by-round timeline and execution action checklist", () => {
    render(<SwarmAdversarialDebateModal isOpen={true} onClose={vi.fn()} initialTopic="Test Topic" />);

    const timelineTab = screen.getByText(/Round-by-Round Graph Timeline/i);
    fireEvent.click(timelineTab);
    expect(screen.getByText(/Round 1: Opening Positions & Opportunity Sizing/i)).toBeInTheDocument();

    const checklistTab = screen.getByText(/Execution Action Checklist/i);
    fireEvent.click(checklistTab);
    expect(screen.getByText(/Mandatory Execution Action Checklist/i)).toBeInTheDocument();
  });

  it("triggers onOpenSource when an inline citation is clicked inside an argument", () => {
    const handleOpenSource = vi.fn();
    render(
      <SwarmAdversarialDebateModal
        isOpen={true}
        onClose={vi.fn()}
        initialTopic="Test Topic"
        onOpenSource={handleOpenSource}
      />
    );

    const citationBtn = screen.getAllByTitle(/Inspect Grounded Source:/i)[0];
    expect(citationBtn).toBeInTheDocument();
    fireEvent.click(citationBtn);
    expect(handleOpenSource).toHaveBeenCalled();
  });
});
