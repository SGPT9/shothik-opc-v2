import React, { useState } from "react";
import {
  FileText,
  Scale,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
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
  ArrowRight,
  Lock,
  Globe,
  Layers,
  FileSpreadsheet,
  Award,
  DollarSign,
  Landmark,
  Briefcase,
  FileCode,
} from "lucide-react";

export interface TenderBidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type TenderType = "egp_government_cptu" | "corporate_enterprise_rfp" | "ngo_donor_procurement";
export type StdDocumentType = "PG1_MICRO" | "PG2_SMALL" | "PG3_OPEN_NATIONAL" | "PW2_WORKS_SMALL" | "PW3_WORKS_LARGE";
export type BidStatus = "draft" | "submitted" | "technically_responsive" | "awarded_contract" | "rejected";

export interface BoqItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  materialCostPerUnitBdt: number;
  laborCostPerUnitBdt: number;
  equipmentOverheadPerUnitBdt: number;
  baseUnitCostBdt: number;
  totalBaseCostBdt: number;
  vatRatePercent: number;
  aitRatePercent: number;
  quotedUnitRateBdt: number;
  totalQuotedAmountBdt: number;
}

export interface TenderBidRecord {
  id: string;
  tenderId: string;
  tenderTitle: string;
  procuringEntity: string;
  tenderType: TenderType;
  stdDocumentType: StdDocumentType;
  estimatedValueBdt: number;
  quotedTotalValueBdt: number;
  tenderSecurityAmountBdt: number;
  performanceSecurityAmountBdt: number;
  submissionDeadlineIso: string;
  boqItems: BoqItem[];
  status: BidStatus;
  eligibilityScorePercent: number;
  contractorName: string;
  contractorBin: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenderSummaryMetrics {
  totalBidsTracked: number;
  totalBidPortfolioValueBdt: number;
  awardedContractsCount: number;
  totalAwardedValueBdt: number;
  averageWinRatePercent: number;
}

type TabType = "bids" | "generator" | "boq" | "eligibility";

const DEFAULT_METRICS: TenderSummaryMetrics = {
  totalBidsTracked: 4,
  totalBidPortfolioValueBdt: 18500000,
  awardedContractsCount: 2,
  totalAwardedValueBdt: 6800000,
  averageWinRatePercent: 50.0,
};

const INITIAL_BIDS: TenderBidRecord[] = [
  {
    id: "BID-2026-001",
    tenderId: "eGP-CPTU-2026-981023",
    tenderTitle: "Supply & Installation of High-Capacity Enterprise Networking Equipment",
    procuringEntity: "Bangladesh Power Development Board (BPDB)",
    tenderType: "egp_government_cptu",
    stdDocumentType: "PG3_OPEN_NATIONAL",
    estimatedValueBdt: 8500000,
    quotedTotalValueBdt: 7950000,
    tenderSecurityAmountBdt: 200000,
    performanceSecurityAmountBdt: 795000,
    submissionDeadlineIso: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    boqItems: [
      {
        itemNo: "01",
        description: "Enterprise Core Layer-3 48-Port Switch",
        unit: "Pcs",
        quantity: 12,
        materialCostPerUnitBdt: 280000,
        laborCostPerUnitBdt: 15000,
        equipmentOverheadPerUnitBdt: 10000,
        baseUnitCostBdt: 305000,
        totalBaseCostBdt: 3660000,
        vatRatePercent: 7.5,
        aitRatePercent: 5.0,
        quotedUnitRateBdt: 345000,
        totalQuotedAmountBdt: 4140000,
      },
    ],
    status: "technically_responsive",
    eligibilityScorePercent: 98,
    contractorName: "NextGen Cloud Technologies Ltd.",
    contractorBin: "0019283746192",
    digitalSealHash: "c810294bc091284bc51908efa123bc0914a821eef00192837bc991a288410212",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-10T14:30:00.000Z",
  },
  {
    id: "BID-2026-002",
    tenderId: "RFP-GP-2026-44102",
    tenderTitle: "Corporate Uniforms & Eco-Friendly Merchandising Kit",
    procuringEntity: "Grameenphone PLC (Corporate HQ)",
    tenderType: "corporate_enterprise_rfp",
    stdDocumentType: "PG2_SMALL",
    estimatedValueBdt: 3500000,
    quotedTotalValueBdt: 3200000,
    tenderSecurityAmountBdt: 80000,
    performanceSecurityAmountBdt: 320000,
    submissionDeadlineIso: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    boqItems: [],
    status: "awarded_contract",
    eligibilityScorePercent: 100,
    contractorName: "Bengal Garment Solutions Ltd.",
    contractorBin: "0028193847102",
    digitalSealHash: "d910294bc091284bc51908efa123bc0914a821eef00192837bc991a288410992",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: "2026-07-28T16:00:00.000Z",
  },
];

export const TenderBidModal: React.FC<TenderBidModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("bids");
  const [bids, setBids] = useState<TenderBidRecord[]>(INITIAL_BIDS);
  const [metrics, setMetrics] = useState<TenderSummaryMetrics>(DEFAULT_METRICS);
  const [selectedBid, setSelectedBid] = useState<TenderBidRecord | null>(INITIAL_BIDS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Bid
  const [tenderId, setTenderId] = useState("eGP-CPTU-2026-449102");
  const [tenderTitle, setTenderTitle] = useState("Procurement of IT Hardware & Cloud Server Infrastructure");
  const [procuringEntity, setProcuringEntity] = useState("Dhaka Power Distribution Company (DPDC)");
  const [tenderType, setTenderType] = useState<TenderType>("egp_government_cptu");
  const [stdDocumentType, setStdDocumentType] = useState<StdDocumentType>("PG3_OPEN_NATIONAL");
  const [quotedValueBdt, setQuotedValueBdt] = useState<number>(5400000);
  const [contractorName, setContractorName] = useState("NextGen Systems Ltd.");
  const [contractorBin, setContractorBin] = useState("0019283746192");

  // BOQ Calculator State
  const [boqQty, setBoqQty] = useState<number>(10);
  const [boqMaterial, setBoqMaterial] = useState<number>(150000);
  const [boqLabor, setBoqLabor] = useState<number>(20000);
  const [boqOverhead, setBoqOverhead] = useState<number>(10000);
  const [boqProfitPercent, setBoqProfitPercent] = useState<number>(15);
  const [boqResult, setBoqResult] = useState<{
    baseUnit: number;
    unitVat: number;
    unitAit: number;
    quotedUnit: number;
    totalBid: number;
  } | null>(null);

  // Eligibility Screener State
  const [reqTurnover, setReqTurnover] = useState<number>(5000000);
  const [myTurnover, setMyTurnover] = useState<number>(6500000);
  const [reqLiquid, setReqLiquid] = useState<number>(2000000);
  const [myLiquid, setMyLiquid] = useState<number>(2500000);
  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    score: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateBid = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `BID-2026-00${bids.length + 1}`;
    const tenderSecurity = Math.round(quotedValueBdt * 0.025);
    const performanceSecurity = Math.round(quotedValueBdt * 0.10);

    const newRecord: TenderBidRecord = {
      id: newId,
      tenderId,
      tenderTitle,
      procuringEntity,
      tenderType,
      stdDocumentType,
      estimatedValueBdt: quotedValueBdt,
      quotedTotalValueBdt: quotedValueBdt,
      tenderSecurityAmountBdt: tenderSecurity,
      performanceSecurityAmountBdt: performanceSecurity,
      submissionDeadlineIso: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      boqItems: [],
      status: "submitted",
      eligibilityScorePercent: 96,
      contractorName,
      contractorBin,
      digitalSealHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBids([newRecord, ...bids]);
    setSelectedBid(newRecord);
    setMetrics((prev) => ({
      ...prev,
      totalBidsTracked: prev.totalBidsTracked + 1,
      totalBidPortfolioValueBdt: prev.totalBidPortfolioValueBdt + quotedValueBdt,
    }));
    setActiveTab("bids");
  };

  const handleCalculateBoq = () => {
    const base = boqMaterial + boqLabor + boqOverhead;
    const profit = (base * boqProfitPercent) / 100;
    const vat = (base * 7.5) / 100;
    const ait = (base * 5.0) / 100;
    const unitRate = Math.round(base + profit + vat + ait);
    const total = unitRate * boqQty;

    setBoqResult({
      baseUnit: base,
      unitVat: Math.round(vat),
      unitAit: Math.round(ait),
      quotedUnit: unitRate,
      totalBid: total,
    });
  };

  const handleScreenEligibility = () => {
    const passedTurnover = myTurnover >= reqTurnover;
    const passedLiquid = myLiquid >= reqLiquid;
    const isEligible = passedTurnover && passedLiquid;
    const score = (passedTurnover ? 50 : 25) + (passedLiquid ? 50 : 25);

    setEligibilityResult({ isEligible, score });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Government e-GP Tender & Corporate Bid Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  CPTU / PPR 2008 Compliant
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                  ⌘T
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous e-GP tender response drafter, CPTU BOQ rate analyzer, tender security tracker, and eligibility screener
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-slate-950/30 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Tenders Tracked</div>
              <div className="text-base font-bold text-white">{metrics.totalBidsTracked} Bids</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-slate-400">Total Bid Portfolio</div>
              <div className="text-base font-bold text-indigo-400">
                ৳{(metrics.totalBidPortfolioValueBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">Awarded Contracts</div>
              <div className="text-base font-bold text-emerald-400">
                ৳{(metrics.totalAwardedValueBdt / 100000).toFixed(1)} Lakh ({metrics.awardedContractsCount})
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-400">e-GP Win Rate</div>
              <div className="text-base font-bold text-cyan-400">{metrics.averageWinRatePercent}%</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("bids")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "bids"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Active Tender Bids ({bids.length})
          </button>
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "generator"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Bid Dossier Drafter
          </button>
          <button
            onClick={() => setActiveTab("boq")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "boq"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CPTU BOQ Rate Analysis
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "eligibility"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            PPR 2008 Eligibility Screener
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {/* TAB 1: Active Bids */}
          {activeTab === "bids" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">
                  e-GP Submissions & Corporate Procurement Proposals
                </h3>
                <button
                  onClick={() => setActiveTab("generator")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Draft New Tender Bid
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bids.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBid(b)}
                    className={`p-4 rounded-xl bg-slate-900 border cursor-pointer transition-all hover:shadow-lg ${
                      selectedBid?.id === b.id ? "border-amber-400" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-amber-400 rounded">
                          {b.tenderId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            b.status === "awarded_contract"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        ৳{(b.quotedTotalValueBdt / 100000).toFixed(1)} Lakh
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{b.tenderTitle}</h4>
                    <p className="text-xs text-slate-400 mb-3">{b.procuringEntity}</p>

                    <div className="text-xs space-y-1 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">STD Form Type:</span>
                        <span className="font-mono text-slate-200">{b.stdDocumentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tender Security (2.5% BG):</span>
                        <span className="font-mono text-amber-400">৳{b.tenderSecurityAmountBdt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Eligibility Score:</span>
                        <span className="font-semibold text-emerald-400">{b.eligibilityScorePercent}% Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Lock className="w-3 h-3" /> Seal: {b.digitalSealHash.slice(0, 10)}...
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(b.digitalSealHash, b.id);
                        }}
                        className="flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        {copiedId === b.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Seal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: New Bid Generator */}
          {activeTab === "generator" && (
            <form onSubmit={handleCreateBid} className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">CPTU e-GP Submission Protocol:</span> Automated generation of Standard Tender Document dossiers compliant with Public Procurement Rules 2008 (PPR 2008) including Form PG3-1 Submission Letter, BOQ Price Schedule, and Bank Guarantee requests.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    e-GP Tender ID / Reference
                  </label>
                  <input
                    type="text"
                    value={tenderId}
                    onChange={(e) => setTenderId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Procuring Entity / Ministry
                  </label>
                  <input
                    type="text"
                    value={procuringEntity}
                    onChange={(e) => setProcuringEntity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tender Title & Scope of Work
                </label>
                <input
                  type="text"
                  value={tenderTitle}
                  onChange={(e) => setTenderTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Procurement Channel
                  </label>
                  <select
                    value={tenderType}
                    onChange={(e) => setTenderType(e.target.value as TenderType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="egp_government_cptu">National e-GP Portal (CPTU)</option>
                    <option value="corporate_enterprise_rfp">Corporate Private RFP</option>
                    <option value="ngo_donor_procurement">UN / Donor Agency Procurement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Standard Document (STD)
                  </label>
                  <select
                    value={stdDocumentType}
                    onChange={(e) => setStdDocumentType(e.target.value as StdDocumentType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PG3_OPEN_NATIONAL">PG3 (Goods Open Tendering)</option>
                    <option value="PG2_SMALL">PG2 (Goods Small Value)</option>
                    <option value="PW2_WORKS_SMALL">PW2 (Works Small Scale)</option>
                    <option value="PW3_WORKS_LARGE">PW3 (Works Open National)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Quoted Total Bid Value (BDT)
                  </label>
                  <input
                    type="number"
                    value={quotedValueBdt}
                    onChange={(e) => setQuotedValueBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Dynamic Guarantee Breakdown Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Statutory Tender Security & Performance Bond</div>
                  <div className="text-base font-bold text-white flex items-center gap-3 mt-0.5">
                    <span className="text-amber-400 font-mono">
                      Security (2.5%): ৳{Math.round(quotedValueBdt * 0.025).toLocaleString()}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-mono">
                      Performance BG (10%): ৳{Math.round(quotedValueBdt * 0.10).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> CPTU Form PG3-4 Bank Guarantee Ready
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("bids")}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Generate e-GP Bid Dossier & SHA-256 Seal
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CPTU BOQ Rate Analysis */}
          {activeTab === "boq" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" /> BOQ Item Rate Analysis & Statutory Withholding
                </h3>
                <p className="text-slate-400">
                  Calculates unit item rates accounting for material costs, skilled labor, overheads, contractor margin, and statutory 7.5% VAT and 5% AIT deductions.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Item Quantity</label>
                    <input
                      type="number"
                      value={boqQty}
                      onChange={(e) => setBoqQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Raw Material Unit Cost (BDT)</label>
                    <input
                      type="number"
                      value={boqMaterial}
                      onChange={(e) => setBoqMaterial(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Direct Labor & Installation (BDT)</label>
                    <input
                      type="number"
                      value={boqLabor}
                      onChange={(e) => setBoqLabor(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Equipment & Overheads (BDT)</label>
                    <input
                      type="number"
                      value={boqOverhead}
                      onChange={(e) => setBoqOverhead(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleCalculateBoq}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Calculate BOQ Rate & Statutory Taxes
                  </button>
                </div>

                {boqResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Quoted Unit Rate (All-Inclusive):</span>
                      <span className="font-bold text-amber-400 text-sm">৳{boqResult.quotedUnit.toLocaleString()}/unit</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Base Cost</div>
                        <div className="font-bold text-white mt-0.5">৳{boqResult.baseUnit.toLocaleString()}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">VAT (7.5%)</div>
                        <div className="font-bold text-cyan-400 mt-0.5">৳{boqResult.unitVat.toLocaleString()}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">AIT (5.0%)</div>
                        <div className="font-bold text-amber-400 mt-0.5">৳{boqResult.unitAit.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-300 font-semibold">Total Item Quoted Amount ({boqQty} Units):</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        ৳{boqResult.totalBid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PPR 2008 Eligibility Screener */}
          {activeTab === "eligibility" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> CPTU & PPR 2008 Rule 54 Eligibility Pre-Auditor
                </h3>
                <p className="text-slate-400">
                  Pre-screens contractor qualifications against mandatory government procurement thresholds to avoid technical disqualification.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Required Annual Turnover (BDT)</label>
                    <input
                      type="number"
                      value={reqTurnover}
                      onChange={(e) => setReqTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Company Annual Turnover (BDT)</label>
                    <input
                      type="number"
                      value={myTurnover}
                      onChange={(e) => setMyTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Required Liquid Assets Line (BDT)</label>
                    <input
                      type="number"
                      value={reqLiquid}
                      onChange={(e) => setReqLiquid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Company Liquid Assets (BDT)</label>
                    <input
                      type="number"
                      value={myLiquid}
                      onChange={(e) => setMyLiquid(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleScreenEligibility}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" /> Run Eligibility Pre-Audit
                  </button>
                </div>

                {eligibilityResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Qualification Score</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {eligibilityResult.score}% QUALIFIED
                      </span>
                    </div>
                    <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All CPTU Form PG3 statutory criteria met without JV requirement.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>CPTU e-GP Standard Tender Document Protocol Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderBidModal;
