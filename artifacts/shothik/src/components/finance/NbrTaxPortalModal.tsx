import React, { useState } from "react";
import {
  FileText,
  Calculator,
  Download,
  CheckCircle2,
  Percent,
  Sparkles,
  ShieldCheck,
  Building,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nbrVatTaxService, IncomeTaxCalculationResult } from "@/lib/finance/nbr-vat-tax-service";

export interface NbrTaxPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NbrTaxPortalModal({ isOpen, onClose }: NbrTaxPortalModalProps) {
  const [incomeBdt, setIncomeBdt] = useState(650000);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [investmentBdt, setInvestmentBdt] = useState(100000);
  const [taxResult, setTaxResult] = useState<IncomeTaxCalculationResult | null>(null);

  const handleCalculate = () => {
    const res = nbrVatTaxService.calculateIncomeTax({
      annualIncomeBdt: incomeBdt,
      gender,
      investmentBdt,
    });
    setTaxResult(res);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-black font-bold shadow-md">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                NBR Statutory Tax & Mushak-6.3 VAT Portal
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                  Section 78 Rebates
                </Badge>
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Calculate NBR individual e-TIN income tax & generate gapless Mushak-6.3 VAT challans
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/80 bg-zinc-900/30">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Annual Income (BDT)</label>
            <input
              type="number"
              value={incomeBdt}
              onChange={(e) => setIncomeBdt(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-amber-400 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Investment (Rebate Eligible)</label>
            <input
              type="number"
              value={investmentBdt}
              onChange={(e) => setInvestmentBdt(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <Button onClick={handleCalculate} className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Calculate Tax & Rebate
            </Button>
          </div>
        </div>

        {/* Tax Results Display */}
        {taxResult && (
          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Taxable Income</span>
                <span className="text-sm font-bold text-white font-mono">৳{taxResult.taxableIncomeBdt.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Gross Tax</span>
                <span className="text-sm font-bold text-amber-400 font-mono">৳{taxResult.grossTaxBdt.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Investment Rebate</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">-৳{taxResult.investmentRebateBdt.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[11px] text-amber-300 block">Net Payable Tax</span>
                <span className="text-base font-bold text-amber-400 font-mono">৳{taxResult.netTaxPayableBdt.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Generate Mushak-6.3 VAT Challan PDF</h4>
                  <p className="text-[11px] text-zinc-400">Sequential gapless statutory VAT invoice for NBR compliance</p>
                </div>
              </div>
              <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700">
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Mushak-6.3 PDF
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Updated with NBR Finance Act 2026 Tax Slabs
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
            Close Portal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
