"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Truck, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

export function BkashCourierActionCard() {
  // bKash Inspection State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // Courier Dispatch State
  const [courierProvider, setCourierProvider] = useState<"steadfast" | "pathao" | "redx">("steadfast");
  const [recipientName, setRecipientName] = useState("Nusrat Jahan");
  const [recipientPhone, setRecipientPhone] = useState("01712345678");
  const [recipientAddress, setRecipientAddress] = useState("House 42, Road 11, Banani, Dhaka");
  const [amountToCollect, setAmountToCollect] = useState("1500");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const handleVerifyBkash = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/bkash/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleText: `bKash TrxID 8M92KL0X Amount ${amountToCollect} BDT` }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err: any) {
      setVerifyResult({ isGenuine: false, message: "Verification error: " + err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDispatchCourier = async () => {
    setIsDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch("/api/courier/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierProvider,
          recipientName,
          recipientPhone,
          recipientAddress,
          itemDescription: "Custom Leather Wallet",
          amountToCollect: Number(amountToCollect) || 1500,
        }),
      });
      const data = await res.json();
      setDispatchResult(data);
    } catch (err: any) {
      setDispatchResult({ success: false, message: "Dispatch error: " + err.message });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">bKash Payment Inspector & Courier Dispatch</h3>
            <p className="text-xs text-zinc-400">Instant OCR Fraud Verification & 1-Click Pickup Booking</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Live Merchant Suite
        </span>
      </div>

      {/* Step 1: bKash Fraud Inspector */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-400 text-xs flex items-center justify-center font-bold">1</span>
            bKash / Nagad Fraud Inspection
          </h4>
          <span className="text-xs text-zinc-500">OCR & TrxID Verification</span>
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            value={amountToCollect}
            onChange={(e) => setAmountToCollect(e.target.value)}
            placeholder="Amount (৳ BDT)"
            className="w-1/3 px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={handleVerifyBkash}
            disabled={isVerifying}
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {isVerifying ? "Inspecting Screenshot..." : "🛡️ Verify bKash Payment"}
          </button>
        </div>

        {/* Verification Result Banner */}
        {verifyResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
              verifyResult.isGenuine
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {verifyResult.isGenuine ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{verifyResult.message}</p>
              {verifyResult.trxId && (
                <p className="opacity-80">
                  TrxID: <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono">{verifyResult.trxId}</code> | Amount: ৳{verifyResult.amountBdt} BDT | Confidence: {(verifyResult.confidenceScore * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Courier Rider Dispatch */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-bold">2</span>
            1-Click Courier Rider Dispatch
          </h4>
          <span className="text-xs text-zinc-500">Steadfast / Pathao / RedX</span>
        </div>

        {/* Provider Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(["steadfast", "pathao", "redx"] as const).map((prov) => (
            <button
              key={prov}
              onClick={() => setCourierProvider(prov)}
              className={`py-2 text-xs font-bold rounded-lg border uppercase transition-all ${
                courierProvider === prov
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {prov}
            </button>
          ))}
        </div>

        {/* Recipient Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Recipient Name"
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="tel"
            inputMode="tel"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          />
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Delivery Address"
            className="col-span-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleDispatchCourier}
          disabled={isDispatching}
          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isDispatching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Truck className="w-4 h-4" />
          )}
          {isDispatching ? "Scheduling Rider Pickup..." : `🚚 Dispatch ${courierProvider.toUpperCase()} Pickup Rider`}
        </button>

        {/* Dispatch Result Banner */}
        {dispatchResult && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-indigo-200">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {dispatchResult.message}
            </div>
            {dispatchResult.trackingId && (
              <p className="opacity-80">
                Tracking ID: <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono">{dispatchResult.trackingId}</code> | Fee: ৳{dispatchResult.deliveryFee} BDT | Pickup: {dispatchResult.estimatedPickup}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
