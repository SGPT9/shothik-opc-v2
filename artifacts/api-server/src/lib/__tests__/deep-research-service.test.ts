import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepResearchService } from "../deep-research-service";
import { WigoloWebIntelligenceService } from "../wigolo-service";

describe("DeepResearchService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("synthesizes research findings with academic citations in English", async () => {
    vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockResolvedValue({
      query: "Dhaka Metro Rail updates",
      totalFound: 2,
      cached: false,
      engineUsed: "searxng-rank-fusion",
      executedAt: new Date().toISOString(),
      results: [
        {
          title: "MRT Line 6 Extension Progress",
          url: "https://dhakametro.gov.bd/mrt6",
          excerpt: "MRT Line-6 extension to Kamalapur progresses past 85% completion mark.",
          engine: "google",
          citationId: "cite-1",
          evidenceScore: 1.0,
        },
        {
          title: "Commuter Passenger Growth",
          url: "https://thedailystar.net/metro-rail",
          excerpt: "Daily ridership exceeds 300,000 passengers with expanded night schedules.",
          engine: "bing",
          citationId: "cite-2",
          evidenceScore: 0.9,
        },
      ],
    });

    const result = await DeepResearchService.synthesizeResearch({
      query: "Dhaka Metro Rail updates",
      maxSources: 2,
    });

    expect(result.success).toBe(true);
    expect(result.citations.length).toBe(2);
    expect(result.citations[0].id).toBe(1);
    expect(result.citations[0].domain).toBe("dhakametro.gov.bd");
    expect(result.markdownSynthesis).toContain("### 📚 Deep Research Dossier");
    expect(result.markdownSynthesis).toContain("[^1]");
    expect(result.markdownSynthesis).toContain("[^2]");
    expect(result.markdownSynthesis).toContain("https://dhakametro.gov.bd/mrt6");
    expect(result.keyInsights.length).toBeGreaterThan(0);
  });

  it("synthesizes Bengali research queries appropriately", async () => {
    vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockResolvedValue({
      query: "বাংলাদেশের অর্থনীতি",
      totalFound: 1,
      cached: true,
      engineUsed: "duckduckgo",
      executedAt: new Date().toISOString(),
      results: [
        {
          title: "বাংলাদেশ অর্থনৈতিক সমীক্ষা",
          url: "https://mof.gov.bd/survey",
          excerpt: "চলতি অর্থবছরে রপ্তানি আয় উল্লেখযোগ্য হারে বৃদ্ধি পেয়েছে।",
          engine: "duckduckgo",
          citationId: "cite-bn-1",
          evidenceScore: 0.95,
        },
      ],
    });

    const result = await DeepResearchService.synthesizeResearch({
      query: "বাংলাদেশের অর্থনীতি",
      language: "bn",
    });

    expect(result.success).toBe(true);
    expect(result.language).toBe("bn");
    expect(result.markdownSynthesis).toContain("গবেষণা পর্যালোচনা");
    expect(result.markdownSynthesis).toContain("[^1]");
    expect(result.markdownSynthesis).toContain("mof.gov.bd");
  });
});
