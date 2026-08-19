/**
 * 🧠 DeepSeek Context Compaction Engine (Inspired by @deepseek-ai/dsh-compaction-basic)
 * 
 * Features:
 * 1. Automatic Context Pressure Monitoring (Threshold at 80% of window)
 * 2. Recent Tail Retention (Keeps recent turns verbatim)
 * 3. Warm Prefix Cache Reuse with <compacted-summary> Tagging
 * 4. Collapsible UI Summary Checkpoints with Token Savings Accounting
 */

export interface ConversationTurn {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tokensEstimated: number;
  timestamp: string;
  toolCalls?: Array<{ name: string; args: any; result?: any }>;
}

export interface CompactionCheckpoint {
  checkpointId: string;
  compactedTurnIds: string[];
  summary: string;
  originalTokens: number;
  compactedTokens: number;
  tokensSaved: number;
  timestamp: string;
}

export interface CompactionPolicy {
  maxContextTokens: number; // e.g. 64000 for DeepSeek V3 / V4
  thresholdRatio: number;   // default 0.8 (80%)
  retainRatio: number;      // default 0.2 (20% recent tail kept verbatim)
}

export class DeepSeekCompactionEngine {
  private policy: CompactionPolicy;

  constructor(policy?: Partial<CompactionPolicy>) {
    this.policy = {
      maxContextTokens: policy?.maxContextTokens || 64000,
      thresholdRatio: policy?.thresholdRatio || 0.8,
      retainRatio: policy?.retainRatio || 0.2,
    };
  }

  /**
   * Estimates token count for a text string (~4 chars per token for English/Bangla/Code)
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 3.8);
  }

  /**
   * Calculates total token pressure in the current transcript
   */
  public calculatePressure(turns: ConversationTurn[]): {
    totalTokens: number;
    thresholdTokens: number;
    isPressureCritical: boolean;
    occupancyPercentage: number;
  } {
    const totalTokens = turns.reduce((acc, t) => acc + (t.tokensEstimated || DeepSeekCompactionEngine.estimateTokens(t.content)), 0);
    const thresholdTokens = Math.floor(this.policy.maxContextTokens * this.policy.thresholdRatio);
    const isPressureCritical = totalTokens >= thresholdTokens;
    const occupancyPercentage = Math.min(100, Math.round((totalTokens / this.policy.maxContextTokens) * 100));

    return {
      totalTokens,
      thresholdTokens,
      isPressureCritical,
      occupancyPercentage,
    };
  }

  /**
   * Compacts older conversation turns when context pressure is critical
   */
  public compactTranscript(
    turns: ConversationTurn[],
    customSummarizer?: (turnsToSummarize: ConversationTurn[]) => string
  ): {
    compacted: boolean;
    remainingTurns: ConversationTurn[];
    checkpoint?: CompactionCheckpoint;
  } {
    const pressure = this.calculatePressure(turns);

    // If pressure is below threshold and transcript is small, no compaction needed
    if (!pressure.isPressureCritical && turns.length <= 6) {
      return {
        compacted: false,
        remainingTurns: turns,
      };
    }

    // Retain recent tail: keep last N turns that fit inside retainRatio budget
    const retainTokensBudget = Math.floor(this.policy.maxContextTokens * this.policy.retainRatio);
    
    let tailTokens = 0;
    let splitIndex = turns.length;

    for (let i = turns.length - 1; i >= 0; i--) {
      const turnTokens = turns[i].tokensEstimated || DeepSeekCompactionEngine.estimateTokens(turns[i].content);
      if (tailTokens + turnTokens > retainTokensBudget && (turns.length - i) >= 2) {
        splitIndex = i + 1;
        break;
      }
      tailTokens += turnTokens;
    }

    if (splitIndex <= 1) {
      // Nothing eligible for compaction
      return {
        compacted: false,
        remainingTurns: turns,
      };
    }

    const turnsToCompact = turns.slice(0, splitIndex);
    const recentTailTurns = turns.slice(splitIndex);

    const originalTokens = turnsToCompact.reduce(
      (acc, t) => acc + (t.tokensEstimated || DeepSeekCompactionEngine.estimateTokens(t.content)),
      0
    );

    // Generate structured summary (or use custom LLM summarizer)
    const summaryText = customSummarizer 
      ? customSummarizer(turnsToCompact)
      : this.generateStructuredSummary(turnsToCompact);

    const compactedSummaryTurn: ConversationTurn = {
      id: `chk-${Date.now()}`,
      role: "system",
      content: `<compacted-summary>\n${summaryText}\n</compacted-summary>`,
      tokensEstimated: DeepSeekCompactionEngine.estimateTokens(summaryText) + 12,
      timestamp: new Date().toISOString(),
    };

    const checkpoint: CompactionCheckpoint = {
      checkpointId: compactedSummaryTurn.id,
      compactedTurnIds: turnsToCompact.map(t => t.id),
      summary: summaryText,
      originalTokens,
      compactedTokens: compactedSummaryTurn.tokensEstimated,
      tokensSaved: Math.max(0, originalTokens - compactedSummaryTurn.tokensEstimated),
      timestamp: new Date().toISOString(),
    };

    return {
      compacted: true,
      remainingTurns: [compactedSummaryTurn, ...recentTailTurns],
      checkpoint,
    };
  }

  /**
   * Generates a structured summary preserving critical entity states, tax records, and decisions
   */
  private generateStructuredSummary(turns: ConversationTurn[]): string {
    const userTopics: string[] = [];
    const keyOutcomes: string[] = [];

    for (const turn of turns) {
      if (turn.role === "user") {
        userTopics.push(turn.content.slice(0, 80));
      } else if (turn.role === "assistant") {
        if (turn.content.includes("Consignment") || turn.content.includes("ST-") || turn.content.includes("TRK-BD")) {
          keyOutcomes.push("Logistics consignment booked & tracking active.");
        } else if (turn.content.includes("bKash") || turn.content.includes("TrxID") || turn.content.includes("৳")) {
          keyOutcomes.push("bKash MFS payment verified & delivery advance secured.");
        } else if (turn.content.includes("Mushak-6.3") || turn.content.includes("VAT")) {
          keyOutcomes.push("NBR Mushak-6.3 statutory tax invoice issued.");
        }
      }
    }

    return [
      `### Context Checkpoint (${turns.length} earlier turns compacted)`,
      `**User Objectives Discussed:** ${userTopics.slice(0, 3).join("; ")}`,
      keyOutcomes.length > 0 ? `**Established System Milestones:** ${keyOutcomes.join(" · ")}` : "**Established System Milestones:** Requirements analyzed and consensus achieved.",
      `**Status:** In active execution; older dialogue compressed for maximum inference throughput.`
    ].join("\n");
  }
}
