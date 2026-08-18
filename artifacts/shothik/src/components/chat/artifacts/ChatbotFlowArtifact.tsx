"use client";

import { useState } from "react";
import {
  GitFork,
  MessageSquare,
  Play,
  Download,
  Plus,
  Send,
  Zap,
  CheckCircle2,
  ShieldAlert,
  CreditCard,
  Truck,
  Sparkles,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface FlowNode {
  id: string;
  type: "trigger" | "ai_router" | "mfs_payment" | "courier_dispatch" | "whatsapp_message";
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  status: "idle" | "running" | "completed";
}

const INITIAL_FLOW_NODES: FlowNode[] = [
  {
    id: "node-1",
    type: "trigger",
    title: "1. Inbound WhatsApp Trigger",
    subtitle: "Keyword Match: '#order' OR 'দাম কত' OR 'অর্ডার করবো'",
    badge: "WhatsApp Cloud API",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    status: "idle",
  },
  {
    id: "node-2",
    type: "ai_router",
    title: "2. DeepSeek AI Intent & Address Parser",
    subtitle: "Extracts recipient name, delivery address, and SKU from conversational text",
    badge: "NLP Intent Engine",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    status: "idle",
  },
  {
    id: "node-3",
    type: "mfs_payment",
    title: "3. bKash ৳200 Advance Delivery Fee",
    subtitle: "Auto-generates dynamic tokenized payment link to prevent COD fraud",
    badge: "bKash PGW (1.85%)",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    status: "idle",
  },
  {
    id: "node-4",
    type: "courier_dispatch",
    title: "4. Steadfast Carrier Auto-Booking",
    subtitle: "Dispatches parcel via webhook to nearest hub (Dhaka North / Chittagong GEC)",
    badge: "Steadfast API (0.4% Loss)",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    status: "idle",
  },
  {
    id: "node-5",
    type: "whatsapp_message",
    title: "5. Automated Tracking Dispatch",
    subtitle: "Sends customer live tracking code and PDF invoice on WhatsApp",
    badge: "Outbound Webhook",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    status: "idle",
  },
];

export function ChatbotFlowArtifact() {
  const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_FLOW_NODES);
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "messenger" | "instagram">("whatsapp");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(-1);
  const [chatLog, setChatLog] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: "Customer",
      text: "ভাইয়া আমি ব্ল্যাক পাঞ্জাবি ২টা অর্ডার করবো। ধানমন্ডি ১২০৫ ডেলিভারি কত লাগবে?",
      time: "10:14 AM",
    },
  ]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(0);

    // Step 1: Trigger
    setTimeout(() => {
      setSimStep(1);
    }, 600);

    // Step 2: AI Parser
    setTimeout(() => {
      setSimStep(2);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ChatbotX Bot",
          text: "ধন্যবাদ! আপনার ২টা ব্ল্যাক পাঞ্জাবির অর্ডার গ্রহণ করা হয়েছে। ডেলিভারি চার্জ ৳৭০ সহ মোট ৳৩,০৭০। ডেলিভারি কনফার্ম করতে অনুগ্রহ করে নিচের লিংকে ক্লিক করুন:",
          time: "10:14 AM",
        },
      ]);
    }, 1400);

    // Step 3: bKash
    setTimeout(() => {
      setSimStep(3);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ChatbotX Bot",
          text: "💳 bKash পেমেন্ট লিংক: https://pay.shothik.com/inv/bk_99381 (৳২০০ অগ্রিম পরিশোধ করুন)",
          time: "10:15 AM",
        },
      ]);
    }, 2200);

    // Step 4: Steadfast Booking
    setTimeout(() => {
      setSimStep(4);
    }, 3000);

    // Step 5: Finished
    setTimeout(() => {
      setSimStep(5);
      setIsSimulating(false);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "ChatbotX Bot",
          text: "✅ পার্সেল বুকিং সফল! স্টিডফাস্ট ট্র্যাকিং কোড: BD_ST_771920 (আগামীকাল ডেলিভারি পাবেন)।",
          time: "10:15 AM",
        },
      ]);
    }, 3800);
  };

  const handleExportJSON = () => {
    const flowData = {
      name: "F-Commerce Automated bKash & Steadfast Flow",
      version: "2.1.0",
      channel: selectedChannel,
      nodes,
      created: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flowData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chatbotx_flow_${selectedChannel}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header Toolbar ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>ChatbotX Visual Flow Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Omnichannel Marketing & MFS
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Visual drag-and-drop conversational graph for WhatsApp, Messenger, and bKash checkouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setSelectedChannel("whatsapp")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                selectedChannel === "whatsapp" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel("messenger")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                selectedChannel === "messenger" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Messenger
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel("instagram")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                selectedChannel === "instagram" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Instagram
            </button>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? "Simulating..." : "Test Flow"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Visual Node Flow Canvas */}
        <div className="md:col-span-7 flex flex-col h-full bg-card/40 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-foreground pb-2 border-b border-border">
            <span>Visual Graph Topology ({nodes.length} Steps)</span>
            <span className="text-[10px] font-mono text-muted-foreground">Auto-Execution Webhook Mode</span>
          </div>

          {nodes.map((node, index) => {
            const isActive = simStep === index;
            const isDone = simStep > index;

            return (
              <div key={node.id} className="relative">
                {/* Connector Line */}
                {index > 0 && (
                  <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border/80" />
                )}

                <div
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-300 space-y-2",
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.01]"
                      : isDone
                      ? "bg-card border-border/80 opacity-90"
                      : "bg-card/70 border-border/60 hover:border-border"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold border transition",
                          isDone
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : isActive
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 animate-pulse"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{node.title}</h4>
                      </div>
                    </div>

                    <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", node.badgeColor)}>
                      {node.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground pl-9 leading-relaxed">
                    {node.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Chat Emulator */}
        <div className="md:col-span-5 flex flex-col h-full bg-background overflow-hidden">
          <div className="h-11 px-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedChannel.toUpperCase()} Live Simulation</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">● Sandbox Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "p-3.5 rounded-2xl text-xs space-y-1 leading-relaxed max-w-[85%]",
                  msg.sender === "Customer"
                    ? "bg-muted/40 text-foreground ml-auto border border-border/60"
                    : "bg-emerald-500/10 text-foreground mr-auto border border-emerald-500/30"
                )}
              >
                <div className="flex items-center justify-between text-[9px] text-muted-foreground pb-0.5">
                  <span className="font-bold">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border bg-muted/10 shrink-0">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Send Customer Test Trigger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotFlowArtifact;
