import React, { useState } from "react";
import {
  Video,
  Truck,
  CheckCircle2,
  Copy,
  Sparkles,
  RefreshCw,
  Phone,
  MapPin,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FCommerceLiveParserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FCommerceLiveParserModal({ isOpen, onClose }: FCommerceLiveParserModalProps) {
  const [streamUrl, setStreamUrl] = useState("https://facebook.com/live/shothik_fashion_bd");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedOrders, setParsedOrders] = useState([
    {
      id: "ORD_7891",
      customerName: "সুলতানা পারভীন",
      phone: "01712345678",
      address: "বাসা ২৪, রোড ৭, ধানমন্ডি, ঢাকা",
      product: "প্রিমিয়াম কাতান শাড়ি (নীল)",
      quantity: 1,
      priceBdt: 3850,
      bkashCheckoutUrl: "https://shothik.ai/pay/bKash/bk_99812",
      steadfastTrackingCode: "BD_ST_881234",
      status: "BKASH_SENT",
    },
    {
      id: "ORD_7892",
      customerName: "তানভীর আহমেদ",
      phone: "01898765432",
      address: "জিইসি মোড়, চট্টগ্রাম",
      product: "মেনস কটন পাঞ্জাবি (সাদা - L)",
      quantity: 2,
      priceBdt: 2900,
      bkashCheckoutUrl: "https://shothik.ai/pay/bKash/bk_99815",
      steadfastTrackingCode: "BD_ST_881235",
      status: "DISPATCHED",
    },
  ]);

  const handleStartParsing = () => {
    setIsParsing(true);

    fetch("/api/v1/connectors/fcommerce/parse-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          setParsedOrders((prev) => [...data.orders, ...prev]);
        }
      })
      .catch(() => {})
      .finally(() => setIsParsing(false));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                F-Commerce Live Connector (Pillar 7)
                <Badge variant="outline" className="border-rose-500/40 text-rose-400 text-[10px]">
                  Facebook Graph API
                </Badge>
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Auto-convert Facebook Live comments into bKash PGW links & Steadfast courier bookings
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center gap-3">
          <div className="relative flex-1">
            <Video className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
              placeholder="Paste Facebook Live Video URL..."
            />
          </div>
          <Button
            onClick={handleStartParsing}
            disabled={isParsing}
            className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Parsing Comments...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Trigger Live Connector
              </>
            )}
          </Button>
        </div>

        {/* Parsed Orders List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              Connector Extracted Orders ({parsedOrders.length})
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              1% GMV Fee (Free tier: 50 orders/mo)
            </span>
          </div>

          <div className="space-y-3">
            {parsedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{order.customerName}</span>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                      {order.id}
                    </Badge>
                  </div>
                  <Badge
                    className={
                      order.status === "DISPATCHED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }
                  >
                    {order.status === "DISPATCHED" ? "Steadfast Dispatched" : "bKash Link Sent"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-mono text-zinc-200">{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate text-zinc-200">{order.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">{order.product} (x{order.quantity})</span>
                    <span className="font-bold text-amber-400">৳{order.priceBdt.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] border-zinc-700 text-zinc-300 hover:text-white"
                      onClick={() => navigator.clipboard.writeText(order.bkashCheckoutUrl)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      bKash Link
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      <Truck className="w-3 h-3 mr-1" />
                      {order.steadfastTrackingCode}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            Automated SMS & Messenger Payment Link Dispatch Active
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
            Close Parser
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
