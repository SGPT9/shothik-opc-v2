import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StartupValidationFunnelModal } from "../StartupValidationFunnelModal";
import { SwarmAdversarialDebateModal } from "../SwarmAdversarialDebateModal";

describe("Autonomous Chat Modals Accessibility & Interaction Suite", () => {
  describe("StartupValidationFunnelModal", () => {
    it("renders dialog with title, inputs, and execute button", () => {
      render(
        <StartupValidationFunnelModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "startup-validation-modal-title");

      expect(screen.getByText(/3-Step Startup Validation Funnel Engine/i)).toBeInTheDocument();
      expect(screen.getByText("Startup Idea / Product Vision")).toBeInTheDocument();
      expect(screen.getByText("Target Geographic Market")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Execute Full 3-Step Validation Funnel/i })).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <StartupValidationFunnelModal
          isOpen={false}
          onClose={() => {}}
        />
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("executes validation and displays tabs and step content", () => {
      render(
        <StartupValidationFunnelModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      const runButton = screen.getByRole("button", { name: /Execute Full 3-Step Validation Funnel/i });
      fireEvent.click(runButton);

      // Verify tabs appear
      expect(screen.getByText(/Cofounder Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Web Search Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/ScenarioLab Mode/i)).toBeInTheDocument();

      // Step 1 content is active by default
      expect(screen.getByText(/Cofounder Analysis & Market Sizing/i)).toBeInTheDocument();

      // Switch to Step 2
      fireEvent.click(screen.getByText(/Web Search Mode/i));
      expect(screen.getByText(/Live Web Search Competitor/i)).toBeInTheDocument();

      // Switch to Step 3
      fireEvent.click(screen.getByText(/ScenarioLab Mode/i));
      expect(screen.getByText(/ScenarioLab Stress-Test Report/i)).toBeInTheDocument();
    });

    it("handles close button click and Escape key dismissal", () => {
      const handleClose = vi.fn();
      render(
        <StartupValidationFunnelModal
          isOpen={true}
          onClose={handleClose}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /close startup validation funnel modal/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("SwarmAdversarialDebateModal", () => {
    it("renders dialog with title, topic bar, and consensus perspectives", () => {
      render(
        <SwarmAdversarialDebateModal
          isOpen={true}
          onClose={() => {}}
          initialTopic="F-Commerce Logistics in Chittagong"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "swarm-debate-title");

      expect(screen.getByText(/Autonomous Multi-Agent Swarm Deliberation/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("F-Commerce Logistics in Chittagong")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Run Deliberation Graph/i })).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <SwarmAdversarialDebateModal
          isOpen={false}
          onClose={() => {}}
        />
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("switches tabs between perspectives, timeline, and checklist", () => {
      render(
        <SwarmAdversarialDebateModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      // Timeline tab
      const timelineTab = screen.getByRole("button", { name: /Round-by-Round Graph Timeline/i });
      fireEvent.click(timelineTab);
      expect(screen.getByText(/Round 1: Opening Positions/i)).toBeInTheDocument();

      // Checklist tab
      const checklistTab = screen.getByRole("button", { name: /Execution Action Checklist/i });
      fireEvent.click(checklistTab);
      expect(screen.getByText(/Mandatory Execution Action Checklist/i)).toBeInTheDocument();

      // Perspectives tab
      const perspectivesTab = screen.getByRole("button", { name: /Agent Perspectives/i });
      fireEvent.click(perspectivesTab);
      expect(screen.getByText(/Agent 1 — Bull Growth Lead/i)).toBeInTheDocument();
    });

    it("handles close button click and Escape key dismissal", () => {
      const handleClose = vi.fn();
      render(
        <SwarmAdversarialDebateModal
          isOpen={true}
          onClose={handleClose}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /close swarm deliberation modal/i });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });
});
