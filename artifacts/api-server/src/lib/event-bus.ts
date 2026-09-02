/**
 * Distributed Server-Sent Events (SSE) Bus
 * Manages real-time bi-directional streaming events for agent execution steps, bKash payments, and Steadfast parcel updates.
 */

import { EventEmitter } from "events";

export interface SystemEventPayload {
  eventId: string;
  eventType: "agent_step" | "bkash_payment" | "steadfast_parcel" | "dlq_error";
  userId: string;
  traceId: string;
  data: Record<string, any>;
  timestamp: string;
}

export class BackendEventBus extends EventEmitter {
  private eventHistory: SystemEventPayload[] = [];

  /**
   * Publish real-time event to connected SSE subscribers
   */
  public publishEvent(
    type: SystemEventPayload["eventType"],
    userId: string,
    data: Record<string, any>,
    traceId: string = `trc_${Date.now()}`
  ): SystemEventPayload {
    const payload: SystemEventPayload = {
      eventId: `evt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      eventType: type,
      userId,
      traceId,
      data,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.push(payload);
    if (this.eventHistory.length > 500) {
      this.eventHistory.shift(); // Bound memory footprint
    }

    this.emit("system_event", payload);
    return payload;
  }

  /**
   * Format payload into valid Server-Sent Events (SSE) string format
   */
  public formatSseMessage(event: SystemEventPayload): string {
    return `id: ${event.eventId}\nevent: ${event.eventType}\ndata: ${JSON.stringify(event)}\n\n`;
  }
}

export const backendEventBus = new BackendEventBus();
