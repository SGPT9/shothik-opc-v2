import React, { useState, useEffect } from "react";
import {
  Building2,
  DollarSign,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Download,
  Sparkles,
  X,
  CreditCard,
  Percent,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";

interface CorporateTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "tax_calculator" | "ait_ledger" | "mushak_91" | "e_return_export";

export type CorporateEntityType =
  | "private_limited"
  | "one_person_company"
  | "ites_tax_exempt"
  | "rmg_export"
  | "green_rmg";

export interface CorporateTaxSummaryMetrics {
  currentAssessmentYear: string;
  totalAnnualTurnoverBdt: number;
  estimatedNetProfitBdt: number;
  corporateTaxLiabilityBdt: number;
  totalAitDeductedAtSourceBdt: number;
  netFinalTaxPayableBdt: number;
  monthlyVatPayableAverageBdt: number;
  mushak91Status: "compliant" | "overdue";
}

export interface AitCertificateItem {
  id: string;
  section: string;
  challanOrCertificateNo: string;
  deductingAuthority: string;
  transactionDate: string;
  baseTransactionAmountBdt: number;
  withholdingRatePercent: number;
  aitDeductedAmountBdt: number;
  bankDepositChallanNo: string;
  status: "verified" | "pending_audit";
}

export interface Mushak91Data {
  returnPeriod: string;
  binNumber: string;
  companyName: string;
  grossLocalSalesBdt: number;
  zeroRatedExportSalesBdt: number;
  totalOutputVatPayableBdt: number;
  totalInputTaxCreditBdt: number;
  increasingAdjustmentsVdsBdt: number;
  decreasingAdjustmentsExportRebateBdt: number;
  netVatPayableToTreasuryBdt: number;
}

const DEFAULT_SUMMARY: CorporateTaxSummaryMetrics = {
  currentAssessmentYear: "2026-2027",
  totalAnnualTurnoverBdt: 18500000,
  estimatedNetProfitBdt: 4450000,
  corporateTaxLiabilityBdt: 890000,
  totalAitDeductedAtSourceBdt: 308000,
  netFinalTaxPayableBdt: 582000,
  monthlyVatPayableAverageBdt: 220000,
  mushak91Status: "compliant",
};

const DEFAULT_AIT_ITEMS: AitCertificateItem[] = [
  {
    id: "AIT-001",
    section: "Section 89 (Supply of Goods)",
    challanOrCertificateNo: "VDS-CHAL-9921",
    deductingAuthority: "Apex Enterprises Ltd.",
    transactionDate: "2026-08-12",
    baseTransactionAmountBdt: 2400000,
    withholdingRatePercent: 5.0,
    aitDeductedAmountBdt: 120000,
    bankDepositChallanNo: "TR-CH-551029",
    status: "verified",
  },
  {
    id: "AIT-002",
    section: "Section 86 (Professional Services)",
    challanOrCertificateNo: "AIT-SRV-4412",
    deductingAuthority: "Grameen Digital PLC",
    transactionDate: "2026-08-25",
    baseTransactionAmountBdt: 1500000,
    withholdingRatePercent: 10.0,
    aitDeductedAmountBdt: 150000,
    bankDepositChallanNo: "TR-CH-883910",
    status: "verified",
  },
  {
    id: "AIT-003",
    section: "Section 123 (Export Realization)",
    challanOrCertificateNo: "SWIFT-EXP-7721",
    deductingAuthority: "Eastern Bank PLC (Principal Branch)",
    transactionDate: "2026-09-05",
    baseTransactionAmountBdt: 3800000,
    withholdingRatePercent: 1.0,
    aitDeductedAmountBdt: 38000,
    bankDepositChallanNo: "TR-CH-994411",
    status: "verified",
  },
];

const DEFAULT_MUSHAK: Mushak91Data = {
  returnPeriod: "2026-09",
  binNumber: "001234567-0101",
  companyName: "Shothik Technologies Bangladesh Ltd.",
  grossLocalSalesBdt: 4500000,
  zeroRatedExportSalesBdt: 1200000,
  totalOutputVatPayableBdt: 675000,
  totalInputTaxCreditBdt: 465000,
  increasingAdjustmentsVdsBdt: 35000,
  decreasingAdjustmentsExportRebateBdt: 25000,
  netVatPayableToTreasuryBdt: 220000,
};

export const CorporateTaxModal: React.FC<CorporateTaxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("tax_calculator");
  const [summary, setSummary] = useState<CorporateTaxSummaryMetrics>(DEFAULT_SUMMARY);
  const [aitItems, setAitItems] = useState<AitCertificateItem[]>(DEFAULT_AIT_ITEMS);
  const [mushakData, setMushakData] = useState<Mushak91Data>(DEFAULT_MUSHAK);

  // Calculator Form State
  const [entityType, setEntityType] = useState<CorporateEntityType>("one_person_company");
  const [isCashless, setIsCashless] = useState<boolean>(true);
  const [grossTurnover, setGrossTurnover] = useState<number>(18500000);
  const [expenses, setExpenses] = useState<number>(13200000);
  const [depreciation, setDepreciation] = useState<number>(850000);

  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const sumRes = await fetch("/api/v1/corporate-tax/summary");
      if (sumRes.ok) {
        const sData = await sumRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const aitRes = await fetch("/api/v1/corporate-tax/ait-ledger");
      if (aitRes.ok) {
        const aData = await aitRes.json();
        if (aData.ok) setAitItems(aData.data);
      }
    } catch {
      // Retain defaults
    }
  };

  // Live calculation derived values
  const taxableProfit = Math.max(0, grossTurnover - expenses - depreciation);
  let taxRatePercent = 27.5;
  if (entityType === "one_person_company") taxRatePercent = isCashless ? 20.0 : 22.5;
  else if (entityType === "private_limited") taxRatePercent = isCashless ? 25.0 : 27.5;
  else if (entityType === "ites_tax_exempt") taxRatePercent = 0.0;
  else if (entityType === "rmg_export") taxRatePercent = 12.0;
  else if (entityType === "green_rmg") taxRatePercent = 10.0;

  const standardProfitTax = Math.round((taxableProfit * taxRatePercent) / 100);
  const minTaxRate = entityType === "ites_tax_exempt" ? 0.0 : 0.6;
  const minTaxFloor = Math.round((grossTurnover * minTaxRate) / 100);
  const isMinTaxTriggered = entityType !== "ites_tax_exempt" && minTaxFloor > standardProfitTax;
  const grossTaxLiability = Math.max(standardProfitTax, minTaxFloor);
  const totalAit = aitItems.reduce((acc, it) => acc + it.aitDeductedAmountBdt, 0);
  const netTaxPayable = Math.max(0, grossTaxLiability - totalAit);

  const copyEReturnJson = () => {
    const payload = {
      nbrPortalFormat: "NBR_E_RETURN_V2026",
      assessmentYear: "2026-2027",
      entityType,
      grossTurnoverBdt: grossTurnover,
      netTaxableProfitBdt: taxableProfit,
      grossTaxLiabilityBdt: grossTaxLiability,
      totalAitCreditedBdt: totalAit,
      netTaxPayableToNBRBdt: netTaxPayable,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Corporate Tax & VAT Mushak-9.1 Studio"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 shadow-lg shadow-amber-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Corporate Income Tax & VAT Mushak-9.1 Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Income Tax Act 2023 & Form 82C
                </span>
              </div>
              <p className="text-xs text-slate-400">
                করপোরেট ইনকাম ট্যাক্স ক্যালকুলেটর, উৎস কর (AIT) ক্রেডিট লেজার ও মূসক-৯.১ ভ্যাট রিটার্ন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Section 163/82C 0.6% Floor
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Mushak-9.1 VDS Credit
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-[#0B0F17]/90 border-b border-[#1E293B]">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Annual Gross Turnover</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ৳{(summary?.totalAnnualTurnoverBdt ?? 18500000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">AY 26-27</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Net Taxable Profit</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.estimatedNetProfitBdt ?? 4450000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">Profit</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">AIT Deducted at Source</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-400">
                ৳{totalAit.toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-amber-400/80">{aitItems.length} Challans</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Net Final Tax Payable</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-400">
                ৳{netTaxPayable.toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-rose-400/80">To NBR</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("tax_calculator")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "tax_calculator"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Corporate Tax & Form 82C
          </button>

          <button
            onClick={() => setActiveTab("ait_ledger")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "ait_ledger"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AIT Certificate Vault ({aitItems.length})
          </button>

          <button
            onClick={() => setActiveTab("mushak_91")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "mushak_91"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            VAT Mushak-9.1 Monthly Return
          </button>

          <button
            onClick={() => setActiveTab("e_return_export")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "e_return_export"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Statutory e-Return Compiler
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Tax Calculator */}
          {activeTab === "tax_calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Inputs */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Corporate Tax Parameters
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Company Entity Category</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as CorporateEntityType)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                  >
                    <option value="one_person_company">One-Person Company (OPC) - 20%/22.5%</option>
                    <option value="private_limited">Non-Listed Private Limited - 25%/27.5%</option>
                    <option value="ites_tax_exempt">IT Enabled Services (ITES Tax Holiday - 0%)</option>
                    <option value="rmg_export">Export RMG & Textiles - 12%</option>
                    <option value="green_rmg">LEED Certified Green RMG - 10%</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div>
                    <span className="text-white font-medium block">100% Cashless Banking Compliance</span>
                    <span className="text-[11px] text-slate-400">Eligible for 2.5% statutory corporate tax rate rebate</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCashless}
                    onChange={(e) => setIsCashless(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Annual Gross Receipts / Turnover (BDT)</label>
                  <input
                    type="number"
                    value={grossTurnover}
                    onChange={(e) => setGrossTurnover(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Allowable Expenses (BDT)</label>
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Depreciation (BDT)</label>
                    <input
                      type="number"
                      value={depreciation}
                      onChange={(e) => setDepreciation(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Computation Result */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Tax Computation Summary (ITA 2023)
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Taxable Profit:</span>
                    <span className="font-mono text-white font-bold">৳{taxableProfit.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applicable Corporate Rate:</span>
                    <span className="font-mono text-amber-400 font-bold">{taxRatePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profit-Based Tax:</span>
                    <span className="font-mono text-white font-bold">৳{standardProfitTax.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sec 163/82C Turnover Minimum Floor (0.6%):</span>
                    <span className="font-mono text-white font-bold">৳{minTaxFloor.toLocaleString("en-BD")}</span>
                  </div>
                  {isMinTaxTriggered && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Section 82C Minimum Turnover Tax floor exceeds profit tax.
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-2 flex justify-between">
                    <span className="text-white font-semibold">Gross Corporate Tax Liability:</span>
                    <span className="font-mono text-rose-400 font-bold">৳{grossTaxLiability.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Less: Verified AIT Credits:</span>
                    <span className="font-mono text-emerald-400 font-bold">-৳{totalAit.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                    <span className="text-white font-bold">Net Final Tax Payable:</span>
                    <span className="font-mono text-emerald-400 font-extrabold">৳{netTaxPayable.toLocaleString("en-BD")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AIT Certificate Vault */}
          {activeTab === "ait_ledger" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Advance Income Tax (AIT) Source Withholding Ledger
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Total Claimed Credits: ৳{totalAit.toLocaleString("en-BD")} across {aitItems.length} verified withholding certificates.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {aitItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.deductingAuthority}</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-mono text-[10px]">
                          {item.section}
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-slate-400">
                        Challan No: {item.challanOrCertificateNo} • Bank Deposit: {item.bankDepositChallanNo} • Date: {item.transactionDate}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Base Invoice: ৳{item.baseTransactionAmountBdt.toLocaleString("en-BD")} @ {item.withholdingRatePercent}%
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-amber-400">
                        ৳{item.aitDeductedAmountBdt.toLocaleString("en-BD")}
                      </span>
                      <span className="block text-[10px] text-slate-400">AIT Tax Credit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VAT Mushak-9.1 */}
          {activeTab === "mushak_91" && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                  <Layers className="w-4 h-4" />
                  Monthly VAT Return (Mushak-9.1) Summary - {mushakData.returnPeriod}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  BIN: {mushakData.binNumber} • Entity: {mushakData.companyName}
                </p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Part 2: Gross Output VAT on Local Supplies (15%):</span>
                  <span className="font-mono text-white font-bold">৳{mushakData.totalOutputVatPayableBdt.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Part 3: Input Tax Credit (ITC) on Raw Materials:</span>
                  <span className="font-mono text-emerald-400 font-bold">-৳{mushakData.totalInputTaxCreditBdt.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Part 4: Increasing Adjustment (VDS Withheld by Us):</span>
                  <span className="font-mono text-amber-400 font-bold">+৳{mushakData.increasingAdjustmentsVdsBdt.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Part 4: Decreasing Adjustment (Export Rebate):</span>
                  <span className="font-mono text-emerald-400 font-bold">-৳{mushakData.decreasingAdjustmentsExportRebateBdt.toLocaleString("en-BD")}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-white font-bold">Part 5: Net VAT Payable to Government Treasury:</span>
                  <span className="font-mono text-amber-400 font-extrabold">৳{mushakData.netVatPayableToTreasuryBdt.toLocaleString("en-BD")}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: e-Return Export */}
          {activeTab === "e_return_export" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">NBR e-Return Statutory JSON Payload</span>
                  <p className="text-slate-400 text-xs mt-0.5">Ready for upload to NBR e-Return Company Portal</p>
                </div>
                <button
                  onClick={copyEReturnJson}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Payload"}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
{JSON.stringify(
  {
    nbrPortalFormat: "NBR_E_RETURN_V2026",
    assessmentYear: "2026-2027",
    entityType,
    grossTurnoverBdt: grossTurnover,
    netTaxableProfitBdt: taxableProfit,
    grossTaxLiabilityBdt: grossTaxLiability,
    totalAitCreditedBdt: totalAit,
    netTaxPayableToNBRBdt: netTaxPayable,
  },
  null,
  2
)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateTaxModal;
