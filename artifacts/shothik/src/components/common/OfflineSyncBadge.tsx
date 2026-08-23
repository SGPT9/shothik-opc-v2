"use client";

import React from "react";
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface OfflineSyncBadgeProps {
  className?: string;
  showWhenClean?: boolean;
}

export function OfflineSyncBadge({
  className = "",
  showWhenClean = false,
}: OfflineSyncBadgeProps) {
  const { isOnline, syncInProgress, pendingCount, failedCount, flush } = useOfflineSync();

  if (!isOnline) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-500 backdrop-blur-md shadow-sm ${className}`}
      >
        <WifiOff className="h-3 w-3 shrink-0 animate-pulse" />
        <span>
          Offline{pendingCount > 0 ? ` · ${pendingCount} queued` : ""}
        </span>
      </div>
    );
  }

  if (syncInProgress) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400 backdrop-blur-md shadow-sm ${className}`}
      >
        <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />
        <span>Syncing{pendingCount > 0 ? ` ${pendingCount}…` : "…"}</span>
      </div>
    );
  }

  if (failedCount > 0) {
    return (
      <button
        type="button"
        onClick={() => flush()}
        className={`inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-500/20 transition cursor-pointer backdrop-blur-md shadow-sm ${className}`}
      >
        <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
        <span>{failedCount} failed · Retry</span>
      </button>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={() => flush()}
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition cursor-pointer backdrop-blur-md shadow-sm ${className}`}
      >
        <RefreshCw className="h-3 w-3 shrink-0" />
        <span>{pendingCount} pending</span>
      </button>
    );
  }

  if (showWhenClean) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 backdrop-blur-md shadow-sm ${className}`}
      >
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        <span>Synced</span>
      </div>
    );
  }

  return null;
}
