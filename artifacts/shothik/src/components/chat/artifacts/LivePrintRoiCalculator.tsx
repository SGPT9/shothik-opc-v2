import React, { useState } from "react";
import { Calculator, TrendingUp, Truck, DollarSign, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LivePrintRoiCalculatorProps {
  initialPages?: number;
  initialQuantity?: number;
  onOrderDispatch?: (qty: number, costBdt: number) => void;
}

export function LivePrintRoiCalculator({
  initialPages = 160,
  initialQuantity = 50,
  onOrderDispatch,
}: LivePrintRoiCalculatorProps) {
  const [pages, setPages] = useState(initialPages);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [retailPriceBdt, setRetailPriceBdt] = useState(380);
  const [destination, setDestination] = useState<"dhaka" | "nationwide">("dhaka");

  // Mathematical formulations (Forme signature math: 1 forme = 16 pages)
  const formes = Math.ceil(pages / 16);
  const baseCostPerForme = 12.5; // BDT per forme per copy
  const bindingCost = 35; // Perfect binding with 300 GSM Laminated Cover
  const courierCostPerBook = destination === "dhaka" ? 60 : 120;

  // Volume discount curve
  let discountMultiplier = 1.0;
  if (quantity >= 500) discountMultiplier = 0.65;
  else if (quantity >= 300) discountMultiplier = 0.72;
  else if (quantity >= 100) discountMultiplier = 0.80;
  else if (quantity >= 50) discountMultiplier = 0.88;

  const manufacturingCostPerBook = Math.round((formes * baseCostPerForme + bindingCost) * discountMultiplier);
  const totalProductionCostBdt = manufacturingCostPerBook * quantity;
  const totalGrossRevenueBdt = retailPriceBdt * quantity;
  const totalNetProfitBdt = totalGrossRevenueBdt - totalProductionCostBdt;
  const grossMarginPercent = Math.round((totalNetProfitBdt / (totalGrossRevenueBdt || 1)) * 100);

  return (
    <div className="my-4 rounded-2xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-xl p-4 shadow-sm select-none transition-all">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Interactive Nilkhet Manufacturing & ROI Model</h4>
            <p className="text-[10px] text-muted-foreground font-mono">
              Live Forme math · 64-district courier logistics · Real-time gross margin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {grossMarginPercent}% Margin
          </span>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        {/* Slider 1: Print Run Quantity */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Print Run:
            </span>
            <span className="font-mono font-bold text-foreground">{quantity} Copies</span>
          </div>
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Slider 2: Page Count */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" /> Page Count:
            </span>
            <span className="font-mono font-bold text-foreground">{pages} Pages ({formes} ফর্মা)</span>
          </div>
          <input
            type="range"
            min={48}
            max={480}
            step={16}
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>

        {/* Slider 3: Retail Selling Price */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Retail Price:
            </span>
            <span className="font-mono font-bold text-foreground">৳{retailPriceBdt} BDT</span>
          </div>
          <input
            type="range"
            min={150}
            max={900}
            step={10}
            value={retailPriceBdt}
            onChange={(e) => setRetailPriceBdt(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* Financial Output Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/70 border border-border/80">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">Unit Print Cost</div>
          <div className="text-sm font-bold font-mono text-foreground">৳{manufacturingCostPerBook} <span className="text-[10px] font-normal text-muted-foreground">/ book</span></div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">Total Capital Outlay</div>
          <div className="text-sm font-bold font-mono text-amber-400">৳{totalProductionCostBdt.toLocaleString()} BDT</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">Gross Sales Revenue</div>
          <div className="text-sm font-bold font-mono text-cyan-400">৳{totalGrossRevenueBdt.toLocaleString()} BDT</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono">Projected Net Profit</div>
          <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            +৳{totalNetProfitBdt.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
