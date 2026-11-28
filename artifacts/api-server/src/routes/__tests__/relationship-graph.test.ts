import { describe, it, expect } from "vitest";
import {
  calculateRelationshipDelta,
  generateRelationshipGraphData
} from "../relationship-graph.js";

describe("Dynamic Character Relationship & Social Topology Graph", () => {
  it("calculates trust degradation and rivalry spike on betrayal cues", () => {
    const betrayalText = "তুমি আমার সাথে প্রতারণা করেছ! পুলিশকে সব জানিয়েছ বিশ্বাসঘাতক!";
    const delta = calculateRelationshipDelta(betrayalText, "char_a", "char_b");

    expect(delta.deltaTrust).toBeLessThan(0);
    expect(delta.deltaRivalry).toBeGreaterThan(0);
    expect(delta.status).toBe("ruptured");
  });

  it("calculates trust increase and lower rivalry on loyalty cues", () => {
    const loyaltyText = "আমি তোমাকে বিশ্বাস করি বাদল। আমরা একসাথে এর সমাধান করব।";
    const delta = calculateRelationshipDelta(loyaltyText, "char_a", "char_b");

    expect(delta.deltaTrust).toBeGreaterThan(0);
    expect(delta.deltaRivalry).toBeLessThan(0);
    expect(delta.status).toBe("evolving");
  });

  it("generates complete relationship network with nodes, weighted edges, and timeline snapshots", () => {
    const data = generateRelationshipGraphData("proj_rel_test");

    expect(data.nodes.length).toBeGreaterThanOrEqual(4);
    expect(data.edges.length).toBeGreaterThanOrEqual(5);
    expect(data.snapshots.length).toBe(3);
    expect(data.statistics.totalCharacters).toBe(data.nodes.length);
    expect(data.statistics.highestRivalryPair).toBeDefined();
    expect(data.statistics.highestTrustPair).toBeDefined();
  });

  it("verifies bidirectional or directed edge topology consistency", () => {
    const data = generateRelationshipGraphData("proj_rel_test");
    const nodeIds = new Set(data.nodes.map(n => n.id));

    for (const edge of data.edges) {
      expect(nodeIds.has(edge.sourceCharId)).toBe(true);
      expect(nodeIds.has(edge.targetCharId)).toBe(true);
      expect(edge.trustScore).toBeGreaterThanOrEqual(-100);
      expect(edge.trustScore).toBeLessThanOrEqual(100);
      expect(edge.rivalryScore).toBeGreaterThanOrEqual(0);
      expect(edge.rivalryScore).toBeLessThanOrEqual(100);
    }
  });
});
