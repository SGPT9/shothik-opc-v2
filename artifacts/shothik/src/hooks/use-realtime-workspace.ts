"use client";

/**
 * Realtime Workspace Subscription React Hook
 * 
 * Subscribes React components to real-time pub/sub workspace channels
 * for live run progress, artifact mutations, and multi-agent swarm updates.
 */

import { useEffect, useState, useCallback } from "react";
import { InsForgeRealtimeAdapter } from "@/lib/insforge/realtime-adapter";
import logger from "@/lib/logger";

export interface RealtimeWorkspaceEvent {
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface UseRealtimeWorkspaceOptions {
  workspaceId?: string | null;
  onEvent?: (event: RealtimeWorkspaceEvent) => void;
  enabled?: boolean;
}

export function useRealtimeWorkspace({
  workspaceId,
  onEvent,
  enabled = true,
}: UseRealtimeWorkspaceOptions) {
  const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [lastEvent, setLastEvent] = useState<RealtimeWorkspaceEvent | null>(null);

  const handleEvent = useCallback(
    (event: RealtimeWorkspaceEvent) => {
      setLastEvent(event);
      onEvent?.(event);
    },
    [onEvent]
  );

  useEffect(() => {
    if (!workspaceId || !enabled) {
      setConnectionState("disconnected");
      return;
    }

    setConnectionState("connecting");

    const subscription = InsForgeRealtimeAdapter.subscribeToWorkspace({
      workspaceId,
      onEvent: (event) => {
        setConnectionState("connected");
        handleEvent(event);
      },
      onError: (err) => {
        logger.error("[useRealtimeWorkspace] Connection error", { workspaceId, error: err.message });
        setConnectionState("error");
      },
    });

    setConnectionState("connected");

    return () => {
      subscription.unsubscribe();
      setConnectionState("disconnected");
    };
  }, [workspaceId, enabled, handleEvent]);

  return {
    connectionState,
    lastEvent,
  };
}
