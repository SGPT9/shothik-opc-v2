"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandardizedChatErrorCardProps {
  message: string;
  recoverable?: boolean;
  onRetry?: () => void;
}

export function StandardizedChatErrorCard({
  message,
  recoverable = true,
  onRetry,
}: StandardizedChatErrorCardProps) {
  return (
    <div
      role="alert"
      className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3.5 text-xs shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-destructive">Generation Encountered an Error</p>
          <p className="text-muted-foreground text-[11px] mt-0.5">{message}</p>
        </div>
      </div>
      {recoverable && onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60 text-xs shrink-0 cursor-pointer select-none transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Turn</span>
        </Button>
      ) : null}
    </div>
  );
}
