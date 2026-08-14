import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface NightshiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (mode: "reporting_only" | "work_one_task") => void;
}

export function NightshiftModal({ open, onOpenChange, onSave }: NightshiftModalProps) {
  const [selectedMode, setSelectedMode] = useState<"reporting_only" | "work_one_task">("work_one_task");

  const handleSave = () => {
    onSave?.(selectedMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[480px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Nightshift
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
        <DialogDescription className="sr-only">Configure autonomous Nightshift overnight policy</DialogDescription>

        <p className="mt-4 text-[15px] font-sans text-slate-700 dark:text-zinc-300 leading-relaxed">
          Polsia works while you sleep. Choose how far it goes.
        </p>

        <div className="mt-6 space-y-4 font-mono">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input
                type="radio"
                name="nightshift_tier"
                checked={selectedMode === "reporting_only"}
                onChange={() => setSelectedMode("reporting_only")}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                selectedMode === "reporting_only" 
                  ? "border-black bg-white dark:border-white dark:bg-zinc-950" 
                  : "border-slate-400 group-hover:border-slate-600"
              }`}>
                {selectedMode === "reporting_only" && (
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                )}
              </div>
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                Reporting and recurring tasks only
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input
                type="radio"
                name="nightshift_tier"
                checked={selectedMode === "work_one_task"}
                onChange={() => setSelectedMode("work_one_task")}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                selectedMode === "work_one_task" 
                  ? "border-black bg-white dark:border-white dark:bg-zinc-950" 
                  : "border-slate-400 group-hover:border-slate-600"
              }`}>
                {selectedMode === "work_one_task" && (
                  <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                )}
              </div>
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-900 dark:text-zinc-100">
                Also work one task from your queue
              </p>
              <p className="mt-1 font-sans text-xs text-slate-600 dark:text-zinc-400">
                Included in your plan.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 font-mono">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              CANCEL
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-900 font-mono font-bold text-xs uppercase tracking-wider border border-slate-400 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 shadow-sm rounded-none transition-all active:scale-[0.98] cursor-pointer"
          >
            SAVE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
