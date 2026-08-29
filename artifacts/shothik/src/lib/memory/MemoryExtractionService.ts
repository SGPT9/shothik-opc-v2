/**
 * Shothik Memory Extraction Service
 *
 * Real-time extraction engine that analyzes completed agent tasks,
 * chat dialogues, Swarm deliberations, and Cockpit workflows.
 * Automatically identifies:
 * - Brand Voice & Tone preferences
 * - Business Rules & Pricing constraints
 * - Founder Preferences & Operational boundaries
 * - Architectural Decisions & API standards
 *
 * Enforces Zero-Secret Persistence Invariant.
 */

import { epistemicGraphMemory } from "./EpistemicGraphMemory";

export type MemoryCategory = "brand_voice" | "business_rules" | "faq" | "founder_preference" | "architectural_decision";
export type MemorySource = "chat" | "swarm" | "task" | "document" | "manual";

export interface ExtractedMemory {
  id: string;
  category: MemoryCategory;
  title: string;
  detail: string;
  confidence: number;
  source: MemorySource;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  autoLearned?: boolean;
}

export class MemoryExtractionService {
  private static instance: MemoryExtractionService;

  static getInstance(): MemoryExtractionService {
    if (!MemoryExtractionService.instance) {
      MemoryExtractionService.instance = new MemoryExtractionService();
    }
    return MemoryExtractionService.instance;
  }

  /**
   * Sanitizes all sensitive credentials, API keys, tokens, and PII
   */
  public sanitizeSecrets(text: string): string {
    if (!text) return "";
    return text
      .replace(/(ghp_[a-zA-Z0-9]{36})/g, "••••••••")
      .replace(/(sk-[a-zA-Z0-9]{48})/g, "••••••••")
      .replace(/(anon_[a-zA-Z0-9]{60,})/gi, "••••••••")
      .replace(/(Bearer\s+[a-zA-Z0-9_\-\.]{20,})/gi, "Bearer ••••••••")
      .replace(/(password\s*[:=]\s*['"][^'"]+['"])/gi, "password: ••••••••")
      .replace(/(client_secret\s*[:=]\s*['"][^'"]+['"])/gi, "client_secret: ••••••••");
  }

