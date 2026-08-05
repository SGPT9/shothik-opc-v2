import { describe, it, expect, vi, beforeEach } from "vitest";
import { TonightGraphRuntime } from "../tonight-graph-runtime";
import { TonightMemoryService } from "../tonight-memory-rag";
import { OutboundMarketingService } from "../outbound-marketing";

vi.mock("../llm-overnight-client", () => ({
  streamOvernightLLM: vi.fn().mockImplementation(async function* (prompt: string) {
    if (prompt.includes("planner")) {
      yield JSON.stringify([
        { title: "Research Leads", persona: "researcher" },
        { title: "Write Drafts", persona: "content-creator" },
      ]);
    } else {
      yield "Mocked swarm output for test run.\nContact: test@startup.io\n[Twitter]\nLaunching our platform!";
    }
  }),
  resolveOvernightModel: vi.fn().mockResolvedValue({
    model: { id: "test-model", label: "Test Model" },
  }),
}));

vi.mock("@/lib/hermes/modules/streaming-engine", () => ({
  getHermesStreamingEngine: vi.fn().mockReturnValue({
    emitRunEvent: vi.fn().mockResolvedValue(true),
    emitProgressToken: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/lib/hermes", () => ({
  getHermesOrchestrator: vi.fn().mockReturnValue({
    artifactManager: {
      createArtifact: vi.fn().mockResolvedValue({
        id: "art_test_123",
        title: "Overnight Report: Test",
      }),
    },
  }),
}));

vi.mock("../tonight-memory-rag", () => ({
  TonightMemoryService: {
    indexRunMemory: vi.fn().mockResolvedValue({ success: true, memoryId: "mem_123" }),
    searchRunMemory: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../outbound-marketing", () => ({
  OutboundMarketingService: {
    extractAndRegisterCampaigns: vi.fn().mockResolvedValue({
      leadsCount: 1,
      postsCount: 1,
      leadsPath: "/tmp/leads.json",
      postsPath: "/tmp/posts.json",
    }),
  },
}));

describe("TonightGraphRuntime Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute full state graph transition flow cleanly", async () => {
    const result = await TonightGraphRuntime.executeGraph({
      runId: "run_graph_test_1",
      workspaceId: "ws_graph_test_1",
      userId: "user_test_1",
      prompt: "Find B2B sales leads and draft social announcements",
      depth: "standard",
    });

    expect(result.runId).toBe("run_graph_test_1");
    expect(result.topology).toBe("coordinator");
    expect(result.swarmOutputs.length).toBeGreaterThan(0);
    expect(result.leadsCount).toBe(1);
    expect(result.postsCount).toBe(1);
    expect(result.artifactId).toBe("art_test_123");
    expect(TonightMemoryService.indexRunMemory).toHaveBeenCalled();
    expect(OutboundMarketingService.extractAndRegisterCampaigns).toHaveBeenCalled();
  });

  it("should select hierarchical topology for deep analysis requests", async () => {
    const result = await TonightGraphRuntime.executeGraph({
      runId: "run_graph_test_2",
      workspaceId: "ws_graph_test_2",
      userId: "user_test_2",
      prompt: "Perform deep research on AI market trends",
      depth: "deep",
    });

    expect(result.topology).toBe("hierarchical");
    expect(result.plan.length).toBeGreaterThanOrEqual(3);
  });
});
