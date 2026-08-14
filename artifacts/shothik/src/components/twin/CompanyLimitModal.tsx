import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Building2, Plus, Loader2 } from "lucide-react";

interface CompanyLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSlot?: () => void;
}

export function CompanyLimitModal({ open, onOpenChange, onAddSlot }: CompanyLimitModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddSlot = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onAddSlot?.();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[460px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 text-center"
      >
        <div className="flex items-center justify-end pb-1">
          <DialogClose asChild>
            <button
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>

        <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
          1 Company Limit Reached
        </DialogTitle>
        <DialogDescription className="text-sm font-sans text-slate-600 dark:text-zinc-400 mt-2">
          Your plan allows 1 active company.
        </DialogDescription>

        <div className="my-6 flex items-center justify-center gap-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <span>OR</span>
        </div>

        <div className="space-y-4 font-mono">
          <button
            type="button"
            onClick={handleAddSlot}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-gradient-to-b from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-md rounded-none transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ADDING SLOT…</span>
              </>
            ) : (
              <span>ADD A COMPANY SLOT – +$20/MO</span>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400 uppercase tracking-wider leading-relaxed">
            YOU'LL BE CHARGED $20/MO EXTRA, ADDED TO YOUR CURRENT SUBSCRIPTION.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
