import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const LOG_DIR = path.resolve(process.cwd(), "logs", "overnight-loop");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const INTERVAL_MS = parseInt(process.env.LOOP_INTERVAL_MS || "300000", 10); // default 5 minutes
let iteration = 1;
let isRunning = true;

process.on("SIGINT", () => {
  console.log("\n[Overnight Daemon] Received SIGINT. Shutting down cleanly...");
  isRunning = false;
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Overnight Daemon] Received SIGTERM. Shutting down cleanly...");
  isRunning = false;
  process.exit(0);
});

console.log("======================================================");
console.log("🌙 Shothik Autonomous Overnight Loop Daemon Started");
console.log(`Interval: ${INTERVAL_MS / 1000}s | Log Directory: ${LOG_DIR}`);
console.log("======================================================\n");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startDaemon() {
  while (isRunning) {
    try {
      console.log(`[Daemon] Triggering Iteration #${iteration} at ${new Date().toISOString()}`);
      
      execSync(`npx tsx scripts/overnight-loop.ts`, {
        stdio: "inherit",
        env: {
          ...process.env,
          LOOP_ITERATION: String(iteration),
        },
      });

      console.log(`[Daemon] Iteration #${iteration} completed successfully.`);
    } catch (err: any) {
      console.error(`[Daemon] Iteration #${iteration} encountered an error:`, err.message);
    }

    iteration++;
    console.log(`[Daemon] Sleeping for ${INTERVAL_MS / 1000}s until next cycle...\n`);
    await sleep(INTERVAL_MS);
  }
}

startDaemon().catch((err) => {
  console.error("[Daemon] Fatal error in overnight loop runner:", err);
  process.exit(1);
});
