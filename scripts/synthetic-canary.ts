/**
 * Autonomous Synthetic User Journey Canary CLI
 * Executes multi-stage founder business transactions to certify cross-system health.
 */

import os from "os";
import { SyntheticJourneyRunner } from "../artifacts/api-server/src/lib/canary/synthetic-journey-runner";

async function main() {
  console.log("==================================================================");
  console.log("🦅 Shothik Autonomous Synthetic User Journey Canary Gate");
  console.log(`Host Cores: ${os.cpus().length} | Free RAM: ${Math.round(os.freemem() / 1024 / 1024)} MB | Node: ${process.version}`);
  console.log("==================================================================\n");

  let baseUrl = process.env.API_BASE_URL || "http://127.0.0.1:8080";
  let ephemeralServer: any = null;

  // Probe if target baseUrl is reachable
  try {
    const probe = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
    if (!probe.ok) throw new Error("Not OK");
    console.log(`📡 Connected to live target server at ${baseUrl}`);
  } catch {
    console.log(`⚠️  Target ${baseUrl} not active. Booting ephemeral in-process API server...`);
    const appModule = await import("../artifacts/api-server/src/app");
    const app = appModule.default;
    await new Promise<void>((resolve) => {
      ephemeralServer = app.listen(0, () => {
        const port = (ephemeralServer.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`✅ Ephemeral API server listening at ${baseUrl}\n`);
        resolve();
      });
    });
  }

  try {
    const runner = new SyntheticJourneyRunner(baseUrl);
    console.log("🚀 Initiating Synthetic User Journey Canary sequence...\n");

    const report = await runner.runFullJourney();

    for (const step of report.steps) {
      const statusIcon = step.success ? "✅" : "❌";
      console.log(`${statusIcon} [Step: ${step.step}] (${step.durationMs}ms)`);
      if (step.details) {
        console.log(`   Details:`, JSON.stringify(step.details));
      }
      if (step.error) {
        console.log(`   Error:`, step.error);
      }
    }

    console.log("\n==================================================================");
    console.log(`📊 Canary Summary: ${report.allPassed ? "PASSED (100%)" : "FAILED"}`);
    console.log(`⏱️  Total Duration: ${report.totalDurationMs}ms`);
    console.log(`📅 Timestamp: ${report.timestamp}`);
    console.log("==================================================================\n");

    if (!report.allPassed) {
      process.exit(1);
    }
  } finally {
    if (ephemeralServer) {
      ephemeralServer.close();
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error running synthetic canary:", err);
  process.exit(1);
});
