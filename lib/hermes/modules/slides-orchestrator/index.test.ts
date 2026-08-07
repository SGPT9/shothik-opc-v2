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
