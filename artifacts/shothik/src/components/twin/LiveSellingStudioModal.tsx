import React, { useState, useEffect } from "react";
import {
  Video,
  Radio,
  MessageSquare,
  Package,
  Clock,
  Wallet,
  CheckCircle2,
  TrendingUp,
  Flame,
  Send,
  Sparkles,
  Zap,
  Users,
  Film,
  ExternalLink,
  Copy,
  AlertCircle,
  X,
} from "lucide-react";

interface LiveSellingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "comments" | "locks" | "orders" | "shorts";

interface LiveSellingSession {
  sessionId: string;
  channel: "facebook_live" | "tiktok_live" | "instagram_live" | "youtube_live";
  sessionTitle: string;
  merchantId: string;
  status: "live" | "paused" | "ended";
  startedAt: string;
  totalCommentsIngested: number;
  ordersCapturedCount: number;
  totalGmvCapturedBdt: number;
  activeViewerCount: number;
  activeSkuLocks: Record<string, number>;
}

interface LiveCommentParsedOrder {
  commentId: string;
  sessionId: string;
  rawComment: string;
  authorName: string;
  extractedSku?: string;
  productName?: string;
  unitPriceBdt: number;
  extractedQuantity: number;
  extractedSize?: string;
  extractedColor?: string;
  extractedPhone?: string;
  extractedDistrict?: string;
  paymentMethod: "bkash" | "cod" | "nagad" | "unspecified";
  confidenceScore: number;
  status: "order_drafted" | "payment_link_sent" | "confirmed" | "low_confidence_review" | "expired";
  orderId: string;
  checkoutUrl: string;
  totalAmountBdt: number;
  expiresAt: string;
  ingestedAt: string;
}

const DEFAULT_SESSION: LiveSellingSession = {
  sessionId: "SESSION_LIVE_8829",
  channel: "facebook_live",
  sessionTitle: "Eid Premium Collection Live Flash Sale 🔥",
  merchantId: "merch_shothik_dhaka_01",
  status: "live",
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  totalCommentsIngested: 512,
  ordersCapturedCount: 44,
  totalGmvCapturedBdt: 142000,
  activeViewerCount: 1680,
  activeSkuLocks: {
    "SKU-PANJABI-BLK": 14,
    "SKU-EARBUDS-TWS": 22,
    "SKU-CHARGER-65W": 3,
  },
};

