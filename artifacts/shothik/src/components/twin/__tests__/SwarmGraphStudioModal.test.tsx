import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwarmGraphStudioModal } from "../SwarmGraphStudioModal";

describe("SwarmGraphStudioModal Component (SwarmGraphStudioModal.tsx)", () => {
  it("renders modal header, v2.4 Topological Waves badge, and telemetry bar", () => {
    render(<SwarmGraphStudioModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("Autonomous Multi-Agent Task Swarm DAG Studio")).toBeInTheDocument();
    expect(screen.getByText("v2.4 Topological Waves")).toBeInTheDocument();
    expect(screen.getByText(/Total Waves:/)).toBeInTheDocument();
    expect(screen.getByText(/Parallel Speedup:/)).toBeInTheDocument();
    expect(screen.getByText(/Run Swarm Graph/)).toBeInTheDocument();
  });

  it("renders template pills and switches active graph when selected", () => {
    render(<SwarmGraphStudioModal isOpen={true} onClose={() => {}} />);

    // Check template pills
    const nilkhetBtn = screen.getByText("Nilkhet POD Direct Publishing & Imposition DAG");
    expect(nilkhetBtn).toBeInTheDocument();

    // Click Nilkhet POD template
    fireEvent.click(nilkhetBtn);

    // Node from Nilkhet template should now be present
    expect(screen.getAllByText(/Extract Docling Clean Markdowns/).length).toBeGreaterThan(0);
  });

  it("renders node inspector when a task node is clicked", () => {
    render(<SwarmGraphStudioModal isOpen={true} onClose={() => {}} />);

    // Click first node in Eid template
    const nodeCards = screen.getAllByText("Draft Eid Promotional Ad Copy & Discounts");
    expect(nodeCards.length).toBeGreaterThan(0);
    fireEvent.click(nodeCards[0]);

    // Node inspector should show twin and action details
    expect(screen.getByText("Node Inspector")).toBeInTheDocument();
    expect(screen.getByText("marketing_twin")).toBeInTheDocument();
    expect(screen.getByText("generate_eid_promotions")).toBeInTheDocument();
  });

  it("handles reset graph and cancel swarm button interactions", () => {
    render(<SwarmGraphStudioModal isOpen={true} onClose={() => {}} />);

    const resetBtn = screen.getByText("Reset Graph");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    const runBtn = screen.getByText("Run Swarm Graph");
    expect(runBtn).toBeInTheDocument();
  });
});
