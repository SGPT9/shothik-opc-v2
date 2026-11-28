import React, { useState, useEffect } from "react";
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  Building2,
  DollarSign,
  Truck,
  ArrowRight,
  PieChart,
  Percent,
  Sparkles,
  FileSpreadsheet,
  FileCheck2,
  Check,
  Copy,
  Layers
} from "lucide-react";

interface MultiChannelCashflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "liquid_overview" | "courier_reconciler" | "daily_pnl_radar" | "discrepancy_auditor" | "runway_predictor";

interface ChannelBalance {
  channelId: string;
  channelName: string;
  accountNumber: string;
  currency: "BDT";
  currentBalanceBdt: number;
  pendingReceivableBdt: number;
  settlementFeePercent: number;
  lastUpdated: string;
}

interface CourierSettlementBatch {
  batchId: string;
  carrier: "steadfast" | "pathao" | "redx" | "paperfly";
  settlementDate: string;
  consignmentsCount: number;
  deliveredCount: number;
  returnedCount: number;
  grossCodCollectedBdt: number;
  deliveryFeesDeductedBdt: number;
  codCommissionDeductedBdt: number;
  rtoReturnFeesDeductedBdt: number;
  netPayoutBdt: number;
  discrepanciesCount: number;
  discrepanciesAmountBdt: number;
  status: "reconciled" | "discrepancy_detected" | "pending_disbursement";
  consignments: any[];
}

interface DailyPnLSummary {
  date: string;
  grossDeliveredRevenueBdt: number;
  cogsBdt: number;
  courierDeliveryFeesBdt: number;
  codCommissionFeesBdt: number;
  rtoFreightLossBdt: number;
  mfsProcessingFeesBdt: number;
  adSpendBdt: number;
  packagingCostBdt: number;
  netOperatingProfitBdt: number;
  netMarginPercent: number;
  deliveredOrdersCount: number;
  returnedOrdersCount: number;
  rtoRatePercent: number;
}

interface DiscrepancyItem {
  discrepancyId: string;
  carrier: string;
  trackingCode: string;
  orderRef: string;
  discrepancyType: string;
  expectedAmountBdt: number;
  disbursedAmountBdt: number;
  shortageAmountBdt: number;
  detectedAt: string;
  status: "open" | "claimed" | "resolved";
  claimBriefText: string;
}

interface RunwayForecastResult {
  currentLiquidCapitalBdt: number;
  pendingInTransitCodBdt: number;
  upcomingPayablesBdt: number;
  effectiveWorkingCapitalBdt: number;
  dailyBurnRateBdt: number;
  dailyRevenueInflowBdt: number;
  netDailyCashflowBdt: number;
  runwayDays: number;
  runwayStatus: "healthy" | "caution" | "critical";
  trajectoryDays: Array<{
    day: number;
    projectedDate: string;
    projectedBalanceBdt: number;
    inventoryRestockRequired: boolean;
  }>;
}

const DEFAULT_CHANNELS: ChannelBalance[] = [
  {
    channelId: "bkash_merchant",
    channelName: "bKash Merchant PGW Wallet",
    accountNumber: "01711998877",
    currency: "BDT",
    currentBalanceBdt: 184500,
    pendingReceivableBdt: 12000,
    settlementFeePercent: 1.5,
    lastUpdated: "2026-09-21T00:00:00Z"
  },
  {
    channelId: "nagad_sheba",
    channelName: "Nagad Sheba Merchant Wallet",
    accountNumber: "01822334455",
    currency: "BDT",
    currentBalanceBdt: 92400,
    pendingReceivableBdt: 6500,
    settlementFeePercent: 1.2,
    lastUpdated: "2026-09-21T00:00:00Z"
  },
  {
    channelId: "bank_city",
    channelName: "City Bank Business Account",
    accountNumber: "1501204899201001",
    currency: "BDT",
    currentBalanceBdt: 480000,
    pendingReceivableBdt: 0,
    settlementFeePercent: 0,
    lastUpdated: "2026-09-21T00:00:00Z"
  },
  {
    channelId: "steadfast_transit",
    channelName: "Steadfast In-Transit COD Receivables",
    accountNumber: "STF-MERC-98210",
    currency: "BDT",
    currentBalanceBdt: 0,
    pendingReceivableBdt: 142600,
    settlementFeePercent: 1.0,
    lastUpdated: "2026-09-21T00:00:00Z"
  },
  {
    channelId: "pathao_transit",
    channelName: "Pathao In-Transit COD Receivables",
    accountNumber: "PAT-MERC-44102",
    currency: "BDT",
    currentBalanceBdt: 0,
    pendingReceivableBdt: 86500,
    settlementFeePercent: 1.0,
    lastUpdated: "2026-09-21T00:00:00Z"
  }
];

