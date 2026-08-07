import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeerFlowVisualizer } from "../deerflow-visualizer";
import type { DeerFlowExecutionPlan } from "@/lib/hermes/modules/deerflow-engine";

const mockPlan: DeerFlowExecutionPlan = {
  workflowId: "df_wf_test_123",
  workspaceId: "ws_df_test",
  status: "completed",
  overallLatencyMs: 340,
  ragContext: [
    {
      chunkId: "chunk_1",
      content: "ODS metric report context",
      source: "semantic_ods",
      similarityScore: 0.9,
      operationalMetadata: { workspaceId: "ws_df_test" },
    },
  ],
  nodes: [
    {
      id: "node_1_reasoning",
      taskType: "reasoning",
      prompt: "Deconstruct system goal",
      status: "completed",
      output: "DeepSeek R1 reasoning output step 1",
      latencyMs: 140,
    },
    {
      id: "node_2_synthesis",
      taskType: "synthesis",
      prompt: "Synthesize report insights",
      status: "completed",
      output: "Report synthesis output step 2",
      latencyMs: 200,
    },
  ],
};

describe("DeerFlowVisualizer UI Component", () => {
  it("renders DeerFlow DAG workflow header, status badges, and RAG context bar", () => {
    render(<DeerFlowVisualizer workspaceId="ws_df_test" plan={mockPlan} />);

    expect(screen.getByTestId("deerflow-visualizer")).toBeDefined();
    expect(screen.getByText("DeerFlow DAG Workflow")).toBeDefined();
    expect(screen.getByText("completed")).toBeDefined();
    expect(screen.getByText("ws_df_test")).toBeDefined();
    expect(screen.getByText(/ODS Context Injected/i)).toBeDefined();
  });

  it("renders all DAG execution nodes and allows expanding node details", () => {
    const handleExecuteNode = vi.fn();
    render(
      <DeerFlowVisualizer
        workspaceId="ws_df_test"
        plan={mockPlan}
        onExecuteNode={handleExecuteNode}
      />
    );

    expect(screen.getByTestId("deerflow-node-node_1_reasoning")).toBeDefined();
    expect(screen.getByTestId("deerflow-node-node_2_synthesis")).toBeDefined();

    // Verify expanded prompt & output for node 1
    expect(screen.getByText("Deconstruct system goal")).toBeDefined();
    expect(screen.getByText("DeepSeek R1 reasoning output step 1")).toBeDefined();

    // Click Re-execute Node button
    const reexecuteBtn = screen.getByText("Re-execute Node");
    fireEvent.click(reexecuteBtn);
    expect(handleExecuteNode).toHaveBeenCalledWith("node_1_reasoning");
  });
});
