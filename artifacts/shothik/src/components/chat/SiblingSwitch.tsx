import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SiblingSwitchProps {
  siblingIdx: number;
  siblingCount: number;
  onSelectSibling: (siblingIdx: number) => void;
  className?: string;
  size?: "sm" | "default";
}

/**
 * Sibling navigation switcher widget adapted from LibreChat.
 * Displays `< 1 / 3 >` pagination controls allowing the user to navigate
 * alternate message branches in conversation DAG trees.
 */
export function SiblingSwitch({
  siblingIdx,
  siblingCount,
  onSelectSibling,
  className,
  size = "sm",
}: SiblingSwitchProps) {
  if (siblingCount <= 1) {
    return null;
  }

  const canGoPrevious = siblingIdx > 0;
  const canGoNext = siblingIdx < siblingCount - 1;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrevious) {
      onSelectSibling(siblingIdx - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext) {
      onSelectSibling(siblingIdx + 1);
    }
  };

  const isSmall = size === "sm";

  return (
    <nav
      className={cn(
        "inline-flex items-center gap-1 select-none rounded-lg border border-border/60 bg-muted/30 px-1.5 py-0.5 text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-muted/60",
        isSmall ? "text-[11px]" : "text-xs",
        className,
      )}
      aria-label="Alternate response branches"
    >
      <button
        type="button"
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous branch"
        className={cn(
          "flex items-center justify-center rounded-md p-0.5 text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none",
          isSmall ? "h-5 w-5" : "h-6 w-6",
        )}
      >
        <ChevronLeft className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>

      <span
        className="px-1 font-mono font-medium tracking-tight text-foreground/80 tabular-nums"
        aria-live="polite"
        role="status"
      >
        {siblingIdx + 1} / {siblingCount}
      </span>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Next branch"
        className={cn(
          "flex items-center justify-center rounded-md p-0.5 text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none",
          isSmall ? "h-5 w-5" : "h-6 w-6",
        )}
      >
        <ChevronRight className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </nav>
  );
}
