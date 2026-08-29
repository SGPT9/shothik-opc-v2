import { describe, expect, it } from "vitest";
import { SecondMeCognitiveMemory } from "../second-me-cognitive-memory";

describe("Second Me Tri-Tier Cognitive Memory Fabric", () => {
  it("manages working memory state, context chips and uncommitted token tracking", () => {
    const memory = new SecondMeCognitiveMemory("session-123");

    memory.updateWorkingDraft("Analyze financial runway for 2026", "sheet");
    memory.addContextChip("chip-1", "Repo: hermes-core");
    memory.addContextChip("chip-2", "Doc: Financial_Model.xlsx");

    const state = memory.getWorkingMemory();
    expect(state.sessionId).toBe("session-123");
    expect(state.activeDraft).toBe("Analyze financial runway for 2026");
    expect(state.activeArtifactTab).toBe("sheet");
    expect(state.contextChips).toHaveLength(2);
    expect(state.uncommittedTokens).toBeGreaterThan(0);

    memory.removeContextChip("chip-1");
    expect(memory.getWorkingMemory().contextChips).toHaveLength(1);
  });

  it("records and recalls episodic memory across user decisions", () => {
    const memory = new SecondMeCognitiveMemory();

    memory.recordEpisodicDecision({
      userId: "user-42",
      category: "architectural_decision",
      summary: "Adopt InsForge Postgres RLS",
      details: "Use InsForge Postgres for multi-tenant isolation and vector embeddings",
      confidence: 0.98,
      tags: ["postgres", "rls", "database"],
    });

    memory.recordEpisodicDecision({
      userId: "user-42",
      category: "user_preference",
      summary: "Prefer Tailwind CSS v4 syntax",
      details: "Always use standard Tailwind classes and dark mode tokens",
      confidence: 0.95,
      tags: ["css", "styling"],
    });

    const recalled = memory.recallEpisodicMemories("postgres database multi-tenant");
    expect(recalled.length).toBeGreaterThan(0);
    expect(recalled[0].summary).toBe("Adopt InsForge Postgres RLS");
  });

  it("strictly enforces zero secret persistence by sanitizing tokens", () => {
    const memory = new SecondMeCognitiveMemory();

    const record = memory.recordEpisodicDecision({
      userId: "user-42",
      category: "domain_knowledge",
      summary: "GitHub Token for repo hermes-core",
      details: "Configured with token ghp_123456789012345678901234567890123456",
      confidence: 1.0,
      tags: ["github"],
    });

    expect(record.details).not.toContain("ghp_123456789012345678901234567890123456");
    expect(record.details).toContain("••••••••");
  });

  it("calibrates persona parameters and generates a unified cognitive context prompt", () => {
    const memory = new SecondMeCognitiveMemory();

    memory.calibratePersona({
      tone: "executive_strategic",
      conciseness: 0.90,
      preferredLanguage: "bn-BD",
    });

    memory.recordEpisodicDecision({
      userId: "user-42",
      category: "architectural_decision",
      summary: "Dual Voice Architecture",
      details: "Toolbar mic for STT dictation and Tools menu for Voice Orb",
      confidence: 0.99,
      tags: ["voice"],
    });

    const prompt = memory.generateCognitiveContextPrompt("voice dictation architecture");
    expect(prompt).toContain("Tone: executive_strategic");
    expect(prompt).toContain("Language: bn-BD");
    expect(prompt).toContain("Dual Voice Architecture");
  });

  it("boosts business rules and pricing traits for delivery/cost queries", () => {
    const memory = new SecondMeCognitiveMemory();

    memory.recordEpisodicDecision({
      userId: "user-42",
      category: "business_rules",
      summary: "Dhaka COD Delivery Fee",
      details: "Inside Dhaka COD delivery charge is 70 BDT",
      confidence: 0.95,
      tags: ["delivery", "pricing"],
    });

    memory.recordEpisodicDecision({
      userId: "user-42",
      category: "brand_voice",
      summary: "Conversational Phrasing",
      details: "Use conversational Bangla greetings",
      confidence: 0.90,
      tags: ["voice"],
    });

    const recalled = memory.recallEpisodicMemories("How much is courier delivery in Dhaka?");
    expect(recalled.length).toBeGreaterThan(0);
    expect(recalled[0].category).toBe("business_rules");
    expect(recalled[0].summary).toBe("Dhaka COD Delivery Fee");
  });

  it("performs vector cosine similarity search on semantic nodes", () => {
    const memory = new SecondMeCognitiveMemory();

    memory.indexSemanticNode({
      id: "node-1",
      documentTitle: "Pricing Strategy",
      sectionHeader: "MFS Commission",
      text: "bKash payment gateway charges 1.5% per successful settlement transaction.",
      embedding: [0.1, 0.9, 0.2],
      epistemicTier: "tier_1_official",
    });

    memory.indexSemanticNode({
      id: "node-2",
      documentTitle: "Server Architecture",
      sectionHeader: "Dokploy Containers",
      text: "Dokploy manages zero-downtime rolling container deployments.",
      embedding: [0.9, 0.1, 0.1],
      epistemicTier: "tier_2_internal",
    });

    // Query close to node-1 vector
    const results = memory.searchSemanticMemory("payment commission", 2, [0.15, 0.85, 0.25]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].documentTitle).toBe("Pricing Strategy");
  });
});
