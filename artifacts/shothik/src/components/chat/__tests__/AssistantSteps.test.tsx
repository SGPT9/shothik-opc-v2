import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssistantSteps, type AgentStep } from "../AssistantSteps";

describe("AssistantSteps Component", () => {
  const mockSteps: AgentStep[] = [
    {
      id: "step-1",
      type: "rag",
      label: "4-Way Fused Hybrid RAG Retrieval",
      detail: "Retrieved 12 parent-child chunks from InsForge Postgres",
      status: "done",
      durationMs: 140,
    },
    {
      id: "step-2",
      type: "verify",
      label: "Contradiction Evaluation",
      detail: "Detected superseding circular dated Jan 2024",
      status: "done",
      durationMs: 45,
    },
    {
      id: "step-3",
      type: "mcp",
      label: "Wigolo Web Intelligence Fetch",
      detail: "https://fintech.gov.bd/circulars/2024-05",
      status: "running",
    },
  ];

  it("renders collapsed header with actions count and running status", () => {
    render(<AssistantSteps steps={mockSteps} collapsed={true} />);

    expect(screen.getByText(/Running agent steps/i)).toBeInTheDocument();
    expect(screen.getByText("3 actions")).toBeInTheDocument();
    // In collapsed state, details should not be visible
    expect(screen.queryByText("4-Way Fused Hybrid RAG Retrieval")).not.toBeInTheDocument();
  });

  it("expands to show step details, durations, and icons when toggled", () => {
    render(<AssistantSteps steps={mockSteps} collapsed={true} />);

    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    expect(screen.getByText("4-Way Fused Hybrid RAG Retrieval")).toBeInTheDocument();
    expect(screen.getByText("Retrieved 12 parent-child chunks from InsForge Postgres")).toBeInTheDocument();
    expect(screen.getByText("140ms")).toBeInTheDocument();
    expect(screen.getByText("Contradiction Evaluation")).toBeInTheDocument();
    expect(screen.getByText("Wigolo Web Intelligence Fetch")).toBeInTheDocument();
  });

  it("returns null if steps array is empty", () => {
    const { container } = render(<AssistantSteps steps={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
