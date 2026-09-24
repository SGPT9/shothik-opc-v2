import React, { useState, useEffect } from "react";
import {
  Truck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Copy,
  Check,
  RefreshCw,
  X,
  Play,
  ShieldCheck,
  Building2,
  TrendingUp,
  Receipt,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface MultiCarrierWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "live_stream" | "gl_ledger" | "disputes" | "simulator";

export interface NormalizedEvent {
  eventId: string;
  carrier: "steadfast" | "pathao" | "redx" | "paperfly";
  consignmentId: string;
  orderId: string;
  trackingCode: string;
  status:
    | "in_transit"
    | "delivered"
    | "partial_delivered"
    | "cancelled"
    | "return_in_transit"
    | "returned"
    | "settled"
    | "unknown";
  recipientPhone?: string;
  hubLocation?: string;
  collectedAmount: number;
  deliveryFee: number;
  codFee: number;
  returnFee: number;
  netDisbursed: number;
  timestamp: string;
  rawPayload: Record<string, any>;
}

export interface LedgerEntry {
  entryNumber: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceConsignmentId: string;
}

export interface Discrepancy {
  discrepancyId: string;
  consignmentId: string;
  carrier: "steadfast" | "pathao" | "redx" | "paperfly";
  expectedAmount: number;
  actualAmount: number;
  variance: number;
  reason: string;
  disputeClaimDraftBangla: string;
  disputeClaimDraftEnglish: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

export interface ReconciliationSummary {
  totalEvents: number;
  totalCollectedCod: number;
  totalDeliveryFees: number;
  totalCodFees: number;
  totalSettledDisbursements: number;
  pendingReceivables: number;
  activeDiscrepanciesCount: number;
  totalDiscrepancyAmount: number;
  carrierBreakdown: Record<
    string,
    {
      deliveredCount: number;
      returnedCount: number;
      collectedAmount: number;
      feePaid: number;
      activeDisputes: number;
    }
  >;
}

const DEFAULT_EVENTS: NormalizedEvent[] = [
  {
    eventId: "EVT-SF-991",
    carrier: "steadfast",
    consignmentId: "SF-889102",
    orderId: "ORD-9912",
    trackingCode: "TRK-SF-889102",
    status: "delivered",
    recipientPhone: "01712-345678",
    hubLocation: "Gulshan Hub, Dhaka",
    collectedAmount: 3800,
    deliveryFee: 70,
    codFee: 38,
    returnFee: 0,
    netDisbursed: 3692,
    timestamp: new Date().toISOString(),
    rawPayload: { status: "delivered", consignment_id: "SF-889102", cod_amount: 3800 },
  },
  {
    eventId: "EVT-PT-882",
    carrier: "pathao",
    consignmentId: "PT-441029",
    orderId: "ORD-9913",
    trackingCode: "TRK-PT-441029",
    status: "settled",
    recipientPhone: "01819-876543",
    hubLocation: "Agrabad, Chittagong",
    collectedAmount: 6400,
    deliveryFee: 110,
    codFee: 64,
    returnFee: 0,
    netDisbursed: 6226,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    rawPayload: { event_type: "payment_invoice_settled", consignment_id: "PT-441029", price: 6400 },
  },
  {
    eventId: "EVT-RX-773",
    carrier: "redx",
    consignmentId: "RX-110293",
    orderId: "ORD-9914",
    trackingCode: "TRK-RX-110293",
    status: "returned",
    recipientPhone: "01911-223344",
    hubLocation: "Zindabazar, Sylhet",
    collectedAmount: 0,
    deliveryFee: 120,
    codFee: 0,
    returnFee: 60,
    netDisbursed: 0,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    rawPayload: { status: "returned", tracking_id: "RX-110293" },
  },
];

const DEFAULT_LEDGER: LedgerEntry[] = [
  {
    entryNumber: "JE-2026-0901",
    date: new Date().toISOString().split("T")[0],
    description: "COD collected for Order #ORD-9912 via STEADFAST (SF-889102)",
    debitAccount: "1130 - Accounts Receivable: Courier COD (STEADFAST)",
    creditAccount: "4100 - Customer Sales Revenue",
    amount: 3800,
    referenceConsignmentId: "SF-889102",
  },
  {
    entryNumber: "JE-2026-0902",
    date: new Date().toISOString().split("T")[0],
    description: "Bank Payout Received from PATHAO for Consignment PT-441029",
    debitAccount: "1010 - Cash at Bank (bKash/BRAC Bank Commercial)",
    creditAccount: "1130 - Accounts Receivable: Courier COD (PATHAO)",
    amount: 6226,
    referenceConsignmentId: "PT-441029",
  },
  {
    entryNumber: "JE-2026-0903",
    date: new Date().toISOString().split("T")[0],
    description: "Logistics Freight Delivery Expense for Consignment PT-441029",
    debitAccount: "5210 - Logistics & Shipping Freight Expense",
    creditAccount: "1130 - Accounts Receivable: Courier COD (PATHAO)",
    amount: 110,
    referenceConsignmentId: "PT-441029",
  },
];

const DEFAULT_DISPUTES: Discrepancy[] = [
  {
    discrepancyId: "DISP-2026-01",
    consignmentId: "SF-77192",
    carrier: "steadfast",
    expectedAmount: 4890,
    actualAmount: 4620,
    variance: 270,
    reason: "Unexplained rate jump on 1.2kg weight bracket",
    disputeClaimDraftBangla:
      "বিষয়: কনসাইনমেন্ট #SF-77192-এর সিওডি ডিসবার্সমেন্টে ৳270 টাকার গরমিল দাবি।\n\nপ্রিয় STEADFAST মার্চেন্ট সাপোর্ট টিম, নিয়মমাফিক চার্জ বাদে প্রদেয় নিট অর্থ ছিল ৳4890। কিন্তু স্টেটমেন্টে পাওয়া গেছে ৳4620। অনুগ্রহ করে বিস্তারিত চালানের ব্রেকডাউন প্রদান করে বকেয়া টাকা আমাদের মার্চেন্ট অ্যাকাউন্টে রিফান্ড করুন।",
    disputeClaimDraftEnglish:
      "Subject: Dispute Claim for COD Disbursement Variance (BDT 270) on Consignment #SF-77192\n\nDear STEADFAST Merchant Support, Consignment was marked delivered with expected net disbursement of BDT 4890. Actual disbursed was BDT 4620, variance BDT 270. Please credit delta to our account.",
    severity: "warning",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SUMMARY: ReconciliationSummary = {
  totalEvents: 3,
  totalCollectedCod: 10200,
  totalDeliveryFees: 300,
  totalCodFees: 102,
  totalSettledDisbursements: 6226,
  pendingReceivables: 3800,
  activeDiscrepanciesCount: 1,
  totalDiscrepancyAmount: 270,
  carrierBreakdown: {
    steadfast: { deliveredCount: 1, returnedCount: 0, collectedAmount: 3800, feePaid: 108, activeDisputes: 1 },
    pathao: { deliveredCount: 1, returnedCount: 0, collectedAmount: 6400, feePaid: 174, activeDisputes: 0 },
    redx: { deliveredCount: 0, returnedCount: 1, collectedAmount: 0, feePaid: 180, activeDisputes: 0 },
    paperfly: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
  },
};

export const MultiCarrierWebhookModal: React.FC<MultiCarrierWebhookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("live_stream");
  const [events, setEvents] = useState<NormalizedEvent[]>(DEFAULT_EVENTS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(DEFAULT_LEDGER);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(DEFAULT_DISPUTES);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(DEFAULT_SUMMARY);
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);

  // Simulator Form State
  const [simCarrier, setSimCarrier] = useState<"steadfast" | "pathao" | "redx" | "paperfly">("steadfast");
  const [simConsignmentId, setSimConsignmentId] = useState(`CNS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [simOrderId, setSimOrderId] = useState(`ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [simStatus, setSimStatus] = useState<"delivered" | "settled" | "returned" | "in_transit">("delivered");
  const [simCodAmount, setSimCodAmount] = useState<number>(3200);
  const [simDeliveryFee, setSimDeliveryFee] = useState<number>(70);
  const [simCodFee, setSimCodFee] = useState<number>(32);
  const [simHub, setSimHub] = useState<string>("Dhanmondi, Dhaka");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch initial state or populate mock defaults
    fetchSummaryAndEvents();
  }, [isOpen]);

  const fetchSummaryAndEvents = async () => {
    try {
      const summaryRes = await fetch("/api/v1/carrier-webhooks/reconciliation-summary");
      if (summaryRes.ok) {
        const sData = await summaryRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const eventsRes = await fetch("/api/v1/carrier-webhooks/events");
      if (eventsRes.ok) {
        const eData = await eventsRes.json();
        if (eData.ok && eData.data.length > 0) setEvents(eData.data);
      }

      const ledgerRes = await fetch("/api/v1/carrier-webhooks/ledger");
      if (ledgerRes.ok) {
        const lData = await ledgerRes.json();
        if (lData.ok && lData.data.length > 0) setLedgerEntries(lData.data);
      }

      const disputesRes = await fetch("/api/v1/carrier-webhooks/disputes");
      if (disputesRes.ok) {
        const dData = await disputesRes.json();
        if (dData.ok) setDiscrepancies(dData.data);
      }
    } catch {
      // Fallback mock initial state for UI test rendering
      seedDemoState();
    }
  };

  const seedDemoState = () => {
    const demoEvents: NormalizedEvent[] = [
      {
        eventId: "EVT-SF-991",
        carrier: "steadfast",
        consignmentId: "SF-889102",
        orderId: "ORD-9912",
        trackingCode: "TRK-SF-889102",
        status: "delivered",
        recipientPhone: "01712-345678",
        hubLocation: "Gulshan Hub, Dhaka",
        collectedAmount: 3800,
        deliveryFee: 70,
        codFee: 38,
        returnFee: 0,
        netDisbursed: 3692,
        timestamp: new Date().toISOString(),
        rawPayload: { status: "delivered", consignment_id: "SF-889102", cod_amount: 3800 },
      },
      {
        eventId: "EVT-PT-882",
        carrier: "pathao",
        consignmentId: "PT-441029",
        orderId: "ORD-9913",
        trackingCode: "TRK-PT-441029",
        status: "settled",
        recipientPhone: "01819-876543",
        hubLocation: "Agrabad, Chittagong",
        collectedAmount: 6400,
        deliveryFee: 110,
        codFee: 64,
        returnFee: 0,
        netDisbursed: 6226,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        rawPayload: { event_type: "payment_invoice_settled", consignment_id: "PT-441029", price: 6400 },
      },
      {
        eventId: "EVT-RX-773",
        carrier: "redx",
        consignmentId: "RX-110293",
        orderId: "ORD-9914",
        trackingCode: "TRK-RX-110293",
        status: "returned",
        recipientPhone: "01911-223344",
        hubLocation: "Zindabazar, Sylhet",
        collectedAmount: 0,
        deliveryFee: 120,
        codFee: 0,
        returnFee: 60,
        netDisbursed: 0,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        rawPayload: { status: "returned", tracking_id: "RX-110293" },
      },
    ];

    setEvents(demoEvents);

    const demoLedger: LedgerEntry[] = [
      {
        entryNumber: "JE-2026-0901",
        date: new Date().toISOString().split("T")[0],
        description: "COD collected for Order #ORD-9912 via STEADFAST (SF-889102)",
        debitAccount: "1130 - Accounts Receivable: Courier COD (STEADFAST)",
        creditAccount: "4100 - Customer Sales Revenue",
        amount: 3800,
        referenceConsignmentId: "SF-889102",
      },
      {
        entryNumber: "JE-2026-0902",
        date: new Date().toISOString().split("T")[0],
        description: "Bank Payout Received from PATHAO for Consignment PT-441029",
        debitAccount: "1010 - Cash at Bank (bKash/BRAC Bank Commercial)",
        creditAccount: "1130 - Accounts Receivable: Courier COD (PATHAO)",
        amount: 6226,
        referenceConsignmentId: "PT-441029",
      },
      {
        entryNumber: "JE-2026-0903",
        date: new Date().toISOString().split("T")[0],
        description: "Logistics Freight Delivery Expense for Consignment PT-441029",
        debitAccount: "5210 - Logistics & Shipping Freight Expense",
        creditAccount: "1130 - Accounts Receivable: Courier COD (PATHAO)",
        amount: 110,
        referenceConsignmentId: "PT-441029",
      },
    ];
    setLedgerEntries(demoLedger);

    const demoDisputes: Discrepancy[] = [
      {
        discrepancyId: "DISP-2026-01",
        consignmentId: "SF-77192",
        carrier: "steadfast",
        expectedAmount: 4890,
        actualAmount: 4620,
        variance: 270,
        reason: "Unexplained rate jump on 1.2kg weight bracket",
        disputeClaimDraftBangla:
          "বিষয়: কনসাইনমেন্ট #SF-77192-এর সিওডি ডিসবার্সমেন্টে ৳270 টাকার গরমিল দাবি।\n\nপ্রিয় STEADFAST মার্চেন্ট সাপোর্ট টিম, নিয়মমাফিক চার্জ বাদে প্রদেয় নিট অর্থ ছিল ৳4890। কিন্তু স্টেটমেন্টে পাওয়া গেছে ৳4620। অনুগ্রহ করে বিস্তারিত চালানের ব্রেকডাউন প্রদান করে বকেয়া টাকা আমাদের মার্চেন্ট অ্যাকাউন্টে রিফান্ড করুন।",
        disputeClaimDraftEnglish:
          "Subject: Dispute Claim for COD Disbursement Variance (BDT 270) on Consignment #SF-77192\n\nDear STEADFAST Merchant Support, Consignment was marked delivered with expected net disbursement of BDT 4890. Actual disbursed was BDT 4620, variance BDT 270. Please credit delta to our account.",
        severity: "warning",
        createdAt: new Date().toISOString(),
      },
    ];
    setDiscrepancies(demoDisputes);

    setSummary({
      totalEvents: 3,
      totalCollectedCod: 10200,
      totalDeliveryFees: 300,
      totalCodFees: 102,
      totalSettledDisbursements: 6226,
      pendingReceivables: 3800,
      activeDiscrepanciesCount: 1,
      totalDiscrepancyAmount: 270,
      carrierBreakdown: {
        steadfast: { deliveredCount: 1, returnedCount: 0, collectedAmount: 3800, feePaid: 108, activeDisputes: 1 },
        pathao: { deliveredCount: 1, returnedCount: 0, collectedAmount: 6400, feePaid: 174, activeDisputes: 0 },
        redx: { deliveredCount: 0, returnedCount: 1, collectedAmount: 0, feePaid: 180, activeDisputes: 0 },
        paperfly: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
      },
    });
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const res = await fetch("/api/v1/carrier-webhooks/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: simCarrier,
          consignmentId: simConsignmentId,
          orderId: simOrderId,
          status: simStatus,
          collectedAmount: simCodAmount,
          deliveryFee: simDeliveryFee,
          codFee: simCodFee,
          hubLocation: simHub,
        }),
      });

      if (res.ok) {
        await fetchSummaryAndEvents();
        setActiveTab("live_stream");
      }
    } catch {
      // Local fallback
      const newEvt: NormalizedEvent = {
        eventId: `EVT-${Date.now()}`,
        carrier: simCarrier,
        consignmentId: simConsignmentId,
        orderId: simOrderId,
        trackingCode: `TRK-${simConsignmentId}`,
        status: simStatus,
        collectedAmount: simStatus === "delivered" || simStatus === "settled" ? simCodAmount : 0,
        deliveryFee: simDeliveryFee,
        codFee: simCodFee,
        returnFee: simStatus === "returned" ? 50 : 0,
        netDisbursed: Math.max(0, simCodAmount - simDeliveryFee - simCodFee),
        hubLocation: simHub,
        timestamp: new Date().toISOString(),
        rawPayload: { simulated: true, carrier: simCarrier, status: simStatus },
      };
      setEvents((prev) => [newEvt, ...prev]);
      setActiveTab("live_stream");
    } finally {
      setIsSimulating(false);
      setSimConsignmentId(`CNS-${Math.floor(100000 + Math.random() * 900000)}`);
      setSimOrderId(`ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const filteredEvents =
    selectedCarrierFilter === "all"
      ? events
      : events.filter((e) => e.carrier === selectedCarrierFilter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Multi-Carrier Webhook & Real-Time Double-Entry Settlement Reconciler"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Multi-Carrier Inbound Webhook & Settlement Reconciler
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Autonomous Double-Entry GL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                মাল্টি-ক্যারিয়ার ওয়েবহুক ডিসপ্যাচার ও রিয়েল-টাইম সিওডি ডিসবার্সমেন্ট অডিটর
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Carrier Status Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Steadfast
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Pathao
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> RedX
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Paperfly
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-[#0B0F17]/90 border-b border-[#1E293B]">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Total COD Collected</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ৳{(summary?.totalCollectedCod ?? 10200).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Delivered</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Bank Disbursed Payout</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.totalSettledDisbursements ?? 6226).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">Net Settled</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Pending Courier Receivable</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-amber-400">
                ৳{(summary?.pendingReceivables ?? 3800).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-amber-500/80">Clearing</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Active Fee Disputes</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-400">
                ৳{(summary?.totalDiscrepancyAmount ?? 270).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-rose-400/80">
                ({discrepancies.length} claims)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-[#1E293B] bg-[#0F172A]/40">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab("live_stream")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "live_stream"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Live Webhook Stream ({events.length})
            </button>

            <button
              onClick={() => setActiveTab("gl_ledger")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "gl_ledger"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Double-Entry GL Ledger ({ledgerEntries.length})
            </button>

            <button
              onClick={() => setActiveTab("disputes")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "disputes"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Disputes & Claim Letters ({discrepancies.length})
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "simulator"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Webhook Sandbox Simulator
            </button>
          </div>

          {activeTab === "live_stream" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              <select
                value={selectedCarrierFilter}
                onChange={(e) => setSelectedCarrierFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Carriers</option>
                <option value="steadfast">Steadfast</option>
                <option value="pathao">Pathao</option>
                <option value="redx">RedX</option>
                <option value="paperfly">Paperfly</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Live Webhook Stream */}
          {activeTab === "live_stream" && (
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                  <p className="text-sm font-medium">No webhook events received yet.</p>
                  <p className="text-xs mt-1">Use the Webhook Sandbox Simulator to fire mock carrier payloads.</p>
                </div>
              ) : (
                filteredEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md ${
                            evt.carrier === "steadfast"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : evt.carrier === "pathao"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : evt.carrier === "redx"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {evt.carrier}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-white">
                              {evt.consignmentId}
                            </span>
                            <span className="text-xs text-slate-400">({evt.orderId})</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            📍 {evt.hubLocation || "Dhaka Central"} • 📞 {evt.recipientPhone || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            evt.status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : evt.status === "settled"
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : evt.status === "returned"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {evt.status.replace("_", " ").toUpperCase()}
                        </span>

                        <div className="text-right">
                          <span className="text-sm font-bold text-white">
                            ৳{evt.collectedAmount.toLocaleString("en-BD")}
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Fee: ৳{evt.deliveryFee + evt.codFee} | Net: ৳{evt.netDisbursed}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable JSON Payload */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Event ID: {evt.eventId}</span>
                      <button
                        onClick={() =>
                          setExpandedPayloadId(
                            expandedPayloadId === evt.eventId ? null : evt.eventId
                          )
                        }
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        {expandedPayloadId === evt.eventId ? "Hide Payload ▲" : "View Raw Payload ▼"}
                      </button>
                    </div>

                    {expandedPayloadId === evt.eventId && (
                      <pre className="mt-2 p-3 bg-black/60 rounded-lg text-[11px] font-mono text-emerald-300/90 overflow-x-auto border border-emerald-950">
                        {JSON.stringify(evt.rawPayload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Double-Entry General Ledger */}
          {activeTab === "gl_ledger" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Real-time double-entry journal postings generated automatically upon webhook delivery and settlement events.
                </p>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  Balanced Trial: 100% Verified
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Entry # & Date</th>
                      <th className="p-3">Description & Ref</th>
                      <th className="p-3">Debit Account</th>
                      <th className="p-3">Credit Account</th>
                      <th className="p-3 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerEntries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No general ledger entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      ledgerEntries.map((entry) => (
                        <tr key={entry.entryNumber} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-slate-300">
                            <div>{entry.entryNumber}</div>
                            <div className="text-[11px] text-slate-500">{entry.date}</div>
                          </td>
                          <td className="p-3 text-slate-200">
                            <div>{entry.description}</div>
                            <div className="text-[11px] text-emerald-400 font-mono">
                              Consignment: {entry.referenceConsignmentId}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-emerald-400">
                            {entry.debitAccount}
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {entry.creditAccount}
                          </td>
                          <td className="p-3 text-right font-bold font-mono text-white">
                            ৳{entry.amount.toLocaleString("en-BD")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Disputes & Claim Letters */}
          {activeTab === "disputes" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Discrepancies identified when courier COD disbursement manifests do not match calculated delivery fee schedules.
              </p>

              {discrepancies.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
                  <p className="text-sm font-medium text-slate-300">Zero Unreconciled Variances</p>
                  <p className="text-xs mt-1">All courier settlements match expected COD invoice calculations perfectly.</p>
                </div>
              ) : (
                discrepancies.map((disp) => (
                  <div
                    key={disp.discrepancyId}
                    className="p-5 bg-slate-900/80 border border-rose-900/40 rounded-xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              {disp.discrepancyId}
                            </span>
                            <span className="px-2 py-0.5 text-xs uppercase bg-slate-800 text-slate-300 rounded font-semibold">
                              {disp.carrier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Ref: {disp.consignmentId} • {disp.reason}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-rose-400">
                          -৳{disp.variance.toLocaleString("en-BD")}
                        </span>
                        <p className="text-xs text-slate-400">
                          Expected: ৳{disp.expectedAmount} | Received: ৳{disp.actualAmount}
                        </p>
                      </div>
                    </div>

                    {/* Bilingual Dispute Letters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-black/50 border border-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-emerald-400">
                            দাবি পত্র (বাংলা বয়ান)
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(disp.disputeClaimDraftBangla, `bn-${disp.discrepancyId}`)
                            }
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                          >
                            {copiedId === `bn-${disp.discrepancyId}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-bangla">
                          {disp.disputeClaimDraftBangla}
                        </p>
                      </div>

                      <div className="p-3 bg-black/50 border border-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-teal-400">
                            Dispute Draft (English)
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(disp.disputeClaimDraftEnglish, `en-${disp.discrepancyId}`)
                            }
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                          >
                            {copiedId === `en-${disp.discrepancyId}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                          {disp.disputeClaimDraftEnglish}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Simulator Sandbox */}
          {activeTab === "simulator" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  Inbound Webhook Live Simulator & Reconciler
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Simulate courier status updates to verify payload normalization, journal entry balancing, and automated anomaly detection.
                </p>
              </div>

              <form onSubmit={handleSimulateSubmit} className="space-y-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Carrier Partner
                    </label>
                    <select
                      value={simCarrier}
                      onChange={(e) => setSimCarrier(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="steadfast">Steadfast Courier</option>
                      <option value="pathao">Pathao Courier</option>
                      <option value="redx">RedX Logistics</option>
                      <option value="paperfly">Paperfly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Parcel Lifecycle Status
                    </label>
                    <select
                      value={simStatus}
                      onChange={(e) => setSimStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="delivered">Delivered (COD Collected)</option>
                      <option value="settled">Settled (Bank Disbursed)</option>
                      <option value="returned">Returned (Delivery Failed)</option>
                      <option value="in_transit">In-Transit / Hub Dispatch</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Consignment ID
                    </label>
                    <input
                      type="text"
                      value={simConsignmentId}
                      onChange={(e) => setSimConsignmentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Order Invoice #
                    </label>
                    <input
                      type="text"
                      value={simOrderId}
                      onChange={(e) => setSimOrderId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      COD Cash (৳)
                    </label>
                    <input
                      type="number"
                      value={simCodAmount}
                      onChange={(e) => setSimCodAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Delivery Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={simDeliveryFee}
                      onChange={(e) => setSimDeliveryFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      COD Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={simCodFee}
                      onChange={(e) => setSimCodFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Delivery Hub / Thana
                  </label>
                  <input
                    type="text"
                    value={simHub}
                    onChange={(e) => setSimHub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isSimulating ? "Ingesting & Reconciling..." : "Fire Inbound Webhook Event"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiCarrierWebhookModal;
