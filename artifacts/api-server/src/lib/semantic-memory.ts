import fs from "fs";
import path from "path";
import { logger } from "./logger";

export interface MemoryEntry {
  id: string;
  userId: string;
  category: "preference" | "fact" | "style" | "project_context" | "correction";
  content: string;
  keywords: string[];
  relevanceScore?: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryRecallResult {
  userId: string;
  query: string;
  memories: MemoryEntry[];
  injectedPromptFragment: string;
  recallLatencyMs: number;
}

export interface MemoryProvider {
  memorize(userId: string, content: string, category?: MemoryEntry["category"], metadata?: Record<string, any>): Promise<MemoryEntry>;
  recall(userId: string, query: string, limit?: number): Promise<MemoryRecallResult>;
  listMemories(userId: string, category?: string): Promise<MemoryEntry[]>;
  deleteMemory(userId: string, memoryId: string): Promise<boolean>;
  clearUserMemories(userId: string): Promise<number>;
}

export class MemoriSemanticMemoryStore implements MemoryProvider {
  private static instance: MemoriSemanticMemoryStore;
  private memoryStore: Map<string, MemoryEntry[]> = new Map();
  private storageFilePath: string;

  constructor(customStoragePath?: string) {
    const cwd = process.cwd();
    const candidateDirs = [
      path.join(cwd, "scratch"),
      path.join(cwd, "../../scratch"),
      path.join(cwd, "tmp"),
      path.join(cwd, ".."),
    ];

    const targetDir = candidateDirs.find((d) => fs.existsSync(d)) || cwd;
    this.storageFilePath = customStoragePath || path.join(targetDir, "memori-semantic-store.json");
    this.loadFromDisk();
  }

