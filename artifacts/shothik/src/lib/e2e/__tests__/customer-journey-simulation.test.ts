import { describe, it, expect } from "vitest";
import { defaultHermesMcpServer } from "../../hermes/mcp/mcp-server";
import { OfflineCrdtStore } from "../../sync/offline-crdt-store";
import { defaultTelemetryEngine } from "../../observability/session-telemetry-engine";

describe("Autonomous E2E Customer Journey Simulation", () => {
  it("executes complete full-lifecycle customer journey across all deep-tech layers", async () => {
    // 1. Session Setup & Distributed Trace Initialization
    const traceId = defaultTelemetryEngine.generateTraceId();
    const spanRoot = defaultTelemetryEngine.startSpan(traceId, "customer_journey_root", {
      userId: "user_merchant_404",
      userTier: "pro",
    });

    expect(traceId).toBeTruthy();

    // 2. Chat Turn: Natural Language Prompt requesting Autonomous Slide Deck
    const prompt = "Generate a 5-slide pitch for autonomous bKash grocery checkout";
    const startTime = Date.now();

    const mcpSlidesResponse = await defaultHermesMcpServer.handleRequest({
      jsonrpc: "2.0",
      id: "turn-1",
      method: "tools/call",
      params: {
        name: "shothik_slides_generate",
        arguments: {
          topic: prompt,
          slideCount: 5,
        },
      },
    });

    expect(mcpSlidesResponse.error).toBeUndefined();
    const slidesResult = JSON.parse((mcpSlidesResponse.result as any).content[0].text);
    expect(slidesResult.slidesGenerated).toBe(5);
    expect(slidesResult.status).toBe("ready");

    // 3. Offline-First CRDT Manuscript/Order Recording (2G Flaky Connection simulation)
    const crdtStore = new OfflineCrdtStore(false); // offline
    expect(crdtStore.isOnline()).toBe(false);

    // Save manuscript draft locally (0ms write)
    const doc = crdtStore.writeDocumentOptimistic(
      "doc_pitch_1",
      "Autonomous bKash Pitch",
      JSON.stringify(slidesResult),
      "device_pos_terminal"
    );
    expect(doc.versionVector["device_pos_terminal"]).toBe(1);

    // Queue offline logistics booking for demo product sample
    crdtStore.queueOutboxAction("courier_dispatch", {
      recipientName: "Shothik Pilot Merchant",
      phone: "01700000000",
      codAmount: 500,
    });

    expect(crdtStore.getOutboxItems()).toHaveLength(1);

    // 4. Connection Restores: Flush Outbox via MCP Steadfast Dispatcher
    crdtStore.setOnlineStatus(true);
    const flushResult = await crdtStore.flushOutbox(async (item) => {
      if (item.type === "courier_dispatch") {
        const dispatchRes = await defaultHermesMcpServer.handleRequest({
          jsonrpc: "2.0",
          id: item.id,
          method: "tools/call",
          params: {
            name: "shothik_steadfast_dispatch",
            arguments: {
              recipientName: "Shothik Pilot Merchant",
              recipientPhone: "01700000000",
              recipientAddress: "Dhanmondi, Dhaka",
              codAmount: 500,
            },
          },
        });
        return { success: !dispatchRes.error };
      }
      return { success: true };
    });

    expect(flushResult.flushedCount).toBe(1);
    expect(flushResult.remainingCount).toBe(0);

    // 5. Distributed Telemetry & Margin Attribution
    const firstTokenTime = startTime + 210; // 210ms TTFT
    const completionTime = startTime + 1100;

    const costReport = defaultTelemetryEngine.computeCostAttribution({
      traceId,
      sessionId: "session_merchant_journey_1",
      userId: "user_merchant_404",
      model: "gemini-1.5-flash",
      inputTokens: 1450,
      outputTokens: 600,
      requestStartTime: startTime,
      firstTokenTime,
      completionTime,
      billedRevenueUsd: 0.01, // 1 BDT micro-charge
    });

    expect(costReport.ttftMs).toBe(210); // <350ms TTFT
    expect(costReport.grossMarginPct).toBeGreaterThan(65.0); // Profit target achieved

    defaultTelemetryEngine.endSpan(traceId, spanRoot.spanId, {
      status: "completed_journey",
      margin: costReport.grossMarginPct,
    });
  });
});
