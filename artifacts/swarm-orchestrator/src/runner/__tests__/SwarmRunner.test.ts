import { describe, it, expect } from "vitest";
import { SwarmRunner } from "../SwarmRunner.js";

describe("SwarmRunner", () => {
  it("executes an autonomous goal across all 4 specialized sub-agents", async () => {
    const runner = new SwarmRunner();

    const goal = "Audit F-Commerce checkout flow and verify bKash 1-click booking card";
    const summary = await runner.runGoal(goal, 50);

    expect(summary.goal).toBe(goal);
    expect(summary.totalNodes).toBe(4);
    expect(summary.completedNodes).toBe(4);
    expect(summary.allPassed).toBe(true);

    // Verify sub-agent outputs
    expect(summary.results["node-1-research"]).toBeDefined();
    expect(summary.results["node-1-research"].epistemicStamp.status).toBe("consensus");

    expect(summary.results["node-2-backend"]).toBeDefined();
    expect(summary.results["node-2-backend"].action).toBe("api_route_implemented");

    expect(summary.results["node-3-frontend"]).toBeDefined();
    expect(summary.results["node-3-frontend"].principles).toContain("Ask-First");

    expect(summary.results["node-4-qa"]).toBeDefined();
    expect(summary.results["node-4-qa"].action).toBe("adversarial_security_audit_passed");
  });
});
