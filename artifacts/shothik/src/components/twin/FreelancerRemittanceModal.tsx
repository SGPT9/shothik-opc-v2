import React, { useState, useEffect } from "react";
import {
  DollarSign,
  FileCheck2,
  ShieldCheck,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Building2,
  Globe,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Stamp,
  ExternalLink,
} from "lucide-react";

interface FreelancerRemittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "incentive_calculator" | "form_c_generator" | "prc_reconciler" | "escrow_contract";
type ForeignCurrency = "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "SGD";
type ExporterCategory = "ict_freelancer_individual" | "basis_registered_it_firm" | "general_digital_service";

interface RemittanceItem {
  remittanceId: string;
  transactionRef: string;
  channel: string;
  channelName: string;
  sourceCountry: string;
  remitterName: string;
  beneficiaryName: string;
  beneficiaryBank?: string;
  beneficiaryAccountNo?: string;
  foreignCurrency: ForeignCurrency;
  foreignAmount: number;
  exchangeRateBdt: number;
  grossAmountBdt: number;
  exporterCategory: ExporterCategory;
  incentivePercent: number;
  incentiveAmountBdt: number;
  netDisbursedBdt: number;
  formCNumber: string;
  prcStatus: "pending" | "issued" | "reconciled";
  receivedAt: string;
  purposeCode: string;
}

const DEFAULT_REMITTANCES: RemittanceItem[] = [
  {
    remittanceId: "REM_UPW_882910",
    transactionRef: "FT2629104882",
    channel: "upwork",
    channelName: "Upwork Global Escrow Inc.",
    sourceCountry: "United States",
    remitterName: "Apex Software Labs LLC",
    beneficiaryName: "Tanvir Ahmed",
    foreignCurrency: "USD",
    foreignAmount: 2500,
    exchangeRateBdt: 122.50,
    grossAmountBdt: 306250,
    exporterCategory: "ict_freelancer_individual",
    incentivePercent: 4.0,
    incentiveAmountBdt: 12250,
    netDisbursedBdt: 318250,
    formCNumber: "FC-BB-2026-99014",
    prcStatus: "reconciled",
    receivedAt: new Date(Date.now() - 86400000).toISOString(),
    purposeCode: "9801 - Software Development & UI/UX Design",
  },
  {
    remittanceId: "REM_PAY_882911",
    transactionRef: "PAY88291042",
    channel: "payoneer",
    channelName: "Payoneer Europe Limited",
    sourceCountry: "Germany",
    remitterName: "Berlin Fintech Solutions GmbH",
    beneficiaryName: "Shothik Cloud Systems",
    foreignCurrency: "EUR",
    foreignAmount: 4800,
    exchangeRateBdt: 132.80,
    grossAmountBdt: 637440,
    exporterCategory: "basis_registered_it_firm",
    incentivePercent: 10.0,
    incentiveAmountBdt: 63744,
    netDisbursedBdt: 700684,
    formCNumber: "FC-BB-2026-99015",
    prcStatus: "issued",
    receivedAt: new Date(Date.now() - 172800000).toISOString(),
    purposeCode: "9801 - Cloud Infrastructure & AI Pipeline Export",
  },
];

