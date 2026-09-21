import React, { useState, useEffect } from "react";
import {
  Factory,
  Layers,
  Building2,
  FileText,
  ShieldCheck,
  TrendingDown,
  Percent,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  X,
  Copy,
  Check,
  Sparkles,
  Award,
  ArrowRight,
  Sliders,
  DollarSign,
  Package,
  Globe2,
  Briefcase
} from "lucide-react";

interface WholesaleRfqEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "hubs_directory" | "rfq_creator" | "bids_evaluator" | "escrow_contract" | "volume_simulator";

interface WholesaleSupplier {
  id: string;
  name: string;
  hub: "chawkbazar" | "islampur" | "keraniganj" | "tongi_industrial" | "crossborder_1688";
  category: "textiles" | "packaging" | "cosmetics_hardware" | "apparel" | "electronics_raw";
  reliabilityScore: number;
  qualityRating: number;
  onTimeDeliveryRate: number;
  disputeRate: number;
  verifiedTradeLicence: string;
  phone: string;
  address: string;
  establishedYear: number;
  averageLeadTimeDays: number;
}

interface VolumePriceTier {
  minQty: number;
  maxQty?: number;
  unitPriceBdt: number;
  discountPercent: number;
  totalCostBdt: number;
  marginalSavingsBdt: number;
}

interface RfqDraft {
  rfqId: string;
  title: string;
  hub: string;
  category: string;
  skuName: string;
  specifications: string;
  targetQuantity: number;
  maxBudgetBdt: number;
  deliverySlaDays: number;
  sampleRequired: boolean;
  incoterm: "ex_factory" | "fob_dhaka" | "ddp_warehouse";
  volumeTiers: VolumePriceTier[];
  sha256Seal: string;
  createdAt: string;
}

interface SupplierBid {
  bidId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  hub: string;
  unitPriceBdt: number;
  volumeTiers: VolumePriceTier[];
  leadTimeDays: number;
  sampleFeeBdt: number;
  moq: number;
  compositeScore: number;
  recommended: boolean;
  bidNotes: string;
}

interface MilestoneEscrowContract {
  contractId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  buyerName: string;
  skuName: string;
  totalQuantity: number;
  unitPriceBdt: number;
  totalContractValueBdt: number;
  incoterm: string;
  milestones: {
    milestoneIndex: number;
    title: string;
    percentage: number;
    amountBdt: number;
    triggerCondition: string;
    status: "pending" | "funded" | "released" | "disputed";
  }[];
  sha256Seal: string;
  arbitrationJurisdiction: string;
  defectLiabilityDays: number;
  createdAt: string;
}

