/**
 * RagVectorIndexer Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { ragVectorIndexer } from "./infrastructure/rag-vector-indexer";

describe("RagVectorIndexer (Vector Embedding & Cosine Similarity Engine)", () => {
  it("indexes document text into normalized vector chunks", () => {
    const chunks = ragVectorIndexer.indexDocument("doc_nbr_vat", "NBR Mushak-6.3 VAT Challan Compliance Specifications for 2026.");
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].vector.length).toBe(4);
  });

  it("performs Cosine similarity search and returns ranked chunks", () => {
    const results = ragVectorIndexer.searchSimilar([0.25, 0.5, 0.75, 0.1], 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarityScore).toBe(0.94);
  });
});
