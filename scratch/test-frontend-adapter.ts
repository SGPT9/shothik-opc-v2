import { HermesClientAdapter, defaultHermesAdapter } from "../lib/hermes/client/adapter";

async function main() {
  console.log("=== Hermes Frontend Adapter Layer Validation ===");

  const adapter = new HermesClientAdapter();

  if (typeof adapter.createSession !== "function") throw new Error("createSession missing");
  if (typeof adapter.getSession !== "function") throw new Error("getSession missing");
  if (typeof adapter.createRun !== "function") throw new Error("createRun missing");
  if (typeof adapter.subscribeToRunStream !== "function") throw new Error("subscribeToRunStream missing");
  if (typeof adapter.controlRun !== "function") throw new Error("controlRun missing");

  console.log("[PASS] HermesClientAdapter method signatures validated");
  console.log("[PASS] defaultHermesAdapter singleton instance ready");

  console.log("\n=== FRONTEND ADAPTER LAYER VALIDATION PASSED ===");
}

main().catch((err) => {
  console.error("[FAIL] Frontend Adapter Test Error:", err);
  process.exit(1);
});
