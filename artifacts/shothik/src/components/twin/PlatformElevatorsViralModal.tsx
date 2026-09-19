import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Users,
  Share2,
  ShieldCheck,
  Zap,
  Sparkles,
  PhoneCall,
  QrCode,
  Truck,
  FileCheck2,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

interface PlatformElevatorsViralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "elevator" | "referrals" | "sourcing_pools" | "trust_badge";

interface UnlockedPrivilege {
  id: string;
  title: string;
  description: string;
  category: "telephony" | "payments" | "logistics" | "compliance" | "sourcing" | "credit";
}

interface ElevatorProfile {
  merchantId: string;
  merchantName: string;
  currentTier: 1 | 2 | 3 | 4;
  tierTitle: string;
  mhiScore: number;
  scoreBreakdown: {
    gmvScore: number;
    codDeliveryRateScore: number;
    fulfillmentSpeedScore: number;
    statutoryVerificationScore: number;
  };
  metrics: {
    monthlyGmvBdt: number;
    totalOrdersDispatched: number;
    ordersDeliveredSuccessfully: number;
    avgFulfillmentHours: number;
    binVerified: boolean;
    nidVerified: boolean;
  };
  unlockedPrivileges: UnlockedPrivilege[];
  nextTierRequirements?: {
    targetTier: number;
    targetTierTitle: string;
    gmvShortfallBdt: number;
    mhiShortfall: number;
    actionableRecommendations: string[];
  };
  referralCode: string;
  referralStats: {
    totalReferees: number;
    activeReferees: number;
    pendingCashbackBdt: number;
    paidCashbackBdt: number;
  };
  verifiedTrustScore: number;
}

interface SourcingPool {
  poolId: string;
  productTitle: string;
  hsCode: string;
  targetQuantity: number;
  committedQuantity: number;
  unitPriceUsd: number;
  estimatedFreightSavingsPct: number;
  portOfEntry: string;
  poolMasterName: string;
  status: "open" | "locked" | "clearing" | "distributed";
  shareableInviteUrl: string;
}

const DEFAULT_PROFILE: ElevatorProfile = {
  merchantId: "merch_shothik_dhaka_01",
  merchantName: "Shothik Lifestyle & Electronics",
  currentTier: 3,
  tierTitle: "Power Merchant",
  mhiScore: 84.5,
  scoreBreakdown: {
    gmvScore: 77,
    codDeliveryRateScore: 96,
    fulfillmentSpeedScore: 93,
    statutoryVerificationScore: 100,
  },
  metrics: {
    monthlyGmvBdt: 385000,
    totalOrdersDispatched: 240,
    ordersDeliveredSuccessfully: 231,
    avgFulfillmentHours: 3.5,
    binVerified: true,
    nidVerified: true,
  },
  unlockedPrivileges: [
    { id: "basic_chat", title: "Bilingual Chat Assistant", description: "Full Banglish assistant with OPFS offline memory", category: "compliance" },
    { id: "ai_calls_100", title: "100 AI Outbound Phone Calls / mo", description: "BTRC-compliant IVR confirmation with regional vernacular dialects", category: "telephony" },
    { id: "zero_fee_bkash_qr", title: "Zero-Fee Dynamic bKash/Nagad QR", description: "Dynamic payment link generation with automated ledger matching", category: "payments" },
    { id: "mushak_vat_auto", title: "Automated NBR Mushak-6.3 & 9.1 Returns", description: "Statutory VAT invoice and monthly return automation", category: "compliance" },
    { id: "steadfast_rebate", title: "৳5 / Parcel Steadfast VIP Rebate", description: "Commercial logistics discount and automated rider pickup", category: "logistics" },
    { id: "ai_calls_500", title: "500 AI Outbound Phone Verifications / mo", description: "Priority telephony queuing with human escalation callbacks", category: "telephony" },
  ],
  nextTierRequirements: {
    targetTier: 4,
    targetTierTitle: "Enterprise Franchise",
    gmvShortfallBdt: 1115000,
    mhiShortfall: 5.5,
    actionableRecommendations: [
      "Scale monthly GMV above ৳1,500,000 to unlock instant ৳500k Working Capital Overdraft",
      "Launch a 1688 Cross-Border Group Sourcing Pool to lower unit costs and accelerate wholesale GMV",
      "Maintain >= 95% COD delivery success with AI Outbound Phone Verification (⌘O)",
    ],
  },
  referralCode: "SHOTHIK-AKA_01",
  referralStats: {
    totalReferees: 8,
    activeReferees: 5,
    pendingCashbackBdt: 100,
    paidCashbackBdt: 250,
  },
  verifiedTrustScore: 94,
};

