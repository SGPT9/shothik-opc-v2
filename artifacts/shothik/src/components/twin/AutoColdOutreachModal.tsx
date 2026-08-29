import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";

type OutreachFrequency = "daily" | "weekdays" | "weekly";

interface AutoColdOutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartOutreach?: (frequency: OutreachFrequency) => void;
}

export function AutoColdOutreachModal({
  open,
  onOpenChange,
  onStartOutreach,
}: AutoColdOutreachModalProps) {
  const [frequency, setFrequency] = useState<OutreachFrequency>("weekdays");
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      onStartOutreach?.(frequency);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[490px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Auto Cold Outreach
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>

        <DialogDescription className="text-xs font-serif text-slate-700 dark:text-zinc-300 leading-relaxed pt-1 pb-3">
          Shothik will find leads for your business, send cold outreach via email, and respond to any replies.
        </DialogDescription>

        <div className="space-y-5 pt-1">
          {/* Blue/Ice Callout Banner */}
          <div className="p-3.5 bg-[#f0f6fa] dark:bg-blue-950/30 border border-[#d6e5f0] dark:border-blue-900/50 text-slate-700 dark:text-blue-200 text-xs font-serif leading-snug">
            Your outreach starts now and sends from a Shothik address.
          </div>

          {/* Frequency Options */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-zinc-400 block">
              FREQUENCY
            </label>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Daily */}
              <label
                onClick={() => setFrequency("daily")}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    frequency === "daily"
                      ? "border-black dark:border-white bg-white dark:bg-black"
                      : "border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-black"
                  }`}
                >
                  {frequency === "daily" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black dark:text-white tracking-wide">
                    DAILY
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    ~30 TASKS/MO
                  </span>
                </div>
              </label>

              {/* Weekdays */}
              <label
                onClick={() => setFrequency("weekdays")}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    frequency === "weekdays"
                      ? "border-black dark:border-white bg-white dark:bg-black"
                      : "border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-black"
                  }`}
                >
                  {frequency === "weekdays" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black dark:text-white tracking-wide">
                    WEEKDAYS
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    ~22 TASKS/MO
                  </span>
                </div>
              </label>

              {/* Weekly */}
              <label
                onClick={() => setFrequency("weekly")}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    frequency === "weekly"
                      ? "border-black dark:border-white bg-white dark:bg-black"
                      : "border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 group-hover:border-black"
                  }`}
                >
                  {frequency === "weekly" && (
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black dark:text-white tracking-wide">
                    WEEKLY
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    ~4 TASKS/MO
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Button & Footer */}
          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-3 bg-gradient-to-b from-[#252525] to-[#000000] hover:from-[#353535] hover:to-[#111111] text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-[0.99] cursor-pointer rounded-none disabled:opacity-60"
            >
              {isStarting ? "INITIALIZING CAMPAIGN..." : "START OUTREACH"}
            </button>

            <p className="text-xs font-serif text-slate-600 dark:text-zinc-400 pt-1">
              Uses 1 task credit per run. Cancel anytime.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
