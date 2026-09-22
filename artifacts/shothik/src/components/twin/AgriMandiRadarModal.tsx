import React, { useState, useEffect } from "react";
import {
  Wheat,
  TrendingUp,
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
  ArrowRight,
  Sliders,
  DollarSign,
  Package,
  Truck,
  ThermometerSnowflake,
  ShieldCheck,
  Scale,
  MapPin,
  Building2,
  Flame,
  Droplets,
  Calendar
} from "lucide-react";

interface AgriMandiRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "mandi_radar"
  | "sourcing_lots"
  | "arbitrage_calc"
  | "cold_chain"
  | "trading_yards";

export interface AgriCommodity {
  id: string;
  name: string;
  banglaName: string;
  category: "perishable_vegetables" | "seasonal_fruits" | "spices_condiments" | "grains_pulses" | "edible_oils";
  unit: string;
  farmgateOrigin: string;
  primaryMandi: string;
  farmgatePriceBdt: number;
  wholesaleMandiPriceBdt: number;
  sma7PriceBdt: number;
  priceTrend: "rising" | "falling" | "stable";
  volatilityIndex: number;
  moistureLossCoefficient: number;
  recommendedStorageTempC: string;
  harvestSeason: string;
}

export interface SourcingLotDraft {
  lotId: string;
  commodityId: string;
  commodityName: string;
  farmerName: string;
  farmerPhone: string;
  farmerMfsNumber: string;
  mfsProvider: "bkash" | "nagad" | "rocket";
  farmLocation: string;
  quantityMaund: number;
  totalKg: number;
  farmgateRatePerKgBdt: number;
  estimatedGrossValueBdt: number;
  advancePercentage: number;
  advanceAmountBdt: number;
  expectedHarvestDate: string;
  transportType: string;
  destinationMandi: string;
  status: "draft" | "advance_disbursed" | "in_transit" | "received_and_tallied";
  trxId?: string;
  sha256Seal: string;
  createdAt: string;
}

const DEFAULT_COMMODITIES: AgriCommodity[] = [
  {
    id: "AGRI_ONION_01",
    name: "Native Red Onion (Taherpuri / King)",
    banglaName: "তাহেরপুরী দেশি পেঁয়াজ",
    category: "perishable_vegetables",
    unit: "kg",
    farmgateOrigin: "Sujanagar, Pabna & Madhukhali, Faridpur",
    primaryMandi: "karwan_bazar",
    farmgatePriceBdt: 45,
    wholesaleMandiPriceBdt: 74,
    sma7PriceBdt: 71,
    priceTrend: "rising",
    volatilityIndex: 42,
    moistureLossCoefficient: 0.0035,
    recommendedStorageTempC: "15°C - 20°C (Well ventilated)",
    harvestSeason: "February - April"
  },
  {
    id: "AGRI_POTATO_01",
    name: "Diamond White Potato (Granola)",
    banglaName: "ডায়মন্ড গোল আলু",
    category: "perishable_vegetables",
    unit: "kg",
    farmgateOrigin: "Sirajdikhan, Munshiganj & Mithapukur, Rangpur",
    primaryMandi: "karwan_bazar",
    farmgatePriceBdt: 22,
    wholesaleMandiPriceBdt: 38,
    sma7PriceBdt: 36,
    priceTrend: "stable",
    volatilityIndex: 25,
    moistureLossCoefficient: 0.0018,
    recommendedStorageTempC: "4°C - 8°C (Cold Storage)",
    harvestSeason: "January - March"
  },
  {
    id: "AGRI_CHILI_01",
    name: "Green Birdseye Hot Chili (Bogra Special)",
    banglaName: "বগুড়ার তাজা কাঁচামরিচ",
    category: "spices_condiments",
    unit: "kg",
    farmgateOrigin: "Sariakandi & Shibganj, Bogra",
    primaryMandi: "karwan_bazar",
    farmgatePriceBdt: 85,
    wholesaleMandiPriceBdt: 165,
    sma7PriceBdt: 152,
    priceTrend: "rising",
    volatilityIndex: 78,
    moistureLossCoefficient: 0.0085,
    recommendedStorageTempC: "8°C - 10°C (High Humidity)",
    harvestSeason: "Year-Round (Peak Oct - Dec)"
  },
  {
    id: "AGRI_MANGO_01",
    name: "Himsagar Sweet Mango (GI Certified)",
    banglaName: "রাজশাহী হিমসাগর আম",
    category: "seasonal_fruits",
    unit: "kg",
    farmgateOrigin: "Kansat, Chapainawabganj & Charghat, Rajshahi",
    primaryMandi: "badamtoli",
    farmgatePriceBdt: 70,
    wholesaleMandiPriceBdt: 135,
    sma7PriceBdt: 128,
    priceTrend: "falling",
    volatilityIndex: 65,
    moistureLossCoefficient: 0.006,
    recommendedStorageTempC: "12°C - 14°C (Pre-ripening)",
    harvestSeason: "Late May - June"
  },
  {
    id: "AGRI_PULSE_01",
    name: "Australian Desi Chickpeas (Chana)",
    banglaName: "খাতুনগঞ্জ আমদানি ছোলা",
    category: "grains_pulses",
    unit: "kg",
    farmgateOrigin: "Chittagong Port Silos & Chaktai",
    primaryMandi: "khatunganj",
    farmgatePriceBdt: 92,
    wholesaleMandiPriceBdt: 110,
    sma7PriceBdt: 108,
    priceTrend: "stable",
    volatilityIndex: 18,
    moistureLossCoefficient: 0.0008,
    recommendedStorageTempC: "Dry Ambient (<12% moisture)",
    harvestSeason: "Import Spot Year-Round"
  }
];

