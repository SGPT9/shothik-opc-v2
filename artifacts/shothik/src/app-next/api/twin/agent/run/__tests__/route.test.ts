import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/tonight-engine/tonight-graph-runtime", () => ({
  TonightGraphRuntime: {
    executeGraph: vi.fn().mockResolvedValue({
      runId: "run_test_mock_123",
      activeNode: "deploy_node",
      topology: { nodes: [], edges: [] },
      plan: ["step1", "step2"],
      finalReport: "Execution report",
      leadsCount: 12,
      postsCount: 3,
    }),
  },
}));

vi.mock("@/lib/insforge/auth-rls-service", () => ({
  InsForgeAuthRlsService: {
    verifyWorkspaceRlsPolicy: vi.fn().mockResolvedValue({ allowed: true }),
  },
}));

import { POST } from "../route";
import { NextRequest } from "next/server";

describe("Tonight Engine Agent Execution API Route (POST /api/twin/agent/run)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 Bad Request when prompt is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/agent/run", {
      method: "POST",
      body: JSON.stringify({
        companyId: "comp_verifiq",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Missing required 'prompt'");
  });

  it("successfully executes an autonomous agent task, deducts credits, and returns graph state", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/agent/run", {
      method: "POST",
      body: JSON.stringify({
        companyId: "ws_polsia_101",
        userId: "usr_tanvir_99",
        taskId: "task_test_99",
        agentKey: "code_generator",
        prompt: "Build and deploy bKash MFS payment checkout webhook handler on Dokploy",
        depth: "quick",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.runId).toContain("run_");
    expect(data.agentKey).toBe("code_generator");
    expect(data.creditsDeducted).toBe(5);
    expect(data.state).toBeDefined();
    expect(data.state.activeNode).toBeDefined();
  });
});
