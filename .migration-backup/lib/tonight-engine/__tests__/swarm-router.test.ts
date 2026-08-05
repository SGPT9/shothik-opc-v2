import { describe, it, expect } from "vitest";
import { SwarmRouter, ConsensusEngine } from "../swarm-router";

describe("Ruflo SwarmRouter & ConsensusEngine", () => {
  it("should select hierarchical topology for code/architecture tasks", () => {
    const res = SwarmRouter.selectTopologyAndPlan("Build a scalable microservices architecture with SQL databases", "standard");
    expect(res.topology).toBe("hierarchical");
    expect(res.plan.some((p) => p.personaKey === "github-fixer")).toBe(true);
  });

  it("should select coordinator topology for sales and marketing tasks", () => {
    const res = SwarmRouter.selectTopologyAndPlan("Find B2B SaaS sales leads and write outreach email cadences", "standard");
    expect(res.topology).toBe("coordinator");
    expect(res.plan.some((p) => p.personaKey === "sales-outreach")).toBe(true);
  });

  it("should select mesh topology for UI/UX design tasks", () => {
    const res = SwarmRouter.selectTopologyAndPlan("Design a modern responsive landing page with Tailwind CSS", "quick");
    expect(res.topology).toBe("mesh");
    expect(res.plan.some((p) => p.personaKey === "ui-designer")).toBe(true);
  });

  it("should verify consensus score for sub-agent outputs", () => {
    const validOutputs = [
      { personaKey: "researcher", output: "Substantial research findings content here with data points." },
      { personaKey: "content-creator", output: "Complete draft copywriting output ready for publication." },
    ];
    const res = ConsensusEngine.verifyConsensus(validOutputs);
    expect(res.passed).toBe(true);
    expect(res.score).toBe(100);

    const emptyOutputs = [
      { personaKey: "researcher", output: "" },
    ];
    const resEmpty = ConsensusEngine.verifyConsensus(emptyOutputs);
    expect(resEmpty.passed).toBe(false);
    expect(resEmpty.score).toBe(0);
  });
});
