import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
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

interface DebtRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "policies" | "cheques_notice" | "issue_policy" | "log_cheque";

export interface RecoverySummaryMetrics {
  totalInsuredPortfolioBdt: number;
  activePoliciesCount: number;
  totalDishonoredChequesBdt: number;
  totalIndemnityPaidBdt: number;
  activeLegalNoticesCount: number;
  statutorySuccessRatePercent: number;
}

export interface TradeInsurancePolicy {
  policyId: string;
  invoiceId: string;
  mushak63No: string;
  sellerCompanyName: string;
  buyerName: string;
  buyerTier: string;
  insuredInvoiceAmountBdt: number;
  indemnityRatePercent: number;
  maxCoveredIndemnityBdt: number;
  premiumRatePercent: number;
  premiumAmountBdt: number;
  policyStartDate: string;
  policyExpiryDate: string;
  status: "active" | "claimed" | "expired";
  policyHash: string;
}

export interface DishonoredChequeRecord {
  id: string;
  chequeNumber: string;
  bankName: string;
  branchName: string;
  chequeAmountBdt: number;
  chequeDate: string;
  dishonorMemoDate: string;
  dishonorReason: string;
  debtorCompanyName: string;
  debtorSignatoryName: string;
  legalNoticeServed: boolean;
  statutoryNoticeDeadline: string;
  status: "memo_received" | "notice_served" | "claim_settled" | "court_filed";
  legalNoticeContentBangla: string;
  legalNoticeContentEnglish: string;
}

const DEFAULT_SUMMARY: RecoverySummaryMetrics = {
  totalInsuredPortfolioBdt: 4650000,
  activePoliciesCount: 3,
  totalDishonoredChequesBdt: 650000,
  totalIndemnityPaidBdt: 1800000,
  activeLegalNoticesCount: 1,
  statutorySuccessRatePercent: 94.5,
};

const DEFAULT_POLICIES: TradeInsurancePolicy[] = [
  {
    policyId: "POL-PRAN-991",
    invoiceId: "INV-2026-9901",
    mushak63No: "MUSHAK-6.3-99812",
    sellerCompanyName: "Shothik Agritech Ltd.",
    buyerName: "PRAN-RFL Group",
    buyerTier: "tier_1_aaa",
    insuredInvoiceAmountBdt: 1200000,
    indemnityRatePercent: 90,
    maxCoveredIndemnityBdt: 1080000,
    premiumRatePercent: 0.45,
    premiumAmountBdt: 5400,
    policyStartDate: "2026-08-15",
    policyExpiryDate: "2027-02-15",
    status: "active",
    policyHash: "a1b2c3d4e5f60718",
  },
  {
    policyId: "POL-SQUARE-442",
    invoiceId: "INV-2026-9902",
    mushak63No: "MUSHAK-6.3-44109",
    sellerCompanyName: "Apex Packaging Ltd.",
    buyerName: "Square Pharmaceuticals PLC",
    buyerTier: "tier_1_aaa",
    insuredInvoiceAmountBdt: 2500000,
    indemnityRatePercent: 90,
    maxCoveredIndemnityBdt: 2250000,
    premiumRatePercent: 0.45,
    premiumAmountBdt: 11250,
    policyStartDate: "2026-09-01",
    policyExpiryDate: "2027-03-01",
    status: "active",
    policyHash: "8f9e0a1b2c3d4e5f",
  },
  {
    policyId: "POL-CHITTAGONG-773",
    invoiceId: "INV-2026-9903",
    mushak63No: "MUSHAK-6.3-77218",
    sellerCompanyName: "Dhaka Wholesalers",
    buyerName: "Chittagong Retail Distribution Ltd.",
    buyerTier: "tier_3_bbb",
    insuredInvoiceAmountBdt: 950000,
    indemnityRatePercent: 85,
    maxCoveredIndemnityBdt: 807500,
    premiumRatePercent: 1.25,
    premiumAmountBdt: 11875,
    policyStartDate: "2026-08-20",
    policyExpiryDate: "2027-02-20",
    status: "active",
    policyHash: "4c5d6e7f8a9b0c1d",
  },
];

const DEFAULT_CHEQUES: DishonoredChequeRecord[] = [
  {
    id: "CHQ-001",
    chequeNumber: "SB-CHQ-9912034",
    bankName: "Sonali Bank PLC",
    branchName: "Motijheel Corporate Branch",
    chequeAmountBdt: 650000,
    chequeDate: "2026-08-20",
    dishonorMemoDate: "2026-08-28",
    dishonorReason: "insufficient_funds",
    debtorCompanyName: "Bengal Traders & Logistics Ltd.",
    debtorSignatoryName: "Md. Rafiqul Islam",
    legalNoticeServed: true,
    statutoryNoticeDeadline: "2026-09-27",
    status: "notice_served",
    legalNoticeContentBangla: "আইনি নোটিশ (ধারা ১৩৮, দ্য নেগোশিয়েবল ইন্সট্রুমেন্টস অ্যাক্ট, ১৮৮১)\nচেক নং SB-CHQ-9912034, পরিমাণ ৳6,50,000 অপর্যাপ্ত তহবিলের কারণে প্রত্যাখ্যাত হয়েছে। আগামী ৩০ দিনের মধ্যে পরিশোধ না করিলে ফৌজদারি মামলা দায়ের করা হইবে।",
    legalNoticeContentEnglish: "STATUTORY LEGAL NOTICE UNDER SECTION 138 NI ACT 1881\nCheque No. SB-CHQ-9912034 for BDT 650,000 dishonored on 2026-08-28 for insufficient funds. Demand to pay within 30 days.",
  },
];

