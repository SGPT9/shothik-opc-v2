import { describe, it, expect } from "vitest";
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
});
