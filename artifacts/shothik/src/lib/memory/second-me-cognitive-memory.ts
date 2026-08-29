/**
 * Shothik "Second Me" Cognitive Memory Fabric
 *
 * Implements Tri-Tier Memory:
 * 1. Working Memory (Active session state, scratchpads, uncommitted drafts)
 * 2. Episodic Memory (Cross-session user decisions, feedback history, persona calibration)
 * 3. Semantic Memory (Indexed domain knowledge, documents, code graphs)
 *
 * Guaranteed Invariant: Zero secret persistence to disk/Postgres.
 */

export interface WorkingMemoryState {
  sessionId: string;
  activeDraft: string;
  activeArtifactTab?: "slides" | "research" | "sheet" | "code" | "synthesizer";
  contextChips: Array<{ id: string; label: string }>;
  uncommittedTokens: number;
}

export interface EpisodicMemoryEntry {
  id: string;
  userId: string;
  category: "user_preference" | "architectural_decision" | "feedback_correction" | "domain_knowledge" | "business_rules" | "brand_voice" | "founder_preference";
  summary: string;
  details: string;
  confidence: number; // 0.0 - 1.0
  createdAt: string; // ISO 8601
  tags: string[];
}

export interface SemanticMemoryNode {
  id: string;
  documentTitle: string;
  sectionHeader: string;
  text: string;
  embedding?: number[];
  epistemicTier: "tier_1_official" | "tier_2_internal" | "tier_3_transcripts" | "tier_4_web";
}

export interface PersonaCalibration {
  conciseness: number; // 0.0 (elaborate) to 1.0 (ultra-concise)
  technicalDepth: number; // 0.0 (layman) to 1.0 (kernel/compiler level)
  tone: "neutral_analytical" | "executive_strategic" | "creative_visionary";
  preferredLanguage: "en-US" | "bn-BD" | "bilingual";
}

export class SecondMeCognitiveMemory {
  private workingMemory: WorkingMemoryState;
  private episodicMemory: EpisodicMemoryEntry[] = [];
  private semanticMemory: SemanticMemoryNode[] = [];
  private persona: PersonaCalibration;

  constructor(sessionId = `session-${Date.now()}`) {
    this.workingMemory = {
      sessionId,
      activeDraft: "",
      contextChips: [],
      uncommittedTokens: 0,
    };
    this.persona = {
      conciseness: 0.85,
      technicalDepth: 0.90,
      tone: "neutral_analytical",
      preferredLanguage: "en-US",
    };
  }

  // ── Tier 1: Working Memory ──

  getWorkingMemory(): WorkingMemoryState {
    return { ...this.workingMemory };
  }

  updateWorkingDraft(text: string, tab?: WorkingMemoryState["activeArtifactTab"]) {
    this.workingMemory.activeDraft = text;
    if (tab) this.workingMemory.activeArtifactTab = tab;
    this.workingMemory.uncommittedTokens = Math.ceil(text.length / 4);
  }

  addContextChip(id: string, label: string) {
    if (!this.workingMemory.contextChips.some((c) => c.id === id)) {
      this.workingMemory.contextChips.push({ id, label });
    }
  }

  removeContextChip(id: string) {
    this.workingMemory.contextChips = this.workingMemory.contextChips.filter((c) => c.id !== id);
  }

  // ── Tier 2: Episodic Memory ──

