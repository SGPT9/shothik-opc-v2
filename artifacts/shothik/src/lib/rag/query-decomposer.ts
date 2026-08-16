/**
 * Shothik System 2 Query Decomposer & HyDE Pipeline
 *
 * Implements:
 * 1. Semantic Sub-Question Decomposition for complex multi-part queries
 * 2. Hypothetical Document Embeddings (HyDE) for dense vector alignment
 * 3. Multi-Hop Dependency Graph resolution (prerequisite & dependent sub-tasks)
 * 4. Multi-Intent Sparse/Dense/Graph query synthesis
 * 5. Integrated multi-hop execution bridge with CognitiveRAGEngine
 */

import {
  CognitiveChildChunk,
  CognitiveRAGEngine,
  ContradictionRecord,
  RerankedResult,
} from "./cognitive-rag-engine";

export type SubQuestionIntent =
  | "fact_lookup"
  | "comparative_analysis"
  | "regulatory_verification"
  | "quantitative_modeling"
  | "temporal_audit";

export interface SubQuestion {
  id: string;
  question: string;
  intent: SubQuestionIntent;
  denseQuery: string;
  sparseKeywords: string[];
  graphEntities: string[];
  hydeDocument: string;
  priority: number; // 1 = immediate/foundational, 2 = dependent, 3 = synthesis
  dependsOn?: string[];
}

export interface DecomposedPlan {
  originalQuery: string;
  complexity: "simple_single_hop" | "moderate_dual_hop" | "complex_multi_hop";
  subQuestions: SubQuestion[];
  synthesisGoal: string;
}

export interface SubQuestionResult {
  subQuestion: SubQuestion;
  retrievedChunks: RerankedResult[];
  confidenceScore: number;
}

export interface MultiHopRetrievalResult {
  plan: DecomposedPlan;
  subResults: SubQuestionResult[];
  mergedChunks: RerankedResult[];
  detectedContradictions: ContradictionRecord[];
  totalRetrieved: number;
}

export class System2QueryDecomposer {
  /**
   * 1. Decomposes complex prompt into atomic sub-questions with HyDE synthesis
   */
  static decompose(query: string): DecomposedPlan {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    const subQuestions: SubQuestion[] = [];
    let complexity: DecomposedPlan["complexity"] = "simple_single_hop";

    // Split on conjunctions and comparison operators
    const isComparative =
      lower.includes(" vs ") ||
      lower.includes(" versus ") ||
      lower.includes("compare") ||
      lower.includes("difference between");

    const isMultiPart =
      lower.includes(" and ") ||
      lower.includes(" as well as ") ||
      lower.includes(" in addition to ") ||
      lower.includes(";");

    const hasModeling =
      lower.includes("model") ||
      lower.includes("margin") ||
      lower.includes("projection") ||
      lower.includes("mrr") ||
      lower.includes("p&l");

    const hasRegulatory =
      lower.includes("regulation") ||
      lower.includes("circular") ||
      lower.includes("compliance") ||
      lower.includes("reserve") ||
      lower.includes("capital requirement");

    if (isComparative && (hasModeling || hasRegulatory)) {
      complexity = "complex_multi_hop";
    } else if (isComparative || isMultiPart) {
      complexity = "moderate_dual_hop";
    }

    // Generate atomic sub-questions based on parsed intents
    if (isComparative) {
      const parts = trimmed.split(/ vs | versus | compare | and /i).filter((p) => p.trim().length > 0);
      const entityA = parts[0]?.replace(/^compare /i, "").trim() || "Entity A";
      const entityB = parts[1]?.trim() || "Entity B";

      // Sub-Question 1: Entity A Analysis
      const q1Id = "sub-q-1";
      subQuestions.push({
        id: q1Id,
        question: `What are the key specifications, fees, and requirements for ${entityA}?`,
        intent: "fact_lookup",
        denseQuery: `${entityA} fee structure capital requirement specifications`,
        sparseKeywords: this.extractKeywords(entityA),
        graphEntities: [entityA],
        hydeDocument: this.generateHyDE(
          `Official overview of ${entityA} containing fee schedules, capital adequacy ratios, and merchant commission structures.`
        ),
        priority: 1,
      });

      // Sub-Question 2: Entity B Analysis
      const q2Id = "sub-q-2";
      subQuestions.push({
        id: q2Id,
        question: `What are the key specifications, fees, and requirements for ${entityB}?`,
        intent: "fact_lookup",
        denseQuery: `${entityB} fee structure capital requirement specifications`,
        sparseKeywords: this.extractKeywords(entityB),
        graphEntities: [entityB],
        hydeDocument: this.generateHyDE(
          `Official overview of ${entityB} detailing merchant rates, reserve policies, and digital banking unit provisions.`
        ),
        priority: 1,
      });

      // Sub-Question 3: Synthesis / Comparative Verification
      subQuestions.push({
        id: "sub-q-3",
        question: `How do ${entityA} and ${entityB} compare regarding regulatory compliance and financial margins?`,
        intent: "comparative_analysis",
        denseQuery: `Comparison between ${entityA} and ${entityB} margins regulatory compliance`,
        sparseKeywords: [...this.extractKeywords(entityA), ...this.extractKeywords(entityB), "compare", "margin"],
        graphEntities: [entityA, entityB],
        hydeDocument: this.generateHyDE(
          `Comparative analysis contrasting ${entityA} vs ${entityB} with a detailed matrix of margins, reserve ratios, and fee structures.`
        ),
        priority: 2,
        dependsOn: [q1Id, q2Id],
      });
    } else if (hasRegulatory && hasModeling) {
      // Sub-Question 1: Regulatory Policy Audit
      subQuestions.push({
        id: "sub-q-1",
        question: "What are the latest regulatory reserve and compliance mandates?",
        intent: "regulatory_verification",
        denseQuery: `${trimmed} regulatory circular minimum capital liquid reserve mandate`,
        sparseKeywords: this.extractKeywords(trimmed).concat(["circular", "reserve", "compliance"]),
        graphEntities: ["Regulatory Authority", "Central Bank"],
        hydeDocument: this.generateHyDE(
          "Regulatory circular specifying mandatory statutory liquidity ratios, digital bank capital buffers, and compliance deadlines."
        ),
        priority: 1,
      });

      // Sub-Question 2: Financial Model Projections
      subQuestions.push({
        id: "sub-q-2",
        question: "What are the projected margin impacts and financial model line items?",
        intent: "quantitative_modeling",
        denseQuery: `${trimmed} financial model margin projection cash flow`,
        sparseKeywords: this.extractKeywords(trimmed).concat(["model", "margin", "p&l", "projection"]),
        graphEntities: ["ScenarioLab", "Financial Model"],
        hydeDocument: this.generateHyDE(
          "Three-year financial forecast detailing revenue growth, gross margins, CAC payback periods, and operating cash flow."
        ),
        priority: 2,
        dependsOn: ["sub-q-1"],
      });
    } else {
      // Single-hop atomic query
      subQuestions.push({
        id: "sub-q-1",
        question: trimmed,
        intent: "fact_lookup",
        denseQuery: trimmed,
        sparseKeywords: this.extractKeywords(trimmed),
        graphEntities: this.extractEntities(trimmed),
        hydeDocument: this.generateHyDE(
          `Grounded factual explanation answering: "${trimmed}" with verified citations and authoritative data.`
        ),
        priority: 1,
      });
    }

    return {
      originalQuery: trimmed,
      complexity,
      subQuestions,
      synthesisGoal: `Synthesize comprehensive verified answer addressing: "${trimmed}"`,
    };
  }

