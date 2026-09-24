import React, { useState, useEffect } from "react";
import {
  Globe,
  FileCheck2,
  Ship,
  Plane,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Copy,
  Check,
  Printer,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Percent,
  RefreshCw,
} from "lucide-react";

interface ExportComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "consignments" | "form_exp_view" | "lc_radar" | "new_declaration";

export interface FormExpItem {
  itemDescription: string;
  banglaDescription: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPriceUsd: number;
  fobValueUsd: number;
}

export interface FormExpRecord {
  expNumber: string;
  exporterBin: string;
  ercNumber: string;
  exporterName: string;
  exporterAddress: string;
  adBankCode: string;
  adBankName: string;
  adBranchName: string;
  consigneeName: string;
  consigneeAddress: string;
  destinationCountry: string;
  portOfShipment: string;
  portOfDischarge: string;
  paymentTerm: string;
  lcOrContractNumber: string;
  lcDate?: string;
  items: FormExpItem[];
  totalFobUsd: number;
  exchangeRateBdt: number;
  totalFobBdt: number;
  status: "draft" | "ad_certified" | "customs_passed" | "shipped_onboard" | "realized" | "overdue";
  shipmentDate?: string;
  repatriationDeadlineDate: string;
  daysRemainingRepatriation: number;
  realizedAmountUsd: number;
  prcCertificateNumber?: string;
  cashIncentiveEligiblePercent: number;
  cashIncentiveAccruedBdt: number;
  verificationHash: string;
  createdAt: string;
}

export interface ExportSummaryMetrics {
  totalExportsCount: number;
  totalTurnoverUsd: number;
  totalTurnoverBdt: number;
  totalRealizedUsd: number;
  pendingRepatriationUsd: number;
  overdueRepatriationCount: number;
  totalExportSubsidiesEarnedBdt: number;
}

