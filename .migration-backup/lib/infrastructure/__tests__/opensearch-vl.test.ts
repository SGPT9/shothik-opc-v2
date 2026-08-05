import { describe, it, expect } from "vitest";
import { OpenSearchVLService } from "../opensearch-vl-service";

describe("OpenSearchVLService Multimodal Vision-Language Search Engine", () => {
  it("should execute vision-language deep research search with image grounding and evidence retrieval", async () => {
    const result = await OpenSearchVLService.searchVisionLanguage({
      query: "Inspect UI screenshot and retrieve design system specs",
      imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    });

    expect(result.answer).toContain("OpenSearch-VL");
    expect(result.visualGroundingRegions.length).toBeGreaterThan(0);
    expect(result.evidenceSources.length).toBeGreaterThan(0);
    expect(result.evidenceSources[0].score).toBeGreaterThan(0.9);
  });
});
