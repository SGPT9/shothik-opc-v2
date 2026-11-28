import React, { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Route,
  Navigation,
  Clock,
  Zap,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Barcode,
  Search,
  RefreshCw,
  X,
  Boxes,
  ShieldAlert,
  Percent,
  TrendingDown,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  Truck
} from "lucide-react";

interface DarkHubFulfillmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "hubs_network" | "fast_routing" | "pick_optimizer" | "fefo_expiry_radar" | "interhub_rebalance";

interface DarkHub {
  hubId: string;
  name: string;
  city: "Dhaka" | "Chittagong" | "Sylhet" | "Rajshahi";
  zone: string;
  coveredThanas: string[];
  capacityUnits: number;
  utilizedUnits: number;
  status: "active" | "maintenance" | "overloaded";
  averageDispatchMinutes: number;
  contactNumber: string;
  address: string;
  metrics?: {
    totalSkuCount: number;
    totalStockUnits: number;
    utilizationPercent: number;
  };
}

interface PickTask {
  pickSequence: number;
  sku: string;
  itemName: string;
  batchNumber: string;
  binLocation: string;
  aisle: number;
  rack: number;
  shelf: number;
  bin: number;
  quantityToPick: number;
  expiryDate: string;
  barcode: string;
}

interface ExpiryAlert {
  itemId: string;
  sku: string;
  name: string;
  hubId: string;
  hubName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysRemaining: number;
  urgency: "critical" | "high" | "medium" | "safe";
  recommendedDiscountPercent: number;
  suggestedMarkdownPriceBDT: number;
  originalPriceBDT: number;
}

interface RebalanceTransfer {
  sourceHubId: string;
  sourceHubName: string;
  destinationHubId: string;
  destinationHubName: string;
  sku: string;
  itemName: string;
  transferQuantity: number;
  reason: string;
  priority: "urgent" | "standard" | "routine";
  estimatedCostBDT: number;
}

