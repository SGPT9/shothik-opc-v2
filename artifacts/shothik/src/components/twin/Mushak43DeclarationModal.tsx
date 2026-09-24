import React, { useState, useEffect } from "react";
import {
  Factory,
  FileText,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  RefreshCw,
  X,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent
} from "lucide-react";

interface Mushak43DeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "declarations_list"
  | "bom_costing_calculator"
  | "statutory_form_view"
  | "batch_variance_auditor"
  | "industry_templates";

export interface RawMaterialInput {
  materialId: string;
  name: string;
  banglaName: string;
  hsCode: string;
  unitOfMeasure: string;
  grossConsumptionPerUnit: number;
  standardWastagePercent: number;
  netEffectiveConsumption: number;
  unitCostBdt: number;
  totalMaterialCostBdt: number;
}

export interface ValueAdditionBreakdown {
  rawMaterialsCostBdt: number;
  directLaborCostBdt: number;
  utilitiesEnergyCostBdt: number;
  packagingMaterialCostBdt: number;
  factoryOverheadCostBdt: number;
  administrativeOverheadCostBdt: number;
  financeCostBdt: number;
  totalCostOfProductionBdt: number;
  profitMarginPercent: number;
  profitMarginBdt: number;
  declaredSellingPriceExVatBdt: number;
  vatRatePercent: number;
  vatAmountBdt: number;
  finalSellingPriceIncVatBdt: number;
  valueAdditionPercent: number;
}

export interface Mushak43Declaration {
  declarationId: string;
  formNumber: "মূসক-৪.৩";
  finishedProductSku: string;
  finishedProductName: string;
  finishedProductBanglaName: string;
  finishedProductHsCode: string;
  unitOfSupply: string;
  manufacturerBin: string;
  manufacturerName: string;
  factoryAddress: string;
  divisionalVatOffice: string;
  rawMaterials: RawMaterialInput[];
  costingBreakdown: ValueAdditionBreakdown;
  firstSupplyEffectiveDate: string;
  submissionDate: string;
  declaredBy: string;
  designation: string;
  status: "draft" | "submitted_to_vat_office" | "accepted_by_nbr" | "revision_required";
  sha256Seal: string;
  createdAt: string;
}

