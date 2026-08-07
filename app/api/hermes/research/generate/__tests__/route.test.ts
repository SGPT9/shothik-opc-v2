import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn().mockResolvedValue({ _id: "usr_research_test_123" }),
}));

vi.mock("@/lib/hermes/modules/research-orchestrator", () => ({
  getHermesResearchOrchestrator: vi.fn(() => ({
    generateResearch: vi.fn().mockResolvedValue({
      runId: "run_research_test_789",
      artifactId: "art_research_test_789",
    }),
  })),
}));

describe("POST /api/hermes/research/generate", () => {
  it("initiates a deep research run for authenticated users", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/research/generate", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: "ws_research_test",
        topic: "Generative AI Agents in Healthcare",
        depth: "deep",
        sources: ["openalex", "web"],
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.runId).toBe("run_research_test_789");
    expect(data.data.artifactId).toBe("art_research_test_789");
  });
});
