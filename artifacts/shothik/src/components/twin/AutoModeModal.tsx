import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";

interface AutoModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartAutoMode?: (hours: number) => void;
}

export function AutoModeModal({ open, onOpenChange, onStartAutoMode }: AutoModeModalProps) {
  const [hours, setHours] = useState<number>(2);
  const [isRunning, setIsRunning] = useState(false);

  const handleStart = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      onStartAutoMode?.(hours);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[480px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Auto Mode
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">Configure autonomous Auto Mode duration</DialogDescription>

        <p className="mt-4 text-[15px] font-sans text-slate-700 dark:text-zinc-300 leading-relaxed">
          Shothik works autonomously for the hours you choose, completing your open tasks and planning new ones as it goes.
        </p>

        <div className="mt-8 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs tracking-wider font-semibold text-slate-600 dark:text-zinc-400">
            <span>RUN FOR</span>
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {hours} {hours === 1 ? "hour" : "hours"}
            </span>
          </div>

          <div className="py-2">
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning}
            className="w-full py-3.5 px-4 bg-gradient-to-b from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-md rounded-none transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>STARTING AUTO MODE…</span>
              </>
            ) : (
              <span>START AUTO MODE</span>
            )}
          </button>

          <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans leading-relaxed">
            Each task costs 1 credit, as usual. Failed tasks are refunded, and you can stop anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
