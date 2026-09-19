"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  QrCode,
  Truck,
  CheckCircle2,
  PhoneCall,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Languages,
  CheckCheck,
  Bot,
  User,
  Clock,
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

export interface WhatsAppCommerceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDialect?: "standard" | "dhakaiya" | "sylheti" | "chatgaya";
}

interface ChatMessage {
  id: string;
  sender: "customer" | "bot";
  text: string;
  timestamp: string;
  invoice?: {
    invoiceId: string;
    amountBdt: number;
    reference: string;
    qrSvgDataUri: string;
    deepLink: string;
  };
  consignment?: {
    consignmentId: string;
    trackingCode: string;
    status: string;
    trackingUrl: string;
    codAmountBdt: number;
  };
}

export const DEMO_CATALOG = [
  { id: "prod_jamdani_01", name: "Dhakai Jamdani Saree", nameBn: "ঢাকাই জামদানি শাড়ি", price: 3800, category: "Apparel" },
  { id: "prod_panjabi_02", name: "Royal Platinum Panjabi", nameBn: "রয়্যাল কটন পাঞ্জাবি", price: 2200, category: "Apparel" },
  { id: "prod_honey_03", name: "Sundarban Raw Honey", nameBn: "সুন্দরবনের খাঁটি মধু", price: 1450, category: "Food" },
  { id: "prod_nilkhet_book_04", name: "Nilkhet Thesis Monograph", nameBn: "নীলক্ষেত প্রেস মনোগ্রাফ", price: 650, category: "Publishing" },
  { id: "prod_leather_wallet_05", name: "Full-Grain Leather Wallet", nameBn: "চামড়ার ওয়ালেট", price: 1250, category: "Accessories" },
];

