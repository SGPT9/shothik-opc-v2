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
  BookOpen,
  HelpCircle,
  Award,
} from "lucide-react";

export interface HalalGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type HalalStatus = "halal" | "haram" | "mushbooh";
export type ShariahCertificationType = "product_halal" | "islamic_finance_murabaha" | "corporate_shariah_audit";
export type AuditStatus = "compliant" | "non_compliant" | "requires_purification" | "under_review";

export interface HalalCertificationRecord {
  id: string;
  certificateNumber: string;
  companyName: string;
  companyBin: string;
  productName: string;
  productCategory: string;
  certificationType: ShariahCertificationType;
  standardApplied: "BSTI BDS 1907:2016" | "JAKIM MS 1500:2019" | "OIC-SMIIC 1:2019" | "AAOIFI Standard 21";
  auditResult: AuditStatus;
  validFrom: string;
  validUntil: string;
  shariahBoardSignatory: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShariahSummaryMetrics {
  totalCertifications: number;
  activeHalalProducts: number;
  screenedIngredientsCount: number;
  compliantFinancingVolumeBdt: number;
  totalPurificationDisbursedBdt: number;
}

type TabType = "certifications" | "screener" | "finance" | "standards";

const DEFAULT_METRICS: ShariahSummaryMetrics = {
  totalCertifications: 4,
  activeHalalProducts: 3,
  screenedIngredientsCount: 1420,
  compliantFinancingVolumeBdt: 125000000,
  totalPurificationDisbursedBdt: 485000,
};

const INITIAL_CERTIFICATIONS: HalalCertificationRecord[] = [
  {
    id: "HL-2026-001",
    certificateNumber: "BSTI-HALAL-2026-88192",
    companyName: "Bengal Agro-Food Processing Ltd.",
    companyBin: "0019283746192",
    productName: "Premium Mango Fruit Bars & Confectionery",
    productCategory: "Processed Foods & Confectionery",
    certificationType: "product_halal",
    standardApplied: "BSTI BDS 1907:2016",
    auditResult: "compliant",
    validFrom: "2026-06-01",
    validUntil: "2027-06-01",
    shariahBoardSignatory: "Mufti Dr. M. Abdullah, Certified Shariah Advisor (AAOIFI/BSTI)",
    digitalSealHash: "d81029abce91024bc51908efa123bc0914a821eef00192837bc991a288410212",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "HL-2026-002",
    certificateNumber: "BSTI-HALAL-2026-91420",
    companyName: "SilkWay Natural Cosmetics Ltd.",
    companyBin: "0028193847102",
    productName: "Organic Aloe Vera Hydrating Gel & Facial Serum",
    productCategory: "Cosmetics & Personal Care",
    certificationType: "product_halal",
    standardApplied: "OIC-SMIIC 1:2019",
    auditResult: "compliant",
    validFrom: "2026-07-15",
    validUntil: "2027-07-15",
    shariahBoardSignatory: "Shariah Supervisory Board, Islamic Standards Council",
    digitalSealHash: "b192837461920aa8bc99120efa123bc0914a821eef00192837bc991a28841099",
    createdAt: "2026-07-15T11:30:00.000Z",
    updatedAt: "2026-07-15T11:30:00.000Z",
  },
  {
    id: "HL-2026-003",
    certificateNumber: "AAOIFI-FIN-2026-44012",
    companyName: "Padma Green Textiles PLC",
    companyBin: "0039182746109",
    productName: "Murabaha Inventory Financing Facility (৳5.0 Crore)",
    productCategory: "Islamic Corporate Finance",
    certificationType: "islamic_finance_murabaha",
    standardApplied: "AAOIFI Standard 21",
    auditResult: "compliant",
    validFrom: "2026-08-01",
    validUntil: "2027-08-01",
    shariahBoardSignatory: "Central Shariah Board for Islamic Banks of Bangladesh (CSBIB)",
    digitalSealHash: "fa98210bc91823efa0019283746bcda91024bc51908efa123bc0914a821eef00",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
];

export const HalalGovernanceModal: React.FC<HalalGovernanceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("certifications");
  const [certifications, setCertifications] = useState<HalalCertificationRecord[]>(INITIAL_CERTIFICATIONS);
  const [metrics, setMetrics] = useState<ShariahSummaryMetrics>(DEFAULT_METRICS);
  const [selectedCert, setSelectedCert] = useState<HalalCertificationRecord | null>(INITIAL_CERTIFICATIONS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Certificate
  const [companyName, setCompanyName] = useState("Deshi Organics Ltd.");
  const [companyBin, setCompanyBin] = useState("0019283746192");
  const [productName, setProductName] = useState("Cold-Pressed Mustard Oil & Spices");
  const [productCategory, setProductCategory] = useState("Edible Oils & Condiments");
  const [certificationType, setCertificationType] = useState<ShariahCertificationType>("product_halal");
  const [standardApplied, setStandardApplied] = useState<HalalCertificationRecord["standardApplied"]>("BSTI BDS 1907:2016");

  // Screener Form State
  const [rawIngredientsInput, setRawIngredientsInput] = useState("E100, E330, E471, Cane Sugar, Salt, Water");
  const [screeningOutput, setScreeningOutput] = useState<{
    total: number;
    halal: number;
    haram: number;
    mushbooh: number;
    status: HalalStatus;
    issues: string[];
  } | null>(null);

  // Financial Audit State
  const [finAssetsBdt, setFinAssetsBdt] = useState<number>(100000000);
  const [finDebtBdt, setFinDebtBdt] = useState<number>(20000000);
  const [finSecuritiesBdt, setFinSecuritiesBdt] = useState<number>(10000000);
  const [finRevenueBdt, setFinRevenueBdt] = useState<number>(60000000);
  const [finImpermissibleBdt, setFinImpermissibleBdt] = useState<number>(450000);
  const [finAuditResult, setFinAuditResult] = useState<{
    debtRatio: number;
    isDebtOk: boolean;
    secRatio: number;
    isSecOk: boolean;
    revRatio: number;
    isRevOk: boolean;
    purificationBdt: number;
    status: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `HL-2026-00${certifications.length + 1}`;
    const certificateNumber = `BSTI-HALAL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRecord: HalalCertificationRecord = {
      id: newId,
      certificateNumber,
      companyName,
      companyBin,
      productName,
      productCategory,
      certificationType,
      standardApplied,
      auditResult: "compliant",
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      shariahBoardSignatory: "Mufti Dr. M. Abdullah, Certified Shariah Advisor (AAOIFI/BSTI)",
      digitalSealHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCertifications([newRecord, ...certifications]);
    setSelectedCert(newRecord);
    setMetrics((prev) => ({
      ...prev,
      totalCertifications: prev.totalCertifications + 1,
      activeHalalProducts: prev.activeHalalProducts + 1,
    }));
    setActiveTab("certifications");
  };

  const handleScreenIngredients = () => {
    const list = rawIngredientsInput.split(",").map((s) => s.trim()).filter(Boolean);
    let halal = 0;
    let haram = 0;
    let mushbooh = 0;
    const issues: string[] = [];

    for (const item of list) {
      const clean = item.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (clean === "E120" || item.toLowerCase().includes("carmine") || item.toLowerCase().includes("cochineal")) {
        haram++;
        issues.push(`${item}: E120 Carmine (Insect origin) - Haram under Hanafi jurisprudence & BSTI BDS 1907`);
      } else if (clean === "E471" || clean === "E441" || item.toLowerCase().includes("gelatin")) {
        mushbooh++;
        issues.push(`${item}: Animal origin risk (Mushbooh) - Requires 100% plant or Halal Zabiha certificate`);
      } else {
        halal++;
      }
    }

    const status: HalalStatus = haram > 0 ? "haram" : mushbooh > 0 ? "mushbooh" : "halal";
    setScreeningOutput({
      total: list.length,
      halal,
      haram,
      mushbooh,
      status,
      issues,
    });
  };

  const handleRunFinAudit = () => {
    const debtRatio = finAssetsBdt > 0 ? (finDebtBdt / finAssetsBdt) * 100 : 0;
    const secRatio = finAssetsBdt > 0 ? (finSecuritiesBdt / finAssetsBdt) * 100 : 0;
    const revRatio = finRevenueBdt > 0 ? (finImpermissibleBdt / finRevenueBdt) * 100 : 0;

    const isDebtOk = debtRatio <= 33;
    const isSecOk = secRatio <= 33;
    const isRevOk = revRatio <= 5;

    let status = "Shariah Compliant";
    if (!isDebtOk || !isSecOk || !isRevOk) {
      status = "Non-Compliant (Exceeds AAOIFI Thresholds)";
    } else if (finImpermissibleBdt > 0) {
      status = "Shariah Compliant (Requires Income Purification)";
    }

    setFinAuditResult({
      debtRatio: Number(debtRatio.toFixed(2)),
      isDebtOk,
      secRatio: Number(secRatio.toFixed(2)),
      isSecOk,
      revRatio: Number(revRatio.toFixed(2)),
      isRevOk,
      purificationBdt: finImpermissibleBdt,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Halal Certification & Islamic Shariah Governance Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  BSTI BDS 1907 / AAOIFI 21
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                  ⌘J
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Halal food & cosmetic verification, E-number screening, and AAOIFI financial Shariah governance
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
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">Halal Certified SKUs</div>
              <div className="text-base font-bold text-white">{metrics.activeHalalProducts} Products</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-400">Screened E-Numbers</div>
              <div className="text-base font-bold text-cyan-400">{metrics.screenedIngredientsCount.toLocaleString()}+</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-slate-400">Shariah Financing Audited</div>
              <div className="text-base font-bold text-indigo-400">
                ৳{(metrics.compliantFinancingVolumeBdt / 10000000).toFixed(1)} Crore
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Purification Disbursed</div>
              <div className="text-base font-bold text-amber-400">
                ৳{(metrics.totalPurificationDisbursedBdt / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("certifications")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "certifications"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            Halal & Shariah Certificates ({certifications.length})
          </button>
          <button
            onClick={() => setActiveTab("screener")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "screener"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            E-Number & Ingredient Screener
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "finance"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            AAOIFI Financial Shariah Screener
          </button>
          <button
            onClick={() => setActiveTab("standards")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "standards"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            BSTI BDS 1907 & AAOIFI Standards
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {/* TAB 1: Certifications */}
          {activeTab === "certifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">
                  Verified Halal Products & Corporate Shariah Certificates
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCert(c)}
                    className={`p-4 rounded-xl bg-slate-900 border cursor-pointer transition-all hover:shadow-lg ${
                      selectedCert?.id === c.id ? "border-emerald-400" : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-emerald-400 rounded">
                          {c.certificateNumber}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {c.auditResult.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">{c.standardApplied}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{c.productName}</h4>
                    <p className="text-xs text-slate-400 mb-3">{c.companyName}</p>

                    <div className="text-xs space-y-1 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-medium text-slate-200">{c.productCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valid Until:</span>
                        <span className="font-mono text-emerald-400">{c.validUntil}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Signatory:</span>
                        <span className="text-slate-300 line-clamp-1">{c.shariahBoardSignatory}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Lock className="w-3 h-3" /> Seal: {c.digitalSealHash.slice(0, 10)}...
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(c.digitalSealHash, c.id);
                        }}
                        className="flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Seal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Screener */}
          {activeTab === "screener" && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> E-Number & Food Additive Halal Screener
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly screen ingredient lists and E-number additives against Bangladesh BSTI BDS 1907:2016 standards and Hanafi/International Fiqh rulings.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ingredient List / E-Numbers (Comma Separated)
                  </label>
                  <textarea
                    rows={3}
                    value={rawIngredientsInput}
                    onChange={(e) => setRawIngredientsInput(e.target.value)}
                    placeholder="e.g. E100, E120, E471, Citric Acid, Gelatin..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleScreenIngredients}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Run BSTI Halal Compliance Screen
                  </button>
                </div>

                {screeningOutput && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Overall Product Status:</span>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          screeningOutput.status === "halal"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : screeningOutput.status === "mushbooh"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {screeningOutput.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <div className="font-bold text-sm">{screeningOutput.halal}</div>
                        <div className="text-[10px]">Halal Elements</div>
                      </div>
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <div className="font-bold text-sm">{screeningOutput.mushbooh}</div>
                        <div className="text-[10px]">Mushbooh (Doubtful)</div>
                      </div>
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <div className="font-bold text-sm">{screeningOutput.haram}</div>
                        <div className="text-[10px]">Haram Non-Compliant</div>
                      </div>
                    </div>

                    {screeningOutput.issues.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-amber-400">Identified Critical Issues:</div>
                        {screeningOutput.issues.map((issue, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Finance */}
          {activeTab === "finance" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> AAOIFI Shariah Financial Ratio Screener
                </h3>
                <p className="text-slate-400">
                  Audits balance sheet debt, interest-bearing securities, and non-halal revenue according to AAOIFI Shariah Standard No. 21 and CSBIB norms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Total Assets (BDT)</label>
                    <input
                      type="number"
                      value={finAssetsBdt}
                      onChange={(e) => setFinAssetsBdt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Total Interest-Bearing Debt (BDT)</label>
                    <input
                      type="number"
                      value={finDebtBdt}
                      onChange={(e) => setFinDebtBdt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Interest-Bearing Securities / Cash (BDT)</label>
                    <input
                      type="number"
                      value={finSecuritiesBdt}
                      onChange={(e) => setFinSecuritiesBdt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Total Revenue (BDT)</label>
                    <input
                      type="number"
                      value={finRevenueBdt}
                      onChange={(e) => setFinRevenueBdt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1">Impermissible Non-Halal / Interest Income (BDT)</label>
                    <input
                      type="number"
                      value={finImpermissibleBdt}
                      onChange={(e) => setFinImpermissibleBdt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunFinAudit}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Calculate AAOIFI Shariah Compliance
                  </button>
                </div>

                {finAuditResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Shariah Status:</span>
                      <span className="font-bold text-emerald-400">{finAuditResult.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Debt to Assets (Max 33%)</div>
                        <div className={`font-bold mt-0.5 ${finAuditResult.isDebtOk ? "text-emerald-400" : "text-rose-400"}`}>
                          {finAuditResult.debtRatio}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Securities to Assets (Max 33%)</div>
                        <div className={`font-bold mt-0.5 ${finAuditResult.isSecOk ? "text-emerald-400" : "text-rose-400"}`}>
                          {finAuditResult.secRatio}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Non-Halal Rev (Max 5%)</div>
                        <div className={`font-bold mt-0.5 ${finAuditResult.isRevOk ? "text-emerald-400" : "text-rose-400"}`}>
                          {finAuditResult.revRatio}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Charitable Income Purification Required:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        ৳{finAuditResult.purificationBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Standards */}
          {activeTab === "standards" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Bangladesh & Global Shariah Standards Overview
                </h3>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="font-bold text-emerald-400 mb-1">BSTI BDS 1907:2016 (Bangladesh Halal Standard)</h4>
                    <p className="text-slate-300">
                      National standard governing food, cosmetics, pharmaceuticals, and consumer goods. Prohibits porcine derivatives, non-Zabiha animals, alcohol intoxication agents, and cochineal carmine (E120).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="font-bold text-cyan-400 mb-1">AAOIFI Shariah Standard No. 21 (Financial Ratio Screening)</h4>
                    <p className="text-slate-300">
                      International standard for Islamic banking and equity screening. Imposes strict ceilings: Debt/Assets ≤ 33%, Interest-Bearing Securities/Assets ≤ 33%, and Impermissible Revenue ≤ 5%.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="font-bold text-indigo-400 mb-1">OIC-SMIIC 1:2019 (General Requirements for Halal Food)</h4>
                    <p className="text-slate-300">
                      Standardized guidelines across 57 OIC member nations ensuring cross-border acceptance in GCC, Turkey, Malaysia, and Southeast Asia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Islamic Shariah Board Advisory & BSTI BDS 1907 Engine Active</span>
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

export default HalalGovernanceModal;
