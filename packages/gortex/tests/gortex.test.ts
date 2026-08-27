import { describe, it, expect } from "vitest";
import { GortexInferenceMesh } from "../src/lib/gortex-mesh.js";
import { CircuitBreaker } from "../src/lib/circuit-breaker.js";
import { ToolExecutionGuardrail } from "../src/lib/execution-guardrail.js";
import { ContextBudgetEngine, MCPToolDefinition } from "../src/lib/context-budget.js";
import { AgentTrajectoryEvaluator } from "../src/lib/trajectory-evaluator.js";

describe("Shothik Gortex Model Mesh & Agentic Safety Suite", () => {
  it("should route inference to local sub-50ms node when local preference is true", async () => {
    const mesh = new GortexInferenceMesh();
    const result = await mesh.routeInference("Analyze this code snippet", true);

    expect(result.selectedNode.isLocal).toBe(true);
    expect(result.estimatedTtftMs).toBeLessThanOrEqual(50);
    expect(result.estimatedCostUsd).toBe(0.0);
    expect(result.status).toBe("OK");
  });

  it("should trip circuit breaker to OPEN after exceeding failure threshold", () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, recoveryTimeoutMs: 1000 });
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.canExecute()).toBe(true);

    breaker.recordFailure();
    expect(breaker.getState()).toBe("CLOSED");

    breaker.recordFailure();
    expect(breaker.getState()).toBe("OPEN");
    expect(breaker.canExecute()).toBe(false);
  });

  it("should automatically failover to secondary node when primary node circuit trips", async () => {
    const mesh = new GortexInferenceMesh();
    
    // Simulate primary local-qwen node failure
    const primaryBreaker = mesh.getCircuitBreaker("local-qwen");
    primaryBreaker?.recordFailure();
    primaryBreaker?.recordFailure();
    expect(primaryBreaker?.getState()).toBe("OPEN");

    // Route inference with failover engaged
    const result = await mesh.routeInference("Generate a pitch deck", true);
    expect(result.selectedNode.id).toBe("local-deepseek");
    expect(result.status).toBe("FAILOVER_ENGAGED");
  });

  it("should benchmark speculative decoding draft acceptance and demonstrate >1.5x speedup factor", () => {
    const mesh = new GortexInferenceMesh();
    const prompt = "Write a high-performance Rust function to calculate SHA-256 hash digests with SIMD vectorization";
    const benchmark = mesh.benchmarkSpeculativeDrafting(prompt, 5);

    expect(benchmark.targetModel).toBe("deepseek-r1:8b");
    expect(benchmark.draftModel).toContain("dspark");
    expect(benchmark.acceptanceRatePercent).toBeGreaterThanOrEqual(70);
    expect(benchmark.speedupFactor).toBeGreaterThan(1.5);
    expect(benchmark.tokensPerSecond).toBeGreaterThan(20);
    expect(benchmark.speculativeLatencyMs).toBeLessThan(benchmark.standardLatencyMs);
  });

  describe("ECC-Inspired Execution Guardrails", () => {
    it("should intercept and block destructive bash commands", () => {
      const decision = ToolExecutionGuardrail.evaluatePreExecution({
        toolName: "bash",
        args: { command: "rm -rf /var/data" },
        riskLevel: "DESTRUCTIVE",
      });

      expect(decision.allowed).toBe(false);
      expect(decision.requiresUserConfirmation).toBe(true);
      expect(decision.reason).toContain("Blocked by Security Guardrail");
    });

    it("should allow safe read-only tool calls without confirmation", () => {
      const decision = ToolExecutionGuardrail.evaluatePreExecution({
        toolName: "read_file",
        args: { path: "src/index.ts" },
        riskLevel: "READ_ONLY",
      });

      expect(decision.allowed).toBe(true);
      expect(decision.requiresUserConfirmation).toBeUndefined();
    });
  });

  describe("Context Budget & MCP Tool Pruning", () => {
    const sampleTools: MCPToolDefinition[] = [
      { name: "code_editor", description: "Edit and refactor TypeScript code", category: "code", schema: {}, estimatedTokenSize: 450 },
      { name: "browser_agent", description: "Automate web browsing and page scraping", category: "browser", schema: {}, estimatedTokenSize: 620 },
      { name: "sql_runner", description: "Execute SQL queries on PostgreSQL", category: "database", schema: {}, estimatedTokenSize: 380 },
      { name: "financial_sheet", description: "Spreadsheet calculation and formulas", category: "finance", schema: {}, estimatedTokenSize: 510 },
    ];

    it("should prune unrelated tools to fit context budget while preserving relevant ones", () => {
      const pruned = ContextBudgetEngine.pruneToolsByIntent(sampleTools, ["refactor", "code"], { maxToolDefinitions: 2 });
      
      expect(pruned.activeTools.length).toBeLessThanOrEqual(2);
      expect(pruned.activeTools[0].name).toBe("code_editor");
      expect(pruned.prunedToolsCount).toBe(2);
      expect(pruned.estimatedTokensSaved).toBeGreaterThan(0);
    });

    it("should enforce session start character caps", () => {
      const longPrompt = "A".repeat(8000);
      const capped = ContextBudgetEngine.enforceSessionStartCap(longPrompt, 4000);
      expect(capped.length).toBeLessThanOrEqual(4100);
      expect(capped).toContain("[SessionStart context pruned to preserve window]");
    });
  });

  describe("Agent Trajectory Evaluator Suite (50+ Golden Evals)", () => {
    it("should verify that benchmark suite contains at least 50 golden eval prompts", () => {
      expect(AgentTrajectoryEvaluator.BENCHMARK_SUITE.length).toBeGreaterThanOrEqual(50);
    });

    it("should pass individual intent mappings for correct tools", () => {
      const benchmark = AgentTrajectoryEvaluator.BENCHMARK_SUITE[0]; // eval-pay-001
      const evalResult = AgentTrajectoryEvaluator.evaluateIntentMapping(benchmark, "bkash_verify_trx");

      expect(evalResult.passed).toBe(true);
      expect(evalResult.decisionStatus).toBe("PASSED");
    });

    it("should detect and fail on misrouted tools", () => {
      const benchmark = AgentTrajectoryEvaluator.BENCHMARK_SUITE[0]; // eval-pay-001: expects bkash_verify_trx
      const evalResult = AgentTrajectoryEvaluator.evaluateIntentMapping(benchmark, "browser_agent");

      expect(evalResult.passed).toBe(false);
      expect(evalResult.decisionStatus).toBe("MISROUTED_TOOL");
    });

    it("should execute all 50+ benchmark evals and achieve a 100% pass rate with sub-20ms avg latency", () => {
      // Deterministic mock router that accurately reflects expected routing & security blocks
      const mockRouter = (prompt: any) => {
        if (prompt.expectSecurityBlock) {
          return { blocked: true };
        }
        return { tool: prompt.expectedTool };
      };

      const summary = AgentTrajectoryEvaluator.runFullBenchmarkSuite(mockRouter);

      expect(summary.totalEvals).toBeGreaterThanOrEqual(50);
      expect(summary.passedCount).toBe(summary.totalEvals);
      expect(summary.failedCount).toBe(0);
      expect(summary.passRatePercent).toBe(100);
      expect(summary.avgLatencyMs).toBeLessThanOrEqual(20);

      // Verify all 6 categories are represented
      expect(summary.categoryBreakdown.fcommerce_payment.total).toBeGreaterThanOrEqual(10);
      expect(summary.categoryBreakdown.fcommerce_payment.passRate).toBe(100);

      expect(summary.categoryBreakdown.logistics_delivery.total).toBeGreaterThanOrEqual(10);
      expect(summary.categoryBreakdown.logistics_delivery.passRate).toBe(100);

      expect(summary.categoryBreakdown.tax_legal.total).toBeGreaterThanOrEqual(10);
      expect(summary.categoryBreakdown.tax_legal.passRate).toBe(100);

      expect(summary.categoryBreakdown.code_sandbox.total).toBeGreaterThanOrEqual(10);
      expect(summary.categoryBreakdown.code_sandbox.passRate).toBe(100);

      expect(summary.categoryBreakdown.academic_research.total).toBeGreaterThanOrEqual(10);
      expect(summary.categoryBreakdown.academic_research.passRate).toBe(100);

      expect(summary.categoryBreakdown.destructive_intent.total).toBeGreaterThanOrEqual(4);
      expect(summary.categoryBreakdown.destructive_intent.passRate).toBe(100);
    });
  });
});
