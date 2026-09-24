import React, { useState, useEffect } from "react";
import {
  FileText,
  DollarSign,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
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
  Scale,
  ArrowRight,
  Lock,
} from "lucide-react";

interface InvoiceFactoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "active_invoices" | "pricing_simulator" | "new_application" | "debtor_directory";

export type FinancingMode = "islamic_murabaha" | "conventional_discounting";

export interface FactoringSummaryMetrics {
  totalFactoredReceivablesBdt: number;
  activeOutstandingAdvancesBdt: number;
  totalSettledReceivablesBdt: number;
  totalReserveRetainedInEscrowBdt: number;
  totalFinancingFeesEarnedBdt: number;
  activeFinancedInvoicesCount: number;
  defaultRatePercent: number;
}

export interface FactoringInvoiceItem {
  id: string;
  mushak63No: string;
  poNumber: string;
  sellerCompanyName: string;
  buyerName: string;
  buyerBin: string;
  buyerTier: string;
  invoiceGrossBdt: number;
  issueDate: string;
  dueDate: string;
  tenorDays: number;
  financingMode: FinancingMode;
  advanceLtvPercent: number;
  grossAdvanceBdt: number;
  retainedReserveBdt: number;
  financingFeeBdt: number;
  platformFeeBdt: number;
  netDisbursedBdt: number;
  status: "disbursed" | "settled" | "pending_approval";
  disbursementChannel: string;
  accountOrMfsNumber: string;
  escrowLienHash: string;
}

const DEFAULT_SUMMARY: FactoringSummaryMetrics = {
  totalFactoredReceivablesBdt: 4450000,
  activeOutstandingAdvancesBdt: 3675000,
  totalSettledReceivablesBdt: 1200000,
  totalReserveRetainedInEscrowBdt: 775000,
  totalFinancingFeesEarnedBdt: 114500,
  activeFinancedInvoicesCount: 3,
  defaultRatePercent: 0.0,
};