  static getInstance(): MemoriSemanticMemoryStore {
    if (!MemoriSemanticMemoryStore.instance) {
      MemoriSemanticMemoryStore.instance = new MemoriSemanticMemoryStore();
    }
    return MemoriSemanticMemoryStore.instance;
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        for (const [userId, entries] of Object.entries(parsed)) {
          if (Array.isArray(entries)) {
            this.memoryStore.set(userId, entries as MemoryEntry[]);
          }
        }
        logger.info(`[semantic-memory] Loaded ${this.memoryStore.size} users from memory store`);
      }
    } catch (err: any) {
      logger.warn(`[semantic-memory] Could not load memory store: ${err.message}`);
    }
  }

  private saveToDisk(): void {
    try {
      const obj: Record<string, MemoryEntry[]> = {};
      for (const [userId, entries] of this.memoryStore.entries()) {
        obj[userId] = entries;
      }
      fs.writeFileSync(this.storageFilePath, JSON.stringify(obj, null, 2), "utf-8");
    } catch (err: any) {
      logger.warn(`[semantic-memory] Could not persist memory store to disk: ${err.message}`);
    }
  }

  private extractKeywords(text: string): string[] {
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/gi, " ");
    const words = normalized.split(/\s+/).filter((w) => w.length > 2);
    const stopWords = new Set([
      "the", "and", "this", "that", "with", "from", "for", "have", "you", "user", "want", "please", "like", "will", "what", "how", "why"
    ]);
    const uniqueKeywords = Array.from(new Set(words.filter((w) => !stopWords.has(w))));
    return uniqueKeywords;
  }

  private calculateSimilarity(queryKeywords: string[], entryKeywords: string[], entryContent: string, query: string): number {
    if (queryKeywords.length === 0 || entryKeywords.length === 0) return 0;

    let matchCount = 0;
    for (const qk of queryKeywords) {
      if (entryKeywords.some((ek) => ek.includes(qk) || qk.includes(ek))) {
        matchCount += 1.5;
      } else if (entryContent.toLowerCase().includes(qk)) {
        matchCount += 1;
      }
    }

    // Exact phrase bonus
    if (entryContent.toLowerCase().includes(query.toLowerCase().trim())) {
      matchCount += 3;
    }

    const score = matchCount / Math.max(queryKeywords.length, 1);
    return Math.min(Number(score.toFixed(3)), 1.0);
  }

  async memorize(
    userId: string,
    content: string,
    category: MemoryEntry["category"] = "fact",
    metadata?: Record<string, any>
  ): Promise<MemoryEntry> {
    if (!userId || !content || !content.trim()) {
      throw new Error("userId and content are required to memorize");
    }

    const cleanContent = content.trim();
    const keywords = this.extractKeywords(cleanContent);
    const userMemories = this.memoryStore.get(userId) || [];

    // Deduplication / Update if near-identical fact exists
    const existingIndex = userMemories.findIndex(
      (m) => m.category === category && m.content.toLowerCase() === cleanContent.toLowerCase()
    );

    const now = Date.now();
    let entry: MemoryEntry;

    if (existingIndex >= 0) {
      entry = {
        ...userMemories[existingIndex],
        keywords,
        metadata: { ...(userMemories[existingIndex].metadata || {}), ...(metadata || {}) },
        updatedAt: now,
      };
      userMemories[existingIndex] = entry;
    } else {
      entry = {
        id: `mem_${now}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        category,
        content: cleanContent,
        keywords,
        metadata: metadata || {},
        createdAt: now,
        updatedAt: now,
      };
      userMemories.unshift(entry);
    }

    this.memoryStore.set(userId, userMemories);
    this.saveToDisk();

    logger.info(`[semantic-memory] Memorized entry ${entry.id} for user ${userId} [category: ${category}]`);
    return entry;
  }

  async recall(userId: string, query: string, limit = 5): Promise<MemoryRecallResult> {
    const startTime = performance.now();
    const userMemories = this.memoryStore.get(userId) || [];

    if (!query || userMemories.length === 0) {
      return {
        userId,
        query: query || "",
        memories: [],
        injectedPromptFragment: "",
        recallLatencyMs: Math.round(performance.now() - startTime),
      };
    }

    const queryKeywords = this.extractKeywords(query);

    const scored = userMemories
      .map((entry) => {
        const relevanceScore = this.calculateSimilarity(queryKeywords, entry.keywords, entry.content, query);
        return { ...entry, relevanceScore };
      })
      .filter((entry) => (entry.relevanceScore ?? 0) > 0.15)
      .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
      .slice(0, limit);

    const injectedPromptFragment = this.formatMemoryForPrompt(scored);
    const recallLatencyMs = Math.round(performance.now() - startTime);

    return {
      userId,
      query,
      memories: scored,
      injectedPromptFragment,
      recallLatencyMs,
    };
  }

  formatMemoryForPrompt(memories: MemoryEntry[]): string {
    if (memories.length === 0) return "";

    const lines = memories.map((m) => `- [${m.category.toUpperCase()}] ${m.content}`);
    return `\n<user_semantic_memory>\nThe following persistent semantic memories were recalled from past sessions with this user:\n${lines.join("\n")}\n</user_semantic_memory>\n`;
  }

  async listMemories(userId: string, category?: string): Promise<MemoryEntry[]> {
    const userMemories = this.memoryStore.get(userId) || [];
    if (category) {
      return userMemories.filter((m) => m.category === category);
    }
    return userMemories;
  }

  async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    const userMemories = this.memoryStore.get(userId) || [];
    const initialLen = userMemories.length;
    const filtered = userMemories.filter((m) => m.id !== memoryId);

    if (filtered.length !== initialLen) {
      this.memoryStore.set(userId, filtered);
      this.saveToDisk();
      logger.info(`[semantic-memory] Deleted memory ${memoryId} for user ${userId}`);
      return true;
    }
    return false;
  }

  async clearUserMemories(userId: string): Promise<number> {
    const userMemories = this.memoryStore.get(userId) || [];
    const count = userMemories.length;
    this.memoryStore.delete(userId);
    this.saveToDisk();
    return count;
  }
}

export const semanticMemory = MemoriSemanticMemoryStore.getInstance();