const MANDI_DIRECTORY = [
  {
    id: "karwan_bazar",
    name: "Karwan Bazar Central Wholesale Arat",
    bangla: "কাওরান বাজার কেন্দ্রীয় পাইকারি আড়ত",
    location: "Tejgaon / Farmgate, Central Dhaka",
    primaryCommodities: "Potatoes, Onions, Green Chilies, Tomatoes, Eggplants, Gourds",
    dailyTradingVolumeTons: 3800,
    tradingHours: "11:00 PM - 07:00 AM (Night Auction)",
    pricingMechanism: "Open open-voice arat auction & commission agent bidding"
  },
  {
    id: "badamtoli",
    name: "Badamtoli & Sadarghat Fruit Wholesale Yard",
    bangla: "বাদামতলী ও সদরঘাট ফল পাইকারি মোকাম",
    location: "Old Dhaka / Buriganga Riverfront",
    primaryCommodities: "Mangoes, Apples, Oranges, Watermelons, Bananas, Melons",
    dailyTradingVolumeTons: 2100,
    tradingHours: "04:00 AM - 12:00 PM (Morning Wharf Auction)",
    pricingMechanism: "Vessel-wharf bulk crate spot trading"
  },
  {
    id: "khatunganj",
    name: "Khatunganj & Chaktai Commodity Mandi",
    bangla: "খাতুনগঞ্জ ও চাকতাই পাইকারি বাজার",
    location: "Kotwali, Chittagong Port City",
    primaryCommodities: "Chickpeas, Lentils, Spices, Edible Oils, Sugar, Wheat",
    dailyTradingVolumeTons: 6500,
    tradingHours: "09:00 AM - 08:00 PM",
    pricingMechanism: "DO (Delivery Order) slip spot & forward contract market"
  },
  {
    id: "bogra_mandi",
    name: "Bogra Spice & Vegetable Assembly Yard",
    bangla: "বগুড়া মসলা ও সবজি মোকাম",
    location: "Mahasthangarh / Bogra Bypass",
    primaryCommodities: "Red Chilies, Turmeric, Ginger, Garlic, Cauliflower, Cabbage",
    dailyTradingVolumeTons: 1800,
    tradingHours: "05:00 AM - 11:00 AM",
    pricingMechanism: "Direct farmgate tractor tally & grower settlement"
  },
  {
    id: "rajshahi_belt",
    name: "Kansat & Baneswar Fruit Wholesale Yard",
    bangla: "কানসাট ও বানেশ্বর ফল আড়ত",
    location: "Shibganj & Puthia, Rajshahi / Chapai",
    primaryCommodities: "Himsagar, Fazli, Langra, Amrapali, Lychees",
    dailyTradingVolumeTons: 2900,
    tradingHours: "06:00 AM - 02:00 PM (Seasonal)",
    pricingMechanism: "Orchard-direct auction & crate weighing"
  }
];

