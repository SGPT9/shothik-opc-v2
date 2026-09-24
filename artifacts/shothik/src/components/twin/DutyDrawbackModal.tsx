import React, { useState, useEffect } from "react";
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
  Truck,
  Ship,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export interface DutyDrawbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ClaimMode = "dedo_flat_rate" | "actual_costing_bom";
export type CustomsStation = "chittagong_port" | "dhaka_airport_icd" | "benapole_land_port" | "mongla_port" | "panchagarh_banglabandha";
export type DrawbackStatus = "draft" | "submitted" | "under_dedo_audit" | "sanctioned" | "disbursed";

export interface ImportedInputItem {
  rawMaterialName: string;
  hsCode: string;
  importBeNumber: string;
  beDate: string;
  customsStation: CustomsStation;
  quantityKgOrUnits: number;
  assessableValueBdt: number;
  customsDutyRatePercent: number;
  regulatoryDutyRatePercent: number;
  supplementaryDutyRatePercent: number;
  importVatRatePercent: number;
  paidDutiesBdt: {
    cd: number;
    rd: number;
    sd: number;
    vat: number;
    total: number;
  };
  consumptionPerExportUnitKg: number;
}

export interface ExportProductItem {
  productName: string;
  exportHsCode: string;
  exportQuantityUnits: number;
  fobValueUsd: number;
  fobValueBdt: number;
  billOfExportNumber: string;
  billOfExportDate: string;
  formExpNumber: string;
  repatriationStatus: "repatriated" | "pending_120_days" | "escrowed";
  statutoryFlatRatePercent?: number;
}

