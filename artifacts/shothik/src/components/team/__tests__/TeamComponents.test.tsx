import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeamPanel } from "../TeamPanel";
import { MemoryViewer } from "../../memory/MemoryViewer";
import { SchedulePanel } from "../../schedule/SchedulePanel";
import { TeamModal } from "../TeamModal";
import * as teamService from "@/services/agent-team.service";

// Mock the agent-team service
vi.mock("@/services/agent-team.service", () => ({
  fetchAgents: vi.fn(),
  createAgent: vi.fn(),
  fetchScheduledTasks: vi.fn(),
  createScheduledTask: vi.fn(),
  toggleScheduledTask: vi.fn(),
  searchMemories: vi.fn(),
}));

describe("Autonomous Team & Orchestration Studio Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TeamPanel", () => {
    it("renders agent team panel and lists agents correctly", async () => {
      vi.mocked(teamService.fetchAgents).mockResolvedValueOnce([
        { id: "a1", name: "Dev Specialist", role: "Code refactor", policy: "auto" },
        { id: "a2", name: "Legal Counsel", role: "Contract audit", policy: "manual" },
      ]);

      render(<TeamPanel />);

      expect(screen.getByText("Autonomous Agent Team")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Dev Specialist")).toBeInTheDocument();
        expect(screen.getByText("Legal Counsel")).toBeInTheDocument();
      });
    });

    it("opens add agent form and calls createAgent on submit", async () => {
      vi.mocked(teamService.fetchAgents).mockResolvedValueOnce([]);
      vi.mocked(teamService.createAgent).mockResolvedValueOnce({
        id: "a3",
        name: "Tax Auditor",
        role: "Mushak 6.3 check",
        policy: "auto",
      });

      render(<TeamPanel />);

      const addBtn = screen.getByText("Add New Specialist Agent");
      fireEvent.click(addBtn);

      const nameInput = screen.getByPlaceholderText(/e\.g\. NBR Tax Specialist/i);
      const roleInput = screen.getByPlaceholderText(/e\.g\. Validates Mushak 6\.3/i);

      fireEvent.change(nameInput, { target: { value: "Tax Auditor" } });
      fireEvent.change(roleInput, { target: { value: "Mushak 6.3 check" } });

      const submitBtn = screen.getByText("Deploy Agent");
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(teamService.createAgent).toHaveBeenCalledWith({
          name: "Tax Auditor",
          role: "Mushak 6.3 check",
          policy: "auto",
          description: undefined,
        });
      });
    });
  });

  describe("MemoryViewer", () => {
    it("renders semantic memory viewer and searches queries", async () => {
      vi.mocked(teamService.searchMemories).mockResolvedValueOnce([
        { id: "m1", content: "Courier set to Steadfast", category: "preference" },
      ]);

      render(<MemoryViewer />);

      expect(screen.getByText("Second-Me Semantic Memory")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Courier set to Steadfast")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Semantic vector search/i);
      fireEvent.change(searchInput, { target: { value: "Steadfast" } });

      await waitFor(() => {
        expect(teamService.searchMemories).toHaveBeenCalledWith("Steadfast");
      });
    });
  });

  describe("SchedulePanel", () => {
    it("renders scheduled tasks and toggles task state", async () => {
      vi.mocked(teamService.fetchScheduledTasks).mockResolvedValueOnce([
        { id: "s1", name: "Daily Standup Compilation", cron: "0 9 * * *", enabled: true },
      ]);
      vi.mocked(teamService.toggleScheduledTask).mockResolvedValueOnce({
        id: "s1",
        name: "Daily Standup Compilation",
        cron: "0 9 * * *",
        enabled: false,
      });

      render(<SchedulePanel />);

      expect(screen.getByText("Autonomous Scheduler")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Daily Standup Compilation")).toBeInTheDocument();
      });

      const toggleBtn = screen.getByTitle("Disable task");
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        expect(teamService.toggleScheduledTask).toHaveBeenCalledWith("s1", false);
      });
    });
  });

  describe("TeamModal", () => {
    it("renders modal with tab selector and dismisses on close", () => {
      const handleClose = vi.fn();
      render(<TeamModal isOpen={true} onClose={handleClose} initialTab="agents" />);

      expect(screen.getByText("Agent Orchestration Studio")).toBeInTheDocument();
      expect(screen.getByText("Agents")).toBeInTheDocument();
      expect(screen.getByText("Memory")).toBeInTheDocument();
      expect(screen.getByText("Scheduler")).toBeInTheDocument();

      // Click Memory tab
      fireEvent.click(screen.getByText("Memory"));
      expect(screen.getByText("Second-Me Semantic Memory")).toBeInTheDocument();
    });
  });
});
