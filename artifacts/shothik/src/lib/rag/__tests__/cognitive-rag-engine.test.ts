import { describe, expect, it } from "vitest";
import { CognitiveRAGEngine, DocumentSource } from "../cognitive-rag-engine";

describe("Enterprise Cognitive RAG Engine", () => {
  it("validates and classifies files with Magika-style rules", () => {
    const validPdf = CognitiveRAGEngine.validateAndClassify("fintech_report.pdf", "%PDF-1.4");
    expect(validPdf.valid).toBe(true);
    expect(validPdf.category).toBe("document");

    const codeFile = CognitiveRAGEngine.validateAndClassify("useChatStreamEngine.ts", "export const useChat = () => {}");
    expect(codeFile.valid).toBe(true);
    expect(codeFile.category).toBe("code");

    const dangerousScript = CognitiveRAGEngine.validateAndClassify("exploit.sh", "rm -rf /");
    expect(dangerousScript.valid).toBe(false);
    expect(dangerousScript.category).toBe("executable");
  });

  it("performs hierarchical parent-child chunking with contextual prepended headers", () => {
    const doc: DocumentSource = {
      id: "doc-101",
      title: "Bangladesh Bank Digital Bank Guidelines",
      filename: "bb_guidelines.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-01-15T00:00:00Z",
      rawText: `# Minimum Capital Requirements
All applicant digital banks must maintain a minimum paid-up capital of BDT 125 Crore upon commencement of commercial operations.

# Governance & Board Composition
The Board of Directors shall comprise a maximum of 15 members with at least 3 independent directors specializing in financial technology.`,
    };

    const chunks = CognitiveRAGEngine.chunkDocument(doc, 20, 100);
    expect(chunks.length).toBeGreaterThan(0);

    const firstChunk = chunks[0];
    expect(firstChunk.documentTitle).toBe("Bangladesh Bank Digital Bank Guidelines");
    expect(firstChunk.sectionHeader).toBe("Minimum Capital Requirements");
    expect(firstChunk.contextualText).toContain("[Document: Bangladesh Bank Digital Bank Guidelines | Section: Minimum Capital Requirements]");
    expect(firstChunk.parentText).toContain("BDT 125 Crore");
    expect(firstChunk.epistemicTier).toBe("tier_1_official");
  });

  it("applies 4-way hybrid fusion scoring with Reciprocal Rank Fusion & temporal decay", () => {
    const docNew: DocumentSource = {
      id: "doc-new",
      title: "Fintech Circular 2024",
      filename: "circular_2024.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-06-01T00:00:00Z",
      rawText: `# Capital Reserve
The capital reserve ratio for digital credit disbursement is set to 15 percent of outstanding loan portfolio.`,
    };

    const docOld: DocumentSource = {
      id: "doc-old",
      title: "Fintech Circular 2021",
      filename: "circular_2021.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2021-01-01T00:00:00Z",
      rawText: `# Capital Reserve
The capital reserve ratio for digital credit disbursement is set to 10 percent of outstanding loan portfolio.`,
    };

    const chunks = [
      ...CognitiveRAGEngine.chunkDocument(docNew),
      ...CognitiveRAGEngine.chunkDocument(docOld),
    ];

    const fused = CognitiveRAGEngine.hybridFuse(chunks, "capital reserve ratio digital credit");
    expect(fused.length).toBe(2);

    // The newer 2024 circular should have higher hybrid score due to temporal freshness
    expect(fused[0].documentTitle).toBe("Fintech Circular 2024");
    expect(fused[0].finalHybridScore).toBeGreaterThan(fused[1].finalHybridScore);
  });

  it("reranks candidates with cross-encoder scoring and authority weights", () => {
    const officialDoc: DocumentSource = {
      id: "doc-official",
      title: "Audited SEC Annual Filing",
      filename: "sec_10k.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-03-31T00:00:00Z",
      rawText: `# Operating Margins
Operating margin was 24.5 percent in FY2023 with net revenue of USD 450M.`,
    };

    const blogDoc: DocumentSource = {
      id: "doc-blog",
      title: "Tech Rumor Blog",
      filename: "blog.md",
      epistemicTier: "tier_4_web",
      publishedAt: "2024-04-01T00:00:00Z",
      rawText: `# Operating Margins
Operating margin was estimated around 50 percent according to unconfirmed sources.`,
    };

    const chunks = [
      ...CognitiveRAGEngine.chunkDocument(officialDoc),
      ...CognitiveRAGEngine.chunkDocument(blogDoc),
    ];

    const fused = CognitiveRAGEngine.hybridFuse(chunks, "operating margin net revenue");
    const reranked = CognitiveRAGEngine.rerank(fused, "operating margin net revenue", 2);

    expect(reranked[0].documentTitle).toBe("Audited SEC Annual Filing");
    expect(reranked[0].authorityWeight).toBe(1.0);
    expect(reranked[1].authorityWeight).toBe(0.4);
  });

  it("detects contradictions and flags superseded temporal documents", () => {
    const docOld: DocumentSource = {
      id: "doc-2021",
      title: "Digital Bank Policy 2021",
      filename: "policy_2021.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2021-01-01T00:00:00Z",
      rawText: `# Paid Up Capital
Required paid up capital is 50 Crore BDT.`,
    };

    const docNew: DocumentSource = {
      id: "doc-2024",
      title: "Digital Bank Policy 2024",
      filename: "policy_2024.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-01-01T00:00:00Z",
      rawText: `# Paid Up Capital
Required paid up capital is 125 Crore BDT.`,
    };

    const chunks = [
      ...CognitiveRAGEngine.chunkDocument(docOld),
      ...CognitiveRAGEngine.chunkDocument(docNew),
    ];

    const contradictions = CognitiveRAGEngine.detectContradictions(chunks);
    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0].hasConflict).toBe(true);
    expect(contradictions[0].conflictType).toBe("temporal_superseded");
    expect(contradictions[0].resolutionText).toContain('"Digital Bank Policy 2024" (2024-01-01T00:00:00Z) supersedes "Digital Bank Policy 2021"');
  });
});
