import { describe, it, expect, beforeEach } from "vitest";
import { langfuseTracer } from "../langfuse-tracer";

describe("LangfuseTracer", () => {
  beforeEach(() => {
    langfuseTracer.clearTraces();
  });

  it("buffers generation traces in memory when Langfuse is offline/local", () => {
    const trace = langfuseTracer.traceGeneration({
      name: "humanizer-pass-1",
      model: "bilingual-evasion-v5",
      input: { text: "Furthermore..." },
      output: { humanized: "Also..." },
      latencyMs: 45,
      usage: { promptTokens: 10, completionTokens: 12, totalTokens: 22 },
    });

    expect(trace.id).toBeDefined();
    expect(trace.type).toBe("generation");
    expect(trace.latencyMs).toBe(45);

    const recent = langfuseTracer.getRecentTraces();
    expect(recent.length).toBe(1);
    expect(recent[0].name).toBe("humanizer-pass-1");
  });

  it("buffers span traces for web searches and queue jobs", () => {
    langfuseTracer.traceSpan({
      name: "wigolo-rank-fusion",
      input: { query: "Dhaka news" },
      output: { resultCount: 5 },
      durationMs: 82,
    });

    const recent = langfuseTracer.getRecentTraces();
    expect(recent.length).toBe(1);
    expect(recent[0].type).toBe("span");
    expect(recent[0].name).toBe("wigolo-rank-fusion");
  });
});
