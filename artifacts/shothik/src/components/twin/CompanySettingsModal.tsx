import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface CompanySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onSaveCompanyName?: (newName: string) => void;
  onTogglePause?: (isPaused: boolean) => void;
  onDeleteCompany?: () => void;
}

export function CompanySettingsModal({
  open,
  onOpenChange,
  companyName,
  onSaveCompanyName,
  onTogglePause,
  onDeleteCompany,
}: CompanySettingsModalProps) {
  const [name, setName] = useState(companyName);
  const [isPaused, setIsPaused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSaveCompanyName?.(name);
      onOpenChange(false);
    }, 400);
  };

  const handleTogglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    onTogglePause?.(nextState);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[480px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Company Settings
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
        <DialogDescription className="sr-only">Manage company settings, pause status, and danger zone</DialogDescription>

        <div className="mt-4 space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
              COMPANY NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 border border-slate-400 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-serif text-sm text-black dark:text-white rounded-none outline-none focus:border-black dark:focus:border-white shadow-inner"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 bg-gradient-to-b from-zinc-600 to-zinc-800 hover:from-zinc-500 hover:to-zinc-700 text-white font-mono font-bold text-xs uppercase tracking-widest border border-zinc-800 shadow-sm rounded-none transition-all active:scale-[0.99] cursor-pointer mt-2"
            >
              {isSaving ? "SAVING…" : "SAVE"}
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-800 pt-4">
            {/* Pause Company */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-serif text-sm font-semibold text-slate-900 dark:text-white">
                  Pause Company
                </h4>
                <p className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-400">
                  STOP DAILY WORK TEMPORARILY
                </p>
              </div>

              <button
                type="button"
                onClick={handleTogglePause}
                className="px-4 py-1.5 bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-900 font-mono font-bold text-[11px] uppercase tracking-wider border border-slate-400 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 shadow-sm rounded-none transition-all active:scale-[0.98] cursor-pointer"
              >
                {isPaused ? "RESUME" : "PAUSE"}
              </button>
            </div>
          </div>

          {/* Advanced / Danger Zone Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
            >
              <span>ADVANCED</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                  DANGER ZONE
                </p>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h5 className="font-serif text-sm font-semibold text-red-600 dark:text-red-400">
                      Delete Company
                    </h5>
                    <p className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-zinc-400">
                      THIS CANNOT BE UNDONE
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this company? This cannot be undone.")) {
                        onDeleteCompany?.();
                        onOpenChange(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-gradient-to-b from-red-50 to-red-100 hover:from-white hover:to-red-100 text-red-600 font-mono font-bold text-[11px] uppercase tracking-wider border border-red-400 dark:border-red-800 dark:from-red-950/40 dark:to-red-900/40 dark:text-red-400 shadow-sm rounded-none transition-all active:scale-[0.98] cursor-pointer"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