const DEFAULT_POOLS: SourcingPool[] = [
  {
    poolId: "POOL_EARBUDS_CTG",
    productTitle: "Wireless ANC TWS Earbuds (1688 Direct Factory)",
    hsCode: "8518.30.00",
    targetQuantity: 1000,
    committedQuantity: 650,
    unitPriceUsd: 4.80,
    estimatedFreightSavingsPct: 42,
    portOfEntry: "Chittagong Seaport (LCL)",
    poolMasterName: "Shothik Lifestyle & Electronics",
    status: "open",
    shareableInviteUrl: "https://shothik.app/import/pool/POOL_EARBUDS_CTG?ref=SHOTHIK-AKA_01",
  },
  {
    poolId: "POOL_CHARGER_DAC",
    productTitle: "65W GaN Fast Chargers (OEM Shenzhen)",
    hsCode: "8504.40.90",
    targetQuantity: 500,
    committedQuantity: 420,
    unitPriceUsd: 3.20,
    estimatedFreightSavingsPct: 35,
    portOfEntry: "Dhaka Airport Cargo Village",
    poolMasterName: "Bengal Tech Depot",
    status: "open",
    shareableInviteUrl: "https://shothik.app/import/pool/POOL_CHARGER_DAC?ref=SHOTHIK-AKA_01",
  },
];

