import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, Check } from "lucide-react";

interface AddCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (plan: string, amount: number, credits?: number) => void;
}

const MONTHLY_TIERS = [
  { value: "15_credits", label: "15 CREDITS/MO – $19/MO", credits: 15, price: 19 },
  { value: "30_credits", label: "30 CREDITS/MO – $35/MO", credits: 30, price: 35 },
  { value: "60_credits", label: "60 CREDITS/MO – $65/MO", credits: 60, price: 65 },
  { value: "120_credits", label: "120 CREDITS/MO – $120/MO", credits: 120, price: 120 },
];

const TOP_UP_TIERS = [
  { value: "10_topup", label: "10 CREDITS – $15", credits: 10, price: 15 },
  { value: "25_topup", label: "25 CREDITS – $30", credits: 25, price: 30 },
  { value: "50_topup", label: "50 CREDITS – $55", credits: 50, price: 55 },
];

export function AddCreditsModal({ open, onOpenChange, onSuccess }: AddCreditsModalProps) {
  const [mode, setMode] = useState<"monthly" | "topup">("monthly");
  const [monthlyTier, setMonthlyTier] = useState("15_credits");
  const [topupTier, setTopupTier] = useState("10_topup");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedMonthly = MONTHLY_TIERS.find((t) => t.value === monthlyTier) || MONTHLY_TIERS[0];
  const selectedTopup = TOP_UP_TIERS.find((t) => t.value === topupTier) || TOP_UP_TIERS[0];

  const handleAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const chosen = mode === "monthly" ? selectedMonthly : selectedTopup;
      onSuccess?.(chosen.label, chosen.price, chosen.credits);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[500px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Add More Credits
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
        <DialogDescription className="text-sm font-sans text-slate-600 dark:text-zinc-400">
          Choose a monthly plan or a one-time top-up.
        </DialogDescription>

        <div className="space-y-4 mt-6 font-mono">
          {/* Option 1: Monthly Plan */}
          <div
            onClick={() => setMode("monthly")}
            className={`p-5 border cursor-pointer transition-all ${
              mode === "monthly"
                ? "border-black dark:border-white bg-white dark:bg-zinc-900"
                : "border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 opacity-80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Add a monthly plan
                </h4>
                <p className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                  GET CREDITS EVERY MONTH AT A LOWER RATE.
                </p>
              </div>

              <div className="w-4 h-4 rounded-full border border-black dark:border-white flex items-center justify-center">
                {mode === "monthly" && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
              </div>
            </div>

            {mode === "monthly" && (
              <div className="mt-4 space-y-2">
                <select
                  value={monthlyTier}
                  onChange={(e) => setMonthlyTier(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold uppercase tracking-wider rounded-none outline-none"
                >
                  {MONTHLY_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>

                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono tracking-wider">
                  CREDITS RENEW MONTHLY. CANCEL ANYTIME.
                </p>
              </div>
            )}
          </div>

          {/* Option 2: Top up credits */}
          <div
            onClick={() => setMode("topup")}
            className={`p-5 border cursor-pointer transition-all ${
              mode === "topup"
                ? "border-black dark:border-white bg-white dark:bg-zinc-900"
                : "border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 opacity-80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Top up credits
                </h4>
                <p className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mt-0.5">
                  PURCHASE ON DEMAND. USE ANYTIME.
                </p>
              </div>

              <div className="w-4 h-4 rounded-full border border-slate-400 dark:border-zinc-600 flex items-center justify-center">
                {mode === "topup" && <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />}
              </div>
            </div>

            {mode === "topup" && (
              <div className="mt-4 space-y-2">
                <select
                  value={topupTier}
                  onChange={(e) => setTopupTier(e.target.value)}
                  className="w-full py-2.5 px-3 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold uppercase tracking-wider rounded-none outline-none"
                >
                  {TOP_UP_TIERS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 space-y-3 font-mono">
          <button
            type="button"
            onClick={handleAction}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-gradient-to-b from-zinc-800 to-black hover:from-zinc-700 hover:to-zinc-900 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-md rounded-none transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>PROCESSING…</span>
            ) : mode === "monthly" ? (
              <span>SUBSCRIBE – ${selectedMonthly.price}/MO</span>
            ) : (
              <span>PURCHASE TOP-UP – ${selectedTopup.price}</span>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            USES YOUR SAVED PAYMENT METHOD, OR OPENS CHECKOUT TO ADD ONE.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