const DEFAULT_ORDERS: LiveCommentParsedOrder[] = [
  {
    commentId: "CMT_9918",
    sessionId: "SESSION_LIVE_8829",
    rawComment: "Black Panjabi XL lagbe 2 ta, 01711223344, Dhanmondi bKash korbo",
    authorName: "Tanvir Hossain",
    extractedSku: "SKU-PANJABI-BLK",
    productName: "Royal Platinum Silk Panjabi",
    unitPriceBdt: 3500,
    extractedQuantity: 2,
    extractedSize: "XL",
    extractedColor: "Black",
    extractedPhone: "01711223344",
    extractedDistrict: "Dhanmondi",
    paymentMethod: "bkash",
    confidenceScore: 0.95,
    status: "payment_link_sent",
    orderId: "LIVE_ORD_9918_A",
    checkoutUrl: "https://pay.shothikgpt.com/checkout/live?orderId=LIVE_ORD_9918_A&amt=7000",
    totalAmountBdt: 7000,
    expiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    ingestedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    commentId: "CMT_9919",
    sessionId: "SESSION_LIVE_8829",
    rawComment: "TWS Earbuds 1 pcs pathan COD Chittagong 01822334455",
    authorName: "Nusrat Jahan",
    extractedSku: "SKU-EARBUDS-TWS",
    productName: "Wireless ANC TWS Earbuds",
    unitPriceBdt: 2400,
    extractedQuantity: 1,
    extractedPhone: "01822334455",
    extractedDistrict: "Chittagong",
    paymentMethod: "cod",
    confidenceScore: 0.9,
    status: "confirmed",
    orderId: "LIVE_ORD_9919_B",
    checkoutUrl: "https://pay.shothikgpt.com/checkout/live?orderId=LIVE_ORD_9919_B&amt=2400",
    totalAmountBdt: 2400,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    ingestedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

export const LiveSellingStudioModal: React.FC<LiveSellingStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("comments");
  const [session, setSession] = useState<LiveSellingSession>(DEFAULT_SESSION);
  const [orders, setOrders] = useState<LiveCommentParsedOrder[]>(DEFAULT_ORDERS);

  const [inputComment, setInputComment] = useState("");
  const [inputAuthor, setInputAuthor] = useState("Demo Customer");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Shorts generator state
  const [selectedHighlightSku, setSelectedHighlightSku] = useState("SKU-PANJABI-BLK");
  const [ttsVoice, setTtsVoice] = useState("banglish_hype_male");
  const [isGeneratingShort, setIsGeneratingShort] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Poll active session on mount
  useEffect(() => {
    if (!isOpen) return;
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/v1/live-selling/sessions/active");
        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
        }
      } catch {}
    };
    fetchSession();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputComment.trim()) return;

    try {
      const res = await fetch("/api/v1/live-selling/comments/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          authorName: inputAuthor,
          rawComment: inputComment,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setSession((prev) => ({
          ...prev,
          totalCommentsIngested: prev.totalCommentsIngested + 1,
          ordersCapturedCount: prev.ordersCapturedCount + 1,
          totalGmvCapturedBdt: prev.totalGmvCapturedBdt + data.order.totalAmountBdt,
        }));
        setActionMessage(`Order drafted for ${data.order.authorName}! ৳${data.order.totalAmountBdt.toLocaleString()} (${data.order.paymentMethod.toUpperCase()})`);
        setInputComment("");
      }
    } catch {
      setActionMessage("Parsed offline comment simulation.");
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/v1/live-selling/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: "confirmed" } : o))
        );
        setActionMessage("Payment confirmed! Stock permanently finalized.");
      }
    } catch {}
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleGenerateShorts = () => {
    setIsGeneratingShort(true);
    setTimeout(() => {
      setIsGeneratingShort(false);
      setGeneratedVideoUrl("https://assets.shothikgpt.com/videos/live_highlight_eid_panjabi_9x16.mp4");
      setActionMessage("9:16 TikTok/Reels vertical promo generated with Banglish voiceover!");
      setTimeout(() => setActionMessage(null), 5000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl text-white shadow-lg shadow-rose-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Autonomous Social Commerce Live-Selling Studio
                </h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  LIVE NOW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                High-Velocity Comment Ingestion • 15-min TTL Stock Locks • 1-Tap bKash Links • 9:16 Video Clips
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

        {/* Live Stream Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-6 py-3 bg-slate-950/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            <span className="text-slate-400">Viewers:</span>
            <span className="font-bold text-white font-mono">{session.activeViewerCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Comments:</span>
            <span className="font-bold text-white font-mono">{session.totalCommentsIngested}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Orders Captured:</span>
            <span className="font-bold text-amber-400 font-mono">{session.ordersCapturedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Live GMV:</span>
            <span className="font-bold text-emerald-400 font-mono">৳{session.totalGmvCapturedBdt.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-rose-950/80 border-b border-rose-500/30 text-rose-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "comments"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment-to-Order Parser</span>
          </button>

          <button
            onClick={() => setActiveTab("locks")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "locks"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>15-Min Stock Locks</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "orders"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Draft Orders & bKash Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab("shorts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "shorts"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>9:16 Shorts Generator</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: COMMENT STREAM & PARSER */}
          {activeTab === "comments" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      Simulate Real-Time Live Stream Comment Ingestion
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingest raw customer comments in Bengali / Banglish to trigger autonomous order parsing.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Shortcut: ⌘L</span>
                </div>

                <form onSubmit={handleSimulateComment} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={inputAuthor}
                        onChange={(e) => setInputAuthor(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        placeholder="e.g. Mahfuz Ahmed"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] text-slate-400 block mb-1">Live Stream Comment (Banglish / Bengali)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputComment}
                          onChange={(e) => setInputComment(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                          placeholder="e.g. Black Panjabi L lagbe 1 ta 01799887766 Dhanmondi bKash"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Parse</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Feed of Ingested Live Orders */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Stream Comment Ingestion Feed ({orders.length})
                </h4>
                {orders.map((o) => (
                  <div
                    key={o.orderId}
                    className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{o.authorName}</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${
                            o.status === "confirmed"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}>
                            {o.status === "confirmed" ? "✅ Confirmed" : "⏳ Payment Link Sent"}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Confidence: {Math.round(o.confidenceScore * 100)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 italic bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-800/80">
                          "{o.rawComment}"
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        ৳{o.totalAmountBdt.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div><strong className="text-white">SKU:</strong> {o.extractedSku}</div>
                      <div><strong className="text-white">Phone:</strong> {o.extractedPhone || "N/A"}</div>
                      <div><strong className="text-white">District:</strong> {o.extractedDistrict || "N/A"}</div>
                      <div><strong className="text-white">Payment:</strong> {o.paymentMethod.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STOCK LOCKS */}
          {activeTab === "locks" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  15-Minute Live Stock Reservation & Lock Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Temporary stock holding prevents overselling during live broadcasts. Locks automatically expire if payment link is abandoned within 15 minutes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(session.activeSkuLocks).map(([sku, count]) => (
                    <div
                      key={sku}
                      className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{sku}</span>
                        <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold">
                          {count} Units Locked
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Active reservations awaiting customer bKash / COD handshake.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & BKASH DISPATCH */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Draft Orders & 1-Tap bKash Dispatch
                </h3>
                <p className="text-xs text-slate-400">
                  Review drafted live orders, copy dynamic bKash PGW payment URLs, or manually confirm COD reservations.
                </p>

                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.orderId}
                      className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose-400">{o.orderId}</span>
                          <span className="text-sm font-semibold text-white">{o.authorName}</span>
                          <span className="text-xs text-emerald-400 font-mono font-bold">
                            ৳{o.totalAmountBdt.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {o.extractedQuantity}x {o.productName} • {o.extractedPhone} • {o.extractedDistrict}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {o.status !== "confirmed" && (
                          <button
                            onClick={() => handleConfirmOrder(o.orderId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            Confirm Paid
                          </button>
                        )}
                        <a
                          href={o.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>bKash Link</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 9:16 SHORTS GENERATOR */}
          {activeTab === "shorts" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  Automated 9:16 TikTok & Facebook Reels Promo Generator
                </h3>
                <p className="text-xs text-slate-400">
                  Convert top-converting live stream moments into viral vertical shorts with Banglish TTS voiceovers and discount QR watermarks.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Featured Product</label>
                      <select
                        value={selectedHighlightSku}
                        onChange={(e) => setSelectedHighlightSku(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="SKU-PANJABI-BLK">Royal Platinum Silk Panjabi (44 Sales)</option>
                        <option value="SKU-EARBUDS-TWS">Wireless ANC TWS Earbuds (22 Sales)</option>
                        <option value="SKU-CHARGER-65W">65W GaN Fast Charger (12 Sales)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">AI Voiceover Profile</label>
                      <select
                        value={ttsVoice}
                        onChange={(e) => setTtsVoice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="banglish_hype_male">Banglish Hype Male (Dhaka Trendy)</option>
                        <option value="bangla_professional_female">Standard Bengali Studio Female</option>
                        <option value="chittagong_vernacular">Chatgaya Vernacular Voice</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGenerateShorts}
                      disabled={isGeneratingShort}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isGeneratingShort ? "Rendering 9:16 Video..." : "Render 9:16 Promo Short"}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                    {generatedVideoUrl ? (
                      <div className="space-y-2">
                        <div className="w-32 h-56 bg-slate-950 border border-rose-500/40 rounded-xl flex items-center justify-center text-rose-400 font-mono text-xs mx-auto shadow-xl">
                          ▶ 9:16 PREVIEW
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold block">Render Complete! (1080x1920)</span>
                        <a
                          href={generatedVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded-lg inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Download MP4
                        </a>
                      </div>
                    ) : (
                      <>
                        <Film className="w-8 h-8 text-slate-600" />
                        <span className="text-xs text-slate-400">Select product & render to generate 9:16 video.</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <span>Live Selling Protocol v2.8 • Autonomous Comment Ingestion</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
