"use client";

import { useState } from "react";
import {
  BookOpen,
  Download,
  Truck,
  CreditCard,
  Star,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface BookReaderStorefrontModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle?: string;
  authorName?: string;
}

const CHAPTER_1_TEXT = `
### Chapter 1: The Midnight Epiphany

In the bustling alleys of Banani and the software hubs of Karwan Bazar, hundreds of ambitious founders go to sleep every night with ideas that could redefine commerce in South Asia. Yet, by morning, eighty percent of those ideas stall—not because the market wasn't ready, but because the mechanical toll of hiring, coding, setting up merchant gateways, and running daily outreach suffocated the vision before it could breathe.

This book is the playbook for the modern solopreneur who refuses to let execution inertia dictate their destiny.

#### The 3 Tenets of Autonomous Venture Building:
1. **Zero Dev-Team Dependency**: Why prompt-to-production compilers and autonomous agents replace $5,000/month dev retainers.
2. **1-Tap MFS Liquidity**: The mathematical reality of 1.85% bKash/Nagad checkout conversion over foreign payment gateways.
3. **Hyper-Localized Distribution**: Using Banglish cold email cadences and 64-district Steadfast Cash-on-Delivery to capture untapped provincial markets.

As you turn these pages, remember: the co-founder you've been searching for is no longer a human sitting across the table—it's an autonomous AI engine operating while you sleep.
`;

export function BookReaderStorefrontModal({
  open,
  onOpenChange,
  bookTitle = "The Autonomous Co-Founder Blueprint",
  authorName = "Ahsan Habib & Shothik AI",
}: BookReaderStorefrontModalProps) {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [theme, setTheme] = useState<"dark" | "sepia">("dark");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const handleBuyEbook = () => {
    setOrderSuccess("🎉 E-Book Purchased! ৳250 BDT collected via 1-Tap bKash. Download link sent to your email.");
    saveOfflineTask({
      id: `book-sale-${Date.now()}`,
      title: `E-Book sold: "${bookTitle}" via 1-Tap bKash (৳250 BDT)`,
      category: "Publish",
      status: "completed",
      cost: "0 Credits",
      updatedAt: Date.now(),
    });
  };

  const handleOrderHardcover = () => {
    setOrderSuccess("🚚 Hardcover Book Ordered! Booked with Steadfast Courier (COD ৳650 BDT). Tracking code: TRK_SF_BOOK77.");
    saveOfflineTask({
      id: `book-cod-${Date.now()}`,
      title: `Hardcover COD booked: "${bookTitle}" via Steadfast Courier (৳650 BDT)`,
      category: "Publish",
      status: "completed",
      cost: "0 Credits",
      updatedAt: Date.now(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-5xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{bookTitle}</span>
                <Badge variant="outline" className="border-pink-500/40 text-pink-400 font-mono text-[10px]">
                  Public Reader Storefront
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                By {authorName} · ⭐ 4.9/5 (184 verified reader reviews)
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBuyEbook}
              className="h-8 gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs font-mono"
              data-testid="button-buy-ebook"
            >
              <CreditCard className="h-3.5 w-3.5" /> Buy E-Book (৳250)
            </Button>
            <Button
              size="sm"
              onClick={handleOrderHardcover}
              className="h-8 gap-1.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
              data-testid="button-order-hardcover"
            >
              <Truck className="h-3.5 w-3.5" /> Order COD (৳650)
            </Button>
          </div>
        </div>

        {/* Reader Controls Toolbar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between font-mono text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Chapter 1 Preview</span>
            <span className="text-slate-600">·</span>
            <span>5 min read</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-[11px]">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 rounded ${fontSize === "sm" ? "bg-slate-800 text-white font-bold" : "text-slate-400"}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("md")}
                className={`px-2 py-0.5 rounded ${fontSize === "md" ? "bg-slate-800 text-white font-bold" : "text-slate-400"}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 rounded ${fontSize === "lg" ? "bg-slate-800 text-white font-bold" : "text-slate-400"}`}
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setTheme((prev) => (prev === "dark" ? "sepia" : "dark"))}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Order Notification Banner */}
        {orderSuccess && (
          <div className="p-3 bg-emerald-950/60 border-b border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{orderSuccess}</span>
          </div>
        )}

        {/* E-Book Reader Body */}
        <div
          className={`flex-1 overflow-y-auto p-8 font-serif leading-relaxed ${
            theme === "sepia"
              ? "bg-[#fbf0d9] text-[#433422]"
              : "bg-[#0d131f] text-slate-200"
          } ${
            fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4 whitespace-pre-line">
            {CHAPTER_1_TEXT}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
