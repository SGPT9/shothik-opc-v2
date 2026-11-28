import React, { useState, useEffect } from "react";
import {
  Globe,
  Package,
  Calculator,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ship,
  Plane,
  Truck,
  DollarSign,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Building2,
  HelpCircle,
  X,
} from "lucide-react";

interface CrossBorderCustomsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HsCodeItem {
  hsCode: string;
  category: string;
  description: string;
  cdRate: number;
  rdRate: number;
  sdRate: number;
  vatRate: number;
  aitRate: number;
  atRate: number;
  regulatoryNocRequired?: string;
  minimumTariffValueUsdPerKg?: number;
}

const DEFAULT_HS_CATALOG: HsCodeItem[] = [
  {
    hsCode: "8517.13.00",
    category: "Consumer Electronics",
    description: "Smartphones and cellular network mobile handsets",
    cdRate: 0.25,
    rdRate: 0.03,
    sdRate: 0.0,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "BTRC Import Permission & IMEI White-Listing NOC",
  },
  {
    hsCode: "8518.30.00",
    category: "Consumer Electronics",
    description: "TWS Earbuds, Bluetooth Headphones, and Earphones",
    cdRate: 0.25,
    rdRate: 0.03,
    sdRate: 0.2,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "BTRC Radio Frequency Equipment Type Approval",
  },
  {
    hsCode: "8504.40.90",
    category: "Mobile Accessories",
    description: "Fast GaN Wall Chargers, Multi-port Adapters and Power Banks",
    cdRate: 0.15,
    rdRate: 0.0,
    sdRate: 0.0,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "BSTI Quality Clearance Certificate (BDS IEC Standard)",
  },
  {
    hsCode: "6109.10.00",
    category: "Apparel & Textiles",
    description: "Cotton T-Shirts, Knitted Polos, and Casual Tops",
    cdRate: 0.25,
    rdRate: 0.03,
    sdRate: 0.45,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    minimumTariffValueUsdPerKg: 4.5,
  },
  {
    hsCode: "3304.99.00",
    category: "Beauty & Cosmetics",
    description: "Skincare Serums, Facial Creams, and Sunscreen Lotions",
    cdRate: 0.25,
    rdRate: 0.03,
    sdRate: 0.6,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "BSTI Mandatory Test Certificate & DGDA Formulation NOC",
  },
  {
    hsCode: "9503.00.90",
    category: "Toys & Kids",
    description: "Educational STEM Kits, Building Blocks, and Electronic Toys",
    cdRate: 0.25,
    rdRate: 0.03,
    sdRate: 0.2,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "Non-Toxic Material Declaration & Lead-Free Compliance",
  },
  {
    hsCode: "8471.30.00",
    category: "Computing",
    description: "Laptops, Portable Data Processing Tablets and Sub-Notebooks",
    cdRate: 0.05,
    rdRate: 0.0,
    sdRate: 0.0,
    vatRate: 0.15,
    aitRate: 0.05,
    atRate: 0.05,
    regulatoryNocRequired: "Special ICT Concessionary Duty Tier (No SD/RD)",
  },
];

