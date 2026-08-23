import { useEffect, useState, useCallback } from "react";
import {
  OfflineSyncEngine,
  SyncEngineStatus,
  OutboxTransportHandler,
} from "@/lib/offline/OfflineSyncEngine";
import { OutboxItemType } from "@/lib/offline/offline-storage";

export function useOfflineSync(customTransport?: OutboxTransportHandler) {
  const [engine] = useState(() => OfflineSyncEngine.getInstance(customTransport));
  const [status, setStatus] = useState<SyncEngineStatus>(() => engine.getStatus());

  useEffect(() => {
    const unsubscribe = engine.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, [engine]);

  const enqueue = useCallback(
    (type: OutboxItemType, payload: Record<string, any>, idempotencyKey?: string) => {
      return engine.enqueue(type, payload, idempotencyKey);
    },
    [engine]
  );

  const flush = useCallback(
    (transport?: OutboxTransportHandler) => {
      return engine.flush(transport);
    },
    [engine]
  );

  return {
    ...status,
    enqueue,
    flush,
  };
}