const DEFAULT_INVOICES: FactoringInvoiceItem[] = [
  {
    id: "FAC-001",
    mushak63No: "MUSHAK-6.3-99812",
    poNumber: "PO-PRAN-2026-881",
    sellerCompanyName: "Shothik Agritech Ltd.",
    buyerName: "PRAN-RFL Group (Agricultural Marketing Co.)",
    buyerBin: "000192837-0101",
    buyerTier: "tier_1_aaa",
    invoiceGrossBdt: 1200000,
    issueDate: "2026-08-15",
    dueDate: "2026-10-15",
    tenorDays: 60,
    financingMode: "islamic_murabaha",
    advanceLtvPercent: 85,
    grossAdvanceBdt: 1020000,
    retainedReserveBdt: 180000,
    financingFeeBdt: 20400,
    platformFeeBdt: 6000,
    netDisbursedBdt: 993600,
    status: "disbursed",
    disbursementChannel: "bkash_corporate",
    accountOrMfsNumber: "01712345678",
    escrowLienHash: "e4a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  },
  {
    id: "FAC-002",
    mushak63No: "MUSHAK-6.3-44109",
    poNumber: "PO-SQUARE-2026-112",
    sellerCompanyName: "Apex Packaging Ltd.",
    buyerName: "Square Pharmaceuticals PLC",
    buyerBin: "000456123-0102",
    buyerTier: "tier_1_aaa",
    invoiceGrossBdt: 2500000,
    issueDate: "2026-09-01",
    dueDate: "2026-10-15",
    tenorDays: 45,
    financingMode: "islamic_murabaha",
    advanceLtvPercent: 85,
    grossAdvanceBdt: 2125000,
    retainedReserveBdt: 375000,
    financingFeeBdt: 30281,
    platformFeeBdt: 12500,
    netDisbursedBdt: 2082219,
    status: "disbursed",
    disbursementChannel: "beftn_bank",
    accountOrMfsNumber: "BRAC-150120499120",
    escrowLienHash: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
  },
  {
    id: "FAC-003",
    mushak63No: "MUSHAK-6.3-77218",
    poNumber: "PO-AARONG-2026-403",
    sellerCompanyName: "Heritage Handloom Craft OPC",
    buyerName: "Aarong (BRAC Enterprises)",
    buyerBin: "000321654-0101",
    buyerTier: "tier_2_aplus",
    invoiceGrossBdt: 750000,
    issueDate: "2026-08-20",
    dueDate: "2026-10-20",
    tenorDays: 60,
    financingMode: "conventional_discounting",
    advanceLtvPercent: 80,
    grossAdvanceBdt: 600000,
    retainedReserveBdt: 150000,
    financingFeeBdt: 14301,
    platformFeeBdt: 3750,
    netDisbursedBdt: 581949,
    status: "disbursed",
    disbursementChannel: "nagad_enterprise",
    accountOrMfsNumber: "01898765432",
    escrowLienHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
  },
];

const CORPORATE_DEBTORS = [
  {
    name: "PRAN-RFL Group",
    tier: "Tier-1 Blue Chip (AAA)",
    bin: "000192837-0101",
    ltv: "85% Advance",
    murabahaRate: "1.0% / month",
    conventionalApr: "13.5% APR",
    avgCycle: "45-60 Days",
  },
  {
    name: "Square Pharmaceuticals PLC",
    tier: "Tier-1 Blue Chip (AAA)",
    bin: "000456123-0102",
    ltv: "85% Advance",
    murabahaRate: "0.95% / month",
    conventionalApr: "13.3% APR",
    avgCycle: "30-45 Days",
  },
  {
    name: "Walton Hi-Tech Industries PLC",
    tier: "Tier-2 Corporate (A+)",
    bin: "000789456-0201",
    ltv: "80% Advance",
    murabahaRate: "1.4% / month",
    conventionalApr: "14.5% APR",
    avgCycle: "60-75 Days",
  },
  {
    name: "Aarong (BRAC Enterprises)",
    tier: "Tier-2 Corporate (A+)",
    bin: "000321654-0101",
    ltv: "80% Advance",
    murabahaRate: "1.25% / month",
    conventionalApr: "14.0% APR",
    avgCycle: "45-60 Days",
  },
];

export const InvoiceFactoringModal: React.FC<InvoiceFactoringModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("active_invoices");
  const [summary, setSummary] = useState<FactoringSummaryMetrics>(DEFAULT_SUMMARY);
  const [invoices, setInvoices] = useState<FactoringInvoiceItem[]>(DEFAULT_INVOICES);

  // Simulator State
  const [simBuyer, setSimBuyer] = useState("PRAN-RFL Group");
  const [simAmount, setSimAmount] = useState(1500000);
  const [simTenor, setSimTenor] = useState(60);
  const [simMode, setSimMode] = useState<FinancingMode>("islamic_murabaha");

  // Application State
  const [appBuyer, setAppBuyer] = useState("Square Pharmaceuticals PLC");
  const [appMushakNo, setAppMushakNo] = useState("MUSHAK-6.3-88301");
  const [appPoNo, setAppPoNo] = useState("PO-SQUARE-2026-902");
  const [appAmount, setAppAmount] = useState(1800000);
  const [appMode, setAppMode] = useState<FinancingMode>("islamic_murabaha");
  const [appChannel, setAppChannel] = useState("bkash_corporate");
  const [appAccount, setAppAccount] = useState("01712345678");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const sumRes = await fetch("/api/v1/factoring/summary");
      if (sumRes.ok) {
        const sData = await sumRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const invRes = await fetch("/api/v1/factoring/invoices");
      if (invRes.ok) {
        const iData = await invRes.json();
        if (iData.ok && iData.data.length > 0) setInvoices(iData.data);
      }
    } catch {
      // Retain defaults
    }
  };

  // Simulator Calculations
  const simLtv = simBuyer.includes("PRAN") || simBuyer.includes("Square") ? 85 : 80;
  const simGrossAdvance = Math.round((simAmount * simLtv) / 100);
  const simRetention = simAmount - simGrossAdvance;
  const simPlatformFee = Math.round((simAmount * 0.5) / 100);
  let simFinancingFee = 0;

  if (simMode === "islamic_murabaha") {
    const months = Math.ceil(simTenor / 30);
    const markupRate = simBuyer.includes("PRAN") ? 1.0 : 1.25;
    simFinancingFee = Math.round((simGrossAdvance * (markupRate * months)) / 100);
  } else {
    const apr = 14.5;
    simFinancingFee = Math.round((simGrossAdvance * apr * (simTenor / 365)) / 100);
  }
  const simNetPayout = simGrossAdvance - simFinancingFee - simPlatformFee;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/v1/factoring/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mushak63No: appMushakNo,
          poNumber: appPoNo,
          buyerName: appBuyer,
          invoiceGrossBdt: appAmount,
          tenorDays: 60,
          financingMode: appMode,
          disbursementChannel: appChannel,
          accountOrMfsNumber: appAccount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setInvoices([data.data, ...invoices]);
          setActiveTab("active_invoices");
        }
      }
    } catch {
      setActiveTab("active_invoices");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSettle = async (invoiceId: string, grossAmount: number) => {
    try {
      const res = await fetch("/api/v1/factoring/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, remittanceAmountBdt: grossAmount }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setInvoices(invoices.map((inv) => (inv.id === invoiceId ? data.data : inv)));
        }
      }
    } catch {
      // Retain state
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="B2B Invoice Factoring & Islamic Murabaha Studio"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  B2B Invoice Factoring & Islamic Murabaha Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  NBR Mushak-6.3 & BB Receivables Escrow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                মুশাক-৬.৩ ই-ইনভয়েস ডিসকাউন্টিং, ৮৫% তাৎক্ষণিক ক্যাশ অ্যাডভান্স ও শরীয়াহ-সম্মত মুরাবাহা ফাইনান্সিং
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Shariah Board Approved
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                SMART Base 11.5%
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
            <span className="text-xs text-slate-400 font-medium">Total Factored Receivables</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ৳{(summary?.totalFactoredReceivablesBdt ?? 4450000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">Gross Invoices</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Active Advances Disbursed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.activeOutstandingAdvancesBdt ?? 3675000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">85% LTV</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Retained in Escrow Lien</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-400">
                ৳{(summary?.totalReserveRetainedInEscrowBdt ?? 775000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-amber-400/80">15-20% Reserve</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Zero Default Track Record</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-teal-400">0.00%</span>
              <span className="text-[11px] text-teal-400/80">BB Escrow Lock</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("active_invoices")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "active_invoices"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Active Factored Receivables ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab("pricing_simulator")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "pricing_simulator"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            Dual Pricing Simulator
          </button>

          <button
            onClick={() => setActiveTab("new_application")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "new_application"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice Cash Advance
          </button>

          <button
            onClick={() => setActiveTab("debtor_directory")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "debtor_directory"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Debtor Tiers
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Active Invoices */}
          {activeTab === "active_invoices" && (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{inv.buyerName}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                        {inv.mushak63No}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        inv.financingMode === "islamic_murabaha"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {inv.financingMode === "islamic_murabaha" ? "Islamic Murabaha" : "Conventional"}
                      </span>
                    </div>

                    <p className="text-slate-400">
                      PO: {inv.poNumber} • Disbursed via: {inv.disbursementChannel.toUpperCase()} ({inv.accountOrMfsNumber})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      LTV: {inv.advanceLtvPercent}% (Advance: ৳{inv.grossAdvanceBdt.toLocaleString("en-BD")}) • Retained: ৳{inv.retainedReserveBdt.toLocaleString("en-BD")} • Due: {inv.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-emerald-400">
                        ৳{inv.netDisbursedBdt.toLocaleString("en-BD")}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Gross: ৳{inv.invoiceGrossBdt.toLocaleString("en-BD")}
                      </span>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === "settled"
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>

                    {inv.status !== "settled" && (
                      <button
                        onClick={() => handleSettle(inv.id, inv.invoiceGrossBdt)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                      >
                        Settle Buyer Remittance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Pricing Simulator */}
          {activeTab === "pricing_simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  Receivables Advance Simulator
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Enterprise Corporate Debtor</label>
                  <select
                    value={simBuyer}
                    onChange={(e) => setSimBuyer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                  >
                    <option value="PRAN-RFL Group">PRAN-RFL Group (Tier-1 AAA - 85% LTV)</option>
                    <option value="Square Pharmaceuticals PLC">Square Pharmaceuticals PLC (Tier-1 AAA - 85% LTV)</option>
                    <option value="Walton Hi-Tech Industries PLC">Walton Hi-Tech Industries PLC (Tier-2 A+ - 80% LTV)</option>
                    <option value="Aarong (BRAC Enterprises)">Aarong BRAC (Tier-2 A+ - 80% LTV)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Invoice Amount (BDT)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Payment Tenor (Days): {simTenor} Days</label>
                  <input
                    type="range"
                    min={30}
                    max={120}
                    step={15}
                    value={simTenor}
                    onChange={(e) => setSimTenor(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>30 Days</span>
                    <span>60 Days</span>
                    <span>90 Days</span>
                    <span>120 Days</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Financing Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimMode("islamic_murabaha")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        simMode === "islamic_murabaha"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Islamic Murabaha
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMode("conventional_discounting")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        simMode === "conventional_discounting"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                      Conventional SMART
                    </button>
                  </div>
                </div>
              </div>

              {/* Quote Breakdown */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Advance Quote & Net Cash Payout
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Gross Value:</span>
                    <span className="font-mono text-white font-bold">৳{simAmount.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Advance LTV Ratio:</span>
                    <span className="font-mono text-emerald-400 font-bold">{simLtv}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Advance Amount:</span>
                    <span className="font-mono text-white font-bold">৳{simGrossAdvance.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retained in Escrow Lien ({100 - simLtv}%):</span>
                    <span className="font-mono text-amber-400 font-bold">৳{simRetention.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {simMode === "islamic_murabaha" ? "Murabaha Cost-Plus Markup:" : "Conventional Financing Fee:"}
                    </span>
                    <span className="font-mono text-rose-400 font-bold">-৳{simFinancingFee.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform Processing Fee (0.5%):</span>
                    <span className="font-mono text-rose-400 font-bold">-৳{simPlatformFee.toLocaleString("en-BD")}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                    <span className="text-white font-bold">Instant Net Payout to Seller:</span>
                    <span className="font-mono text-emerald-400 font-extrabold">৳{simNetPayout.toLocaleString("en-BD")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: New Application */}
          {activeTab === "new_application" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Submit Verified Mushak-6.3 e-Invoice for Instant Cash
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Mushak-6.3 Invoice Number</label>
                    <input
                      type="text"
                      value={appMushakNo}
                      onChange={(e) => setAppMushakNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Purchase Order (PO) Number</label>
                    <input
                      type="text"
                      value={appPoNo}
                      onChange={(e) => setAppPoNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Corporate Buyer Entity</label>
                  <select
                    value={appBuyer}
                    onChange={(e) => setAppBuyer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                  >
                    <option value="PRAN-RFL Group">PRAN-RFL Group (Tier-1 AAA)</option>
                    <option value="Square Pharmaceuticals PLC">Square Pharmaceuticals PLC (Tier-1 AAA)</option>
                    <option value="Walton Hi-Tech Industries PLC">Walton Hi-Tech Industries PLC (Tier-2 A+)</option>
                    <option value="Aarong (BRAC Enterprises)">Aarong BRAC (Tier-2 A+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Invoice Gross Amount (BDT)</label>
                  <input
                    type="number"
                    value={appAmount}
                    onChange={(e) => setAppAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Disbursement Channel</label>
                    <select
                      value={appChannel}
                      onChange={(e) => setAppChannel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                    >
                      <option value="bkash_corporate">bKash Merchant / Corporate</option>
                      <option value="nagad_enterprise">Nagad Enterprise</option>
                      <option value="beftn_bank">Bank Account (BEFTN / NPSB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Account / MFS Wallet Number</label>
                    <input
                      type="text"
                      value={appAccount}
                      onChange={(e) => setAppAccount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isApplying ? "Locking Escrow & Disbursing..." : "Lock Receivables Escrow & Disburse Cash Advance"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Debtor Directory */}
          {activeTab === "debtor_directory" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Building2 className="w-4 h-4" />
                  Approved Corporate Debtor Rating & LTV Matrix
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automated creditworthiness rating based on historical Bangladesh Bank CIB track record and corporate payment cycles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CORPORATE_DEBTORS.map((debtor, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{debtor.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono text-[10px]">
                        {debtor.tier}
                      </span>
                    </div>
                    <p className="text-slate-400">BIN: {debtor.bin} • Cycle: {debtor.avgCycle}</p>
                    <div className="flex justify-between font-mono pt-1 text-[11px] border-t border-slate-800">
                      <span className="text-emerald-400 font-bold">{debtor.ltv}</span>
                      <span className="text-slate-300">{debtor.murabahaRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceFactoringModal;
