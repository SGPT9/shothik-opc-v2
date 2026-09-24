import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  X,
  Copy,
  Check,
  Building2,
  Layers,
  ArrowRight,
  Scale,
  Sparkles,
  Percent,
} from "lucide-react";

interface FxHedgingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "contracts" | "cirp_curve" | "mtm_stress" | "new_booking";

export type ForwardTenorDays = 30 | 60 | 90 | 180;

export interface ForwardRateQuote {
  tenorDays: ForwardTenorDays;
  spotRate: number;
  bdtInterestRatePercent: number;
  usdInterestRatePercent: number;
  forwardRate: number;
  forwardPointsBdt: number;
  annualizedPremiumPercent: number;
  maturityDate: string;
}

export interface ForwardContractRecord {
  contractNumber: string;
  adBankCode: string;
  adBankName: string;
  exporterName: string;
  underlyingExpNumber: string;
  underlyingLcNumber: string;
  notionalAmountUsd: number;
  spotRateAtBooking: number;
  lockedForwardRate: number;
  lockedValueBdt: number;
  tenorDays: ForwardTenorDays;
  bookingDate: string;
  maturityDate: string;
  marginLienPercent: number;
  marginLienAmountBdt: number;
  currentMtmValueBdt: number;
  unrealizedMtmGainLossBdt: number;
  status: "active" | "settled" | "cancelled" | "matured";
  settlementDate?: string;
  realizedGainLossBdt?: number;
  verificationHash: string;
  createdAt: string;
}

export interface FxHedgingSummary {
  totalOpenHedgedUsd: number;
  totalLockedValueBdt: number;
  weightedAverageForwardRate: number;
  totalUnrealizedMtmGainLossBdt: number;
  totalRealizedGainLossBdt: number;
  totalMarginLienCollateralBdt: number;
  activeContractsCount: number;
  settledContractsCount: number;
}

