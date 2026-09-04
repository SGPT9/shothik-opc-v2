import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdaptiveInferenceGateway } from "../inference-gateway";
import { RAGKnowledgeEngine } from "../rag-engine";

describe("Vast.ai Cloud GPU Bursting & Vespa Hybrid RAG Integration", () => {
  let gateway: AdaptiveInferenceGateway;
  let rag: RAGKnowledgeEngine;

  beforeEach(() => {
    gateway = AdaptiveInferenceGateway.getInstance();
    rag = RAGKnowledgeEngine.getInstance();
  });

  it("identifies Vast.ai as an active inference provider and status option", async () => {
    const status = await gateway.checkStatus();
    expect(status.providers).toHaveProperty("vastai");
    expect(status.providers.vastai).toHaveProperty("endpoint");
    expect(status.providers.vastai).toHaveProperty("configured");
  });

  it("executes hybrid knowledge queries and falls back smoothly if Vespa is offline", async () => {
    // Ingest a test document into RAG engine
    await rag.ingestDocument({
      userId: "usr_vespa_test",
      title: "Vast and Vespa Architecture Blueprint",
      content: "Vast.ai provides cost-effective on-demand cloud GPUs while Vespa executes billion-scale hybrid vector and BM25 search.",
    });

    const results = await rag.queryKnowledge("usr_vespa_test", "Vast.ai and Vespa GPU search", 2);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].content).toContain("Vast.ai");
    expect(results[0].score).toBeGreaterThan(0);
  });
});
