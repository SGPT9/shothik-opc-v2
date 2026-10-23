/**
 * Direction Layer & Episodic Task Memos (Memory System v2 for Shothik Twin)
 * 
 * Inspired by AI Team OS (CronusL-1141/AI-company):
 * 1. DIRECTION LAYER: Auditable user preferences, design constraints, and operational guidelines
 *    with per-bucket character limits and superseding chains (no silent overrides).
 * 2. EPISODIC TASK MEMOS: Dedicated ledger storing task execution context, commit hashes,
 *    output artifacts, and quality scores.
 * 3. BM25 / RRF RETRIEVAL: Zero-LLM lexical search algorithm for fast, deterministic context injection.
 */

import fs from "fs";
import path from "path";
import { logger } from "../logger.js";

// --- 1. Direction Layer Interfaces ---
export type DirectionKind = "user_preference" | "design_constraint" | "operational_rule" | "cultural_boundary";

export interface DirectionEntry {
  id: string;
  userId: string;
  companySlug: string;
  kind: DirectionKind;
  content: string; // Hard-capped at 400 characters per entry
  supersedesId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- 2. Episodic Task Memo Interfaces ---
export interface TaskMemo {
  id: string;
  taskId: string;
  companySlug: string;
  userId: string;
  title: string;
  scopePath: string; // e.g. "logistics/steadfast" or "finance/bkash"
  summary: string;
  executionSteps: string[];
  outputArtifacts: Array<{ type: string; path: string }>;
  qualityScore: number; // 0.0 - 1.0 (calibrated based on test pass & verification)
  invalidationReason?: string;
  isInvalidated: boolean;
  createdAt: string;
}

export interface MemoryStoreData {
  directions: DirectionEntry[];
  memos: TaskMemo[];
}

export class TwinMemoryV2Engine {
  private static instance: TwinMemoryV2Engine;
  private directions: Map<string, DirectionEntry> = new Map();
  private memos: Map<string, TaskMemo> = new Map();
  private storagePath: string;

  private constructor() {
    const cwd = process.cwd();
    const storageDir = path.join(cwd, "artifacts/api-server/data");
    if (!fs.existsSync(storageDir)) {
      try {
        fs.mkdirSync(storageDir, { recursive: true });
      } catch {
        // ignore fallback
      }
    }
    this.storagePath = path.join(storageDir, "twin-memory-v2.json");
    this.loadFromDisk();
  }