export const DebtRecoveryModal: React.FC<DebtRecoveryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("policies");
  const [summary, setSummary] = useState<RecoverySummaryMetrics>(DEFAULT_SUMMARY);
  const [policies, setPolicies] = useState<TradeInsurancePolicy[]>(DEFAULT_POLICIES);
  const [cheques, setCheques] = useState<DishonoredChequeRecord[]>(DEFAULT_CHEQUES);
  const [selectedCheque, setSelectedCheque] = useState<DishonoredChequeRecord | null>(DEFAULT_CHEQUES[0]);
  const [copied, setCopied] = useState(false);

  // New Policy Form State
  const [newBuyer, setNewBuyer] = useState("PRAN-RFL Group");
  const [newMushak, setNewMushak] = useState("MUSHAK-6.3-99002");
  const [newAmount, setNewAmount] = useState(1500000);
  const [isIssuing, setIsIssuing] = useState(false);

  // Log Cheque Form State
  const [logChequeNo, setLogChequeNo] = useState("BRAC-889911");
  const [logBank, setLogBank] = useState("BRAC Bank PLC");
  const [logAmount, setLogAmount] = useState(450000);
  const [logMemoDate, setLogMemoDate] = useState("2026-09-15");
  const [logDebtor, setLogDebtor] = useState("Padma Wholesale Syndicate Ltd.");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const sumRes = await fetch("/api/v1/recovery/summary");
      if (sumRes.ok) {
        const sData = await sumRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const polRes = await fetch("/api/v1/recovery/policies");
      if (polRes.ok) {
        const pData = await polRes.json();
        if (pData.ok && pData.data.length > 0) setPolicies(pData.data);
      }

      const chqRes = await fetch("/api/v1/recovery/cheques");
      if (chqRes.ok) {
        const cData = await chqRes.json();
        if (cData.ok && cData.data.length > 0) {
          setCheques(cData.data);
          setSelectedCheque(cData.data[0]);
        }
      }
    } catch {
      // Retain defaults
    }
  };

  const handleIssuePolicy = async () => {
    setIsIssuing(true);
    try {
      const res = await fetch("/api/v1/recovery/policies/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mushak63No: newMushak,
          buyerName: newBuyer,
          buyerTier: newBuyer.includes("PRAN") ? "tier_1_aaa" : "tier_2_aplus",
          insuredInvoiceAmountBdt: newAmount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setPolicies([data.data, ...policies]);
          setActiveTab("policies");
        }
      }
    } catch {
      setActiveTab("policies");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleLogCheque = async () => {
    setIsLogging(true);
    try {
      const res = await fetch("/api/v1/recovery/cheques/dishonor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chequeNumber: logChequeNo,
          bankName: logBank,
          chequeAmountBdt: logAmount,
          dishonorMemoDate: logMemoDate,
          dishonorReason: "insufficient_funds",
          debtorCompanyName: logDebtor,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setCheques([data.data, ...cheques]);
          setSelectedCheque(data.data);
          setActiveTab("cheques_notice");
        }
      }
    } catch {
      setActiveTab("cheques_notice");
    } finally {
      setIsLogging(false);
    }
  };

  const copyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Trade Credit Insurance & Debt Recovery Studio"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  B2B Trade Credit Insurance & NI Act 138 Recovery Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                  NI Act 1881 Sec 138 & 90% Indemnity
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ট্রেড ক্রেডিট ইন্স্যুরেন্স বন্ডিং, বাউন্সড চেক অটোমেটেড লিগ্যাল নোটিশ ও অর্থঋণ আদালত মামলা ডজিয়ার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                90% Default Indemnity
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                30-Day Legal Clock
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
            <span className="text-xs text-slate-400 font-medium">Insured Supply Portfolio</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ৳{(summary?.totalInsuredPortfolioBdt ?? 4650000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">{policies.length} Policies</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Bounced Cheques Tracked</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-400">
                ৳{(summary?.totalDishonoredChequesBdt ?? 650000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-rose-400/80">{cheques.length} Notice(s)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Indemnity Claims Disbursed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.totalIndemnityPaidBdt ?? 1800000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">90% Payout</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Statutory Recovery Rate</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-teal-400">94.5%</span>
              <span className="text-[11px] text-teal-400/80">NI 138 Mediation</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "policies"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Trade Insurance Policies ({policies.length})
          </button>

          <button
            onClick={() => setActiveTab("cheques_notice")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "cheques_notice"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            NI Act 138 Legal Notice Generator
          </button>

          <button
            onClick={() => setActiveTab("issue_policy")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "issue_policy"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Insure New Supply Invoice
          </button>

          <button
            onClick={() => setActiveTab("log_cheque")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "log_cheque"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Log Cheque Dishonor Memo
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Policies */}
          {activeTab === "policies" && (
            <div className="space-y-3">
              {policies.map((pol) => (
                <div
                  key={pol.policyId}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{pol.buyerName}</span>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[10px]">
                        {pol.policyId}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                        {pol.indemnityRatePercent}% Indemnity Bond
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Invoice: {pol.mushak63No} • Insured Value: ৳{pol.insuredInvoiceAmountBdt.toLocaleString("en-BD")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Premium Paid ({pol.premiumRatePercent}%): ৳{pol.premiumAmountBdt.toLocaleString("en-BD")} • Max Coverage: ৳{pol.maxCoveredIndemnityBdt.toLocaleString("en-BD")}
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-emerald-400">
                      ৳{pol.maxCoveredIndemnityBdt.toLocaleString("en-BD")}
                    </span>
                    <span className="block text-[10px] text-slate-400">Guaranteed Recovery</span>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {pol.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Cheques & Legal Notice */}
          {activeTab === "cheques_notice" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Dishonored Security Cheques
                </div>

                {cheques.map((chq) => (
                  <div
                    key={chq.id}
                    onClick={() => setSelectedCheque(chq)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-xs ${
                      selectedCheque?.id === chq.id
                        ? "bg-rose-500/10 border-rose-500/30 shadow-md"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{chq.debtorCompanyName}</span>
                      <span className="font-mono text-rose-400 font-bold">
                        ৳{chq.chequeAmountBdt.toLocaleString("en-BD")}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Cheque: {chq.chequeNumber} ({chq.bankName})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Memo Date: {chq.dishonorMemoDate} • Statutory Deadline: {chq.statutoryNoticeDeadline}
                    </p>
                  </div>
                ))}
              </div>

              {/* Legal Notice Preview */}
              {selectedCheque && (
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      Statutory Section 138 Notice
                    </div>
                    <button
                      onClick={() => copyNotice(selectedCheque.legalNoticeContentBangla)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy Legal Notice"}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
{selectedCheque.legalNoticeContentBangla}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Issue Policy */}
          {activeTab === "issue_policy" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  Bond Supply Contract with 90% Trade Credit Insurance
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Corporate Buyer Name</label>
                  <select
                    value={newBuyer}
                    onChange={(e) => setNewBuyer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-medium"
                  >
                    <option value="PRAN-RFL Group">PRAN-RFL Group (Tier-1 AAA - 0.45% Premium)</option>
                    <option value="Square Pharmaceuticals PLC">Square Pharmaceuticals PLC (Tier-1 AAA - 0.45% Premium)</option>
                    <option value="Walton Hi-Tech Industries PLC">Walton Hi-Tech Industries PLC (Tier-2 A+ - 0.75% Premium)</option>
                    <option value="Aarong (BRAC Enterprises)">Aarong BRAC (Tier-2 A+ - 0.75% Premium)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Mushak-6.3 Invoice Number</label>
                  <input
                    type="text"
                    value={newMushak}
                    onChange={(e) => setNewMushak(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Insured Invoice Gross Amount (BDT)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between text-slate-300">
                  <span>Estimated Premium (0.45%):</span>
                  <span className="font-mono text-emerald-400 font-bold">৳{Math.round(newAmount * 0.0045).toLocaleString("en-BD")}</span>
                </div>

                <button
                  onClick={handleIssuePolicy}
                  disabled={isIssuing}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {isIssuing ? "Issuing Policy Certificate..." : "Issue 90% Trade Credit Insurance Policy"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Log Cheque */}
          {activeTab === "log_cheque" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Log Dishonored Cheque & Generate Statutory NI 138 Notice
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Cheque Number</label>
                    <input
                      type="text"
                      value={logChequeNo}
                      onChange={(e) => setLogChequeNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Drawn Bank Name</label>
                    <input
                      type="text"
                      value={logBank}
                      onChange={(e) => setLogBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Cheque Amount (BDT)</label>
                    <input
                      type="number"
                      value={logAmount}
                      onChange={(e) => setLogAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Dishonor Memo Date</label>
                    <input
                      type="date"
                      value={logMemoDate}
                      onChange={(e) => setLogMemoDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Debtor Company / Signatory Name</label>
                  <input
                    type="text"
                    value={logDebtor}
                    onChange={(e) => setLogDebtor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2"
                  />
                </div>

                <button
                  onClick={handleLogCheque}
                  disabled={isLogging}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {isLogging ? "Generating Statutory Notice..." : "Log Memo & Compile Section 138 Notice"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtRecoveryModal;
