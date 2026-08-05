import { describe, it, expect } from "vitest";
import { GortexKnowledgeVaultService } from "../gortex-service";

describe("GortexKnowledgeVaultService Multi-Repo AST Graph & Book-to-Skill Hybrid", () => {
  it("should index multi-repo symbols and return 50x token savings metrics", async () => {
    const result = await GortexKnowledgeVaultService.indexKnowledgeVault({
      workspaceId: "ws_gortex_test_1",
      repoPaths: ["c:\\Users\\USER\\hermes\\shothik-web-mirror-v2", "c:\\Users\\USER\\hermes\\external-repos\\papermark"],
      skillsPaths: [".agents/skills"],
    });

    expect(result.workspaceId).toBe("ws_gortex_test_1");
    expect(result.totalReposIndexed).toBe(2);
    expect(result.totalSymbolsFound).toBeGreaterThan(0);
    expect(result.tokensSavedEstimatePercent).toBeGreaterThanOrEqual(90);
  });

  it("should distill PDF books into executable Agent Skills with 51x token reduction", async () => {
    const result = await GortexKnowledgeVaultService.distillBookToSkill({
      workspaceId: "ws_book_distill_1",
      sourceFilePath: "building-microservices-saas.pdf",
      bookTitle: "Building Microservices SaaS",
      skillSlug: "building-microservices-saas",
    });

    expect(result.skillSlug).toBe("building-microservices-saas");
    expect(result.filesGenerated.length).toBe(6);
    expect(result.tokenEfficiencyMultiplier).toContain("51x");
  });
});