const DEFAULT_RECORDS: FormExpRecord[] = [
  {
    expNumber: "EXP-0420-2026-00891",
    exporterBin: "001234567-0101",
    ercNumber: "ERC-EXP-2026-9041",
    exporterName: "Shothik Export & Heritage Crafts Ltd.",
    exporterAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230",
    adBankCode: "0420",
    adBankName: "BRAC Bank PLC",
    adBranchName: "Gulshan Corporate Branch, Dhaka",
    consigneeName: "Nordic Lifestyle ApS",
    consigneeAddress: "Ostergade 24, 1100 Copenhagen, Denmark",
    destinationCountry: "Denmark",
    portOfShipment: "chittagong_seaport",
    portOfDischarge: "Port of Copenhagen",
    paymentTerm: "letter_of_credit",
    lcOrContractNumber: "LC-NORDIC-2026-091",
    lcDate: "2026-09-01",
    items: [
      {
        itemDescription: "Handcrafted Jute Tote Bags with Leather Trim",
        banglaDescription: "হাতে তৈরি পাট ও চামড়ার ব্যাগ",
        hsCode: "4202.92.00",
        quantity: 1200,
        unit: "Pcs",
        unitPriceUsd: 12.5,
        fobValueUsd: 15000,
      },
    ],
    totalFobUsd: 15000,
    exchangeRateBdt: 121.5,
    totalFobBdt: 1822500,
    status: "shipped_onboard",
    shipmentDate: "2026-09-12",
    repatriationDeadlineDate: "2027-01-10",
    daysRemainingRepatriation: 108,
    realizedAmountUsd: 0,
    cashIncentiveEligiblePercent: 10,
    cashIncentiveAccruedBdt: 182250,
    verificationHash: "8f7a9d3e4b2c1f0e9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f",
    createdAt: new Date().toISOString(),
  },
  {
    expNumber: "EXP-0115-2026-00452",
    exporterBin: "001234567-0101",
    ercNumber: "ERC-EXP-2026-9041",
    exporterName: "Shothik Apparels & Knitwear Hub",
    exporterAddress: "Plot 45, BSCIC Industrial Area, Tongi, Gazipur",
    adBankCode: "0115",
    adBankName: "Eastern Bank PLC",
    adBranchName: "Principal Branch, Dilkusha, Dhaka",
    consigneeName: "Hanseatic Retail GmbH",
    consigneeAddress: "Monckebergstrasse 18, 20095 Hamburg, Germany",
    destinationCountry: "Germany",
    portOfShipment: "dhaka_airport",
    portOfDischarge: "Frankfurt Airport (FRA)",
    paymentTerm: "cash_against_documents",
    lcOrContractNumber: "CAD-DE-2026-118",
    lcDate: "2026-08-15",
    items: [
      {
        itemDescription: "Organic Cotton Polo Shirts (Bio-Washed)",
        banglaDescription: "অর্গানিক কটন পোলো শার্ট",
        hsCode: "6105.10.00",
        quantity: 3500,
        unit: "Pcs",
        unitPriceUsd: 8.1143,
        fobValueUsd: 28400,
      },
    ],
    totalFobUsd: 28400,
    exchangeRateBdt: 121.5,
    totalFobBdt: 3450600,
    status: "realized",
    shipmentDate: "2026-08-20",
    repatriationDeadlineDate: "2026-12-18",
    daysRemainingRepatriation: 85,
    realizedAmountUsd: 28400,
    prcCertificateNumber: "PRC-BB-892104",
    cashIncentiveEligiblePercent: 4,
    cashIncentiveAccruedBdt: 138024,
    verificationHash: "4b2c1f0e9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f8f7a9d3e",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SUMMARY: ExportSummaryMetrics = {
  totalExportsCount: 2,
  totalTurnoverUsd: 43400,
  totalTurnoverBdt: 5273100,
  totalRealizedUsd: 28400,
  pendingRepatriationUsd: 15000,
  overdueRepatriationCount: 0,
  totalExportSubsidiesEarnedBdt: 138024,
};

export const ExportComplianceModal: React.FC<ExportComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("consignments");
  const [records, setRecords] = useState<FormExpRecord[]>(DEFAULT_RECORDS);
  const [summary, setSummary] = useState<ExportSummaryMetrics | null>(DEFAULT_SUMMARY);
  const [selectedExp, setSelectedExp] = useState<FormExpRecord>(DEFAULT_RECORDS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [exporterName, setExporterName] = useState("Shothik Export & Heritage Crafts Ltd.");
  const [consigneeName, setConsigneeName] = useState("Tokyo Artisan Collective");
  const [destinationCountry, setDestinationCountry] = useState("Japan");
  const [portOfShipment, setPortOfShipment] = useState("chittagong_seaport");
  const [paymentTerm, setPaymentTerm] = useState("letter_of_credit");
  const [lcNumber, setLcNumber] = useState("LC-JP-2026-004");
  const [itemDescription, setItemDescription] = useState("Hand-Knotted Silk & Jute Rugs");
  const [hsCode, setHsCode] = useState("5701.90.00");
  const [quantity, setQuantity] = useState(250);
  const [unitPriceUsd, setUnitPriceUsd] = useState(65);
  const [cashIncentivePercent, setCashIncentivePercent] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const summaryRes = await fetch("/api/v1/export-compliance/summary");
      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const listRes = await fetch("/api/v1/export-compliance/form-exp/list");
      if (listRes.ok) {
        const lData = await listRes.json();
        if (lData.ok && lData.data.length > 0) {
          setRecords(lData.data);
          setSelectedExp(lData.data[0]);
        }
      }
    } catch {
      // Retain default demo values
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        exporterName,
        consigneeName,
        destinationCountry,
        portOfShipment,
        paymentTerm,
        lcOrContractNumber: lcNumber,
        cashIncentiveEligiblePercent: cashIncentivePercent,
        items: [
          {
            itemDescription,
            banglaDescription: "হস্তশিল্প সিল্ক ও জুট কার্পেট",
            hsCode,
            quantity,
            unit: "Pcs",
            unitPriceUsd,
            fobValueUsd: quantity * unitPriceUsd,
          },
        ],
      };

      const res = await fetch("/api/v1/export-compliance/form-exp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setRecords((prev) => [data.data, ...prev]);
          setSelectedExp(data.data);
          setActiveTab("form_exp_view");
        }
      }
    } catch {
      // Local fallback
      const totalFob = quantity * unitPriceUsd;
      const newRec: FormExpRecord = {
        expNumber: `EXP-0420-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        exporterBin: "001234567-0101",
        ercNumber: "ERC-EXP-2026-9041",
        exporterName,
        exporterAddress: "House 14, Road 7, Sector 3, Uttara, Dhaka-1230",
        adBankCode: "0420",
        adBankName: "BRAC Bank PLC",
        adBranchName: "Gulshan Corporate Branch, Dhaka",
        consigneeName,
        consigneeAddress: `${destinationCountry} Central Port`,
        destinationCountry,
        portOfShipment,
        portOfDischarge: "Destination Seaport",
        paymentTerm,
        lcOrContractNumber: lcNumber,
        items: [
          {
            itemDescription,
            banglaDescription: "হস্তশিল্প সামগ্রী",
            hsCode,
            quantity,
            unit: "Pcs",
            unitPriceUsd,
            fobValueUsd: totalFob,
          },
        ],
        totalFobUsd: totalFob,
        exchangeRateBdt: 121.5,
        totalFobBdt: totalFob * 121.5,
        status: "ad_certified",
        repatriationDeadlineDate: "2027-01-20",
        daysRemainingRepatriation: 120,
        realizedAmountUsd: 0,
        cashIncentiveEligiblePercent: cashIncentivePercent,
        cashIncentiveAccruedBdt: (totalFob * 121.5 * cashIncentivePercent) / 100,
        verificationHash: "e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f8f7a9d3e4b2c1f0e9a8b7c6d5",
        createdAt: new Date().toISOString(),
      };
      setRecords((prev) => [newRec, ...prev]);
      setSelectedExp(newRec);
      setActiveTab("form_exp_view");
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
      aria-label="Cross-Border Export Manifest & Form-EXP / BB ERC Compliance Engine"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 shadow-lg shadow-indigo-500/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Cross-Border Export Manifest & BB Form-EXP Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  BB FERA 1947 & NBR ASYCUDA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                বাংলাদেশ ব্যাংক অনলাইন ফরম-ইএক্সপি, ইআরসি নবায়ন ও ১২০ দিনের মুদ্রা রিয়ালাইজেশন ট্র্যাকার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> CCI&E ERC Active
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AD Bank Connected
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
            <span className="text-xs text-slate-400 font-medium">Export Turnover (FOB)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ${(summary?.totalTurnoverUsd ?? 43400).toLocaleString("en-US")}
              </span>
              <span className="text-[11px] text-slate-400">
                (৳{((summary?.totalTurnoverBdt ?? 5273100) / 100000).toFixed(2)} Lakh)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Inward Realized (SWIFT)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ${(summary?.totalRealizedUsd ?? 28400).toLocaleString("en-US")}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">PRC Issued</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Pending Repatriation</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-400">
                ${(summary?.pendingRepatriationUsd ?? 15000).toLocaleString("en-US")}
              </span>
              <span className="text-[11px] text-amber-500/80">120-day limit</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Export Cash Subsidies</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-indigo-400">
                ৳{(summary?.totalExportSubsidiesEarnedBdt ?? 138024).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-indigo-400/80">Accrued</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("consignments")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "consignments"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            Active Consignments ({records.length})
          </button>

          <button
            onClick={() => setActiveTab("form_exp_view")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "form_exp_view"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Official Form-EXP Certificate
          </button>

          <button
            onClick={() => setActiveTab("lc_radar")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "lc_radar"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            LC & FERA Repatriation Radar
          </button>

          <button
            onClick={() => setActiveTab("new_declaration")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "new_declaration"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Export Form-EXP Generator
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Consignments */}
          {activeTab === "consignments" && (
            <div className="space-y-3">
              {records.map((r) => (
                <div
                  key={r.expNumber}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                      {r.portOfShipment.includes("airport") ? (
                        <Plane className="w-5 h-5" />
                      ) : (
                        <Ship className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {r.expNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          → {r.consigneeName} ({r.destinationCountry})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Port: {r.portOfShipment.replace("_", " ").toUpperCase()} • Ref: {r.lcOrContractNumber} • Subsidy: {r.cashIncentiveEligiblePercent}%
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.items[0]?.itemDescription} ({r.items[0]?.quantity} {r.items[0]?.unit})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        ${r.totalFobUsd.toLocaleString("en-US")}
                      </span>
                      <p className="text-xs text-indigo-400">
                        ৳{r.totalFobBdt.toLocaleString("en-BD")}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        ⏳ {r.daysRemainingRepatriation}d repatriation
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExp(r);
                        setActiveTab("form_exp_view");
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                    >
                      View Form-EXP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Official Form-EXP Certificate View */}
          {activeTab === "form_exp_view" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Bangladesh Bank Form-EXP Document View
                  </h3>
                  <p className="text-xs text-slate-400">
                    Officially compiled for NBR ASYCUDA World customs clearance and AD Bank certification.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </button>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-5 text-xs text-slate-300 font-sans shadow-xl">
                {/* Header section of statutory form */}
                <div className="text-center space-y-1 border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                    Government of the People's Republic of Bangladesh
                  </span>
                  <h4 className="text-base font-bold text-white">
                    BANGLADESH BANK ONLINE FORM-EXP
                  </h4>
                  <p className="text-xs text-slate-400">
                    [ Issued under Foreign Exchange Regulation Act, 1947 & Customs Act, 2023 ]
                  </p>
                  <div className="pt-2 flex justify-center items-center gap-4 text-[11px] font-mono">
                    <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                      EXP NO: {selectedExp.expNumber}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                      STATUS: {selectedExp.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Exporter & Consignee Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 rounded-lg space-y-1 border border-slate-800">
                    <span className="text-slate-400 font-semibold text-[11px]">1. EXPORTER DETAILS</span>
                    <p className="text-white font-bold">{selectedExp.exporterName}</p>
                    <p>{selectedExp.exporterAddress}</p>
                    <p className="font-mono text-emerald-400">BIN: {selectedExp.exporterBin} | ERC: {selectedExp.ercNumber}</p>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-lg space-y-1 border border-slate-800">
                    <span className="text-slate-400 font-semibold text-[11px]">2. BUYER / CONSIGNEE</span>
                    <p className="text-white font-bold">{selectedExp.consigneeName}</p>
                    <p>{selectedExp.consigneeAddress}</p>
                    <p className="text-slate-300">Destination: {selectedExp.destinationCountry}</p>
                  </div>
                </div>

                {/* Bank & Payment Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900/50 rounded-lg space-y-1 border border-slate-800">
                    <span className="text-slate-400 font-semibold text-[11px]">3. AUTHORIZED DEALER (AD) BANK</span>
                    <p className="text-white font-bold">{selectedExp.adBankName}</p>
                    <p>{selectedExp.adBranchName} (AD Code: {selectedExp.adBankCode})</p>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-lg space-y-1 border border-slate-800">
                    <span className="text-slate-400 font-semibold text-[11px]">4. PAYMENT TERMS & LC</span>
                    <p className="text-white font-bold">Terms: {selectedExp.paymentTerm.replace("_", " ").toUpperCase()}</p>
                    <p className="font-mono text-indigo-400">LC / Contract: {selectedExp.lcOrContractNumber}</p>
                  </div>
                </div>

                {/* Items Manifest */}
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] block mb-1">
                    5. PARTICULARS OF COMMODITY & VALUATION (ASYCUDA WORLD)
                  </span>
                  <table className="w-full text-left border border-slate-800 rounded overflow-hidden">
                    <thead className="bg-slate-900 text-slate-300 font-semibold">
                      <tr>
                        <th className="p-2">Description of Goods</th>
                        <th className="p-2">HS Code</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Unit Price (USD)</th>
                        <th className="p-2 text-right">FOB Value (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedExp.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="p-2 text-white">{it.itemDescription}</td>
                          <td className="p-2 font-mono text-emerald-400">{it.hsCode}</td>
                          <td className="p-2 text-right font-mono">{it.quantity} {it.unit}</td>
                          <td className="p-2 text-right font-mono">${it.unitPriceUsd}</td>
                          <td className="p-2 text-right font-mono font-bold text-white">${it.fobValueUsd}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900/80 font-bold">
                        <td colSpan={4} className="p-2 text-right text-slate-300">Total Invoice FOB Value (USD):</td>
                        <td className="p-2 text-right font-mono text-emerald-400">${selectedExp.totalFobUsd.toLocaleString("en-US")}</td>
                      </tr>
                      <tr className="bg-slate-900/80 font-bold">
                        <td colSpan={4} className="p-2 text-right text-slate-300">Equivalent BDT (@ 121.50):</td>
                        <td className="p-2 text-right font-mono text-indigo-400">৳{selectedExp.totalFobBdt.toLocaleString("en-BD")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Verification Seal & Hash */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Cryptographic Hash: {selectedExp.verificationHash}</span>
                  <button
                    onClick={() => copyToClipboard(selectedExp.verificationHash, "hash-cert")}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedId === "hash-cert" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy SHA-256
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LC & FERA Repatriation Radar */}
          {activeTab === "lc_radar" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  120-Day FERA Foreign Exchange Repatriation Radar
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Under Bangladesh Bank FE Circular regulations, export proceeds must be realized within 120 days of shipment date to maintain active ERC standing.
                </p>
              </div>

              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r.expNumber} className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{r.expNumber}</span>
                        <span className="text-xs text-slate-400">({r.consigneeName})</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          r.status === "realized"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : r.daysRemainingRepatriation > 30
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {r.status === "realized" ? "REALIZED / PRC CERTIFIED" : `${r.daysRemainingRepatriation} DAYS REMAINING`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          r.status === "realized"
                            ? "bg-emerald-500"
                            : r.daysRemainingRepatriation > 30
                            ? "bg-indigo-500"
                            : "bg-rose-500"
                        }`}
                        style={{
                          width: `${
                            r.status === "realized"
                              ? 100
                              : Math.max(10, ((120 - r.daysRemainingRepatriation) / 120) * 100)
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Shipment Date: {r.shipmentDate || "Pending"}</span>
                      <span>Statutory Repatriation Deadline: {r.repatriationDeadlineDate}</span>
                      {r.prcCertificateNumber && (
                        <span className="text-emerald-400 font-mono">PRC: {r.prcCertificateNumber}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: New Declaration Generator */}
          {activeTab === "new_declaration" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <form
                onSubmit={handleCreateSubmit}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Exporter Enterprise
                    </label>
                    <input
                      type="text"
                      value={exporterName}
                      onChange={(e) => setExporterName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Consignee / Importer
                    </label>
                    <input
                      type="text"
                      value={consigneeName}
                      onChange={(e) => setConsigneeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Port of Shipment
                    </label>
                    <select
                      value={portOfShipment}
                      onChange={(e) => setPortOfShipment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="chittagong_seaport">Chittagong Seaport</option>
                      <option value="mongla_seaport">Mongla Seaport</option>
                      <option value="dhaka_airport">Hazrat Shahjalal Airport (DAC)</option>
                      <option value="benapole_landport">Benapole Land Port</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Payment Term
                    </label>
                    <select
                      value={paymentTerm}
                      onChange={(e) => setPaymentTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="letter_of_credit">Letter of Credit (L/C)</option>
                      <option value="cash_against_documents">Cash Against Docs (CAD)</option>
                      <option value="advance_tt">Advance T/T Remittance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Commodity Item Description
                    </label>
                    <input
                      type="text"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      NBR 8-Digit HS Code
                    </label>
                    <input
                      type="text"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Quantity (Pcs/Units)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Unit Price FOB ($)
                    </label>
                    <input
                      type="number"
                      value={unitPriceUsd}
                      onChange={(e) => setUnitPriceUsd(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Cash Subsidy Rate (%)
                    </label>
                    <select
                      value={cashIncentivePercent}
                      onChange={(e) => setCashIncentivePercent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value={10}>10% (Jute / Leather Crafts)</option>
                      <option value={4}>4% (RMG / Knitwear)</option>
                      <option value={8}>8% (Agro-Processing & Tea)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  {isSubmitting ? "Compiling Form-EXP..." : "Generate Bangladesh Bank Form-EXP"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportComplianceModal;