export interface DrawbackClaimRecord {
  id: string;
  claimNumber: string;
  exporterName: string;
  exporterBin: string;
  exporterErc: string;
  claimMode: ClaimMode;
  exportProduct: ExportProductItem;
  importedInputs: ImportedInputItem[];
  fobExportValueBdt: number;
  totalClaimableDrawbackBdt: number;
  drawbackBreakdown: {
    customsDutyRefundBdt: number;
    regulatoryDutyRefundBdt: number;
    supplementaryDutyRefundBdt: number;
    vatRefundBdt: number;
  };
  customsActReference: string;
  dedoFilingForm: "DEDO_FORM_A_FLAT" | "DEDO_FORM_B_ACTUAL";
  status: DrawbackStatus;
  sanctionOrderNumber?: string;
  sanctionedAmountBdt?: number;
  disbursementBank?: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DrawbackSummaryMetrics {
  totalClaimsCount: number;
  sanctionedClaimsCount: number;
  totalClaimedValueBdt: number;
  totalDisbursedDrawbackBdt: number;
  avgTurnaroundDays: number;
  pendingAuditBdt: number;
}

type TabType = "claims" | "draft" | "reconcile" | "schedule";

const DEFAULT_METRICS: DrawbackSummaryMetrics = {
  totalClaimsCount: 4,
  sanctionedClaimsCount: 3,
  totalClaimedValueBdt: 1845000,
  totalDisbursedDrawbackBdt: 1452600,
  avgTurnaroundDays: 24,
  pendingAuditBdt: 392400,
};

const INITIAL_CLAIMS: DrawbackClaimRecord[] = [
  {
    id: "DRW-2026-001",
    claimNumber: "NBR-DEDO-2026-88192",
    exporterName: "Bengal Apparels & Knitwear Ltd.",
    exporterBin: "0019283746192",
    exporterErc: "ERC-EXP-992144",
    claimMode: "dedo_flat_rate",
    exportProduct: {
      productName: "100% Cotton Knitted T-Shirts (10,000 Pcs)",
      exportHsCode: "6109.10.00",
      exportQuantityUnits: 10000,
      fobValueUsd: 45000,
      fobValueBdt: 5400000,
      billOfExportNumber: "EXP-CTG-2026-44120",
      billOfExportDate: "2026-07-15",
      formExpNumber: "EXP-BB-2026-091823",
      repatriationStatus: "repatriated",
      statutoryFlatRatePercent: 4.5,
    },
    importedInputs: [
      {
        rawMaterialName: "Combed Cotton Yarn (Ne 30/1)",
        hsCode: "5205.12.00",
        importBeNumber: "C-1984210",
        beDate: "2026-05-10",
        customsStation: "chittagong_port",
        quantityKgOrUnits: 3200,
        assessableValueBdt: 1800000,
        customsDutyRatePercent: 15,
        regulatoryDutyRatePercent: 3,
        supplementaryDutyRatePercent: 0,
        importVatRatePercent: 15,
        paidDutiesBdt: {
          cd: 270000,
          rd: 54000,
          sd: 0,
          vat: 270000,
          total: 594000,
        },
        consumptionPerExportUnitKg: 0.32,
      },
    ],
    fobExportValueBdt: 5400000,
    totalClaimableDrawbackBdt: 243000,
    drawbackBreakdown: {
      customsDutyRefundBdt: 145800,
      regulatoryDutyRefundBdt: 24300,
      supplementaryDutyRefundBdt: 36450,
      vatRefundBdt: 36450,
    },
    customsActReference: "Section 33, Customs Act 2023 (DEDO SRO No. 142-Law/2024)",
    dedoFilingForm: "DEDO_FORM_A_FLAT",
    status: "sanctioned",
    sanctionOrderNumber: "DEDO/SANCTION/2026/0881",
    sanctionedAmountBdt: 243000,
    disbursementBank: "Eastern Bank PLC (Principal Branch)",
    digitalSealHash: "a18ef902bca48109d98fa12309e45bc0914a821eef00192837bc991a28841021",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-08-05T14:30:00.000Z",
  },
  {
    id: "DRW-2026-002",
    claimNumber: "NBR-DEDO-2026-91440",
    exporterName: "Apex Leather & Footwear Ltd.",
    exporterBin: "0028193847102",
    exporterErc: "ERC-EXP-881290",
    claimMode: "actual_costing_bom",
    exportProduct: {
      productName: "Finished Leather Dress Shoes (2,500 Pairs)",
      exportHsCode: "6403.51.00",
      exportQuantityUnits: 2500,
      fobValueUsd: 75000,
      fobValueBdt: 9000000,
      billOfExportNumber: "EXP-DAC-2026-88192",
      billOfExportDate: "2026-08-01",
      formExpNumber: "EXP-BB-2026-102934",
      repatriationStatus: "repatriated",
    },
    importedInputs: [
      {
        rawMaterialName: "Synthetic Polyurethane Lining Material",
        hsCode: "3921.13.00",
        importBeNumber: "C-2049182",
        beDate: "2026-06-12",
        customsStation: "dhaka_airport_icd",
        quantityKgOrUnits: 1500,
        assessableValueBdt: 2400000,
        customsDutyRatePercent: 25,
        regulatoryDutyRatePercent: 3,
        supplementaryDutyRatePercent: 20,
        importVatRatePercent: 15,
        paidDutiesBdt: {
          cd: 600000,
          rd: 72000,
          sd: 480000,
          vat: 360000,
          total: 1512000,
        },
        consumptionPerExportUnitKg: 0.60,
      },
    ],
    fobExportValueBdt: 9000000,
    totalClaimableDrawbackBdt: 1209600,
    drawbackBreakdown: {
      customsDutyRefundBdt: 480000,
      regulatoryDutyRefundBdt: 57600,
      supplementaryDutyRefundBdt: 384000,
      vatRefundBdt: 288000,
    },
    customsActReference: "Section 34, Customs Act 2023 (Actual Costing Coefficient Mushak-4.3)",
    dedoFilingForm: "DEDO_FORM_B_ACTUAL",
    status: "under_dedo_audit",
    digitalSealHash: "c4b189fa0912bc85012fa8901ebcf881023a9d8213bc541a18ef902bca48109d",
    createdAt: "2026-08-10T11:00:00.000Z",
    updatedAt: "2026-08-15T09:00:00.000Z",
  },
];

export const DutyDrawbackModal: React.FC<DutyDrawbackModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("claims");
  const [claims, setClaims] = useState<DrawbackClaimRecord[]>(INITIAL_CLAIMS);
  const [metrics, setMetrics] = useState<DrawbackSummaryMetrics>(DEFAULT_METRICS);
  const [selectedClaim, setSelectedClaim] = useState<DrawbackClaimRecord | null>(INITIAL_CLAIMS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Claim
  const [claimMode, setClaimMode] = useState<ClaimMode>("dedo_flat_rate");
  const [exporterName, setExporterName] = useState("Bengal Global Exports Ltd.");
  const [exporterBin, setExporterBin] = useState("0019283746192");
  const [exporterErc, setExporterErc] = useState("ERC-EXP-2026-8819");
  const [productName, setProductName] = useState("Woven Denim Jeans (5,000 Pcs)");
  const [exportHsCode, setExportHsCode] = useState("6203.42.00");
  const [fobValueUsd, setFobValueUsd] = useState<number>(35000);
  const [fobValueBdt, setFobValueBdt] = useState<number>(4200000);
  const [flatRatePercent, setFlatRatePercent] = useState<number>(4.5);
  const [billOfExportNo, setBillOfExportNo] = useState("EXP-CTG-2026-55102");
  const [formExpNo, setFormExpNo] = useState("EXP-BB-2026-881920");

  // Reconciler Form State
  const [testImportBe, setTestImportBe] = useState("C-1984210");
  const [testExportBe, setTestExportBe] = useState("EXP-CTG-2026-44120");
  const [testFormExp, setTestFormExp] = useState("EXP-BB-2026-091823");
  const [reconcileResult, setReconcileResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `DRW-2026-00${claims.length + 1}`;
    const claimNumber = `NBR-DEDO-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const totalDrawback = Math.round((fobValueBdt * flatRatePercent) / 100);

    const newClaim: DrawbackClaimRecord = {
      id: newId,
      claimNumber,
      exporterName,
      exporterBin,
      exporterErc,
      claimMode,
      exportProduct: {
        productName,
        exportHsCode,
        exportQuantityUnits: 5000,
        fobValueUsd,
        fobValueBdt,
        billOfExportNumber: billOfExportNo,
        billOfExportDate: new Date().toISOString().split("T")[0],
        formExpNumber: formExpNo,
        repatriationStatus: "repatriated",
        statutoryFlatRatePercent: flatRatePercent,
      },
      importedInputs: [],
      fobExportValueBdt,
      totalClaimableDrawbackBdt: totalDrawback,
      drawbackBreakdown: {
        customsDutyRefundBdt: Math.round(totalDrawback * 0.6),
        regulatoryDutyRefundBdt: Math.round(totalDrawback * 0.1),
        supplementaryDutyRefundBdt: Math.round(totalDrawback * 0.15),
        vatRefundBdt: Math.round(totalDrawback * 0.15),
      },
      customsActReference: "Section 33, Customs Act 2023 (DEDO SRO Schedule)",
      dedoFilingForm: "DEDO_FORM_A_FLAT",
      status: "submitted",
      digitalSealHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClaims([newClaim, ...claims]);
    setSelectedClaim(newClaim);
    setMetrics((prev) => ({
      ...prev,
      totalClaimsCount: prev.totalClaimsCount + 1,
      totalClaimedValueBdt: prev.totalClaimedValueBdt + totalDrawback,
      pendingAuditBdt: prev.pendingAuditBdt + totalDrawback,
    }));
    setActiveTab("claims");
  };

  const handleRunReconciler = () => {
    const isMatched = Boolean(testImportBe && testExportBe && testFormExp);
    setReconcileResult({
      isMatched,
      importBeMatched: Boolean(testImportBe),
      exportBeMatched: Boolean(testExportBe),
      formExpMatched: Boolean(testFormExp),
      reconciliationScorePercent: isMatched ? 100 : 66,
      discrepancies: isMatched ? [] : ["Form-EXP repatriation reference pending confirmation in BB portal"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  NBR Customs Duty Drawback & DEC Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Customs Act 2023 Sec 33/34
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                  ⌘B
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated export tariff drawback calculator, DEDO Form-A/B filing generator & Form-EXP cross-reconciler
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
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-slate-400">Total Drawback Portfolio</div>
              <div className="text-base font-bold text-white">
                ৳{(metrics.totalClaimedValueBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">Sanctioned & Disbursed</div>
              <div className="text-base font-bold text-emerald-400">
                ৳{(metrics.totalDisbursedDrawbackBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Pending DEDO Audit</div>
              <div className="text-base font-bold text-amber-400">
                ৳{(metrics.pendingAuditBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-400">Avg DEDO Turnaround</div>
              <div className="text-base font-bold text-cyan-400">{metrics.avgTurnaroundDays} Days</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("claims")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "claims"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Active Drawback Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "draft"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Claim Drafter & Duty Calculator
          </button>
          <button
            onClick={() => setActiveTab("reconcile")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "reconcile"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            B/E to Form-EXP Cross-Matcher
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "schedule"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            DEDO Statutory Tariff Schedule
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {/* TAB 1: Active Claims */}
          {activeTab === "claims" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">Export Consignments & DEDO Drawback Filings</h3>
                <button
                  onClick={() => setActiveTab("draft")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> File New Drawback Claim
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claims.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClaim(c)}
                    className={`p-4 rounded-xl bg-slate-900 border cursor-pointer transition-all hover:shadow-lg ${
                      selectedClaim?.id === c.id ? "border-cyan-400" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-cyan-400 rounded">
                          {c.claimNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            c.status === "sanctioned" || c.status === "disbursed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-cyan-400">
                        ৳{(c.totalClaimableDrawbackBdt / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
                      {c.exportProduct.productName}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">{c.exporterName}</p>

                    <div className="text-xs space-y-1 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Export FOB Value:</span>
                        <span className="font-medium text-slate-200">৳{(c.fobExportValueBdt / 100000).toFixed(1)} Lakh (${c.exportProduct.fobValueUsd.toLocaleString()})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Form-EXP Ref:</span>
                        <span className="font-mono text-slate-200">{c.exportProduct.formExpNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customs Duty (CD) Refund:</span>
                        <span className="font-mono text-emerald-400">৳{c.drawbackBreakdown.customsDutyRefundBdt.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Lock className="w-3 h-3" /> Seal: {c.digitalSealHash.slice(0, 10)}...
                      </div>
                      <span className="text-slate-400">{c.dedoFilingForm}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: New Drawback Claim Drafter */}
          {activeTab === "draft" && (
            <form onSubmit={handleCreateClaim} className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Customs Act 2023 Statutory Drawback Compliance:</span> Under Section 33 & 34 of the Customs Act 2023, exporters are entitled to 100% duty drawback of import tariffs paid on inputs once the finished goods are exported and foreign exchange is repatriated via Bangladesh Bank Form-EXP.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Drawback Claim Mode
                  </label>
                  <select
                    value={claimMode}
                    onChange={(e) => setClaimMode(e.target.value as ClaimMode)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="dedo_flat_rate">DEDO Statutory Flat Rate (স্ট্যাটিউটরি ফ্ল্যাট রেট - ৪.৫% FOB)</option>
                    <option value="actual_costing_bom">Actual Costing BOM Coefficient (প্রকৃত ব্যয় মূসক-৪.৩ ভিত্তিক)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Export Product Name & Description
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Export FOB Value (USD)
                  </label>
                  <input
                    type="number"
                    value={fobValueUsd}
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      setFobValueUsd(usd);
                      setFobValueBdt(usd * 120);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Export FOB Value (BDT @ ৳120/$)
                  </label>
                  <input
                    type="number"
                    value={fobValueBdt}
                    onChange={(e) => setFobValueBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Statutory Flat Rate % (DEDO Schedule)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={flatRatePercent}
                    onChange={(e) => setFlatRatePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Dynamic Drawback Estimate Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Statutory Drawback Entitlement</div>
                  <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400 font-mono text-lg">
                      ৳{Math.round((fobValueBdt * flatRatePercent) / 100).toLocaleString()}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                      {flatRatePercent}% of FOB
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    CD: ৳{Math.round((fobValueBdt * flatRatePercent * 0.6) / 100).toLocaleString()} • RD/SD: ৳{Math.round((fobValueBdt * flatRatePercent * 0.25) / 100).toLocaleString()} • VAT: ৳{Math.round((fobValueBdt * flatRatePercent * 0.15) / 100).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> 100% Tax Deductible DEDO Claim
                </div>
              </div>

              {/* Exporter & Statutory Documentation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Exporter Statutory Registration
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={exporterName}
                      onChange={(e) => setExporterName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">13-Digit BIN</label>
                    <input
                      type="text"
                      value={exporterBin}
                      onChange={(e) => setExporterBin(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ERC Registration No</label>
                    <input
                      type="text"
                      value={exporterErc}
                      onChange={(e) => setExporterErc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Customs & Bangladesh Bank Verification
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bill of Export Number</label>
                    <input
                      type="text"
                      value={billOfExportNo}
                      onChange={(e) => setBillOfExportNo(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bangladesh Bank Form-EXP Reference</label>
                    <input
                      type="text"
                      value={formExpNo}
                      onChange={(e) => setFormExpNo(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Export 8-Digit HS Code</label>
                    <input
                      type="text"
                      value={exportHsCode}
                      onChange={(e) => setExportHsCode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("claims")}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:from-cyan-400 hover:to-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Generate DEDO Form-A Dossier & Cryptographic Seal
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: B/E to Form-EXP Cross-Matcher */}
          {activeTab === "reconcile" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400" /> Automated ASYCUDA World & Form-EXP Cross-Matcher
                </h3>
                <p className="text-slate-400">
                  Cross-checks import Bill of Entry (B/E) raw material tariffs against export shipment out-of-charge manifest and Bangladesh Bank 120-day foreign currency repatriation records.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Import B/E Number</label>
                    <input
                      type="text"
                      value={testImportBe}
                      onChange={(e) => setTestImportBe(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Bill of Export Number</label>
                    <input
                      type="text"
                      value={testExportBe}
                      onChange={(e) => setTestExportBe(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">BB Form-EXP Reference</label>
                    <input
                      type="text"
                      value={testFormExp}
                      onChange={(e) => setTestFormExp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunReconciler}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify Reconciliation Match
                  </button>
                </div>

                {reconcileResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Reconciliation Score</span>
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        {reconcileResult.reconciliationScorePercent}% MATCHED
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Import B/E verified in ASYCUDA World (Chittagong Port ICD)
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Out-of-charge shipping bill registered
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> BB Form-EXP currency repatriation confirmed ($45,000 USD received)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Statutory Tariff Schedule */}
          {activeTab === "schedule" && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" /> NBR DEDO Statutory Flat Rate Tariff Schedule (Bangladesh)
                </h3>
                <p className="text-slate-400 mb-4">
                  Standard duty drawback flat rates officially notified by NBR Duty Exemption and Drawback Office (DEDO) under Section 33 of the Customs Act:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3">Export Product Category</th>
                        <th className="py-2 px-3">Export HS Code</th>
                        <th className="py-2 px-3">Statutory Flat Rate (% FOB)</th>
                        <th className="py-2 px-3">Standard Eligible Inputs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Knitted Cotton Apparel (T-Shirts / Polos)</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400">6109.10.00</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">4.5%</td>
                        <td className="py-2.5 px-3">Imported yarn, dyes, chemicals, polybags</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Woven Garments (Shirts, Denim, Trousers)</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400">6203.42.00</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">5.0%</td>
                        <td className="py-2.5 px-3">Woven fabric, interlining, zippers, buttons</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Finished Leather Footwear & Goods</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400">6403.51.00</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">6.0%</td>
                        <td className="py-2.5 px-3">Tanning chemicals, soles, PU linings, buckles</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Light Engineering & Battery Accumulators</td>
                        <td className="py-2.5 px-3 font-mono text-cyan-400">8507.10.00</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">7.5%</td>
                        <td className="py-2.5 px-3">Lead ingots, separators, sulfuric acid, plastic casing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutyDrawbackModal;