export const DarkHubFulfillmentModal: React.FC<DarkHubFulfillmentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("hubs_network");
  const [hubs, setHubs] = useState<DarkHub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Routing Simulator States
  const [selectedThana, setSelectedThana] = useState("Dhanmondi");
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Pick Path Optimizer States
  const [selectedHubForPick, setSelectedHubForPick] = useState("HUB-DHK-01");
  const [pickListResult, setPickListResult] = useState<any>(null);
  const [isGeneratingPick, setIsGeneratingPick] = useState(false);

  // Expiry Alerts States
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [appliedMarkdownSku, setAppliedMarkdownSku] = useState<string | null>(null);

  // Rebalance States
  const [rebalancePlan, setRebalancePlan] = useState<any>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [dispatchedTransfers, setDispatchedTransfers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      fetchHubs();
      fetchExpiryAlerts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
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

  const fetchHubs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/fulfillment/hubs");
      const data = await res.json();
      if (data.success) {
        setHubs(data.hubs);
      }
    } catch (err) {
      console.error("Failed to fetch dark hubs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpiryAlerts = async () => {
    try {
      const res = await fetch("/api/v1/fulfillment/expiry-alerts?referenceDate=2026-09-21");
      const data = await res.json();
      if (data.success) {
        setExpiryAlerts(data.alerts);
      }
    } catch (err) {
      console.error("Failed to fetch expiry alerts", err);
    }
  };

  const handleSimulateRouting = async () => {
    setIsRouting(true);
    try {
      const res = await fetch("/api/v1/fulfillment/route-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerThana: selectedThana,
          items: [
            { sku: "SKU_SHAMPOO_ONION_250ML", quantity: 2 },
            { sku: "SKU_SERUM_VITC_30ML", quantity: 1 }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setRoutingResult(data.routing);
      }
    } catch (err) {
      console.error("Routing error", err);
    } finally {
      setIsRouting(false);
    }
  };

  const handleGeneratePickPath = async () => {
    setIsGeneratingPick(true);
    try {
      const res = await fetch("/api/v1/fulfillment/pick-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hubId: selectedHubForPick,
          items: [
            { sku: "SKU_SHAMPOO_ONION_250ML", quantity: 12 },
            { sku: "SKU_SERUM_VITC_30ML", quantity: 4 },
            { sku: "SKU_MUSTARD_OIL_1L", quantity: 3 }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setPickListResult(data.pickList);
      }
    } catch (err) {
      console.error("Pick list generation error", err);
    } finally {
      setIsGeneratingPick(false);
    }
  };

  const handleComputeRebalance = async () => {
    setIsRebalancing(true);
    try {
      const res = await fetch("/api/v1/fulfillment/rebalance-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setRebalancePlan(data.rebalancePlan);
      }
    } catch (err) {
      console.error("Rebalance computation error", err);
    } finally {
      setIsRebalancing(false);
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
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Autonomous Hyperlocal Dark Store & Micro-Hub Orchestrator
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Slice 37 · Sub-30m SLA
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Multi-hub Dhaka/Chittagong/Sylhet geofencing, S-curve bin pick path, FEFO expiry radar & inter-hub rebalance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">
              <span>⌘</span>H
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
            onClick={() => setActiveTab("hubs_network")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "hubs_network"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Dark Hubs Network</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-zinc-800 text-zinc-300">
              {hubs.length || 9}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("fast_routing");
              if (!routingResult) handleSimulateRouting();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "fast_routing"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Hyperlocal Thana Router</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pick_optimizer");
              if (!pickListResult) handleGeneratePickPath();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "pick_optimizer"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>S-Curve Bin Pick-Path</span>
          </button>

          <button
            onClick={() => setActiveTab("fefo_expiry_radar")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "fefo_expiry_radar"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FEFO Expiry Radar</span>
            {expiryAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold">
                {expiryAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("interhub_rebalance");
              if (!rebalancePlan) handleComputeRebalance();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "interhub_rebalance"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Inter-Hub Rebalance</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DARK HUBS NETWORK */}
          {activeTab === "hubs_network" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Active Regional Dark Store Network</h3>
                  <p className="text-xs text-zinc-400">
                    High-density micro-fulfillment facilities enabling sub-30 minute order dispatch across Bangladesh
                  </p>
                </div>
                <button
                  onClick={fetchHubs}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hubs.map((hub) => (
                  <div
                    key={hub.hubId}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 text-sm">{hub.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{hub.city} · {hub.zone}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {hub.hubId}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-1">{hub.address}</p>

                    {/* Capacity and SLA Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 block">Avg Dispatch SLA</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs font-semibold text-cyan-300">{hub.averageDispatchMinutes} mins</span>
                        </div>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 block">Utilization</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-300">
                            {hub.metrics?.utilizationPercent || Math.round((hub.utilizedUnits / hub.capacityUnits) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thana Geofencing */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Geofenced Coverage:</span>
                      <div className="flex flex-wrap gap-1">
                        {hub.coveredThanas.map((thana, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                          >
                            {thana}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HYPERLOCAL THANA ROUTER */}
          {activeTab === "fast_routing" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-200">Customer Location & Order Input</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Customer Delivery Thana</label>
                    <select
                      value={selectedThana}
                      onChange={(e) => setSelectedThana(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Dhanmondi">Dhanmondi (Dhaka)</option>
                      <option value="Kalabagan">Kalabagan (Dhaka)</option>
                      <option value="Uttara">Uttara Sector 11 (Dhaka)</option>
                      <option value="Mirpur">Mirpur 10 (Dhaka)</option>
                      <option value="Gulshan">Gulshan 2 (Dhaka)</option>
                      <option value="Badda">Badda (Dhaka)</option>
                      <option value="Kotwali">Old Dhaka Kotwali</option>
                      <option value="GEC Circle">Chittagong GEC Circle</option>
                      <option value="Zindabazar">Sylhet Zindabazar</option>
                      <option value="Shaheb Bazar">Rajshahi Shaheb Bazar</option>
                      <option value="Narayanganj Sadar">Narayanganj Sadar (Out of Hub Matrix)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Target Fast SLA Policy</label>
                    <div className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-400 font-medium">
                      Sub-30 Min Urban Instant Dispatch
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSimulateRouting}
                      disabled={isRouting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isRouting ? "Resolving Geofence..." : "Route to Optimal Hub"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {routingResult && (
                <div className="p-5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-100">
                          Assigned Hub: {routingResult.assignedHub.name} ({routingResult.assignedHub.hubId})
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Fulfillment Mode:{" "}
                          <span className="text-emerald-300 font-medium uppercase">{routingResult.fulfilmentType}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Est. Delivery SLA</span>
                      <span className="text-lg font-bold text-emerald-400">{routingResult.estimatedDeliveryMinutes} Minutes</span>
                    </div>
                  </div>

                  {/* Allocated Items with FEFO Lot details */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      FEFO Lot & 3D Bin Allocation:
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {routingResult.allocatedItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-medium text-zinc-200">{item.sku}</span>
                            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                              <span>Batch: <code className="text-emerald-400">{item.batchNumber}</code></span>
                              <span>Expiry: <span className="text-zinc-300">{item.expiryDate}</span></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-300 font-mono text-[11px]">
                              Bin: {item.binLocation}
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                              {item.allocatedQty} Units
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: S-CURVE BIN PICK-PATH */}
          {activeTab === "pick_optimizer" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Select Dark Fulfillment Store</label>
                    <select
                      value={selectedHubForPick}
                      onChange={(e) => setSelectedHubForPick(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="HUB-DHK-01">Dhanmondi Express Dark Store (HUB-DHK-01)</option>
                      <option value="HUB-DHK-02">Uttara Fast-Hub (HUB-DHK-02)</option>
                      <option value="HUB-DHK-03">Mirpur Micro-Fulfillment (HUB-DHK-03)</option>
                      <option value="HUB-DHK-04">Gulshan-Badda Hub (HUB-DHK-04)</option>
                      <option value="HUB-DHK-00">Tejgaon Central Mega-Hub (HUB-DHK-00)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGeneratePickPath}
                  disabled={isGeneratingPick}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>{isGeneratingPick ? "Optimizing Path..." : "Generate S-Curve Path"}</span>
                </button>
              </div>

              {pickListResult && (
                <div className="space-y-4">
                  {/* Pick Summary Bar */}
                  <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Pick List Ref</span>
                      <p className="text-xs font-mono font-semibold text-emerald-400">{pickListResult.pickListId}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Total Items</span>
                      <p className="text-base font-bold text-zinc-100">{pickListResult.totalQuantity} Units</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Est. Pick Time</span>
                      <p className="text-base font-bold text-cyan-400">{pickListResult.estimatedPickTimeSeconds}s</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase">Picker Walking</span>
                      <p className="text-base font-bold text-amber-400">{pickListResult.estimatedWalkingMeters} Meters</p>
                    </div>
                  </div>

                  {/* S-Curve Step-by-Step Pick Sequence */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Serpentine (S-Curve) Step-by-Step Picking Sequence:
                    </h4>
                    <div className="space-y-2">
                      {pickListResult.tasks.map((task: PickTask) => (
                        <div
                          key={task.pickSequence}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              {task.pickSequence}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-200">{task.itemName}</div>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                                <span>SKU: {task.sku}</span>
                                <span>Lot: <code className="text-emerald-400">{task.batchNumber}</code></span>
                                <span>Barcode: <code className="text-zinc-400">{task.barcode}</code></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-right">
                              <span className="text-[10px] text-zinc-500 block uppercase">3D Bin Coord</span>
                              <span className="font-mono text-xs font-bold text-cyan-300">{task.binLocation}</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                              Pick: {task.quantityToPick}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FEFO EXPIRY RADAR */}
          {activeTab === "fefo_expiry_radar" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">First-Expired, First-Out (FEFO) Inventory Watch</h3>
                  <p className="text-xs text-zinc-400">
                    Proactive perishable & FMCG expiration mitigation with automated liquidation discounts
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {expiryAlerts.length} Batches Near Expiry Threshold
                </span>
              </div>

              <div className="space-y-3">
                {expiryAlerts.map((alert) => (
                  <div
                    key={alert.itemId}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.urgency === "critical"
                        ? "bg-red-950/20 border-red-500/40"
                        : alert.urgency === "high"
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-zinc-900/60 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 text-sm">{alert.name}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                              alert.urgency === "critical"
                                ? "bg-red-500/20 text-red-300"
                                : alert.urgency === "high"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {alert.urgency} ({alert.daysRemaining} days left)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>Hub: <strong className="text-zinc-300">{alert.hubName}</strong></span>
                          <span>Lot: <code className="text-zinc-300">{alert.batchNumber}</code></span>
                          <span>Stock: <strong className="text-zinc-200">{alert.quantity} units</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Expiry Date</span>
                        <span className="text-xs font-mono font-bold text-zinc-200">{alert.expiryDate}</span>
                      </div>
                    </div>

                    {/* Markdown Recommendation Action */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Recommended Markdown: {alert.recommendedDiscountPercent}% OFF</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500 line-through">৳{alert.originalPriceBDT}</span>
                          <span className="font-bold text-emerald-400">৳{alert.suggestedMarkdownPriceBDT}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAppliedMarkdownSku(alert.sku);
                          setTimeout(() => setAppliedMarkdownSku(null), 3000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                      >
                        {appliedMarkdownSku === alert.sku ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Flash Sale Triggered!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>1-Tap Flash Clearance</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTER-HUB REBALANCE */}
          {activeTab === "interhub_rebalance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Velocity-Driven Inter-Hub Stock Balancing</h3>
                  <p className="text-xs text-zinc-400">
                    Automated replenishment routing from Tejgaon Central Mega-Hub to depleted regional micro-hubs
                  </p>
                </div>
                <button
                  onClick={handleComputeRebalance}
                  disabled={isRebalancing}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isRebalancing ? "Calculating Velocity..." : "Re-Calculate Transfers"}</span>
                </button>
              </div>

              {rebalancePlan && (
                <div className="space-y-4">
                  {/* Hub Health Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(rebalancePlan.hubHealthScores).map(([hubId, health]: any) => (
                      <div
                        key={hubId}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-200">{hubId}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              health.stockoutRisk === "high"
                                ? "bg-red-500/20 text-red-300"
                                : health.stockoutRisk === "medium"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {health.stockoutRisk} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Stock Cover: <strong className="text-zinc-200">{health.daysOfCover} days</strong>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Transfer Manifest */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Recommended Replenishment Transfers ({rebalancePlan.transfers.length}):
                    </h4>
                    <div className="space-y-2">
                      {rebalancePlan.transfers.map((t: RebalanceTransfer, idx: number) => {
                        const transferKey = `${t.sourceHubId}-${t.destinationHubId}-${t.sku}-${idx}`;
                        const isDispatched = dispatchedTransfers[transferKey];

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-100">{t.itemName}</span>
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">
                                  {t.sku}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                                <span>{t.sourceHubName}</span>
                                <ChevronRight className="w-3 h-3 text-zinc-600" />
                                <span className="text-emerald-400 font-medium">{t.destinationHubName}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500">{t.reason}</p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-500 block uppercase">Units</span>
                                <span className="text-base font-bold text-cyan-400">{t.transferQuantity}</span>
                              </div>
                              <button
                                onClick={() =>
                                  setDispatchedTransfers((prev) => ({
                                    ...prev,
                                    [transferKey]: true
                                  }))
                                }
                                disabled={isDispatched}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                  isDispatched
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-cyan-600 hover:bg-cyan-500 text-white"
                                }`}
                              >
                                {isDispatched ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Manifest Dispatched</span>
                                  </>
                                ) : (
                                  <>
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Dispatch Truck</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hyperlocal Micro-Hub Engine Online · 9 Hubs Active</span>
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
