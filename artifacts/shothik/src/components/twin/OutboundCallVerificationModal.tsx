"use client";

import { useState } from "react";
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Truck,
  Volume2,
  Mic,
  Radio,
  RefreshCw,
  AlertTriangle,
  User,
  MapPin,
  ExternalLink,
  Bot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface OutboundCallVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDialect?: "standard" | "dhakaiya" | "sylheti" | "chatgaya";
  companyName?: string;
}

interface SimulatedCallItem {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  grandTotalBdt: number;
  deliveryAddress: string;
  status: "queued" | "in_progress" | "confirmed" | "cancelled" | "retry_scheduled";
  disposition?: string;
  trackingCode?: string;
  isSupervised?: boolean;
}

export const DEMO_CALL_QUEUE: SimulatedCallItem[] = [
  {
    id: "call_01",
    orderId: "ORD_COD_9012",
    customerName: "Md. Tanvir Hasan",
    customerPhone: "+8801712345678",
    itemsSummary: "Royal Platinum Panjabi (Black, XL)",
    grandTotalBdt: 2310,
    deliveryAddress: "House 14, Road 7, Banani, Dhaka",
    status: "confirmed",
    disposition: "CONFIRMED",
    trackingCode: "BD_STEADFAST_819203",
  },
  {
    id: "call_02",
    orderId: "ORD_COD_9013",
    customerName: "Syed Farhan Ahmed",
    customerPhone: "+8801898765432",
    itemsSummary: "2x Pure Sundarban Honey + Boi Mela Monograph",
    grandTotalBdt: 3670,
    deliveryAddress: "Zindabazar, Amberkhana Road, Sylhet",
    status: "in_progress",
  },
  {
    id: "call_03",
    orderId: "ORD_COD_9014",
    customerName: "Nusrat Jahan",
    customerPhone: "+8801911223344",
    itemsSummary: "3x Dhakai Jamdani Sarees (Navy Blue)",
    grandTotalBdt: 11400,
    deliveryAddress: "Agrabad Commercial Area, Chittagong",
    status: "queued",
    isSupervised: true,
  },
];

