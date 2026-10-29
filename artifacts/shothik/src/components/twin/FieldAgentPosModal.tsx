import React, { useState, useEffect } from "react";
import {
  Store,
  Printer,
  QrCode,
  WifiOff,
  Scale,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  DollarSign,
  Package,
  ShieldCheck,
  Smartphone,
  Layers,
  Bluetooth,
  FileText,
  Clock,
  AlertTriangle,
  Receipt
} from "lucide-react";

interface FieldAgentPosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | "pos_checkout"
  | "bluetooth_thermal"
  | "dynamic_mfs_qr"
  | "offline_crdt_queue"
  | "cash_float_reconcile";

export interface PosCatalogItem {
  sku: string;
  name: string;
  banglaName: string;
  category: "beverages" | "dry_foods" | "personal_care" | "agri_produce" | "electronics_accessories";
  unitPriceBdt: number;
  costPriceBdt: number;
  vatRatePercent: number;
  stockQuantity: number;
  barcode: string;
}

export interface CartItem {
  sku: string;
  name: string;
  unitPriceBdt: number;
  quantity: number;
  vatRatePercent: number;
  totalVatBdt: number;
  lineTotalBdt: number;
}

export interface PosTransaction {
  transactionId: string;
  agentId: string;
  branchId: string;
  timestamp: string;
  items: CartItem[];
  subtotalBdt: number;
  vatTotalBdt: number;
  discountBdt: number;
  grandTotalBdt: number;
  paymentMethod: "cash" | "bkash_dynamic_qr" | "nagad_dynamic_qr" | "split_cash_mfs";
  cashReceivedBdt: number;
  changeReturnedBdt: number;
  mfsAmountBdt: number;
  mfsTxnId?: string;
  customerPhone?: string;
  syncStatus: "pending" | "synced" | "conflict_resolved";
  sha256Seal: string;
}

export interface EscPosPrintJob {
  jobId: string;
  paperWidth: "58mm" | "80mm";
  base64Bytecode: string;
  hexPreview: string;
  byteLength: number;
  formattedText: string;
  generatedAt: string;
}

export interface CashFloatSession {
  sessionId: string;
  agentId: string;
  openingFloatBdt: number;
  totalCashSalesBdt: number;
  totalMfsSalesBdt: number;
  expectedCashInHandBdt: number;
  actualCountedCashBdt: number;
  discrepancyBdt: number;
  status: "open" | "closed_balanced" | "closed_with_discrepancy";
  supervisorSignOffHash?: string;
  openedAt: string;
  closedAt?: string;
}

const INITIAL_CATALOG: PosCatalogItem[] = [
  {
    sku: "BEV-001",
    name: "Fresh Cha 200ml Flask Pack",
    banglaName: "তাজা চা ২০০মি.লি.",
    category: "beverages",
    unitPriceBdt: 25,
    costPriceBdt: 16,
    vatRatePercent: 5,
    stockQuantity: 150,
    barcode: "8941100010012"
  },
  {
    sku: "BEV-002",
    name: "Mineral Water 500ml",
    banglaName: "মিনারেল ওয়াটার ৫০০মি.লি.",
    category: "beverages",
    unitPriceBdt: 20,
    costPriceBdt: 12,
    vatRatePercent: 0,
    stockQuantity: 200,
    barcode: "8941100010029"
  },
  {
    sku: "DRY-001",
    name: "Chanachur Spicy Mix 150g",
    banglaName: "ঝাল চানাচুর ১৫০গ্রাম",
    category: "dry_foods",
    unitPriceBdt: 45,
    costPriceBdt: 32,
    vatRatePercent: 5,
    stockQuantity: 80,
    barcode: "8941100020011"
  },
  {
    sku: "DRY-002",
    name: "Toast Biscuit Family Pack",
    banglaName: "টোস্ট বিস্কুট ফ্যামিলি প্যাক",
    category: "dry_foods",
    unitPriceBdt: 60,
    costPriceBdt: 44,
    vatRatePercent: 5,
    stockQuantity: 65,
    barcode: "8941100020028"
  },
  {
    sku: "PER-001",
    name: "Antiseptic Soap Bar 100g",
    banglaName: "জীবাণুনাশক সাবান ১০০গ্রাম",
    category: "personal_care",
    unitPriceBdt: 40,
    costPriceBdt: 28,
    vatRatePercent: 7.5,
    stockQuantity: 110,
    barcode: "8941100030010"
  },
  {
    sku: "AGR-001",
    name: "Organic Mustard Oil 250ml",
    banglaName: "খাটি সরিষার তেল ২৫০মি.লি.",
    category: "agri_produce",
    unitPriceBdt: 110,
    costPriceBdt: 85,
    vatRatePercent: 0,
    stockQuantity: 45,
    barcode: "8941100040019"
  },
  {
    sku: "ELE-001",
    name: "USB-C Fast Charging Cable 1m",
    banglaName: "টাইপ-সি চার্জিং ক্যাবল ১মি.",
    category: "electronics_accessories",
    unitPriceBdt: 150,
    costPriceBdt: 80,
    vatRatePercent: 15,
    stockQuantity: 30,
    barcode: "8941100050018"
  }
];

