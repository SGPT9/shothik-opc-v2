import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { DeerFlowEngine } from "@/lib/hermes/modules/deerflow-engine";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/hermes/modules/deerflow-engine", () => ({
  DeerFlowEngine: {
    executeWorkflow: vi.fn(),
  },
}));

describe("POST /api/hermes/deerflow", () => {
  it("rejects unauthenticated requests with status 401", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/hermes/deerflow", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_df_test",
        goal: "Analyze query performance",
        prompt: "Run optimization diagnostic",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  it("executes DeerFlow DAG workflow for authenticated user with status 200", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_df_123",
      id: "user_df_123",
      email: "deerflow@shothik.ai",
      name: "DeerFlow User",
      role: "user",
    });

    vi.mocked(DeerFlowEngine.executeWorkflow).mockResolvedValueOnce({
      workflowId: "df_wf_123456",
      workspaceId: "ws_df_test",
      status: "completed",
      nodes: [
        {
          id: "node_1_reasoning",
          taskType: "reasoning",
          prompt: "Test prompt",
          status: "completed",
          output: "Reasoned output",
        },
      ],
      overallLatencyMs: 250,
    });

    const req = new NextRequest("http://localhost:3000/api/hermes/deerflow", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_df_test",
        goal: "Analyze query performance",
        prompt: "Run optimization diagnostic",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.data.workflowId).toBe("df_wf_123456");
    expect(data.data.status).toBe("completed");
  });

  it("handles execution errors with status 500", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_df_123",
      id: "user_df_123",
      email: "deerflow@shothik.ai",
      name: "DeerFlow User",
      role: "user",
    });

    vi.mocked(DeerFlowEngine.executeWorkflow).mockRejectedValueOnce(
      new Error("DeepSeek model rate limit exceeded")
    );

    const req = new NextRequest("http://localhost:3000/api/hermes/deerflow", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_df_test",
        goal: "Analyze query performance",
        prompt: "Run optimization diagnostic",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.code).toBe("DEERFLOW_EXECUTION_ERROR");
  });
});
