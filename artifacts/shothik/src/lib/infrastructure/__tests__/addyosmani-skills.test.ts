import { describe, it, expect } from "vitest";
import { AddyOsmaniSkillsService } from "../addyosmani-skills-service";

describe("AddyOsmaniSkillsService Lifecycle Slash Commands & Production Skills", () => {
  it("should map /spec, /plan, /build, /test, /review, /webperf, /code-simplify, /ship slash commands to correct stages and skills", async () => {
    const specResult = await AddyOsmaniSkillsService.executeLifecycleCommand({ command: "/spec" });
    expect(specResult.lifecycleStage).toBe("DEFINE");
    expect(specResult.activatedSkills).toContain("requirements-spec");

    const webperfResult = await AddyOsmaniSkillsService.executeLifecycleCommand({ command: "/webperf" });
    expect(webperfResult.lifecycleStage).toBe("VERIFY");
    expect(webperfResult.activatedSkills).toContain("webperf-optimization");

    const shipResult = await AddyOsmaniSkillsService.executeLifecycleCommand({ command: "/ship" });
    expect(shipResult.lifecycleStage).toBe("SHIP");
    expect(shipResult.activatedSkills).toContain("production-deployment-gate");
  });
});
