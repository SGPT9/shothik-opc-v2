"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, AlertCircle, Copy, Check, MessageSquare, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { LiquidGlassCard } from "./LiquidGlassCard.js";

export interface CourierOrderDetails {
  invoiceNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  deliveryCharge?: number;
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
  const [isBooking, setIsBooking] = useState(false);
  const [bookedConsignment, setBookedConsignment] = useState<{ id: string; tracking: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleBookSteadfast = async () => {
    if (!order) return;
    setIsBooking(true);
    setBookingError(null);

    try {
      const res = await fetch("http://localhost:8080/api/v1/logistics/steadfast/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: order.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
          recipient_name: order.recipientName,
          recipient_phone: order.recipientPhone,
          recipient_address: order.recipientAddress,
          cod_amount: order.codAmount || 0,
          note: order.note || "Handled via Shothik AI Sales Twin",
        }),
      });

      const data = await res.json();
      if (data.success && data.consignment) {
        const result = {
          id: String(data.consignment.consignment_id),
          tracking: data.consignment.tracking_code,
        };
        setBookedConsignment(result);
        onDispatchSuccess?.(result.id, result.tracking);
      } else {
        setBookingError(data.error || "Failed to book with Steadfast. Please check details.");
      }
    } catch (err: any) {
      setBookingError(err.message || "Network error connecting to logistics gateway.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCopyWhatsAppText = () => {
    if (!order) return;
    const trackingInfo = bookedConsignment ? `Tracking Code: ${bookedConsignment.tracking}` : `Invoice: ${order.invoiceNumber}`;
    const text = `Assalamu Alaikum ${order.recipientName}, your order has been confirmed!\n${trackingInfo}\nDelivery Address: ${order.recipientAddress}\nTotal Amount: ৳${order.codAmount}\nThank you for shopping with us!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <LiquidGlassCard
      intensity="vibrant"
      glowColor={payment?.provider === "bkash" ? "rgba(236, 72, 153, 0.2)" : "rgba(16, 185, 129, 0.2)"}
      className={`my-3 p-4 space-y-3.5 max-w-xl text-foreground animate-in fade-in zoom-in-98 duration-200 ${className}`}
    >
      {/* ── 1. Payment Verification Section ── */}
      {payment && (
        <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              payment.provider === "bkash" ? "bg-pink-500/20 text-pink-500" : "bg-orange-500/20 text-orange-500"
            }`}>
              {payment.provider === "bkash" ? "bK" : "Ng"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-mono">৳{payment.amount.toLocaleString()}</span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">({payment.provider})</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground block">
                TrxID: <span className="text-foreground font-semibold">{payment.trxId}</span>
                {payment.senderPhone && ` • Sender: ${payment.senderPhone}`}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            ✓ Settled
          </span>
        </div>
      )}

      {/* ── 2. Steadfast Courier Order Section ── */}
      {order && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold">Steadfast Courier Dispatch</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {order.invoiceNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">Recipient</span>
              <span className="font-semibold">{order.recipientName}</span>
              <span className="text-[11px] font-mono text-muted-foreground block">{order.recipientPhone}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">COD Collection</span>
              <span className="font-mono font-bold text-emerald-500">৳{order.codAmount.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground block">Charge: ৳{order.deliveryCharge || 60}</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-secondary/30 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Address: </span>
            {order.recipientAddress}
          </div>

          {bookingError && (
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* ── 3. Actions / Confirmation State ── */}
          {bookedConsignment ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Booked on Steadfast!
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  CID: #{bookedConsignment.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
                <span className="text-[11px] font-mono">Tracking: <span className="font-bold text-foreground">{bookedConsignment.tracking}</span></span>
                <button
                  type="button"
                  onClick={handleCopyWhatsAppText}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
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
                onClick={handleBookSteadfast}
                disabled={isBooking}
                className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Booking with Steadfast...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" />
                    <span>1-Click Dispatch to Steadfast</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="py-2 px-3 rounded-xl bg-secondary/80 hover:bg-secondary text-xs font-semibold text-foreground transition flex items-center gap-1 cursor-pointer"
                title="Copy Customer Confirmation"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-[11px]">{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </LiquidGlassCard>
  );
}
