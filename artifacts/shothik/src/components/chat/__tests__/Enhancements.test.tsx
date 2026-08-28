import React from "react";
import { describe, expect, it, vi } from "vitest";
import { FLEET_AGENTS } from "@/components/agents/ChatAgentPage";
import { NeedleToolRegistry } from "../../../../../artifacts/api-server/src/lib/needle-tool-registry";
import { needle2 } from "@/lib/ai/needle-dispatcher";

describe("Frontend Enhancements (ChatGPT + Perplexity + ECC Parity)", () => {
  it("includes all 8 ECC specialized subagent personas in FLEET_AGENTS", () => {
    const agentIds = FLEET_AGENTS.map((a) => a.id);
    expect(agentIds).toContain("core");
    expect(agentIds).toContain("planner");
    expect(agentIds).toContain("architect");
    expect(agentIds).toContain("security");
    expect(agentIds).toContain("tdd");
    expect(agentIds).toContain("analyst");
    expect(agentIds).toContain("business");
    expect(agentIds).toContain("writer");
    expect(FLEET_AGENTS.length).toBe(8);
  });

  it("routes implementation planning query to ECC Planner skill in NeedleToolRegistry", () => {
    const result = NeedleToolRegistry.matchAndExecute("Show me the implementation plan for authentication");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe("plan_implementation");
    expect(result?.output).toContain("Phased Implementation Plan (ECC Planner Protocol)");
    expect(result?.artifact?.type).toBe("code");
  });

  it("routes security audit query to ECC Security Reviewer skill in NeedleToolRegistry", () => {
    const result = NeedleToolRegistry.matchAndExecute("Run security review and check vulnerabilities");
    expect(result).not.toBeNull();
    expect(result?.toolName).toBe("security_audit");
    expect(result?.output).toContain("ECC 8-Point Security Audit Report");
    expect(result?.output).toContain("SQL Injection Prevention");
  });

  it("executes fast offline exact arithmetic with Needle 2 edge engine", () => {
    const mathResult = needle2.calculateExactMath("(50000 * 0.15) - 1200");
    expect(mathResult).toBe(6300);
  });

  it("normalizes Banglish phrases with Needle 2 edge normalizer", () => {
    const normalized = needle2.normalizeBanglish("amar order dekhe bolo kivabe koto taka lagbe");
    expect(normalized).toContain("আমার");
    expect(normalized).toContain("অর্ডার");
    expect(normalized).toContain("দেখে");
    expect(normalized).toContain("বলো");
    expect(normalized).toContain("কীভাবে");
    expect(normalized).toContain("কত");
    expect(normalized).toContain("টাকা");
  });
});