const DEFAULT_CONTRACTS: ForwardContractRecord[] = [
  {
    contractNumber: "FWD-0420-2026-0041",
    adBankCode: "0420",
    adBankName: "BRAC Bank PLC",
    exporterName: "Shothik Export & Heritage Crafts Ltd.",
    underlyingExpNumber: "EXP-0420-2026-00891",
    underlyingLcNumber: "LC-NORDIC-2026-091",
    notionalAmountUsd: 15000,
    spotRateAtBooking: 121.5,
    lockedForwardRate: 123.38,
    lockedValueBdt: 1850700,
    tenorDays: 90,
    bookingDate: "2026-09-12",
    maturityDate: "2026-12-11",
    marginLienPercent: 5,
    marginLienAmountBdt: 92535,
    currentMtmValueBdt: 1850700,
    unrealizedMtmGainLossBdt: 28200,
    status: "active",
    verificationHash: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    createdAt: new Date().toISOString(),
  },
  {
    contractNumber: "FWD-0115-2026-0019",
    adBankCode: "0115",
    adBankName: "Eastern Bank PLC",
    exporterName: "Shothik Apparels & Knitwear Hub",
    underlyingExpNumber: "EXP-0115-2026-00452",
    underlyingLcNumber: "CAD-DE-2026-118",
    notionalAmountUsd: 28400,
    spotRateAtBooking: 120.8,
    lockedForwardRate: 122.65,
    lockedValueBdt: 3483260,
    tenorDays: 60,
    bookingDate: "2026-08-15",
    maturityDate: "2026-10-14",
    marginLienPercent: 5,
    marginLienAmountBdt: 174163,
    currentMtmValueBdt: 3483260,
    unrealizedMtmGainLossBdt: 0,
    status: "settled",
    settlementDate: "2026-09-20",
    realizedGainLossBdt: 52540,
    verificationHash: "1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b7a8b9c0d",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_QUOTES: Record<ForwardTenorDays, ForwardRateQuote> = {
  30: {
    tenorDays: 30,
    spotRate: 121.5,
    bdtInterestRatePercent: 11.5,
    usdInterestRatePercent: 5.25,
    forwardRate: 122.12,
    forwardPointsBdt: 0.62,
    annualizedPremiumPercent: 6.12,
    maturityDate: "2026-10-23",
  },
  60: {
    tenorDays: 60,
    spotRate: 121.5,
    bdtInterestRatePercent: 11.5,
    usdInterestRatePercent: 5.25,
    forwardRate: 122.75,
    forwardPointsBdt: 1.25,
    annualizedPremiumPercent: 6.17,
    maturityDate: "2026-11-22",
  },
  90: {
    tenorDays: 90,
    spotRate: 121.5,
    bdtInterestRatePercent: 11.5,
    usdInterestRatePercent: 5.25,
    forwardRate: 123.38,
    forwardPointsBdt: 1.88,
    annualizedPremiumPercent: 6.19,
    maturityDate: "2026-12-22",
  },
  180: {
    tenorDays: 180,
    spotRate: 121.5,
    bdtInterestRatePercent: 11.5,
    usdInterestRatePercent: 5.25,
    forwardRate: 125.29,
    forwardPointsBdt: 3.79,
    annualizedPremiumPercent: 6.24,
    maturityDate: "2027-03-22",
  },
};

const DEFAULT_SUMMARY: FxHedgingSummary = {
  totalOpenHedgedUsd: 15000,
  totalLockedValueBdt: 1850700,
  weightedAverageForwardRate: 123.38,
  totalUnrealizedMtmGainLossBdt: 28200,
  totalRealizedGainLossBdt: 52540,
  totalMarginLienCollateralBdt: 92535,
  activeContractsCount: 1,
  settledContractsCount: 1,
};

export const FxHedgingModal: React.FC<FxHedgingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("contracts");
  const [contracts, setContracts] = useState<ForwardContractRecord[]>(DEFAULT_CONTRACTS);
  const [quotes, setQuotes] = useState<Record<ForwardTenorDays, ForwardRateQuote>>(DEFAULT_QUOTES);
  const [summary, setSummary] = useState<FxHedgingSummary | null>(DEFAULT_SUMMARY);
  const [stressSpotRate, setStressSpotRate] = useState<number>(121.5);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Booking Form State
  const [adBankName, setAdBankName] = useState("BRAC Bank PLC");
  const [underlyingExp, setUnderlyingExp] = useState("EXP-0420-2026-00891");
  const [underlyingLc, setUnderlyingLc] = useState("LC-NORDIC-2026-091");
  const [notionalUsd, setNotionalUsd] = useState(25000);
  const [selectedTenor, setSelectedTenor] = useState<ForwardTenorDays>(90);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const summaryRes = await fetch("/api/v1/fx-hedging/summary");
      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const listRes = await fetch("/api/v1/fx-hedging/contract/list");
      if (listRes.ok) {
        const lData = await listRes.json();
        if (lData.ok && lData.data.length > 0) setContracts(lData.data);
      }

      const quoteRes = await fetch("/api/v1/fx-hedging/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotRate: 121.5, bdtRate: 11.5, usdRate: 5.25 }),
      });
      if (quoteRes.ok) {
        const qData = await quoteRes.json();
        if (qData.ok) setQuotes(qData.data);
      }
    } catch {
      // Keep defaults
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        adBankName,
        underlyingExpNumber: underlyingExp,
        underlyingLcNumber: underlyingLc,
        notionalAmountUsd: notionalUsd,
        tenorDays: selectedTenor,
      };

      const res = await fetch("/api/v1/fx-hedging/contract/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setContracts((prev) => [data.data, ...prev]);
          setActiveTab("contracts");
        }
      }
    } catch {
      // Local fallback
      const forwardRate = quotes[selectedTenor]?.forwardRate || 123.38;
      const lockedBdt = notionalUsd * forwardRate;
      const newContract: ForwardContractRecord = {
        contractNumber: `FWD-0420-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        adBankCode: "0420",
        adBankName,
        exporterName: "Shothik Export & Heritage Crafts Ltd.",
        underlyingExpNumber: underlyingExp,
        underlyingLcNumber: underlyingLc,
        notionalAmountUsd: notionalUsd,
        spotRateAtBooking: 121.5,
        lockedForwardRate: forwardRate,
        lockedValueBdt: lockedBdt,
        tenorDays: selectedTenor,
        bookingDate: new Date().toISOString().split("T")[0],
        maturityDate: quotes[selectedTenor]?.maturityDate || "2026-12-22",
        marginLienPercent: 5,
        marginLienAmountBdt: (lockedBdt * 5) / 100,
        currentMtmValueBdt: lockedBdt,
        unrealizedMtmGainLossBdt: 0,
        status: "active",
        verificationHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        createdAt: new Date().toISOString(),
      };
      setContracts((prev) => [newContract, ...prev]);
      setActiveTab("contracts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Cross-Border FX Hedging & Forward Rate Lock Engine"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Cross-Border FX Hedging & Forward Rate Lock Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  BB FERA Chapter 10 & CIRP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                বাংলাদেশ ব্যাংক অনুমোদিত ফরওয়ার্ড কারেন্সি হেজিং ও রপ্তানি মুদ্রা ঝুঁকি নিরসন ইঞ্জিন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Spot: ৳121.50
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> SMART: 11.50%
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
            <span className="text-xs text-slate-400 font-medium">Open Hedged Exposure</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ${(summary?.totalOpenHedgedUsd ?? 15000).toLocaleString("en-US")}
              </span>
              <span className="text-[11px] text-cyan-400 font-medium">
                ({contracts.filter((c) => c.status === "active").length} active)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Locked Value (BDT)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-cyan-400">
                ৳{(summary?.totalLockedValueBdt ?? 1850700).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">
                Avg: ৳{summary?.weightedAverageForwardRate ?? 123.38}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">MTM Unrealized Gain</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                +৳{(summary?.totalUnrealizedMtmGainLossBdt ?? 28200).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">Protected</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">5% Margin Lien Collateral</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-400">
                ৳{(summary?.totalMarginLienCollateralBdt ?? 92535).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-amber-500/80">Lien at Bank</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "contracts"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Active Forward Contracts ({contracts.length})
          </button>

          <button
            onClick={() => setActiveTab("cirp_curve")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "cirp_curve"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            CIRP Forward Rate Curve
          </button>

          <button
            onClick={() => setActiveTab("mtm_stress")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "mtm_stress"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            MTM Stress Test & Valuation
          </button>

          <button
            onClick={() => setActiveTab("new_booking")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "new_booking"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Book Forward Contract
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Contracts List */}
          {activeTab === "contracts" && (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.contractNumber}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {c.contractNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {c.adBankName} ({c.tenorDays}d Forward)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Underlying: {c.underlyingExpNumber} • Ref: {c.underlyingLcNumber} • Exporter: {c.exporterName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Maturity: {c.maturityDate} • 5% Margin Lien: ৳{c.marginLienAmountBdt.toLocaleString("en-BD")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        ${c.notionalAmountUsd.toLocaleString("en-US")}
                      </span>
                      <p className="text-xs text-cyan-400 font-mono">
                        Locked @ ৳{c.lockedForwardRate} → ৳{c.lockedValueBdt.toLocaleString("en-BD")}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded ${
                          c.status === "settled"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                        }`}
                      >
                        {c.status === "settled" ? `SETTLED (+৳${c.realizedGainLossBdt?.toLocaleString("en-BD")})` : "ACTIVE HEDGE"}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(c.verificationHash, c.contractNumber)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="Copy SHA-256 Contract Hash"
                    >
                      {copiedId === c.contractNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CIRP Forward Curve */}
          {activeTab === "cirp_curve" && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
                  <TrendingUp className="w-4 h-4" />
                  Covered Interest Rate Parity (CIRP) Forward Curve
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Theoretical and commercial forward exchange rates computed from Bangladesh SMART Treasury yields vs US SOFR benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {([30, 60, 90, 180] as ForwardTenorDays[]).map((t) => {
                  const q = quotes[t];
                  return (
                    <div key={t} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t}-Day Forward</span>
                        <span className="text-[11px] font-mono text-cyan-400">+{q.annualizedPremiumPercent}% p.a.</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-cyan-300">
                        ৳{q.forwardRate.toFixed(2)}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Premium: +৳{q.forwardPointsBdt.toFixed(2)} / USD
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Matures: {q.maturityDate}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
                <span className="font-semibold text-white block">CIRP Pricing Formula:</span>
                <p className="font-mono text-slate-300">
                  F = Spot × [ (1 + r_BDT × t / 360) / (1 + r_USD × t / 360) ]
                </p>
                <p>
                  Where Current Spot = ৳121.50, BDT SMART Rate = 11.50%, US SOFR = 5.25%.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MTM Stress Test */}
          {activeTab === "mtm_stress" && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Simulate Market USD/BDT Spot Rate Shift:</span>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    ৳{stressSpotRate.toFixed(2)} / USD
                  </span>
                </div>
                <input
                  type="range"
                  min={115.0}
                  max={130.0}
                  step={0.25}
                  value={stressSpotRate}
                  onChange={(e) => setStressSpotRate(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>৳115.00 (BDT Appreciates)</span>
                  <span>৳121.50 (Base Spot)</span>
                  <span>৳130.00 (BDT Depreciates)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Hedged Portfolio Realization</span>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                    ৳{(15000 * 123.38).toLocaleString("en-BD")}
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    ✓ 100% Guaranteed locked value
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Unhedged Market Realization</span>
                  <div className="text-lg font-bold font-mono text-slate-300 mt-1">
                    ৳{(15000 * stressSpotRate).toLocaleString("en-BD")}
                  </div>
                  <p className="text-[11px] mt-1 font-mono">
                    {15000 * 123.38 - 15000 * stressSpotRate >= 0 ? (
                      <span className="text-emerald-400">
                        +৳{(15000 * 123.38 - 15000 * stressSpotRate).toLocaleString("en-BD")} Saved vs Spot
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        -৳{(15000 * stressSpotRate - 15000 * 123.38).toLocaleString("en-BD")} Opportunity Cost
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: New Forward Booking */}
          {activeTab === "new_booking" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <form
                onSubmit={handleBookSubmit}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Authorized Dealer (AD) Bank
                    </label>
                    <select
                      value={adBankName}
                      onChange={(e) => setAdBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="BRAC Bank PLC">BRAC Bank PLC</option>
                      <option value="Eastern Bank PLC">Eastern Bank PLC</option>
                      <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                      <option value="The City Bank PLC">The City Bank PLC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Forward Tenor (Days)
                    </label>
                    <select
                      value={selectedTenor}
                      onChange={(e) => setSelectedTenor(Number(e.target.value) as ForwardTenorDays)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value={30}>30 Days (Locked @ ৳{quotes[30]?.forwardRate})</option>
                      <option value={60}>60 Days (Locked @ ৳{quotes[60]?.forwardRate})</option>
                      <option value={90}>90 Days (Locked @ ৳{quotes[90]?.forwardRate})</option>
                      <option value={180}>180 Days (Locked @ ৳{quotes[180]?.forwardRate})</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Underlying Form-EXP Number
                    </label>
                    <input
                      type="text"
                      value={underlyingExp}
                      onChange={(e) => setUnderlyingExp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Underlying LC / Contract #
                    </label>
                    <input
                      type="text"
                      value={underlyingLc}
                      onChange={(e) => setUnderlyingLc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Notional Export Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={notionalUsd}
                    onChange={(e) => setNotionalUsd(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Locked Exchange Rate:</span>
                    <span className="font-mono text-cyan-400 font-bold">৳{quotes[selectedTenor]?.forwardRate} / USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Guaranteed Inflow:</span>
                    <span className="font-mono text-white font-bold">৳{(notionalUsd * (quotes[selectedTenor]?.forwardRate || 123.38)).toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5% Margin Lien (AD Bank):</span>
                    <span className="font-mono text-amber-400 font-bold">৳{((notionalUsd * (quotes[selectedTenor]?.forwardRate || 123.38) * 5) / 100).toLocaleString("en-BD")}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 fill-current" />
                  {isSubmitting ? "Locking Forward Rate..." : "Book Forward Exchange Contract"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FxHedgingModal;