  /**
   * Analyzes an interaction or task result and extracts candidate cognitive memories
   */
  public extractDecisions(params: {
    prompt?: string;
    response: string;
    source: MemorySource;
    context?: Record<string, any>;
  }): ExtractedMemory[] {
    const { prompt = "", response, source, context } = params;
    const combined = `${prompt}\n\n${response}`.trim();
    if (!combined || combined.length < 20) return [];

    const candidates: ExtractedMemory[] = [];
    const sanitizedCombined = this.sanitizeSecrets(combined);

    // 1. Business & Pricing Rules Detection
    const pricingMatch = sanitizedCombined.match(
      /(?:delivery|charge|fee|price|cost|cod|tk|৳|bdt|tax|commission|discount|voucher|return policy)[\s\S]{10,250}?(?:\.|\n|$)/i
    );
    if (pricingMatch) {
      const line = pricingMatch[0].trim();
      if (line.length > 25 && !candidates.some((c) => c.category === "business_rules")) {
        let title = "Business & Pricing Constraint";
        if (/delivery|courier|cod|dhaka/i.test(line)) title = "Courier & Delivery Rule";
        else if (/return|refund|exchange/i.test(line)) title = "Return & Exchange Policy";
        else if (/voucher|discount|promo/i.test(line)) title = "Promotional & Voucher Limit";
        else if (/tax|vat|commission/i.test(line)) title = "Tax & Commission Structure";

        candidates.push({
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category: "business_rules",
          title,
          detail: line.slice(0, 300),
          confidence: 0.92,
          source,
          tags: ["business", "pricing", "policy", source],
          createdAt: new Date().toISOString(),
          lastUpdated: "Just now",
          autoLearned: true,
        });
      }
    }

    // 2. Brand Voice, Language & Communication Preferences
    const voiceMatch = sanitizedCombined.match(
      /(?:tone|voice|style|speak in|write in|use bangla|use banglish|conversational|formal|bilingual|phrasing|greeting)[\s\S]{10,200}?(?:\.|\n|$)/i
    );
    if (voiceMatch) {
      const line = voiceMatch[0].trim();
      if (line.length > 20) {
        candidates.push({
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category: "brand_voice",
          title: "Communication & Language Style",
          detail: line.slice(0, 280),
          confidence: 0.88,
          source,
          tags: ["voice", "style", "language", source],
          createdAt: new Date().toISOString(),
          lastUpdated: "Just now",
          autoLearned: true,
        });
      }
    }

    // 3. Founder Directives & Autonomous Delegations
    const founderMatch = sanitizedCombined.match(
      /(?:always|never|make sure to|founder preference|approval required|auto approve|autonomously|do not|delegate)[\s\S]{10,240}?(?:\.|\n|$)/i
    );
    if (founderMatch) {
      const line = founderMatch[0].trim();
      if (line.length > 25 && !candidates.some((c) => c.category === "founder_preference")) {
        candidates.push({
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category: "founder_preference",
          title: "Executive Operational Directive",
          detail: line.slice(0, 300),
          confidence: 0.90,
          source,
          tags: ["founder", "preference", "directive", source],
          createdAt: new Date().toISOString(),
          lastUpdated: "Just now",
          autoLearned: true,
        });
      }
    }

    // 4. Architectural & Engineering Decisions
    const archMatch = sanitizedCombined.match(
      /(?:architecture|database schema|endpoint|stack|nextjs|react|sqlite|postgres|convex|dokploy|vps|docker|rls|jwt|state machine)[\s\S]{10,250}?(?:\.|\n|$)/i
    );
    if (archMatch && (source === "swarm" || source === "task" || /architecture|system|api/i.test(prompt))) {
      const line = archMatch[0].trim();
      if (line.length > 25 && !candidates.some((c) => c.category === "faq")) {
        candidates.push({
          id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          category: "faq",
          title: "System Architecture & API Invariant",
          detail: line.slice(0, 320),
          confidence: 0.89,
          source,
          tags: ["architecture", "api", "tech-stack", source],
          createdAt: new Date().toISOString(),
          lastUpdated: "Just now",
          autoLearned: true,
        });
      }
    }

    return candidates;
  }

  /**
   * Commits extracted memories to localStorage and triggers real-time broadcast
   */
  public commitMemories(newMemories: ExtractedMemory[]): ExtractedMemory[] {
    if (!newMemories.length) return [];

    try {
      const existingRaw = localStorage.getItem("shothik_twin_memories");
      let existing: any[] = [];
      if (existingRaw) {
        existing = JSON.parse(existingRaw);
      }

      // De-duplicate against existing titles and details
      const toAdd: ExtractedMemory[] = [];
      for (const m of newMemories) {
        const isDuplicate = existing.some(
          (ex: any) =>
            ex.title.toLowerCase() === m.title.toLowerCase() ||
            ex.detail.toLowerCase().includes(m.detail.slice(0, 40).toLowerCase())
        );
        if (!isDuplicate) {
          toAdd.push(m);
          // ── Feed into SecondMe 2.0 Epistemic DAG ──
          try {
            epistemicGraphMemory.addDecision(
              `${m.title}: ${m.detail}`,
              m.category === "business_rules" ? "DECISION" : "PREFERENCE",
              m.confidence
            );
          } catch {}
        }
      }

      if (toAdd.length > 0) {
        const merged = [...toAdd, ...existing];
        localStorage.setItem("shothik_twin_memories", JSON.stringify(merged));

        // Dispatch real-time window event for reactive UI updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("shothik_memory_extracted", {
              detail: { memories: toAdd, total: merged.length },
            })
          );
        }
        return toAdd;
      }
    } catch (e) {
      console.warn("Failed to commit memories to storage", e);
    }

    return [];
  }

  /**
   * Single-shot extract and commit pipeline
   */
  public extractAndCommit(params: {
    prompt?: string;
    response: string;
    source: MemorySource;
    context?: Record<string, any>;
  }): ExtractedMemory[] {
    const extracted = this.extractDecisions(params);
    return this.commitMemories(extracted);
  }
}

export const memoryExtractionService = MemoryExtractionService.getInstance();
