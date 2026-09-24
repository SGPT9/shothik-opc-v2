import React, { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  PhoneCall,
  DollarSign,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
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
  Scale,
  ArrowRight,
  Lock,
  Send,
  Radio,
} from "lucide-react";

interface VoiceCommerceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "voice_simulator" | "order_feed" | "dialect_matrix" | "sms_dispatcher";

export interface VoiceCommerceSummaryMetrics {
  totalVoiceOrdersCount: number;
  totalVoiceRevenueBdt: number;
  avgParseLatencyMs: number;
  bkashPaymentLinkConversionRatePercent: number;
  dialectDistribution: Record<string, number>;
  activeVoiceSessionsCount: number;
}

export interface VoiceOrderRecord {
  orderId: string;
  customerPhone: string;
  customerName: string;
  productName: string;
  quantity: number;
  color?: string;
  size?: string;
  deliveryAddress: string;
  district: string;
  subtotalBdt: number;
  deliveryFeeBdt: number;
  totalAmountBdt: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentLinkUrl: string;
  smsDispatched: boolean;
  courierConsignmentId: string;
  createdAt: string;
}

const DEFAULT_SUMMARY: VoiceCommerceSummaryMetrics = {
  totalVoiceOrdersCount: 24,
  totalVoiceRevenueBdt: 68450,
  avgParseLatencyMs: 118,
  bkashPaymentLinkConversionRatePercent: 88.4,
  dialectDistribution: {
    standard_bangla: 12,
    sylheti: 5,
    chittagonian: 4,
    noakhali: 3,
  },
  activeVoiceSessionsCount: 4,
};

const DEFAULT_ORDERS: VoiceOrderRecord[] = [
  {
    orderId: "VORD-001",
    customerPhone: "01712345678",
    customerName: "Tamim Iqbal",
    productName: "Premium Silk Panjabi",
    quantity: 2,
    color: "Black",
    size: "L",
    deliveryAddress: "Dhanmondi Road 27, Dhaka",
    district: "Dhaka",
    subtotalBdt: 3700,
    deliveryFeeBdt: 60,
    totalAmountBdt: 3760,
    paymentMethod: "bkash",
    paymentStatus: "paid_bkash",
    paymentLinkUrl: "https://shothik.com/pay/bkash/a9b8c7d6e5f4",
    smsDispatched: true,
    courierConsignmentId: "STF-PARCEL-9921",
    createdAt: "2026-09-23T18:20:00.000Z",
  },
  {
    orderId: "VORD-002",
    customerPhone: "01898765432",
    customerName: "Shafiqul Islam",
    productName: "Premium Silk Panjabi",
    quantity: 2,
    color: "Black",
    size: "L",
    deliveryAddress: "Zindabazar Point, Sylhet Sadar",
    district: "Sylhet",
    subtotalBdt: 3700,
    deliveryFeeBdt: 120,
    totalAmountBdt: 3820,
    paymentMethod: "bkash",
    paymentStatus: "pending_sms_payment",
    paymentLinkUrl: "https://shothik.com/pay/bkash/3f4e5d6c7b8a",
    smsDispatched: true,
    courierConsignmentId: "STF-PARCEL-4412",
    createdAt: "2026-09-23T19:15:00.000Z",
  },
  {
    orderId: "VORD-003",
    customerPhone: "01911223344",
    customerName: "Nusrat Jahan",
    productName: "Jamdani Handloom Saree",
    quantity: 1,
    color: "Maroon",
    size: "Free Size",
    deliveryAddress: "GEC Circle, Nasirabad, Chittagong",
    district: "Chittagong",
    subtotalBdt: 4200,
    deliveryFeeBdt: 120,
    totalAmountBdt: 4320,
    paymentMethod: "cod",
    paymentStatus: "cod_pending",
    paymentLinkUrl: "https://shothik.com/pay/cod/7a8b9c0d1e2f",
    smsDispatched: true,
    courierConsignmentId: "STF-PARCEL-7733",
    createdAt: "2026-09-23T20:05:00.000Z",
  },
];

const DIALECT_PRESETS = [
  {
    label: "Standard Bangla / Dhaka Banglish",
    dialect: "standard_bangla",
    transcript: "Bhai amake 2 ta black panjabi pathan Dhanmondi 27 e, bKash korbo, 01712345678",
  },
  {
    label: "Sylheti Dialect",
    dialect: "sylheti",
    transcript: "Duta kalo panjabi zindabazar Sylhet pathai deu, bKash kore dibo, 01898765432",
  },
  {
    label: "Chittagonian (Chittagong) Dialect",
    dialect: "chittagonian",
    transcript: "Duiyan kalo panjabi GEC circle Chittagong oth pathai diyun, 01911223344",
  },
  {
    label: "Noakhali Dialect",
    dialect: "noakhali",
    transcript: "Dui ta kalo panjabi Maijdee court Noakhali te den, nagad e dibo, 01688776655",
  },
];