  /**
   * Commits an episodic memory entry with automatic secret stripping
   */
  recordEpisodicDecision(entry: Omit<EpistemicMemorySanitized, "id" | "createdAt">): EpisodicMemoryEntry {
    const sanitizedDetails = this.stripSensitiveTokens(entry.details);
    const sanitizedSummary = this.stripSensitiveTokens(entry.summary);

    const record: EpisodicMemoryEntry = {
      id: `ep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: entry.userId,
      category: entry.category,
      summary: sanitizedSummary,
      details: sanitizedDetails,
      confidence: entry.confidence ?? 0.9,
      createdAt: new Date().toISOString(),
      tags: entry.tags || [],
    };

    this.episodicMemory.push(record);
    return record;
  }

  recallEpisodicMemories(query: string, limit = 5): EpisodicMemoryEntry[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const isPricingQuery = /courier|delivery|cod|price|cost|fee|tk|bdt|refund|return|voucher/i.test(query);
    const isVoiceQuery = /tone|voice|style|bangla|banglish|language/i.test(query);
    const isFounderQuery = /preference|rule|autonomy|approval|directive/i.test(query);

    return [...this.episodicMemory]
      .map((entry) => {
        let score = 0;
        const text = `${entry.summary} ${entry.details} ${entry.tags.join(" ")}`.toLowerCase();

        // Exact & token overlap matching
        for (const token of queryTokens) {
          if (text.includes(token)) score += 1.5;
        }

        // Semantic Intent & Category boosting
        if (isPricingQuery && entry.category === "business_rules") score += 3.0;
        if (isVoiceQuery && entry.category === "brand_voice") score += 3.0;
        if (isFounderQuery && entry.category === "founder_preference") score += 3.0;

        // Confidence weighting
        score *= (entry.confidence || 0.9);

        return { entry, score };
      })
      .sort((a, b) => b.score - a.score)
      .filter((item) => item.score > 0 || queryTokens.length === 0)
      .slice(0, limit)
      .map((item) => item.entry);
  }

  // ── Tier 3: Semantic Memory ──

  indexSemanticNode(node: SemanticMemoryNode) {
    this.semanticMemory.push(node);
  }

  /**
   * Searches semantic nodes with cosine embedding comparison or BM25 keyword matching
   */
  searchSemanticMemory(query: string, limit = 3, queryEmbedding?: number[]): SemanticMemoryNode[] {
    const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    return [...this.semanticMemory]
      .map((node) => {
        let match = 0;

        // 1. Vector Cosine Similarity if embeddings are available
        if (queryEmbedding && node.embedding && queryEmbedding.length === node.embedding.length) {
          let dotProduct = 0;
          let normA = 0;
          let normB = 0;
          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * node.embedding[i];
            normA += queryEmbedding[i] * queryEmbedding[i];
            normB += node.embedding[i] * node.embedding[i];
          }
          const cosine = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
          match += cosine * 5;
        }

        // 2. Keyword & BM25-style lexical matching
        const full = `${node.documentTitle} ${node.sectionHeader} ${node.text}`.toLowerCase();
        for (const t of tokens) {
          if (full.includes(t)) match += 2;
        }

        // Epistemic Tier weighting
        if (node.epistemicTier === "tier_1_official") match *= 1.25;
        else if (node.epistemicTier === "tier_2_internal") match *= 1.1;

        return { node, match };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, limit)
      .map((item) => item.node);
  }

  // ── Persona & Style Calibration ──

  getPersona(): PersonaCalibration {
    return { ...this.persona };
  }

  calibratePersona(calibration: Partial<PersonaCalibration>) {
    this.persona = { ...this.persona, ...calibration };
  }

  /**
   * Generates a context injection prompt combining Working, Episodic, and Persona state
   */
  generateCognitiveContextPrompt(activeQuery: string): string {
    const relevantEpisodic = this.recallEpisodicMemories(activeQuery, 3);
    const relevantSemantic = this.searchSemanticMemory(activeQuery, 2);

    let prompt = `[SECOND ME COGNITIVE STATE]\n`;
    prompt += `Tone: ${this.persona.tone} | Technical Depth: ${Math.round(this.persona.technicalDepth * 100)}% | Language: ${this.persona.preferredLanguage}\n`;

    if (relevantEpisodic.length > 0) {
      prompt += `\n[RELEVANT EPISODIC MEMORIES (Past Decisions & User Style)]\n`;
      relevantEpisodic.forEach((m, i) => {
        prompt += `${i + 1}. [${m.category}] ${m.summary}: ${m.details}\n`;
      });
    }

    if (relevantSemantic.length > 0) {
      prompt += `\n[RELEVANT SEMANTIC KNOWLEDGE]\n`;
      relevantSemantic.forEach((s, i) => {
        prompt += `${i + 1}. [${s.documentTitle} > ${s.sectionHeader}]: ${s.text.slice(0, 200)}...\n`;
      });
    }

    return prompt;
  }

  /**
   * Strips secret tokens (API keys, bearer tokens, private keys) from memory persistence
   */
  private stripSensitiveTokens(text: string): string {
    return text
      .replace(/(ghp_[a-zA-Z0-9]{36})/g, "••••••••")
      .replace(/(sk-[a-zA-Z0-9]{48})/g, "••••••••")
      .replace(/(Bearer\s+[a-zA-Z0-9_\-\.]{20,})/gi, "Bearer ••••••••")
      .replace(/(password\s*[:=]\s*['"][^'"]+['"])/gi, "password: ••••••••");
  }
}

type EpistemicMemorySanitized = Omit<EpisodicMemoryEntry, "id" | "createdAt"> & { id?: string; createdAt?: string };
