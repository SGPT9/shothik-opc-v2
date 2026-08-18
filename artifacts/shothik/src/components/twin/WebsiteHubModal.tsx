import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Globe, History, Lock, RefreshCw } from "lucide-react";

interface WebsiteHubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenManageDomains: () => void;
  onOpenVersions: () => void;
  onOpenSecrets: () => void;
  onOpenRedeploy: () => void;
}

export function WebsiteHubModal({
  open,
  onOpenChange,
  onOpenManageDomains,
  onOpenVersions,
  onOpenSecrets,
  onOpenRedeploy,
}: WebsiteHubModalProps) {
  const beveledBtnClass =
    "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 font-mono font-semibold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer rounded-md select-none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[540px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-3 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Website
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
        <DialogDescription className="sr-only">Website configuration and actions</DialogDescription>

        <div className="space-y-6 pt-2 font-serif">
          {/* Row 1: MANAGE DOMAIN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-3.5 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <Globe className="w-4 h-4 text-zinc-500" />
                <span>MANAGE DOMAIN</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenManageDomains();
                }}
                className={beveledBtnClass}
              >
                OPEN
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 px-1">
              Point your own domain at this site
            </p>
          </div>

          {/* Row 2: VERSIONS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-3.5 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <History className="w-4 h-4 text-zinc-500" />
                <span>VERSIONS</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenVersions();
                }}
                className={beveledBtnClass}
              >
                OPEN
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 px-1">
              Roll the live site back to an earlier build
            </p>
          </div>

          {/* Row 3: SECRETS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-3.5 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>SECRETS</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenSecrets();
                }}
                className={beveledBtnClass}
              >
                OPEN
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 px-1">
              API keys and credentials your site reads at runtime
            </p>
          </div>

          {/* Row 4: REDEPLOY */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-3.5 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <RefreshCw className="w-4 h-4 text-zinc-500" />
                <span>REDEPLOY</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenRedeploy();
                }}
                className={beveledBtnClass}
              >
                OPEN
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 px-1">
              Rebuild from the current version, so secret changes take effect
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