const DEFAULT_DAILY_PNL: DailyPnLSummary = {
  date: "2026-09-21",
  grossDeliveredRevenueBdt: 68500,
  cogsBdt: 26800,
  courierDeliveryFeesBdt: 4200,
  codCommissionFeesBdt: 685,
  rtoFreightLossBdt: 750,
  mfsProcessingFeesBdt: 510,
  adSpendBdt: 8500,
  packagingCostBdt: 1260,
  netOperatingProfitBdt: 25795,
  netMarginPercent: 37.66,
  deliveredOrdersCount: 42,
  returnedOrdersCount: 5,
  rtoRatePercent: 10.6
};

const DEFAULT_DISCREPANCIES: DiscrepancyItem[] = [
  {
    discrepancyId: "DISC_STF9812404",
    carrier: "steadfast",
    trackingCode: "STF9812404",
    orderRef: "ORD_2026_0918_A4",
    discrepancyType: "underpayment_cod",
    expectedAmountBdt: 3200,
    disbursedAmountBdt: 2800,
    shortageAmountBdt: 400,
    detectedAt: "2026-09-21T00:00:00Z",
    status: "open",
    claimBriefText: "Courier STEADFAST collected ৳2800 but booked value was ৳3200. Shortage of ৳400 claimed for order ORD_2026_0918_A4."
  }
];

const DEFAULT_RUNWAY_FORECAST: RunwayForecastResult = {
  currentLiquidCapitalBdt: 756900,
  pendingInTransitCodBdt: 229100,
  upcomingPayablesBdt: 120000,
  effectiveWorkingCapitalBdt: 859127,
  dailyBurnRateBdt: 18500,
  dailyRevenueInflowBdt: 25800,
  netDailyCashflowBdt: 7300,
  runwayDays: 180,
  runwayStatus: "healthy",
  trajectoryDays: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    projectedDate: `2026-10-${String(i + 1).padStart(2, "0")}`,
    projectedBalanceBdt: 859127 + (i + 1) * 7300 - (i === 9 || i === 19 ? 45000 : 0),
    inventoryRestockRequired: i === 9 || i === 19
  }))
};