export const AgriMandiRadarModal: React.FC<AgriMandiRadarModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("mandi_radar");
  const [commodities, setCommodities] = useState<AgriCommodity[]>(DEFAULT_COMMODITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sourcing lot state
  const [sourcingLots, setSourcingLots] = useState<SourcingLotDraft[]>([
    {
      lotId: "LOT_AGRI_PABNA_ONION_01",
      commodityId: "AGRI_ONION_01",
      commodityName: "Native Red Onion (Taherpuri / King)",
      farmerName: "Md. Rafiqul Islam (Mintu)",
      farmerPhone: "01712-445566",
      farmerMfsNumber: "01712445566",
      mfsProvider: "bkash",
      farmLocation: "Sujanagar, Pabna",
      quantityMaund: 125, // 5000 kg
      totalKg: 5000,
      farmgateRatePerKgBdt: 45,
      estimatedGrossValueBdt: 225000,
      advancePercentage: 30,
      advanceAmountBdt: 67500,
      expectedHarvestDate: "2026-09-28",
      transportType: "reefer_cold_chain",
      destinationMandi: "Karwan Bazar Central Arat, Dhaka",
      status: "advance_disbursed",
      trxId: "TRX_BKASH_9948271A",
      sha256Seal: "8f7a932d88194bcf9321e04fa87e10bb",
      createdAt: "2026-09-21T10:15:00Z"
    }
  ]);

  // Sourcing lot form state
  const [lotFarmerName, setLotFarmerName] = useState("Kuddus Bepari");
  const [lotFarmerPhone, setLotFarmerPhone] = useState("01711223344");
  const [lotFarmerMfs, setLotFarmerMfs] = useState("01711223344");
  const [lotMfsProvider, setLotMfsProvider] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [lotFarmLocation, setLotFarmLocation] = useState("Munshiganj Sadar");
  const [lotCommodityId, setLotCommodityId] = useState("AGRI_POTATO_01");
  const [lotQuantityMaund, setLotQuantityMaund] = useState<number>(75); // 3000 kg
  const [lotCustomRate, setLotCustomRate] = useState<number>(22);
  const [lotAdvancePercent, setLotAdvancePercent] = useState<number>(30);
  const [lotCreatedNotification, setLotCreatedNotification] = useState<string | null>(null);

  // Arbitrage calculator state
  const [calcCommodityId, setCalcCommodityId] = useState<string>("AGRI_CHILI_01");
  const [calcQuantityKg, setCalcQuantityKg] = useState<number>(2500);
  const [calcTransitHours, setCalcTransitHours] = useState<number>(14);
  const [calcTransportType, setCalcTransportType] = useState<"open_bed_truck" | "reefer_cold_chain">("reefer_cold_chain");
  const [calcCustomFarmgate, setCalcCustomFarmgate] = useState<number>(85);
  const [calcCustomMandi, setCalcCustomMandi] = useState<number>(165);

  // Cold chain planner state
  const [ccOrigin, setCcOrigin] = useState("Sariakandi & Shibganj, Bogra");
  const [ccDestination, setCcDestination] = useState("Karwan Bazar Central Arat, Dhaka");
  const [ccCommodityId, setCcCommodityId] = useState("AGRI_CHILI_01");
  const [ccQuantityKg, setCcQuantityKg] = useState<number>(3000);
  const [ccDistanceKm, setCcDistanceKm] = useState<number>(230);

  // Load live commodities from API if available
  useEffect(() => {
    if (!isOpen) return;
    const fetchCommodities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/v1/agri/commodities");
        if (res.ok) {
          const data = await res.json();
          if (data.commodities && data.commodities.length > 0) {
            setCommodities(data.commodities);
          }
        }
      } catch (err) {
        console.warn("Using offline agri-commodities fallback:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommodities();
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredCommodities = commodities.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.banglaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.farmgateOrigin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Arbitrage dynamic calculation
  const selectedCalcCommodity =
    commodities.find((c) => c.id === calcCommodityId) || commodities[0];
  const activeFarmgate = calcCustomFarmgate || selectedCalcCommodity.farmgatePriceBdt;
  const activeMandi = calcCustomMandi || selectedCalcCommodity.wholesaleMandiPriceBdt;
  const effectiveShrinkageRate =
    calcTransportType === "reefer_cold_chain"
      ? selectedCalcCommodity.moistureLossCoefficient * 0.25
      : selectedCalcCommodity.moistureLossCoefficient;
  const shrinkageLossKg = Math.round(calcQuantityKg * effectiveShrinkageRate * calcTransitHours * 100) / 100;
  const arrivalKg = Math.max(0, calcQuantityKg - shrinkageLossKg);
  const shrinkagePercent = Math.round((shrinkageLossKg / calcQuantityKg) * 10000) / 100;

  const farmgateCostBdt = Math.round(calcQuantityKg * activeFarmgate);
  const freightRate = calcTransportType === "reefer_cold_chain" ? 5.5 : 3.5;
  const freightCostBdt = Math.round(calcQuantityKg * freightRate);
  const totalCostBdt = farmgateCostBdt + freightCostBdt;
  const revenueBdt = Math.round(arrivalKg * activeMandi);
  const netProfitBdt = revenueBdt - totalCostBdt;
  const netMarginPercent = Math.round((netProfitBdt / (revenueBdt || 1)) * 10000) / 100;
  const roiPercent = Math.round((netProfitBdt / (totalCostBdt || 1)) * 10000) / 100;

  // Sourcing lot submission
  const handleCreateLot = () => {
    const selectedComm = commodities.find((c) => c.id === lotCommodityId) || commodities[0];
    const totalKg = lotQuantityMaund * 40;
    const rate = lotCustomRate || selectedComm.farmgatePriceBdt;
    const grossVal = totalKg * rate;
    const advanceAmt = Math.round(grossVal * (lotAdvancePercent / 100));
    const lotId = `LOT_AGRI_${Date.now().toString(36).toUpperCase()}`;

    const newLot: SourcingLotDraft = {
      lotId,
      commodityId: selectedComm.id,
      commodityName: selectedComm.name,
      farmerName: lotFarmerName,
      farmerPhone: lotFarmerPhone,
      farmerMfsNumber: lotFarmerMfs,
      mfsProvider: lotMfsProvider,
      farmLocation: lotFarmLocation,
      quantityMaund: lotQuantityMaund,
      totalKg,
      farmgateRatePerKgBdt: rate,
      estimatedGrossValueBdt: grossVal,
      advancePercentage: lotAdvancePercent,
      advanceAmountBdt: advanceAmt,
      expectedHarvestDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      transportType: "reefer_cold_chain",
      destinationMandi: "Karwan Bazar Central Arat, Dhaka",
      status: "draft",
      sha256Seal: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      createdAt: new Date().toISOString()
    };

    setSourcingLots([newLot, ...sourcingLots]);
    setLotCreatedNotification(`Lot ${lotId} created successfully! (Gross: ৳${grossVal.toLocaleString()}, Advance: ৳${advanceAmt.toLocaleString()})`);
    setTimeout(() => setLotCreatedNotification(null), 4000);
  };

  const handleDisburseAdvance = (lotId: string) => {
    setSourcingLots(
      sourcingLots.map((lot) => {
        if (lot.lotId === lotId) {
          return {
            ...lot,
            status: "advance_disbursed",
            trxId: `TRX_${lot.mfsProvider.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`
          };
        }
        return lot;
      })
    );
  };

  // Cold chain route calculations
  const ccSelectedComm = commodities.find((c) => c.id === ccCommodityId) || commodities[0];
  const transitHours = Math.round(ccDistanceKm / 35 + 3);
  const baseFreightBdt = Math.round(ccQuantityKg * 3.5);
  const coldChainSurchargeBdt = Math.round(ccQuantityKg * 2.0);
  const totalFreightCostBdt = baseFreightBdt + coldChainSurchargeBdt;
  const openLossKg = ccQuantityKg * ccSelectedComm.moistureLossCoefficient * transitHours;
  const reeferLossKg = openLossKg * 0.25;
  const savedLossKg = openLossKg - reeferLossKg;
  const shrinkageSavingsBdt = Math.round(savedLossKg * ccSelectedComm.wholesaleMandiPriceBdt);
  const netColdChainBenefitBdt = shrinkageSavingsBdt - coldChainSurchargeBdt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                  Agri-Commodity Sourcing & Mandi Price Radar
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Slice 40 • Live Spot Index
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Khatunganj • Badamtoli • Karwan Bazar • Bogra • Rajshahi &bull; 1 Maund (মণ) = 40 kg &bull; Moisture Loss Buffer &bull; Reefer Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-zinc-800/60 bg-zinc-900/20 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("mandi_radar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "mandi_radar"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Wheat className="w-4 h-4" />
            <span>Mandi Spot Radar</span>
          </button>

          <button
            onClick={() => setActiveTab("sourcing_lots")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "sourcing_lots"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Sourcing Lots & Micro-Advance (মণ)</span>
          </button>

          <button
            onClick={() => setActiveTab("arbitrage_calc")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "arbitrage_calc"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Arbitrage & Shrinkage Buffer</span>
          </button>

          <button
            onClick={() => setActiveTab("cold_chain")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "cold_chain"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <ThermometerSnowflake className="w-4 h-4" />
            <span>Cold-Chain Reefer Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab("trading_yards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "trading_yards"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Wholesale Trading Yards</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MANDI SPOT RADAR */}
          {activeTab === "mandi_radar" && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Commodities" },
                    { id: "perishable_vegetables", label: "Vegetables (সবজি)" },
                    { id: "seasonal_fruits", label: "Fruits (ফল)" },
                    { id: "spices_condiments", label: "Spices (মসলা)" },
                    { id: "grains_pulses", label: "Grains & Pulses (ডাল/শস্য)" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crop or origin..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Commodities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommodities.map((comm) => {
                  const grossMargin = comm.wholesaleMandiPriceBdt - comm.farmgatePriceBdt;
                  const grossMarginPercent = Math.round((grossMargin / comm.wholesaleMandiPriceBdt) * 100);

                  return (
                    <div
                      key={comm.id}
                      className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-semibold text-emerald-400">
                              {comm.banglaName}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-100">{comm.name}</h3>
                          </div>
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                              comm.priceTrend === "rising"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : comm.priceTrend === "falling"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}
                          >
                            {comm.priceTrend === "rising" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : comm.priceTrend === "falling" ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {comm.priceTrend.toUpperCase()}
                          </span>
                        </div>

                        {/* Prices row */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                              Farmgate Sourcing
                            </span>
                            <span className="text-base font-bold text-emerald-400">
                              ৳{comm.farmgatePriceBdt}
                            </span>
                            <span className="text-[10px] text-zinc-500"> / kg</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                              Wholesale Mandi Spot
                            </span>
                            <span className="text-base font-bold text-amber-400">
                              ৳{comm.wholesaleMandiPriceBdt}
                            </span>
                            <span className="text-[10px] text-zinc-500"> / kg</span>
                          </div>
                        </div>

                        {/* Origin & Specs */}
                        <div className="space-y-1.5 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="truncate">{comm.farmgateOrigin}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{comm.recommendedStorageTempC}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              Moisture Loss: {(comm.moistureLossCoefficient * 100).toFixed(2)}% / hr
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-zinc-500">Spatial Spread: </span>
                          <span className="font-semibold text-emerald-400">
                            +৳{grossMargin}/kg ({grossMarginPercent}%)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setCalcCommodityId(comm.id);
                            setCalcCustomFarmgate(comm.farmgatePriceBdt);
                            setCalcCustomMandi(comm.wholesaleMandiPriceBdt);
                            setActiveTab("arbitrage_calc");
                          }}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          Simulate &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SOURCING LOTS & MICRO-ADVANCE */}
          {activeTab === "sourcing_lots" && (
            <div className="space-y-6">
              {/* Top Banner Notice */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <Scale className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 space-y-1">
                  <p className="font-semibold text-emerald-400">
                    Standard Bangladesh Agro Unit Conversion: 1 Maund (মণ) = 40 Kilograms
                  </p>
                  <p className="text-zinc-400">
                    To prevent crop abandonment during harvest peaks, ShothikGPT automatically calculates a 30% harvesting advance disbursed instantly to the grower&apos;s bKash or Nagad wallet.
                  </p>
                </div>
              </div>

              {lotCreatedNotification && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lotCreatedNotification}</span>
                </div>
              )}

              {/* Sourcing Lot Form */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Create Agricultural Sourcing Lot & Calculate Farmer Advance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Select Crop</label>
                    <select
                      value={lotCommodityId}
                      onChange={(e) => {
                        setLotCommodityId(e.target.value);
                        const c = commodities.find((item) => item.id === e.target.value);
                        if (c) setLotCustomRate(c.farmgatePriceBdt);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      {commodities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.banglaName} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Farmer / Grower Name</label>
                    <input
                      type="text"
                      value={lotFarmerName}
                      onChange={(e) => setLotFarmerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Farm / Assembly Location</label>
                    <input
                      type="text"
                      value={lotFarmLocation}
                      onChange={(e) => setLotFarmLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      Quantity in Maund (মণ)
                    </label>
                    <input
                      type="number"
                      value={lotQuantityMaund}
                      onChange={(e) => setLotQuantityMaund(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-emerald-400 mt-0.5 block">
                      = {(lotQuantityMaund * 40).toLocaleString()} kg total weight
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Farmgate Rate (৳/kg)</label>
                    <input
                      type="number"
                      value={lotCustomRate}
                      onChange={(e) => setLotCustomRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Advance Percentage (%)</label>
                    <input
                      type="number"
                      value={lotAdvancePercent}
                      onChange={(e) => setLotAdvancePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Farmer MFS Wallet</label>
                    <div className="flex gap-2">
                      <select
                        value={lotMfsProvider}
                        onChange={(e) => setLotMfsProvider(e.target.value as any)}
                        className="px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">Rocket</option>
                      </select>
                      <input
                        type="text"
                        value={lotFarmerMfs}
                        onChange={(e) => setLotFarmerMfs(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-zinc-300">
                    <span>Gross Value: </span>
                    <strong className="text-zinc-100">
                      ৳{(lotQuantityMaund * 40 * lotCustomRate).toLocaleString()}
                    </strong>
                    <span className="mx-2">&bull;</span>
                    <span>Advance Payout: </span>
                    <strong className="text-emerald-400">
                      ৳{Math.round(lotQuantityMaund * 40 * lotCustomRate * (lotAdvancePercent / 100)).toLocaleString()}
                    </strong>
                  </div>

                  <button
                    onClick={handleCreateLot}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Create Sourcing Lot
                  </button>
                </div>
              </div>

              {/* Sourcing Lots Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Active Sourcing Lots & Digital Advance Payroll ({sourcingLots.length})
                </h4>

                <div className="space-y-3">
                  {sourcingLots.map((lot) => (
                    <div
                      key={lot.lotId}
                      className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {lot.lotId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              lot.status === "advance_disbursed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {lot.status.replace("_", " ")}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-zinc-200">{lot.commodityName}</h5>
                        <p className="text-xs text-zinc-400">
                          Grower: <strong className="text-zinc-300">{lot.farmerName}</strong> ({lot.farmerPhone}) &bull; {lot.farmLocation}
                        </p>
                      </div>

                      {/* Weight and Financials */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Volume</span>
                          <span className="font-bold text-zinc-200">
                            {lot.quantityMaund} Maund ({lot.totalKg.toLocaleString()} kg)
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Gross Value</span>
                          <span className="font-bold text-zinc-200">
                            ৳{lot.estimatedGrossValueBdt.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">
                            Advance ({lot.advancePercentage}%)
                          </span>
                          <span className="font-bold text-emerald-400">
                            ৳{lot.advanceAmountBdt.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-2">
                        {lot.status === "draft" ? (
                          <button
                            onClick={() => handleDisburseAdvance(lot.lotId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Disburse bKash
                          </button>
                        ) : (
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-400 block">
                              {lot.trxId}
                            </span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              MFS Paid
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARBITRAGE & SHRINKAGE BUFFER CALCULATOR */}
          {activeTab === "arbitrage_calc" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inputs Column */}
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Spatial Arbitrage Parameters
                  </h3>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Target Commodity</label>
                    <select
                      value={calcCommodityId}
                      onChange={(e) => {
                        setCalcCommodityId(e.target.value);
                        const c = commodities.find((item) => item.id === e.target.value);
                        if (c) {
                          setCalcCustomFarmgate(c.farmgatePriceBdt);
                          setCalcCustomMandi(c.wholesaleMandiPriceBdt);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      {commodities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Farmgate (৳/kg)</label>
                      <input
                        type="number"
                        value={calcCustomFarmgate}
                        onChange={(e) => setCalcCustomFarmgate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mandi Spot (৳/kg)</label>
                      <input
                        type="number"
                        value={calcCustomMandi}
                        onChange={(e) => setCalcCustomMandi(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Batch Weight (Kg)</label>
                    <input
                      type="number"
                      value={calcQuantityKg}
                      onChange={(e) => setCalcQuantityKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">
                      = {(calcQuantityKg / 40).toFixed(1)} Maund (মণ)
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">
                      Transit Duration (Hours)
                    </label>
                    <input
                      type="number"
                      value={calcTransitHours}
                      onChange={(e) => setCalcTransitHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Transport Vehicle</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCalcTransportType("open_bed_truck")}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          calcTransportType === "open_bed_truck"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        <Truck className="w-4 h-4 mb-1" />
                        <span>Open Truck (৳3.5/kg)</span>
                      </button>

                      <button
                        onClick={() => setCalcTransportType("reefer_cold_chain")}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                          calcTransportType === "reefer_cold_chain"
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        <ThermometerSnowflake className="w-4 h-4 mb-1" />
                        <span>Reefer (৳5.5/kg)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Outputs & Shrinkage Breakdown */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Rating Header */}
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 uppercase tracking-wider block">
                        Arbitrage Evaluation
                      </span>
                      <h4 className="text-lg font-bold text-zinc-100">
                        {selectedCalcCommodity.name}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        netMarginPercent > 20
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : netProfitBdt > 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {netMarginPercent > 20
                        ? "HIGH ARBITRAGE OPPORTUNITY"
                        : netProfitBdt > 0
                        ? "MODERATE SPREAD"
                        : "HIGH SPOILAGE RISK"}
                    </span>
                  </div>

                  {/* Financial Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Total Sourcing Cost</span>
                      <span className="text-lg font-bold text-zinc-200">
                        ৳{totalCostBdt.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        ৳{farmgateCostBdt.toLocaleString()} crop + ৳{freightCostBdt.toLocaleString()} freight
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Arrival Weight</span>
                      <span className="text-lg font-bold text-amber-400">
                        {arrivalKg.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-red-400 block mt-0.5">
                        - {shrinkageLossKg} kg ({shrinkagePercent}% loss)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Projected Mandi Rev</span>
                      <span className="text-lg font-bold text-zinc-200">
                        ৳{revenueBdt.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        @ ৳{activeMandi}/kg spot
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                      <span className="text-[10px] text-emerald-400 uppercase block">Net Gross Margin</span>
                      <span className="text-lg font-bold text-emerald-300">
                        ৳{netProfitBdt.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        {netMarginPercent}% margin &bull; {roiPercent}% ROI
                      </span>
                    </div>
                  </div>

                  {/* Shrinkage Formula Box */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-amber-400" />
                        Moisture Evaporation Loss Mathematical Model
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        W_loss = W_0 &times; (1 - e^-(&kappa; &times; T))
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      In {calcTransportType === "reefer_cold_chain" ? "active reefer cooling (2°C - 8°C)" : "open ambient transport"}, {selectedCalcCommodity.name} suffers an estimated{" "}
                      <strong className="text-amber-300">{shrinkageLossKg} kg</strong> moisture shrinkage over {calcTransitHours} hours.
                      {calcTransportType === "open_bed_truck" && (
                        <span className="text-emerald-400 block mt-1">
                          Tip: Switching to Reefer cold chain would save {(shrinkageLossKg * 0.75).toFixed(1)} kg worth ৳{Math.round(shrinkageLossKg * 0.75 * activeMandi).toLocaleString()}.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLD-CHAIN REEFER LOGISTICS DISPATCH */}
          {activeTab === "cold_chain" && (
            <div className="space-y-6">
              {/* Cold Chain Planner Controls */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
                  Cold-Chain Reefer Route Planner vs Open Truck Savings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Origin Assembly Point</label>
                    <input
                      type="text"
                      value={ccOrigin}
                      onChange={(e) => setCcOrigin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Destination Mandi</label>
                    <input
                      type="text"
                      value={ccDestination}
                      onChange={(e) => setCcDestination(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cargo Crop</label>
                    <select
                      value={ccCommodityId}
                      onChange={(e) => setCcCommodityId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      {commodities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.banglaName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cargo Batch Weight (Kg)</label>
                    <input
                      type="number"
                      value={ccQuantityKg}
                      onChange={(e) => setCcQuantityKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Highway Distance (Km)</label>
                    <input
                      type="number"
                      value={ccDistanceKm}
                      onChange={(e) => setCcDistanceKm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cold Chain Economic Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold">Open-Bed Cargo</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Freight Cost (৳3.5/kg):</span>
                      <strong className="text-zinc-200">৳{baseFreightBdt.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Moisture Loss:</span>
                      <strong className="text-red-400">{openLossKg.toFixed(1)} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Spoilage Loss Value:</span>
                      <strong className="text-red-400">
                        ৳{Math.round(openLossKg * ccSelectedComm.wholesaleMandiPriceBdt).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-emerald-800/60 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ThermometerSnowflake className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold">Reefer Cold-Chain</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Total Reefer Freight:</span>
                      <strong className="text-zinc-200">৳{totalFreightCostBdt.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Reefer Surcharge:</span>
                      <strong className="text-amber-400">+৳{coldChainSurchargeBdt.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Reduced Moisture Loss:</span>
                      <strong className="text-emerald-400">{reeferLossKg.toFixed(1)} kg</strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider block">
                      Net Economic Advantage
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      +৳{netColdChainBenefitBdt.toLocaleString()}
                    </span>
                    <p className="text-xs text-zinc-400 mt-1">
                      Saved {savedLossKg.toFixed(1)} kg from drying out, generating ৳{shrinkageSavingsBdt.toLocaleString()} in preserved crop value.
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800 text-[10px] text-zinc-500">
                    Recommended: {ccQuantityKg > 4000 ? "7-Ton Insulated Reefer" : "3-Ton Refrigerated Van"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WHOLESALE TRADING YARDS DIRECTORY */}
          {activeTab === "trading_yards" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {MANDI_DIRECTORY.map((mandi) => (
                  <div
                    key={mandi.id}
                    className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-xs font-semibold text-emerald-400">
                            {mandi.bangla}
                          </span>
                          <h4 className="text-base font-bold text-zinc-100">{mandi.name}</h4>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{mandi.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Commodities: <strong className="text-zinc-300">{mandi.primaryCommodities}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Trading Hours: {mandi.tradingHours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-zinc-500 uppercase block">Daily Volume</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {mandi.dailyTradingVolumeTons.toLocaleString()} Tons
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 mt-2">
                        {mandi.pricingMechanism}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-emerald-500" />
            <span>Shothik Agri Radar v40.0 &bull; Sub-10ms Spatial Arbitrage Engine</span>
          </div>
          <div>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">⌘A</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Ctrl+A</kbd></div>
        </div>
      </div>
    </div>
  );
};

export default AgriMandiRadarModal;