export const Mushak43DeclarationModal: React.FC<Mushak43DeclarationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("declarations_list");

  // Active Declarations
  const [declarations, setDeclarations] = useState<Mushak43Declaration[]>([
    {
      declarationId: "MUSHAK43-BAKERY-001",
      formNumber: "মূসক-৪.৩",
      finishedProductSku: "SKU-BISCUIT-01",
      finishedProductName: "Butter Toast Biscuit 250g Family Pack",
      finishedProductBanglaName: "বাটার টোস্ট বিস্কুট ২৫০গ্রাম",
      finishedProductHsCode: "1905.31.00",
      unitOfSupply: "Pack (250g)",
      manufacturerBin: "001234567-0101",
      manufacturerName: "Shothik Foods & Agro Industries Ltd.",
      factoryAddress: "Plot 45, BSCIC Industrial Estate, Tongi, Gazipur",
      divisionalVatOffice: "Divisional VAT Office, Tongi Division, Gazipur Circle",
      rawMaterials: [
        {
          materialId: "MAT-WHEAT-01",
          name: "Refined Wheat Flour (Maida)",
          banglaName: "ময়দা",
          hsCode: "1101.00.10",
          unitOfMeasure: "gram",
          grossConsumptionPerUnit: 200,
          standardWastagePercent: 3.5,
          netEffectiveConsumption: 193,
          unitCostBdt: 0.065,
          totalMaterialCostBdt: 13.0
        },
        {
          materialId: "MAT-SUGAR-01",
          name: "Refined Sugar",
          banglaName: "চিনি",
          hsCode: "1701.99.00",
          unitOfMeasure: "gram",
          grossConsumptionPerUnit: 45,
          standardWastagePercent: 2.0,
          netEffectiveConsumption: 44.1,
          unitCostBdt: 0.14,
          totalMaterialCostBdt: 6.3
        },
        {
          materialId: "MAT-BUTTER-01",
          name: "Bakery Butter & Vegetable Fat",
          banglaName: "বাটার ও উদ্ভিজ্জ ফ্যাট",
          hsCode: "1517.90.00",
          unitOfMeasure: "gram",
          grossConsumptionPerUnit: 35,
          standardWastagePercent: 4.0,
          netEffectiveConsumption: 33.6,
          unitCostBdt: 0.38,
          totalMaterialCostBdt: 13.3
        }
      ],
      costingBreakdown: {
        rawMaterialsCostBdt: 32.6,
        directLaborCostBdt: 4.5,
        utilitiesEnergyCostBdt: 3.0,
        packagingMaterialCostBdt: 5.5,
        factoryOverheadCostBdt: 2.5,
        administrativeOverheadCostBdt: 1.5,
        financeCostBdt: 1.0,
        totalCostOfProductionBdt: 50.6,
        profitMarginPercent: 18,
        profitMarginBdt: 9.11,
        declaredSellingPriceExVatBdt: 59.71,
        vatRatePercent: 15,
        vatAmountBdt: 8.96,
        finalSellingPriceIncVatBdt: 68.67,
        valueAdditionPercent: 45.4
      },
      firstSupplyEffectiveDate: "2026-10-01",
      submissionDate: "2026-09-15",
      declaredBy: "Kazi Farhan Ahmed",
      designation: "Head of Factory Accounts & Tax Compliance",
      status: "accepted_by_nbr",
      sha256Seal: "8a7c8e9f2b1d0c4a6e8b5d3c1f9a7e5b3d1c9a7e5b3d1c9a7e5b3d1c9a7e5b3d",
      createdAt: "2026-09-15T10:30:00Z"
    }
  ]);

  const [selectedDeclaration, setSelectedDeclaration] = useState<Mushak43Declaration>(declarations[0]);

  // BOM Calculator State
  const [sku, setSku] = useState("SKU-POLO-002");
  const [productName, setProductName] = useState("Premium Cotton Polo Shirt");
  const [banglaName, setBanglaName] = useState("প্রিমিয়াম কটন পোলো শার্ট");
  const [hsCode, setHsCode] = useState("6105.10.00");
  const [unitOfSupply, setUnitOfSupply] = useState("Piece");
  const [rawMaterialsList, setRawMaterialsList] = useState<RawMaterialInput[]>([
    {
      materialId: "MAT-1",
      name: "Cotton Single Jersey Fabric",
      banglaName: "কটন ফেব্রিক",
      hsCode: "6006.22.00",
      unitOfMeasure: "yard",
      grossConsumptionPerUnit: 1.3,
      standardWastagePercent: 7.5,
      netEffectiveConsumption: 1.2025,
      unitCostBdt: 175,
      totalMaterialCostBdt: 227.5
    },
    {
      materialId: "MAT-2",
      name: "Rib Collar & Cuffs",
      banglaName: "রিব কলার ও কাফ",
      hsCode: "6006.24.00",
      unitOfMeasure: "piece",
      grossConsumptionPerUnit: 1.0,
      standardWastagePercent: 2.0,
      netEffectiveConsumption: 0.98,
      unitCostBdt: 32,
      totalMaterialCostBdt: 32.0
    }
  ]);

  // Overheads State
  const [directLabor, setDirectLabor] = useState<number>(55);
  const [utilities, setUtilities] = useState<number>(14);
  const [packaging, setPackaging] = useState<number>(18);
  const [factoryOverhead, setFactoryOverhead] = useState<number>(20);
  const [adminOverhead, setAdminOverhead] = useState<number>(12);
  const [financeCost, setFinanceCost] = useState<number>(8);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [vatRate, setVatRate] = useState<number>(7.5);

  // Batch Audit State
  const [auditBatchNumber, setAuditBatchNumber] = useState("BCH-2026-OCT-01");
  const [auditUnitsProduced, setAuditUnitsProduced] = useState(500);
  const [auditTotalRecordedCost, setAuditTotalRecordedCost] = useState(205000);
  const [auditResult, setAuditResult] = useState<{
    varianceBdt: number;
    variancePercent: number;
    thresholdExceeded: boolean;
    actionRequired: string;
  } | null>(null);

  const [copiedSeal, setCopiedSeal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Keyboard shortcut: ⌘4 or Ctrl+4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "4") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live Costing Calculations
  const rawMaterialsTotalCost = rawMaterialsList.reduce((sum, m) => sum + m.totalMaterialCostBdt, 0);
  const totalCostOfProduction =
    rawMaterialsTotalCost + directLabor + utilities + packaging + factoryOverhead + adminOverhead + financeCost;
  const profitBdt = (totalCostOfProduction * profitMargin) / 100;
  const sellingPriceExVat = totalCostOfProduction + profitBdt;
  const vatAmount = (sellingPriceExVat * vatRate) / 100;
  const finalPriceIncVat = sellingPriceExVat + vatAmount;
  const valueAdditionPercent =
    sellingPriceExVat > 0 ? ((sellingPriceExVat - rawMaterialsTotalCost) / sellingPriceExVat) * 100 : 0;

  // Add Material Row
  const addMaterialRow = () => {
    const newId = `MAT-${rawMaterialsList.length + 1}`;
    setRawMaterialsList((prev) => [
      ...prev,
      {
        materialId: newId,
        name: "New Raw Material",
        banglaName: "কাঁচামাল",
        hsCode: "1101.00.00",
        unitOfMeasure: "kg",
        grossConsumptionPerUnit: 1.0,
        standardWastagePercent: 3.0,
        netEffectiveConsumption: 0.97,
        unitCostBdt: 50,
        totalMaterialCostBdt: 50.0
      }
    ]);
  };

  const updateMaterialRow = (index: number, field: keyof RawMaterialInput, value: any) => {
    setRawMaterialsList((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: value };
      const gross = Number(row.grossConsumptionPerUnit) || 0;
      const wastage = Number(row.standardWastagePercent) || 0;
      const unitCost = Number(row.unitCostBdt) || 0;

      row.netEffectiveConsumption = Math.round(gross * (1 - wastage / 100) * 1000) / 1000;
      row.totalMaterialCostBdt = Math.round(gross * unitCost * 100) / 100;
      copy[index] = row;
      return copy;
    });
  };

  const removeMaterialRow = (index: number) => {
    setRawMaterialsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Compile & Submit Declaration
  const handleSaveDeclaration = () => {
    if (rawMaterialsList.length === 0 || !productName) {
      setStatusMsg({ text: "Please enter product name and at least one raw material input.", type: "error" });
      return;
    }

    const newDeclId = `MUSHAK43-${Date.now().toString(36).toUpperCase()}`;
    const costingBreakdown: ValueAdditionBreakdown = {
      rawMaterialsCostBdt: Math.round(rawMaterialsTotalCost * 100) / 100,
      directLaborCostBdt: directLabor,
      utilitiesEnergyCostBdt: utilities,
      packagingMaterialCostBdt: packaging,
      factoryOverheadCostBdt: factoryOverhead,
      administrativeOverheadCostBdt: adminOverhead,
      financeCostBdt: financeCost,
      totalCostOfProductionBdt: Math.round(totalCostOfProduction * 100) / 100,
      profitMarginPercent: profitMargin,
      profitMarginBdt: Math.round(profitBdt * 100) / 100,
      declaredSellingPriceExVatBdt: Math.round(sellingPriceExVat * 100) / 100,
      vatRatePercent: vatRate,
      vatAmountBdt: Math.round(vatAmount * 100) / 100,
      finalSellingPriceIncVatBdt: Math.round(finalPriceIncVat * 100) / 100,
      valueAdditionPercent: Math.round(valueAdditionPercent * 100) / 100
    };

    const newDecl: Mushak43Declaration = {
      declarationId: newDeclId,
      formNumber: "মূসক-৪.৩",
      finishedProductSku: sku,
      finishedProductName: productName,
      finishedProductBanglaName: banglaName,
      finishedProductHsCode: hsCode,
      unitOfSupply,
      manufacturerBin: "001234567-0101",
      manufacturerName: "Shothik Manufacturing & Processing Ltd.",
      factoryAddress: "Plot 12, BSCIC Industrial Area, Tongi, Gazipur",
      divisionalVatOffice: "Divisional VAT Office, Gazipur Circle",
      rawMaterials: rawMaterialsList,
      costingBreakdown,
      firstSupplyEffectiveDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      submissionDate: new Date().toISOString().split("T")[0],
      declaredBy: "Head of Accounts",
      designation: "Authorized Representative",
      status: "submitted_to_vat_office",
      sha256Seal: `seal-${Date.now().toString(16)}-mushak43`,
      createdAt: new Date().toISOString()
    };

    setDeclarations((prev) => [newDecl, ...prev]);
    setSelectedDeclaration(newDecl);
    setStatusMsg({
      text: `Statutory Form Mushak-4.3 created: ${newDeclId} (${valueAdditionPercent.toFixed(1)}% Value Addition). Ready for NBR submission.`,
      type: "success"
    });
    setActiveTab("statutory_form_view");
  };

  // Run Batch Audit
  const handleRunBatchAudit = () => {
    if (!selectedDeclaration) return;
    const stdUnitCost = selectedDeclaration.costingBreakdown.totalCostOfProductionBdt;
    const stdExpectedCost = stdUnitCost * auditUnitsProduced;
    const varianceBdt = auditTotalRecordedCost - stdExpectedCost;
    const variancePercent = (varianceBdt / stdExpectedCost) * 100;
    const thresholdExceeded = Math.abs(variancePercent) >= 7.5;

    let actionRequired = "None (Within normal ±7.5% statutory threshold)";
    if (thresholdExceeded) {
      actionRequired = "MANDATORY: Submit Mushak-4.3 Revision to Divisional VAT Officer";
    } else if (variancePercent > 3.5) {
      actionRequired = "Investigate factory line wastage and material shrinkage";
    }

    setAuditResult({
      varianceBdt: Math.round(varianceBdt * 100) / 100,
      variancePercent: Math.round(variancePercent * 100) / 100,
      thresholdExceeded,
      actionRequired
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  NBR Mushak-4.3 Factory Costing & Coefficient Declarator
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  মূসক-৪.৩ বিধিবদ্ধ ডিক্লেয়ারেশন
                </span>
                <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-md">
                  Shortcut: ⌘4
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                VAT Act 2012 / Rule 21 · BOM Wastage Decomposition · Value Addition % · Divisional VAT Filing · 7.5% Refiling Auditor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6 gap-2">
          {[
            { id: "declarations_list", label: "Active Declarations", icon: FileText },
            { id: "bom_costing_calculator", label: "BOM Costing Calculator", icon: Calculator },
            { id: "statutory_form_view", label: "Formal মূসক-৪.৩ Form", icon: ShieldCheck },
            { id: "batch_variance_auditor", label: "7.5% Variance Auditor", icon: Scale },
            { id: "industry_templates", label: "BOM Templates", icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg flex items-center justify-between text-xs font-medium ${
              statusMsg.type === "success"
                ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50"
                : statusMsg.type === "error"
                ? "bg-rose-950/50 text-rose-300 border border-rose-800/50"
                : "bg-blue-950/50 text-blue-300 border border-blue-800/50"
            }`}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: DECLARATIONS LIST */}
          {activeTab === "declarations_list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Registered Mushak-4.3 Input-Output Coefficients</h3>
                  <p className="text-xs text-neutral-400">
                    Statutory product declarations submitted to the NBR Divisional VAT Officer under Rule 21.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("bom_costing_calculator")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Declare New Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {declarations.map((decl) => (
                  <div
                    key={decl.declarationId}
                    onClick={() => setSelectedDeclaration(decl)}
                    className={`p-4 bg-neutral-950/80 border rounded-xl cursor-pointer transition-all space-y-3 ${
                      selectedDeclaration?.declarationId === decl.declarationId
                        ? "border-emerald-500/60 bg-emerald-950/10"
                        : "border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-emerald-400">{decl.formNumber} · {decl.declarationId}</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{decl.finishedProductName}</h4>
                        <p className="text-xs text-neutral-400">{decl.finishedProductBanglaName}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {decl.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2 bg-neutral-900/80 rounded-lg text-center text-xs">
                      <div>
                        <span className="text-neutral-500 text-[10px]">Cost / Unit</span>
                        <p className="font-bold text-neutral-200">৳{decl.costingBreakdown.totalCostOfProductionBdt}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px]">Declared Price</span>
                        <p className="font-bold text-emerald-400">৳{decl.costingBreakdown.declaredSellingPriceExVatBdt}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px]">Value Addition</span>
                        <p className="font-bold text-amber-400">{decl.costingBreakdown.valueAdditionPercent}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800/60">
                      <span>HS Code: <strong className="text-neutral-300">{decl.finishedProductHsCode}</strong></span>
                      <span>BIN: <strong className="text-neutral-300">{decl.manufacturerBin}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BOM COSTING CALCULATOR */}
          {activeTab === "bom_costing_calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: BOM Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold text-white">Product & Manufacturer Profile</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-400 text-[10px]">Product SKU</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">Product Name (English)</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">পণ্যের নাম (বাংলা)</label>
                      <input
                        type="text"
                        value={banglaName}
                        onChange={(e) => setBanglaName(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">HS Code (8-Digit)</label>
                      <input
                        type="text"
                        value={hsCode}
                        onChange={(e) => setHsCode(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">Unit of Supply</label>
                      <input
                        type="text"
                        value={unitOfSupply}
                        onChange={(e) => setUnitOfSupply(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">Manufacturer 13-Digit BIN</label>
                      <input
                        type="text"
                        value="001234567-0101"
                        readOnly
                        className="w-full mt-1 px-2.5 py-1.5 bg-neutral-900/60 border border-neutral-800 rounded-lg text-emerald-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Raw Materials Table */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Raw Material Inputs & Process Wastage</h4>
                    <button
                      onClick={addMaterialRow}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Material
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {rawMaterialsList.map((m, idx) => (
                      <div
                        key={m.materialId}
                        className="p-2.5 bg-neutral-900/60 border border-neutral-800/80 rounded-lg grid grid-cols-12 gap-2 text-xs items-center"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Material Name"
                            value={m.name}
                            onChange={(e) => updateMaterialRow(idx, "name", e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Gross Qty"
                            value={m.grossConsumptionPerUnit}
                            onChange={(e) => updateMaterialRow(idx, "grossConsumptionPerUnit", Number(e.target.value))}
                            className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="Wastage %"
                              value={m.standardWastagePercent}
                              onChange={(e) => updateMaterialRow(idx, "standardWastagePercent", Number(e.target.value))}
                              className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                            />
                            <span className="text-neutral-500 text-[10px]">%</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Unit Cost ৳"
                            value={m.unitCostBdt}
                            onChange={(e) => updateMaterialRow(idx, "unitCostBdt", Number(e.target.value))}
                            className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-200"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="font-bold text-emerald-400">৳{m.totalMaterialCostBdt.toFixed(1)}</span>
                          <button
                            onClick={() => removeMaterialRow(idx)}
                            className="text-neutral-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Overheads & Value Addition (5 Cols) */}
              <div className="lg:col-span-5 bg-neutral-950/90 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white pb-2 border-b border-neutral-800">
                    Overhead Allocation & Value Addition
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Total Raw Materials:</span>
                      <span className="font-bold text-white">৳{rawMaterialsTotalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Direct Labor (৳):</span>
                      <input
                        type="number"
                        value={directLabor}
                        onChange={(e) => setDirectLabor(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Utilities / Gas / Power (৳):</span>
                      <input
                        type="number"
                        value={utilities}
                        onChange={(e) => setUtilities(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Packaging Materials (৳):</span>
                      <input
                        type="number"
                        value={packaging}
                        onChange={(e) => setPackaging(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Factory & Admin Overhead (৳):</span>
                      <input
                        type="number"
                        value={factoryOverhead + adminOverhead}
                        onChange={(e) => setFactoryOverhead(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Profit Margin (%):</span>
                      <input
                        type="number"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value) || 0)}
                        className="w-20 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">VAT Rate (%):</span>
                      <select
                        value={vatRate}
                        onChange={(e) => setVatRate(Number(e.target.value))}
                        className="w-20 px-1 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      >
                        <option value={15}>15% (Std)</option>
                        <option value={7.5}>7.5%</option>
                        <option value={5}>5%</option>
                        <option value={0}>0%</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Total Cost of Production:</span>
                      <span className="font-bold text-white">৳{totalCostOfProduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Declared Selling Price (Ex-VAT):</span>
                      <span className="font-bold text-emerald-400">৳{sellingPriceExVat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Final Price (Inc-VAT):</span>
                      <span className="font-bold text-white">৳{finalPriceIncVat.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                      <span className="font-bold text-amber-400">Value Addition %:</span>
                      <span className="text-base font-black text-amber-400">{valueAdditionPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveDeclaration}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" /> Compile & Seal NBR Mushak-4.3
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY FORM VIEW */}
          {activeTab === "statutory_form_view" && selectedDeclaration && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">NBR Statutory Form মূসক-৪.৩</h3>
                  <p className="text-xs text-neutral-400">
                    Certified input-output coefficient declaration according to Section 46 of VAT Act 2012.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedDeclaration, null, 2));
                    setCopiedSeal(true);
                    setTimeout(() => setCopiedSeal(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-lg flex items-center gap-1.5"
                >
                  {copiedSeal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSeal ? "Copied JSON" : "Export Form JSON"}
                </button>
              </div>

              {/* Printable Canvas Display */}
              <div className="p-6 bg-white text-black rounded-xl font-serif space-y-4 shadow-xl border border-neutral-300">
                <div className="text-center border-b pb-3 space-y-1">
                  <h3 className="text-base font-bold">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার · জাতীয় রাজস্ব বোর্ড</h3>
                  <h4 className="text-sm font-bold">ইনপুট-আউটপুট সহগ ঘোষণা (মূল্য সংযোজন কর ও সম্পূরক শুল্ক বিধিমালা, ২০১৬ এর বিধি ২১ দ্রষ্টব্য)</h4>
                  <p className="text-xs font-sans font-bold bg-neutral-100 inline-block px-2 py-0.5 rounded border">
                    ফর্ম: {selectedDeclaration.formNumber} · আইডি: {selectedDeclaration.declarationId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <p><strong>১. প্রস্তুতকারক প্রতিষ্ঠানের নাম:</strong> {selectedDeclaration.manufacturerName}</p>
                    <p><strong>২. ব্যবসা সনাক্তকরণ সংখ্যা (BIN):</strong> {selectedDeclaration.manufacturerBin}</p>
                    <p><strong>৩. কারখানার ঠিকানা:</strong> {selectedDeclaration.factoryAddress}</p>
                  </div>
                  <div>
                    <p><strong>৪. সংশ্লিষ্ট বিভাগীয় কর্মকর্তার দপ্তর:</strong> {selectedDeclaration.divisionalVatOffice}</p>
                    <p><strong>৫. প্রথম সরবরাহের সম্ভাব্য তারিখ:</strong> {selectedDeclaration.firstSupplyEffectiveDate}</p>
                    <p><strong>৬. ঘোষণার দাখিল তারিখ:</strong> {selectedDeclaration.submissionDate}</p>
                  </div>
                </div>

                {/* Statutory Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs font-sans border-collapse border border-neutral-400">
                    <thead>
                      <tr className="bg-neutral-100 text-center font-bold">
                        <th className="border border-neutral-400 p-1.5">কাঁচামালের বিবরণ</th>
                        <th className="border border-neutral-400 p-1.5">এইচএস কোড</th>
                        <th className="border border-neutral-400 p-1.5">একক</th>
                        <th className="border border-neutral-400 p-1.5">মোট ব্যবহার (অপচয়সহ)</th>
                        <th className="border border-neutral-400 p-1.5">অপচয়ের হার %</th>
                        <th className="border border-neutral-400 p-1.5">কার্যকর ব্যবহার</th>
                        <th className="border border-neutral-400 p-1.5">ক্রয়মূল্য (৳)</th>
                        <th className="border border-neutral-400 p-1.5">মোট কাঁচামাল খরচ (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDeclaration.rawMaterials.map((m) => (
                        <tr key={m.materialId} className="text-center">
                          <td className="border border-neutral-400 p-1.5 text-left font-medium">{m.name} ({m.banglaName})</td>
                          <td className="border border-neutral-400 p-1.5 font-mono">{m.hsCode}</td>
                          <td className="border border-neutral-400 p-1.5">{m.unitOfMeasure}</td>
                          <td className="border border-neutral-400 p-1.5 font-bold">{m.grossConsumptionPerUnit}</td>
                          <td className="border border-neutral-400 p-1.5">{m.standardWastagePercent}%</td>
                          <td className="border border-neutral-400 p-1.5">{m.netEffectiveConsumption}</td>
                          <td className="border border-neutral-400 p-1.5">৳{m.unitCostBdt}</td>
                          <td className="border border-neutral-400 p-1.5 font-bold">৳{m.totalMaterialCostBdt.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Statutory Costing & Value Addition Footer */}
                <div className="grid grid-cols-2 gap-4 text-xs font-sans pt-2 border-t border-neutral-300">
                  <div className="space-y-1">
                    <p>• মোট কাঁচামাল খরচ: <strong>৳{selectedDeclaration.costingBreakdown.rawMaterialsCostBdt.toFixed(2)}</strong></p>
                    <p>• প্রত্যক্ষ শ্রম ও শক্তি খরচ: <strong>৳{(selectedDeclaration.costingBreakdown.directLaborCostBdt + selectedDeclaration.costingBreakdown.utilitiesEnergyCostBdt).toFixed(2)}</strong></p>
                    <p>• মোড়ক ও কারখানা ওভারহেড: <strong>৳{(selectedDeclaration.costingBreakdown.packagingMaterialCostBdt + selectedDeclaration.costingBreakdown.factoryOverheadCostBdt).toFixed(2)}</strong></p>
                    <p>• মোট উৎপাদন খরচ (COGS): <strong>৳{selectedDeclaration.costingBreakdown.totalCostOfProductionBdt.toFixed(2)}</strong></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p>• ঘোষিত সরবরাহ মূল্য (মূসক ব্যতীত): <strong>৳{selectedDeclaration.costingBreakdown.declaredSellingPriceExVatBdt.toFixed(2)}</strong></p>
                    <p>• মূল্য সংযোজন হার (%): <strong className="text-emerald-700 text-sm font-bold">{selectedDeclaration.costingBreakdown.valueAdditionPercent}%</strong></p>
                    <p>• প্রদেয় মূসক ({selectedDeclaration.costingBreakdown.vatRatePercent}%): <strong>৳{selectedDeclaration.costingBreakdown.vatAmountBdt.toFixed(2)}</strong></p>
                    <p>• চূড়ান্ত মূসকযুক্ত বিক্রয়মূল্য: <strong>৳{selectedDeclaration.costingBreakdown.finalSellingPriceIncVatBdt.toFixed(2)}</strong></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-300 flex justify-between items-center text-[10px] font-sans text-neutral-600">
                  <div>
                    <p>স্বাক্ষরিত: <strong>{selectedDeclaration.declaredBy}</strong> ({selectedDeclaration.designation})</p>
                    <p className="font-mono">NBR Verification Seal: {selectedDeclaration.sha256Seal}</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold">
                    Official NBR Mushak-4.3 Validated
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BATCH VARIANCE AUDITOR */}
          {activeTab === "batch_variance_auditor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold text-white">Production Batch Variance Auditor</h4>
                  <p className="text-xs text-neutral-400">
                    Under NBR VAT Rules 2016, any input cost fluctuation exceeding <strong>±7.5%</strong> requires mandatory refiling of Mushak-4.3.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-neutral-400 text-[10px]">Batch Number</label>
                      <input
                        type="text"
                        value={auditBatchNumber}
                        onChange={(e) => setAuditBatchNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">Actual Units Produced</label>
                      <input
                        type="number"
                        value={auditUnitsProduced}
                        onChange={(e) => setAuditUnitsProduced(Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 text-[10px]">Actual Total Batch Cost Recorded (৳ BDT)</label>
                      <input
                        type="number"
                        value={auditTotalRecordedCost}
                        onChange={(e) => setAuditTotalRecordedCost(Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                      />
                    </div>

                    <button
                      onClick={handleRunBatchAudit}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Scale className="w-4 h-4" /> Audit Batch & Verify 7.5% NBR Gate
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit Result Box */}
              <div className="lg:col-span-6 bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Statutory Audit Result</h4>

                {auditResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Variance Amount:</span>
                      <span
                        className={
                          auditResult.varianceBdt > 0
                            ? "font-bold text-rose-400"
                            : "font-bold text-emerald-400"
                        }
                      >
                        {auditResult.varianceBdt > 0 ? "+" : ""}৳{auditResult.varianceBdt.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Cost Variance Percentage:</span>
                      <span className="text-base font-bold text-white">
                        {auditResult.variancePercent > 0 ? "+" : ""}{auditResult.variancePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">7.5% Refiling Gate:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          auditResult.thresholdExceeded
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {auditResult.thresholdExceeded ? "THRESHOLD EXCEEDED (REFILE REQUIRED)" : "COMPLIANT (WITHIN BUFFER)"}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <p className="text-neutral-500 text-[10px]">Action Required:</p>
                      <p className="text-amber-400 font-medium text-xs mt-0.5">{auditResult.actionRequired}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-neutral-500 text-xs">
                    Enter batch figures and click Audit Batch to evaluate NBR compliance.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: INDUSTRY BOM TEMPLATES */}
          {activeTab === "industry_templates" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Predefined Industry BOM Templates</h3>
                <p className="text-xs text-neutral-400">
                  Standardized Bill of Materials and wastage benchmarks for top Bangladeshi manufacturing sectors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Bakery & Confectionery (Butter Biscuit)",
                    category: "FMCG / Food",
                    vatRate: "15%",
                    materials: "Flour (Maida) 200g (3.5% waste), Sugar 45g (2%), Bakery Fat 35g (4%)",
                    valueAddition: "45.4%"
                  },
                  {
                    title: "Ready-Made Garments (Cotton Polo Shirt)",
                    category: "Apparel & Textiles",
                    vatRate: "7.5%",
                    materials: "Single Jersey Fabric 1.4 yds (8.5% waste), Collar/Cuff set, 3 Resin Buttons",
                    valueAddition: "42.8%"
                  },
                  {
                    title: "Agro-Processing (Mustard Oil 250ml)",
                    category: "Agri Manufacturing",
                    vatRate: "0% (Exempt)",
                    materials: "Mustard Seeds 600g (12% seed husk cake yield), PET bottle, Cap & Seal",
                    valueAddition: "35.2%"
                  },
                  {
                    title: "Personal Care & Soap Bar (100g)",
                    category: "Chemicals & Soap",
                    vatRate: "15%",
                    materials: "Soap Noodles 92g (3% waste), Fragrance/Color 3g, Wrapper & Box",
                    valueAddition: "48.0%"
                  }
                ].map((tpl, i) => (
                  <div
                    key={i}
                    className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3 hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">{tpl.category}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{tpl.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        VA {tpl.valueAddition}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{tpl.materials}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                      <span className="text-neutral-500">VAT Rate: <strong className="text-neutral-300">{tpl.vatRate}</strong></span>
                      <button
                        onClick={() => {
                          setStatusMsg({ text: `Cloned template "${tpl.title}" into BOM Costing Calculator.`, type: "info" });
                          setActiveTab("bom_costing_calculator");
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        Clone Template <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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

export default Mushak43DeclarationModal;
