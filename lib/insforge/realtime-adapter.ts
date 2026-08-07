/**
 * InsForge Realtime Pub/Sub WebSocket Adapter
 * 
 * Provides real-time WebSocket pub/sub subscription and event dispatching for
 * Hermes run progress, artifact state mutations, and multi-agent swarm updates.
 */

import { getInsforgeClient } from "@/lib/insforge/client";
import logger from "@/lib/logger";

export interface RealtimeSubscriptionOptions {
  workspaceId: string;
  onEvent: (event: {
    eventType: string;
    payload: Record<string, unknown>;
    timestamp: string;
  }) => void;
  onError?: (error: Error) => void;
}

export class InsForgeRealtimeAdapter {
  private static activeChannels = new Map<string, any>();

  /**
   * Subscribes to real-time pub/sub channel events for a given workspace.
   */
  static subscribeToWorkspace(options: RealtimeSubscriptionOptions): { unsubscribe: () => void } {
    const channelName = `workspace:${options.workspaceId}`;

    logger.info("[insforge-realtime] Subscribing to workspace channel", {
      workspaceId: options.workspaceId,
      channelName,
    });

    try {
      const client = getInsforgeClient();

      // Check if real-time feature is available on client
      if ((client as any).realtime?.channel) {
        const channel = (client as any).realtime.channel(channelName);
        channel.on("broadcast", { event: "*" }, (payload: any) => {
          options.onEvent({
            eventType: payload.eventType || "unknown",
            payload: payload.payload || {},
            timestamp: payload.timestamp || new Date().toISOString(),
          });
        });
        channel.subscribe();
        this.activeChannels.set(channelName, channel);
      }
    } catch (error: any) {
      logger.error("[insforge-realtime] Failed to subscribe to WebSocket channel", {
        workspaceId: options.workspaceId,
        error: error.message,
      });
      options.onError?.(error);
    }

    return {
      unsubscribe: () => {
        this.unsubscribeFromWorkspace(options.workspaceId);
      },
    };
  }

  /**
   * Unsubscribes from a workspace channel.
   */
  static unsubscribeFromWorkspace(workspaceId: string): void {
    const channelName = `workspace:${workspaceId}`;
    const channel = this.activeChannels.get(channelName);

    if (channel) {
      try {
        channel.unsubscribe();
      } catch {}
      this.activeChannels.delete(channelName);
      logger.info("[insforge-realtime] Unsubscribed from workspace channel", { workspaceId });
    }
  }

  /**
   * Returns active channel count.
   */
  static getActiveChannelCount(): number {
    return this.activeChannels.size;
  }

  /**
   * Clears active channel registry.
   */
  static clearRegistry(): void {
    this.activeChannels.clear();
  }
}
