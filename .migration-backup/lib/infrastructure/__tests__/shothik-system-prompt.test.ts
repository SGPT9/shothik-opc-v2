import { describe, it, expect } from "vitest";
import { ShothikSystemPromptEngine } from "../shothik-system-prompt";

describe("ShothikSystemPromptEngine System Prompt v3.0", () => {
  it("should generate production system prompt containing Wigolo, Gortex, DiffusionGemma, and Artifact Canvas instructions", () => {
    const prompt = ShothikSystemPromptEngine.generateSystemPrompt({
      userName: "Ahsan",
      enableWigoloWebSearch: true,
      enableGortexCodeGraph: true,
      enableDiffusionGemma: true,
      enableArtifactCanvas: true,
    });

    expect(prompt).toContain("You are Shothik AI");
    expect(prompt).toContain("Wigolo Web Intelligence");
    expect(prompt).toContain("Gortex AST Code Graph");
    expect(prompt).toContain("DiffusionGemma Ultra-Fast Inference Engine");
    expect(prompt).toContain("Shothik Artifact Canvas");
    expect(prompt).toContain("Ahsan");
  });
});
