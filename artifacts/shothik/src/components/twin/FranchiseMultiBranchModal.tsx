import React, { useState, useEffect } from "react";
import {
  Building2,
  Package,
  Layers,
  TrendingUp,
  ArrowRightLeft,
  Truck,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";

interface FranchiseMultiBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "matrix" | "commission" | "transfers" | "settlement";

interface FranchiseBranch {
  branchId: string;
  branchName: string;
  territory: string;
  address: string;
  type: "central_hub" | "franchise_outlet" | "regional_warehouse" | "pop_up";
  managerName: string;
  managerPhone: string;
  subMerchantWallet: string;
  royaltyRatePct: number;
  status: "active" | "inactive" | "suspended";
  stockHoldings: Record<string, number>;
  totalSalesVolumeBdt: number;
  totalRoyaltyOwedBdt: number;
  totalRoyaltyPaidBdt: number;
}

interface InterBranchTransfer {
  transferId: string;
  sku: string;
  productName: string;
  quantity: number;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  status: "pending_dispatch" | "in_transit" | "received" | "rejected";
  courierProvider: "internal_van" | "steadfast" | "pathao_courier";
  trackingCode?: string;
  verificationCode: string;
  initiatedAt: string;
}

interface FranchiseSaleRecord {
  saleId: string;
  branchId: string;
  branchName: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCostPriceBdt: number;
  unitSellingPriceBdt: number;
  grossTotalBdt: number;
  cogsTotalBdt: number;
  grossProfitBdt: number;
  masterRoyaltyBdt: number;
  franchiseeNetProfitBdt: number;
  paymentMethod: string;
  recordedAt: string;
}

const DEFAULT_BRANCHES: FranchiseBranch[] = [
  {
    branchId: "BRANCH_DHK_CENTRAL",
    branchName: "Tejgaon Central Fulfillment Hub",
    territory: "Dhaka Central",
    address: "128/A Tejgaon I/A, Dhaka-1208",
    type: "central_hub",
    managerName: "Master Ops Lead",
    managerPhone: "+8801700000001",
    subMerchantWallet: "+8801700000001",
    royaltyRatePct: 0,
    status: "active",
    stockHoldings: {
      "SKU-PANJABI-BLK": 500,
      "SKU-EARBUDS-TWS": 1200,
      "SKU-CHARGER-65W": 800,
      "SKU-SAREE-SILK": 350,
    },
    totalSalesVolumeBdt: 1250000,
    totalRoyaltyOwedBdt: 0,
    totalRoyaltyPaidBdt: 0,
  },
  {
    branchId: "BRANCH_DHK_DHANMONDI",
    branchName: "Dhanmondi 27 Outlet",
    territory: "Dhaka West",
    address: "House 14, Road 27, Dhanmondi, Dhaka",
    type: "franchise_outlet",
    managerName: "Tanvir Hossain",
    managerPhone: "+8801711223344",
    subMerchantWallet: "+8801711223344",
    royaltyRatePct: 15,
    status: "active",
    stockHoldings: {
      "SKU-PANJABI-BLK": 43,
      "SKU-EARBUDS-TWS": 80,
      "SKU-CHARGER-65W": 30,
      "SKU-SAREE-SILK": 18,
    },
    totalSalesVolumeBdt: 385000,
    totalRoyaltyOwedBdt: 28875,
    totalRoyaltyPaidBdt: 15000,
  },
  {
    branchId: "BRANCH_DHK_BANANI",
    branchName: "Banani Road 11 Boutique",
    territory: "Dhaka North",
    address: "Plot 52, Road 11, Block D, Banani, Dhaka",
    type: "franchise_outlet",
    managerName: "Nusrat Jahan",
    managerPhone: "+8801822334455",
    subMerchantWallet: "+8801822334455",
    royaltyRatePct: 18,
    status: "active",
    stockHoldings: {
      "SKU-PANJABI-BLK": 60,
      "SKU-EARBUDS-TWS": 40,
      "SKU-CHARGER-65W": 25,
      "SKU-SAREE-SILK": 35,
    },
    totalSalesVolumeBdt: 420000,
    totalRoyaltyOwedBdt: 37800,
    totalRoyaltyPaidBdt: 20000,
  },
  {
    branchId: "BRANCH_CTG_GEC",
    branchName: "Chittagong GEC Circle Node",
    territory: "Chittagong Metro",
    address: "GEC Circle, CDA Avenue, Chittagong",
    type: "regional_warehouse",
    managerName: "Farhan Karim",
    managerPhone: "+8801844556677",
    subMerchantWallet: "+8801844556677",
    royaltyRatePct: 12,
    status: "active",
    stockHoldings: {
      "SKU-PANJABI-BLK": 85,
      "SKU-EARBUDS-TWS": 150,
      "SKU-CHARGER-65W": 90,
      "SKU-SAREE-SILK": 40,
    },
    totalSalesVolumeBdt: 290000,
    totalRoyaltyOwedBdt: 17400,
    totalRoyaltyPaidBdt: 10000,
  },
];

const DEFAULT_TRANSFERS: InterBranchTransfer[] = [
  {
    transferId: "IBST_8821AF",
    sku: "SKU-CHARGER-65W",
    productName: "65W GaN Fast Charger",
    quantity: 50,
    sourceBranchId: "BRANCH_DHK_CENTRAL",
    sourceBranchName: "Tejgaon Central Fulfillment Hub",
    destinationBranchId: "BRANCH_DHK_DHANMONDI",
    destinationBranchName: "Dhanmondi 27 Outlet",
    status: "in_transit",
    courierProvider: "internal_van",
    trackingCode: "TRX-IBST-8821AF",
    verificationCode: "492104",
    initiatedAt: "2026-09-19T08:30:00Z",
  },
  {
    transferId: "IBST_9934BC",
    sku: "SKU-PANJABI-BLK",
    productName: "Royal Platinum Silk Panjabi",
    quantity: 30,
    sourceBranchId: "BRANCH_DHK_CENTRAL",
    sourceBranchName: "Tejgaon Central Fulfillment Hub",
    destinationBranchId: "BRANCH_CTG_GEC",
    destinationBranchName: "Chittagong GEC Circle Node",
    status: "in_transit",
    courierProvider: "steadfast",
    trackingCode: "BD_STEADFAST_993821",
    verificationCode: "718293",
    initiatedAt: "2026-09-19T09:15:00Z",
  },
];

const DEFAULT_SALES: FranchiseSaleRecord[] = [
  {
    saleId: "SALE_DHK_991",
    branchId: "BRANCH_DHK_DHANMONDI",
    branchName: "Dhanmondi 27 Outlet",
    sku: "SKU-PANJABI-BLK",
    productName: "Royal Platinum Silk Panjabi",
    quantity: 2,
    unitCostPriceBdt: 1800,
    unitSellingPriceBdt: 3500,
    grossTotalBdt: 7000,
    cogsTotalBdt: 3600,
    grossProfitBdt: 3400,
    masterRoyaltyBdt: 510,
    franchiseeNetProfitBdt: 2890,
    paymentMethod: "bkash_sub_merchant",
    recordedAt: "2026-09-19T09:45:00Z",
  },
  {
    saleId: "SALE_BAN_882",
    branchId: "BRANCH_DHK_BANANI",
    branchName: "Banani Road 11 Boutique",
    sku: "SKU-EARBUDS-TWS",
    productName: "Wireless ANC TWS Earbuds",
    quantity: 3,
    unitCostPriceBdt: 1200,
    unitSellingPriceBdt: 2400,
    grossTotalBdt: 7200,
    cogsTotalBdt: 3600,
    grossProfitBdt: 3600,
    masterRoyaltyBdt: 648,
    franchiseeNetProfitBdt: 2952,
    paymentMethod: "cash_pos",
    recordedAt: "2026-09-19T10:10:00Z",
  },
];

export const FranchiseMultiBranchModal: React.FC<FranchiseMultiBranchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("matrix");
  const [branches, setBranches] = useState<FranchiseBranch[]>(DEFAULT_BRANCHES);
  const [transfers, setTransfers] = useState<InterBranchTransfer[]>(DEFAULT_TRANSFERS);
  const [sales, setSales] = useState<FranchiseSaleRecord[]>(DEFAULT_SALES);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Transfer Drawer State
  const [showNewTransfer, setShowNewTransfer] = useState(false);
  const [transferSku, setTransferSku] = useState("SKU-PANJABI-BLK");
  const [transferQty, setTransferQty] = useState(20);
  const [transferSrc, setTransferSrc] = useState("BRANCH_DHK_CENTRAL");
  const [transferDst, setTransferDst] = useState("BRANCH_DHK_BANANI");

  // Receive Transfer Modal State
  const [receivingTransferId, setReceivingTransferId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  // Record Sale Form State
  const [showRecordSale, setShowRecordSale] = useState(false);
  const [saleBranchId, setSaleBranchId] = useState("BRANCH_DHK_DHANMONDI");
  const [saleSku, setSaleSku] = useState("SKU-PANJABI-BLK");
  const [saleQty, setSaleQty] = useState(1);
  const [salePrice, setSalePrice] = useState(3500);
  const [saleCost, setSaleCost] = useState(1800);

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/v1/franchise/branches")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.branches && data.branches.length > 0) setBranches(data.branches);
      })
      .catch(() => {});

    fetch("/api/v1/franchise/transfers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transfers && data.transfers.length > 0) setTransfers(data.transfers);
      })
      .catch(() => {});

    fetch("/api/v1/franchise/sales/ledger")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.sales && data.sales.length > 0) setSales(data.sales);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/franchise/transfers/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: transferSku,
          productName: transferSku === "SKU-PANJABI-BLK" ? "Royal Platinum Silk Panjabi" : "Stock Item",
          quantity: transferQty,
          sourceBranchId: transferSrc,
          destinationBranchId: transferDst,
          courierProvider: "internal_van",
        }),
      });
      const data = await res.json();
      if (data.success && data.transfer) {
        setTransfers((prev) => [data.transfer, ...prev]);
        setShowNewTransfer(false);
        setActionMessage(`Inter-branch transfer initiated! Verification OTP: ${data.transfer.verificationCode}`);
      }
    } catch {
      setShowNewTransfer(false);
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleReceiveTransfer = async (transferId: string) => {
    try {
      const res = await fetch("/api/v1/franchise/transfers/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId,
          verificationCode: otpCode,
        }),
      });
      const data = await res.json();
      if (data.success && data.transfer) {
        setTransfers((prev) => prev.map((t) => (t.transferId === transferId ? data.transfer : t)));
        setReceivingTransferId(null);
        setOtpCode("");
        setActionMessage("Stock received and verified at destination branch!");
      } else {
        setActionMessage(data.error || "Invalid OTP verification code");
      }
    } catch {
      setReceivingTransferId(null);
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/franchise/sales/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: saleBranchId,
          sku: saleSku,
          productName: saleSku === "SKU-PANJABI-BLK" ? "Royal Platinum Silk Panjabi" : "Consumer Item",
          quantity: saleQty,
          unitCostPriceBdt: saleCost,
          unitSellingPriceBdt: salePrice,
          paymentMethod: "bkash_sub_merchant",
        }),
      });
      const data = await res.json();
      if (data.success && data.sale) {
        setSales((prev) => [data.sale, ...prev]);
        setShowRecordSale(false);
        setActionMessage(`Sale recorded! Franchisee Net Profit: ৳${data.sale.franchiseeNetProfitBdt.toLocaleString()} (Royalty: ৳${data.sale.masterRoyaltyBdt})`);
      }
    } catch {
      setShowRecordSale(false);
    } finally {
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDisburseSettlement = async (branchId: string, amount: number) => {
    try {
      const res = await fetch("/api/v1/franchise/settlement/disburse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, amountBdt: amount }),
      });
      const data = await res.json();
      if (data.success && data.disbursement) {
        setBranches((prev) =>
          prev.map((b) =>
            b.branchId === branchId ? { ...b, totalRoyaltyPaidBdt: b.totalRoyaltyPaidBdt + amount } : b
          )
        );
        setActionMessage(`bKash Royalty payout disbursed! Trx ID: ${data.disbursement.mfsTrxId}`);
      }
    } catch {}
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Multi-Tenant Franchise & Multi-Branch Stock Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  {branches.length} Nodes Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Outlet Inventory Matrix • 3-Way Commission Splits • Inter-Branch Transfers (IBST) • bKash Sub-Merchant Settlement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-indigo-950/80 border-b border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "matrix"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Branch Stock Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("commission")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "commission"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Commission Split Journal</span>
          </button>

          <button
            onClick={() => setActiveTab("transfers")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "transfers"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Inter-Branch Transfers (IBST)</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
              {transfers.filter((t) => t.status === "in_transit").length} In Transit
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settlement")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "settlement"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>bKash Sub-Merchant Settlement</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: STOCK MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Multi-Branch Real-Time Inventory Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live cross-outlet inventory holdings with low stock threshold alerts.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTransfer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transfer Stock (IBST)</span>
                </button>
              </div>

              {/* Branch Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((b) => (
                  <div
                    key={b.branchId}
                    className="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{b.branchName}</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${
                            b.type === "central_hub"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          }`}>
                            {b.type === "central_hub" ? "Central Hub" : `${b.royaltyRatePct}% Royalty`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{b.address}</div>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">
                        Vol: ৳{b.totalSalesVolumeBdt.toLocaleString()}
                      </span>
                    </div>

                    {/* Stock Table */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-2 px-3 py-1.5 bg-slate-950 font-semibold text-slate-400 border-b border-slate-800">
                        <span>SKU</span>
                        <span className="text-right">Holding Units</span>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {Object.entries(b.stockHoldings).map(([sku, qty]) => (
                          <div key={sku} className="grid grid-cols-2 px-3 py-1.5 text-slate-300">
                            <span className="font-mono text-[11px]">{sku}</span>
                            <span className={`text-right font-bold ${qty < 20 ? "text-amber-400" : "text-white"}`}>
                              {qty} units {qty < 20 && "⚠️ Low"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMMISSION SPLIT JOURNAL */}
          {activeTab === "commission" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    3-Way Franchise Commission Split Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gross Sale $\rightarrow$ Central COGS Replenishment $\rightarrow$ Master Royalty % $\rightarrow$ Franchisee Net Margin.
                  </p>
                </div>
                <button
                  onClick={() => setShowRecordSale(!showRecordSale)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showRecordSale ? "Cancel" : "Record Branch Sale"}</span>
                </button>
              </div>

              {/* Record Sale Form */}
              {showRecordSale && (
                <form
                  onSubmit={handleRecordSale}
                  className="p-4 bg-slate-950/80 border border-emerald-500/40 rounded-xl space-y-3"
                >
                  <div className="text-xs font-bold text-emerald-300">Point-of-Sale Transaction Ingestion</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Selling Branch</label>
                      <select
                        value={saleBranchId}
                        onChange={(e) => setSaleBranchId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {branches.filter((b) => b.type !== "central_hub").map((b) => (
                          <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Product SKU</label>
                      <select
                        value={saleSku}
                        onChange={(e) => setSaleSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                      >
                        <option value="SKU-PANJABI-BLK">SKU-PANJABI-BLK (Silk Panjabi)</option>
                        <option value="SKU-EARBUDS-TWS">SKU-EARBUDS-TWS (ANC Earbuds)</option>
                        <option value="SKU-CHARGER-65W">SKU-CHARGER-65W (GaN Fast Charger)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={saleQty}
                        onChange={(e) => setSaleQty(parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Unit Cost (COGS ৳)</label>
                      <input
                        type="number"
                        value={saleCost}
                        onChange={(e) => setSaleCost(parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Unit Selling Price (৳)</label>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        Commit Sale
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Sales Journal Table */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3">Branch Outlet</th>
                      <th className="p-3">Product SKU</th>
                      <th className="p-3 text-right">Gross Sale</th>
                      <th className="p-3 text-right">Central COGS</th>
                      <th className="p-3 text-right">Master Royalty</th>
                      <th className="p-3 text-right">Franchisee Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sales.map((s) => (
                      <tr key={s.saleId} className="hover:bg-slate-800/60 transition">
                        <td className="p-3 font-medium text-white">{s.branchName}</td>
                        <td className="p-3 font-mono">{s.sku} ({s.quantity}x)</td>
                        <td className="p-3 text-right font-bold text-white">৳{s.grossTotalBdt.toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-400">৳{s.cogsTotalBdt.toLocaleString()}</td>
                        <td className="p-3 text-right text-amber-400 font-bold">৳{s.masterRoyaltyBdt.toLocaleString()}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">৳{s.franchiseeNetProfitBdt.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INTER-BRANCH TRANSFERS */}
          {activeTab === "transfers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                    Inter-Branch Stock Transfers (IBST)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Atomic stock dispatch with courier tracking and 6-digit OTP reception verification.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTransfer(!showNewTransfer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showNewTransfer ? "Cancel" : "New Transfer"}</span>
                </button>
              </div>

              {/* New Transfer Form */}
              {showNewTransfer && (
                <form
                  onSubmit={handleInitiateTransfer}
                  className="p-4 bg-slate-950/80 border border-blue-500/40 rounded-xl space-y-3"
                >
                  <div className="text-xs font-bold text-blue-300">Dispatch Inter-Branch Transfer</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Source Branch</label>
                      <select
                        value={transferSrc}
                        onChange={(e) => setTransferSrc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {branches.map((b) => (
                          <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Destination Branch</label>
                      <select
                        value={transferDst}
                        onChange={(e) => setTransferDst(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        {branches.filter((b) => b.branchId !== transferSrc).map((b) => (
                          <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">SKU</label>
                      <select
                        value={transferSku}
                        onChange={(e) => setTransferSku(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                      >
                        <option value="SKU-PANJABI-BLK">SKU-PANJABI-BLK</option>
                        <option value="SKU-EARBUDS-TWS">SKU-EARBUDS-TWS</option>
                        <option value="SKU-CHARGER-65W">SKU-CHARGER-65W</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={transferQty}
                        onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    Dispatch Transfer
                  </button>
                </form>
              )}

              {/* Transfers List */}
              <div className="space-y-3">
                {transfers.map((t) => (
                  <div
                    key={t.transferId}
                    className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{t.transferId}</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${
                          t.status === "in_transit"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}>
                          {t.status === "in_transit" ? "🚚 In Transit" : "✅ Received"}
                        </span>
                        <span className="text-xs text-slate-400">Tracking: {t.trackingCode}</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {t.quantity}x {t.productName} ({t.sku})
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{t.sourceBranchName}</span>
                        <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                        <span>{t.destinationBranchName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {t.status === "in_transit" && (
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">Verification OTP</div>
                          <div className="font-mono font-bold text-amber-400">{t.verificationCode}</div>
                        </div>
                      )}

                      {t.status === "in_transit" && (
                        <button
                          onClick={() => setReceivingTransferId(t.transferId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          Receive Stock
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Receive OTP Drawer */}
              {receivingTransferId && (
                <div className="p-4 bg-slate-950/90 border border-emerald-500/50 rounded-xl flex items-center gap-3 animate-in fade-in">
                  <span className="text-xs text-slate-300 font-semibold">Enter 6-Digit Reception OTP:</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 492104"
                    className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white text-center"
                  />
                  <button
                    onClick={() => handleReceiveTransfer(receivingTransferId)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Verify & Increment Stock
                  </button>
                  <button
                    onClick={() => setReceivingTransferId(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUB-MERCHANT SETTLEMENT */}
          {activeTab === "settlement" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Decentralized bKash / Nagad Sub-Merchant Royalty Settlement
                </h3>
                <p className="text-xs text-slate-400">
                  Automated daily reconciliation of branch sales royalties. Disburse net franchisee payouts directly to local mobile merchant wallets.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {branches.filter((b) => b.type !== "central_hub").map((b) => {
                    const outstanding = b.totalRoyaltyOwedBdt - b.totalRoyaltyPaidBdt;
                    return (
                      <div
                        key={b.branchId}
                        className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-bold text-white">{b.branchName}</div>
                            <div className="text-[11px] text-slate-400">{b.subMerchantWallet}</div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400">
                            {b.royaltyRatePct}% Rate
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Total Royalty Owed:</span>
                            <span className="text-white font-bold">৳{b.totalRoyaltyOwedBdt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Total Disbursed:</span>
                            <span className="text-emerald-400 font-bold">৳{b.totalRoyaltyPaidBdt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700">
                            <span>Outstanding Settlement:</span>
                            <span className="text-amber-400 font-extrabold">৳{outstanding.toLocaleString()}</span>
                          </div>
                        </div>

                        {outstanding > 0 && (
                          <button
                            onClick={() => handleDisburseSettlement(b.branchId, outstanding)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            Disburse ৳{outstanding.toLocaleString()} via bKash
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Branch Engine: All Outlets & Transit Ledgers Synchronized</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">Shortcut: ⌘M</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