export function WhatsAppCommerceModal({
  open,
  onOpenChange,
  defaultDialect = "dhakaiya",
}: WhatsAppCommerceModalProps) {
  const [dialect, setDialect] = useState<"standard" | "dhakaiya" | "sylheti" | "chatgaya">(defaultDialect);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"simulator" | "catalog" | "orders">("simulator");
  const [loading, setLoading] = useState(false);

  // Initial Message Thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init_01",
      sender: "bot",
      text: "সালাম মামা! Shothik Merchant-এ স্বাগতম। কী লাগবে কন, এক্কেরে খাঁটি জিনিস দিমু!",
      timestamp: "10:14 AM",
    },
  ]);

  // Cart State
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([
    { id: "prod_jamdani_01", name: "Dhakai Jamdani Saree", price: 3800, qty: 1 },
  ]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 60; // Dhaka inside default
  const total = subtotal + deliveryFee;
  const isProtectedAction = total > 10000;

  // Send message turn
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_cust_${Date.now()}`,
      sender: "customer",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/whatsapp/commerce/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "sess_wa_ui_live",
          customerPhone: "01711223344",
          message: text,
          dialect,
          cart: cart.map((c) => ({
            productId: c.id,
            name: c.name,
            quantity: c.qty,
            unitPriceBdt: c.price,
            totalBdt: c.price * c.qty,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: "bot",
          text: data.replyText || "ধন্যবাদ! আপনার বার্তা পেয়েছি।",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          invoice: data.invoice,
          consignment: data.order?.consignment,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Fallback simulated response
        const fallbackReply = dialect === "dhakaiya"
          ? "আরে মামা, বিকাশ কিউআর স্ক্যান কইরা TrxID মারেন, মাল আইজকেই ছুটবে!"
          : "ভাইজান, বিকাশ কিউআর কোড দিয়া পেমেন্ট করি TrxID টা জানান!";
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_bot_${Date.now()}`,
            sender: "bot",
            text: fallbackReply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_bot_${Date.now()}`,
          sender: "bot",
          text: "মামা, বিকাশ QR রেডি! TrxID দিলে স্টেডফাস্ট দিয়া সাথে সাথে বুকিং দিয়া দিমু!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    handleSendMessage("বিকাশ TrxID 9K28A77123 পাঠিয়েছি, চেক করেন");
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleAddToCart = (prod: typeof DEMO_CATALOG[0]) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === prod.id);
      if (existing) {
        return prev.map((p) => (p.id === prod.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, qty: 1 }];
    });
    handleSendMessage(`${prod.nameBn} কিনতে চাই, কত পড়বে?`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88vh] p-0 overflow-hidden bg-slate-950/95 border-emerald-500/30 text-slate-100 flex flex-col shadow-2xl backdrop-blur-xl">
        {/* Top Header Bar */}
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  WhatsApp Business Multi-Dialect Commerce Bot
                </DialogTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] py-0">
                  Phase 26
                </Badge>
                <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] py-0">
                  ⌘W
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-400">
                Autonomous vernacular sales, dynamic bKash QR payment invoices & instant Steadfast courier dispatch.
              </DialogDescription>
            </div>
          </div>

          {/* Dialect Selector Bar */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
            {(["dhakaiya", "sylheti", "chatgaya", "standard"] as const).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={dialect === d ? "default" : "ghost"}
                className={`h-7 px-2.5 text-xs capitalize ${
                  dialect === d
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setDialect(d)}
              >
                {d === "dhakaiya" ? "ঢাকা (Dhakaiya)" : d === "sylheti" ? "সিলেট (Sylheti)" : d === "chatgaya" ? "চাটগাঁ (Chatgaya)" : "Standard"}
              </Button>
            ))}
          </div>
        </DialogHeader>

        {/* Studio Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* LEFT 7 COLS: Realistic WhatsApp Phone Mockup */}
          <div className="md:col-span-7 flex flex-col border-r border-slate-800/80 bg-slate-950 p-3 overflow-hidden">
            {/* WhatsApp App Mock Header */}
            <div className="bg-[#1F2C34] text-white p-3 rounded-t-xl flex items-center justify-between border-b border-slate-700/50 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm">
                    SM
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#1F2C34]" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    Shothik Merchant
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    Online • Dialect: {dialect.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <PhoneCall className="w-3.5 h-3.5" />
                +880 1711-223344
              </div>
            </div>

            {/* WhatsApp Message Stream */}
            <div className="flex-1 bg-[#0B141A] p-3 overflow-y-auto space-y-3.5 font-sans text-sm">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 shadow-md relative ${
                        isBot
                          ? "bg-[#202C33] text-slate-100 border border-slate-700/40"
                          : "bg-[#005C4B] text-emerald-50"
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>

                      {/* In-Bubble bKash Dynamic QR Invoice */}
                      {m.invoice && (
                        <div className="mt-3 p-3 bg-slate-900/90 rounded-md border border-pink-500/40 flex items-center gap-3">
                          <img
                            src={m.invoice.qrSvgDataUri}
                            alt="bKash QR"
                            className="w-16 h-16 rounded border border-pink-500/50 bg-white p-0.5"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-pink-400 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              bKash Dynamic QR Invoice
                            </div>
                            <div className="text-slate-300 font-mono mt-0.5">
                              Amount: <span className="text-emerald-400 font-bold">৳{m.invoice.amountBdt}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Ref: {m.invoice.reference}
                            </div>
                            <div className="mt-1.5 flex gap-1.5">
                              <Button
                                size="sm"
                                className="h-6 px-2 text-[10px] bg-pink-600 hover:bg-pink-500 text-white font-semibold"
                                onClick={handleSimulatePayment}
                              >
                                ⚡ Simulate 1-Tap Payment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* In-Bubble Steadfast Consignment Card */}
                      {m.consignment && (
                        <div className="mt-3 p-2.5 bg-slate-900/90 rounded-md border border-emerald-500/40 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-emerald-400 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5" />
                              Steadfast Consignment Booked
                            </div>
                            <div className="font-mono text-slate-300 mt-0.5">
                              Tracking: <span className="text-amber-300 font-bold">{m.consignment.trackingCode}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Status: <span className="text-emerald-400 font-semibold">{m.consignment.status}</span>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                            Auto-Dispatched
                          </Badge>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>{m.timestamp}</span>
                        {!isBot && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                  <span>WhatsApp Bot typing in {dialect.toUpperCase()}...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Pills Bar */}
            <div className="bg-[#111B21] p-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">⚡ Quick:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
                onClick={() => handleQuickPrompt("দাম কত ভাই?")}
              >
                দাম কত?
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
                onClick={() => handleQuickPrompt("চিটাগাং ডেলিভারি চার্জ কত?")}
              >
                ডেলিভারি চার্জ?
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
                onClick={() => handleQuickPrompt("বিকাশ করব কিভাবে?")}
              >
                বিকাশ করব?
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
                onClick={() => handleQuickPrompt("TrxID 9K28A77123")}
              >
                TrxID 9K28A77123
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[11px] bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 whitespace-nowrap"
                onClick={() => handleQuickPrompt("পার্সেল কোথায় আছে?")}
              >
                পার্সেল ট্র্যাকিং?
              </Button>
            </div>

            {/* Input Composer Bar */}
            <div className="bg-[#202C33] p-2.5 rounded-b-xl flex items-center gap-2 border-t border-slate-700/50">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Type message in ${dialect} (e.g. জামদানি শাড়ি কত, TrxID 9K28A...)`}
                className="flex-1 bg-[#2A3942] border-none text-white text-xs h-9 focus-visible:ring-emerald-500 placeholder:text-slate-400"
              />
              <Button
                size="sm"
                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputText.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* RIGHT 5 COLS: Merchant Orders, Cart & Product Quick-Add */}
          <div className="md:col-span-5 flex flex-col bg-slate-900/40 p-4 space-y-4 overflow-y-auto">
            {/* Live Cart & Order Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  Active WhatsApp Cart
                </span>
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                  {cart.length} item(s)
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300 truncate max-w-[180px]">{item.name}</span>
                    <span className="font-mono text-emerald-400">৳{item.price} × {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs space-y-1 font-mono border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Steadfast Delivery (Dhaka):</span>
                  <span>৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-100 text-sm pt-1 border-t border-slate-800/80">
                  <span>Total Due:</span>
                  <span className="text-emerald-400">৳{total}</span>
                </div>
              </div>

              {/* Supervised Autonomy Banner */}
              {isProtectedAction && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-[11px] text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Supervised Autonomy Triggered:</span> Order exceeds ৳10,000 threshold. Requires explicit human confirmation before parcel pickup.
                  </div>
                </div>
              )}
            </div>

            {/* Merchant Catalog Quick-Adder */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 shadow-sm">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Direct Product Quick-Add</span>
                <span className="text-[10px] text-slate-400 font-mono">Stock Ready</span>
              </div>
              <div className="space-y-2">
                {DEMO_CATALOG.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{prod.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono">৳{prod.price}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[10px] border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
                      onClick={() => handleAddToCart(prod)}
                    >
                      + Pitch in Chat
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Delivery SLA Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Steadfast Logistics Automated Rules
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li><strong className="text-slate-300">Inside Dhaka:</strong> ৳60 (Same day/24h)</li>
                <li><strong className="text-slate-300">Suburbs (Gazipur/Savar):</strong> ৳100 (48h)</li>
                <li><strong className="text-slate-300">Outside Dhaka:</strong> ৳130 (48-72h)</li>
                <li><strong className="text-slate-300">1-Tap COD Settlement:</strong> SMS Tracking link auto-delivered</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
