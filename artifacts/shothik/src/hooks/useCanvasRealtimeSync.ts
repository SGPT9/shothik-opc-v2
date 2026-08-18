import { useEffect, useCallback } from "react";
import { InsForgeRealtimeAdapter } from "@/lib/insforge/realtime-adapter";
import logger from "@/lib/logger";

export interface CanvasSyncEvent {
  type: "SLIDE_UPDATE" | "SHEET_UPDATE" | "APPROVAL_COMMITTED" | "ACTIVE_TAB_CHANGED";
  payload: Record<string, unknown>;
  timestamp: string;
  senderId: string;
}

const CLIENT_ID = `client_${Math.random().toString(36).substring(2, 9)}`;

export function useCanvasRealtimeSync({
  workspaceId = "default-workspace",
  onSyncEvent,
}: {
  workspaceId?: string;
  onSyncEvent?: (event: CanvasSyncEvent) => void;
}) {
  useEffect(() => {
    logger.info("[canvas-realtime] Subscribing to canvas realtime sync", { workspaceId, CLIENT_ID });

    const subscription = InsForgeRealtimeAdapter.subscribeToWorkspace({
      workspaceId,
      onEvent: (event) => {
        const payload = event.payload as any;
        // Ignore self-broadcasts
        if (payload?.senderId === CLIENT_ID) return;

        if (onSyncEvent) {
          onSyncEvent({
            type: (event.eventType as any) || "ACTIVE_TAB_CHANGED",
            payload: payload || {},
            timestamp: event.timestamp,
            senderId: payload?.senderId || "unknown",
          });
        }
      },
      onError: (err) => {
        logger.warn("[canvas-realtime] Sync error (using local state fallback)", { error: err.message });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [workspaceId, onSyncEvent]);

  const broadcastCanvasEvent = useCallback(
    (type: CanvasSyncEvent["type"], payload: Record<string, unknown>) => {
      try {
        const eventData = {
          ...payload,
          senderId: CLIENT_ID,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to other tabs via LocalStorage BroadcastChannel as zero-latency local fallback
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel(`shothik_canvas_${workspaceId}`);
          bc.postMessage({ type, payload: eventData });
          bc.close();
        }
      } catch (e: any) {
        logger.warn("[canvas-realtime] Broadcast failure", { error: e?.message });
      }
    },
    [workspaceId]
  );

  return { broadcastCanvasEvent, clientId: CLIENT_ID };
}
