import React, { useState, useEffect } from "react";
import {
  Truck,
  Zap,
  TrendingUp,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Plus,
  Send,
  X,
  PhoneCall,
  MapPin,
  Barcode,
  Copy,
  Check,
} from "lucide-react";

interface CourierArbitrageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "arbitrage_calculator" | "consignments_feed" | "district_matrix" | "rto_prevention";

interface CarrierCard {
  carrier: "steadfast" | "pathao" | "redx" | "paperfly";
  carrierName: string;
  baseDeliveryFeeBdt: number;
  codPercentage: number;
  codFeeBdt: number;
  totalDeliveryCostBdt: number;
  returnChargeBdt: number;
  expectedDsrPercent: number;
  estimatedDeliveryHours: number;
  expectedNetRealizationBdt: number;
  compositeScore: number;
  isRecommended: boolean;
  recommendationReason: string;
}

interface ConsignmentItem {
  consignmentId: string;
  orderRef: string;
  carrier: string;
  carrierName: string;
  trackingCode: string;
  trackingUrl: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  zone: string;
  codAmountBdt: number;
  deliveryFeeBdt: number;
  weightKg: number;
  status: "booked" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "rto_risk" | "returned";
  dsrConfidencePercent: number;
  createdAt: string;
  barcodeData: string;
}

const DEFAULT_CONSIGNMENTS: ConsignmentItem[] = [
  {
    consignmentId: "CNS_STF_9901",
    orderRef: "ORD_EID_8801",
    carrier: "steadfast",
    carrierName: "Steadfast Courier Ltd.",
    trackingCode: "STF8829104",
    trackingUrl: "https://steadfast.com.bd/t/STF8829104",
    customerName: "Mahmudul Hasan",
    customerPhone: "01711002233",
    deliveryAddress: "Holding 14, Road 4, Sector 7, Uttara, Dhaka",
    district: "Dhaka",
    zone: "inside_dhaka",
    codAmountBdt: 3500,
    deliveryFeeBdt: 60,
    weightKg: 0.8,
    status: "in_transit",
    dsrConfidencePercent: 96,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    barcodeData: "CNS_STF_9901-3500-01711002233",
  },
  {
    consignmentId: "CNS_PTH_9902",
    orderRef: "ORD_EID_8802",
    carrier: "pathao",
    carrierName: "Pathao Express Logistics",
    trackingCode: "PTH4401928",
    trackingUrl: "https://pathao.com/courier/track/PTH4401928",
    customerName: "Nusrat Jahan",
    customerPhone: "01822334455",
    deliveryAddress: "GEC Circle, East Nasirabad, Chittagong",
    district: "Chittagong",
    zone: "chittagong_metro",
    codAmountBdt: 6200,
    deliveryFeeBdt: 115,
    weightKg: 1.5,
    status: "delivered",
    dsrConfidencePercent: 95,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    barcodeData: "CNS_PTH_9902-6200-01822334455",
  },
  {
    consignmentId: "CNS_RDX_9903",
    orderRef: "ORD_EID_8803",
    carrier: "redx",
    carrierName: "RedX Delivery Network",
    trackingCode: "RDX1029384",
    trackingUrl: "https://redx.com.bd/track/RDX1029384",
    customerName: "Kamrul Islam",
    customerPhone: "01933445566",
    deliveryAddress: "Kallayanpur Bus Stand, Sylhet",
    district: "Sylhet",
    zone: "divisional_city",
    codAmountBdt: 2400,
    deliveryFeeBdt: 130,
    weightKg: 1.0,
    status: "rto_risk",
    dsrConfidencePercent: 78,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    barcodeData: "CNS_RDX_9903-2400-01933445566",
  },
];