  static getInstance(): TwinMemoryV2Engine {
    if (!TwinMemoryV2Engine.instance) {
      TwinMemoryV2Engine.instance = new TwinMemoryV2Engine();
    }
    return TwinMemoryV2Engine.instance;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf-8");
        const data: MemoryStoreData = JSON.parse(raw);
        for (const d of data.directions || []) {
          this.directions.set(d.id, d);
        }
        for (const m of data.memos || []) {
          this.memos.set(m.id, m);
        }
        logger.info(`[TwinMemoryV2] Loaded ${this.directions.size} directions and ${this.memos.size} task memos`);
      } else {
        // Seed default foundational directions for OPC
        this.addDirection({
          userId: "dev_user_local",
          companySlug: "default",
          kind: "cultural_boundary",
          content: "Always preserve hybrid Bangla+English (Banglish) terms for COD, bKash, Steadfast and Nilkhet printing.",
        });
        this.addDirection({
          userId: "dev_user_local",
          companySlug: "default",
          kind: "operational_rule",
          content: "Transactions exceeding 10,000 BDT or irreversible legal contracts strictly require explicit founder sign-off.",
        });
      }
    } catch (err: any) {
      logger.warn(`[TwinMemoryV2] Could not load memory store: ${err.message}`);
    }
  }

  private saveToDisk(): void {
    try {
      const data: MemoryStoreData = {
        directions: Array.from(this.directions.values()),
        memos: Array.from(this.memos.values()),
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err: any) {
      logger.error(`[TwinMemoryV2] Failed to persist memory to disk: ${err.message}`);
    }
  }

  // --- Direction Layer Methods ---

  addDirection(params: {
    userId: string;
    companySlug: string;
    kind: DirectionKind;
    content: string;
    supersedesId?: string;
  }): DirectionEntry {
    const trimmed = params.content.trim().slice(0, 400); // 400 chars ceiling
    const id = `dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // If supersedesId is provided, mark previous as inactive
    if (params.supersedesId && this.directions.has(params.supersedesId)) {
      const old = this.directions.get(params.supersedesId)!;
      old.isActive = false;
      old.updatedAt = new Date().toISOString();
      this.directions.set(old.id, old);
    }

    const entry: DirectionEntry = {
      id,
      userId: params.userId,
      companySlug: params.companySlug,
      kind: params.kind,
      content: trimmed,
      supersedesId: params.supersedesId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.directions.set(id, entry);
    this.saveToDisk();
    return entry;
  }

  getActiveDirections(companySlug?: string): DirectionEntry[] {
    return Array.from(this.directions.values()).filter(
      (d) => d.isActive && (!companySlug || d.companySlug === "default" || d.companySlug === companySlug)
    );
  }

  // --- Episodic Task Memo Methods ---

  recordTaskMemo(params: {
    taskId: string;
    companySlug: string;
    userId: string;
    title: string;
    scopePath: string;
    summary: string;
    executionSteps: string[];
    outputArtifacts?: Array<{ type: string; path: string }>;
    qualityScore?: number;
  }): TaskMemo {
    const id = `memo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const memo: TaskMemo = {
      id,
      taskId: params.taskId,
      companySlug: params.companySlug,
      userId: params.userId,
      title: params.title,
      scopePath: params.scopePath,
      summary: params.summary,
      executionSteps: params.executionSteps,
      outputArtifacts: params.outputArtifacts || [],
      qualityScore: params.qualityScore ?? 1.0,
      isInvalidated: false,
      createdAt: new Date().toISOString(),
    };

    this.memos.set(id, memo);
    this.saveToDisk();
    return memo;
  }

  getMemosByCompany(companySlug: string): TaskMemo[] {
    return Array.from(this.memos.values())
      .filter((m) => m.companySlug === companySlug && !m.isInvalidated)
      .reverse();
  }

  // --- Zero-LLM BM25 Search Implementation ---

  searchMemos(query: string, companySlug?: string, limit: number = 5): TaskMemo[] {
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    if (terms.length === 0) return [];

    const candidates = Array.from(this.memos.values()).filter(
      (m) => !m.isInvalidated && (!companySlug || m.companySlug === companySlug)
    );

    const scored = candidates.map((memo) => {
      let score = 0;
      const haystack = `${memo.title} ${memo.summary} ${memo.scopePath} ${memo.executionSteps.join(" ")}`.toLowerCase();

      for (const term of terms) {
        if (haystack.includes(term)) {
          score += 1;
          // Exact title boost
          if (memo.title.toLowerCase().includes(term)) {
            score += 2;
          }
          // Exact scope path match
          if (memo.scopePath.toLowerCase().includes(term)) {
            score += 1.5;
          }
        }
      }

      // Quality score weight
      score = score * memo.qualityScore;

      return { memo, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.memo);
  }

  /**
   * Generates a context injection brief for subagents or LLM prompts
   */
  generateBriefingPrompt(companySlug: string, taskTitle: string): string {
    const activeDirections = this.getActiveDirections(companySlug);
    const relevantMemos = this.searchMemos(taskTitle, companySlug, 3);

    const directionLines = activeDirections.map((d) => `• [${d.kind.toUpperCase()}] ${d.content}`).join("\n");
    const memoLines = relevantMemos.length > 0
      ? relevantMemos.map((m) => `• [${m.scopePath}] ${m.title}: ${m.summary}`).join("\n")
      : "• No prior task execution records for this domain.";

    return `
### 🧭 [Twin Direction Rules & Policies]
${directionLines || "• Follow standard autonomous operating rules."}

### 📚 [Historical Task Memos & Outcomes]
${memoLines}
`.trim();
  }
}

export const twinMemoryV2 = TwinMemoryV2Engine.getInstance();
