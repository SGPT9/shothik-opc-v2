import { describe, expect, it, vi } from "vitest";
import { DeerFlowEngine } from "../index";
import { VpsFallbackEngine } from "@/lib/infrastructure/vps-fallback-engine";
import { SemanticOdsEngine } from "@/lib/hermes/modules/semantic-ods";

vi.mock("@/lib/infrastructure/vps-fallback-engine", () => ({
  VpsFallbackEngine: {
    executeWithZeroFailure: vi.fn(),
  },
}));

vi.mock("@/lib/hermes/modules/semantic-ods", () => ({
  SemanticOdsEngine: {
    queryHybridOds: vi.fn(),
  },
}));

describe("DeerFlowEngine", () => {
  it("executes multi-agent DAG workflow powered by DeepSeek R1 reasoning and Semantic RAG + ODS", async () => {
    vi.mocked(SemanticOdsEngine.queryHybridOds).mockResolvedValueOnce([
      {
        chunkId: "ods_chunk_1",
        content: "ODS Operational metric",
        source: "ods",
        similarityScore: 0.88,
        operationalMetadata: { workspaceId: "ws_df_test" },
      },
    ]);

    vi.mocked(VpsFallbackEngine.executeWithZeroFailure).mockResolvedValue({
      content: "Step-by-step reasoning plan generated cleanly",
      tierUsed: "tier_1_cloud",
      modelUsed: "deepseek/deepseek-r1",
      latencyMs: 120,
    });

    const result = await DeerFlowEngine.executeWorkflow(
      "ws_df_test",
      "Optimize database queries",
      "Analyze query execution plan"
    );

    expect(result.status).toBe("completed");
    expect(result.workflowId).toContain("df_wf_");
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].status).toBe("completed");
    expect(result.nodes[0].output).toBe("Step-by-step reasoning plan generated cleanly");
  });

  it("handles node execution failure gracefully", async () => {
    vi.mocked(SemanticOdsEngine.queryHybridOds).mockResolvedValueOnce([]);
    vi.mocked(VpsFallbackEngine.executeWithZeroFailure).mockRejectedValueOnce(
      new Error("Reasoning node timeout")
    );

    const result = await DeerFlowEngine.executeWorkflow(
      "ws_df_test",
      "Failing workflow goal",
      "Test prompt"
    );

    expect(result.status).toBe("failed");
    expect(result.nodes[0].status).toBe("failed");
    expect(result.nodes[0].output).toContain("Reasoning node timeout");
  });
});
