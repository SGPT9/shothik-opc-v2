/**
 * Full Backend Telemetry & Event Bus Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { backendEventBus } from "../../../api-server/src/lib/event-bus";
import { structuredLogger } from "../../../api-server/src/lib/structured-logger";

describe("Full Backend Telemetry & Event Plane Suite", () => {
  describe("BackendEventBus (SSE Server-Sent Events)", () => {
    it("publishes system event and formats valid SSE message payload", () => {
      const event = backendEventBus.publishEvent("bkash_payment", "usr_01", { amount: 1500, status: "SETTLED" }, "trc_test_99812");

      expect(event.eventId).toContain("evt_");
      expect(event.eventType).toBe("bkash_payment");
      expect(event.traceId).toBe("trc_test_99812");

      const sseString = backendEventBus.formatSseMessage(event);
      expect(sseString).toContain("id: evt_");
      expect(sseString).toContain("event: bkash_payment");
      expect(sseString).toContain("data: {");
    });
  });

  describe("StructuredLogger (JSON Telemetry & Distributed Tracing)", () => {
    it("logs structured JSON entry with trace ID context", () => {
      const logEntry = structuredLogger.log("info", "Steadfast parcel booked", "trc_log_771", { trackingCode: "BD_ST_881234" });

      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Steadfast parcel booked");
      expect(logEntry.traceId).toBe("trc_log_771");
      expect(logEntry.meta?.trackingCode).toBe("BD_ST_881234");
    });
  });
});
