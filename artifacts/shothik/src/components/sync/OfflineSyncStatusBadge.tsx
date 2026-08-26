import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { offlineCrdtStore } from "@/lib/sync/offline-crdt-store";

export interface OfflineSyncStatusBadgeProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineSyncStatusBadge: React.FC<OfflineSyncStatusBadgeProps> = ({
  className = "",
  showWhenOnline = false,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      offlineCrdtStore.setOnlineStatus(true);
      const pending = offlineCrdtStore.getPendingOutbox();
      if (pending.length > 0) {
        setIsSyncing(true);
        try {
          await offlineCrdtStore.flushOutboxOnReconnect();
        } finally {
          setIsSyncing(false);
          setPendingCount(offlineCrdtStore.getPendingOutbox().length);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      offlineCrdtStore.setOnlineStatus(false);
      setPendingCount(offlineCrdtStore.getPendingOutbox().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setPendingCount(offlineCrdtStore.getPendingOutbox().length);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !isSyncing && !showWhenOnline) {
    return null;
  }

  return (
    <div
      data-testid="offline-sync-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
        !isOnline
          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          : isSyncing
          ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      } ${className}`}
      title={
        !isOnline
          ? "Offline: Changes saved locally with CRDT version vectors"
          : isSyncing
          ? `Syncing ${pendingCount} offline mutations...`
          : "Cloud Synced"
      }
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-500" />
          <span>Offline ({pendingCount} queued)</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Synced</span>
        </>
      )}
    </div>
  );
};
