import { describe, it, expect, beforeEach } from "vitest";
import { EpistemicGraphMemory } from "../EpistemicGraphMemory";

describe("SecondMe 2.0: Epistemic Graph Memory Engine", () => {
  let graph: EpistemicGraphMemory;

  beforeEach(() => {
    graph = new EpistemicGraphMemory("test_epistemic_graph");
    graph.clear();
  });

  it("stores a single active decision node correctly", () => {
    const { newNode } = graph.addDecision("We strictly use Steadfast Courier for 64-district delivery", "DECISION");
    expect(newNode.active).toBe(true);
    expect(newNode.topic).toBe("logistics_courier");

    const activeNodes = graph.getActiveNodes();
    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].content).toContain("Steadfast Courier");
  });

  it("automatically creates a SUPERSEDES edge and deactivates conflicting older rule", () => {
    // 1. Initial decision
    const first = graph.addDecision("We only deliver via Pathao in Dhaka Metro", "DECISION");
    expect(first.newNode.active).toBe(true);

    // 2. Pivot decision
    const second = graph.addDecision("We switched to Steadfast Courier nationwide for automated COD payouts", "DECISION");

    expect(second.newNode.active).toBe(true);
    expect(second.supersededNode).toBeDefined();
    expect(second.supersededNode?.id).toBe(first.newNode.id);
    expect(second.supersededNode?.active).toBe(false);

    // Verify audit lineage
    const audit = graph.getAuditReport();
    expect(audit.totalNodes).toBe(2);
    expect(audit.activeNodes).toBe(1);
    expect(audit.supersededNodes).toBe(1);
    expect(audit.totalEdges).toBe(1);
    expect(audit.edges[0].relation).toBe("SUPERSEDES");
    expect(audit.edges[0].sourceId).toBe(second.newNode.id);
    expect(audit.edges[0].targetId).toBe(first.newNode.id);

    // Verify context injection only outputs authoritative active node
    const context = graph.getActiveContext();
    expect(context).toContain("Steadfast Courier");
    expect(context).not.toContain("Pathao");
  });
});
