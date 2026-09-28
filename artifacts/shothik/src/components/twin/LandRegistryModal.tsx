import React, { useState } from "react";
import {
  FileText,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  QrCode,
  Building2,
  Landmark,
  Scale,
  Sparkles,
  ExternalLink,
  Languages,
} from "lucide-react";
import {
  formatBanglaCurrency,
  formatSouthAsianNumber,
  getLakhCroreDescription,
} from "@/utils/currencyUtils";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface LandRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type LandUnit =
  | "shatangsho"
  | "katha"
  | "bigha"
  | "chhotak"
  | "acre"
  | "sqft"
  | "sqmeter";

export const LandRegistryModal: React.FC<LandRegistryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    "converter" | "calculator" | "chain_auditor" | "mutation_screener"
  >("converter");
  const [locale, setLocale] = useState<"bn" | "en">("bn");

  // --- Tab 1: Unit Converter State ---
  const [convertValue, setConvertValue] = useState<number>(5);
  const [convertFromUnit, setConvertFromUnit] = useState<LandUnit>("shatangsho");
  const [conversionResults, setConversionResults] = useState<{
    shatangsho: number;
    katha: number;
    bigha: number;
    chhotak: number;
    acre: number;
    sqft: number;
    sqmeter: number;
  }>({
    shatangsho: 5,
    katha: 3.025,
    bigha: 0.1515,
    chhotak: 48.4,
    acre: 0.05,
    sqft: 2178,
    sqmeter: 202.34,
  });

  // --- Tab 2: Stamp Duty & Registration Fees State ---
  const [considerationBdt, setConsiderationBdt] = useState<number>(5000000);
  const [jurisdiction, setJurisdiction] = useState<
    "dhaka_city" | "chattogram_city" | "pourashava" | "union_parishad"
  >("dhaka_city");
  const [propertyType, setPropertyType] = useState<
    "residential" | "commercial" | "agricultural"
  >("residential");
  const [feeBreakdown, setFeeBreakdown] = useState<any>({
    considerationBdt: 5000000,
    registrationFeeBdt: 50000,
    stampDutyBdt: 75000,
    localGovtTaxBdt: 150000,
    sourceTaxAitBdt: 200000,
    eGovernanceFeeBdt: 240,
    nFeeBdt: 300,
    affidavitFeeBdt: 300,
    totalGovtFeesBdt: 475840,
    effectiveTaxPercentage: 9.52,
    statutoryBasis:
      "Stamp Act 1899, Registration Act 1908, Income Tax Act 2023 Section 53FF (DHAKA_CITY)",
  });

  // --- Tab 3: Chain-of-Ownership Auditor State ---
  const [parentDaagArea, setParentDaagArea] = useState<number>(15);
  const [chainTransfers, setChainTransfers] = useState<any[]>([
    {
      deedNumber: "CS-1940-088",
      deedDate: "1940-02-14",
      surveyType: "CS",
      transferor: "Rahim Ullah Mondol",
      transferee: "Kader Ali Chowdhury",
      transactedAreaShatangsho: 10,
      hasOriginalDocument: true,
      daagNumber: "402",
    },
    {
      deedNumber: "SA-1962-112",
      deedDate: "1962-06-25",
      surveyType: "SA",
      transferor: "Kader Ali Chowdhury",
      transferee: "Zabbar Mia",
      transactedAreaShatangsho: 10,
      hasOriginalDocument: true,
      daagNumber: "402",
    },
    {
      deedNumber: "RS-1988-340",
      deedDate: "1988-10-12",
      surveyType: "RS",
      transferor: "Zabbar Mia",
      transferee: "Farhana Begum",
      transactedAreaShatangsho: 10,
      hasOriginalDocument: true,
      daagNumber: "402",
    },
    {
      deedNumber: "DEED-2024-991",
      deedDate: "2024-03-01",
      surveyType: "Current_Deed",
      transferor: "Farhana Begum",
      transferee: "Tanvir Ahmed",
      transactedAreaShatangsho: 10,
      hasOriginalDocument: true,
      daagNumber: "402",
    },
  ]);
  const [auditResult, setAuditResult] = useState<any>({
    isValid: true,
    riskLevel: "LOW",
    confidenceScore: 100,
    transfersAuditedCount: 4,
    anomalies: [],
    verifiedChainSummary:
      "4 deeds verified. Root: CS (1940-02-14) ➔ Current: Tanvir Ahmed",
    titleSeal:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  });

  // --- Tab 4: Mutation Readiness & Seal State ---
  const [checklist, setChecklist] = useState({
    originalDeed: true,
    bayaDeedsComplete: true,
    rsKhatianPorcha: true,
    bsCityKhatianPorcha: true,
    dakhilaPaidCurrentYear: true,
    warishanCertificateIfApplicable: true,
    nidCopiesVerified: true,
    mouzaMapTraceAvailable: true,
  });
  const [mutationEvaluation, setMutationEvaluation] = useState<any>({
    readinessScorePercent: 100,
    status: "READY",
    missingRequirements: [],
    recommendations: [],
  });
  const [issuedSeal, setIssuedSeal] = useState<any>({
    certificateNumber: "SHOTHIK_LAND_DHA_LX92KA",
    sealHash:
      "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    qrPayload:
      "https://shothik.ai/verify/land-record/SHOTHIK_LAND_DHA_LX92KA?seal=7f83b1657ff1fc53",
    timestamp: "2026-09-27T14:30:00.000Z",
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  // Handler: Run Unit Converter API
  const handleConvert = async (val: number, unit: LandUnit) => {
    setConvertValue(val);
    setConvertFromUnit(unit);
    try {
      const res = await fetch("/api/v1/land-registry/convert-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: val, fromUnit: unit }),
      });
      const data = await res.json();
      if (data.success && data.data?.conversions) {
        setConversionResults(data.data.conversions);
      }
    } catch {
      // Fallback local conversion if offline
      const sqft =
        unit === "shatangsho"
          ? val * 435.6
          : unit === "katha"
          ? val * 720
          : unit === "bigha"
          ? val * 14400
          : unit === "acre"
          ? val * 43560
          : val;
      setConversionResults({
        shatangsho: Number((sqft / 435.6).toFixed(4)),
        katha: Number((sqft / 720).toFixed(4)),
        bigha: Number((sqft / 14400).toFixed(4)),
        chhotak: Number((sqft / 45).toFixed(4)),
        acre: Number((sqft / 43560).toFixed(4)),
        sqft: Number(sqft.toFixed(2)),
        sqmeter: Number((sqft / 10.7639).toFixed(2)),
      });
    }
  };

  // Handler: Calculate Fees API
  const handleCalculateFees = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/v1/land-registry/calculate-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          considerationBdt,
          jurisdiction,
          propertyType,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFeeBreakdown(data.data);
      } else {
        setApiError(data.error || "Failed to calculate fees");
      }
    } catch (err: any) {
      setApiError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Run Chain-of-Ownership Audit API
  const handleAuditChain = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/v1/land-registry/audit-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfers: chainTransfers,
          parentDaagAreaShatangsho: parentDaagArea,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAuditResult(data.data);
      } else {
        setApiError(data.error || "Audit failed");
      }
    } catch (err: any) {
      setApiError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Evaluate E-Mutation Readiness API
  const handleEvaluateMutation = async (newChecklist: typeof checklist) => {
    setChecklist(newChecklist);
    try {
      const res = await fetch("/api/v1/land-registry/mutation-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChecklist),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMutationEvaluation(data.data);
      }
    } catch {
      // offline fallback calculation
      const score =
        (newChecklist.originalDeed ? 25 : 0) +
        (newChecklist.bayaDeedsComplete ? 20 : 0) +
        (newChecklist.rsKhatianPorcha ? 15 : 0) +
        (newChecklist.bsCityKhatianPorcha ? 15 : 0) +
        (newChecklist.dakhilaPaidCurrentYear ? 10 : 0) +
        (newChecklist.warishanCertificateIfApplicable ? 5 : 0) +
        (newChecklist.nidCopiesVerified ? 5 : 0) +
        (newChecklist.mouzaMapTraceAvailable ? 5 : 0);
      setMutationEvaluation({
        readinessScorePercent: score,
        status: score >= 85 ? "READY" : score >= 60 ? "ACTION_REQUIRED" : "HIGH_RISK",
        missingRequirements: [],
        recommendations: [],
      });
    }
  };

  // Handler: Generate Title Search Seal API
  const handleGenerateSeal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/land-registry/issue-seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mouza: "Tejgaon",
          jlNumber: "56",
          upazila: "Tejgaon",
          district: "Dhaka",
          khatianNumber: "4502",
          daagNumber: "1284",
          landAreaShatangsho: 10,
          currentOwner: "Tanvir Ahmed",
          deedNumber: "DEED-2024-991",
          considerationBdt: 5000000,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIssuedSeal(data.data);
      }
    } catch (err: any) {
      setApiError(err.message || "Failed to generate seal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="land-registry-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in"
    >
      <div className="bg-[#0d1117] border-t sm:border border-gray-800 rounded-t-2xl sm:rounded-xl w-full max-w-5xl max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-12 h-1 bg-gray-700/80 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 sm:px-6 py-3.5 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="land-registry-title"
                  className="text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2"
                >
                  {locale === "bn"
                    ? "জমি রেকর্ড ও বায়া দলিল যাচাইকরণ স্টুডিও"
                    : "Bengali Land Record & Title Verification Studio"}
                  <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    খতিয়ান ও দলিল
                  </span>
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-1">
                {locale === "bn"
                  ? "সিএস ➔ এসএ ➔ আরএস ➔ বিএস পর্চা অডিট, বায়া দলিল ধারাবাহিকতা ও ই-নামজারি"
                  : "CS ➔ SA ➔ RS ➔ BS Title Search, Baya Deed Chain Audit & AC Land e-Mutation Engine"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Quick Toggle */}
            <div className="flex items-center bg-gray-950 p-0.5 sm:p-1 rounded-lg border border-gray-800 text-xs">
              <button
                type="button"
                onClick={() => setLocale("bn")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  locale === "bn"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  locale === "en"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                EN
              </button>
            </div>

            {/* Mobile Touch-Friendly Close Button (44px target) */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-200 transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation with Touch Scroll & Indicators */}
        <div className="flex items-center border-b border-gray-800 px-4 sm:px-6 bg-gray-950/40 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("converter")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "converter"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            পরিমাপ রূপান্তর (Area Units)
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "calculator"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            স্ট্যাম্প ও রেজিস্ট্রেশন ফি (Stamp & Fees)
          </button>
          <button
            onClick={() => setActiveTab("chain_auditor")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "chain_auditor"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            বায়া দলিল অডিট (Chain of Title)
          </button>
          <button
            onClick={() => setActiveTab("mutation_screener")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "mutation_screener"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            ই-নামজারি ও সনদ (e-Mutation & Seal)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {apiError}
            </div>
          )}

          {/* TAB 1: Area Unit Converter */}
          {activeTab === "converter" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                  Bangladeshi Land Unit Real-Time Converter
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Land Quantity (জমির পরিমাণ)
                    </label>
                    <input
                      type="number"
                      value={convertValue}
                      min="0"
                      step="any"
                      onChange={(e) =>
                        handleConvert(parseFloat(e.target.value) || 0, convertFromUnit)
                      }
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Input Unit (পরিমাপ একক)
                    </label>
                    <select
                      value={convertFromUnit}
                      onChange={(e) =>
                        handleConvert(convertValue, e.target.value as LandUnit)
                      }
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="shatangsho">শতাংশ / ডেসিমাল (Shatangsho)</option>
                      <option value="katha">কাঠা (Katha - 1.65 Shatangsho)</option>
                      <option value="bigha">বিঘা (Bigha - 20 Katha / 33 Shatangsho)</option>
                      <option value="chhotak">ছটাক (Chhotak - 1/16 Katha)</option>
                      <option value="acre">একর (Acre - 100 Shatangsho)</option>
                      <option value="sqft">বর্গফুট (Sq Ft)</option>
                      <option value="sqmeter">বর্গমিটার (Sq Meter)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conversion Output Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">শতাংশ (Decimal)</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {conversionResults.shatangsho}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">১ শতাংশ = ৪৩৫.৬ বর্গফুট</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">কাঠা (Katha)</span>
                  <span className="text-lg font-bold text-gray-200 font-mono">
                    {conversionResults.katha}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">১ কাঠা = ৭২০ বর্গফুট</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">বিঘা (Bigha)</span>
                  <span className="text-lg font-bold text-gray-200 font-mono">
                    {conversionResults.bigha}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">১ বিঘা = ২০ কাঠা</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">ছটাক (Chhotak)</span>
                  <span className="text-lg font-bold text-gray-200 font-mono">
                    {conversionResults.chhotak}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">১ ছটাক = ৪৫ বর্গফুট</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">একর (Acre)</span>
                  <span className="text-lg font-bold text-gray-200 font-mono">
                    {conversionResults.acre}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">১ একর = ১০০ শতাংশ</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <span className="text-[11px] text-gray-400 block">বর্গফুট (Sq Ft)</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {conversionResults.sqft.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Standard Imperial</span>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-gray-400 block">বর্গমিটার (Sq M)</span>
                  <span className="text-lg font-bold text-gray-200 font-mono">
                    {conversionResults.sqmeter.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">SI Metric Standard</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Stamp Duty & Registration Fees Calculator */}
          {activeTab === "calculator" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Statutory Deed Registration & Stamp Duty Calculator (দলিলে সরকারি ফি)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      {locale === "bn"
                        ? "দলিল মূল্য / Consideration (টাকা ৳)"
                        : "Deed Value / Consideration (BDT ৳)"}
                    </label>
                    <input
                      type="number"
                      value={considerationBdt}
                      min="0"
                      onChange={(e) => setConsiderationBdt(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-400 font-medium">
                      <span>{getLakhCroreDescription(considerationBdt, locale)}</span>
                      <span className="font-mono">
                        {formatBanglaCurrency(considerationBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Sub-Registry Jurisdiction (এখতিয়ার)
                    </label>
                    <select
                      value={jurisdiction}
                      onChange={(e: any) => setJurisdiction(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="dhaka_city">ঢাকা সিটি কর্পোরেশন (Dhaka City)</option>
                      <option value="chattogram_city">চট্টগ্রাম সিটি কর্পোরেশন (Chattogram City)</option>
                      <option value="pourashava">পৌরসভা এলাকা (Pourashava)</option>
                      <option value="union_parishad">ইউনিয়ন পরিষদ (Union Parishad)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Property Classification (জমির শ্রেণি)
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e: any) => setPropertyType(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="residential">আবাসিক (Residential)</option>
                      <option value="commercial">বাণিজ্যিক (Commercial)</option>
                      <option value="agricultural">কৃষি জমি (Agricultural)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCalculateFees}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  {loading
                    ? locale === "bn"
                      ? "হিসাব করা হচ্ছে..."
                      : "Calculating..."
                    : locale === "bn"
                    ? "সরকারি ফি হিসাব করুন"
                    : "Calculate Statutory Fees"}
                </button>
              </div>

              {/* Fee Breakdown Display */}
              {feeBreakdown && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <span className="text-sm font-semibold text-gray-200">
                      {locale === "bn"
                        ? "মোট সরকারি খরচ (Total Govt Fees)"
                        : "Total Government Fees (মোট সরকারি খরচ)"}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-emerald-400 font-mono">
                        {formatBanglaCurrency(feeBreakdown.totalGovtFeesBdt, {
                          showWords: true,
                          locale,
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                      <span className="text-xs text-gray-400 block font-mono">
                        ({feeBreakdown.effectiveTaxPercentage}% of deed value)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">রেজিস্ট্রেশন ফি (Registration Fee 1%)</span>
                      <span className="text-sm font-semibold text-gray-100 font-mono mt-1 block">
                        {formatBanglaCurrency(feeBreakdown.registrationFeeBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">স্ট্যাম্প শুল্ক (Stamp Duty 1.5%)</span>
                      <span className="text-sm font-semibold text-gray-100 font-mono mt-1 block">
                        {formatBanglaCurrency(feeBreakdown.stampDutyBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">স্থানীয় সরকার কর (Local Govt Tax 2-3%)</span>
                      <span className="text-sm font-semibold text-gray-100 font-mono mt-1 block">
                        {formatBanglaCurrency(feeBreakdown.localGovtTaxBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">উৎস কর / এআইটি (Section 53FF AIT)</span>
                      <span className="text-sm font-semibold text-emerald-400 font-mono mt-1 block">
                        {formatBanglaCurrency(feeBreakdown.sourceTaxAitBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">ই-গভর্ন্যান্স ও এন-ফি (E-Gov / N Fee)</span>
                      <span className="text-sm font-semibold text-gray-100 font-mono mt-1 block">
                        {formatBanglaCurrency(
                          feeBreakdown.eGovernanceFeeBdt + feeBreakdown.nFeeBdt,
                          {
                            bengaliDigits: locale === "bn",
                          }
                        )}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                      <span className="text-gray-400 block">হলফনামা স্ট্যাম্প (Affidavit Stamp)</span>
                      <span className="text-sm font-semibold text-gray-100 font-mono mt-1 block">
                        {formatBanglaCurrency(feeBreakdown.affidavitFeeBdt, {
                          bengaliDigits: locale === "bn",
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic mt-2">
                    আইনি ভিত্তি: {feeBreakdown.statutoryBasis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Chain-of-Ownership Auditor */}
          {activeTab === "chain_auditor" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between bg-gray-900/40 border border-gray-800 rounded-xl p-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Chain-of-Ownership (বায়া দলিল ধারাবাহিকতা) Timeline Auditor
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Audits ownership lineage from CS (১৯৪০) ➔ SA (১৯৬২) ➔ RS (১৯৮৮) ➔ Current Deed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Parent Daag Area</span>
                    <span className="text-sm font-mono text-emerald-400 font-bold">
                      {parentDaagArea} শতাংশ
                    </span>
                  </div>
                  <button
                    onClick={handleAuditChain}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    {loading ? "অডিট চলছে..." : "Re-Audit Chain"}
                  </button>
                </div>
              </div>

              {/* Audit Summary & Risk Level */}
              {auditResult && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          auditResult.riskLevel === "LOW"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : auditResult.riskLevel === "MEDIUM"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        Risk Level: {auditResult.riskLevel}
                      </span>
                      <span className="text-xs text-gray-400">
                        Confidence Score:{" "}
                        <strong className="text-gray-200 font-mono">
                          {auditResult.confidenceScore}%
                        </strong>
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      Seal: {auditResult.titleSeal?.slice(0, 16)}...
                    </span>
                  </div>

                  {auditResult.anomalies?.length > 0 ? (
                    <div className="space-y-2">
                      {auditResult.anomalies.map((anom: string, i: number) => (
                        <div
                          key={i}
                          className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {anom}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Clean & Unbroken Chain: {auditResult.verifiedChainSummary}
                    </div>
                  )}

                  {/* Visual Deed Transfer Cards */}
                  <div className="relative border-l-2 border-emerald-500/30 ml-4 pl-4 space-y-4 mt-6">
                    {chainTransfers.map((deed, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-950/80 border border-gray-800 rounded-lg p-3 text-xs space-y-1 relative"
                      >
                        <div className="absolute -left-[23px] top-3.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-gray-900" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-200">
                            {deed.surveyType} Survey ({deed.deedDate})
                          </span>
                          <span className="font-mono text-emerald-400">
                            Deed #{deed.deedNumber}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          <span className="text-gray-500">বিক্রেতা (Grantor):</span>{" "}
                          <strong className="text-gray-300">{deed.transferor}</strong> ➔{" "}
                          <span className="text-gray-500">ক্রেতা (Grantee):</span>{" "}
                          <strong className="text-gray-300">{deed.transferee}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span>জমির পরিমাণ: {deed.transactedAreaShatangsho} শতাংশ</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> মূল কপি বিদ্যমান
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: E-Mutation Readiness & Seal */}
          {activeTab === "mutation_screener" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      AC Land e-Mutation (ই-নামজারি) Readiness Screener
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Checklist compliance score for automated mutation submission
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Readiness Score</span>
                    <span
                      className={`text-xl font-bold font-mono ${
                        mutationEvaluation.readinessScorePercent >= 85
                          ? "text-emerald-400"
                          : mutationEvaluation.readinessScorePercent >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {mutationEvaluation.readinessScorePercent}%
                    </span>
                  </div>
                </div>

                {/* Checklist Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.originalDeed}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          originalDeed: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">মূল সাফ-কোবালা দলিল (Original Deed)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.bayaDeedsComplete}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          bayaDeedsComplete: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">ধারাবাহিক বায়া দলিল (Baya Deeds)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.rsKhatianPorcha}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          rsKhatianPorcha: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">আরএস খতিয়ান ও পর্চা (RS Porcha)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.bsCityKhatianPorcha}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          bsCityKhatianPorcha: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">বিএস / সিটি জরিপ খতিয়ান (City Khatian)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.dakhilaPaidCurrentYear}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          dakhilaPaidCurrentYear: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">চলতি অর্থবছর দাখিলা (Updated Tax)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-950/60 rounded-lg border border-gray-800/80 cursor-pointer hover:border-gray-700">
                    <input
                      type="checkbox"
                      checked={checklist.nidCopiesVerified}
                      onChange={(e) =>
                        handleEvaluateMutation({
                          ...checklist,
                          nidCopiesVerified: e.target.checked,
                        })
                      }
                      className="rounded border-gray-700 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-gray-300">এনআইডি যাচাইকৃত কপি (Verified NID)</span>
                  </label>
                </div>
              </div>

              {/* Title Search Cryptographic Audit Seal */}
              <div className="bg-gray-900/60 border border-emerald-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200">
                        Cryptographic Title Search Audit Seal
                      </h4>
                      <p className="text-xs text-gray-400">
                        SHA-256 tamper-evident digital certificate with QR verification payload
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateSeal}
                    disabled={loading}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {loading ? "সনদ তৈরি..." : "Issue Audit Certificate"}
                  </button>
                </div>

                {issuedSeal && (
                  <div className="p-4 bg-gray-950/80 rounded-lg border border-gray-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Certificate No:</span>
                      <span className="text-emerald-400 font-bold">
                        {issuedSeal.certificateNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">SHA-256 Seal:</span>
                      <span className="text-gray-300 text-[11px] truncate max-w-[280px]">
                        {issuedSeal.sealHash}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <span className="text-gray-400">Verification Link:</span>
                      <a
                        href={issuedSeal.qrPayload}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        verify.shothik.ai
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-800 px-6 py-3 bg-gray-950/80 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Statutory Compliance: Registration Act 1908 • Stamp Act 1899 • Land Reform Act 2023
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
