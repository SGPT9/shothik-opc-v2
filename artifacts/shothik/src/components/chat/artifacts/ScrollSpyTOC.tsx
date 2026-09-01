import React, { useEffect, useState } from "react";
import { ListFilter, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TOCHeading {
  id: string;
  title: string;
  level: number;
}

export interface ScrollSpyTOCProps {
  headings: TOCHeading[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ScrollSpyTOC({
  headings,
  activeId,
  onSelect,
  className,
}: ScrollSpyTOCProps) {
  if (!headings || headings.length === 0) return null;

  return (
    <nav
      className={cn(
        "sticky top-3 flex flex-col gap-1 p-3 rounded-2xl bg-card/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-border/80 shadow-xs max-h-[calc(100vh-200px)] overflow-y-auto select-none",
        className
      )}
      aria-label="Table of Contents"
    >
      <div className="flex items-center gap-1.5 px-2 py-1 mb-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
        <ListFilter className="w-3.5 h-3.5 text-cyan-500" />
        <span>Outline & Sections</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <button
              key={heading.id}
              type="button"
              onClick={() => onSelect(heading.id)}
              className={cn(
                "group flex items-center justify-between text-left rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer",
                heading.level === 2 ? "pl-5 text-[11px]" : "font-medium",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-xs scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <span className="truncate pr-1">{heading.title}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