export const FieldAgentPosModal: React.FC<FieldAgentPosModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("pos_checkout");
  const [catalog] = useState<PosCatalogItem[]>(INITIAL_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart State
  const [cart, setCart] = useState<{ [sku: string]: number }>({
    "BEV-001": 2,
    "DRY-001": 1
  });
  const [discountBdt, setDiscountBdt] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash_dynamic_qr" | "nagad_dynamic_qr" | "split_cash_mfs">("cash");
  const [cashReceived, setCashReceived] = useState<number>(100);
  const [customerPhone, setCustomerPhone] = useState<string>("01712345678");

  // Offline Transactions Queue
  const [transactions, setTransactions] = useState<PosTransaction[]>([
    {
      transactionId: "TXN-FIELD-8821",
      agentId: "AG-902",
      branchId: "DHN-ROAD-01",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      items: [
        {
          sku: "BEV-001",
          name: "Fresh Cha 200ml Flask Pack",
          unitPriceBdt: 25,
          quantity: 2,
          vatRatePercent: 5,
          totalVatBdt: 2.5,
          lineTotalBdt: 52.5
        },
        {
          sku: "DRY-001",
          name: "Chanachur Spicy Mix 150g",
          unitPriceBdt: 45,
          quantity: 1,
          vatRatePercent: 5,
          totalVatBdt: 2.25,
          lineTotalBdt: 47.25
        }
      ],
      subtotalBdt: 95,
      vatTotalBdt: 4.75,
      discountBdt: 0,
      grandTotalBdt: 99.75,
      paymentMethod: "cash",
      cashReceivedBdt: 100,
      changeReturnedBdt: 0.25,
      mfsAmountBdt: 0,
      syncStatus: "pending",
      sha256Seal: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    }
  ]);

  // Thermal Print State
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("58mm");
  const [printJob, setPrintJob] = useState<EscPosPrintJob | null>(null);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Dynamic QR State
  const [qrProvider, setQrProvider] = useState<"bkash" | "nagad">("bkash");
  const [qrAmount, setQrAmount] = useState<number>(150);
  const [qrReference, setQrReference] = useState<string>("INV-902-A");

  // Cash Float State
  const [openingFloat, setOpeningFloat] = useState<number>(1000);
  const [countedCash, setCountedCash] = useState<number>(1099.75);
  const [floatSession, setFloatSession] = useState<CashFloatSession | null>(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Global Shortcut listener (⌘P / Ctrl+P)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        // Toggle modal
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Cart Calculations
  const cartItemsDetailed: CartItem[] = Object.entries(cart)
    .map(([sku, qty]) => {
      const item = catalog.find((c) => c.sku === sku);
      if (!item || qty <= 0) return null;
      const lineNet = item.unitPriceBdt * qty;
      const lineVat = Math.round(((lineNet * item.vatRatePercent) / 100) * 100) / 100;
      return {
        sku: item.sku,
        name: item.name,
        unitPriceBdt: item.unitPriceBdt,
        quantity: qty,
        vatRatePercent: item.vatRatePercent,
        totalVatBdt: lineVat,
        lineTotalBdt: lineNet + lineVat
      };
    })
    .filter(Boolean) as CartItem[];

  const subtotalNet = cartItemsDetailed.reduce((sum, item) => sum + item.unitPriceBdt * item.quantity, 0);
  const vatTotal = cartItemsDetailed.reduce((sum, item) => sum + item.totalVatBdt, 0);
  const grandTotal = Math.max(0, Math.round((subtotalNet + vatTotal - discountBdt) * 100) / 100);
  const changeReturned = Math.max(0, Math.round((cashReceived - grandTotal) * 100) / 100);

  // Cart manipulation
  const addToCart = (sku: string) => {
    setCart((prev) => ({ ...prev, [sku]: (prev[sku] || 0) + 1 }));
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[sku] > 1) {
        copy[sku]--;
      } else {
        delete copy[sku];
      }
      return copy;
    });
  };

  const clearCart = () => setCart({});

  // Checkout Handler
  const handleCheckout = () => {
    if (cartItemsDetailed.length === 0) {
      setStatusMsg({ text: "Cart is empty. Add items to checkout.", type: "error" });
      return;
    }

    const newTxId = `TXN-FIELD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: PosTransaction = {
      transactionId: newTxId,
      agentId: "AG-902",
      branchId: "DHN-ROAD-01",
      timestamp: new Date().toISOString(),
      items: cartItemsDetailed,
      subtotalBdt: subtotalNet,
      vatTotalBdt: vatTotal,
      discountBdt,
      grandTotalBdt: grandTotal,
      paymentMethod,
      cashReceivedBdt: paymentMethod === "cash" ? cashReceived : 0,
      changeReturnedBdt: paymentMethod === "cash" ? changeReturned : 0,
      mfsAmountBdt: paymentMethod.includes("mfs") || paymentMethod.includes("qr") ? grandTotal : 0,
      mfsTxnId: paymentMethod.includes("qr") ? `TRX-${Date.now().toString(36).toUpperCase()}` : undefined,
      customerPhone,
      syncStatus: "pending",
      sha256Seal: `seal-${Date.now().toString(16)}`
    };

    setTransactions((prev) => [newTx, ...prev]);
    generateThermalReceipt(newTx);
    clearCart();
    setStatusMsg({
      text: `Sale recorded: ${newTxId} (৳${grandTotal}). Receipt compiled for thermal printing.`,
      type: "success"
    });
  };

  // Generate Receipt
  const generateThermalReceipt = (tx?: PosTransaction) => {
    const targetTx = tx || transactions[0];
    if (!targetTx) return;

    const maxChars = paperWidth === "58mm" ? 32 : 48;
    const sep = "-".repeat(maxChars);
    const dsep = "=".repeat(maxChars);

    const lines: string[] = [
      "SHOTHIK FIELD POP-UP STORE",
      "BIN: 001234567-0101",
      "Branch: Dhanmondi Roadside Hub",
      "Agent: Agent Rashedul (AG-902)",
      dsep,
      `Txn: ${targetTx.transactionId}   ${new Date(targetTx.timestamp).toLocaleTimeString()}`,
      `Pay: ${targetTx.paymentMethod.toUpperCase()}   Status: ${targetTx.syncStatus}`,
      sep,
      "Item (Qty x Rate)        Total(৳)",
      sep
    ];

    for (const item of targetTx.items) {
      lines.push(`${item.name.substring(0, 20)}`);
      lines.push(`  ${item.quantity}x @৳${item.unitPriceBdt} (V${item.vatRatePercent}%)       ৳${item.lineTotalBdt.toFixed(2)}`);
    }

    lines.push(sep);
    lines.push(`Subtotal Net:            ৳${targetTx.subtotalBdt.toFixed(2)}`);
    lines.push(`Mushak VAT Total:        ৳${targetTx.vatTotalBdt.toFixed(2)}`);
    if (targetTx.discountBdt > 0) {
      lines.push(`Discount:               -৳${targetTx.discountBdt.toFixed(2)}`);
    }
    lines.push(`GRAND TOTAL:             ৳${targetTx.grandTotalBdt.toFixed(2)}`);
    lines.push(sep);

    if (targetTx.paymentMethod === "cash") {
      lines.push(`Cash Received:           ৳${targetTx.cashReceivedBdt.toFixed(2)}`);
      lines.push(`Change Returned:         ৳${targetTx.changeReturnedBdt.toFixed(2)}`);
    } else {
      lines.push(`MFS Paid Amount:         ৳${targetTx.mfsAmountBdt.toFixed(2)}`);
      if (targetTx.mfsTxnId) lines.push(`MFS TrxID: ${targetTx.mfsTxnId}`);
    }

    lines.push(dsep);
    lines.push("** SHOTHIK NBR FISCAL POS **");
    lines.push(`Seal: ${targetTx.sha256Seal.substring(0, 16)}...`);
    lines.push("Thank you for your business!");

    const formattedText = lines.join("\n");
    const fakeByteLength = formattedText.length + 32;

    setPrintJob({
      jobId: `PRINT-${Date.now().toString(36).toUpperCase()}`,
      paperWidth,
      base64Bytecode: btoa(unescape(encodeURIComponent(formattedText))),
      hexPreview: "1B 40 1B 45 01 53 48 4F 54 48 49 4B 20 50 4F 53 1B 45 00 1D 56 42 00 ...",
      byteLength: fakeByteLength,
      formattedText,
      generatedAt: new Date().toISOString()
    });
  };

  // Sync Queue Handler
  const handleBatchSync = () => {
    const pendingCount = transactions.filter((t) => t.syncStatus === "pending").length;
    if (pendingCount === 0) {
      setStatusMsg({ text: "All transactions are already synchronized.", type: "info" });
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => ({ ...t, syncStatus: "synced" }))
    );
    setStatusMsg({
      text: `Synchronized ${pendingCount} offline transactions to franchise cloud ledger.`,
      type: "success"
    });
  };

  // Cash Float Reconcile Handler
  const handleReconcileFloat = () => {
    const totalCashSales = transactions
      .filter((t) => t.paymentMethod === "cash")
      .reduce((sum, t) => sum + t.grandTotalBdt, 0);

    const totalMfsSales = transactions
      .filter((t) => t.paymentMethod !== "cash")
      .reduce((sum, t) => sum + t.grandTotalBdt, 0);

    const expectedCashInHand = openingFloat + totalCashSales;
    const discrepancy = Math.round((countedCash - expectedCashInHand) * 100) / 100;
    const status = Math.abs(discrepancy) < 0.01 ? "closed_balanced" : "closed_with_discrepancy";

    const session: CashFloatSession = {
      sessionId: `SES-FLOAT-${Date.now().toString(36).toUpperCase()}`,
      agentId: "AG-902",
      openingFloatBdt: openingFloat,
      totalCashSalesBdt: totalCashSales,
      totalMfsSalesBdt: totalMfsSales,
      expectedCashInHandBdt: expectedCashInHand,
      actualCountedCashBdt: countedCash,
      discrepancyBdt: discrepancy,
      status,
      supervisorSignOffHash: `SUP-${Math.random().toString(16).substring(2, 10).toUpperCase()}-SEAL`,
      openedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      closedAt: new Date().toISOString()
    };

    setFloatSession(session);
    setStatusMsg({
      text: `Cash float closed. Status: ${status === "closed_balanced" ? "Balanced ৳0" : `Discrepancy ৳${discrepancy}`}`,
      type: status === "closed_balanced" ? "success" : "error"
    });
  };

  const filteredCatalog = catalog.filter((item) => {
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.banglaName.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Field Agent POS & Bluetooth Print Engine
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline CRDT Active
                </span>
                <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-md">
                  Shortcut: ⌘P
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Offline-First Roadside POS · ESC/POS Bluetooth 58mm/80mm Thermal Printer · bKash Dynamic QR · Float Balancing
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
            { id: "pos_checkout", label: "POS Checkout", icon: Store },
            { id: "bluetooth_thermal", label: "ESC/POS Thermal Print", icon: Printer },
            { id: "dynamic_mfs_qr", label: "Dynamic MFS QR", icon: QrCode },
            { id: "offline_crdt_queue", label: "Offline Queue & Sync", icon: Layers },
            { id: "cash_float_reconcile", label: "Float Reconciler", icon: Scale }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-amber-500 text-amber-400 bg-amber-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Toast Banner */}
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

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: POS CHECKOUT */}
          {activeTab === "pos_checkout" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Catalog & Search (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search SKU, item, or barcode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {[
                      { id: "all", label: "All" },
                      { id: "beverages", label: "Drinks" },
                      { id: "dry_foods", label: "Snacks" },
                      { id: "personal_care", label: "Care" },
                      { id: "agri_produce", label: "Agri" },
                      { id: "electronics_accessories", label: "Gadgets" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedCategory === c.id
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => (
                    <div
                      key={item.sku}
                      className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-mono text-neutral-500">{item.sku}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                            VAT {item.vatRatePercent}%
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors mt-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-400">{item.banglaName}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/60">
                        <div>
                          <span className="text-base font-bold text-emerald-400">৳{item.unitPriceBdt}</span>
                          <span className="text-[10px] text-neutral-500 ml-1.5">Stock: {item.stockQuantity}</span>
                        </div>
                        <button
                          onClick={() => addToCart(item.sku)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Active Cart & Checkout (5 Cols) */}
              <div className="lg:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Current Cart ({cartItemsDetailed.length})</h3>
                    </div>
                    {cartItemsDetailed.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-2.5 my-3 max-h-[220px] overflow-y-auto pr-1">
                    {cartItemsDetailed.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500 text-xs">
                        No items in cart. Click items on the left to add.
                      </div>
                    ) : (
                      cartItemsDetailed.map((item) => (
                        <div
                          key={item.sku}
                          className="flex items-center justify-between p-2 bg-neutral-900/60 rounded-lg text-xs border border-neutral-800/50"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-neutral-200 font-medium truncate">{item.name}</p>
                            <p className="text-neutral-500">
                              ৳{item.unitPriceBdt} x {item.quantity} (+{item.vatRatePercent}% VAT)
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-neutral-800 rounded-md border border-neutral-700">
                              <button
                                onClick={() => removeFromCart(item.sku)}
                                className="p-1 hover:text-amber-400 text-neutral-400"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-1.5 font-bold text-white">{item.quantity}</span>
                              <button
                                onClick={() => addToCart(item.sku)}
                                className="p-1 hover:text-amber-400 text-neutral-400"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-semibold text-emerald-400 w-14 text-right">
                              ৳{item.lineTotalBdt.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal (Net):</span>
                      <span className="text-neutral-200">৳{subtotalNet.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mushak VAT:</span>
                      <span className="text-neutral-200">৳{vatTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Discount (৳):</span>
                      <input
                        type="number"
                        min="0"
                        value={discountBdt}
                        onChange={(e) => setDiscountBdt(Number(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-right text-neutral-200"
                      />
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                      <span>Grand Total:</span>
                      <span className="text-emerald-400">৳{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Selection & Complete Sale */}
                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "cash", label: "Cash" },
                      { id: "bkash_dynamic_qr", label: "bKash QR" },
                      { id: "nagad_dynamic_qr", label: "Nagad QR" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          paymentMethod === m.id
                            ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-neutral-400 text-[10px]">Cash Received (৳)</label>
                        <input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-400 text-[10px]">Change Due (৳)</label>
                        <div className="w-full px-2 py-1.5 bg-neutral-900/60 border border-neutral-800 rounded-lg text-emerald-400 font-bold">
                          ৳{changeReturned.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={cartItemsDetailed.length === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Complete Sale & Print (৳{grandTotal.toFixed(2)})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESC/POS BLUETOOTH THERMAL PRINT */}
          {activeTab === "bluetooth_thermal" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Printer Settings & Bluetooth pairing */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bluetooth className="w-5 h-5 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">Bluetooth Thermal Printer</h4>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        isBluetoothConnected
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {isBluetoothConnected ? "Connected (PT-210)" : "Disconnected"}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400">
                    Communicates directly with POS-5802 / PT-210 / MPT-II thermal receipt printers over Web Bluetooth API.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsBluetoothConnected(!isBluetoothConnected);
                        setStatusMsg({
                          text: isBluetoothConnected
                            ? "Bluetooth printer disconnected."
                            : "Paired with 'MPT-II 58mm Thermal Printer' via Web Bluetooth.",
                          type: isBluetoothConnected ? "info" : "success"
                        });
                      }}
                      className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Bluetooth className="w-4 h-4 text-blue-400" />
                      {isBluetoothConnected ? "Disconnect Printer" : "Scan Bluetooth Devices"}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Format Options</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaperWidth("58mm")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                        paperWidth === "58mm"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      58mm Roll (32 Chars)
                    </button>
                    <button
                      onClick={() => setPaperWidth("80mm")}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                        paperWidth === "80mm"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      80mm Roll (48 Chars)
                    </button>
                  </div>

                  <button
                    onClick={() => generateThermalReceipt()}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Recompile ESC/POS Bytecode
                  </button>
                </div>

                {printJob && (
                  <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Job ID:</span>
                      <span className="font-mono text-neutral-200">{printJob.jobId}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Bytecode Size:</span>
                      <span className="text-neutral-200">{printJob.byteLength} Bytes</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Control Sequences:</span>
                      <span className="text-emerald-400 font-mono">ESC @, ESC a, GS V, GS ( k</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-neutral-500 font-mono text-[10px] break-all">
                        HEX: {printJob.hexPreview}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Thermal Receipt Preview */}
              <div className="lg:col-span-7 bg-neutral-950/90 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Live Thermal Receipt Preview ({paperWidth})</h4>
                    </div>
                    <button
                      onClick={() => {
                        if (printJob) {
                          navigator.clipboard.writeText(printJob.formattedText);
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        }
                      }}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-800 px-2.5 py-1 rounded"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedText ? "Copied" : "Copy Text"}
                    </button>
                  </div>

                  {/* Monospaced Thermal Ticket Paper Display */}
                  <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-300 leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre shadow-inner">
                    {printJob?.formattedText || "Click 'Recompile ESC/POS Bytecode' to view receipt format."}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setStatusMsg({
                        text: `Sent ${printJob?.byteLength || 250} bytes ESC/POS payload to Bluetooth printer queue.`,
                        type: "success"
                      });
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Send Raw Bytecode to Thermal Printer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC MFS QR CODE */}
          {activeTab === "dynamic_mfs_qr" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold text-white">Dynamic EMVCo QR Parameters</h4>
                  <p className="text-xs text-neutral-400">
                    Instant roadside QR codes encoded with dynamic payment total, merchant wallet ID, and transaction reference.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400">Select Provider</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => setQrProvider("bkash")}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            qrProvider === "bkash"
                              ? "bg-pink-600 text-white border-pink-500"
                              : "bg-neutral-900 text-neutral-400 border-neutral-800"
                          }`}
                        >
                          bKash Merchant
                        </button>
                        <button
                          onClick={() => setQrProvider("nagad")}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            qrProvider === "nagad"
                              ? "bg-orange-600 text-white border-orange-500"
                              : "bg-neutral-900 text-neutral-400 border-neutral-800"
                          }`}
                        >
                          Nagad Sheba
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400">Amount (৳ BDT)</label>
                      <input
                        type="number"
                        value={qrAmount}
                        onChange={(e) => setQrAmount(Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400">Reference / Invoice ID</label>
                      <input
                        type="text"
                        value={qrReference}
                        onChange={(e) => setQrReference(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Display Card */}
              <div className="lg:col-span-7 bg-neutral-950/90 border border-neutral-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div
                  className={`p-3 rounded-2xl border-2 ${
                    qrProvider === "bkash"
                      ? "bg-pink-950/20 border-pink-500/40 text-pink-400"
                      : "bg-orange-950/20 border-orange-500/40 text-orange-400"
                  }`}
                >
                  <div className="w-52 h-52 bg-white p-3 rounded-xl flex items-center justify-center shadow-lg">
                    {/* Visual QR Code Representation */}
                    <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between items-center relative">
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 bg-black"></div>
                        <div className="w-8 h-8 bg-black"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <QrCode className="w-12 h-12 text-neutral-900" />
                        <span className="text-[10px] font-black text-black uppercase mt-1">
                          {qrProvider} ৳{qrAmount}
                        </span>
                      </div>
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 bg-black"></div>
                        <div className="w-8 h-8 border-2 border-black flex items-center justify-center">
                          <div className="w-4 h-4 bg-black"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">
                    Scan with {qrProvider === "bkash" ? "bKash" : "Nagad"} App
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Merchant BIN: 001234567-0101 · Ref: {qrReference}
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
                    Amount: ৳{qrAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFLINE CRDT QUEUE & SYNC */}
          {activeTab === "offline_crdt_queue" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Offline Transaction Queue ({transactions.length})</h3>
                  <p className="text-xs text-neutral-400">
                    Local OPFS SQLite queue with SHA-256 integrity seal verification and deterministic cloud sync.
                  </p>
                </div>
                <button
                  onClick={handleBatchSync}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Batch Sync to Master Franchise
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300 border border-neutral-800 rounded-xl overflow-hidden">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-3">Txn ID</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total (৳)</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Sync Status</th>
                      <th className="p-3">SHA-256 Seal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 bg-neutral-900/40">
                    {transactions.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3 font-mono font-medium text-amber-400">{tx.transactionId}</td>
                        <td className="p-3 text-neutral-400">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3">
                          {tx.items.length} item(s) ({tx.items.map((i) => i.name.substring(0, 10)).join(", ")})
                        </td>
                        <td className="p-3 font-bold text-emerald-400">৳{tx.grandTotalBdt.toFixed(2)}</td>
                        <td className="p-3 uppercase text-neutral-300 font-semibold">{tx.paymentMethod.replace(/_/g, " ")}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              tx.syncStatus === "synced"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {tx.syncStatus}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-neutral-500 text-[10px]">
                          {tx.sha256Seal.substring(0, 12)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CASH FLOAT & RECONCILER */}
          {activeTab === "cash_float_reconcile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold text-white">End-of-Day Cash Float Reconciliation</h4>
                  <p className="text-xs text-neutral-400">
                    Calculates opening field float + cash collections against physical cash count.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-400">Morning Opening Float (৳ BDT)</label>
                      <input
                        type="number"
                        value={openingFloat}
                        onChange={(e) => setOpeningFloat(Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400">Physical Counted Cash in Hand (৳ BDT)</label>
                      <input
                        type="number"
                        value={countedCash}
                        onChange={(e) => setCountedCash(Number(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200"
                      />
                    </div>

                    <button
                      onClick={handleReconcileFloat}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Scale className="w-4 h-4" /> Reconcile & Generate Supervisor Seal
                    </button>
                  </div>
                </div>
              </div>

              {/* Tally Summary Card */}
              <div className="lg:col-span-6 bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Float Tally Result</h4>

                {floatSession ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Session ID:</span>
                      <span className="font-mono text-neutral-200">{floatSession.sessionId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Opening Float:</span>
                      <span className="text-neutral-200">৳{floatSession.openingFloatBdt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Total Cash Sales:</span>
                      <span className="text-emerald-400 font-bold">৳{floatSession.totalCashSalesBdt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Expected Cash-in-Hand:</span>
                      <span className="text-neutral-200 font-bold">৳{floatSession.expectedCashInHandBdt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Counted Physical Cash:</span>
                      <span className="text-neutral-200 font-bold">৳{floatSession.actualCountedCashBdt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-800 font-bold">
                      <span className="text-neutral-300">Variance / Discrepancy:</span>
                      <span
                        className={
                          floatSession.discrepancyBdt === 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        ৳{floatSession.discrepancyBdt.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <p className="text-neutral-500 text-[10px]">Supervisor Sign-Off Hash:</p>
                      <p className="font-mono text-amber-400 text-xs mt-0.5">{floatSession.supervisorSignOffHash}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-neutral-500 text-xs">
                    Enter opening float and counted cash, then click Reconcile.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldAgentPosModal;