export const MultiChannelCashflowModal: React.FC<MultiChannelCashflowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("liquid_overview");
  const [channels, setChannels] = useState<ChannelBalance[]>(DEFAULT_CHANNELS);
  const [liquiditySummary, setLiquiditySummary] = useState<any>({
    totalLiquidBankMfsBdt: 756900,
    totalInTransitCodBdt: 229100,
    totalGrossCapitalBdt: 986000,
    channels: DEFAULT_CHANNELS
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reconciler States
  const [selectedCarrier, setSelectedCarrier] = useState<"steadfast" | "pathao">("steadfast");
  const [settlementBatches, setSettlementBatches] = useState<CourierSettlementBatch[]>([
    {
      batchId: "SET_STEADFAST_SEED_01",
      carrier: "steadfast",
      settlementDate: "2026-09-20",
      consignmentsCount: 4,
      deliveredCount: 3,
      returnedCount: 1,
      grossCodCollectedBdt: 9000,
      deliveryFeesDeductedBdt: 370,
      codCommissionDeductedBdt: 90,
      rtoReturnFeesDeductedBdt: 60,
      netPayoutBdt: 8480,
      discrepanciesCount: 1,
      discrepanciesAmountBdt: 400,
      status: "discrepancy_detected",
      consignments: []
    }
  ]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Daily PnL States
  const [dailyPnL, setDailyPnL] = useState<DailyPnLSummary>(DEFAULT_DAILY_PNL);

  // Discrepancy States
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>(DEFAULT_DISCREPANCIES);
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});

  // Runway States
  const [runwayForecast, setRunwayForecast] = useState<RunwayForecastResult>(DEFAULT_RUNWAY_FORECAST);

  useEffect(() => {
    if (isOpen) {
      fetchLiquidity();
      fetchDailyPnL();
      fetchDiscrepancies();
      fetchRunwayForecast();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchLiquidity = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/cashflow/summary");
      const data = await res.json();
      if (data.success) {
        setLiquiditySummary(data.liquidity);
        setChannels(data.liquidity.channels);
      }
    } catch (err) {
      console.error("Failed to fetch liquidity summary", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyPnL = async () => {
    try {
      const res = await fetch("/api/v1/cashflow/daily-pnl");
      const data = await res.json();
      if (data.success) {
        setDailyPnL(data.dailyPnL);
      }
    } catch (err) {
      console.error("Failed to fetch daily PnL", err);
    }
  };

  const fetchDiscrepancies = async () => {
    try {
      const res = await fetch("/api/v1/cashflow/discrepancies");
      const data = await res.json();
      if (data.success) {
        setDiscrepancies(data.discrepancies);
      }
    } catch (err) {
      console.error("Failed to fetch discrepancies", err);
    }
  };

  const fetchRunwayForecast = async () => {
    try {
      const res = await fetch("/api/v1/cashflow/runway-forecast");
      const data = await res.json();
      if (data.success) {
        setRunwayForecast(data.forecast);
      }
    } catch (err) {
      console.error("Failed to fetch runway forecast", err);
    }
  };

  const handleReconcileSimulatedBatch = async () => {
    setIsReconciling(true);
    try {
      const res = await fetch("/api/v1/cashflow/reconcile-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: selectedCarrier,
          consignments: [
            {
              trackingCode: `${selectedCarrier === "steadfast" ? "STF" : "PAT"}_${Date.now().toString().slice(-6)}`,
              orderRef: `ORD_DHK_${Math.floor(Math.random() * 9000 + 1000)}`,
              destination: "Dhanmondi, Dhaka",
              expectedCodBdt: 3500,
              collectedCodBdt: 3500,
              deliveryFeeBdt: 80,
              codCommissionBdt: 35,
              returnFeeBdt: 0,
              deliveryStatus: "delivered"
            },
            {
              trackingCode: `${selectedCarrier === "steadfast" ? "STF" : "PAT"}_${(Date.now() + 1).toString().slice(-6)}`,
              orderRef: `ORD_CTG_${Math.floor(Math.random() * 9000 + 1000)}`,
              destination: "GEC Circle, Chittagong",
              expectedCodBdt: 4200,
              collectedCodBdt: 4200,
              deliveryFeeBdt: 130,
              codCommissionBdt: 42,
              returnFeeBdt: 0,
              deliveryStatus: "delivered"
            },
            {
              trackingCode: `${selectedCarrier === "steadfast" ? "STF" : "PAT"}_${(Date.now() + 2).toString().slice(-6)}`,
              orderRef: `ORD_RTO_${Math.floor(Math.random() * 9000 + 1000)}`,
              destination: "Uttara, Dhaka",
              expectedCodBdt: 2100,
              collectedCodBdt: 0,
              deliveryFeeBdt: 80,
              codCommissionBdt: 0,
              returnFeeBdt: 60,
              deliveryStatus: "returned"
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettlementBatches((prev) => [data.settlementBatch, ...prev]);
        fetchLiquidity();
      }
    } catch (err) {
      console.error("Settlement reconciliation error", err);
    } finally {
      setIsReconciling(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Autonomous Multi-Channel Cashflow & COD Settlement Reconciler
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Slice 38 · PnL & Runway
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                bKash/Nagad MFS fees, Steadfast/Pathao COD reconciliation, RTO freight loss absorption & 30-day working capital forecast
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">
              <span>⌘</span>M
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-6 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab("liquid_overview")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "liquid_overview"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Liquid Cash Position</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("courier_reconciler");
              if (settlementBatches.length === 0) handleReconcileSimulatedBatch();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "courier_reconciler"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Courier Settlement Reconciler</span>
          </button>

          <button
            onClick={() => setActiveTab("daily_pnl_radar")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "daily_pnl_radar"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Daily Net PnL Waterfall</span>
          </button>

          <button
            onClick={() => setActiveTab("discrepancy_auditor")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "discrepancy_auditor"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Discrepancy & Claim Auditor</span>
            {discrepancies.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold">
                {discrepancies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("runway_predictor")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "runway_predictor"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>30-Day Working Capital Runway</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: LIQUID CASH POSITION */}
          {activeTab === "liquid_overview" && (
            <div className="space-y-6">
              {/* Liquidity High-Level KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 block">Bank & MFS Liquid Capital</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-400">
                      ৳{liquiditySummary ? liquiditySummary.totalLiquidBankMfsBdt.toLocaleString() : "756,900"}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Immediate spendable cash across bKash, Nagad & Bank</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 block">In-Transit Courier COD Receivables</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-cyan-400">
                      ৳{liquiditySummary ? liquiditySummary.totalInTransitCodBdt.toLocaleString() : "229,100"}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Held by Steadfast (68 parcels) & Pathao (34 parcels)</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-1 bg-emerald-950/10">
                  <span className="text-xs text-zinc-300 block font-medium">Total Gross Working Capital</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-emerald-300">
                      ৳{liquiditySummary ? liquiditySummary.totalGrossCapitalBdt.toLocaleString() : "986,000"}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400/80">Liquid Capital + Realizable Courier Receivables</span>
                </div>
              </div>

              {/* Channel Breakdowns */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-200">Payment & Logistics Wallets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channels.map((ch) => (
                    <div
                      key={ch.channelId}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-zinc-200 text-sm">{ch.channelName}</div>
                          <span className="text-xs text-zinc-400 font-mono">{ch.accountNumber}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                          Fee: {ch.settlementFeePercent}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Liquid Balance</span>
                          <span className="font-bold text-emerald-400 text-sm">৳{ch.currentBalanceBdt.toLocaleString()}</span>
                        </div>
                        {ch.pendingReceivableBdt > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block uppercase">In-Transit COD</span>
                            <span className="font-bold text-cyan-400 text-sm">৳{ch.pendingReceivableBdt.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURIER SETTLEMENT RECONCILER */}
          {activeTab === "courier_reconciler" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Select Courier Provider</label>
                    <select
                      value={selectedCarrier}
                      onChange={(e: any) => setSelectedCarrier(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="steadfast">Steadfast Courier (Bi-Weekly Batch)</option>
                      <option value="pathao">Pathao Express (Weekly Settlement)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleReconcileSimulatedBatch}
                  disabled={isReconciling}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? "animate-spin" : ""}`} />
                  <span>{isReconciling ? "Reconciling Manifest..." : "Reconcile New Batch"}</span>
                </button>
              </div>

              {/* Settlement Batches Feed */}
              <div className="space-y-4">
                {settlementBatches.map((batch) => (
                  <div
                    key={batch.batchId}
                    className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4"
                  >
                    <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100 text-sm">{batch.batchId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                            {batch.carrier}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">Date: {batch.settlementDate} · {batch.consignmentsCount} Consignments</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Net Disbursed to Bank</span>
                        <span className="text-lg font-bold text-emerald-400">৳{batch.netPayoutBdt.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Deduction Breakdown Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 uppercase block">Gross COD Collected</span>
                        <span className="font-bold text-zinc-200">৳{batch.grossCodCollectedBdt.toLocaleString()}</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 uppercase block">Delivery Freight (-)</span>
                        <span className="font-bold text-red-400">-৳{batch.deliveryFeesDeductedBdt.toLocaleString()}</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 uppercase block">1% COD Comm (-)</span>
                        <span className="font-bold text-red-400">-৳{batch.codCommissionDeductedBdt.toLocaleString()}</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 uppercase block">RTO Return Fees (-)</span>
                        <span className="font-bold text-amber-400">-৳{batch.rtoReturnFeesDeductedBdt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DAILY PNL WATERFALL */}
          {activeTab === "daily_pnl_radar" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Daily Operating Unit Economics & Net Profit</h3>
                  <p className="text-xs text-zinc-400">
                    Comprehensive margin waterfall with RTO return loss absorption and MFS payment gateway deductions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Net Margin: {dailyPnL.netMarginPercent}%
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                    RTO Rate: {dailyPnL.rtoRatePercent}% ({dailyPnL.returnedOrdersCount} Returns)
                  </span>
                </div>
              </div>

              {/* Waterfall Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-semibold">
                  <span className="text-zinc-200 font-bold">1. Gross Delivered Revenue ({dailyPnL.deliveredOrdersCount} orders)</span>
                  <span className="text-emerald-400 text-sm font-bold">৳{dailyPnL.grossDeliveredRevenueBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs pl-6 text-zinc-400">
                  <span>(-) Cost of Goods Sold (COGS)</span>
                  <span className="text-red-400 font-medium">-৳{dailyPnL.cogsBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs pl-6 text-zinc-400">
                  <span>(-) Courier Forward Delivery Freight</span>
                  <span className="text-red-400 font-medium">-৳{dailyPnL.courierDeliveryFeesBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs pl-6 text-zinc-400">
                  <span>(-) Courier 1% COD Collection Commission</span>
                  <span className="text-red-400 font-medium">-৳{dailyPnL.codCommissionFeesBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs pl-6 text-amber-300">
                  <span>(-) RTO Failed Delivery Freight Loss ({dailyPnL.returnedOrdersCount} returns)</span>
                  <span className="font-bold text-amber-400">-৳{dailyPnL.rtoFreightLossBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs pl-6 text-zinc-400">
                  <span>(-) MFS Payment Gateway Fees (1.5% bKash / 1.2% Nagad)</span>
                  <span className="text-red-400 font-medium">-৳{dailyPnL.mfsProcessingFeesBdt.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-xs pl-6 text-zinc-400">
                  <span>(-) Advertising (Meta/TikTok) & Packaging</span>
                  <span className="text-red-400 font-medium">
                    -৳{(dailyPnL.adSpendBdt + dailyPnL.packagingCostBdt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-sm font-bold">
                  <span className="text-emerald-300">(=) Realized Daily Net Operating Cashflow</span>
                  <span className="text-emerald-400 text-lg">৳{dailyPnL.netOperatingProfitBdt.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISCREPANCY & CLAIM AUDITOR */}
          {activeTab === "discrepancy_auditor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Carrier Underpayment & Weight Overcharge Radar</h3>
                  <p className="text-xs text-zinc-400">
                    Automated reconciliation flags discrepancies between booked COD value and actual courier remittance
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {discrepancies.length} Actionable Claims
                </span>
              </div>

              <div className="space-y-3">
                {discrepancies.map((disc) => (
                  <div
                    key={disc.discrepancyId}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-amber-500/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100 text-sm">{disc.trackingCode}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300">
                            {disc.carrier} · {disc.discrepancyType}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">Order Ref: {disc.orderRef}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase">Unremitted Shortage</span>
                        <span className="text-base font-bold text-amber-400">৳{disc.shortageAmountBdt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                      {disc.claimBriefText}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => copyToClipboard(disc.claimBriefText, disc.discrepancyId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
                      >
                        {copiedId === disc.discrepancyId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === disc.discrepancyId ? "Copied" : "Copy Brief"}</span>
                      </button>

                      <button
                        onClick={() =>
                          setClaimedIds((prev) => ({
                            ...prev,
                            [disc.discrepancyId]: true
                          }))
                        }
                        disabled={claimedIds[disc.discrepancyId]}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          claimedIds[disc.discrepancyId]
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-600 hover:bg-amber-500 text-white"
                        }`}
                      >
                        {claimedIds[disc.discrepancyId] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Claim Ticket Logged</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Dispatch Carrier Claim</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RUNWAY PREDICTOR */}
          {activeTab === "runway_predictor" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 block">Effective Working Capital</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ৳{runwayForecast.effectiveWorkingCapitalBdt.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-500">Liquid + Realizable COD - Upcoming Payables</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 block">Daily Net Cash Inflow</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    +৳{runwayForecast.netDailyCashflowBdt.toLocaleString()}/day
                  </span>
                  <span className="text-[11px] text-zinc-500">Revenue Inflow (৳25.8k) vs Burn (৳18.5k)</span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/30 space-y-1 bg-emerald-950/10">
                  <span className="text-xs text-zinc-300 block font-medium">Working Capital Runway</span>
                  <span className="text-2xl font-bold text-emerald-300">
                    {runwayForecast.runwayDays}+ Days
                  </span>
                  <span className="text-[11px] text-emerald-400/80">Sustainable positive operational cashflow</span>
                </div>
              </div>

              {/* 30-Day Cash Trajectory */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  30-Day Liquidity Trajectory & Restocking Schedule:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {runwayForecast.trajectoryDays.slice(0, 18).map((day) => (
                    <div
                      key={day.day}
                      className={`p-2.5 rounded-lg border text-center text-xs space-y-1 ${
                        day.inventoryRestockRequired
                          ? "bg-amber-950/20 border-amber-500/40"
                          : "bg-zinc-900/50 border-zinc-800"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-500 block">Day {day.day}</span>
                      <span className="font-bold text-zinc-200 text-xs">৳{(day.projectedBalanceBdt / 1000).toFixed(0)}k</span>
                      {day.inventoryRestockRequired && (
                        <span className="text-[9px] text-amber-400 font-medium block">Restock Order</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Multi-Channel Cashflow Reconciler Online · bKash / Nagad / Steadfast / Pathao Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