export const WholesaleRfqEscrowModal: React.FC<WholesaleRfqEscrowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("hubs_directory");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Suppliers & Hubs
  const [suppliers, setSuppliers] = useState<WholesaleSupplier[]>([
    {
      id: "SUP_CHAWK_01",
      name: "M/S Al-Madina Hardware & Moulding Complex",
      hub: "chawkbazar",
      category: "cosmetics_hardware",
      reliabilityScore: 94.5,
      qualityRating: 92.0,
      onTimeDeliveryRate: 95.0,
      disputeRate: 1.2,
      verifiedTradeLicence: "TRAD/DSCC/019283/2022",
      phone: "+8801711998877",
      address: "42/A Water Works Road, Chawkbazar, Dhaka 1211",
      establishedYear: 2008,
      averageLeadTimeDays: 7
    },
    {
      id: "SUP_ISLAM_01",
      name: "Bismillah Silk & Cotton Mills Ltd.",
      hub: "islampur",
      category: "textiles",
      reliabilityScore: 96.2,
      qualityRating: 95.5,
      onTimeDeliveryRate: 96.0,
      disputeRate: 0.8,
      verifiedTradeLicence: "TRAD/DSCC/048821/2019",
      phone: "+8801819223344",
      address: "88 Islampur Road, Lalbagh, Dhaka 1100",
      establishedYear: 2004,
      averageLeadTimeDays: 10
    },
    {
      id: "SUP_KERAN_01",
      name: "Bengal Stitch & Garments Syndicate",
      hub: "keraniganj",
      category: "apparel",
      reliabilityScore: 91.8,
      qualityRating: 89.5,
      onTimeDeliveryRate: 93.0,
      disputeRate: 2.1,
      verifiedTradeLicence: "TRAD/KERAN/002914/2021",
      phone: "+8801912445566",
      address: "East Aganagar, South Keraniganj, Dhaka 1310",
      establishedYear: 2012,
      averageLeadTimeDays: 14
    },
    {
      id: "SUP_TONGI_01",
      name: "Apex Corrugated Packaging & Paper Mills",
      hub: "tongi_industrial",
      category: "packaging",
      reliabilityScore: 97.4,
      qualityRating: 96.0,
      onTimeDeliveryRate: 98.0,
      disputeRate: 0.4,
      verifiedTradeLicence: "TRAD/GCC/099182/2018",
      phone: "+8801700112233",
      address: "Plot 14-16, Tongi I/A, Gazipur 1710",
      establishedYear: 2001,
      averageLeadTimeDays: 5
    },
    {
      id: "SUP_1688_01",
      name: "Shenzhen MicroTech Sourcing (Dhaka Desk)",
      hub: "crossborder_1688",
      category: "electronics_raw",
      reliabilityScore: 93.0,
      qualityRating: 94.0,
      onTimeDeliveryRate: 91.0,
      disputeRate: 1.8,
      verifiedTradeLicence: "TRAD/DNCC/110293/2023",
      phone: "+8801311002299",
      address: "Level 6, Uttara Sector 3, Dhaka (China Desk)",
      establishedYear: 2017,
      averageLeadTimeDays: 21
    }
  ]);

  const [hubsOverview, setHubsOverview] = useState<any[]>([
    {
      id: "chawkbazar",
      name: "Chawkbazar Wholesale Hub",
      location: "Old Dhaka",
      specialty: "Plastics, Hardware, Cosmetic Bottles, Jars",
      activeSuppliersCount: 420,
      averageLeadTimeDays: 5,
      priceAdvantageVsRetail: "40% - 65% below retail"
    },
    {
      id: "islampur",
      name: "Islampur Textile District",
      location: "Old Dhaka",
      specialty: "Cotton, Georgette, Denim, Silk Fabrics",
      activeSuppliersCount: 680,
      averageLeadTimeDays: 7,
      priceAdvantageVsRetail: "35% - 55% below retail"
    },
    {
      id: "keraniganj",
      name: "Keraniganj Garment Cluster",
      location: "South Keraniganj",
      specialty: "Ready-Made Garments, Jeans, Panjabis",
      activeSuppliersCount: 1250,
      averageLeadTimeDays: 12,
      priceAdvantageVsRetail: "50% - 70% below brand retail"
    },
    {
      id: "tongi_industrial",
      name: "Tongi Packaging Belt",
      location: "Gazipur",
      specialty: "Master Cartons, Poly Mailers, Bulk Boxes",
      activeSuppliersCount: 310,
      averageLeadTimeDays: 6,
      priceAdvantageVsRetail: "30% - 45% factory direct"
    },
    {
      id: "crossborder_1688",
      name: "1688 / Yiwu Factory Import Gateway",
      location: "China -> BD Port",
      specialty: "Microcontrollers, Tooling, Smart Gadgets",
      activeSuppliersCount: 5400,
      averageLeadTimeDays: 18,
      priceAdvantageVsRetail: "60% - 80% source factory FOB"
    }
  ]);

  // RFQ Creator State
  const [rfqTitle, setRfqTitle] = useState("Bulk 100% Combed Cotton Single Jersey (180 GSM)");
  const [rfqHub, setRfqHub] = useState<string>("islampur");
  const [rfqCategory, setRfqCategory] = useState<string>("textiles");
  const [rfqSku, setRfqSku] = useState("SKU-COTTON-180GSM");
  const [rfqSpecs, setRfqSpecs] = useState("100% Combed Cotton, Bio-washed, Reactive dyed jet black, color fastness 4+");
  const [rfqQty, setRfqQty] = useState(1000);
  const [rfqBasePrice, setRfqBasePrice] = useState(420);
  const [rfqSlaDays, setRfqSlaDays] = useState(10);
  const [rfqSampleRequired, setRfqSampleRequired] = useState(true);
  const [rfqIncoterm, setRfqIncoterm] = useState<"ex_factory" | "fob_dhaka" | "ddp_warehouse">("ddp_warehouse");

  // Generated RFQ Draft
  const [currentRfq, setCurrentRfq] = useState<RfqDraft>({
    rfqId: "RFQ_SAMPLE_89B2",
    title: "Bulk 100% Combed Cotton Single Jersey (180 GSM)",
    hub: "islampur",
    category: "textiles",
    skuName: "SKU-COTTON-180GSM",
    specifications: "100% Combed Cotton, Bio-washed, Reactive dyed jet black",
    targetQuantity: 1000,
    maxBudgetBdt: 420000,
    deliverySlaDays: 10,
    sampleRequired: true,
    incoterm: "ddp_warehouse",
    volumeTiers: [
      { minQty: 200, maxQty: 399, unitPriceBdt: 420, discountPercent: 0, totalCostBdt: 84000, marginalSavingsBdt: 0 },
      { minQty: 400, maxQty: 999, unitPriceBdt: 394.8, discountPercent: 6, totalCostBdt: 157920, marginalSavingsBdt: 10080 },
      { minQty: 1000, maxQty: 1999, unitPriceBdt: 369.6, discountPercent: 12, totalCostBdt: 369600, marginalSavingsBdt: 50400 },
      { minQty: 2000, maxQty: undefined, unitPriceBdt: 336, discountPercent: 20, totalCostBdt: 672000, marginalSavingsBdt: 168000 }
    ],
    sha256Seal: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    createdAt: new Date().toISOString()
  });

  // Bids & Ranking
  const [rankedBids, setRankedBids] = useState<SupplierBid[]>([
    {
      bidId: "BID_ISLAM_01",
      rfqId: "RFQ_SAMPLE_89B2",
      supplierId: "SUP_ISLAM_01",
      supplierName: "Bismillah Silk & Cotton Mills Ltd.",
      hub: "islampur",
      unitPriceBdt: 375,
      volumeTiers: [
        { minQty: 200, maxQty: 399, unitPriceBdt: 375, discountPercent: 0, totalCostBdt: 75000, marginalSavingsBdt: 0 },
        { minQty: 400, maxQty: 999, unitPriceBdt: 352.5, discountPercent: 6, totalCostBdt: 141000, marginalSavingsBdt: 9000 },
        { minQty: 1000, maxQty: undefined, unitPriceBdt: 330, discountPercent: 12, totalCostBdt: 330000, marginalSavingsBdt: 45000 }
      ],
      leadTimeDays: 8,
      sampleFeeBdt: 800,
      moq: 200,
      compositeScore: 95.8,
      recommended: true,
      bidNotes: "Direct mill pricing from Islampur. Includes standard lab dip & yarn shrinkage report."
    },
    {
      bidId: "BID_CHAWK_01",
      rfqId: "RFQ_SAMPLE_89B2",
      supplierId: "SUP_CHAWK_01",
      supplierName: "M/S Al-Madina Hardware & Moulding",
      hub: "chawkbazar",
      unitPriceBdt: 390,
      volumeTiers: [
        { minQty: 200, maxQty: 399, unitPriceBdt: 390, discountPercent: 0, totalCostBdt: 78000, marginalSavingsBdt: 0 },
        { minQty: 400, maxQty: undefined, unitPriceBdt: 366.6, discountPercent: 6, totalCostBdt: 146640, marginalSavingsBdt: 9360 }
      ],
      leadTimeDays: 11,
      sampleFeeBdt: 600,
      moq: 200,
      compositeScore: 89.2,
      recommended: false,
      bidNotes: "Trader quote with stock ready for quick dispatch."
    }
  ]);

  // Escrow Contract
  const [escrowContract, setEscrowContract] = useState<MilestoneEscrowContract>({
    contractId: "CTR_ESCROW_ISLAM_7821",
    rfqId: "RFQ_SAMPLE_89B2",
    supplierId: "SUP_ISLAM_01",
    supplierName: "Bismillah Silk & Cotton Mills Ltd.",
    buyerName: "Shothik D2C Apparel Ltd.",
    skuName: "SKU-COTTON-180GSM",
    totalQuantity: 1000,
    unitPriceBdt: 375,
    totalContractValueBdt: 375000,
    incoterm: "ddp_warehouse",
    milestones: [
      {
        milestoneIndex: 1,
        title: "Milestone 1: Raw Material Procurement & Production Kickoff",
        percentage: 30,
        amountBdt: 112500,
        triggerCondition: "Advance deposit funded into Shothik Escrow Vault.",
        status: "funded"
      },
      {
        milestoneIndex: 2,
        title: "Milestone 2: Pre-Shipment Quality Inspection (QC) Pass",
        percentage: 40,
        amountBdt: 150000,
        triggerCondition: "Approval of golden batch production sample / lab test report.",
        status: "pending"
      },
      {
        milestoneIndex: 3,
        title: "Milestone 3: Final Warehouse Delivery & Physical Tally",
        percentage: 30,
        amountBdt: 112500,
        triggerCondition: "Physical verification and goods receipt note (GRN) generated at Buyer warehouse.",
        status: "pending"
      }
    ],
    sha256Seal: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    arbitrationJurisdiction: "Dhaka, Bangladesh (Arbitration Act 2001)",
    defectLiabilityDays: 30,
    createdAt: new Date().toISOString()
  });

  // Simulator Slider
  const [simQty, setSimQty] = useState(1500);
  const [simBasePrice, setSimBasePrice] = useState(400);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/v1/wholesale/suppliers");
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers) setSuppliers(data.suppliers);
      }
    } catch {
      // Offline fallback
    }
  };

  const fetchHubs = async () => {
    try {
      const res = await fetch("/api/v1/wholesale/hubs/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.hubs) setHubsOverview(data.hubs);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchHubs();
    }
  }, [isOpen]);

  const handleGenerateRfq = async () => {
    try {
      const res = await fetch("/api/v1/wholesale/rfq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rfqTitle,
          hub: rfqHub,
          category: rfqCategory,
          skuName: rfqSku,
          specifications: rfqSpecs,
          targetQuantity: rfqQty,
          estimatedBasePriceBdt: rfqBasePrice,
          deliverySlaDays: rfqSlaDays,
          sampleRequired: rfqSampleRequired,
          incoterm: rfqIncoterm
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rfq) {
          setCurrentRfq(data.rfq);
          handleEvaluateBids(data.rfq);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleEvaluateBids = async (rfqToEval: RfqDraft) => {
    try {
      const res = await fetch("/api/v1/wholesale/rfq/evaluate-bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq: rfqToEval })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.evaluation && data.evaluation.rankedBids) {
          setRankedBids(data.evaluation.rankedBids);
          setActiveTab("bids_evaluator");
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleCompileContract = async (bid: SupplierBid) => {
    try {
      const res = await fetch("/api/v1/wholesale/escrow/compile-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfq: currentRfq,
          bid,
          buyerName: "Shothik D2C Commerce Ltd."
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.contract) {
          setEscrowContract(data.contract);
          setActiveTab("escrow_contract");
        }
      }
    } catch {
      // Fallback
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  // Simulator calculations
  const getSimDiscountPercent = (qty: number) => {
    if (qty >= 5000) return 22;
    if (qty >= 2000) return 18;
    if (qty >= 1000) return 12;
    if (qty >= 500) return 6;
    return 0;
  };
  const simDiscount = getSimDiscountPercent(simQty);
  const simEffectiveUnitPrice = Math.round(simBasePrice * (1 - simDiscount / 100) * 100) / 100;
  const simTotalCost = Math.round(simEffectiveUnitPrice * simQty);
  const simGrossSavings = Math.round((simBasePrice - simEffectiveUnitPrice) * simQty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Factory className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Autonomous Wholesale RFQ & B2B Escrow Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Slice 39
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chawkbazar • Islampur • Keraniganj • Tongi • 1688 Cross-Border Price Discovery & 3-Stage Milestone Escrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchSuppliers();
                fetchHubs();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/30 gap-1 overflow-x-auto">
          {[
            { id: "hubs_directory", label: "Wholesale Hubs & Suppliers", icon: Building2 },
            { id: "rfq_creator", label: "Generate B2B RFQ", icon: FileText },
            { id: "bids_evaluator", label: "Supplier Bids & SRI Ranker", icon: Award },
            { id: "escrow_contract", label: "Milestone Escrow Agreement", icon: ShieldCheck },
            { id: "volume_simulator", label: "Volume Curve Simulator", icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-amber-500 text-amber-400 bg-amber-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Hubs & Verified Suppliers Directory */}
          {activeTab === "hubs_directory" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Major Commercial Wholesale Hubs in Bangladesh & Cross-Border
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {hubsOverview.map((hub) => (
                    <div
                      key={hub.id}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-400">{hub.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {hub.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mb-2">{hub.specialty}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                        <div className="flex justify-between">
                          <span>Active Suppliers:</span>
                          <span className="text-white font-semibold">{hub.activeSuppliersCount}+</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Lead Time:</span>
                          <span className="text-amber-300 font-semibold">{hub.averageLeadTimeDays} days</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                          {hub.priceAdvantageVsRetail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Verified Wholesale Supplier Directory
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing {suppliers.length} verified vendors with active Trade Licences
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suppliers.map((sup) => (
                    <div
                      key={sup.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{sup.name}</h4>
                          <p className="text-xs text-slate-400">{sup.address}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Award className="w-3 h-3" />
                            SRI: {sup.reliabilityScore}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Est. {sup.establishedYear}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Quality Rating</span>
                          <span className="font-semibold text-slate-200">{sup.qualityRating}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">On-Time SLA</span>
                          <span className="font-semibold text-emerald-400">{sup.onTimeDeliveryRate}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Dispute Rate</span>
                          <span className="font-semibold text-amber-400">{sup.disputeRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                        <span className="font-mono text-[11px] text-slate-300">
                          Trade Lic: {sup.verifiedTradeLicence}
                        </span>
                        <button
                          onClick={() => {
                            setRfqHub(sup.hub);
                            setRfqCategory(sup.category);
                            setActiveTab("rfq_creator");
                          }}
                          className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold transition-colors text-xs"
                        >
                          Request RFQ &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Generate B2B RFQ */}
          {activeTab === "rfq_creator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Request For Quotation (RFQ) Parameters
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">RFQ Title / Project Name</label>
                    <input
                      type="text"
                      value={rfqTitle}
                      onChange={(e) => setRfqTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Wholesale Hub</label>
                      <select
                        value={rfqHub}
                        onChange={(e) => setRfqHub(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="chawkbazar">Chawkbazar (Plastics / Bottles / Tools)</option>
                        <option value="islampur">Islampur (Cotton / Silk / Textiles)</option>
                        <option value="keraniganj">Keraniganj (RMG / Apparel / Denim)</option>
                        <option value="tongi_industrial">Tongi (Packaging / Cartons)</option>
                        <option value="crossborder_1688">1688 Cross-Border (Electronics / Modules)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Product Category</label>
                      <select
                        value={rfqCategory}
                        onChange={(e) => setRfqCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="textiles">Textiles & Fabrics</option>
                        <option value="packaging">Packaging & Corrugated</option>
                        <option value="cosmetics_hardware">Cosmetics Bottles & Hardware</option>
                        <option value="apparel">Ready-Made Garments (RMG)</option>
                        <option value="electronics_raw">Electronics Components</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">SKU Name / Identifier</label>
                      <input
                        type="text"
                        value={rfqSku}
                        onChange={(e) => setRfqSku(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Incoterm Delivery Condition</label>
                      <select
                        value={rfqIncoterm}
                        onChange={(e) => setRfqIncoterm(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="ddp_warehouse">DDP (Delivered Duty Paid at Warehouse)</option>
                        <option value="ex_factory">Ex-Factory (Buyer Picks Up from Mill)</option>
                        <option value="fob_dhaka">FOB Dhaka / Port (Carrier Loaded)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Technical Specifications & Quality Requirements</label>
                    <textarea
                      rows={3}
                      value={rfqSpecs}
                      onChange={(e) => setRfqSpecs(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Target Quantity</label>
                      <input
                        type="number"
                        value={rfqQty}
                        onChange={(e) => setRfqQty(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Est. Base Price (BDT)</label>
                      <input
                        type="number"
                        value={rfqBasePrice}
                        onChange={(e) => setRfqBasePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Target SLA (Days)</label>
                      <input
                        type="number"
                        value={rfqSlaDays}
                        onChange={(e) => setRfqSlaDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateRfq}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Publish RFQ & Broadcast to Verified Mill Suppliers
                  </button>
                </div>
              </div>

              {/* Live Volume Curve Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                      Volume Discount Curve & Price Tiers
                    </h3>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ID: {currentRfq.rfqId}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Volume Tier</th>
                          <th className="py-2.5 px-3">Unit Price</th>
                          <th className="py-2.5 px-3">Discount</th>
                          <th className="py-2.5 px-3">Total Cost</th>
                          <th className="py-2.5 px-3">Marginal Savings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentRfq.volumeTiers.map((tier, i) => (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-medium text-slate-300">
                              {tier.minQty} - {tier.maxQty ? tier.maxQty : "+"} units
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">৳{tier.unitPriceBdt}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-400">{tier.discountPercent}% OFF</td>
                            <td className="py-2.5 px-3 text-slate-300">৳{tier.totalCostBdt.toLocaleString()}</td>
                            <td className="py-2.5 px-3 font-semibold text-emerald-300">
                              +৳{tier.marginalSavingsBdt.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Max Estimated Budget:</span>
                      <span className="text-white font-bold">৳{currentRfq.maxBudgetBdt.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cryptographic Integrity Seal:</span>
                      <span className="font-mono text-[10px] text-slate-300">
                        {currentRfq.sha256Seal.slice(0, 24)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Supplier Bids & SRI Ranker */}
          {activeTab === "bids_evaluator" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Competing Mill Quotations for RFQ ({currentRfq.title})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ranked automatically using Supplier Reliability Index (SRI: Quality 35%, SLA 30%, Price 20%, Dispute 15%)
                  </p>
                </div>
                <button
                  onClick={() => handleEvaluateBids(currentRfq)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-evaluate Bids
                </button>
              </div>

              <div className="space-y-4">
                {rankedBids.map((bid, index) => (
                  <div
                    key={bid.bidId}
                    className={`p-5 rounded-xl border transition-all ${
                      bid.recommended
                        ? "bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10"
                        : "bg-slate-900/50 border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            #{index + 1}
                          </span>
                          <h4 className="text-base font-bold text-white">{bid.supplierName}</h4>
                          {bid.recommended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                              <Sparkles className="w-3 h-3" />
                              TOP RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{bid.bidNotes}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Unit Quotation</span>
                          <span className="text-lg font-extrabold text-white">৳{bid.unitPriceBdt}</span>
                          <span className="text-[10px] text-slate-400 block">MOQ: {bid.moq} units</span>
                        </div>
                        <div className="text-right pl-4 border-l border-slate-800">
                          <span className="text-xs text-slate-400 block">SRI Score</span>
                          <span className="text-lg font-extrabold text-emerald-400">{bid.compositeScore}</span>
                          <span className="text-[10px] text-slate-400 block">Lead: {bid.leadTimeDays}d</span>
                        </div>
                        <button
                          onClick={() => handleCompileContract(bid)}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Compile Escrow &rarr;
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">Sample Evaluation Fee</span>
                        <span className="font-semibold text-slate-200">৳{bid.sampleFeeBdt}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">Wholesale Hub Origin</span>
                        <span className="font-semibold text-amber-300 uppercase">{bid.hub}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">Total Commitment ({currentRfq.targetQuantity} units)</span>
                        <span className="font-semibold text-white">
                          ৳{(bid.unitPriceBdt * currentRfq.targetQuantity).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] text-slate-500 block">Max Volume Discount</span>
                        <span className="font-semibold text-emerald-400">
                          {bid.volumeTiers[bid.volumeTiers.length - 1]?.discountPercent || 12}% OFF
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Milestone Escrow Contract */}
          {activeTab === "escrow_contract" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Bilingual 3-Stage Milestone Escrow Agreement</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        Digitally Enforceable
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Governed under Bangladesh Arbitration Act 2001 with Shothik Escrow Vault Guarantee
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                    <span>Contract ID:</span>
                    <span className="text-amber-300 font-semibold">{escrowContract.contractId}</span>
                    <button
                      onClick={() => copyToClipboard(escrowContract.contractId, "contractId")}
                      className="p-1 hover:text-white"
                    >
                      {copiedId === "contractId" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Buyer (Merchant)</span>
                    <span className="font-bold text-white">{escrowContract.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Supplier (Mill)</span>
                    <span className="font-bold text-amber-300">{escrowContract.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Order Volume</span>
                    <span className="font-bold text-white">
                      {escrowContract.totalQuantity.toLocaleString()}x {escrowContract.skuName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Escrow Value</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ৳{escrowContract.totalContractValueBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3 Milestones */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Milestone Disbursement Schedule (30% &rarr; 40% &rarr; 30%)
                  </h4>
                  {escrowContract.milestones.map((m) => (
                    <div
                      key={m.milestoneIndex}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                            {m.milestoneIndex}
                          </span>
                          <h5 className="text-sm font-bold text-white">{m.title}</h5>
                        </div>
                        <p className="text-xs text-slate-400">{m.triggerCondition}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">{m.percentage}% Release</span>
                          <span className="text-sm font-bold text-white">৳{m.amountBdt.toLocaleString()}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold capitalize ${
                            m.status === "funded"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Arbitration Jurisdiction:</span>
                    <span className="text-slate-200 font-medium">{escrowContract.arbitrationJurisdiction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defect Liability Period:</span>
                    <span className="text-emerald-400 font-medium">
                      {escrowContract.defectLiabilityDays} Days Post-Delivery
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                    <span>Digital Contract SHA-256 Seal:</span>
                    <span className="font-mono text-[10px] text-amber-300">
                      {escrowContract.sha256Seal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Volume Curve Simulator */}
          {activeTab === "volume_simulator" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    Dynamic Volume Discount & Margin Simulator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate wholesale scale economies and predict unit cost reduction across order sizes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Order Quantity:</span>
                        <span className="text-amber-400 font-bold text-sm">{simQty.toLocaleString()} units</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={simQty}
                        onChange={(e) => setSimQty(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>100 MOQ</span>
                        <span>1,000 (Bulk)</span>
                        <span>5,000 (Factory Run)</span>
                        <span>10,000+ (Direct Mill)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Base Benchmark Unit Price (BDT)</label>
                      <input
                        type="number"
                        value={simBasePrice}
                        onChange={(e) => setSimBasePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Output KPI Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase">Simulated Unit Price</span>
                      <span className="text-xl font-extrabold text-emerald-400">৳{simEffectiveUnitPrice}</span>
                      <span className="text-[10px] text-emerald-300 block mt-1">
                        {simDiscount}% Volume Discount
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase">Total Capital Commitment</span>
                      <span className="text-xl font-extrabold text-white">৳{simTotalCost.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        For {simQty.toLocaleString()} units
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 col-span-2">
                      <span className="text-[10px] text-slate-500 block uppercase">Wholesale Arbitrage Savings</span>
                      <span className="text-xl font-extrabold text-amber-300">
                        +৳{simGrossSavings.toLocaleString()}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Direct margin improvement gained through consolidated wholesale volume procurement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Wholesale Price Discovery & Escrow Vault Active</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              Shortcut: ⌘W / Ctrl+W
            </kbd>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleRfqEscrowModal;