export const CrossBorderCustomsModal: React.FC<CrossBorderCustomsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "breakdown" | "hscodes" | "brief">("calculator");

  // Calculator Form State
  const [productTitle, setProductTitle] = useState("TWS ANC Bluetooth Earbuds (Model Pro 5)");
  const [sourcePlatform, setSourcePlatform] = useState<"1688" | "taobao" | "aliexpress" | "direct_factory">("1688");
  const [sourceUrl, setSourceUrl] = useState("https://detail.1688.com/offer/7123456789.html");
  const [currency, setCurrency] = useState<"USD" | "CNY" | "EUR">("USD");
  const [unitPrice, setUnitPrice] = useState<number>(12.5);
  const [quantity, setQuantity] = useState<number>(100);
  const [weightKg, setWeightKg] = useState<number>(15.0);
  const [shippingMethod, setShippingMethod] = useState<"air_express" | "air_cargo" | "sea_freight_lcl" | "sea_freight_fcl">("air_express");
  const [selectedHsCode, setSelectedHsCode] = useState("8518.30.00");
  const [portOfEntry, setPortOfEntry] = useState<"dhaka_airport_cargo" | "chittagong_seaport" | "benapole_land_port">("dhaka_airport_cargo");
  const [importerBin, setImporterBin] = useState("001892341-0101");

  // Search in HS Code directory
  const [hsSearchQuery, setHsSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Global Keyboard Shortcut: ⌘U or Ctrl+U
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Derived calculation
  const exchangeRate = currency === "USD" ? 122.5 : currency === "CNY" ? 17.2 : 133.0;
  const currentHs = DEFAULT_HS_CATALOG.find((h) => h.hsCode === selectedHsCode) || DEFAULT_HS_CATALOG[1];

  const totalFobDeclared = unitPrice * quantity;
  const fobBdt = Math.round(totalFobDeclared * exchangeRate);

  let freightRatePerKg = 8.5; // air express
  if (shippingMethod === "air_cargo") freightRatePerKg = 5.2;
  if (shippingMethod === "sea_freight_lcl") freightRatePerKg = 1.2;
  if (shippingMethod === "sea_freight_fcl") freightRatePerKg = 0.6;

  const freightBdt = Math.round(weightKg * freightRatePerKg * 122.5);
  const insuranceBdt = Math.round((fobBdt + freightBdt) * 0.01);
  const assessableValueBdt = fobBdt + freightBdt + insuranceBdt;

  const cdBdt = Math.round(assessableValueBdt * currentHs.cdRate);
  const rdBdt = Math.round(assessableValueBdt * currentHs.rdRate);
  const baseForSd = assessableValueBdt + cdBdt + rdBdt;
  const sdBdt = Math.round(baseForSd * currentHs.sdRate);
  const baseForVatAndAt = baseForSd + sdBdt;
  const vatBdt = Math.round(baseForVatAndAt * currentHs.vatRate);
  const aitBdt = Math.round(assessableValueBdt * currentHs.aitRate);
  const atBdt = Math.round(baseForVatAndAt * currentHs.atRate);

  const totalDutyAndTaxBdt = cdBdt + rdBdt + sdBdt + vatBdt + aitBdt + atBdt;
  const portHandlingBdt = portOfEntry === "chittagong_seaport" ? 8000 : 3500;
  const totalLandedCostBdt = assessableValueBdt + totalDutyAndTaxBdt + portHandlingBdt;
  const unitLandedCostBdt = Math.round((totalLandedCostBdt / Math.max(1, quantity)) * 100) / 100;
  const effectiveTaxPercent = Math.round((totalDutyAndTaxBdt / assessableValueBdt) * 1000) / 10;

  const filteredHsCatalog = DEFAULT_HS_CATALOG.filter(
    (h) =>
      h.hsCode.includes(hsSearchQuery) ||
      h.category.toLowerCase().includes(hsSearchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(hsSearchQuery.toLowerCase())
  );

  const handleCopyBrief = () => {
    const briefText = `
======================================================
🇧🇩 BANGLADESH CUSTOMS & C&F CLEARANCE BRIEF
Consignee: Shothik Merchant Enterprises (BIN: ${importerBin})
Port of Entry: ${portOfEntry.replace(/_/g, " ").toUpperCase()}
HS Code: ${currentHs.hsCode} - ${currentHs.description}
------------------------------------------------------
Item: ${productTitle} (${quantity} units | Gross Wt: ${weightKg} kg)
Declared FOB: ${currency} ${totalFobDeclared.toLocaleString()} (৳${fobBdt.toLocaleString()})
Assessable Value (AV): ৳${assessableValueBdt.toLocaleString()}
Estimated Statutory Duty & Taxes: ৳${totalDutyAndTaxBdt.toLocaleString()} (${effectiveTaxPercent}% Eff.)
Unit Landed Cost: ৳${unitLandedCostBdt.toLocaleString()} / pc
------------------------------------------------------
Statutory Required Documents:
1. Commercial Invoice & Detailed Packing List
2. AWB / Bill of Lading (B/L)
3. Importer 13-digit BIN Certificate (${importerBin})
${currentHs.regulatoryNocRequired ? `4. ${currentHs.regulatoryNocRequired}` : ""}
======================================================
`;
    navigator.clipboard.writeText(briefText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customs-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="customs-modal-title" className="text-lg font-semibold text-slate-100">
                  Cross-Border Sourcing & Bangladesh Customs Studio
                </h2>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/20">
                  NBR Act 2023
                </span>
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                  ⌘U
                </kbd>
              </div>
              <p className="text-xs text-slate-400">
                1688 / Taobao Landed Costing, NBR 8-Digit HS Code Tariff & C&F Port Dispatch Brief
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "calculator"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Landed Cost Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "breakdown"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>NBR Tariff Cascade</span>
          </button>
          <button
            onClick={() => setActiveTab("hscodes")}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "hscodes"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>HS Code Directory</span>
          </button>
          <button
            onClick={() => setActiveTab("brief")}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "brief"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>C&F Clearing Brief</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Landed Cost Calculator */}
          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Source Platform</label>
                    <select
                      value={sourcePlatform}
                      onChange={(e: any) => setSourcePlatform(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="1688">1688.com (China Wholesale)</option>
                      <option value="taobao">Taobao Direct</option>
                      <option value="aliexpress">AliExpress Global</option>
                      <option value="direct_factory">Direct OEM Factory</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e: any) => setCurrency(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="USD">USD ($) · Rate ৳122.5</option>
                      <option value="CNY">CNY (¥) · Rate ৳17.2</option>
                      <option value="EUR">EUR (€) · Rate ৳133.0</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Unit Price ({currency})</label>
                    <input
                      type="number"
                      step="0.1"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Quantity (pcs)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Gross Weight (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.1)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Shipping Method</label>
                    <select
                      value={shippingMethod}
                      onChange={(e: any) => setShippingMethod(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="air_express">Air Express (4-6 Days) · $8.5/kg</option>
                      <option value="air_cargo">Air Cargo (8-12 Days) · $5.2/kg</option>
                      <option value="sea_freight_lcl">Sea Freight LCL (25-35 Days) · $1.2/kg</option>
                      <option value="sea_freight_fcl">Sea Freight FCL (Container) · $0.6/kg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">HS Code Classification</label>
                    <select
                      value={selectedHsCode}
                      onChange={(e) => setSelectedHsCode(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      {DEFAULT_HS_CATALOG.map((h) => (
                        <option key={h.hsCode} value={h.hsCode}>
                          {h.hsCode} · {h.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Port of Clearance</label>
                    <select
                      value={portOfEntry}
                      onChange={(e: any) => setPortOfEntry(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="dhaka_airport_cargo">Dhaka Airport Cargo Village (DAC)</option>
                      <option value="chittagong_seaport">Chittagong Seaport (CTG)</option>
                      <option value="benapole_land_port">Benapole Land Port (BEN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Importer 13-Digit BIN</label>
                    <input
                      type="text"
                      value={importerBin}
                      onChange={(e) => setImporterBin(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Regulatory Warnings Alert */}
                {currentHs.regulatoryNocRequired && (
                  <div className="flex items-start space-x-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-300 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Mandatory Regulatory Notice:</span>{" "}
                      {currentHs.regulatoryNocRequired}. Customs clearance requires an endorsed clearance certificate.
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Landed Summary Card */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                    Calculated Landed Unit Cost
                  </div>
                  <div className="text-3xl font-bold text-amber-400 font-mono">
                    ৳{unitLandedCostBdt.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal ml-1">/ unit</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Total Order Landed: ৳{totalLandedCostBdt.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Declared FOB ({currency} {totalFobDeclared}):</span>
                    <span className="font-mono">৳{fobBdt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Freight ({weightKg} kg):</span>
                    <span className="font-mono">৳{freightBdt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Assessable Value (AV):</span>
                    <span className="font-mono font-medium">৳{assessableValueBdt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-medium">
                    <span>Total Duty & Taxes ({effectiveTaxPercent}%):</span>
                    <span className="font-mono">৳{totalDutyAndTaxBdt.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider">
                    Recommended Retail Pricing (B2C)
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Conservative (25% Margin):</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      ৳{Math.round(unitLandedCostBdt * 1.25).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Standard OPC (40% Margin):</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      ৳{Math.round(unitLandedCostBdt * 1.4).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Premium D2C (60% Margin):</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      ৳{Math.round(unitLandedCostBdt * 1.6).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("brief")}
                  className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5 text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate C&F Dispatch Brief</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NBR Tariff Cascade Breakdown */}
          {activeTab === "breakdown" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                  <Package className="h-4 w-4 text-amber-400" />
                  <span>NBR Statutory Duty Cascade — HS Code {currentHs.hsCode}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center mb-6">
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Customs Duty (CD)</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.cdRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{cdBdt.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Regulatory Duty (RD)</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.rdRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{rdBdt.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Supp. Duty (SD)</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.sdRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{sdBdt.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Value Added Tax (VAT)</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.vatRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{vatBdt.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Advance Income Tax</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.aitRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{aitBdt.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="text-[10px] uppercase text-slate-400">Advance Tax (AT)</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-1">
                      {(currentHs.atRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-amber-400 font-mono">৳{atBdt.toLocaleString()}</div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="text-slate-400">
                    <span className="font-semibold text-slate-200">Total Statutory Tariff Payable:</span> ৳
                    {totalDutyAndTaxBdt.toLocaleString()} (Effective Tax Rate: {effectiveTaxPercent}%)
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    <ShieldCheck className="h-4 w-4" />
                    <span>NBR Customs Act 2023 Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HS Code Directory */}
          {activeTab === "hscodes" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search HS Code, product category, or keywords (e.g. 8518, earbuds, chargers, apparel)..."
                  value={hsSearchQuery}
                  onChange={(e) => setHsSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHsCatalog.map((h) => (
                  <div
                    key={h.hsCode}
                    onClick={() => {
                      setSelectedHsCode(h.hsCode);
                      setActiveTab("calculator");
                    }}
                    className={`rounded-xl p-4 border transition-all cursor-pointer ${
                      selectedHsCode === h.hsCode
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400">{h.hsCode}</span>
                        <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{h.category}</h4>
                        <p className="text-xs text-slate-400 mt-1">{h.description}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        CD: {(h.cdRate * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        SD: {(h.sdRate * 100).toFixed(0)}%
                      </span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        VAT: {(h.vatRate * 100).toFixed(0)}%
                      </span>
                      {h.regulatoryNocRequired && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                          NOC Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: C&F Clearance Brief */}
          {activeTab === "brief" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Chittagong / Airport Port C&F Clearing Brief
                  </h3>
                  <p className="text-xs text-slate-400">
                    Printable operational manifest for clearing agent submission
                  </p>
                </div>
                <button
                  onClick={handleCopyBrief}
                  className="flex items-center space-x-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? "Copied to Clipboard!" : "Copy Brief Text"}</span>
                </button>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 font-mono text-xs text-slate-300 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center text-amber-400">
                  <span className="font-bold">BANGLADESH CUSTOMS CLEARANCE DISPATCH BRIEF</span>
                  <span>REF: CF_BRIEF_{Date.now().toString(36).toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">CONSIGNEE:</span> Shothik Merchant Enterprises
                  </div>
                  <div>
                    <span className="text-slate-500">IMPORTER BIN:</span> {importerBin}
                  </div>
                  <div>
                    <span className="text-slate-500">PORT OF ENTRY:</span> {portOfEntry.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div>
                    <span className="text-slate-500">HS CODE:</span> {currentHs.hsCode}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <div className="text-slate-500 mb-1">GOODS SPECIFICATION:</div>
                  <div>{productTitle}</div>
                  <div className="text-slate-400">
                    Quantity: {quantity} pcs | Gross Wt: {weightKg} kg | Method: {shippingMethod}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500">DECLARED FOB:</span>
                    <br />
                    {currency} {totalFobDeclared.toLocaleString()} (৳{fobBdt.toLocaleString()})
                  </div>
                  <div>
                    <span className="text-slate-500">ASSESSABLE VALUE:</span>
                    <br />৳{assessableValueBdt.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-slate-500">EST. STATUTORY DUTIES:</span>
                    <br />
                    <span className="text-amber-400 font-bold">৳{totalDutyAndTaxBdt.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <div className="text-slate-500 mb-1">MANDATORY DOCUMENT CHECKLIST:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Commercial Invoice & Packing List stamped by overseas supplier</li>
                    <li>Airway Bill (AWB) / Bill of Lading (B/L) endorsed by freight forwarder</li>
                    <li>13-Digit NBR BIN Certificate ({importerBin})</li>
                    <li>e-TIN Tax Identification Certificate</li>
                    {currentHs.regulatoryNocRequired && (
                      <li className="text-amber-300 font-semibold">{currentHs.regulatoryNocRequired}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-6 py-3.5 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Forex & Tariff Engine Online</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 font-medium transition-colors"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrossBorderCustomsModal;
