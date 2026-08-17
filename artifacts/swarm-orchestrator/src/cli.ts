#!/usr/bin/env node
import { SwarmRunner } from "./runner/SwarmRunner.js";

async function main() {
  const goal = process.argv.slice(2).join(" ") || "Audit F-Commerce checkout flow and verify bKash 1-click booking card";
  console.log("================================================================================");
  console.log("🌊 SHOTHIK AUTONOMOUS MULTI-AGENT SWARM ORCHESTRATOR");
  console.log("⚡ Powered by Intel Arc B580 GPU (Qwen2.5-Coder:7b) & Mule Event Message Bus");
  console.log("================================================================================\n");
  console.log(`🎯 Goal: "${goal}"\n`);

  const runner = new SwarmRunner();

  console.log("🔍 Checking local GPU compute engine...");
  const isHealthy = await runner.compute.checkHealth();
  console.log(isHealthy ? "🟢 Local GPU Inference: ONLINE (http://127.0.0.1:11434)" : "🟡 Local GPU Inference: OFFLINE (Mock Fallback)");

  console.log("\n🚀 Initiating Commander DAG Decomposition...\n");
  const summary = await runner.runGoal(goal, 100);

  console.log("--------------------------------------------------------------------------------");
  console.log("📊 EXECUTION SUMMARY");
  console.log("--------------------------------------------------------------------------------");
  console.log(`Plan ID:         ${summary.planId}`);
  console.log(`Goal:            ${summary.goal}`);
  console.log(`Nodes Completed: ${summary.completedNodes}/${summary.totalNodes}`);
  console.log(`All Passed:      ${summary.allPassed ? "✅ YES" : "❌ NO"}`);
  console.log(`Duration:        ${summary.durationMs}ms\n`);

  console.log("📋 Detailed Agent Node Deliverables:");
  for (const [nodeId, result] of Object.entries(summary.results)) {
    console.log(`  - [${nodeId}]:`, JSON.stringify(result, null, 2));
  }

  console.log("\n✨ Swarm execution complete! All deliverables verified.\n");
}

main().catch((err) => {
  console.error("❌ Swarm Runner Error:", err);
  process.exit(1);
});
