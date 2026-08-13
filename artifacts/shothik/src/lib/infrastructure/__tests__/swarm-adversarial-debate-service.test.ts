import { describe, it, expect } from "vitest";
import { SwarmAdversarialDebateService } from "../swarm-adversarial-debate-service";

describe("SwarmAdversarialDebateService", () => {
  it("should execute a 3-agent adversarial debate with Bull, Bear, and Consensus Chair", () => {
    const res = SwarmAdversarialDebateService.runSwarmDebate("Polsia OPC F-Commerce Rollout in Dhaka");

    expect(res.debateId).toContain("swarm_deb_");
    expect(res.bullPerspective.agentName).toContain("Bull Growth Lead");
    expect(res.bearPerspective.agentName).toContain("Bear Risk Auditor");
    expect(res.consensusChair.agentName).toContain("Consensus Chair");

    expect(res.bullPerspective.arguments.length).toBeGreaterThan(0);
    expect(res.bearPerspective.arguments.length).toBeGreaterThan(0);
    expect(res.consensusScore).toBeGreaterThan(50);
    expect(res.finalDecision).toBe("HIGH_CONVICTION_GO");
  });
});
