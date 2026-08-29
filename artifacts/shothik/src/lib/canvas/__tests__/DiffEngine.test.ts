import { describe, it, expect } from "vitest";
import { DiffEngine, type DiffChunk } from "../DiffEngine";

describe("DiffEngine: Token-Level Myers LCS Diff", () => {
  it("identifies unchanged text correctly", () => {
    const text = "Bangladesh economy is expanding rapidly.";
    const chunks = DiffEngine.computeDiff(text, text);
    expect(chunks.length).toBe(1);
    expect(chunks[0].type).toBe("unchanged");
    expect(chunks[0].value).toBe(text);
  });

  it("computes word additions and removals accurately", () => {
    const original = "Steadfast delivers across Dhaka city.";
    const proposed = "Steadfast delivers across all 64 districts.";
    const chunks = DiffEngine.computeDiff(original, proposed);

    expect(chunks.some((c) => c.type === "removed" && c.value.includes("Dhaka city"))).toBe(true);
    expect(chunks.some((c) => c.type === "added" && c.value.includes("all 64 districts"))).toBe(true);
  });

  it("applies accepted diff decisions properly", () => {
    const original = "Return rate was 24%.";
    const proposed = "Return rate was 14% via bKash.";
    const chunks = DiffEngine.computeDiff(original, proposed);

    // Accept all additions and accept all removals
    const acceptedChunks = chunks.map((c) => ({
      ...c,
      status: "accepted" as const,
    }));

    const resolved = DiffEngine.applyDecisions(acceptedChunks);
    expect(resolved).toBe(proposed);
  });

  it("preserves original text when AI proposed changes are rejected", () => {
    const original = "Average order value is 1,500 BDT.";
    const proposed = "Average order value is 2,500 BDT.";
    const chunks = DiffEngine.computeDiff(original, proposed);

    // Reject all additions and reject removals (keep original)
    const rejectedChunks = chunks.map((c) => ({
      ...c,
      status: "rejected" as const,
    }));

    const resolved = DiffEngine.applyDecisions(rejectedChunks);
    expect(resolved).toBe(original);
  });
});
