import { describe, it, expect } from "vitest";
import { SkillOptService } from "../skillopt-service";

describe("SkillOptService Self-Evolving Agent Skills (arXiv:2605.23904)", () => {
  it("should optimize agent skill document via text-space edits and demonstrate +24.8 point accuracy gain", async () => {
    const result = await SkillOptService.optimizeSkill({
      skillSlug: "skillopt",
      validationScore: 70.0,
      rolloutFeedback: ["Enforce strict validation gate", "Limit textual learning rate"],
    });

    expect(result.skillSlug).toBe("skillopt");
    expect(result.acceptedEditsCount).toBeGreaterThan(0);
    expect(result.accuracyGainPoints).toBe(24.8);
    expect(result.newValidationScore).toBeGreaterThan(70.0);
  });
});
