"use client";

import React from "react";
import {
  FileSpreadsheet,
  Presentation,
  BookOpen,
  FileText,
  Sparkles,
  Loader2,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasSkeletonPreviewProps {
  tab: "sheet" | "slides" | "research" | "doc" | "code" | string;
  topic?: string;
}

export function CanvasSkeletonPreview({
  tab,
  topic = "Generating structured canvas...",
}: CanvasSkeletonPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden select-none p-4 space-y-4 animate-in fade-in duration-300">
      {/* Ghost Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
              {topic}
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              Compiling real-time canvas model...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-6 w-16 rounded-md bg-muted animate-pulse" />
          <div className="h-6 w-20 rounded-md bg-muted animate-pulse" />
        </div>
      </div>

      {/* Ghost Body Variants */}
      {tab === "sheet" && (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Shimmer KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/70 bg-card space-y-1.5"
              >
                <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                <div className="h-5 w-24 rounded bg-muted/80 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Shimmer Spreadsheet Table */}
          <div className="flex-1 rounded-xl border border-border/80 bg-card overflow-hidden divide-y divide-border/60">
            <div className="grid grid-cols-4 bg-muted/50 p-2.5 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3.5 rounded bg-muted animate-pulse" />
              ))}
            </div>
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="grid grid-cols-4 p-3 gap-2">
                {[1, 2, 3, 4].map((col) => (
                  <div
                    key={col}
                    className="h-3 rounded bg-muted/50 animate-pulse"
                    style={{ animationDelay: `${(row * 4 + col) * 50}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "slides" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {/* Shimmer 16:9 Slide Stage */}
          <div className="w-full max-w-2xl aspect-[16/9] rounded-2xl border border-border/80 bg-zinc-950 p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded-full bg-zinc-800 animate-pulse" />
              <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
            </div>

            <div className="space-y-3 my-auto">
              <div className="h-7 w-3/4 rounded-lg bg-zinc-800 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-zinc-800/80 animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-5/6 rounded bg-zinc-800/60 animate-pulse" />
                <div className="h-3 w-4/6 rounded bg-zinc-800/60 animate-pulse" />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex justify-between">
              <div className="h-2.5 w-24 rounded bg-zinc-900 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-zinc-900 animate-pulse" />
            </div>
          </div>

          {/* Shimmer Slide Carousel Strip */}
          <div className="flex items-center gap-2 max-w-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-16 rounded-lg border border-border/60 bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {tab === "research" && (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Shimmer Verification Status Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
              <div className="h-2.5 w-64 rounded bg-muted/70 animate-pulse" />
            </div>
            <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
          </div>

          {/* Shimmer Sources Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2"
              >
                <div className="flex justify-between">
                  <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-12 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-4 w-44 rounded bg-muted/80 animate-pulse" />
                <div className="h-3 w-full rounded bg-muted/50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === "doc" || (!["sheet", "slides", "research"].includes(tab))) && (
        <div className="flex-1 rounded-xl border border-border/80 bg-card p-6 space-y-4">
          <div className="h-6 w-1/2 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-3.5 w-11/12 rounded bg-muted/60 animate-pulse" />
            <div className="h-3.5 w-4/5 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-4 w-1/3 rounded bg-muted/80 animate-pulse" />
            <div className="h-3.5 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-3.5 w-9/12 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasSkeletonPreview;
