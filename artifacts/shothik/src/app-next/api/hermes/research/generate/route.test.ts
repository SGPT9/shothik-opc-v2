import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn(),
}));

const { mockCreateRun, mockStartRun, mockGenerateResearch } = vi.hoisted(() => ({
  mockCreateRun: vi.fn(),
  mockStartRun: vi.fn(),
  mockGenerateResearch: vi.fn(),
}));

vi.mock("@/lib/hermes", () => ({
  getHermesOrchestrator: vi.fn(() => ({
    createRun: mockCreateRun,
    startRun: mockStartRun,
  })),
  getHermesResearchOrchestrator: vi.fn(() => ({
    generateResearch: mockGenerateResearch,
  })),
}));

vi.mock("@/lib/hermes/modules/research-orchestrator", () => ({
  getHermesResearchOrchestrator: vi.fn(() => ({
    generateResearch: mockGenerateResearch,
  })),
}));

import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { POST } from "./route";

const mockGetChatAuthenticatedUser = vi.mocked(getChatAuthenticatedUser);

describe("Hermes Research Generate API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    mockGetChatAuthenticatedUser.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/hermes/research/generate", {
        method: "POST",
        body: JSON.stringify({ workspaceId: "ws-1", topic: "Quantum Computing" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("creates and starts a research run for authenticated user", async () => {
    mockGetChatAuthenticatedUser.mockResolvedValue({ _id: "user-1" } as any);
    mockGenerateResearch.mockResolvedValue({ runId: "run-res-1", artifactId: "art-res-1" });

    const response = await POST(
      new NextRequest("http://localhost/api/hermes/research/generate", {
        method: "POST",
        body: JSON.stringify({ workspaceId: "ws-1", topic: "Quantum Computing", depth: "deep" }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.runId).toBe("run-res-1");
    expect(mockGenerateResearch).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: "ws-1", userId: "user-1", query: "Quantum Computing" })
    );
  });

  it("validates request body parameters", async () => {
    mockGetChatAuthenticatedUser.mockResolvedValue({ _id: "user-1" } as any);

    const response = await POST(
      new NextRequest("http://localhost/api/hermes/research/generate", {
        method: "POST",
        body: JSON.stringify({ workspaceId: "", topic: "" }),
      })
    );

    expect(response.status).toBe(400);
    expect(mockGenerateResearch).not.toHaveBeenCalled();
  });
});
