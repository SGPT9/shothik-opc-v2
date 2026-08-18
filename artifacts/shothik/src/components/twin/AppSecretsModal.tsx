import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Eye, EyeOff, Trash2, Edit3, Plus } from "lucide-react";

interface SecretItem {
  id: string;
  name: string;
  value: string;
  isRevealed?: boolean;
  isEditing?: boolean;
}

interface AppSecretsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSecretChange?: () => void;
}

const SYSTEM_SECRETS = [
  { name: "BETTER_AUTH_TRUSTED_ORIGINS", value: "https://shothikaddress.com" },
  { name: "DATABASE_URL", value: "postgresql://postgres:***@db.polsia.internal:5432/verifiq" },
  { name: "NODE_ENV", value: "production" },
  { name: "OPENAI_API_KEY", value: "sk-or-v1-********************************" },
  { name: "OPENAI_BASE_URL", value: "https://openrouter.ai/api/v1" },
  { name: "POLSIA_AI_BASE_URL", value: "https://api.polsia.app/ai/v1" },
  { name: "POLSIA_ANALYTICS_SLUG", value: "vq_analytics_live_8910" },
  { name: "POLSIA_API_BASE_URL", value: "https://api.polsia.app/v1" },
  { name: "POLSIA_API_KEY", value: "pol_sec_991823190abf" },
];

export function AppSecretsModal({ open, onOpenChange, onSecretChange }: AppSecretsModalProps) {
  const [secrets, setSecrets] = useState<SecretItem[]>([
    {
      id: "sec-1",
      name: "AML_API_KEY",
      value: "sk_live_opensanctions_981a27b8",
      isRevealed: false,
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddSecret = () => {
    if (!newName.trim() || !newValue.trim()) return;
    const item: SecretItem = {
      id: `sec-${Date.now()}`,
      name: newName.trim().toUpperCase().replace(/\s+/g, "_"),
      value: newValue.trim(),
      isRevealed: false,
    };
    setSecrets((prev) => [...prev, item]);
    setNewName("");
    setNewValue("");
    onSecretChange?.();
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    onSecretChange?.();
  };

  const handleToggleReveal = (id: string) => {
    setSecrets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isRevealed: !s.isRevealed } : s))
    );
  };

  const beveledBtnClass =
    "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 font-mono font-semibold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer rounded-md select-none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[660px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-1 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            App Secrets
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
        <DialogDescription className="text-xs font-serif text-slate-700 dark:text-zinc-300 leading-relaxed pb-2">
          Environment variables injected into your app on every deploy. Changes take effect on your next deploy.
        </DialogDescription>

        <div className="space-y-6 pt-2 font-mono text-xs">
          {/* Custom Secrets Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1">
              <div className="col-span-3">NAME</div>
              <div className="col-span-6">VALUE</div>
              <div className="col-span-3 text-right">ACTIONS</div>
            </div>

            {secrets.map((sec) => (
              <div key={sec.id} className="grid grid-cols-12 gap-2 items-center py-1">
                <div className="col-span-3 font-bold text-black dark:text-white truncate">
                  {sec.name}
                </div>

                <div className="col-span-6">
                  <input
                    type={sec.isRevealed ? "text" : "password"}
                    value={sec.value}
                    readOnly
                    className="w-full px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs font-mono select-all outline-none"
                  />
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => handleToggleReveal(sec.id)}
                    className="text-slate-700 dark:text-zinc-300 hover:underline cursor-pointer"
                  >
                    {sec.isRevealed ? "HIDE" : "REVEAL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = prompt("Enter new value for " + sec.name, sec.value);
                      if (updated !== null) {
                        setSecrets((prev) =>
                          prev.map((s) => (s.id === sec.id ? { ...s, value: updated } : s))
                        );
                        onSecretChange?.();
                      }
                    }}
                    className="text-slate-700 dark:text-zinc-300 hover:underline cursor-pointer"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSecret(sec.id)}
                    className="text-red-600 dark:text-red-500 hover:underline cursor-pointer"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Secret Row */}
            <div className="grid grid-cols-12 gap-2 pt-2 items-center">
              <div className="col-span-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="NEW_SECRET_NAME"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-400 dark:border-zinc-700 font-mono text-xs outline-none uppercase placeholder:normal-case"
                />
              </div>

              <div className="col-span-6">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="value"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-400 dark:border-zinc-700 font-mono text-xs outline-none"
                />
              </div>

              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddSecret}
                  disabled={!newName.trim() || !newValue.trim()}
                  className={`w-full ${beveledBtnClass}`}
                >
                  ADD
                </button>
              </div>
            </div>
          </div>

          {/* System Secrets Provided by Polsia */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div>
              <span className="font-serif font-bold text-sm text-black dark:text-white">
                Provided by Polsia
              </span>{" "}
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                Read-only – set by Polsia.
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 pb-1">
              <div className="col-span-6">NAME</div>
              <div className="col-span-6">VALUE</div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {SYSTEM_SECRETS.map((sec, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center py-1">
                  <div className="col-span-6 font-bold text-slate-600 dark:text-zinc-400 truncate text-[11px]">
                    {sec.name}
                  </div>
                  <div className="col-span-6">
                    <input
                      type="password"
                      value={sec.value}
                      readOnly
                      className="w-full px-2.5 py-1 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-400 dark:text-zinc-600 select-none outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
