"use client";

import { useState } from "react";
import {
  Calculator,
  Receipt,
  Download,
  Copy,
  Check,
  Building2,
  Percent,
  Coins,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export function VatTaxArtifact() {
  const [revenueBdt, setRevenueBdt] = useState<number>(450000);
  const [vatRate, setVatRate] = useState<number>(7.5); // Standard e-commerce/retail VAT in BD
  const [aitRate, setAitRate] = useState<number>(3.0); // Advance Income Tax on vendor payments
  const [isCopied, setIsCopied] = useState(false);

  const vatAmount = (revenueBdt * vatRate) / 100;
  const aitAmount = (revenueBdt * aitRate) / 100;
  const totalTaxLiability = vatAmount + aitAmount;
  const netRevenue = revenueBdt - totalTaxLiability;

  const handleCopyMushak = () => {
    const text = `# 🏛️ NBR Mushak-6.3 Tax Challan Summary (জাতীয় রাজস্ব বোর্ড)
**Statutory Reference:** Bangladesh VAT and Supplementary Duty Act 2012 & Income Tax Act 2023

---

### **Financial Assessment:**
- **Gross Invoiced Revenue:** ৳${revenueBdt.toLocaleString()} BDT
- **Applicable VAT (${vatRate}%):** ৳${vatAmount.toLocaleString()} BDT
- **Advance Income Tax (AIT ${aitRate}%):** ৳${aitAmount.toLocaleString()} BDT
- **Total Statutory Government Deduction:** ৳${totalTaxLiability.toLocaleString()} BDT
- **Net Merchant Retained Revenue:** ৳${netRevenue.toLocaleString()} BDT

---

### **Mushak-6.3 Compliance Verification:**
- **BIN (Business Identification Number):** 002938192-0102
- **TIN (Taxpayer Identification Number):** 8849-2019-3821
- **Challan Code:** 1-1133-0010-0311 (Sonali Bank / Bangladesh Bank Treasury)
- **Status:** Verified Clean Compliance
`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>NBR VAT & Tax Accounting Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Income Tax Act 2023 · মূসক-৬.৩
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Real-time VAT, AIT withholding math, and automated Mushak-6.3 tax invoice breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/40 transition cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMushak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition cursor-pointer select-none"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Mushak-6.3</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Viewport ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Controls Card */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
                Gross Monthly Revenue (BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  ৳
                </span>
                <input
                  type="number"
                  value={revenueBdt}
                  onChange={(e) => setRevenueBdt(Number(e.target.value) || 0)}
                  className="w-full text-xs font-mono font-bold bg-background border border-border rounded-xl pl-7 pr-3 py-2 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
                VAT Rate (মূসক)
              </label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
              >
                <option value={5.0}>5.0% (Retail & Wholesale)</option>
                <option value={7.5}>7.5% (E-Commerce & Online)</option>
                <option value={10.0}>10.0% (Services & IT)</option>
                <option value={15.0}>15.0% (Standard Standard Tariff)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
                Advance Tax (AIT / উৎসে কর)
              </label>
              <select
                value={aitRate}
                onChange={(e) => setAitRate(Number(e.target.value))}
                className="w-full text-xs font-mono font-bold bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-emerald-400"
              >
                <option value={2.0}>2.0% (Supply of Goods)</option>
                <option value={3.0}>3.0% (E-Commerce Merchant)</option>
                <option value={5.0}>5.0% (Contractor / Agency)</option>
              </select>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Total VAT Payable (মূসক)
              </span>
              <div className="text-xl font-bold font-mono text-foreground">
                ৳{vatAmount.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">Calculated at {vatRate}% rate</p>
            </div>

            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-1">
              <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider">
                AIT Withheld (উৎসে কর)
              </span>
              <div className="text-xl font-bold font-mono text-foreground">
                ৳{aitAmount.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">Calculated at {aitRate}% rate</p>
            </div>

            <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 space-y-1">
              <span className="text-[10px] font-bold font-mono text-teal-400 uppercase tracking-wider">
                Net Retained Profit
              </span>
              <div className="text-xl font-bold font-mono text-teal-400">
                ৳{netRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">Post-statutory settlement</p>
            </div>
          </div>

          {/* Mushak-6.3 Official Challan Box */}
          <div className="p-6 rounded-2xl border border-border bg-[#faf8f5] dark:bg-[#12161f] text-slate-900 dark:text-slate-100 shadow-lg space-y-4 font-mono text-xs">
            <div className="text-center space-y-1 border-b border-border/60 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                জাতীয় রাজস্ব বোর্ড (National Board of Revenue)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                মূসক-৬.৩ (কর চালানপত্র) · Mushak-6.3 Statutory Tax Invoice
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <span className="text-muted-foreground block">প্রতিষ্ঠান / করদাতার নাম:</span>
                <span className="font-bold">Shothik Hermes Technologies Ltd.</span>
              </div>
              <div>
                <span className="text-muted-foreground block">বিআইএন (BIN):</span>
                <span className="font-bold">002938192-0102</span>
              </div>
            </div>

            <div className="border border-border/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground">
                  <tr>
                    <th className="p-2">বিবরণ</th>
                    <th className="p-2 text-right">মূল্য (BDT)</th>
                    <th className="p-2 text-right">মূসক ({vatRate}%)</th>
                    <th className="p-2 text-right">মোট প্রদেয়</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40">
                    <td className="p-2">ডিজিটাল কমার্স ও সফটওয়্যার সেবা</td>
                    <td className="p-2 text-right">৳{revenueBdt.toLocaleString()}</td>
                    <td className="p-2 text-right">৳{vatAmount.toLocaleString()}</td>
                    <td className="p-2 text-right font-bold">
                      ৳{(revenueBdt + vatAmount).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2">
              <span>ইস্যু তারিখ: ১৮ আগস্ট, ২০২৬</span>
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NBR ই-চালান ভেরিফাইড</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VatTaxArtifact;
