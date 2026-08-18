"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, AlertCircle, Copy, Check, MessageSquare, ShieldCheck, Loader2, RefreshCw, Send, Lock } from "lucide-react";
import { LiquidGlassCard, type LiquidGlassPalette } from "./LiquidGlassCard";
import { RouteXpressAdapter } from "@/lib/demography/routexpress-adapter";
import { BkashGateway } from "@/lib/demography/bkash-gateway";

export interface CourierOrderDetails {
  invoiceNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district?: string;
  codAmount: number;
  deliveryCharge?: number;
  weightKg?: number;
  note?: string;
}

export interface PaymentVerificationDetails {
  trxId: string;
  amount: number;
  provider: "bkash" | "nagad" | "rocket";
  senderPhone?: string;
  verifiedAt?: string;
  status: "verified" | "pending" | "rejected";
}

export interface CommerceActionCardProps {
  order?: CourierOrderDetails;
  payment?: PaymentVerificationDetails;
  onDispatchSuccess?: (consignmentId: string, trackingCode: string) => void;
  className?: string;
}

export function CommerceActionCard({
  order,
  payment,
  onDispatchSuccess,
  className = "",
}: CommerceActionCardProps) {
  const [chosenCarrier, setChosenCarrier] = useState<"steadfast" | "pathao" | "redx">("steadfast");
  const [isBooking, setIsBooking] = useState(false);
  const [bookedConsignment, setBookedConsignment] = useState<{ id: string; tracking: string; carrierName: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // MFS Dual Mode State
  const [mfsMode, setMfsMode] = useState<"tokenized" | "p2p">("tokenized");
  const [customTrxId, setCustomTrxId] = useState(payment?.trxId || "BK99281726X");
  const [p2pVerified, setP2pVerified] = useState(true);

  const district = order?.district || "Dhaka";
  const quotes = RouteXpressAdapter.compareRates(district, order?.codAmount || 1850, order?.weightKg || 0.5);

  const handleVerifyP2p = () => {
    const bkash = new BkashGateway();
    const result = bkash.verifyP2pTrxId({
      orderId: order?.invoiceNumber || "ORD-8891",
      trxId: customTrxId,
      senderPhone: order?.recipientPhone || "01711000000",
      amount: 150,
    });
    setP2pVerified(result.isValid);
  };

  const handleBookCourier = async () => {
    if (!order) return;
    setIsBooking(true);
    setBookingError(null);

    try {
      // Execute RouteXpress unified multi-carrier dispatch
      const dispatch = RouteXpressAdapter.dispatchParcel({
        invoice: order.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        recipientAddress: order.recipientAddress,
        district: district,
        codAmount: order.codAmount || 0,
        weightKg: order.weightKg || 0.5,
        note: order.note || "Dispatched via RouteXpress & Shothik AI",
      }, chosenCarrier);

      const result = {
        id: dispatch.consignmentId,
        tracking: dispatch.trackingCode,
        carrierName: chosenCarrier === "steadfast" ? "Steadfast Courier" : chosenCarrier === "pathao" ? "Pathao Courier" : "REDX Logistics",
      };

      setBookedConsignment(result);
      onDispatchSuccess?.(result.id, result.tracking);
    } catch (err: any) {
      setBookingError(err.message || "Network error connecting to logistics gateway.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCopyWhatsAppText = () => {
    if (!order) return;
    const trackingInfo = bookedConsignment ? `Tracking Code: ${bookedConsignment.tracking}` : `Invoice: ${order.invoiceNumber}`;
    const text = `Assalamu Alaikum ${order.recipientName}, your order has been confirmed via ${bookedConsignment?.carrierName || "Steadfast"}!\n${trackingInfo}\nDelivery Address: ${order.recipientAddress}\nTotal Payable: ৳${order.codAmount}\nTrack updates online on Shothik!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const cardPalette: LiquidGlassPalette = payment?.provider === "bkash" ? "bkash" : "steadfast";

  return (
    <LiquidGlassCard
      intensity="vibrant"
      palette={cardPalette}
      className={`my-3 p-4 space-y-4 max-w-xl text-slate-100 animate-in fade-in zoom-in-98 duration-200 ${className}`}
    >
      {/* ── 1. bKash / Nagad MFS Gateway Section (Dual Mode) ── */}
      <div className="p-3 rounded-xl bg-black/35 border border-white/10 space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
              bK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">bKash MFS Settlement</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400">Advance Delivery Fee Lock (৳150)</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setMfsMode("tokenized")}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                mfsMode === "tokenized" ? "bg-rose-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tokenized API
            </button>
            <button
              type="button"
              onClick={() => setMfsMode("p2p")}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                mfsMode === "p2p" ? "bg-rose-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              P2P TrxID
            </button>
          </div>
        </div>

        {mfsMode === "tokenized" ? (
          <div className="flex items-center justify-between pt-1 text-xs">
            <div>
              <span className="text-[11px] font-mono font-bold text-white">৳1,850 (BDT)</span>
              <span className="text-[10px] font-mono text-slate-400 block">TrxID: <span className="text-emerald-400 font-semibold">{customTrxId}</span></span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ✓ Tokenized Settled
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customTrxId}
              onChange={(e) => setCustomTrxId(e.target.value)}
              placeholder="Enter 10-digit TrxID"
              className="flex-1 bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono text-white placeholder:text-slate-500 outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleVerifyP2p}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition cursor-pointer"
            >
              Verify TrxID
            </button>
          </div>
        )}
      </div>

      {/* ── 2. RouteXpress Multi-Carrier Logistics Router ── */}
      {order && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">RouteXpress Multi-Courier Router</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {order.invoiceNumber}
            </span>
          </div>

          {/* Carrier Selection Chips */}
          <div className="grid grid-cols-3 gap-2">
            {quotes.map((q) => {
              const isSelected = chosenCarrier === q.carrier;
              return (
                <button
                  key={q.carrier}
                  type="button"
                  onClick={() => setChosenCarrier(q.carrier)}
                  className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600/20 border-emerald-500 text-white shadow-xs"
                      : "bg-black/30 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{q.name.split(" ")[0]}</span>
                    <span className="font-mono text-emerald-400">৳{q.totalDeliveryCost}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{q.slaDays} Day SLA {q.isRecommended && "• Best"}</span>
                </button>
              );
            })}
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 p-2.5 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-slate-400 block">Recipient</span>
              <span className="font-semibold text-slate-200">{order.recipientName}</span>
              <span className="text-[10px] font-mono text-slate-400 block">{order.recipientPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">COD Collection</span>
              <span className="font-mono font-bold text-emerald-400">৳{order.codAmount.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">Delivery: {chosenCarrier.toUpperCase()} (৳{quotes.find(q => q.carrier === chosenCarrier)?.totalDeliveryCost})</span>
            </div>
          </div>

          {bookingError && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* ── 3. Actions / Booked State ── */}
          {bookedConsignment ? (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Booked on {bookedConsignment.carrierName}!
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                  CID: #{bookedConsignment.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
                <span className="text-[11px] font-mono text-slate-300">Tracking: <span className="font-bold text-white">{bookedConsignment.tracking}</span></span>
                <button
                  type="button"
                  onClick={handleCopyWhatsAppText}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer select-none"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                  {copiedLink ? "Copied!" : "WhatsApp Msg"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBookCourier}
                disabled={isBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer select-none shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Booking with {chosenCarrier.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>1-Click Dispatch to {chosenCarrier === "steadfast" ? "Steadfast" : chosenCarrier === "pathao" ? "Pathao" : "REDX"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center gap-1 cursor-pointer select-none"
                title="Copy Customer Confirmation"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-[11px]">{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </LiquidGlassCard>
  );
}
