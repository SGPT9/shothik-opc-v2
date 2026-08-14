import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, RotateCcw, Check, Loader2 } from "lucide-react";

export interface VersionCommit {
  hash: string;
  message: string;
  timeAgo: string;
  status: "current" | "revertable" | "unavailable";
}

interface VersionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevertCommit?: (commit: VersionCommit) => void;
}

const COMMITS_HISTORY: VersionCommit[] = [
  {
    hash: "7661895",
    message: "feat: Add POST /v1/webhooks/:id/ping test-ping endpoint",
    timeAgo: "20h ago",
    status: "current",
  },
  {
    hash: "b125e48",
    message: "feat: Add GET /v1/audit/verifications/export CSV endpoint",
    timeAgo: "1d ago",
    status: "revertable",
  },
  {
    hash: "ecf50dc",
    message: "feat: Add /docs/api-keys guide covering key issuance, rotation, revocation",
    timeAgo: "3d ago",
    status: "revertable",
  },
  {
    hash: "d318b46",
    message: "feat: map NID status and return structured failure on invalid Surepass NID",
    timeAgo: "4d ago",
    status: "revertable",
  },
  {
    hash: "01af592",
    message: "feat: Wire OpenSanctions API into AML verification endpoint",
    timeAgo: "5d ago",
    status: "revertable",
  },
  {
    hash: "81e6a7e",
    message: "feat: add admin endpoint to rotate bank customer API keys",
    timeAgo: "Aug 6",
    status: "revertable",
  },
  {
    hash: "e36c324",
    message: "feat: add webhook delivery redelivery endpoint with parent linkage",
    timeAgo: "Aug 6",
    status: "unavailable",
  },
  {
    hash: "07856f3",
    message: "feat: Seed sample audit rows on tenant activation",
    timeAgo: "Aug 6",
    status: "unavailable",
  },
  {
    hash: "8f94a58",
    message: "feat: Add GET /v1/webhooks/deliveries endpoint for tenant delivery log",
    timeAgo: "Aug 6",
    status: "unavailable",
  },
  {
    hash: "1017615",
    message: "feat: add DELETE /v1/webhooks/:id to unsubscribe sandbox tenants",
    timeAgo: "Aug 6",
    status: "unavailable",
  },
];

export function VersionsModal({ open, onOpenChange, onRevertCommit }: VersionsModalProps) {
  const [commits, setCommits] = useState<VersionCommit[]>(COMMITS_HISTORY);
  const [revertingHash, setRevertingHash] = useState<string | null>(null);

  const handleRevert = (commit: VersionCommit) => {
    if (commit.status !== "revertable") return;
    setRevertingHash(commit.hash);
    setTimeout(() => {
      setCommits((prev) =>
        prev.map((c) => ({
          ...c,
          status: c.hash === commit.hash ? "current" : "revertable",
        }))
      );
      setRevertingHash(null);
      onRevertCommit?.(commit);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[580px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent shrink-0">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Versions
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
        <DialogDescription className="text-xs font-serif text-slate-700 dark:text-zinc-300 leading-relaxed shrink-0">
          Roll your product back to an earlier version. Rolling back redeploys your live site.
        </DialogDescription>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-2 mt-4 shrink-0">
          <div className="col-span-8">Version</div>
          <div className="col-span-2 text-center">When</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Scrollable Commits List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900 pr-1 my-1">
          {commits.map((commit) => (
            <div key={commit.hash} className="grid grid-cols-12 gap-2 py-3.5 items-center font-mono text-xs">
              {/* Commit Message & Hash */}
              <div className="col-span-8 pr-2">
                <p className="font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                  {commit.message}{" "}
                  <span className="font-normal text-slate-400 dark:text-zinc-500 text-[10px]">
                    {commit.hash}
                  </span>
                </p>
              </div>

              {/* Time */}
              <div className="col-span-2 text-center text-slate-500 dark:text-zinc-400 text-[11px]">
                {commit.timeAgo}
              </div>

              {/* Action Button / Badge */}
              <div className="col-span-2 text-right flex justify-end">
                {commit.status === "current" ? (
                  <span className="px-2 py-0.5 border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    CURRENT
                  </span>
                ) : commit.status === "revertable" ? (
                  <button
                    type="button"
                    onClick={() => handleRevert(commit)}
                    disabled={revertingHash === commit.hash}
                    className="px-2.5 py-1 bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-900 font-mono font-bold text-[10px] uppercase tracking-wider border border-slate-400 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 shadow-sm rounded-none transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {revertingHash === commit.hash ? "REVERTING…" : "REVERT"}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 border border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                    UNAVAILABLE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
