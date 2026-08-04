import { describe, it, expect } from "vitest";
import { SelfHealingRuntime } from "../self-healing-runtime";

describe("SelfHealingRuntime Closed-Loop Repair Engine", () => {
  it("should attempt closed-loop repair and return a high-quality replacement output", async () => {
    const result = await SelfHealingRuntime.attemptClosedLoopRepair({
      runId: "run_heal_test_123",
      workspaceId: "ws_heal_test_123",
      failedPersonaKey: "github-fixer",
      errorMessage: "Syntax error in generated backend API handler",
      failedOutput: "const x = ",
    });

    expect(result.success).toBe(true);
    expect(result.personaKey).toBe("github-fixer");
    expect(result.repairedOutput).toBeDefined();
    expect(result.repairedOutput.length).toBeGreaterThan(20);
    expect(result.patchApplied).toBe(true);
  });
});
