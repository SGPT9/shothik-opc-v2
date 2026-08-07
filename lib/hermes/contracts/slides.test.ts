import { describe, expect, it } from "vitest";
import {
  GenerateSlidesCommandSchema,
  ResumeSlideGenerationCommandSchema,
  PauseSlideGenerationCommandSchema,
  UpdateSlideContentCommandSchema,
  ExportSlideDeckCommandSchema,
  HermesRunEventEnvelopeSchema,
} from "./slides";

describe("Hermes Chat-To-Slides Contracts & Command Schemas (P1-001)", () => {
  it("validates GenerateSlidesCommand with required and default parameters", () => {
    const validRaw = {
      requestId: "req_123",
      workspaceId: "ws_456",
      topic: "Quantum Computing Algorithms",
      userId: "user_789",
    };

    const parsed = GenerateSlidesCommandSchema.parse(validRaw);
    expect(parsed.requestId).toBe("req_123");
    expect(parsed.slideCount).toBe(10);
    expect(parsed.template).toBe("academic");
    expect(parsed.language).toBe("en");

    const invalid = GenerateSlidesCommandSchema.safeParse({
      requestId: "",
      topic: "a", // Less than 3 chars
    });
    expect(invalid.success).toBe(false);
  });

  it("validates ResumeSlideGenerationCommand and PauseSlideGenerationCommand", () => {
    const resumeCmd = ResumeSlideGenerationCommandSchema.parse({
      requestId: "req_res",
      workspaceId: "ws_1",
      runId: "run_99",
      jobId: "job_42",
      userId: "user_1",
    });

    expect(resumeCmd.runId).toBe("run_99");

    const pauseCmd = PauseSlideGenerationCommandSchema.parse({
      requestId: "req_pause",
      workspaceId: "ws_1",
      runId: "run_99",
      jobId: "job_42",
      userId: "user_1",
    });

    expect(pauseCmd.jobId).toBe("job_42");
  });

  it("validates UpdateSlideContentCommand and ExportSlideDeckCommand", () => {
    const updateCmd = UpdateSlideContentCommandSchema.parse({
      requestId: "req_update",
      workspaceId: "ws_1",
      runId: "run_1",
      jobId: "job_1",
      slideIndex: 2,
      content: {
        title: "Updated Slide Title",
        bulletPoints: ["Point A", "Point B"],
      },
      userId: "user_1",
    });

    expect(updateCmd.slideIndex).toBe(2);
    expect(updateCmd.content.bulletPoints).toEqual(["Point A", "Point B"]);

    const exportCmd = ExportSlideDeckCommandSchema.parse({
      requestId: "req_export",
      workspaceId: "ws_1",
      runId: "run_1",
      jobId: "job_1",
      format: "pdf",
      userId: "user_1",
    });

    expect(exportCmd.format).toBe("pdf");
  });

  it("validates HermesRunEventEnvelope Schema", () => {
    const envelope = HermesRunEventEnvelopeSchema.parse({
      eventId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      runId: "run_100",
      workspaceId: "ws_100",
      domain: "slides",
      eventType: "slide.rendered",
      timestamp: new Date().toISOString(),
      payload: { slideIndex: 1, title: "Intro" },
    });

    expect(envelope.domain).toBe("slides");
    expect(envelope.eventType).toBe("slide.rendered");
  });
});
