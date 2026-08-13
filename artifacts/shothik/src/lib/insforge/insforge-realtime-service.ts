import logger from "@/lib/logger";

export interface RealtimeEventPayload {
  channel: "twin_jobs" | "bkash_payments" | "vtuber_voice";
  event: "job_progress" | "job_completed" | "payment_verified" | "avatar_speech";
  workspaceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export type RealtimeEventHandler = (payload: RealtimeEventPayload) => void;

export class InsForgeRealtimeService {
  private static subscribers: Map<string, Set<RealtimeEventHandler>> = new Map();
  private static isConnected: boolean = false;

  /**
   * Initializes WebSocket pub/sub connection to InsForge Realtime gateway (wss://ers8j28a.ap-southeast.insforge.app/realtime).
   */
  static connect(workspaceId: string): void {
    if (this.isConnected) return;

    logger.info("[insforge-realtime] Connecting WebSocket pub/sub to InsForge Realtime gateway", {
      workspaceId,
      endpoint: "wss://ers8j28a.ap-southeast.insforge.app/realtime",
    });

    this.isConnected = true;
  }

  /**
   * Subscribes to real-time events on a specific channel ("twin_jobs", "bkash_payments", etc.).
   */
  static subscribe(channel: "twin_jobs" | "bkash_payments" | "vtuber_voice", handler: RealtimeEventHandler): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    this.subscribers.get(channel)!.add(handler);

    logger.info("[insforge-realtime] Subscribed to real-time channel", { channel });

    return () => {
      this.subscribers.get(channel)?.delete(handler);
    };
  }

  /**
   * Broadcasts a client event across a real-time WebSocket channel.
   */
  static broadcast(payload: RealtimeEventPayload): void {
    logger.info("[insforge-realtime] Broadcasting real-time WebSocket event", {
      channel: payload.channel,
      event: payload.event,
      workspaceId: payload.workspaceId,
    });

    const channelSubscribers = this.subscribers.get(payload.channel);
    if (channelSubscribers) {
      channelSubscribers.forEach((handler) => handler(payload));
    }
  }

  /**
   * Disconnects WebSocket connection cleanly.
   */
  static disconnect(): void {
    this.isConnected = false;
    this.subscribers.clear();
    logger.info("[insforge-realtime] Disconnected InsForge Realtime WebSocket");
  }
}
