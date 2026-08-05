import { describe, it, expect, vi } from "vitest";

vi.mock("../../../infra/db", () => ({
  getHermesDatabase: vi.fn(() => ({
    createRun: vi.fn().mockResolvedValue({ id: "run_mock_123" }),
    updateRun: vi.fn().mockResolvedValue({ status: "completed" }),
    updateRunStatus: vi.fn().mockResolvedValue({ status: "completed" }),
  })),
}));

vi.mock("../../artifact-manager", () => ({
  getHermesArtifactManager: vi.fn(() => ({
    createArtifact: vi.fn().mockResolvedValue({ id: "art_mock_123" }),
  })),
}));

import { getHermesResearchOrchestrator } from "../index";

describe("HermesResearchOrchestrator Module", () => {
  it("should execute a deep web research run and create a versioned research artifact", async () => {
    const research = getHermesResearchOrchestrator();

    const result = await research.generateResearch({
      workspaceId: "ws_res_test_1",
      userId: "usr_res_test_1",
      query: "Next.js 16 Server Components and Performance Optimizations",
      depth: "standard",
    });

    expect(result.runId).toBeDefined();
    expect(result.runId.startsWith("run_")).toBe(true);
    expect(result.artifactId).toBeDefined();
    expect(result.artifactId.startsWith("art_")).toBe(true);
  });
});
