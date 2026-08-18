"use client";

import { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Globe,
  ExternalLink,
  RefreshCw,
  Sliders,
  DollarSign,
  CheckCircle2,
  Shield,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface CompetitorTrack {
  id: string;
  skuName: string;
  myPrice: number;
  marketAvg: number;
  competitors: {
    platform: string;
    price: number;
    inStock: boolean;
    url: string;
  }[];
  priceDifferencePct: number;
  recommendation: string;
}

const COMPETITOR_DATA: CompetitorTrack[] = [
  {
    id: "pw-1",
    skuName: "Handcrafted Jamdani Silk Panjabi",
    myPrice: 2850,
    marketAvg: 3100,
    competitors: [
      { platform: "Daraz BD", price: 3200, inStock: true, url: "https://daraz.com.bd" },
      { platform: "Aarong Online", price: 3450, inStock: true, url: "https://aarong.com" },
      { platform: "F-Commerce Top Shop", price: 2950, inStock: false, url: "https://facebook.com" },
    ],
    priceDifferencePct: -8.1,
    recommendation: "Increase to ৳2,990 (+৳140 margin) while remaining ৳210 below Daraz.",
  },
  {
    id: "pw-2",
    skuName: "Crimson Bridal Katan Saree",
    myPrice: 8500,
    marketAvg: 8200,
    competitors: [
      { platform: "Daraz BD", price: 7990, inStock: true, url: "https://daraz.com.bd" },
      { platform: "Priyoshop", price: 8400, inStock: true, url: "https://priyoshop.com" },
    ],
    priceDifferencePct: 3.6,
    recommendation: "Apply dynamic flash discount to ৳7,950 with ৳200 bKash cashback badge.",
  },
  {
    id: "pw-3",
    skuName: "Wireless ANC Earbuds Pro BD",
    myPrice: 2200,
    marketAvg: 2450,
    competitors: [
      { platform: "Star Tech BD", price: 2490, inStock: true, url: "https://startech.com.bd" },
      { platform: "Ryans Computers", price: 2550, inStock: true, url: "https://ryans.com" },
    ],
    priceDifferencePct: -10.2,
    recommendation: "Strong volume leader advantage. Maintain ৳2,200 price point for market share capture.",
  },
];

export function PriceWatcherArtifact() {
  const [tracks, setTracks] = useState<CompetitorTrack[]>(COMPETITOR_DATA);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Competitor Web Crawler & Price Watcher Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                Daraz · Star Tech · Aarong
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Autonomous multi-platform price crawling, stock detection, and dynamic repricing logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>{isScanning ? "Crawling Market..." : "Crawl BD Market"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport List ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{track.skuName}</h3>
                <div className="flex items-center gap-3 text-xs font-mono mt-0.5">
                  <span className="text-muted-foreground">
                    My Price: <strong className="text-foreground">৳{track.myPrice.toLocaleString()}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Market Avg: <strong>৳{track.marketAvg.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border self-start sm:self-auto",
                  track.priceDifferencePct < 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                )}
              >
                {track.priceDifferencePct < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                <span>
                  {track.priceDifferencePct > 0 ? `+${track.priceDifferencePct}%` : `${track.priceDifferencePct}%`}{" "}
                  vs Market
                </span>
              </div>
            </div>

            {/* Competitor Platforms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {track.competitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-foreground block font-sans">{comp.platform}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {comp.inStock ? "● In Stock" : "○ Out of Stock"}
                    </span>
                  </div>
                  <span className="font-bold text-blue-400">৳{comp.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* DeepSeek Repricing Strategy */}
            <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs">
              <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-indigo-400 block mb-1">
                🤖 Autonomous Repricing Rule
              </span>
              <p className="text-foreground font-medium">{track.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PriceWatcherArtifact;
