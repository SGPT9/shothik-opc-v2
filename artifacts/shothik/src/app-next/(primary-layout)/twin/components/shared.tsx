/**
 * Shared UI primitives used across all Twin dashboard components.
 * Retains 100% of existing functionality while supporting all categories.
 */
import React from "react";
import { cn } from "@/lib/utils";
import type { TaskCategory, TaskStatus } from "../types";
import { Search, PenLine, ListChecks, Globe, Compass, Package, TrendingUp, DollarSign, Shield } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Section label                                                       */
/* ------------------------------------------------------------------ */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Panel card                                                          */
/* ------------------------------------------------------------------ */

export function PanelCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card p-4", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category styles & icons                                             */
/* ------------------------------------------------------------------ */

export const CATEGORY_STYLES: Record<TaskCategory, string> = {
  Research: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Draft: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Edit: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Publish: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Market: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Strategy: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Product: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Growth: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Finance: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Legal: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const CATEGORY_ICONS: Record<TaskCategory, React.ElementType> = {
  Research: Search,
  Draft: PenLine,
  Edit: ListChecks,
  Publish: Globe,
  Market: Search,
  Strategy: Compass,
  Product: Package,
  Growth: TrendingUp,
  Finance: DollarSign,
  Legal: Shield,
};

/* ------------------------------------------------------------------ */
/* Status tab definitions                                              */
/* ------------------------------------------------------------------ */

export const STATUS_TABS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "failed", label: "Failed" },
];
