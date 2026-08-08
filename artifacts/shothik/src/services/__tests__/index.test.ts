import { describe, expect, it } from "vitest";
import * as services from "../index";

describe("Services Catalog", () => {
  it("exports all core Shothik AI service modules", () => {
    expect(services.checkAiContent).toBeDefined();
    expect(services.checkPlagiarism).toBeDefined();
    expect(services.paraphraseText).toBeDefined();
    expect(services.checkGrammar).toBeDefined();
    expect(services.summarizeText).toBeDefined();
    expect(services.translateText).toBeDefined();
    expect(services.createPresentationServer).toBeDefined();
    expect(services.dispatchTwinResearch).toBeDefined();
  });
});