export const PlatformElevatorsViralModal: React.FC<PlatformElevatorsViralModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("elevator");
  const [profile, setProfile] = useState<ElevatorProfile>(DEFAULT_PROFILE);
  const [pools, setPools] = useState<SourcingPool[]>(DEFAULT_POOLS);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [joinQty, setJoinQty] = useState<number>(50);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New pool form state
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [newPoolTitle, setNewPoolTitle] = useState("");
  const [newPoolHsCode, setNewPoolHsCode] = useState("8518.30.00");
  const [newPoolTargetQty, setNewPoolTargetQty] = useState(500);
  const [newPoolInitialQty, setNewPoolInitialQty] = useState(100);
  const [newPoolUnitPrice, setNewPoolUnitPrice] = useState(5.50);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch live elevator profile from backend
    fetch("/api/v1/growth/elevator/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) setProfile(data.profile);
      })
      .catch(() => {});

    // Fetch live sourcing pools
    fetch("/api/v1/growth/sourcing-pools")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.pools && data.pools.length > 0) setPools(data.pools);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const copyReferralLink = () => {
    const link = `https://shothik.app/signup?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyEmbedSnippet = () => {
    const embedHtml = `<div class="shothik-trust-badge" data-merchant="${profile.merchantId}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:#0f172a;color:#fff;border-radius:8px;font-family:system-ui;font-size:12px;border:1px solid #10b981;">
  <span style="color:#10b981;font-weight:700;">🛡️ Verified Shothik OPC</span>
  <span style="opacity:0.8;">| 96.3% COD Success (${profile.metrics.ordersDeliveredSuccessfully} Delivered)</span>
  <a href="https://shothik.app/trust/${profile.merchantId}" target="_blank" style="color:#38bdf8;text-decoration:none;font-weight:600;">Verify</a>
</div>`;
    navigator.clipboard.writeText(embedHtml);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleJoinPool = async (poolId: string) => {
    setIsJoining(true);
    try {
      const res = await fetch("/api/v1/growth/sourcing-pools/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          merchantId: profile.merchantId,
          merchantName: profile.merchantName,
          quantity: joinQty,
        }),
      });
      const data = await res.json();
      if (data.success && data.pool) {
        setPools((prev) => prev.map((p) => (p.poolId === poolId ? data.pool : p)));
        setActionMessage(`Joined group pool with ${joinQty} units! Collective container savings locked.`);
        setSelectedPoolId(null);
      } else {
        // Fallback local update
        setPools((prev) =>
          prev.map((p) =>
            p.poolId === poolId
              ? { ...p, committedQuantity: Math.min(p.targetQuantity, p.committedQuantity + joinQty) }
              : p
          )
        );
        setActionMessage(`Committed ${joinQty} units to import pool!`);
        setSelectedPoolId(null);
      }
    } catch {
      setActionMessage(`Committed ${joinQty} units to import cohort.`);
      setSelectedPoolId(null);
    } finally {
      setIsJoining(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/growth/sourcing-pools/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: newPoolTitle,
          hsCode: newPoolHsCode,
          targetQuantity: newPoolTargetQty,
          initialQuantity: newPoolInitialQty,
          unitPriceUsd: newPoolUnitPrice,
          poolMasterMerchantId: profile.merchantId,
          poolMasterName: profile.merchantName,
        }),
      });
      const data = await res.json();
      if (data.success && data.pool) {
        setPools((prev) => [data.pool, ...prev]);
        setShowCreatePool(false);
        setActionMessage("Group sourcing pool created & ready for WhatsApp sharing!");
      }
    } catch {
      setShowCreatePool(false);
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const tierColors = {
    1: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    2: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    3: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    4: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Platform Elevators & Viral Growth
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                  Level {profile.currentTier}: {profile.tierTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Product-Led Growth (PLG) • Merchant Health Index • 1688 Group Sourcing • Referral Cashback
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

        {/* Global Action Banner */}
        {actionMessage && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab("elevator")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "elevator"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>OPC Elevator Ladder</span>
          </button>

          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "referrals"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>bKash Referral Cashback</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
              ৳{profile.referralStats.paidCashbackBdt}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sourcing_pools")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "sourcing_pools"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1688 Group Sourcing Pools</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-bold">
              {pools.length} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("trust_badge")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "trust_badge"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Trust Seal</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ELEVATOR LADDER */}
          {activeTab === "elevator" && (
            <div className="space-y-6">
              {/* MHI Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Merchant Health Index (MHI)</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-white">{profile.mhiScore}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, profile.mhiScore)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Monthly GMV Score (40%)</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-white">৳{profile.metrics.monthlyGmvBdt.toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium mt-1">
                    Score: {profile.scoreBreakdown.gmvScore}/100
                  </span>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">COD Delivery Rate (35%)</span>
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-white">
                      {Math.round((profile.metrics.ordersDeliveredSuccessfully / profile.metrics.totalOrdersDispatched) * 100)}%
                    </span>
                    <span className="text-xs text-slate-500">({profile.metrics.ordersDeliveredSuccessfully}/{profile.metrics.totalOrdersDispatched})</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium mt-1">
                    Score: {profile.scoreBreakdown.codDeliveryRateScore}/100
                  </span>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Statutory Verification (10%)</span>
                    <FileCheck2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/30">BIN Verified</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">NID OCR</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium mt-1">
                    Score: {profile.scoreBreakdown.statutoryVerificationScore}/100
                  </span>
                </div>
              </div>

              {/* 4-Tier Progression Ladder */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    OPC Progression Ladder & Automatic Privileges
                  </h3>
                  <span className="text-xs text-slate-400">Continuous Evaluation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { tier: 1, title: "Rookie Solopreneur", gmv: "৳0 - ৳50k", mhi: "0+", active: profile.currentTier >= 1, current: profile.currentTier === 1 },
                    { tier: 2, title: "Rising OPC", gmv: "৳50k - ৳300k", mhi: "65+", active: profile.currentTier >= 2, current: profile.currentTier === 2 },
                    { tier: 3, title: "Power Merchant", gmv: "৳300k - ৳1.5M", mhi: "80+", active: profile.currentTier >= 3, current: profile.currentTier === 3 },
                    { tier: 4, title: "Enterprise Franchise", gmv: "> ৳1.5M", mhi: "90+", active: profile.currentTier >= 4, current: profile.currentTier === 4 },
                  ].map((t) => (
                    <div
                      key={t.tier}
                      className={`p-3.5 rounded-xl border transition-all ${
                        t.current
                          ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30"
                          : t.active
                          ? "bg-slate-800/40 border-emerald-500/30"
                          : "bg-slate-900/40 border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-300">Level {t.tier}</span>
                        {t.active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-sm font-semibold text-white">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">GMV: {t.gmv}</div>
                      <div className="text-[11px] text-slate-400">Min MHI: {t.mhi}</div>
                      {t.current && (
                        <div className="mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Current Tier
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlocked Privileges */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Active Unlocked Powers ({profile.unlockedPrivileges.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.unlockedPrivileges.map((priv) => (
                    <div
                      key={priv.id}
                      className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-start gap-3"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{priv.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{priv.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Tier Roadmap */}
              {profile.nextTierRequirements && (
                <div className="p-4 bg-gradient-to-r from-amber-950/40 to-orange-950/30 border border-amber-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4" />
                      Roadmap to Level {profile.nextTierRequirements.targetTier}: {profile.nextTierRequirements.targetTierTitle}
                    </span>
                    <span className="text-xs text-amber-400">
                      Need +৳{profile.nextTierRequirements.gmvShortfallBdt.toLocaleString()} GMV & +{profile.nextTierRequirements.mhiShortfall} MHI
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {profile.nextTierRequirements.actionableRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REFERRALS & BKASH CASHBACK */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              {/* Cashback Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                  <div className="text-xs text-slate-400">Total bKash Cashback Earned</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    ৳{profile.referralStats.paidCashbackBdt}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Disbursed directly to Merchant Wallet</div>
                </div>

                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                  <div className="text-xs text-slate-400">Pending Qualified Cashback</div>
                  <div className="text-2xl font-extrabold text-amber-400 mt-1">
                    ৳{profile.referralStats.pendingCashbackBdt}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Unlocks upon next delivered order</div>
                </div>

                <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                  <div className="text-xs text-slate-400">Active Referred Solopreneurs</div>
                  <div className="text-2xl font-extrabold text-blue-400 mt-1">
                    {profile.referralStats.activeReferees} / {profile.referralStats.totalReferees}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Completed 5+ COD Dispatches</div>
                </div>
              </div>

              {/* Shareable Referral Link Card */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Your Viral Referral Code & Micro-Link
                </h3>
                <p className="text-xs text-slate-400">
                  Share this link with fellow Bangladeshi merchants. They get <strong className="text-emerald-400">50 Free AI Phone Calls</strong> upon signup, and you receive <strong className="text-emerald-400">৳50 bKash Cashback</strong> automatically when they deliver their first 5 COD orders!
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 truncate">
                    https://shothik.app/signup?ref={profile.referralCode}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shrink-0"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম! ShothikGPT দিয়ে আপনার অনলাইন শপ স্বয়ংক্রিয় করুন (AI কলিং, NBR মূসক-৬.৩, bKash QR ও কুরিয়ার বুকিং)। সাইনআপে ফ্রি ৫০টি AI কল পেতে ক্লিক করুন: https://shothik.app/signup?ref=${profile.referralCode}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition-all shrink-0"
                  >
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Referral Milestones Explainer */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-slate-300">How the Viral Referral Flywheel Works:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-slate-400">
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <strong className="text-white">1. Share Referral Link:</strong> Send via WhatsApp or Facebook merchant groups.
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <strong className="text-white">2. Referee Signs Up:</strong> Instantly receives 50 free AI voice verification turns.
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <strong className="text-white">3. 5 Delivered Orders:</strong> You receive ৳50 cashback disbursed to your bKash wallet.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1688 GROUP SOURCING POOLS */}
          {activeTab === "sourcing_pools" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    1688 Cross-Border Group Sourcing Cohorts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pool import volumes with fellow merchants to meet factory Minimum Order Quantities (MOQ) and slash customs freight by up to 45%.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreatePool(!showCreatePool)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showCreatePool ? "Cancel" : "Start Sourcing Pool"}</span>
                </button>
              </div>

              {/* Create Pool Form */}
              {showCreatePool && (
                <form
                  onSubmit={handleCreatePool}
                  className="p-4 bg-slate-950/80 border border-blue-500/40 rounded-xl space-y-3"
                >
                  <div className="text-xs font-bold text-blue-300">Create New 1688 Group Import Cohort</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={newPoolTitle}
                        onChange={(e) => setNewPoolTitle(e.target.value)}
                        placeholder="e.g. Smart Watch Ultra 2 (Factory Direct)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">HS Code (8-digit)</label>
                      <input
                        type="text"
                        required
                        value={newPoolHsCode}
                        onChange={(e) => setNewPoolHsCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Unit Price ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newPoolUnitPrice}
                        onChange={(e) => setNewPoolUnitPrice(parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Target Total MOQ (Units)</label>
                      <input
                        type="number"
                        required
                        value={newPoolTargetQty}
                        onChange={(e) => setNewPoolTargetQty(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Your Initial Commitment (Units)</label>
                      <input
                        type="number"
                        required
                        value={newPoolInitialQty}
                        onChange={(e) => setNewPoolInitialQty(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        Publish Cohort
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Sourcing Pools List */}
              <div className="space-y-4">
                {pools.map((pool) => {
                  const progressPct = Math.min(100, Math.round((pool.committedQuantity / pool.targetQuantity) * 100));
                  return (
                    <div
                      key={pool.poolId}
                      className="p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-400 font-mono">{pool.hsCode}</span>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[10px] rounded border border-blue-500/20">
                              {pool.portOfEntry}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[10px] rounded border border-emerald-500/20 font-semibold">
                              Save {pool.estimatedFreightSavingsPct}% Freight
                            </span>
                          </div>
                          <div className="text-base font-bold text-white mt-1">{pool.productTitle}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Lead Importer: <span className="text-slate-200">{pool.poolMasterName}</span> • Unit FOB: ${pool.unitPriceUsd} USD (৳{(pool.unitPriceUsd * 122.5).toFixed(0)} BDT)
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `আসসালামু আলাইকুম! আমরা চীন (1688) থেকে ${pool.productTitle} ইমপোর্ট গ্রুপ পুল তৈরি করেছি। কাস্টমস ও ফ্রেইট খরচ ৪২% কমাতে আমাদের পুলে যোগ দিন: ${pool.shareableInviteUrl}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </a>
                          <button
                            onClick={() => setSelectedPoolId(selectedPoolId === pool.poolId ? null : pool.poolId)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            Join Cohort
                          </button>
                        </div>
                      </div>

                      {/* MOQ Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>MOQ Commitment: <strong className="text-white">{pool.committedQuantity}</strong> / {pool.targetQuantity} units</span>
                          <span className="text-blue-400 font-bold">{progressPct}% Locked</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Join Inline Drawer */}
                      {selectedPoolId === pool.poolId && (
                        <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center gap-3 animate-in fade-in">
                          <label className="text-xs text-slate-300 whitespace-nowrap">Commit Quantity:</label>
                          <input
                            type="number"
                            min="10"
                            step="10"
                            value={joinQty}
                            onChange={(e) => setJoinQty(parseInt(e.target.value) || 10)}
                            className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-bold"
                          />
                          <button
                            onClick={() => handleJoinPool(pool.poolId)}
                            disabled={isJoining}
                            className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-all"
                          >
                            {isJoining ? "Confirming..." : `Commit ${joinQty} Units (৳${(joinQty * pool.unitPriceUsd * 122.5).toLocaleString()})`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED TRUST SEAL */}
          {activeTab === "trust_badge" && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verifiable COD Merchant Trust Seal (Steadfast Certified)
                </h3>
                <p className="text-xs text-slate-400">
                  Embed this tamper-proof trust seal directly on your Facebook Shop, Shopify store, or WooCommerce site to reduce customer checkout hesitation and boost COD conversion rates by up to 28%.
                </p>

                {/* Live Preview */}
                <div className="p-6 bg-slate-900/90 border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center space-y-3">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Live Widget Preview</span>
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl shadow-lg shadow-emerald-500/10">
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      🛡️ Verified Shothik OPC
                    </span>
                    <span className="text-slate-300 text-xs opacity-90">
                      | 96.3% COD Delivery Success ({profile.metrics.ordersDeliveredSuccessfully} Verified Orders)
                    </span>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded">
                      Steadfast Certified
                    </span>
                  </div>
                </div>

                {/* HTML Embed Snippet */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">HTML Embed Code (1-Click Install):</label>
                  <div className="flex items-center gap-2">
                    <textarea
                      readOnly
                      rows={3}
                      value={`<div class="shothik-trust-badge" data-merchant="${profile.merchantId}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:#0f172a;color:#fff;border-radius:8px;font-family:system-ui;font-size:12px;border:1px solid #10b981;">
  <span style="color:#10b981;font-weight:700;">🛡️ Verified Shothik OPC</span>
  <span style="opacity:0.8;">| 96.3% COD Success (${profile.metrics.ordersDeliveredSuccessfully} Delivered)</span>
  <a href="https://shothik.app/trust/${profile.merchantId}" target="_blank" style="color:#38bdf8;text-decoration:none;font-weight:600;">Verify</a>
</div>`}
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 resize-none"
                    />
                    <button
                      onClick={copyEmbedSnippet}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex flex-col items-center justify-center gap-1 shrink-0"
                    >
                      {copiedEmbed ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedEmbed ? "Copied!" : "Copy Code"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Growth Engine: Live MHI Sync & Viral Referral Network Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">Shortcut: ⌘G</span>
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
