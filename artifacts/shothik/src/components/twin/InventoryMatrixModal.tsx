import React, { useState, useEffect } from "react";
import {
  Boxes,
  Layers,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Truck,
  FileText,
  DollarSign,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

export interface InventoryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryMatrixModal: React.FC<InventoryMatrixModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"matrix" | "prediction" | "rebalance" | "po">("matrix");
  const [items, setItems] = useState<any[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>("SHOTHIK-TSHIRT-BLK-M");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Channel edit state
  const [editChannels, setEditChannels] = useState({ daraz: 100, shopify: 80, woocommerce: 40, whatsapp: 60, darkHubReserve: 40 });
  const [saveLoading, setSaveLoading] = useState(false);

  // Prediction state
  const [prediction, setPrediction] = useState<any | null>(null);

  // Rebalance state
  const [rebalanceData, setRebalanceData] = useState<{ hubs: any[]; recommendations: any[] }>({ hubs: [], recommendations: [] });

  // PO state
  const [poQuantity, setPoQuantity] = useState(100);
  const [generatedPo, setGeneratedPo] = useState<any | null>(null);

  // Keyboard shortcut ⌘I / Ctrl+I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = async () => {
    try {
      const res = await fetch("/api/inventory/items");
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        const current = data.items.find((it: any) => it.sku === selectedSku) || data.items[0];
        setSelectedItem(current);
        setSelectedSku(current.sku);
        setEditChannels(current.channels);
        loadPrediction(current.sku);
        loadRebalance(current.sku);
      }
    } catch {
      // Fallback
    }
  };

  const loadPrediction = async (sku: string) => {
    try {
      const res = await fetch(`/api/inventory/items/${sku}/prediction`);
      const data = await res.json();
      if (data.prediction) {
        setPrediction(data.prediction);
      }
    } catch {
      // Fallback
    }
  };

  const loadRebalance = async (sku: string) => {
    try {
      const res = await fetch(`/api/inventory/items/${sku}/rebalance`);
      const data = await res.json();
      setRebalanceData({ hubs: data.hubs || [], recommendations: data.recommendations || [] });
    } catch {
      // Fallback
    }
  };

  const handleSaveChannels = async () => {
    if (!selectedSku) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/inventory/items/${selectedSku}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editChannels),
      });
      const data = await res.json();
      if (data.item) {
        setSelectedItem(data.item);
        await loadItems();
      }
    } catch {
      // Ignore
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreatePo = async () => {
    if (!selectedSku) return;
    try {
      const res = await fetch("/api/inventory/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: selectedSku, quantity: poQuantity }),
      });
      const data = await res.json();
      if (data.purchaseOrder) {
        setGeneratedPo(data.purchaseOrder);
      }
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-slate-100">Multi-Channel Inventory Matrix & Prediction</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Omni-Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Daraz · Shopify · WooCommerce · WhatsApp · Dark Hub Rebalancer
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "matrix" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Channel Matrix
            </button>
            <button
              onClick={() => setActiveTab("prediction")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "prediction" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Stock-Out Radar
            </button>
            <button
              onClick={() => setActiveTab("rebalance")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "rebalance" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Dark Hub Rebalance
            </button>
            <button
              onClick={() => setActiveTab("po")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "po" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Supplier PO
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: CHANNEL MATRIX */}
          {activeTab === "matrix" && (
            <div className="grid grid-cols-3 gap-6">
              {/* SKU List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog SKUs</span>
                {items.map((it) => (
                  <div
                    key={it.sku}
                    onClick={() => {
                      setSelectedSku(it.sku);
                      setSelectedItem(it);
                      setEditChannels(it.channels);
                      loadPrediction(it.sku);
                      loadRebalance(it.sku);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedSku === it.sku
                        ? "bg-amber-950/40 border-amber-500 shadow ring-1 ring-amber-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 font-mono">{it.sku}</span>
                      <span className="text-xs font-bold text-slate-200">{it.totalStock} in stock</span>
                    </div>
                    <h5 className="text-xs font-medium text-slate-300 mt-1 line-clamp-1">{it.name}</h5>
                  </div>
                ))}
              </div>

              {/* Channel Allocation Editor */}
              <div className="col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{selectedItem?.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{selectedItem?.sku}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    Total: <strong className="text-amber-400">{editChannels.daraz + editChannels.shopify + editChannels.woocommerce + editChannels.whatsapp + editChannels.darkHubReserve}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Daraz Bangladesh</label>
                    <input
                      type="number"
                      value={editChannels.daraz}
                      onChange={(e) => setEditChannels({ ...editChannels, daraz: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Shopify Storefront</label>
                    <input
                      type="number"
                      value={editChannels.shopify}
                      onChange={(e) => setEditChannels({ ...editChannels, shopify: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">WooCommerce</label>
                    <input
                      type="number"
                      value={editChannels.woocommerce}
                      onChange={(e) => setEditChannels({ ...editChannels, woocommerce: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">WhatsApp Commerce</label>
                    <input
                      type="number"
                      value={editChannels.whatsapp}
                      onChange={(e) => setEditChannels({ ...editChannels, whatsapp: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Dark Hub Local Reserve (Physical Outlets)</label>
                    <input
                      type="number"
                      value={editChannels.darkHubReserve}
                      onChange={(e) => setEditChannels({ ...editChannels, darkHubReserve: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveChannels}
                  disabled={saveLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  {saveLoading ? "Syncing Channels..." : "Update & Sync All 5 Channels"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PREDICTION */}
          {activeTab === "prediction" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Daily Sales Velocity</span>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                    {prediction?.dailySalesVelocity || 0} <span className="text-xs text-slate-400">units/day</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Days of Inventory Remaining (DIR)</span>
                  <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                    {prediction?.daysRemaining || 0} <span className="text-xs text-slate-400">days left</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Recommended Reorder</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {prediction?.recommendedReorderQty || 0} <span className="text-xs text-slate-400">units</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-100">Stock-Out Risk Status</h4>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    prediction?.status === "CRITICAL_STOCKOUT"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : prediction?.status === "REORDER_SOON"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {prediction?.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Lead time from supplier is <strong>{prediction?.leadTimeDays} days</strong>. Triggering reorder now avoids zero-stock stockout during high velocity weekends.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REBALANCE */}
          {activeTab === "rebalance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {rebalanceData.hubs.map((h) => (
                  <div key={h.hubId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-200">{h.hubName}</span>
                    <div className="text-lg font-bold text-amber-400 font-mono">{h.allocatedStock} units</div>
                    <div className="text-[11px] text-slate-400">{h.daysRemaining} days runway</div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" /> AI Inter-Hub Transfer Suggestions
                </h4>
                {rebalanceData.recommendations.length === 0 ? (
                  <p className="text-xs text-slate-400">All hubs have balanced runway capacity.</p>
                ) : (
                  rebalanceData.recommendations.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{r.sourceHubName} ➔ {r.targetHubName}</div>
                        <p className="text-slate-400 mt-0.5">{r.reason}</p>
                      </div>
                      <span className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        Transfer {r.transferQuantity} Units
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PO */}
          {activeTab === "po" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Procurement Purchase Order
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Reorder Quantity</label>
                  <input
                    type="number"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                  <div>Supplier: <strong>{selectedItem?.supplier?.name}</strong></div>
                  <div>Phone: <strong>{selectedItem?.supplier?.phone}</strong></div>
                  <div>Estimated Cost: <strong>৳{(poQuantity * (selectedItem?.unitCostBdt || 0)).toLocaleString()} BDT</strong></div>
                </div>

                <button
                  onClick={handleCreatePo}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  Generate Signed Supplier PO & 30% bKash Escrow
                </button>
              </div>

              {/* PO Preview */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-sm font-semibold text-slate-100">Wholesale Purchase Order</span>
                    {generatedPo && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        {generatedPo.poNumber}
                      </span>
                    )}
                  </div>

                  {generatedPo ? (
                    <div className="my-4 space-y-2 text-xs font-mono">
                      <div><span className="text-slate-500">Supplier:</span> <span className="text-slate-200">{generatedPo.supplier?.name}</span></div>
                      <div><span className="text-slate-500">Delivery Hub:</span> <span className="text-slate-200">{generatedPo.buyer?.deliveryHub}</span></div>
                      <div><span className="text-slate-500">Total Amount:</span> <span className="text-amber-400 font-bold">৳{generatedPo.totalAmountBdt?.toLocaleString()} BDT</span></div>
                      <div><span className="text-slate-500">30% Advance Escrow:</span> <span className="text-emerald-400 font-bold">৳{generatedPo.advancePaymentBdt?.toLocaleString()} BDT</span></div>
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-slate-500">Cryptographic Seal:</span>
                        <div className="text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded mt-1 border border-slate-800">
                          {generatedPo.signedHashSeal}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      Click generate to compile wholesale purchase order
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
