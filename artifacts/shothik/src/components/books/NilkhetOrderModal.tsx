"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Truck,
  CheckCircle2,
  Package,
  Sparkles,
  MapPin,
  Phone,
  User,
  CreditCard,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NilkhetOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  pageCount?: number;
  authorName?: string;
  coverUrl?: string;
}

export function NilkhetOrderModal({
  open,
  onOpenChange,
  bookTitle,
  pageCount = 120,
  authorName = "Shothik Author",
  coverUrl,
}: NilkhetOrderModalProps) {
  // Config state
  const [copies, setCopies] = useState<number>(1);
  const [paperType, setPaperType] = useState<string>("80gsm_cream");
  const [bindingType, setBindingType] = useState<string>("paperback_glue");
  const [coverFinish, setCoverFinish] = useState<string>("matte");
  const [city, setCity] = useState<string>("Dhaka");

  // Recipient info
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Calculation state
  const [calculating, setCalculating] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);

  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live estimate calculation
  useEffect(() => {
    if (!open) return;
    let isCancelled = false;

    async function fetchEstimate() {
      setCalculating(true);
      try {
        const res = await fetch("/api/v1/publishing/estimate-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageCount,
            copyCount: copies,
            paperType,
            bindingType,
            coverFinish,
            deliveryCity: city,
          }),
        });
        const data = await res.json();
        if (!isCancelled && data.success) {
          setCostBreakdown(data.breakdown);
        }
      } catch (err) {
        console.error("Error calculating Nilkhet estimate:", err);
      } finally {
        if (!isCancelled) setCalculating(false);
      }
    }

    fetchEstimate();
    return () => {
      isCancelled = true;
    };
  }, [open, copies, paperType, bindingType, coverFinish, city, pageCount]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage("Please provide complete name, phone number, and delivery address.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/publishing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle,
          pageCount,
          copyCount: copies,
          paperType,
          bindingType,
          totalPriceBdt: costBreakdown?.totalPayableBdt || 450,
          recipientName,
          recipientPhone,
          deliveryAddress,
          city,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult(data);
      } else {
        setErrorMessage(data.error || "Failed to place printing order. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrderResult(null);
    setErrorMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background text-foreground border-border shadow-2xl rounded-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 border-b border-border/50 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                Nilkhet Print-on-Demand (POD) Order
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ekushey Standard
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-300 mt-0.5">
                Physical book printing at Bakushah Market, Nilkhet with Steadfast Courier door-to-door delivery.
              </DialogDescription>
            </div>
          </div>
        </div>

        {orderResult ? (
          /* Order Confirmation Screen */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2 py-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-in zoom-in-95">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Order Successfully Placed!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your manuscript has been dispatched to the Nilkhet press hub. A Steadfast courier consignment has been automatically created.
              </p>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-bold text-foreground">{orderResult.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Steadfast Tracking Code:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {orderResult.trackingCode}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Total Payable (Cash on Delivery):</span>
                <span className="font-bold text-foreground text-sm">৳{orderResult.totalPayableBdt} BDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-indigo-500">{orderResult.statusBangla}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} className="text-xs">
                Close
              </Button>
              <Button
                onClick={() => window.open(orderResult.trackingUrl, "_blank")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
              >
                Track Live Parcel <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Order Configuration Form */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
                {errorMessage}
              </div>
            )}

            {/* Book Overview Pill */}
            <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl">
              <div className="h-12 w-9 rounded bg-slate-800 shrink-0 overflow-hidden border border-border flex items-center justify-center">
                {coverUrl ? (
                  <img src={coverUrl} alt={bookTitle} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-4 w-4 text-zinc-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">{bookTitle}</h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  By {authorName} · {pageCount} Pages · 6x9" Standard
                </p>
              </div>
            </div>

            {/* Manufacturing & Material Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paper Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" /> Paper Quality
                </label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full h-9 rounded-lg bg-card border border-border px-2.5 text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="70gsm_offset">70gsm White Offset (Standard - ৳0.55/p)</option>
                  <option value="80gsm_cream">80gsm Swedish Book-Cream (Deluxe - ৳0.75/p)</option>
                  <option value="100gsm_art">100gsm Art Gloss Paper (Illustrated - ৳1.20/p)</option>
                </select>
              </div>

              {/* Binding Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" /> Binding Style
                </label>
                <select
                  value={bindingType}
                  onChange={(e) => setBindingType(e.target.value)}
                  className="w-full h-9 rounded-lg bg-card border border-border px-2.5 text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="paperback_glue">Paperback Thermal Glue (৳35)</option>
                  <option value="hardcover_jacket">Hardcover with Dust Jacket (৳140)</option>
                  <option value="spiral">Wire-O Spiral Bound (৳45)</option>
                </select>
              </div>

              {/* Cover Lamination */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" /> Cover Lamination
                </label>
                <select
                  value={coverFinish}
                  onChange={(e) => setCoverFinish(e.target.value)}
                  className="w-full h-9 rounded-lg bg-card border border-border px-2.5 text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="matte">Matte Velvet Finish (+৳15)</option>
                  <option value="gloss">Glossy UV Finish (+৳10)</option>
                </select>
              </div>

              {/* Copies Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> Quantity (Copies)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 rounded-lg bg-card border border-border px-2.5 text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-muted-foreground shrink-0">Copy / Copies</span>
                </div>
              </div>
            </div>

            {/* Delivery & Shipping Information */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Steadfast Courier Shipping (Cash on Delivery)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Recipient Name</label>
                  <div className="relative">
                    <User className="h-3.5 w-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahim Chowdhury"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-card border border-border text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Phone Number (Bangladeshi)</label>
                  <div className="relative">
                    <Phone className="h-3.5 w-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-card border border-border text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Delivery Street Address</label>
                  <div className="relative">
                    <MapPin className="h-3.5 w-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="House, Road, Area (e.g. Dhanmondi 27)"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 rounded-lg bg-card border border-border text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Destination Region</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 rounded-lg bg-card border border-border px-2.5 text-xs text-foreground focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Dhaka">Dhaka Metro (৳60)</option>
                    <option value="Chittagong">Chittagong (৳120)</option>
                    <option value="Sylhet">Sylhet (৳120)</option>
                    <option value="Rajshahi">Rajshahi (৳120)</option>
                    <option value="Khulna">Khulna (৳120)</option>
                    <option value="Barisal">Barisal (৳120)</option>
                    <option value="Rangpur">Rangpur (৳120)</option>
                    <option value="Mymensingh">Mymensingh (৳120)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Summary Card */}
            <div className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Print Cost ({copies} {copies === 1 ? "copy" : "copies"}):</span>
                <span className="font-medium text-foreground">
                  {calculating ? "..." : `৳${costBreakdown?.totalPrintCostBdt || 0} BDT`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Steadfast Doorstep Delivery:</span>
                <span className="font-medium text-foreground">
                  {calculating ? "..." : `৳${costBreakdown?.deliveryFeeBdt || 0} BDT`}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-foreground">Total Payable Amount:</span>
                  <p className="text-[10px] text-muted-foreground">Pay via bKash / Cash on Delivery (COD)</p>
                </div>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {calculating ? "..." : `৳${costBreakdown?.totalPayableBdt || 0} BDT`}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Est. Delivery: {costBreakdown?.estimatedDeliveryDays || "2-3 Days"}
              </span>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || calculating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md"
                >
                  {submitting ? "Placing Order..." : "Confirm & Order Book"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
