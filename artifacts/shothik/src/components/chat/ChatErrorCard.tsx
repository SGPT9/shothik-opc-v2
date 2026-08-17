import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Standardized error card for chat failures (mid-stream errors, network
 * drops, parse failures). Any partial text already streamed stays visible
 * above this card; the card offers a retry when the failure is recoverable.
 */
export function ChatErrorCard({
  message,
  recoverable = true,
  onRetry,
}: {
  message: string;
  recoverable?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 p-3"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-medium text-destructive">
            Something went wrong
          </p>
          <p className="text-xs text-destructive/80">{message}</p>
          {recoverable && onRetry ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="h-7 gap-1.5 border-destructive/30 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/60 hover:text-destructive cursor-pointer select-none transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
