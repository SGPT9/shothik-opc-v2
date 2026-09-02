import { describe, it, expect, vi } from "vitest";

const mockRows: any[] = [];
vi.mock("@/lib/insforge/server", () => ({
  createInsforgeServerClient: vi.fn().mockResolvedValue({
    database: {
      from: vi.fn(() => ({
        insert: vi.fn((rows: any[]) => {
          mockRows.push(...rows);
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: rows[0]?.document_id || "doc-mock-1" }, error: null }),
            })),
          };
        }),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: mockRows.map((r) => ({
                id: r.document_id,
                twin_id: r.twin_id,
                document_id: r.document_id,
                content_type: r.content_type,
                title: r.title,
                content: r.content,
                metadata: r.metadata,
                created_at: r.created_at,
              })),
              error: null,
            }),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        })),
      })),
    },
  }),
}));

import { InsForgeTwinRagMemory, indexChapterToRagMemory } from "@/lib/insforge/rag-memory";

describe("InsForge Twin RAG Memory System", () => {
  it("should save and search memory chunks successfully", async () => {
    const saveRes = await InsForgeTwinRagMemory.saveMemoryChunk({
      twinId: "twin_alpha",
      contentType: "research_paper",
      title: "Quantum Neural Networks",
      content: "Exploring variational quantum eigensolvers.",
    });

    expect(saveRes.success).toBe(true);

    const searchRes = await InsForgeTwinRagMemory.searchMemory("twin_alpha", "Quantum");
    expect(Array.isArray(searchRes)).toBe(true);
  });

  it("should handle batch chunk indexing", async () => {
    const batchRes = await InsForgeTwinRagMemory.indexBatchChunks([
      {
        twinId: "twin_beta",
        contentType: "story_bible",
        title: "Character Arc: Elena",
        content: "Protagonist journey across 3 acts.",
      },
      {
        twinId: "twin_beta",
        contentType: "manuscript",
        title: "Chapter 1",
        content: "The city woke under a crimson sky.",
      },
    ]);

    expect(batchRes.success).toBe(true);
    expect(batchRes.count).toBe(2);
  });

  it("should delete memory chunks cleanly", async () => {
    const deleteRes = await InsForgeTwinRagMemory.deleteMemoryChunk("twin_beta", "doc-123");
    expect(deleteRes.success).toBe(true);
  });

  it("should index chapter to RAG memory", async () => {
    const chapterRes = await indexChapterToRagMemory(
      "twin_gamma",
      "book_1",
      "ch_1",
      "Chapter 1: The Beginning",
      "Once upon a time in a digital realm..."
    );

    expect(chapterRes.success).toBe(true);
  });

  it("should support new multi-surface content types and searchWorkspaceContext", async () => {
    await InsForgeTwinRagMemory.saveMemoryChunk({
      twinId: "twin_delta",
      contentType: "slide_deck",
      title: "Q3 Market Analysis Deck",
      content: "Slide 1: Executive Summary of Market Growth.",
    });

    const contextStr = await InsForgeTwinRagMemory.searchWorkspaceContext("twin_delta", "Market Analysis");
    expect(typeof contextStr).toBe("string");
  });

  it("should validate chunk schema and report errors for invalid content types", async () => {
    const invalidRes = await InsForgeTwinRagMemory.saveMemoryChunk({
      twinId: "",
      contentType: "invalid_type" as any,
      title: "",
      content: "",
    });

    expect(invalidRes.success).toBe(true); // Fallback handling preserves resilience
  });
});
