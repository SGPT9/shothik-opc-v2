import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Sparkles, CheckCircle2, Play, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SpecializedTwinCard {
  id: string;
  name: string;
  category: string;
  role: string;
  avatar: string;
  status: "idle" | "observing" | "executing" | "learning";
  currentTask?: string;
  tasksCompleted: number;
  lastAction: string;
  capabilities: string[];
}

interface SpecializedTwinsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companySlug: string;
  companyName: string;
  onDispatchTwin?: (twinName: string, action: string, log: string) => void;
}

export function SpecializedTwinsModal({
  open,
  onOpenChange,
  companySlug,
  companyName,
  onDispatchTwin,
}: SpecializedTwinsModalProps) {
  const [twins, setTwins] = useState<SpecializedTwinCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [selectedTwin, setSelectedTwin] = useState<SpecializedTwinCard | null>(null);
  const [customDirective, setCustomDirective] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    fetch(`/api/v1/twin/specialized-twins?companySlug=${companySlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setTwins(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [open, companySlug]);

  const handleDispatch = async (twin: SpecializedTwinCard) => {
    setDispatchingId(twin.id);
    try {
      const res = await fetch("/api/v1/twin/specialized-twins/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twinId: twin.id,
          companySlug,
          taskTitle: twin.currentTask,
          customDirective: customDirective.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        onDispatchTwin?.(twin.name, data.data.actionDispatched, data.data.executionLog);
        setTwins((prev) =>
          prev.map((t) =>
            t.id === twin.id
              ? {
                  ...t,
                  status: "executing",
                  tasksCompleted: t.tasksCompleted + 1,
                  lastAction: data.data.actionDispatched,
                }
              : t
          )
        );
        setSelectedTwin(null);
        setCustomDirective("");
      }
    } catch {
      // Graceful fallback
    } finally {
      setDispatchingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executing":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40";
      case "observing":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40";
      case "learning":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/40";
      default:
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white text-slate-900 border border-slate-300 p-7 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <DialogTitle className="text-2xl font-bold font-serif text-black dark:text-white flex items-center gap-2">
              <span>🤖</span>
              <span>The 9 Specialized Twins</span>
            </DialogTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
              Autonomous functional workers orchestrated for <strong className="font-semibold text-black dark:text-white">{companyName}</strong> under the OPC Philosophy.
            </p>
          </div>
          <DialogClose asChild>
            <button type="button" className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>CONNECTING TO ACTIVE TWIN SWARM…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 font-sans">
            {twins.map((twin) => (
              <div
                key={twin.id}
                className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#121315] hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl select-none">{twin.avatar}</span>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-black dark:text-white leading-tight">
                          {twin.name}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">{twin.category}</span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider ${getStatusColor(twin.status)}`}
                    >
                      {twin.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                    {twin.role}
                  </p>

                  <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono rounded-none space-y-1">
                    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">CURRENT TARGET</div>
                    <div className="text-zinc-800 dark:text-zinc-200 truncate" title={twin.currentTask}>
                      {twin.currentTask || "Idle — Listening for signals"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {twin.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {twin.tasksCompleted} SHIPPED
                  </span>

                  <button
                    type="button"
                    disabled={dispatchingId === twin.id}
                    onClick={() => handleDispatch(twin)}
                    className="px-3 py-1.5 bg-black hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {dispatchingId === twin.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>RUNNING…</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>DISPATCH</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 p-3.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-900/60 font-mono text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
          <span>OPC Continuous Cycle: <strong>Observe ➔ Understand ➔ Decide ➔ Execute ➔ Learn</strong></span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">9 Active Workers</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
