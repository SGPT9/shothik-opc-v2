import { describe, expect, it } from "vitest";
import { WigoloMCPEngine, WigoloTransport } from "../WigoloMCP";
import { SecondMeCognitiveMemory } from "@/lib/memory/second-me-cognitive-memory";

describe("Wigolo MCP Web Intelligence Engine", () => {
  const mockTransport: WigoloTransport = {
    async fetchSearch(query) {
      return [
        {
          title: `Fintech Regulation in Bangladesh (${query})`,
          url: "https://fintech.gov.bd/circulars/2024-05",
          snippet: "Bangladesh Bank issues updated circular on digital credit disbursements.",
          publishedDate: "2024-05-15T00:00:00Z",
          sourceDomain: "fintech.gov.bd",
        },
      ];
    },
    async fetchScrape(url) {
      return {
        url,
        title: "Digital Credit Reserve Requirements 2024",
        markdownContent: `# Digital Credit Reserve
All licensed micro-merchants and digital banking units must maintain 15 percent liquid reserve.

# Compliance Date
Full compliance must be achieved by Q4 2024.`,
        extractedAt: "2024-05-15T00:00:00Z",
        wordCount: 35,
      };
    },
  };

  it("searches real-time intelligence using Wigolo MCP protocol", async () => {
    const engine = new WigoloMCPEngine(mockTransport);
    const results = await engine.search("Bangladesh Bank digital credit", 1);

    expect(results).toHaveLength(1);
    expect(results[0].title).toContain("Fintech Regulation in Bangladesh");
    expect(results[0].sourceDomain).toBe("fintech.gov.bd");
  });

  it("scrapes clean markdown content from targeted URLs", async () => {
    const engine = new WigoloMCPEngine(mockTransport);
    const page = await engine.scrape("https://fintech.gov.bd/circulars/2024-05");

    expect(page.title).toBe("Digital Credit Reserve Requirements 2024");
    expect(page.markdownContent).toContain("# Digital Credit Reserve");
  });

  it("continuously ingests scraped web pages directly into Cognitive RAG & Second Me memory", async () => {
    const engine = new WigoloMCPEngine(mockTransport);
    const memory = new SecondMeCognitiveMemory("test-session");

    const result = await engine.ingestWebPageToCognitiveRAG(
      "https://fintech.gov.bd/circulars/2024-05",
      memory
    );

    expect(result.chunksCreated).toBeGreaterThan(0);
    expect(result.docSource.epistemicTier).toBe("tier_4_web");
    expect(result.docSource.title).toBe("Digital Credit Reserve Requirements 2024");

    // Verify it is immediately searchable in Second Me Semantic Memory
    const recalledNodes = memory.searchSemanticMemory("liquid reserve micro-merchants", 1);
    expect(recalledNodes.length).toBe(1);
    expect(recalledNodes[0].documentTitle).toBe("Digital Credit Reserve Requirements 2024");
  });
});
