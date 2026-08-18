"use client";

import { useState } from "react";
import {
  Send,
  Truck,
  CreditCard,
  CheckCheck,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Package,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: "customer" | "bot";
  text: string;
  time: string;
  actionCard?: {
    type: "tracking" | "payment" | "invoice";
    title: string;
    details: string;
    ctaLabel: string;
    ctaUrl?: string;
  };
}

export function WhatsAppOrderSimulator() {
  const [customerName, setCustomerName] = useState("রাফসান আহমেদ (Rafsan)");
  const [customerPhone, setCustomerPhone] = useState("+880 1711-234567");
  const [orderItem, setOrderItem] = useState("Shothik Premium Cotton Panjabi (Size L)");
  const [orderAmount, setOrderAmount] = useState(2450);
  const [trackingCode, setTrackingCode] = useState("BD_ST_755448");
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "customer",
      text: `ভাইয়া, আমি "${orderItem}" অর্ডার কনফার্ম করতে চাই। ক্যাশ অন ডেলিভারি (COD) হবে কি?`,
      time: "10:30 AM",
    },
    {
      id: "m-2",
      sender: "bot",
      text: `আসসালামু আলাইকুম ${customerName}! ধন্যবাদ আপনার অর্ডারের জন্য। আপনার অর্ডারটি সফলভাবে বুক করা হয়েছে।`,
      time: "10:31 AM",
      actionCard: {
        type: "tracking",
        title: "📦 Steadfast কুরিয়ার পার্সেল বুকিং",
        details: `ট্র্যাকিং কোড: ${trackingCode} · ডেলিভারি ফি: ৳১২০ BDT`,
        ctaLabel: "লাইভ পার্সেল ট্র্যাক করুন",
        ctaUrl: `https://steadfast.com.bd/t/${trackingCode}`,
      },
    },
    {
      id: "m-3",
      sender: "bot",
      text: "আপনি চাইলে bKash বা Nagad-এ সরাসরি পেমেন্ট করে ক্যাশব্যাক উপভোগ করতে পারেন:",
      time: "10:31 AM",
      actionCard: {
        type: "payment",
        title: "⚡ bKash Instant Payment Gateway",
        details: `মোট প্রদেয়: ৳${orderAmount} BDT · শূন্য কনভেনিয়েন্স ফি`,
        ctaLabel: "১-ক্লিকে bKash পে করুন",
        ctaUrl: "https://shop.shothik.ai/pay/bkash-token-9801",
      },
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "customer",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Automated Bot Reply
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "bot",
        text: "ধন্যবাদ! আমাদের Shothik Hermes কুরিয়ার গেটওয়ে আপনার আপডেট পেয়ে গেছে। রাইডার দ্রুত যোগাযোগ করবেন।",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleOpenWhatsAppWeb = () => {
    const rawText = `আসসালামু আলাইকুম ${customerName}! আপনার অর্ডার "${orderItem}" প্রস্তুত। ট্র্যাকিং: ${trackingCode}. পেমেন্ট লিংক: https://shop.shothik.ai/pay/bkash-token-9801`;
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawText)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Toolbar ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>WhatsApp F-Commerce Order Gateway</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Steadfast & bKash Live
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Automated Messenger & WhatsApp confirmation dialogues for Bangladeshi F-Commerce
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenWhatsAppWeb}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Launch WhatsApp Web</span>
        </button>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Left Config Panel */}
        <div className="border-r border-border p-4 space-y-4 overflow-y-auto bg-muted/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-brand" />
            <span>Customer & Order Details</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">গ্রাহকের নাম (Customer Name)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs font-semibold bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">মোবাইল নম্বর (Phone / WhatsApp)</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs font-mono bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">অর্ডারকৃত আইটেম (Product)</label>
              <input
                type="text"
                value={orderItem}
                onChange={(e) => setOrderItem(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">মূল্য (Amount BDT)</label>
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">কুরিয়ার ট্র্যাকিং</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full text-xs font-mono text-brand bg-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand mt-1"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Fraud COD Protection</span>
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Automated OTP verification and Steadfast return risk scoring blocks fraudulent COD orders before dispatch.
            </p>
          </div>
        </div>

        {/* Right WhatsApp Mockup Chat Frame */}
        <div className="md:col-span-2 flex flex-col h-full bg-[#0b141a] text-slate-100 overflow-hidden">
          {/* Mockup Header */}
          <div className="h-12 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#2f3b43] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                {customerName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">{customerName}</div>
                <div className="text-[10px] text-emerald-400 font-medium">Online · Shothik Automated Bot</div>
              </div>
            </div>
            <div className="text-xs text-slate-400">{customerPhone}</div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] sm:max-w-[70%]",
                  msg.sender === "customer" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed space-y-2 shadow-md",
                    msg.sender === "customer"
                      ? "bg-[#005c4b] text-slate-100 rounded-tr-xs"
                      : "bg-[#202c33] text-slate-100 rounded-tl-xs border border-[#2a3942]"
                  )}
                >
                  <p>{msg.text}</p>

                  {/* Interactive Action Card */}
                  {msg.actionCard && (
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5 mt-2">
                      <div className="font-bold text-xs text-emerald-300">{msg.actionCard.title}</div>
                      <div className="text-[11px] text-slate-300">{msg.actionCard.details}</div>
                      <button
                        type="button"
                        onClick={() => msg.actionCard?.ctaUrl && window.open(msg.actionCard.ctaUrl, "_blank")}
                        className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>{msg.actionCard.ctaLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5">
                    <span>{msg.time}</span>
                    <CheckCheck className="w-3 h-3 text-cyan-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Composer */}
          <div className="p-3 bg-[#202c33] border-t border-[#2f3b43] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a test customer reply..."
              className="flex-1 bg-[#2a3942] text-xs text-slate-100 px-3 py-2 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppOrderSimulator;