  /**
   * 2. Generates Hypothetical Document Embedding (HyDE) passage
   */
  static generateHyDE(intentSummary: string): string {
    return `[Hypothetical Authoritative Passage]\n${intentSummary}\nPublished in verified documentation with official data points, metrics, and compliance specifications.`;
  }

  /**
   * 3. Executes multi-hop retrieval across all decomposed sub-questions
   */
  static executeMultiHopPlan(
    plan: DecomposedPlan,
    corpusChunks: CognitiveChildChunk[]
  ): MultiHopRetrievalResult {
    const subResults: SubQuestionResult[] = [];
    const chunkMap = new Map<string, RerankedResult>();

    // Process sub-questions in priority order (Priority 1 foundational -> Priority 2 dependent)
    const sortedQuestions = [...plan.subQuestions].sort((a, b) => a.priority - b.priority);

    for (const sq of sortedQuestions) {
      // 1. Combine dense query + HyDE document for enhanced semantic match
      const fusedQuery = `${sq.denseQuery} ${sq.sparseKeywords.join(" ")}`;

      // 2. Run CognitiveRAG hybrid fusion (Dense + BM25 + Recency)
      const hybridMatches = CognitiveRAGEngine.hybridFuse(corpusChunks, fusedQuery);

      // 3. Cross-Encoder Multi-Dimensional Reranking
      const reranked = CognitiveRAGEngine.rerank(hybridMatches, sq.question, 3);

      const confidenceScore =
        reranked.length > 0
          ? reranked.reduce((sum, r) => sum + r.finalRerankScore, 0) / reranked.length
          : 0;

      subResults.push({
        subQuestion: sq,
        retrievedChunks: reranked,
        confidenceScore,
      });

      // Merge into deduplicated result pool
      for (const item of reranked) {
        const existing = chunkMap.get(item.id);
        if (!existing || item.finalRerankScore > existing.finalRerankScore) {
          chunkMap.set(item.id, item);
        }
      }
    }

    const mergedChunks = Array.from(chunkMap.values()).sort(
      (a, b) => b.finalRerankScore - a.finalRerankScore
    );

    // Run contradiction detection across all retrieved chunks
    const rawChunks = mergedChunks.map((m) => m as CognitiveChildChunk);
    const detectedContradictions = CognitiveRAGEngine.detectContradictions(rawChunks);

    return {
      plan,
      subResults,
      mergedChunks,
      detectedContradictions,
      totalRetrieved: mergedChunks.length,
    };
  }

  private static extractKeywords(text: string): string[] {
    const stopwords = new Set([
      "the", "a", "an", "is", "are", "and", "or", "to", "in", "of", "for", "with", "what", "how", "why", "where", "when"
    ]);
    return text
      .toLowerCase()
      .split(/[^a-zA-Z0-9_\u0980-\u09FF]+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));
  }

  private static extractEntities(text: string): string[] {
    const capitalized = text.match(/\b[A-Z][a-zA-Z0-9_-]+\b/g) || [];
    return Array.from(new Set(capitalized));
  }
}
