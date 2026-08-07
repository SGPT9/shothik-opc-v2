import { beforeEach, describe, expect, it } from "vitest";
import { HermesSwarmOrchestrator } from "../index";

describe("HermesSwarmOrchestrator Module", () => {
  beforeEach(() => {
    HermesSwarmOrchestrator.clearStore();
  });

  it("creates a 4-agent swarm topology with initial active role", async () => {
    const swarm = await HermesSwarmOrchestrator.createSwarm({
      workspaceId: "ws_swarm_test",
      runId: "run_swarm_123",
      initialRole: "researcher",
    });

    expect(swarm.swarmId).toContain("swm_");
    expect(swarm.workspaceId).toBe("ws_swarm_test");
    expect(swarm.agents.length).toBe(4);
    expect(swarm.status).toBe("active");

    const researcher = swarm.agents.find((a) => a.role === "researcher");
    expect(researcher?.status).toBe("busy");
    expect(swarm.activeAgentId).toBe(researcher?.id);
  });

  it("triggers an agent handoff between Researcher and Writer", async () => {
    const swarm = await HermesSwarmOrchestrator.createSwarm({
      workspaceId: "ws_swarm_test",
      runId: "run_swarm_456",
      initialRole: "researcher",
    });

    const updated = await HermesSwarmOrchestrator.triggerHandoff({
      swarmId: swarm.swarmId,
      workspaceId: "ws_swarm_test",
      runId: "run_swarm_456",
      fromRole: "researcher",
      toRole: "writer",
      taskPayload: { researchSummary: "Synthesized 15 papers on LLM RAG." },
      userId: "usr_swarm_test",
    });

    const researcher = updated.agents.find((a) => a.role === "researcher");
    const writer = updated.agents.find((a) => a.role === "writer");

    expect(researcher?.status).toBe("completed");
    expect(writer?.status).toBe("busy");
    expect(updated.activeAgentId).toBe(writer?.id);
  });

  it("fetches swarm by ID and returns null for unknown swarms", () => {
    expect(HermesSwarmOrchestrator.getSwarm("nonexistent_swarm")).toBeNull();
  });
});
