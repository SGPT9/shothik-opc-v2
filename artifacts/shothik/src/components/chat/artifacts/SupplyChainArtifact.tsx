"use client";

import { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  dailyVelocity: number;
  leadTimeDays: number;
  reorderPoint: number;
  daysUntilStockout: number;
  safetyStock: number;
  status: "critical" | "warning" | "healthy";
}

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "PANJ-BLK-XL",
    name: "Midnight Black Jamdani Panjabi",
    currentStock: 24,
    dailyVelocity: 18,
    leadTimeDays: 5,
    reorderPoint: 90,
    daysUntilStockout: 1.3,
    safetyStock: 30,
    status: "critical",
  },
  {
    id: "inv-2",
    sku: "SAR-RED-01",
    name: "Crimson Bridal Katan Saree",
    currentStock: 68,
    dailyVelocity: 12,
    leadTimeDays: 7,
    reorderPoint: 84,
    daysUntilStockout: 5.6,
    safetyStock: 20,
    status: "warning",
  },
  {
    id: "inv-3",
    sku: "SKN-SER-30ML",
    name: "Organic Saffron Glow Face Serum",
    currentStock: 340,
    dailyVelocity: 22,
    leadTimeDays: 4,
    reorderPoint: 88,
    daysUntilStockout: 15.4,
    safetyStock: 40,
    status: "healthy",
  },
  {
    id: "inv-4",
    sku: "GDT-TWS-PRO",
    name: "Wireless ANC Earbuds Pro BD",
    currentStock: 15,
    dailyVelocity: 25,
    leadTimeDays: 6,
    reorderPoint: 150,
    daysUntilStockout: 0.6,
    safetyStock: 50,
    status: "critical",
  },
];

export function SupplyChainArtifact() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [poSent, setPoSent] = useState<string | null>(null);

  const handleDispatchPO = (sku: string) => {
    setPoSent(sku);
    setTimeout(() => {
      setPoSent(null);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Supply Chain & Inventory Replenishment Forecaster</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                Eid Surge Velocity
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Stockout risk math, Reorder Point (ROP) triggers, and automated supplier Purchase Order generation
            </p>
          </div>
        </div>
      </div>

      {/* ── Table Grid ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="border border-border rounded-2xl overflow-hidden bg-card/60 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">SKU & Item Name</th>
                <th className="py-3 px-3 font-semibold">Stock</th>
                <th className="py-3 px-3 font-semibold">Daily Velocity</th>
                <th className="py-3 px-3 font-semibold">Lead Time</th>
                <th className="py-3 px-3 font-semibold">Reorder Point (ROP)</th>
                <th className="py-3 px-3 font-semibold">Stockout Risk</th>
                <th className="py-3 px-4 font-semibold text-right">Supplier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-xs">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-foreground">{item.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </td>

                  <td className="py-3.5 px-3 font-bold text-foreground">
                    {item.currentStock} units
                  </td>

                  <td className="py-3.5 px-3 text-muted-foreground">
                    {item.dailyVelocity} / day
                  </td>

                  <td className="py-3.5 px-3 text-muted-foreground">
                    {item.leadTimeDays} days
                  </td>

                  <td className="py-3.5 px-3 font-bold text-amber-400">
                    ROP: {item.reorderPoint}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        item.status === "critical" && "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse",
                        item.status === "warning" && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                        item.status === "healthy" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      )}
                    >
                      {item.daysUntilStockout < 2 ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      <span>{item.daysUntilStockout} days left</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDispatchPO(item.sku)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs",
                        poSent === item.sku
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 hover:bg-amber-500 text-white"
                      )}
                    >
                      {poSent === item.sku ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PO Sent</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Order Stock</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SupplyChainArtifact;
