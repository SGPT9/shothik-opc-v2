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
  Package,
  Truck,
  Box,
  Users,
  Timer,
  BadgePercent,
} from "lucide-react";

export interface CollectiveBuyingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type PoolStatus =
  | "open_for_pooling"
  | "threshold_met"
  | "order_placed_at_source"
  | "in_customs_transit"
  | "arrived_at_hub"
  | "dispatched_to_merchants";

export type SourcingOrigin = "1688_guangzhou" | "yiwu_market" | "khatunganj_ctg" | "chawkbazar_dhaka";
export type ShippingMode = "sea_lcl" | "air_express" | "domestic_truckload";

export interface PoolParticipant {
  merchantId: string;
  merchantName: string;
  merchantBinOrPhone: string;
  unitsRequested: number;
  allocatedCbm: number;
  allocatedWeightKg: number;
  unitPriceBdt: number;
  totalProductValueBdt: number;
  allocatedFreightBdt: number;
  allocatedTariffBdt: number;
  hubHandlingFeeBdt: number;
  totalPayableBdt: number;
  escrowDepositPaidBdt: number;
  balanceDueBdt: number;
  deliveryAddress: string;
  paymentStatus: "escrow_locked" | "fully_settled" | "refunded";
}

export interface CollectiveBuyingPool {
  id: string;
  poolTitle: string;
  productName: string;
  productCategory: string;
  productHsCode: string;
  sourceOrigin: SourcingOrigin;
  shippingMode: ShippingMode;
  targetMoqUnits: number;
  currentPledgedUnits: number;
  unitPriceBdt: number;
  totalEstimatedPoolValueBdt: number;
  freightRatePerCbmUsd: number;
  freightRatePerKgUsd: number;
  customsDutyRatePercent: number;
  deadlineIso: string;
  status: PoolStatus;
  participants: PoolParticipant[];
  centralHubLocation: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectiveBuyingSummaryMetrics {
  totalActivePools: number;
  totalMerchantsJoined: number;
  totalCollectiveVolumeBdt: number;
  totalSavingsAchievedBdt: number;
  avgMoqFulfillmentPercent: number;
}

type TabType = "pools" | "create" | "calculator" | "splitter";

const DEFAULT_METRICS: CollectiveBuyingSummaryMetrics = {
  totalActivePools: 4,
  totalMerchantsJoined: 18,
  totalCollectiveVolumeBdt: 4250000,
  totalSavingsAchievedBdt: 1190000,
  avgMoqFulfillmentPercent: 91.2,
};

const INITIAL_POOLS: CollectiveBuyingPool[] = [
  {
    id: "POOL-2026-001",
    poolTitle: "1688 Summer Cotton Canvas Fabric & Hardware",
    productName: "High-Density 12oz Canvas Fabric Rolls",
    productCategory: "Textiles & Garment Accessories",
    productHsCode: "5209.11.00",
    sourceOrigin: "1688_guangzhou",
    shippingMode: "sea_lcl",
    targetMoqUnits: 5000,
    currentPledgedUnits: 4200,
    unitPriceBdt: 320,
    totalEstimatedPoolValueBdt: 1600000,
    freightRatePerCbmUsd: 135,
    freightRatePerKgUsd: 1.6,
    customsDutyRatePercent: 15,
    deadlineIso: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    status: "open_for_pooling",
    participants: [
      {
        merchantId: "MERCH-001",
        merchantName: "Dhanmondi Craft Studio",
        merchantBinOrPhone: "01711928374",
        unitsRequested: 1500,
        allocatedCbm: 3.0,
        allocatedWeightKg: 225,
        unitPriceBdt: 320,
        totalProductValueBdt: 480000,
        allocatedFreightBdt: 38400,
        allocatedTariffBdt: 72000,
        hubHandlingFeeBdt: 22500,
        totalPayableBdt: 612900,
        escrowDepositPaidBdt: 183870,
        balanceDueBdt: 429030,
        deliveryAddress: "House 42, Road 7/A, Dhanmondi, Dhaka",
        paymentStatus: "escrow_locked",
      },
      {
        merchantId: "MERCH-002",
        merchantName: "Mirpur Bag Crafters",
        merchantBinOrPhone: "01819283741",
        unitsRequested: 2700,
        allocatedCbm: 5.4,
        allocatedWeightKg: 405,
        unitPriceBdt: 320,
        totalProductValueBdt: 864000,
        allocatedFreightBdt: 69120,
        allocatedTariffBdt: 129600,
        hubHandlingFeeBdt: 40500,
        totalPayableBdt: 1103220,
        escrowDepositPaidBdt: 330966,
        balanceDueBdt: 772254,
        deliveryAddress: "Plot 12, Block D, Section 10, Mirpur, Dhaka",
        paymentStatus: "escrow_locked",
      },
    ],
    centralHubLocation: "Tejgaon Industrial Hub, Dhaka",
    digitalSealHash: "e190284bc91820efa123bc0914a821eef00192837bc991a288410212984bc192",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
  },
  {
    id: "POOL-2026-002",
    poolTitle: "Yiwu Premium Acrylic Cosmetic Bottles & Droppers",
    productName: "30ml Frosted Amber Glass Dropper Bottles",
    productCategory: "Cosmetics Packaging",
    productHsCode: "7010.90.00",
    sourceOrigin: "yiwu_market",
    shippingMode: "sea_lcl",
    targetMoqUnits: 10000,
    currentPledgedUnits: 10000,
    unitPriceBdt: 45,
    totalEstimatedPoolValueBdt: 450000,
    freightRatePerCbmUsd: 145,
    freightRatePerKgUsd: 1.9,
    customsDutyRatePercent: 25,
    deadlineIso: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: "threshold_met",
    participants: [
      {
        merchantId: "MERCH-003",
        merchantName: "Aura Organics BD",
        merchantBinOrPhone: "01912837465",
        unitsRequested: 5000,
        allocatedCbm: 4.5,
        allocatedWeightKg: 350,
        unitPriceBdt: 45,
        totalProductValueBdt: 225000,
        allocatedFreightBdt: 18000,
        allocatedTariffBdt: 56250,
        hubHandlingFeeBdt: 75000,
        totalPayableBdt: 374250,
        escrowDepositPaidBdt: 112275,
        balanceDueBdt: 261975,
        deliveryAddress: "Uttara Sector 11, Dhaka",
        paymentStatus: "escrow_locked",
      },
    ],
    centralHubLocation: "Chittagong Port ICD Terminal Hub",
    digitalSealHash: "f820194bc091284bc51908efa123bc0914a821eef00192837bc991a288410992",
    createdAt: "2026-08-05T09:00:00.000Z",
    updatedAt: "2026-08-10T14:30:00.000Z",
  },
];

export const CollectiveBuyingModal: React.FC<CollectiveBuyingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("pools");
  const [pools, setPools] = useState<CollectiveBuyingPool[]>(INITIAL_POOLS);
  const [metrics, setMetrics] = useState<CollectiveBuyingSummaryMetrics>(DEFAULT_METRICS);
  const [selectedPool, setSelectedPool] = useState<CollectiveBuyingPool | null>(INITIAL_POOLS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Pool
  const [poolTitle, setPoolTitle] = useState("1688 High-Performance USB-C Braided Cables");
  const [productName, setProductName] = useState("60W PD Fast Charging USB-C to Type-C Cable");
  const [productCategory, setProductCategory] = useState("Consumer Electronics Accessories");
  const [sourceOrigin, setSourceOrigin] = useState<SourcingOrigin>("1688_guangzhou");
  const [shippingMode, setShippingMode] = useState<ShippingMode>("air_express");
  const [targetMoqUnits, setTargetMoqUnits] = useState<number>(3000);
  const [unitPriceBdt, setUnitPriceBdt] = useState<number>(85);
  const [customsDutyPercent, setCustomsDutyPercent] = useState<number>(25);

  // Calculator State
  const [calcUnits, setCalcUnits] = useState<number>(5000);
  const [calcCbm, setCalcCbm] = useState<number>(8);
  const [calcFobUsd, setCalcFobUsd] = useState<number>(2.5);
  const [calcDuty, setCalcDuty] = useState<number>(25);
  const [calcResult, setCalcResult] = useState<{
    unitProductBdt: number;
    unitFreightBdt: number;
    unitTariffBdt: number;
    totalLandedBdt: number;
    savingsPercent: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `POOL-2026-00${pools.length + 1}`;
    const newPool: CollectiveBuyingPool = {
      id: newId,
      poolTitle,
      productName,
      productCategory,
      productHsCode: "8544.42.00",
      sourceOrigin,
      shippingMode,
      targetMoqUnits,
      currentPledgedUnits: 0,
      unitPriceBdt,
      totalEstimatedPoolValueBdt: targetMoqUnits * unitPriceBdt,
      freightRatePerCbmUsd: 140,
      freightRatePerKgUsd: 1.8,
      customsDutyRatePercent: customsDutyPercent,
      deadlineIso: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: "open_for_pooling",
      participants: [],
      centralHubLocation: "Tejgaon Industrial Micro-Hub, Dhaka",
      digitalSealHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPools([newPool, ...pools]);
    setSelectedPool(newPool);
    setMetrics((prev) => ({
      ...prev,
      totalActivePools: prev.totalActivePools + 1,
      totalCollectiveVolumeBdt: prev.totalCollectiveVolumeBdt + newPool.totalEstimatedPoolValueBdt,
    }));
    setActiveTab("pools");
  };

  const handleRunCalculator = () => {
    const unitFobBdt = calcFobUsd * 120;
    const totalFreightUsd = calcCbm * 140;
    const unitFreightBdt = (totalFreightUsd * 120) / calcUnits;
    const unitTariffBdt = (unitFobBdt * calcDuty) / 100;
    const totalLanded = unitFobBdt + unitFreightBdt + unitTariffBdt + 15;
    const individualLanded = totalLanded * 1.35;
    const savings = Number((((individualLanded - totalLanded) / individualLanded) * 100).toFixed(1));

    setCalcResult({
      unitProductBdt: Math.round(unitFobBdt),
      unitFreightBdt: Math.round(unitFreightBdt),
      unitTariffBdt: Math.round(unitTariffBdt),
      totalLandedBdt: Math.round(totalLanded),
      savingsPercent: savings,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Micro-Merchant Collective Buying & Freight Pooling Hub
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-full">
                  1688 / Yiwu LCL Pooling
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                  ⌘P
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bulk container freight pooling, CBM landed cost sharing, and decentralized escrow buying for micro-merchants
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
            <Layers className="w-5 h-5 text-violet-400" />
            <div>
              <div className="text-slate-400">Active Buying Pools</div>
              <div className="text-base font-bold text-white">{metrics.totalActivePools} Live Pools</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-400">Merchants Joined</div>
              <div className="text-base font-bold text-cyan-400">{metrics.totalMerchantsJoined} Solopreneurs</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">Pooled Volume</div>
              <div className="text-base font-bold text-emerald-400">
                ৳{(metrics.totalCollectiveVolumeBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <BadgePercent className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Wholesale Savings</div>
              <div className="text-base font-bold text-amber-400">
                ৳{(metrics.totalSavingsAchievedBdt / 100000).toFixed(1)} Lakh (28%)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("pools")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "pools"
                ? "border-violet-400 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            Live Buying Pools ({pools.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-violet-400 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            Start New Collective Pool
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "calculator"
                ? "border-violet-400 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            CBM Freight & Landed Cost Allocator
          </button>
          <button
            onClick={() => setActiveTab("splitter")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "splitter"
                ? "border-violet-400 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Truck className="w-4 h-4" />
            Central Hub Parcel Splitter
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {/* TAB 1: Live Buying Pools */}
          {activeTab === "pools" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">
                  Active B2B Collective Buying Pools
                </h3>
                <button
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-500 hover:bg-violet-400 text-slate-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Launch Buying Pool
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pools.map((p) => {
                  const progress = Math.min(100, Math.round((p.currentPledgedUnits / p.targetMoqUnits) * 100));
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPool(p)}
                      className={`p-4 rounded-xl bg-slate-900 border cursor-pointer transition-all hover:shadow-lg ${
                        selectedPool?.id === p.id ? "border-violet-400" : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-violet-400 rounded">
                            {p.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              p.status === "threshold_met"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-violet-400">
                          ৳{p.unitPriceBdt}/unit
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{p.poolTitle}</h4>
                      <p className="text-xs text-slate-400 mb-3">{p.productName}</p>

                      {/* MOQ Progress Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="text-slate-400">MOQ Target: {p.targetMoqUnits.toLocaleString()} Units</span>
                          <span className="font-bold text-violet-400">{progress}% Funded</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs space-y-1 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Origin / Shipping:</span>
                          <span className="font-medium text-slate-200">{p.sourceOrigin} ({p.shippingMode})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Merchants Pledged:</span>
                          <span className="font-semibold text-emerald-400">{p.participants.length} Merchants</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Central Hub:</span>
                          <span className="text-slate-300">{p.centralHubLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 text-emerald-400 font-mono">
                          <Lock className="w-3 h-3" /> Seal: {p.digitalSealHash.slice(0, 10)}...
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(p.digitalSealHash, p.id);
                          }}
                          className="flex items-center gap-1 text-slate-400 hover:text-white"
                        >
                          {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy Hash
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: New Collective Pool Creator */}
          {activeTab === "create" && (
            <form onSubmit={handleCreatePool} className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-violet-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Autonomous Collective Escrow Safeguard:</span> Micro-merchants deposit 30% advance escrow margin via bKash/Nagad. Funds remain locked in smart escrow until the pool reaches 100% MOQ, after which the 1688 order is automatically placed.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Collective Buying Pool Title
                  </label>
                  <input
                    type="text"
                    value={poolTitle}
                    onChange={(e) => setPoolTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Product Name & Specification
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sourcing Origin
                  </label>
                  <select
                    value={sourceOrigin}
                    onChange={(e) => setSourceOrigin(e.target.value as SourcingOrigin)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="1688_guangzhou">1688 Guangzhou Direct</option>
                    <option value="yiwu_market">Yiwu International Trade City</option>
                    <option value="khatunganj_ctg">Khatunganj Commodity Hub (Chittagong)</option>
                    <option value="chawkbazar_dhaka">Chawkbazar Wholesale Hub (Dhaka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Shipping Mode
                  </label>
                  <select
                    value={shippingMode}
                    onChange={(e) => setShippingMode(e.target.value as ShippingMode)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="sea_lcl">Sea Freight LCL (18-24 Days)</option>
                    <option value="air_express">Air Express (5-7 Days)</option>
                    <option value="domestic_truckload">Domestic Covered Van Truckload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target MOQ (Units)
                  </label>
                  <input
                    type="number"
                    value={targetMoqUnits}
                    onChange={(e) => setTargetMoqUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estimated Landed Unit Price (BDT)
                  </label>
                  <input
                    type="number"
                    value={unitPriceBdt}
                    onChange={(e) => setUnitPriceBdt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estimated NBR Duty Rate (%)
                  </label>
                  <input
                    type="number"
                    value={customsDutyPercent}
                    onChange={(e) => setCustomsDutyPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("pools")}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-violet-500 to-violet-400 text-slate-950 hover:from-violet-400 hover:to-violet-300 rounded-xl shadow-lg shadow-violet-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Publish Collective Buying Pool & Generate SHA-256 Seal
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CBM Freight & Landed Cost Allocator */}
          {activeTab === "calculator" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-violet-400" /> Volumetric CBM & Landed Cost Allocator
                </h3>
                <p className="text-slate-400">
                  Computes exact landed cost per unit when micro-merchants pool orders into a single container vs individual LCL shipments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Total Pool Units</label>
                    <input
                      type="number"
                      value={calcUnits}
                      onChange={(e) => setCalcUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Total Consignment Volume (CBM)</label>
                    <input
                      type="number"
                      value={calcCbm}
                      onChange={(e) => setCalcCbm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">FOB Source Price (USD/Unit)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcFobUsd}
                      onChange={(e) => setCalcFobUsd(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">NBR Customs Duty Rate (%)</label>
                    <input
                      type="number"
                      value={calcDuty}
                      onChange={(e) => setCalcDuty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunCalculator}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Calculate Pooled Landed Cost
                  </button>
                </div>

                {calcResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Wholesale Pooling Advantage:</span>
                      <span className="font-bold text-emerald-400 text-sm">{calcResult.savingsPercent}% CHEAPER</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Product FOB</div>
                        <div className="font-bold text-white mt-0.5">৳{calcResult.unitProductBdt}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Pooled Freight/Unit</div>
                        <div className="font-bold text-cyan-400 mt-0.5">৳{calcResult.unitFreightBdt}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Customs Tariff/Unit</div>
                        <div className="font-bold text-amber-400 mt-0.5">৳{calcResult.unitTariffBdt}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-300 font-semibold">Total Landed Cost / Unit (Dhaka Hub):</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        ৳{calcResult.totalLandedBdt}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Central Hub Parcel Splitter */}
          {activeTab === "splitter" && (
            <div className="space-y-4 max-w-3xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-violet-400" /> Domestic Hub Unboxing & Courier Dispatch
                </h3>
                <p className="text-slate-400">
                  When bulk sea container arrives at Central Dhaka/Chittagong micro-hub, orders are unboxed, verified, and dispatched via Steadfast/Pathao with automated barcode labels.
                </p>

                <div className="space-y-2 pt-2">
                  {selectedPool?.participants.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{m.merchantName} ({m.unitsRequested} Units)</div>
                        <div className="text-slate-400 text-[11px]">{m.deliveryAddress}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-cyan-400 rounded">
                          Steadfast Parcel Ready
                        </span>
                        <button className="px-2.5 py-1 bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-[11px] rounded transition-colors">
                          Dispatch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>Decentralized Escrow Sourcing & CBM Freight Allocator Active</span>
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

export default CollectiveBuyingModal;
