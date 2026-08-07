import { describe, expect, it } from "vitest";
import {
  GenerateResearchReportCommandSchema,
  FetchLiteratureCommandSchema,
  SynthesizeFindingsCommandSchema,
  ExportResearchReportCommandSchema,
  HermesResearchEventEnvelopeSchema,
} from "./research";

describe("Hermes Research & Deep Research Contracts (Phase 3)", () => {
  it("validates GenerateResearchReportCommand with default parameters", () => {
    const parsed = GenerateResearchReportCommandSchema.parse({
      requestId: "req_res_123",
      workspaceId: "ws_res_456",
      topic: "Quantum Error Correction Codes",
      userId: "usr_res_789",
    });

    expect(parsed.depth).toBe("standard");
    expect(parsed.sources).toEqual(["openalex", "web"]);
    expect(parsed.maxSources).toBe(20);
    expect(parsed.language).toBe("en");
  });

  it("validates FetchLiteratureCommand query parameters", () => {
    const parsed = FetchLiteratureCommandSchema.parse({
      requestId: "req_lit",
      workspaceId: "ws_1",
      query: "CRISPR gene editing",
      source: "pubmed",
      limit: 15,
      userId: "usr_1",
    });

    expect(parsed.source).toBe("pubmed");
    expect(parsed.limit).toBe(15);

    const invalidQuery = FetchLiteratureCommandSchema.safeParse({
      requestId: "req_lit",
      workspaceId: "ws_1",
      query: "a", // Too short (< 2 chars)
      userId: "usr_1",
    });

    expect(invalidQuery.success).toBe(false);
  });

  it("validates SynthesizeFindingsCommand paper ID list", () => {
    const parsed = SynthesizeFindingsCommandSchema.parse({
      requestId: "req_synth",
      workspaceId: "ws_1",
      runId: "run_1",
      paperIds: ["doi:10.1038/s41586-021-03819-2", "arxiv:2103.00020"],
      focusQuestion: "What is the training throughput?",
      userId: "usr_1",
    });

    expect(parsed.paperIds.length).toBe(2);
    expect(parsed.focusQuestion).toBe("What is the training throughput?");
  });

  it("validates ExportResearchReportCommand formats", () => {
    const docxExport = ExportResearchReportCommandSchema.parse({
      requestId: "req_exp",
      workspaceId: "ws_1",
      runId: "run_1",
      format: "docx",
      userId: "usr_1",
    });

    expect(docxExport.format).toBe("docx");
  });

  it("validates HermesResearchEventEnvelope schema", () => {
    const envelope = HermesResearchEventEnvelopeSchema.parse({
      eventId: "d300bc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      runId: "run_res_99",
      workspaceId: "ws_res_99",
      domain: "research",
      eventType: "research.literature_fetched",
      timestamp: new Date().toISOString(),
      payload: { paperCount: 15, source: "openalex" },
    });

    expect(envelope.domain).toBe("research");
    expect(envelope.eventType).toBe("research.literature_fetched");
  });
});
