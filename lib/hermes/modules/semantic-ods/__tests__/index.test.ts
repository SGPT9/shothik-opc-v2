import { describe, expect, it, vi } from "vitest";
import { SemanticOdsEngine } from "../index";
import { InsForgeTwinRagMemory } from "@/lib/insforge/rag-memory";

vi.mock("@/lib/insforge/rag-memory", () => ({
  InsForgeTwinRagMemory: {
    searchMemory: vi.fn(),
    saveMemoryChunk: vi.fn(),
  },
}));

describe("SemanticOdsEngine", () => {
  it("executes hybrid semantic vector search and enriches with ODS metadata", async () => {
    vi.mocked(InsForgeTwinRagMemory.searchMemory).mockResolvedValueOnce([
      {
        chunk: {
          id: "chunk_ods_101",
          twinId: "ws_ods_test",
          contentType: "research_report",
          title: "DeepSeek R1 reasoning",
          content: "DeepSeek R1 reasoning architecture guidelines",
          metadata: { source: "docs", createdAt: 1700000000 },
        },
        similarityScore: 0.92,
      },
    ]);

    const results = await SemanticOdsEngine.queryHybridOds({
      query: "DeepSeek R1 reasoning",
      workspaceId: "ws_ods_test",
      limit: 5,
    });

    expect(results).toHaveLength(1);
    expect(results[0].chunkId).toBe("chunk_ods_101");
    expect(results[0].similarityScore).toBe(0.92);
    expect(results[0].operationalMetadata.workspaceId).toBe("ws_ods_test");
  });

  it("handles query failures with resilient fallback results", async () => {
    vi.mocked(InsForgeTwinRagMemory.searchMemory).mockRejectedValueOnce(
      new Error("Vector database connection offline")
    );

    const results = await SemanticOdsEngine.queryHybridOds({
      query: "Hostinger VPS fallback",
      workspaceId: "ws_ods_fallback",
    });

    expect(results).toHaveLength(1);
    expect(results[0].chunkId).toBe("ods_fallback_001");
    expect(results[0].source).toBe("ods_resilient_fallback");
  });

  it("indexes operational documents into Semantic RAG + ODS", async () => {
    vi.mocked(InsForgeTwinRagMemory.saveMemoryChunk).mockResolvedValueOnce({
      success: true,
      id: "chunk_ingested_999",
    });

    const res = await SemanticOdsEngine.indexOperationalDocument("ws_ods_test", "Operational metric report");

    expect(res.chunkId).toBe("chunk_ingested_999");
    expect(res.status).toBe("indexed_in_ods");
  });
});
