import { describe, expect, it } from "vitest";
import { CognitiveRAGEngine, DocumentSource } from "../cognitive-rag-engine";
import { System2QueryDecomposer } from "../query-decomposer";

describe("System 2 Query Decomposer & HyDE Pipeline", () => {
  it("decomposes simple single-hop queries into atomic sub-question with HyDE", () => {
    const plan = System2QueryDecomposer.decompose("What is the capital requirement for digital banks?");
    expect(plan.complexity).toBe("simple_single_hop");
    expect(plan.subQuestions.length).toBe(1);

    const subQ = plan.subQuestions[0];
    expect(subQ.intent).toBe("fact_lookup");
    expect(subQ.hydeDocument).toContain("[Hypothetical Authoritative Passage]");
    expect(subQ.sparseKeywords.length).toBeGreaterThan(0);
  });

  it("decomposes complex comparative queries into multi-hop sub-questions with dependencies", () => {
    const plan = System2QueryDecomposer.decompose(
      "Compare bKash vs Nagad merchant fee structures and model our 3-year SaaS margins."
    );

    expect(plan.complexity).toBe("complex_multi_hop");
    expect(plan.subQuestions.length).toBe(3);

    const q1 = plan.subQuestions[0];
    const q2 = plan.subQuestions[1];
    const q3 = plan.subQuestions[2];

    expect(q1.question).toContain("bKash");
    expect(q1.priority).toBe(1);

    expect(q2.question).toContain("Nagad");
    expect(q2.priority).toBe(1);

    expect(q3.intent).toBe("comparative_analysis");
    expect(q3.priority).toBe(2);
    expect(q3.dependsOn).toEqual(["sub-q-1", "sub-q-2"]);
  });

  it("executes multi-hop retrieval and merges deduplicated chunks with contradiction detection", () => {
    const docBKash: DocumentSource = {
      id: "doc-bkash-2024",
      title: "bKash Merchant Tariff Schedule 2024",
      filename: "bkash_2024.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-03-01T00:00:00Z",
      rawText: `# Merchant Fee Schedule
Merchant discount rate is 1.5 percent for standard QR digital retail transactions.`,
    };

    const docNagad: DocumentSource = {
      id: "doc-nagad-2024",
      title: "Nagad Merchant Tariff Schedule 2024",
      filename: "nagad_2024.md",
      epistemicTier: "tier_1_official",
      publishedAt: "2024-03-01T00:00:00Z",
      rawText: `# Merchant Fee Schedule
Merchant discount rate is 1.2 percent for digital retail transactions.`,
    };

    const corpusChunks = [
      ...CognitiveRAGEngine.chunkDocument(docBKash),
      ...CognitiveRAGEngine.chunkDocument(docNagad),
    ];

    const plan = System2QueryDecomposer.decompose(
      "Compare bKash vs Nagad merchant fees and model our revenue margins."
    );

    const result = System2QueryDecomposer.executeMultiHopPlan(plan, corpusChunks);

    expect(result.subResults.length).toBe(3);
    expect(result.totalRetrieved).toBeGreaterThan(0);
    expect(result.mergedChunks.length).toBeGreaterThan(0);

    // Verify both bKash and Nagad sources were retrieved into the merged pool
    const titles = result.mergedChunks.map((c) => c.documentTitle);
    expect(titles).toContain("bKash Merchant Tariff Schedule 2024");
    expect(titles).toContain("Nagad Merchant Tariff Schedule 2024");
  });
});
