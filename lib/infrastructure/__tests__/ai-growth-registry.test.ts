import { describe, expect, it, vi } from "vitest";
import {
  AI_GROWTH_OS_REGISTRY,
  AiGrowthRegistryService,
} from "@/lib/infrastructure/ai-growth-registry";

vi.mock("@/lib/insforge/rag-memory", () => ({
  InsForgeTwinRagMemory: {
    saveMemoryChunk: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe("AI Growth OS Tool Registry & RAG Ingestion Service", () => {
  it("contains curated open-source tools across core operational hubs", () => {
    expect(AI_GROWTH_OS_REGISTRY.length).toBeGreaterThanOrEqual(35);

    const categories = new Set(AI_GROWTH_OS_REGISTRY.map((t) => t.category));
    expect(categories.has("Core AI & Agents")).toBe(true);
    expect(categories.has("South Asian NLP")).toBe(true);
    expect(categories.has("WhatsApp & Social")).toBe(true);
    expect(categories.has("E-commerce")).toBe(true);
    expect(categories.has("Knowledge Base/RAG")).toBe(true);
  });

  it("searches tools by category, tool name, or use case keyword", () => {
    const nlpTools = AiGrowthRegistryService.searchToolsByCategory("South Asian NLP");
    expect(nlpTools.length).toBeGreaterThan(0);
    expect(nlpTools.some((t) => t.name.includes("IndicTrans2"))).toBe(true);

    const whatsappTools = AiGrowthRegistryService.searchToolsByCategory("whatsapp");
    expect(whatsappTools.length).toBeGreaterThan(0);

    const crawlTools = AiGrowthRegistryService.searchToolsByCategory("crawling");
    expect(crawlTools.length).toBeGreaterThan(0);
  });

  it("seeds AI Growth OS tools into InsForge Twin RAG Memory Vault", async () => {
    const seedResult = await AiGrowthRegistryService.seedAiGrowthRegistry("twin_test_sys");
    expect(seedResult.indexedCount).toBe(AI_GROWTH_OS_REGISTRY.length);
  });
});
