import {
  getHermesDatabase,
  HermesEventEnvelopeSchema,
  HermesSessionSchema,
  HermesRunSchema,
  getToolBridge,
} from "../lib/hermes";

async function main() {
  console.log("=== Hermes Phase 1 Gateway Surface Validation ===");

  const db = getHermesDatabase();

  // 1. Session Creation Test
  const sessionData = {
    id: `session_test_${Date.now()}`,
    workspaceId: "ws_default",
    title: "Phase 1 Test Session",
    description: "Integration test for Phase 1 surface",
  };

  const session = await db.createSession(sessionData);
  const validatedSession = HermesSessionSchema.parse(session);
  console.log("[PASS] Session created & validated:", validatedSession.id);

  // 2. Session Fetch Test
  const fetchedSession = await db.getSession(validatedSession.id);
  if (!fetchedSession) throw new Error("Session fetch failed");
  console.log("[PASS] Session fetched successfully");

  // 3. Run Creation Test
  const runData = {
    id: `run_test_${Date.now()}`,
    sessionId: validatedSession.id,
    workspaceId: "ws_default",
    domain: "general",
    config: { model: "gemini-3.6-flash" },
  };

  const run = await db.createRun(runData);
  const validatedRun = HermesRunSchema.parse(run);
  console.log("[PASS] Run created & validated:", validatedRun.id);

  // 4. Hermes Event Envelope Schema Test
  const envelopeData = {
    __hermes: true as const,
    eventId: `evt_${Date.now()}_1`,
    runId: validatedRun.id,
    sessionId: validatedSession.id,
    workspaceId: "ws_default",
    domain: "general",
    eventType: "run_started" as const,
    timestamp: new Date().toISOString(),
    sequence: 1,
    payload: { status: "started" },
  };

  const validatedEnvelope = HermesEventEnvelopeSchema.parse(envelopeData);
  console.log("[PASS] Event envelope validated:", validatedEnvelope.eventId);

  // 5. ToolBridge Integration Test
  const bridge = getToolBridge();
  console.log("[PASS] ToolBridge registered tools count:", bridge.listTools().length);

  // 6. Run Status Update Test
  const updatedRun = await db.updateRunStatus(validatedRun.id, "completed", { durationMs: 150 });
  console.log("[PASS] Run status updated to:", updatedRun.status);

  console.log("\n=== ALL PHASE 1 GATEWAY TESTS PASSED ===");
}

main().catch((err) => {
  console.error("[FAIL] Phase 1 Surface Test Error:", err);
  process.exit(1);
});
