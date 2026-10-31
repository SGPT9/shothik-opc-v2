"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BkashCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  invoiceNumber?: string;
  onPaymentSuccess?: (trxId: string) => void;
}

export default function BkashCheckoutModal({
  isOpen,
  onClose,
  defaultAmount = 2500,
  invoiceNumber = "INV-890123",
  onPaymentSuccess,
}: BkashCheckoutModalProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [trxIdInput, setTrxIdInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/payments/bkash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          merchantInvoiceNumber: invoiceNumber,
          intent: "sale",
        }),
      });
      const data = await res.json();

      // Trigger Fraud Verification API check
      const verifyRes = await fetch("/api/tools/payment-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: trxIdInput || data.paymentID || `9X87${Date.now().toString().slice(-4)}`,
          expectedAmount: amount,
          paymentChannel: "bkash",
        }),
      });
      const verifyData = await verifyRes.json();

      setVerificationResult(verifyData);
      if (verifyData.status === "verified") {
        onPaymentSuccess?.(verifyData.trxId);
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        status: "fake_detected",
        message: "Network error processing payment request.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-pink-500/30 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-lg">
              ৳
            </div>
            <div>
              <h3 className="font-bold text-white text-base">bKash Merchant Checkout</h3>
              <p className="text-xs text-slate-400">Automated Instant Merchant Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout modal"
            className="text-slate-400 hover:text-white text-lg font-bold p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
          >
            ✕
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Invoice Ref:</span>
            <span className="font-mono text-slate-200">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
            <span>Total Payable Amount:</span>
            <span className="text-pink-400 font-mono">৳{amount.toLocaleString()} BDT</span>
          </div>
        </div>

        {/* TrxID / OCR Form */}
        <div className="space-y-3">
          <label htmlFor="bkash-trx-id" className="text-xs font-medium text-slate-300 block">
            Enter bKash Transaction ID (or Paste TrxID):
          </label>
          <input
            id="bkash-trx-id"
            type="text"
            placeholder="e.g. 9X87Y12300"
            value={trxIdInput}
            onChange={(e) => setTrxIdInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus-visible:ring-2 focus-visible:ring-pink-500 transition font-mono uppercase"
          />
        </div>

        {/* Verification Alert Output */}
        {verificationResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              verificationResult.status === "verified"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {verificationResult.status === "verified" ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              )}
              <span>{verificationResult.message}</span>
            </div>
            {verificationResult.confidenceScore && (
              <p className="text-[10px] text-slate-400 pl-6">
                OpenSearch-VL OCR Confidence: {(verificationResult.confidenceScore * 100).toFixed(0)}%
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="flex-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying Ledger...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5" />
                <span>Verify & Complete Checkout</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
