import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-realtime-workspace", () => ({
  useRealtimeWorkspace: vi.fn(() => ({
    connectionState: "connected",
    lastEvent: null,
  })),
}));

import { SwarmVisualizer } from "../swarm-visualizer";

describe("SwarmVisualizer UI Component", () => {
  it("renders 4 swarm agent node cards and active status badge", () => {
    render(
      <SwarmVisualizer
        workspaceId="ws_vis_test"
        swarmId="swm_vis_test"
        runId="run_vis_test"
        initialActiveRole="researcher"
      />
    );

    expect(screen.getByText("Hermes Swarm Topology")).toBeInTheDocument();
    expect(screen.getByText("Deep Research Agent")).toBeInTheDocument();
    expect(screen.getByText("Synthesis Writer Agent")).toBeInTheDocument();
    expect(screen.getByText("Code Execution Agent")).toBeInTheDocument();
    expect(screen.getByText("QA & Verification Agent")).toBeInTheDocument();
    expect(screen.getByText("Active Role")).toBeInTheDocument();
  });

  it("triggers handoff callback when clicking on an idle agent card", () => {
    const onHandoff = vi.fn();

    render(
      <SwarmVisualizer
        workspaceId="ws_vis_test"
        swarmId="swm_vis_test"
        runId="run_vis_test"
        initialActiveRole="researcher"
        onHandoffTriggered={onHandoff}
      />
    );

    const writerCard = screen.getByText("Synthesis Writer Agent");
    fireEvent.click(writerCard);

    expect(onHandoff).toHaveBeenCalledWith("researcher", "writer");
  });
});
