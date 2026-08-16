import { describe, expect, it, vi } from "vitest";
import { getHermesSlidesOrchestrator } from "./index";

vi.mock("@/services/slide-generation", () => ({
  createSlideJob: vi.fn().mockResolvedValue({ jobId: "job_legacy_123" }),
  getSlideJobStatus: vi.fn().mockResolvedValue({ status: "completed", progress: 100 }),
  pauseSlideJob: vi.fn().mockResolvedValue(true),
  resumeSlideJob: vi.fn().mockResolvedValue(true),
  subscribeToJobProgress: vi.fn().mockImplementation((jobId, cb) => {
    cb({ status: "completed", progress: 100, slides: [{ title: "Slide 1" }] });
    return vi.fn();
  }),
}));

vi.mock("@/lib/insforge/rag-memory", () => ({
  InsForgeTwinRagMemory: {
    searchWorkspaceContext: vi.fn().mockResolvedValue("Context chunk 1"),
  },
}));

vi.mock("@/lib/hermes/infra/db", () => {
  const mockRuns = new Map();
  const mockDb = {
    createRun: vi.fn().mockImplementation(async (run) => {
      const created = { ...run, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockRuns.set(run.id, created);
      return created;
    }),
    getRun: vi.fn().mockImplementation(async (id) => mockRuns.get(id) || null),
    updateRunStatus: vi.fn().mockImplementation(async (id, status, metadata) => {
      const existing = mockRuns.get(id) || { id };
      const updated = { ...existing, status, metadata: { ...existing.metadata, ...metadata } };
      mockRuns.set(id, updated);
      return updated;
    }),
    createArtifact: vi.fn().mockImplementation(async (artifact) => ({
      id: artifact.id || "art_slides_1",
      title: artifact.title || "Slide Deck",
      domain: "slides",
      content: artifact.content || {},
      metadata: artifact.metadata || {},
    })),
    getArtifact: vi.fn().mockResolvedValue({
      id: "art_slides_1",
      title: "Slide Deck",
      domain: "slides",
      content: {},
      metadata: {},
    }),
    updateArtifact: vi.fn().mockImplementation(async (id, content, metadata) => ({
      id,
      title: "Slide Deck",
      domain: "slides",
      content: content || {},
      metadata: metadata || {},
    })),
    recordEvent: vi.fn().mockResolvedValue(true),
  };
  return {
    HermesDatabase: vi.fn().mockImplementation(() => mockDb),
    getHermesDatabase: vi.fn().mockImplementation(() => mockDb),
    hermesDb: mockDb,
  };
});

describe("Hermes Slides Orchestrator Engine (P1-001)", () => {
  it("initializes and generates slides run with RAG context & artifact creation", async () => {
    const orchestrator = getHermesSlidesOrchestrator();

    const runId = await orchestrator.generateSlides({
      requestId: "req_slides_test",
      workspaceId: "ws_slides_test",
      topic: "Artificial Intelligence in Healthcare",
      slideCount: 8,
      template: "medical",
      targetAudience: "Clinicians",
      language: "en",
      userId: "usr_slides_test",
    });

    expect(runId).toBeDefined();

    // Allow monitoring callback tick to complete
    await new Promise((r) => setTimeout(r, 50));

    const status = await orchestrator.getRunStatus(runId);
    expect(status.status).toBe("completed");
    expect(status.progress).toBe(100);
  });

  it("handles pause and resume slide generation commands", async () => {
    const orchestrator = getHermesSlidesOrchestrator();

    await orchestrator.pauseSlideGeneration({
      requestId: "req_pause",
      workspaceId: "ws_slides_test",
      runId: "run_test_123",
      jobId: "job_legacy_123",
      userId: "usr_slides_test",
    });

    await orchestrator.resumeSlideGeneration({
      requestId: "req_resume",
      workspaceId: "ws_slides_test",
      runId: "run_test_123",
      jobId: "job_legacy_123",
      userId: "usr_slides_test",
    });
  });

  it("exports slide deck artifact to target format", async () => {
    const orchestrator = getHermesSlidesOrchestrator();

    const exportRes = await orchestrator.exportSlideDeck({
      requestId: "req_export",
      workspaceId: "ws_slides_test",
      runId: "run_export_123",
      jobId: "job_legacy_123",
      format: "pdf",
      userId: "usr_slides_test",
    });

    expect(exportRes.format).toBe("pdf");
    expect(exportRes.url).toContain("run_export_123");
  });
});