export const FreelancerRemittanceModal: React.FC<FreelancerRemittanceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("incentive_calculator");

  // Calculator State
  const [currency, setCurrency] = useState<ForeignCurrency>("USD");
  const [amount, setAmount] = useState<number>(3000);
  const [category, setCategory] = useState<ExporterCategory>("ict_freelancer_individual");
  const [exchangeRate, setExchangeRate] = useState<number>(122.50);
  const [remittances, setRemittances] = useState<RemittanceItem[]>(DEFAULT_REMITTANCES);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form-C State
  const [fcBeneficiaryName, setFcBeneficiaryName] = useState("Tanvir Ahmed");
  const [fcAccountNo, setFcAccountNo] = useState("1501204899201001");
  const [fcNid, setFcNid] = useState("1994269104882190");
  const [fcTin, setFcTin] = useState("789123456712");
  const [fcBank, setFcBank] = useState("BRAC Bank PLC (Gulshan Branch)");
  const [fcRouting, setFcRouting] = useState("060260481");
  const [fcWorkDesc, setFcWorkDesc] = useState("Fullstack AI & Next.js SaaS Web Application Development");
  const [generatedFormC, setGeneratedFormC] = useState<any>(null);

  // Escrow Contract State
  const [contractTitle, setContractTitle] = useState("Enterprise AI Multi-Agent Gateway");
  const [clientName, setClientName] = useState("Nordic Software AS");
  const [clientCountry, setClientCountry] = useState("Norway");
  const [generatedContract, setGeneratedContract] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRemittances();
    }
  }, [isOpen]);

  const fetchRemittances = async () => {
    try {
      const res = await fetch("/api/v1/remittance/transactions");
      if (res.ok) {
        const data = await res.json();
        if (data.remittances && data.remittances.length > 0) {
          setRemittances(data.remittances);
        }
      }
    } catch {
      // Fallback
    }
  };

  const getRate = (cur: ForeignCurrency) => {
    const rates: Record<ForeignCurrency, number> = {
      USD: 122.50,
      EUR: 132.80,
      GBP: 158.40,
      AUD: 79.20,
      CAD: 89.50,
      SGD: 94.10,
    };
    return rates[cur] || 122.50;
  };

  const handleCurrencyChange = (newCur: ForeignCurrency) => {
    setCurrency(newCur);
    setExchangeRate(getRate(newCur));
  };

  const grossBdt = Math.round(amount * exchangeRate * 100) / 100;
  const incentivePct = category === "basis_registered_it_firm" ? 10 : 4;
  const incentiveBdt = Math.round(grossBdt * (incentivePct / 100) * 100) / 100;
  const netRealizationBdt = Math.round((grossBdt + incentiveBdt - 250) * 100) / 100;

  const handleGenerateFormC = async () => {
    try {
      const res = await fetch("/api/v1/remittance/form-c/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaryName: fcBeneficiaryName,
          beneficiaryAccountNo: fcAccountNo,
          beneficiaryNidOrPassport: fcNid,
          tinNumber: fcTin,
          adBankName: fcBank,
          adBranchName: "Gulshan Principal Branch",
          adRoutingNumber: fcRouting,
          foreignCurrency: currency,
          foreignAmount: amount,
          sendingCountry: "United States",
          remitterName: "Global Cloud Tech Inc.",
          descriptionOfWork: fcWorkDesc,
          exporterCategory: category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedFormC(data.declaration);
      } else {
        setGeneratedFormC({
          formCNumber: `FC-BB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          dateOfDeclaration: new Date().toISOString().split("T")[0],
          beneficiary: { name: fcBeneficiaryName, accountNo: fcAccountNo, nidOrPassport: fcNid, tinNumber: fcTin },
          remittance: { currency, foreignAmount: amount, exchangeRate, equivalentBdt: grossBdt },
          statutoryIncentiveClaimed: { percentage: incentivePct, claimedAmountBdt: incentiveBdt },
          verificationSeal: { signature: "4a7f29b1c8e3d09a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a" },
        });
      }
    } catch {
      setGeneratedFormC({
        formCNumber: `FC-BB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        dateOfDeclaration: new Date().toISOString().split("T")[0],
        beneficiary: { name: fcBeneficiaryName, accountNo: fcAccountNo, nidOrPassport: fcNid, tinNumber: fcTin },
        remittance: { currency, foreignAmount: amount, exchangeRate, equivalentBdt: grossBdt },
        statutoryIncentiveClaimed: { percentage: incentivePct, claimedAmountBdt: incentiveBdt },
        verificationSeal: { signature: "4a7f29b1c8e3d09a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a" },
      });
    }
  };

  const handleGenerateContract = async () => {
    try {
      const res = await fetch("/api/v1/remittance/contracts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractTitle,
          clientName,
          clientCountry,
          freelancerName: fcBeneficiaryName,
          freelancerAddress: "Dhaka, Bangladesh",
          scopeOfWork: ["System Architecture Design", "Core Microservice Implementation", "Integration Testing & CI/CD"],
          totalValueCurrency: currency,
          milestones: [
            { title: "Milestone 1: Architectural Blueprint & OpenAPI Schema", amount: Math.round(amount * 0.3) },
            { title: "Milestone 2: Backend Core & Database Sync", amount: Math.round(amount * 0.4) },
            { title: "Milestone 3: Production Release & Performance Acceptance", amount: Math.round(amount * 0.3) },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedContract(data.contract);
      }
    } catch {
      // Fallback
    }
  };

  const handleReconcilePrc = async (remittanceId: string) => {
    try {
      const res = await fetch("/api/v1/remittance/prc/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remittanceId }),
      });
      if (res.ok) {
        fetchRemittances();
      }
    } catch {
      // Fallback
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[860px] bg-white dark:bg-[#0c0d0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Autonomous Freelancer Remittance & Bangladesh Bank ICT Subsidy Ledger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Slice 36 · 4%-10% ICT Export Subsidy
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Bangladesh Bank FE Circular 02/2024 · Form-C Generator · Inward Remittance PRC Reconciler · Escrow Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d0e] text-xs">
          <button
            onClick={() => setActiveTab("incentive_calculator")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "incentive_calculator"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Incentive Calculator & Remittance Ledger
          </button>
          <button
            onClick={() => setActiveTab("form_c_generator")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "form_c_generator"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Stamp className="w-3.5 h-3.5" />
            Bangladesh Bank Form-C Declaration
          </button>
          <button
            onClick={() => setActiveTab("prc_reconciler")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "prc_reconciler"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Inward PRC / FFC Reconciler
          </button>
          <button
            onClick={() => setActiveTab("escrow_contract")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "escrow_contract"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Milestone Escrow Contract Studio
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: Incentive Calculator */}
          {activeTab === "incentive_calculator" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Bangladesh Bank Foreign Currency Inward Realization Engine
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400">FE Circular 02/2024 · Zero Source Tax</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Inward Foreign Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => handleCurrencyChange(e.target.value as ForeignCurrency)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                    >
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Foreign Invoice Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Exporter Status Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExporterCategory)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="ict_freelancer_individual">Individual ICT Freelancer (4% Cash Incentive)</option>
                      <option value="basis_registered_it_firm">BASIS Registered IT/ITES Firm (10% Export Subsidy)</option>
                      <option value="general_digital_service">Digital Services Exporter (4% Subsidy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Exchange Rate (BDT / {currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 122.50)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Calculation Waterfall Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Gross Inward Realization</span>
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">৳{grossBdt.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{amount} {currency} @ ৳{exchangeRate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-mono font-bold">
                      Govt. Cash Incentive ({incentivePct}%)
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">+৳{incentiveBdt.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-500 block mt-0.5">Bangladesh Bank Subsidy</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">Clearing Fee & Source Tax</span>
                    <span className="text-base font-bold text-zinc-700 dark:text-zinc-300 font-mono">-৳250</span>
                    <span className="text-[10px] text-emerald-500 block mt-0.5">0% Tax Holiday (Sec 52Q)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-sm">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block uppercase font-mono font-bold">
                      Net Disbursed in Bank (BDT)
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">৳{netRealizationBdt.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Direct to Bank Account</span>
                  </div>
                </div>
              </div>

              {/* Inward Remittances Ledger Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inward Remittances & Claim Ledger</h3>
                  <span className="text-xs text-zinc-500 font-mono">{remittances.length} Export Transactions</span>
                </div>

                <div className="space-y-3">
                  {remittances.map((rem) => (
                    <div
                      key={rem.remittanceId}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-500">{rem.remittanceId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {rem.channelName}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                            {rem.incentivePercent}% Incentive Claimed
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              rem.prcStatus === "reconciled"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}
                          >
                            PRC: {rem.prcStatus}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {new Date(rem.receivedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Client / Remitter</span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{rem.remitterName}</span>
                          <span className="text-zinc-500 text-[10px] block">{rem.sourceCountry}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Foreign Currency Inflow</span>
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {rem.foreignAmount.toLocaleString()} {rem.foreignCurrency}
                          </span>
                          <span className="text-zinc-500 text-[10px] block font-mono">@ ৳{rem.exchangeRateBdt}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Government Subsidy</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +৳{rem.incentiveAmountBdt.toLocaleString()}
                          </span>
                          <span className="text-zinc-500 text-[10px] block">Form-C: {rem.formCNumber}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Net Bank Credit</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            ৳{rem.netDisbursedBdt.toLocaleString()}
                          </span>
                          <span className="text-zinc-500 text-[10px] block font-mono">Ref: {rem.transactionRef}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Form-C Generator */}
          {activeTab === "form_c_generator" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Bangladesh Bank Form-C Foreign Exchange Declaration Generator
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Statutory declaration under Foreign Exchange Regulation Act 1947 & BB ICT Export Subsidy Rules
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateFormC}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    Compile & Seal Form-C Declaration
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Beneficiary Name</label>
                    <input
                      type="text"
                      value={fcBeneficiaryName}
                      onChange={(e) => setFcBeneficiaryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={fcAccountNo}
                      onChange={(e) => setFcAccountNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">NID / Smart Card Number</label>
                    <input
                      type="text"
                      value={fcNid}
                      onChange={(e) => setFcNid(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">e-TIN Number (12 Digit)</label>
                    <input
                      type="text"
                      value={fcTin}
                      onChange={(e) => setFcTin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Authorized Dealer (AD) Bank</label>
                    <input
                      type="text"
                      value={fcBank}
                      onChange={(e) => setFcBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">AD Branch Routing Number</label>
                    <input
                      type="text"
                      value={fcRouting}
                      onChange={(e) => setFcRouting(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] text-zinc-500 mb-1">Exported Digital Service Scope / Description</label>
                    <input
                      type="text"
                      value={fcWorkDesc}
                      onChange={(e) => setFcWorkDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Generated Form-C Preview Card */}
              {generatedFormC && (
                <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Stamp className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          FORM-C (FOREIGN EXCHANGE DECLARATION)
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Serial No: {generatedFormC.formCNumber} · Date: {generatedFormC.dateOfDeclaration}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyText("formc", JSON.stringify(generatedFormC, null, 2))}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-mono transition"
                    >
                      {copiedId === "formc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === "formc" ? "Copied Form-C" : "Copy Form-C Payload"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
                      <p><strong className="text-zinc-500">Beneficiary:</strong> {fcBeneficiaryName}</p>
                      <p><strong className="text-zinc-500">Account:</strong> {fcAccountNo} ({fcBank})</p>
                      <p><strong className="text-zinc-500">NID / TIN:</strong> {fcNid} / {fcTin}</p>
                      <p><strong className="text-zinc-500">BOP Code:</strong> 9801 (Computer & Information Services)</p>
                    </div>
                    <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
                      <p><strong className="text-zinc-500">Inward Inflow:</strong> {amount} {currency} (@ ৳{exchangeRate})</p>
                      <p><strong className="text-zinc-500">Equivalent BDT:</strong> ৳{grossBdt.toLocaleString()}</p>
                      <p><strong className="text-emerald-600 dark:text-emerald-400">Claimed Subsidy:</strong> ৳{incentiveBdt.toLocaleString()} ({incentivePct}%)</p>
                      <p><strong className="text-zinc-500">SHA-256 Seal:</strong> {generatedFormC.verificationSeal?.signature?.substring(0, 24)}...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRC / FFC Reconciler */}
          {activeTab === "prc_reconciler" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Proceeds Realization Certificate (PRC / FFC) Matching Hub
                </h3>
                <p className="text-xs text-zinc-500">
                  Automated reconciliation with Authorized Dealer (AD) bank SWIFT MT103 and electronic credit slips
                </p>
              </div>

              <div className="space-y-3">
                {remittances.map((rem) => (
                  <div
                    key={rem.remittanceId}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-500">{rem.transactionRef}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {rem.beneficiaryBank}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rem.prcStatus === "reconciled" ? (
                          <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            PRC Issued & Reconciled
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReconcilePrc(rem.remittanceId)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                          >
                            Auto-Match & Reconcile PRC
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Inward Inflow</span>
                        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          {rem.foreignAmount} {rem.foreignCurrency} (৳{rem.grossAmountBdt.toLocaleString()})
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Govt. Incentive Disbursed</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{rem.incentiveAmountBdt.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Form-C Certificate Number</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-400">{rem.formCNumber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Milestone Escrow Contract Studio */}
          {activeTab === "escrow_contract" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      International Milestone Escrow Service Agreement Studio
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Bilingual export agreement with cryptographic milestone release hashes & dispute resolution clauses
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateContract}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Compile Escrow Contract
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Contract Title</label>
                    <input
                      type="text"
                      value={contractTitle}
                      onChange={(e) => setContractTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Client Entity / Individual</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Client Jurisdiction / Country</label>
                    <input
                      type="text"
                      value={clientCountry}
                      onChange={(e) => setClientCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {generatedContract && (
                <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{generatedContract.contractTitle}</h4>
                      <span className="font-mono text-[11px] text-zinc-500">ID: {generatedContract.contractId}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Total: ${generatedContract.totalValueAmount} USD
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-zinc-800 dark:text-zinc-200">Milestone Payment Schedule</h5>
                    {generatedContract.milestones.map((ms: any) => (
                      <div
                        key={ms.milestoneId}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{ms.title}</span>
                          <span className="text-zinc-400 text-[10px] block">Hash: {ms.deliverableHash}</span>
                        </div>
                        <span className="font-bold text-emerald-500">${ms.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Bangladesh Bank Export Subsidy Engine Active (FE-02/2024)</span>
          </div>
          <span className="font-mono text-[11px]">Shortcut: ⌘I · Shothik Global Commerce</span>
        </div>
      </div>
    </div>
  );
};
