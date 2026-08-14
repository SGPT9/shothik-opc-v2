import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";

interface RedeployModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartRedeploy?: () => void;
}

export function RedeployModal({ open, onOpenChange, onStartRedeploy }: RedeployModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleRedeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      onStartRedeploy?.();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[480px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Redeploy
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

        <DialogDescription className="text-xs font-serif text-slate-700 dark:text-zinc-300 leading-relaxed py-2">
          Rebuilds your site from its current version. This is how secret changes take effect. Takes a few minutes; your site stays up throughout.
        </DialogDescription>

        <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
          <button
            type="button"
            onClick={handleRedeploy}
            disabled={isDeploying}
            className="w-full py-3 bg-gradient-to-b from-[#222] to-[#000] hover:from-[#333] hover:to-[#111] text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3)] transition-all active:scale-[0.99] cursor-pointer rounded-none disabled:opacity-60"
          >
            {isDeploying ? "INITIALIZING BUILD..." : "REDEPLOY NOW"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
