import { describe, expect, it } from "vitest";
import { extractPlanFromPayload, normalizeStreamEvent } from "./streaming";

describe("plan_generated normalization", () => {
  it("extracts a plan from the documented { intent, steps } shape", () => {
    const plan = extractPlanFromPayload({
      intent: "research",
      steps: ["Search the web", { label: "Summarize findings" }],
    });
    expect(plan).toEqual({
      intent: "research",
      steps: ["Search the web", "Summarize findings"],
      workflow: undefined,
    });
  });

  it("synthesizes steps from the orchestrator { workflow, execution } shape", () => {
    const plan = extractPlanFromPayload({
      workflow: "spec",
      execution: {
        workflow: "spec",
        lane: "lane_1",
        intent: { intentClass: "retrieve" },
        retrievalPlan: { shouldRetrieve: true },
      },
    });
    expect(plan?.intent).toBe("retrieve");
    expect(plan?.workflow).toBe("spec");
    expect(plan?.steps.length).toBeGreaterThan(0);
  });

  it("returns null for empty payloads", () => {
    expect(extractPlanFromPayload({})).toBeNull();
    expect(extractPlanFromPayload(null)).toBeNull();
  });

  it("emits a plan event for hermes plan_generated envelopes", () => {
    const events = normalizeStreamEvent({
      __hermes: true,
      eventType: "plan_generated",
      payload: { intent: "answer", steps: ["Compose the response"] },
    });
    expect(events).toEqual([
      {
        kind: "plan",
        plan: { intent: "answer", steps: ["Compose the response"], workflow: undefined },
      },
    ]);
  });

  it("treats session_resumed like a connecting status", () => {
    const events = normalizeStreamEvent({
      __hermes: true,
      eventType: "session_resumed",
      payload: {},
    });
    expect(events).toEqual([{ kind: "status", stage: "connecting" }]);
  });
});
