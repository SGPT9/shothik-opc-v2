import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowDownRight,
  ShieldCheck,
  Building,
  Smartphone,
  Coins,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface CreatorCashoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  availableEarningsBdt?: number;
  onSuccess?: (remainingBalance: number) => void;
}

export default function CreatorCashoutModal({
  open,
  onOpenChange,
  userId = "usr_creator_101",
  availableEarningsBdt = 4500,
  onSuccess,
}: CreatorCashoutModalProps) {
  const [provider, setProvider] = useState<"bkash" | "nagad">("bkash");
  const [amount, setAmount] = useState<number>(1500);
  const [walletNumber, setWalletNumber] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    payoutId: string;
    payoutTrxId: string;
    netDisbursedBdt: number;
    nbrTdsDeductedBdt: number;
    message: string;
  } | null>(null);

  const tdsTaxBdt = Math.round(amount * 0.1);
  const netDisbursed = Math.max(0, amount - tdsTaxBdt);

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletNumber.trim() || !/^01[3-9]\d{8}$/.test(walletNumber.trim())) {
      setError("Please enter a valid 11-digit Bangladeshi mobile number (013-019).");
      return;
    }

    if (amount < 500) {
      setError("Minimum cash-out threshold is ৳500 BDT.");
      return;
    }

    if (amount > availableEarningsBdt) {
      setError(`Requested amount exceeds available balance of ৳${availableEarningsBdt.toLocaleString()} BDT.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const idemKey = `payout_${userId}_${Date.now()}`;
      const res = await fetch("/api/v1/mfs/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idemKey,
        },
        body: JSON.stringify({
          userId,
          payoutAmountBdt: Number(amount),
          mfsProvider: provider,
          walletNumber: walletNumber.trim(),
          creatorNote: note.trim() || "Creator Marketplace Revenue Cash-Out",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to process creator payout.");
      }

      setResult({
        payoutId: data.payoutId,
        payoutTrxId: data.payoutTrxId,
        netDisbursedBdt: data.netDisbursedBdt,
        nbrTdsDeductedBdt: data.nbrTdsDeductedBdt,
        message: data.message,
      });

      if (onSuccess) {
        onSuccess(availableEarningsBdt - amount);
      }
    } catch (err: any) {
      setError(err.message || "Network error while processing MFS payout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950/95 text-slate-100 border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 select-text">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Wallet className="h-3.5 w-3.5" />
              Creator Cash-Out Rails
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-white">
            Withdraw Creator Earnings
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Instant bKash / Nagad wallet disbursement with automated 10% NBR TDS withholding certificate.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-4 space-y-4 text-center animate-in fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Disbursement Successful!</h3>
              <p className="text-xs text-emerald-400 mt-1">{result.message}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5 font-mono text-left">
              <div className="flex justify-between text-slate-400">
                <span>Net Disbursed:</span>
                <span className="text-emerald-400 font-bold">৳{result.netDisbursedBdt.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NBR 10% TDS Withheld:</span>
                <span className="text-amber-400 font-bold">৳{result.nbrTdsDeductedBdt} BDT</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MFS TrxID:</span>
                <span className="text-slate-300 truncate">{result.payoutTrxId}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                onOpenChange(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCashout} className="space-y-4 pt-2">
            {/* Available Earnings Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300/80 font-medium">Available to Withdraw</span>
                  <p className="text-base font-black text-white">৳{availableEarningsBdt.toLocaleString()} BDT</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                80% Split
              </span>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider("bkash")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  provider === "bkash"
                    ? "border-pink-500 bg-pink-500/10 text-pink-400"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                bKash Personal
              </button>
              <button
                type="button"
                onClick={() => setProvider("nagad")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  provider === "nagad"
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Nagad Wallet
              </button>
            </div>

            {/* Wallet Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Recipient {provider.toUpperCase()} Number
              </label>
              <input
                type="text"
                required
                maxLength={11}
                placeholder="01712345678"
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                data-testid="input-payout-wallet"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Withdrawal Amount (BDT)</span>
                <span className="text-slate-500">Min ৳500</span>
              </label>
              <input
                type="number"
                min={500}
                max={availableEarningsBdt}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                data-testid="input-payout-amount"
              />
            </div>

            {/* Tax & Net Breakdown */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Gross Amount:</span>
                <span className="text-white font-semibold">৳{amount.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between text-amber-400/90">
                <span>NBR 10% TDS Withheld:</span>
                <span>-৳{tdsTaxBdt} BDT</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                <span>Net You Receive:</span>
                <span>৳{netDisbursed.toLocaleString()} BDT</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer"
                data-testid="submit-creator-payout-btn"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Disbursing to MFS...
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    Withdraw ৳{netDisbursed.toLocaleString()} BDT
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
