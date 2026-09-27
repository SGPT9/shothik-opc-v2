import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  ShieldAlert,
  MapPin,
  Truck,
  Volume2,
  PhoneOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  MessageSquare,
  ShieldCheck,
  X,
  Play,
  Pause,
  Hash
} from "lucide-react";

export interface CodIvrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodIvrModal: React.FC<CodIvrModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"simulator" | "risk" | "address" | "dispatch">("simulator");

  // Order Details Form State
  const [orderId, setOrderId] = useState("ORD-2026-9812");
  const [customerName, setCustomerName] = useState("Farhan Tanvir");
  const [customerPhone, setCustomerPhone] = useState("+8801712345678");
  const [codAmount, setCodAmount] = useState(2450);
  const [rawAddress, setRawAddress] = useState("House 42, Road 11, Block C, Mirpur 2, Dhaka 1216");
  const [dialect, setDialect] = useState<"dhaka_standard" | "chittagong_regional" | "sylhet_regional" | "english_bangla_hybrid">("dhaka_standard");

  // IVR Call Simulation State
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [dtmfSelection, setDtmfSelection] = useState<string | null>(null);
  const [callPlan, setCallPlan] = useState<any | null>(null);

  // Risk Radar State
  const [riskData, setRiskData] = useState<any | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Address Parsing State
  const [parsedAddress, setParsedAddress] = useState<any | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // Courier Dispatch State
  const [courierProvider, setCourierProvider] = useState<"steadfast" | "pathao" | "redx" | "paperfly">("steadfast");
  const [consignment, setConsignment] = useState<any | null>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Keyboard shortcut ⌘V / Ctrl+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      handleGeneratePlan();
      handleAssessRisk();
      handleParseAddress();
    }
  }, [isOpen]);

  const handleGeneratePlan = async () => {
    try {
      const res = await fetch("/api/ivr/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerName,
          customerPhone,
          codAmount,
          rawAddress,
          dialect,
          items: [{ sku: "TSHIRT-01", name: "Premium Polo T-Shirt", quantity: 2, unitPrice: 1225 }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCallPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssessRisk = async () => {
    setRiskLoading(true);
    try {
      const res = await fetch("/api/ivr/rto-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerPhone,
          codAmount,
          rawAddress,
          pastDeliverySuccessCount: 4,
          pastDeliveryReturnCount: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRiskData(data.assessment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRiskLoading(false);
    }
  };

  const handleParseAddress = async () => {
    setAddressLoading(true);
    try {
      const res = await fetch("/api/ivr/parse-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawAddress }),
      });
      const data = await res.json();
      if (data.success) {
        setParsedAddress(data.parsedAddress);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDispatchCourier = async () => {
    setDispatchLoading(true);
    try {
      const res = await fetch("/api/ivr/dispatch-courier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            orderId,
            customerName,
            customerPhone,
            codAmount,
            rawAddress,
          },
          courierProvider,
          confirmedBy: "voice_ivr",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConsignment(data.consignment);
        setActiveTab("dispatch");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatchLoading(false);
    }
  };

  const startCallSimulation = () => {
    setCallStatus("ringing");
    setDtmfSelection(null);
    setTimeout(() => {
      setCallStatus("connected");
      setIsPlayingAudio(true);
    }, 1500);
  };

  const handleDtmfKey = (key: string) => {
    setDtmfSelection(key);
    if (key === "1") {
      setTimeout(() => {
        setIsPlayingAudio(false);
        setCallStatus("ended");
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Autonomous Banglish Voice IVR & COD Return Minimizer
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Slice 59 · v2.8
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural Bangla dialogue verification, RTO fraud scoring, and automated courier consignment dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 border border-slate-700 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              ⌘V
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "simulator"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            Live IVR Voice Simulator
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "risk"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            RTO Fraud Radar
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "address"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Address Normalizer
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "dispatch"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Truck className="w-4 h-4" />
            Courier Dispatch Log
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Parameters Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Customer Name</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-1"
              />
            </div>
            <div>
              <span className="text-slate-500 block">Phone Number</span>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-1 font-mono"
              />
            </div>
            <div>
              <span className="text-slate-500 block">COD Amount (BDT)</span>
              <input
                type="number"
                value={codAmount}
                onChange={(e) => setCodAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-1"
              />
            </div>
            <div>
              <span className="text-slate-500 block">Dialect Mode</span>
              <select
                value={dialect}
                onChange={(e: any) => setDialect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 mt-1"
              >
                <option value="dhaka_standard">Dhaka Colloquial</option>
                <option value="chittagong_regional">Chittagonian Regional</option>
                <option value="sylhet_regional">Sylheti Regional</option>
                <option value="english_bangla_hybrid">Banglish Hybrid</option>
              </select>
            </div>
          </div>

          {/* Tab 1: Simulator */}
          {activeTab === "simulator" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Phone Simulator */}
              <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-inner">
                <div className="w-full flex justify-between items-center mb-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${callStatus === "connected" ? "bg-emerald-400 animate-ping" : callStatus === "ringing" ? "bg-amber-400 animate-pulse" : "bg-slate-600"}`}></span>
                    {callStatus.toUpperCase()}
                  </span>
                  <span className="font-mono text-slate-500">Bangla IVR Engine</span>
                </div>

                <div className="my-6 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                    <Volume2 className={`w-10 h-10 ${callStatus === "connected" ? "animate-bounce" : ""}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-200">{customerName}</h3>
                  <p className="text-xs font-mono text-slate-400">{customerPhone}</p>
                  <p className="text-xs text-emerald-400 mt-1">COD: ৳{codAmount}</p>
                </div>

                {/* Keypad */}
                <div className="w-full max-w-[200px] grid grid-cols-3 gap-2 my-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
                    <button
                      key={k}
                      disabled={callStatus !== "connected"}
                      onClick={() => handleDtmfKey(k)}
                      className={`h-10 rounded-lg font-bold text-sm transition flex items-center justify-center ${
                        dtmfSelection === k
                          ? "bg-emerald-500 text-slate-950 scale-105"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                      } ${callStatus !== "connected" ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Call Control Buttons */}
                <div className="flex items-center gap-4 mt-4">
                  {callStatus === "idle" || callStatus === "ended" ? (
                    <button
                      onClick={startCallSimulation}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Initiate IVR Call
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCallStatus("ended");
                        setIsPlayingAudio(false);
                      }}
                      className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/20 transition"
                    >
                      <PhoneOff className="w-4 h-4" />
                      End Call
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Dialogue Script & Fallback WhatsApp */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Generated Voice Dialogue Script (SSML Transcript)
                  </h4>
                  {callPlan ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-emerald-400 font-bold block mb-1">Bangla Audio Synthesizer:</span>
                        <p className="text-slate-200 leading-relaxed">{callPlan.greetingScript}</p>
                      </div>
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-semibold block mb-1">Banglish Phonetic Rendering:</span>
                        <p className="text-slate-300 italic font-mono text-[11px]">{callPlan.banglishScript}</p>
                      </div>

                      <div className="space-y-2 mt-3">
                        <span className="text-slate-400 font-medium block">Interactive Branching Steps:</span>
                        {callPlan.dialogueSteps.map((step: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                            <p className="text-slate-300">{step.banglaScript}</p>
                            {step.dtmfOptions && (
                              <div className="flex gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                                  [1] Confirm
                                </span>
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px]">
                                  [2] Change Address
                                </span>
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px]">
                                  [3] Cancel
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">Generating speech plan...</div>
                  )}
                </div>

                {/* Fallback WhatsApp Prompt */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Automated Fallback WhatsApp Prompt
                  </h4>
                  <pre className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300 font-mono text-xs whitespace-pre-wrap">
                    {callPlan?.fallbackWhatsAppMessage || "Loading fallback prompt..."}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Risk Radar */}
          {activeTab === "risk" && (
            <div className="space-y-6">
              {riskData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider mb-2">RTO Fraud Probability</span>
                    <div className="relative w-32 h-32 flex items-center justify-center my-2">
                      <div className="text-3xl font-extrabold text-slate-100 font-mono">{riskData.riskScore}</div>
                      <span className="text-xs text-slate-500 block absolute bottom-5">/ 100</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        riskData.riskTier === "LOW"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : riskData.riskTier === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {riskData.riskTier} RISK TIER
                    </span>
                  </div>

                  {/* Risk Factors & Recommendations */}
                  <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Detected Risk Factors
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {riskData.riskFactors.map((rf: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{rf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Operational Recommendation
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">{riskData.recommendation}</p>
                    </div>

                    {riskData.requiresPartialAdvancePayment && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-amber-300 font-medium">
                          Required Partial Advance Delivery Fee:
                        </span>
                        <span className="font-bold font-mono text-amber-400 text-sm">
                          ৳{riskData.advanceAmountRequiredBDT} BDT (bKash/Nagad)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">Evaluating order risk...</div>
              )}
            </div>
          )}

          {/* Tab 3: Address Normalizer */}
          {activeTab === "address" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Raw Unstructured Address (Bangla / English)
                  </label>
                  <textarea
                    rows={3}
                    value={rawAddress}
                    onChange={(e) => setRawAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleParseAddress}
                      disabled={addressLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      {addressLoading ? "Parsing..." : "Normalize Address & Zone"}
                    </button>
                  </div>
                </div>

                {parsedAddress && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">District</span>
                      <span className="font-bold text-slate-200 mt-1 block">{parsedAddress.district}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Thana / Upazila</span>
                      <span className="font-bold text-slate-200 mt-1 block">{parsedAddress.thana}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Courier Zone</span>
                      <span className="font-bold text-emerald-400 mt-1 block uppercase font-mono">
                        {parsedAddress.zoneType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Delivery Charge</span>
                      <span className="font-bold text-slate-200 mt-1 block font-mono">
                        ৳{parsedAddress.standardDeliveryChargeBDT} BDT
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Courier Dispatch */}
          {activeTab === "dispatch" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Direct Courier Consignment Booking
                    </h4>
                    <p className="text-xs text-slate-500">
                      Auto-generate delivery tracking code and lock order details with SHA-256 seal
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={courierProvider}
                      onChange={(e: any) => setCourierProvider(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                    >
                      <option value="steadfast">Steadfast Courier</option>
                      <option value="pathao">Pathao Logistics</option>
                      <option value="redx">RedX Express</option>
                      <option value="paperfly">Paperfly</option>
                    </select>
                    <button
                      onClick={handleDispatchCourier}
                      disabled={dispatchLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                    >
                      <Truck className="w-4 h-4" />
                      {dispatchLoading ? "Booking..." : "Book Consignment"}
                    </button>
                  </div>
                </div>

                {consignment && (
                  <div className="mt-6 p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Consignment Booked Successfully
                      </span>
                      <span className="font-mono text-slate-400">{consignment.consignmentId}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Tracking Code</span>
                        <span className="font-mono font-bold text-slate-100">{consignment.trackingCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Provider</span>
                        <span className="font-bold text-slate-100 uppercase">{consignment.courierProvider}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">COD Collectible</span>
                        <span className="font-mono font-bold text-emerald-400">৳{consignment.codAmountBDT}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Delivery Fee</span>
                        <span className="font-mono font-bold text-slate-300">৳{consignment.deliveryChargeBDT}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-slate-500 block text-[11px] mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Cryptographic Verification Seal (SHA-256)
                      </span>
                      <code className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 p-2 rounded block break-all">
                        {consignment.verificationHashSha256}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              IVR Gateway Connected
            </span>
            <span>Steadfast API: Operational</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