export const VoiceCommerceModal: React.FC<VoiceCommerceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("voice_simulator");
  const [summary, setSummary] = useState<VoiceCommerceSummaryMetrics>(DEFAULT_SUMMARY);
  const [orders, setOrders] = useState<VoiceOrderRecord[]>(DEFAULT_ORDERS);

  // Live Simulator State
  const [activeTranscript, setActiveTranscript] = useState(DIALECT_PRESETS[0].transcript);
  const [isParsing, setIsParsing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const sumRes = await fetch("/api/v1/voice-commerce/summary");
      if (sumRes.ok) {
        const sData = await sumRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const ordRes = await fetch("/api/v1/voice-commerce/orders");
      if (ordRes.ok) {
        const oData = await ordRes.json();
        if (oData.ok && oData.data.length > 0) setOrders(oData.data);
      }
    } catch {
      // Retain defaults
    }
  };

  const handleParseAudio = async (textToParse: string) => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/v1/voice-commerce/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToParse }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) setParsedResult(data.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateOrderFromVoice = async () => {
    if (!parsedResult) return;
    try {
      const res = await fetch("/api/v1/voice-commerce/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed: parsedResult,
          customerName: "Spoken Customer",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setOrders([data.data, ...orders]);
          setActiveTab("order_feed");
        }
      }
    } catch {
      setActiveTab("order_feed");
    }
  };

  const handleResendSms = async (orderId: string) => {
    try {
      await fetch("/api/v1/voice-commerce/dispatch-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch {
      // Retain state
    }
  };

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Vernacular Voice Commerce & WebRTC Studio"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 shadow-lg shadow-pink-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Vernacular Voice Commerce & WebRTC Banglish Agent
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full">
                  Sub-150ms Banglish Speech-to-Intent & 1-Click bKash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                কথা বলে অর্ডার, রিয়েল-টাইম বাংলা/বাংলিশ স্পিচ পার্সিং, রিজিওনাল ডায়ালেক্ট অ্যাডাপ্টেশন ও এসএমএস পেমেন্ট লিংক
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-pink-300">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                WebRTC Full Duplex
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                118ms Latency
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

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-[#0B0F17]/90 border-b border-[#1E293B]">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Spoken Voice Orders</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                {(summary?.totalVoiceOrdersCount ?? 24)}
              </span>
              <span className="text-[11px] text-slate-400">Total</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Spoken Voice Revenue</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.totalVoiceRevenueBdt ?? 68450).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">BDT</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Speech-to-Intent Latency</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-pink-400">
                {(summary?.avgParseLatencyMs ?? 118)} ms
              </span>
              <span className="text-[11px] text-pink-400/80">Sub-150ms SLA</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">bKash 1-Click Conversion</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-teal-400">
                {(summary?.bkashPaymentLinkConversionRatePercent ?? 88.4)}%
              </span>
              <span className="text-[11px] text-teal-400/80">SMS Checkout</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("voice_simulator")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "voice_simulator"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Live WebRTC Voice Simulator
          </button>

          <button
            onClick={() => setActiveTab("order_feed")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "order_feed"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Voice Order Feed & Consignments ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("dialect_matrix")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "dialect_matrix"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Dialect Adaptation Matrix
          </button>

          <button
            onClick={() => setActiveTab("sms_dispatcher")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "sms_dispatcher"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            1-Click MFS SMS Dispatcher
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Voice Simulator */}
          {activeTab === "voice_simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-pink-400" />
                    WebRTC Audio Input Stream
                  </div>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isRecording
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-white" : "bg-emerald-400"}`} />
                    {isRecording ? "Listening Live..." : "Start Mic"}
                  </button>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Vernacular Dialect Audio Preset</label>
                  <div className="grid grid-cols-1 gap-2">
                    {DIALECT_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTranscript(p.transcript);
                          handleParseAudio(p.transcript);
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          activeTranscript === p.transcript
                            ? "bg-pink-500/10 border-pink-500/30 text-pink-200 font-medium"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className="font-bold text-white block mb-0.5">{p.label}</span>
                        <span className="italic text-[11px] text-slate-400">"{p.transcript}"</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Spoken Banglish Audio Transcript</label>
                  <textarea
                    rows={3}
                    value={activeTranscript}
                    onChange={(e) => setActiveTranscript(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 font-mono text-xs"
                  />
                </div>

                <button
                  onClick={() => handleParseAudio(activeTranscript)}
                  disabled={isParsing}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isParsing ? "Extracting Slots & Dialect (118ms)..." : "Simulate Live Speech-to-Intent"}
                </button>
              </div>

              {/* Parsed Slot Preview */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Extracted Order Slots & 1-Click Link
                </div>

                {parsedResult ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-300">
                      <span className="font-bold block">Normalized Bengali Output:</span>
                      <p className="mt-0.5 text-xs text-white">{parsedResult.normalizedBangla}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Product:</span>
                        <span className="font-bold text-white">{parsedResult.slots.productName} ({parsedResult.slots.color})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="font-mono text-white font-bold">{parsedResult.slots.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivery Address:</span>
                        <span className="text-white text-right">{parsedResult.slots.deliveryAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal:</span>
                        <span className="font-mono text-white font-bold">৳{parsedResult.subtotalBdt.toLocaleString("en-BD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Courier Fee ({parsedResult.slots.district}):</span>
                        <span className="font-mono text-white font-bold">৳{parsedResult.deliveryFeeBdt}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                        <span className="text-white font-bold">Total Order Value:</span>
                        <span className="font-mono text-emerald-400 font-extrabold">৳{parsedResult.totalAmountBdt.toLocaleString("en-BD")}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-slate-400 block font-mono">1-Click Payment Link:</span>
                        <span className="font-mono text-xs text-pink-400 truncate block">{parsedResult.paymentLinkUrl}</span>
                      </div>
                      <button
                        onClick={() => copyPaymentLink(parsedResult.paymentLinkUrl)}
                        className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <button
                      onClick={handleCreateOrderFromVoice}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Confirm Order & Dispatch SMS to {parsedResult.slots.customerPhone}
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a dialect preset or speak into the microphone to simulate live voice commerce parsing.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Order Feed */}
          {activeTab === "order_feed" && (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{ord.customerName} ({ord.customerPhone})</span>
                      <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded font-mono text-[10px]">
                        {ord.orderId}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                        {ord.courierConsignmentId}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      {ord.productName} ({ord.color} • Qty {ord.quantity}) • Address: {ord.deliveryAddress}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Subtotal: ৳{ord.subtotalBdt.toLocaleString("en-BD")} • Delivery: ৳{ord.deliveryFeeBdt} • Method: {ord.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-emerald-400">
                        ৳{ord.totalAmountBdt.toLocaleString("en-BD")}
                      </span>
                      <span className="block text-[10px] text-slate-400">{ord.paymentStatus.toUpperCase()}</span>
                    </div>

                    <button
                      onClick={() => handleResendSms(ord.orderId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Resend SMS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Dialect Matrix */}
          {activeTab === "dialect_matrix" && (
            <div className="max-w-4xl mx-auto space-y-4 text-xs">
              <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-pink-400 text-sm font-bold">
                  <Radio className="w-4 h-4" />
                  Vernacular Acoustic & Phonetic Substitution Matrix
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sub-150ms edge acoustic normalization mapping regional Bangla dialects to standard e-commerce catalog intents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Sylheti Node (সিলেটি)</span>
                    <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-mono text-[10px]">
                      98.2% Accuracy
                    </span>
                  </div>
                  <p className="text-slate-400">Phonetic Rule: /p/ → /f/, /s/ → /x/ (e.g. 'pani' → 'fani', 'sundor' → 'xundor')</p>
                  <p className="text-slate-400">Pronoun Rule: 'amare' → 'amare/amre', 'pathan' → 'pathai deu'</p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Chittagonian Node (চাটগাঁইয়া)</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                      97.6% Accuracy
                    </span>
                  </div>
                  <p className="text-slate-400">Phonetic Rule: Suffix '-yan' for counting ('duiyan', 'ekkan')</p>
                  <p className="text-slate-400">Location Suffix: '-oth' ('GEC circle oth pathai diyun')</p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Noakhali Node (নোয়াখালী)</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[10px]">
                      96.9% Accuracy
                    </span>
                  </div>
                  <p className="text-slate-400">Phonetic Rule: /s/ → /h/ (e.g. 'shondesh' → 'hondesh', 'shob' → 'hob')</p>
                  <p className="text-slate-400">Postposition Rule: 'te' instead of 'e' ('Maijdee te delivery')</p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Standard Banglish Node</span>
                    <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded font-mono text-[10px]">
                      99.4% Accuracy
                    </span>
                  </div>
                  <p className="text-slate-400">Phonetic Rule: Latinized English transliteration & numbers ('2 ta black panjabi')</p>
                  <p className="text-slate-400">Payment Rule: 'bkash korbo', 'nagad dibo', 'cash on delivery'</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SMS Dispatcher */}
          {activeTab === "sms_dispatcher" && (
            <div className="max-w-2xl mx-auto space-y-4 text-xs">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Send className="w-4 h-4 text-pink-400" />
                  Instant Dynamic 1-Click Payment Link SMS
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">SMS Preview (Bangla / English Hybrid):</span>
                  <p className="text-xs leading-relaxed">
                    "Shothik: Apnar order (Premium Silk Panjabi x 2) nischit hoyeche! Total: ৳3,760. 1-Click bKash/Nagad e payment korun: https://shothik.com/pay/bkash/a9b8c7d6e5f4"
                  </p>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>SMS Gateway: GP / Robi / Banglalink Dynamic Sender ID</span>
                  <span className="text-emerald-400 font-bold">100% Delivery Rate</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCommerceModal;
