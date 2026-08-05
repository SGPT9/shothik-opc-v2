import { describe, it, expect } from "vitest";
import { AiGrowthRegistryService, AI_GROWTH_OS_REGISTRY } from "../ai-growth-registry";

describe("AiGrowthRegistryService Open-Source Tool Ecosystem", () => {
  it("should contain 37 curated open-source tools across 10 hubs", () => {
    expect(AI_GROWTH_OS_REGISTRY.length).toBe(37);
  });

  it("should search tools by category or keyword", () => {
    const whatsappTools = AiGrowthRegistryService.searchToolsByCategory("whatsapp");
    expect(whatsappTools.length).toBeGreaterThanOrEqual(3);
    expect(whatsappTools.map((t) => t.name)).toContain("Evolution API");

    const banglaNlpTools = AiGrowthRegistryService.searchToolsByCategory("bangla");
    expect(banglaNlpTools.length).toBeGreaterThanOrEqual(1);
    expect(banglaNlpTools.map((t) => t.name)).toContain("BNLTK");
  });

  it("should seed the registry into InsForge RAG memory vault", async () => {
    const result = await AiGrowthRegistryService.seedAiGrowthRegistry("twin_test_registry");
    expect(result.indexedCount).toBe(37);
  });
});