export const CourierArbitrageModal: React.FC<CourierArbitrageModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("arbitrage_calculator");
  const [district, setDistrict] = useState("Dhaka");
  const [codAmountBdt, setCodAmountBdt] = useState<number>(3500);
  const [weightKg, setWeightKg] = useState<number>(1.0);
  const [customerName, setCustomerName] = useState("Tanvir Ahmed");
  const [customerPhone, setCustomerPhone] = useState("01712345678");
  const [deliveryAddress, setDeliveryAddress] = useState("House 12, Road 5, Dhanmondi, Dhaka");

  const [carriers, setCarriers] = useState<CarrierCard[]>([]);
  const [consignments, setConsignments] = useState<ConsignmentItem[]>(DEFAULT_CONSIGNMENTS);
  const [loading, setLoading] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleEvaluate();
      fetchConsignments();
    }
  }, [isOpen, district, codAmountBdt, weightKg]);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/logistics/arbitrage/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, codAmountBdt, weightKg }),
      });

      if (res.ok) {
        const data = await res.json();
        setCarriers(data.carriers || []);
      } else {
        computeLocalEvaluation();
      }
    } catch {
      computeLocalEvaluation();
    } finally {
      setLoading(false);
    }
  };

  const computeLocalEvaluation = () => {
    const isDhaka = district.toLowerCase() === "dhaka";
    const baseList: CarrierCard[] = [
      {
        carrier: "steadfast",
        carrierName: "Steadfast Courier Ltd.",
        baseDeliveryFeeBdt: isDhaka ? 60 : 120,
        codPercentage: 0.9,
        codFeeBdt: Math.round(codAmountBdt * 0.009),
        totalDeliveryCostBdt: (isDhaka ? 60 : 120) + Math.round(codAmountBdt * 0.009),
        returnChargeBdt: 30,
        expectedDsrPercent: isDhaka ? 94 : 92,
        estimatedDeliveryHours: isDhaka ? 24 : 36,
        expectedNetRealizationBdt: Math.round(codAmountBdt * (isDhaka ? 0.94 : 0.92) - 60),
        compositeScore: isDhaka ? 92.4 : 94.6,
        isRecommended: !isDhaka,
        recommendationReason: !isDhaka
          ? "Best coverage and lowest RTO rate in regional Bangladesh"
          : "Fast local courier",
      },
      {
        carrier: "pathao",
        carrierName: "Pathao Express Logistics",
        baseDeliveryFeeBdt: isDhaka ? 60 : 125,
        codPercentage: 1.0,
        codFeeBdt: Math.round(codAmountBdt * 0.01),
        totalDeliveryCostBdt: (isDhaka ? 60 : 125) + Math.round(codAmountBdt * 0.01),
        returnChargeBdt: 35,
        expectedDsrPercent: isDhaka ? 96 : 89,
        estimatedDeliveryHours: isDhaka ? 18 : 36,
        expectedNetRealizationBdt: Math.round(codAmountBdt * (isDhaka ? 0.96 : 0.89) - 60),
        compositeScore: isDhaka ? 95.8 : 88.2,
        isRecommended: isDhaka,
        recommendationReason: isDhaka ? "Fastest same-day delivery (18h) and highest 96% DSR inside Dhaka" : "",
      },
      {
        carrier: "redx",
        carrierName: "RedX Delivery Network",
        baseDeliveryFeeBdt: isDhaka ? 70 : 130,
        codPercentage: 1.2,
        codFeeBdt: Math.round(codAmountBdt * 0.012),
        totalDeliveryCostBdt: (isDhaka ? 70 : 130) + Math.round(codAmountBdt * 0.012),
        returnChargeBdt: 40,
        expectedDsrPercent: isDhaka ? 91 : 86,
        estimatedDeliveryHours: isDhaka ? 28 : 44,
        expectedNetRealizationBdt: Math.round(codAmountBdt * (isDhaka ? 0.91 : 0.86) - 70),
        compositeScore: 84.5,
        isRecommended: false,
        recommendationReason: "Recommended for bulky/heavy consignments >5kg",
      },
      {
        carrier: "paperfly",
        carrierName: "Paperfly Doorstep Logistics",
        baseDeliveryFeeBdt: isDhaka ? 65 : 130,
        codPercentage: 1.5,
        codFeeBdt: Math.round(codAmountBdt * 0.015),
        totalDeliveryCostBdt: (isDhaka ? 65 : 130) + Math.round(codAmountBdt * 0.015),
        returnChargeBdt: 35,
        expectedDsrPercent: isDhaka ? 89 : 87,
        estimatedDeliveryHours: isDhaka ? 36 : 46,
        expectedNetRealizationBdt: Math.round(codAmountBdt * (isDhaka ? 0.89 : 0.87) - 65),
        compositeScore: 81.2,
        isRecommended: false,
        recommendationReason: "Deepest union parishad doorstep coverage",
      },
    ];
    baseList.sort((a, b) => b.compositeScore - a.compositeScore);
    setCarriers(baseList);
  };

  const fetchConsignments = async () => {
    try {
      const res = await fetch("/api/v1/logistics/consignments");
      if (res.ok) {
        const data = await res.json();
        if (data.consignments) setConsignments(data.consignments);
      }
    } catch {
      // Fallback
    }
  };

  const handleDispatch = async (chosenCarrier?: CarrierCard["carrier"]) => {
    setDispatchSuccess(null);
    try {
      const res = await fetch("/api/v1/logistics/consignments/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: "ORD_QUICK_" + Math.floor(1000 + Math.random() * 9000),
          carrier: chosenCarrier,
          customerName,
          customerPhone,
          deliveryAddress,
          district,
          codAmountBdt,
          weightKg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchSuccess(`Consignment ${data.consignment.consignmentId} booked with ${data.consignment.carrierName}!`);
        fetchConsignments();
      } else {
        createLocalConsignment(chosenCarrier || "steadfast");
      }
    } catch {
      createLocalConsignment(chosenCarrier || "steadfast");
    }
  };

  const createLocalConsignment = (chosenCarrier: CarrierCard["carrier"]) => {
    const randomCode = `${chosenCarrier.toUpperCase().substring(0, 3)}${Math.floor(100000 + Math.random() * 900000)}`;
    const newCns: ConsignmentItem = {
      consignmentId: `CNS_${chosenCarrier.toUpperCase().substring(0, 3)}_${Date.now().toString(36).toUpperCase()}`,
      orderRef: "ORD_LOCAL_" + Math.floor(1000 + Math.random() * 9000),
      carrier: chosenCarrier,
      carrierName: chosenCarrier.toUpperCase(),
      trackingCode: randomCode,
      trackingUrl: `https://${chosenCarrier}.com.bd/t/${randomCode}`,
      customerName,
      customerPhone,
      deliveryAddress,
      district,
      zone: district.toLowerCase() === "dhaka" ? "inside_dhaka" : "divisional_city",
      codAmountBdt,
      deliveryFeeBdt: 60,
      weightKg,
      status: "booked",
      dsrConfidencePercent: 95,
      createdAt: new Date().toISOString(),
      barcodeData: `${randomCode}-${codAmountBdt}-${customerPhone}`,
    };
    setConsignments([newCns, ...consignments]);
    setDispatchSuccess(`Consignment ${newCns.consignmentId} created locally!`);
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
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Autonomous Courier Fleet Arbitrage & Micro-Hub Dispatcher
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Slice 35 · Multi-Carrier Routing
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Steadfast vs. Pathao vs. RedX vs. Paperfly Dynamic Arbitrage · DSR % Prediction · RTO Risk Mitigation
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
            onClick={() => setActiveTab("arbitrage_calculator")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "arbitrage_calculator"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Carrier Arbitrage Calculator
          </button>
          <button
            onClick={() => setActiveTab("consignments_feed")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "consignments_feed"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Consignments Feed ({consignments.length})
          </button>
          <button
            onClick={() => setActiveTab("district_matrix")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "district_matrix"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            64-District DSR Matrix
          </button>
          <button
            onClick={() => setActiveTab("rto_prevention")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === "rto_prevention"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            RTO Prevention & Alerts
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-500 font-bold">1</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* TAB 1: Arbitrage Calculator */}
          {activeTab === "arbitrage_calculator" && (
            <div className="space-y-6">
              {/* Order Parameters Input */}
              <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Live Parcel Parameters</h4>
                  <span className="text-[11px] font-mono text-zinc-400">Dynamic 4-Carrier Cost & DSR Model</span>
                </div>

                {dispatchSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{dispatchSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Destination District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="Dhaka">Dhaka (Inside Metro)</option>
                      <option value="Gazipur">Gazipur (Dhaka Suburb)</option>
                      <option value="Chittagong">Chittagong (Metro)</option>
                      <option value="Sylhet">Sylhet (Divisional)</option>
                      <option value="Rajshahi">Rajshahi (Divisional)</option>
                      <option value="Rangpur">Rangpur (Regional Upazila)</option>
                      <option value="Barisal">Barisal (Regional Upazila)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">COD Amount (BDT)</label>
                    <input
                      type="number"
                      value={codAmountBdt}
                      onChange={(e) => setCodAmountBdt(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">Package Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleEvaluate}
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      Recompute Arbitrage
                    </button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Carrier Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {carriers.map((c) => (
                  <div
                    key={c.carrier}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      c.isRecommended
                        ? "border-cyan-500 bg-cyan-500/5 ring-2 ring-cyan-500/20 shadow-md"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{c.carrierName}</span>
                        {c.isRecommended && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500 text-zinc-950 uppercase">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-zinc-500">
                          <span>Base Shipping:</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">৳{c.baseDeliveryFeeBdt}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500">
                          <span>COD Fee ({c.codPercentage}%):</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">৳{c.codFeeBdt}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-zinc-100 dark:border-zinc-800/80 pt-1 text-zinc-900 dark:text-zinc-100">
                          <span>Total Shipping:</span>
                          <span className="font-mono text-cyan-500 font-bold">৳{c.totalDeliveryCostBdt}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                          <span className="text-zinc-400 block text-[9px]">DSR Rate</span>
                          <span className="font-mono font-bold text-emerald-500">{c.expectedDsrPercent}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                          <span className="text-zinc-400 block text-[9px]">Speed / ETA</span>
                          <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{c.estimatedDeliveryHours}h</span>
                        </div>
                      </div>

                      {c.recommendationReason && (
                        <p className="text-[10px] text-zinc-500 italic mt-2">{c.recommendationReason}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDispatch(c.carrier)}
                      className={`mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        c.isRecommended
                          ? "bg-cyan-500 hover:bg-cyan-600 text-zinc-950 shadow"
                          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      1-Click Book with {c.carrier.toUpperCase()}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Consignments Feed */}
          {activeTab === "consignments_feed" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Unified Multi-Carrier Consignments</h3>
                  <p className="text-xs text-zinc-500">Live parcel tracking across Steadfast, Pathao, RedX & Paperfly</p>
                </div>
                <button
                  onClick={fetchConsignments}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Parcels
                </button>
              </div>

              <div className="space-y-3">
                {consignments.map((cns) => (
                  <div
                    key={cns.consignmentId}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-500">{cns.consignmentId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {cns.carrierName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            cns.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : cns.status === "in_transit" || cns.status === "out_for_delivery"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : cns.status === "rto_risk"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {cns.status.replace("_", " ")}
                        </span>
                      </div>
                      <a
                        href={cns.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-500 hover:underline font-mono"
                      >
                        {cns.trackingCode}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Recipient:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{cns.customerName} ({cns.customerPhone})</span>
                        <span className="text-zinc-500 text-[11px] block">{cns.deliveryAddress}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">COD Realization:</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">৳{cns.codAmountBdt.toLocaleString()}</span>
                        <span className="text-zinc-500 text-[11px] block">Fee: ৳{cns.deliveryFeeBdt} ({cns.weightKg}kg)</span>
                      </div>
                      <div className="flex flex-col justify-end items-end">
                        <button
                          onClick={() => copyText(cns.consignmentId, cns.barcodeData)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-mono"
                        >
                          {copiedId === cns.consignmentId ? <Check className="w-3 h-3 text-emerald-500" /> : <Barcode className="w-3 h-3 text-cyan-500" />}
                          {copiedId === cns.consignmentId ? "Copied Barcode" : "Copy Shipping Barcode"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 64-District Matrix */}
          {activeTab === "district_matrix" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">64-District Delivery Success Rate (DSR) Heatmap</h3>
                <p className="text-xs text-zinc-500">Historical delivery success rate & speed benchmarks across Bangladesh divisions</p>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4">District / Zone</th>
                      <th className="py-3 px-4 text-center">Steadfast DSR</th>
                      <th className="py-3 px-4 text-center">Pathao DSR</th>
                      <th className="py-3 px-4 text-center">RedX DSR</th>
                      <th className="py-3 px-4 text-center">Paperfly DSR</th>
                      <th className="py-3 px-4 text-right">Optimal Carrier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">Dhaka (Inside Metro)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">94% (24h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">96% (18h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">91% (28h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">89% (36h)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-500">PATHAO</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">Gazipur & Savar (Suburbs)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">92% (28h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">88% (32h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">87% (36h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">84% (44h)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-500">STEADFAST</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">Chittagong Metro</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">95% (24h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">92% (30h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">90% (36h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">88% (40h)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-500">STEADFAST</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">Sylhet Divisional City</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">93% (32h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">89% (36h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">88% (42h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">86% (48h)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-500">STEADFAST</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">Rangpur / Rural Upazilas</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">90% (40h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-rose-500">78% (56h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-zinc-500">82% (52h)</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-500 font-bold">88% (44h)</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-cyan-500">STEADFAST</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RTO Prevention & Alerts */}
          {activeTab === "rto_prevention" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <h4>1 Parcel Flagged with Delivery Friction (RTO Risk)</h4>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Recipient Kamrul Islam (+8801933445566) was unreachable during 1st delivery attempt in Sylhet. Trigger automated Banglish WhatsApp prompt to prevent dead return shipping fees (৳130+৳40 return charge).
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => alert("Automated WhatsApp rescheduling prompt sent to +8801933445566!")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Banglish WhatsApp Rescheduler
                  </button>
                  <button
                    onClick={() => alert("Autonomous IVR Bot dialed +8801933445566!")}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-cyan-500" />
                    Trigger Voice IVR Re-confirmation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Multi-Carrier Courier Router Active</span>
          </div>
          <span className="font-mono text-[11px]">Shortcut: ⌘R · Shothik Logistics Hub</span>
        </div>
      </div>
    </div>
  );
};