export function OutboundCallVerificationModal({
  open,
  onOpenChange,
  defaultDialect = "standard",
}: OutboundCallVerificationModalProps) {
  const [dialect, setDialect] = useState<"standard" | "dhakaiya" | "sylheti" | "chatgaya">(defaultDialect);
  const [activeTab, setActiveTab] = useState<"live_dialer" | "call_queue" | "btrc_rules">("live_dialer");
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(14);
  const [inputTurn, setInputTurn] = useState("জি ভাই, অর্ডার কনফার্ম। বনানী ঠিকানায় পাঠায়ে দেন।");
  const [activeOrder, setActiveOrder] = useState<SimulatedCallItem>(DEMO_CALL_QUEUE[1]);

  const [callTranscript, setCallTranscript] = useState<Array<{ speaker: "agent" | "customer"; text: string }>>([
    {
      speaker: "agent",
      text: "আসসালামু আলাইকুম সৈয়দ ফারহান আহমেদ! Shothik Merchant থেকে বলছি। কলটি সেবার মান ও আপনার অর্ডার নিশ্চিতকরণের জন্য রেকর্ড করা হচ্ছে। আপনি কি ২x খাঁটি সুন্দরবনের মধু এর জন্য মোট ৳৩৬৭০ ক্যাশ অন ডেলিভারি অর্ডারটি নিশ্চিত করতে চান?",
    },
    {
      speaker: "customer",
      text: "হ্যাঁ ভাই, সিলেট জিন্দাবাজারে পাঠাই দেন। কনফার্ম করলাম।",
    },
    {
      speaker: "agent",
      text: "অসংখ্য ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। পার্সেল ট্র্যাকিং কোড: BD_STEADFAST_940212। আগামী ৪৮ ঘণ্টার মধ্যে Steadfast Courier পার্সেলটি পৌঁছে দেবে।",
    },
  ]);

  const handleSimulateTurn = () => {
    if (!inputTurn.trim()) return;
    setCallTranscript((prev) => [
      ...prev,
      { speaker: "customer", text: inputTurn },
      {
        speaker: "agent",
        text: inputTurn.includes("cancel") || inputTurn.includes("দরকার নাই")
          ? "জি আচ্ছা, আপনার অনুরোধ অনুযায়ী অর্ডারটি বাতিল করা হয়েছে।"
          : "অসংখ্য ধন্যবাদ! অর্ডারটি নিশ্চিত করা হয়েছে এবং Steadfast Courier-এ বুক করা হয়েছে।",
      },
    ]);
    setInputTurn("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-white">
                  Autonomous AI Outbound Calling & COD Verification
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  Slice 29
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-300 bg-amber-500/10">
                  BTRC Certified
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
                  ⌘O
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Pre-dispatch IVR telephony bot · 4-stage dialog state machine · Steadfast Courier auto-booking
              </DialogDescription>
            </div>
          </div>

          {/* Dialect Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setDialect("standard")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                dialect === "standard" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setDialect("dhakaiya")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                dialect === "dhakaiya" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              ঢাকা (Dhakaiya)
            </button>
            <button
              onClick={() => setDialect("sylheti")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                dialect === "sylheti" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              সিলেট (Sylheti)
            </button>
            <button
              onClick={() => setDialect("chatgaya")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                dialect === "chatgaya" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              চাটগাঁ (Chatgaya)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-900/30 text-xs">
          <button
            onClick={() => setActiveTab("live_dialer")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "live_dialer"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Outbound Call Studio</span>
          </button>
          <button
            onClick={() => setActiveTab("call_queue")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "call_queue"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <PhoneForwarded className="w-4 h-4" />
            <span>COD Call Verification Queue</span>
            <Badge className="ml-1 bg-emerald-500/20 text-emerald-300 text-[10px]">3</Badge>
          </button>
          <button
            onClick={() => setActiveTab("btrc_rules")}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "btrc_rules"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>BTRC & Fraud Defense Rules</span>
          </button>
        </div>

        {/* Tab 1: Live Dialer */}
        {activeTab === "live_dialer" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Call Audio & Transcript */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active Call Banner */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{activeOrder.customerName}</span>
                      <span className="text-xs text-slate-400 font-mono">{activeOrder.customerPhone}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Order: {activeOrder.orderId}</span>
                      <span>•</span>
                      <span>Total: ৳{activeOrder.grandTotalBdt.toLocaleString()} COD</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                    In Call (00:{callDuration < 10 ? `0${callDuration}` : callDuration})
                  </Badge>
                  <Button size="sm" variant="destructive" className="h-8 text-xs cursor-pointer">
                    <PhoneOff className="w-3.5 h-3.5 mr-1" />
                    Hang Up
                  </Button>
                </div>
              </div>

              {/* Live Waveform Visualizer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-1 h-12 px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-emerald-500/80 transition-all duration-150"
                    style={{
                      height: `${Math.max(4, Math.sin((i + callDuration) * 0.5) * 24 + 12)}px`,
                      opacity: 0.4 + (i % 3) * 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Transcript Scroll Container */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 h-64 overflow-y-auto space-y-3">
                <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold mb-2">
                  Live Conversational Telephony Transcript
                </div>
                {callTranscript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${
                      msg.speaker === "agent" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {msg.speaker === "agent" && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-xs font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-[80%] text-xs leading-relaxed ${
                        msg.speaker === "agent"
                          ? "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.speaker === "customer" && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Customer Voice Simulator Input */}
              <div className="flex items-center gap-2">
                <Input
                  value={inputTurn}
                  onChange={(e) => setInputTurn(e.target.value)}
                  placeholder="Simulate customer voice turn in Bangla/Banglish..."
                  className="bg-slate-900 border-slate-800 text-xs h-10 text-slate-100"
                  onKeyDown={(e) => e.key === "Enter" && handleSimulateTurn()}
                />
                <Button onClick={handleSimulateTurn} className="bg-emerald-600 hover:bg-emerald-500 text-xs h-10 px-4 cursor-pointer">
                  Speak Turn
                </Button>
              </div>
            </div>

            {/* Right Col: Order Card & Auto-Booking Action */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">COD Order Details</span>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Verified</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Customer:</span>
                  <p className="font-semibold text-white">{activeOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <p className="font-mono text-slate-200">{activeOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Delivery Address:</span>
                  <p className="text-slate-200 flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{activeOrder.deliveryAddress}</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Items:</span>
                  <p className="text-slate-200">{activeOrder.itemsSummary}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                  <span className="text-slate-300">Total COD Amount:</span>
                  <span className="text-emerald-400 font-mono text-sm">৳{activeOrder.grandTotalBdt.toLocaleString()}</span>
                </div>
              </div>

              {/* Steadfast Courier Integration Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Steadfast Automated Dispatch</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Consignment Code: <span className="font-mono text-white font-bold">BD_STEADFAST_940212</span>
                </p>
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs cursor-pointer">
                  Download Shipping Label
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Call Queue */}
        {activeTab === "call_queue" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Pending COD Orders Verification Queue</h3>
                <p className="text-xs text-slate-400">Auto-dialer processes orders within 5 minutes of placement</p>
              </div>
              <Button size="sm" className="bg-emerald-600 text-xs cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh Queue
              </Button>
            </div>

            <div className="space-y-2.5">
              {DEMO_CALL_QUEUE.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.customerPhone}</span>
                      {item.isSupervised && (
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                          Supervised Gate (&gt; ৳10k)
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{item.itemsSummary}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{item.deliveryAddress}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        ৳{item.grandTotalBdt.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase">{item.status}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveOrder(item);
                        setActiveTab("live_dialer");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-xs cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3 mr-1" />
                      Dial Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BTRC Rules */}
        {activeTab === "btrc_rules" && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-amber-300">BTRC Statutory Calling Compliance Standard</h4>
                <p className="text-slate-300 leading-relaxed">
                  Under BTRC telemarketing guidelines, automated outbound calls are strictly restricted to 09:00 AM – 08:00 PM BST.
                  Orders received after 08:00 PM are automatically scheduled for 09:15 AM the following morning.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Permitted Operating Window</span>
                </span>
                <p className="text-slate-400">Daily: 09:00 - 20:00 BST (UTC+6)</p>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Active Window</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Statutory Recording Notice</span>
                </span>
                <p className="text-slate-400">Mandatory disclosure played in opening turn for audit trails.</p>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Enforced</Badge>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
