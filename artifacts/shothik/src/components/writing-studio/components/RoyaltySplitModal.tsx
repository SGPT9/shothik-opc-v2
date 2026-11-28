import React, { useState, useEffect } from "react";
import {
  X,
  BadgeCheck,
  ShieldCheck,
  Cpu,
  Coins,
  Check,
  Copy,
  Sparkles,
  Zap,
  TrendingUp,
  Share2,
  Lock,
  Layers,
  Award,
  Wallet
} from "lucide-react";

export interface StakeholderShare {
  id: string;
  roleBn: string;
  name: string;
  percentage: number;
  payoutMethod: "bkash" | "nagad" | "beftn_bank" | "crypto_evm";
  walletOrAccount: string;
}

export interface DigitalFirstEdition {
  editionNumber: number;
  totalEditionSupply: number;
  editionSerial: string;
  collectorName: string;
  mintTimestamp: string;
  editionTokenHash: string;
  merkleLeafHash: string;
  isSpecialAuthorProof: boolean;
}

export interface MerkleProvenanceCertificate {
  projectId: string;
  bookTitleBn: string;
  merkleRootHash: string;
  chapterLeafHashes: {
    chapterIndex: number;
    chapterTitleBn: string;
    leafHash: string;
  }[];
  timestampUtc: string;
  ecdsaSignature: string;
  shothikCertificateId: string;
  immutableBlockNumber: number;
}

export interface RoyaltySplitState {
  projectId: string;
  totalRoyaltyPoolBdt: number;
  stakeholders: StakeholderShare[];
  merkleCertificate: MerkleProvenanceCertificate;
  mintedEditions: DigitalFirstEdition[];
  maxCollectorSupply: number;
}

interface RoyaltySplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const RoyaltySplitModal: React.FC<RoyaltySplitModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"smart_revenue_split" | "merkle_provenance" | "digital_first_editions">("smart_revenue_split");
  const [state, setState] = useState<RoyaltySplitState | null>(null);
  const [revenuePool, setRevenuePool] = useState<number>(150000);
  const [newCollectorName, setNewCollectorName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoyaltyState();
    }
  }, [isOpen]);

  const fetchRoyaltyState = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/royalty-split`);
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
          if (data.state.totalRoyaltyPoolBdt) {
            setRevenuePool(data.state.totalRoyaltyPoolBdt);
          }
        }
      }
    } catch (e) {
      console.warn("Using fallback local royalty split data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleMintEdition = async () => {
    if (!newCollectorName.trim()) return;
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/royalty-split/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectorName: newCollectorName.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newEdition && state) {
          setState({
            ...state,
            mintedEditions: [data.newEdition, ...state.mintedEditions]
          });
          setNewCollectorName("");
        }
      }
    } catch (e) {
      console.error("Failed to mint edition", e);
    }
  };

  const handleInjectCertificate = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/royalty-split/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.certificateMarkdown && onInsertProse) {
          onInsertProse(data.certificateMarkdown);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject certificate", e);
    }
  };

  const handleCopyMerkleRoot = () => {
    if (state?.merkleCertificate.merkleRootHash) {
      navigator.clipboard.writeText(state.merkleCertificate.merkleRootHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-slate-100">
                  ক্রিপ্টোগ্রাফিক রয়্যালটি স্প্লিট ও ডিজিটাল প্রথম সংস্করণ
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  InkOS #44
                </span>
              </div>
              <p className="text-xs text-slate-400">
                স্মার্ট রয়্যালটি রেভিনিউ স্প্লিট, মার্কেল রুট প্রুফ-অব-অথরশিপ ও ক্রমিকায়িত সংগ্রাহক প্রথম সংস্করণ (First Editions)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/20 space-x-2">
          <button
            onClick={() => setActiveTab("smart_revenue_split")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "smart_revenue_split"
                ? "border-violet-400 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>স্মার্ট রয়্যালটি রেভিনিউ স্প্লিট</span>
          </button>

          <button
            onClick={() => setActiveTab("merkle_provenance")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "merkle_provenance"
                ? "border-violet-400 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>মার্কেল রুট প্রুফ-অব-অথরশিপ</span>
          </button>

          <button
            onClick={() => setActiveTab("digital_first_editions")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "digital_first_editions"
                ? "border-violet-400 text-violet-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ডিজিটাল প্রথম সংস্করণ (১-৫০০ সংগ্রাহক কপি)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400" />
              <p className="text-sm text-slate-400">রয়্যালটি লেজার ও মার্কেল প্রুফ লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SMART REVENUE SPLIT */}
              {activeTab === "smart_revenue_split" && (
                <div className="space-y-6">
                  {/* Revenue Pool Controls */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">সিমুলেটেড মোট বই বিক্রয় তহবিল (টাকা):</span>
                      <div className="text-2xl font-bold text-violet-300 mt-1">
                        ৳{revenuePool.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="w-64 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>তহবিল সমন্বয়:</span>
                        <span className="text-violet-400 font-bold">৳{revenuePool.toLocaleString("en-US")}</span>
                      </div>
                      <input
                        type="range"
                        min={50000}
                        max={1000000}
                        step={25000}
                        value={revenuePool}
                        onChange={(e) => setRevenuePool(Number(e.target.value))}
                        className="w-full accent-violet-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Stakeholders Cards */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      অংশীদারদের স্বয়ংক্রিয় রয়্যালটি বণ্টন ম্যাট্রিক্স (মোট: ১০০%)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {state?.stakeholders.map((s) => {
                        const payoutAmount = Math.round((revenuePool * s.percentage) / 100);
                        return (
                          <div
                            key={s.id}
                            className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-slate-200">{s.name}</span>
                              <span className="text-xs font-bold text-violet-400 font-mono bg-violet-950/60 px-2 py-0.5 rounded border border-violet-500/30">
                                {s.percentage}%
                              </span>
                            </div>

                            <p className="text-xs text-slate-400">{s.roleBn}</p>

                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-slate-400 flex items-center space-x-1">
                                <Wallet className="w-3.5 h-3.5 text-violet-400" />
                                <span>{s.payoutMethod.toUpperCase()}: {s.walletOrAccount}</span>
                              </span>
                              <span className="font-bold text-emerald-400 font-mono">
                                ৳{payoutAmount.toLocaleString("en-US")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guaranteed Settlement Notice */}
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center space-x-2 text-violet-300 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>স্বয়ংক্রিয় bKash / Nagad ডিসবার্সমেন্ট ও এনবিআর কমপ্লায়েন্স</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      বইয়ের প্রতি কপি বিক্রির সাথে সাথে স্মার্ট রয়্যালটি চুক্তির মাধ্যমে অর্থ সরাসরি সংশ্লিষ্ট লেখক ও শিল্পীর মোবাইল ওয়ালেটে পৌঁছে যায়। কোনো ম্যানুয়াল মধ্যস্থতাকারী বা রয়্যালটি বিলম্বের ঝুঁকি নেই।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: MERKLE ROOT PROVENANCE */}
              {activeTab === "merkle_provenance" && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-violet-400 font-semibold">
                      মার্কেল ট্রি অথরশিপ ক্রিপ্টোগ্রাফিক সনদ
                    </span>
                    <p className="text-xs text-slate-400">
                      পান্ডুলিপির প্রতিটি অধ্যায়ের SHA-256 হ্যাশ একত্রিত করে প্রস্তুত অপরিবর্তনীয় কপিরাইট প্রমাণপত্র
                    </p>
                  </div>

                  {/* Certificate Card */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-violet-500/40 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400">গ্রন্থের নাম ও সনদ</span>
                        <h4 className="font-bold text-base text-slate-100">
                          {state?.merkleCertificate.bookTitleBn}
                        </h4>
                      </div>
                      <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {state?.merkleCertificate.shothikCertificateId}
                      </span>
                    </div>

                    {/* Merkle Root Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>মার্কেল রুট হ্যাশ (Merkle Root SHA-256):</span>
                        <button
                          onClick={handleCopyMerkleRoot}
                          className="hover:text-white transition flex items-center space-x-1"
                        >
                          {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedHash ? "কপি হয়েছে" : "কপি"}</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs text-violet-300 break-all select-all">
                        {state?.merkleCertificate.merkleRootHash}
                      </div>
                    </div>

                    {/* Chapter Leaf Hashes */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        অধ্যায় ভিত্তিক লিফ হ্যাশ (Chapter Leaf Hashes):
                      </span>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        {state?.merkleCertificate.chapterLeafHashes.map((leaf) => (
                          <div
                            key={leaf.chapterIndex}
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-slate-300 font-sans text-xs">
                              {leaf.chapterTitleBn}:
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {leaf.leafHash.substring(0, 24)}...{leaf.leafHash.substring(56)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signature and Block info */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <div>
                        <span className="block text-slate-500">লেখক স্বাক্ষর (ECDSA):</span>
                        <span className="font-mono text-emerald-400">
                          {state?.merkleCertificate.ecdsaSignature.substring(0, 18)}...
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-slate-500">ব্লক হাইট:</span>
                        <span className="font-mono text-slate-300">
                          #{state?.merkleCertificate.immutableBlockNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Action */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={handleInjectCertificate}
                      className="py-2.5 px-6 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-violet-500/20"
                    >
                      {injectedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>সনদ সফলভাবে পান্ডুলিপির ফ্রন্টম্যাটারে ইনজেক্ট হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>১-ক্লিকে পান্ডুলিপিতে ক্রিপ্টোগ্রাফিক সনদ যোগ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: DIGITAL FIRST EDITIONS */}
              {activeTab === "digital_first_editions" && (
                <div className="space-y-6">
                  {/* Minting Form */}
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200">
                        নতুন সংগ্রাহক প্রথম সংস্করণ মিন্ট করুন
                      </span>
                      <p className="text-[11px] text-slate-400">
                        সর্বোচ্চ সরবরাহ: {state?.maxCollectorSupply || 500} কপি (সীমিত সংস্করণ)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="সংগ্রাহকের নাম..."
                        value={newCollectorName}
                        onChange={(e) => setNewCollectorName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-400 w-52"
                      />
                      <button
                        onClick={handleMintEdition}
                        disabled={!newCollectorName.trim()}
                        className="px-4 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>মিন্ট করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Minted Editions List */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      মিন্টকৃত ডিজিটাল প্রথম সংস্করণ তালিকা ({state?.mintedEditions.length || 0})
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {state?.mintedEditions.map((ed) => (
                        <div
                          key={ed.editionSerial}
                          className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-500/30">
                              {ed.editionSerial}
                            </span>
                            {ed.isSpecialAuthorProof ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                                লেখক জেনেসিস কপি
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                                ভেরিফায়েড সংগ্রাহক
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-slate-200">
                            {ed.collectorName}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                            <span>টোকেন: {ed.editionTokenHash.substring(0, 16)}...</span>
                            <span>{new Date(ed.mintTimestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <BadgeCheck className="w-4 h-4 text-violet-400" />
            <span>সঠিক রাইটিং স্টুডিও • ক্রিপ্টোগ্রাফিক রয়্যালটি ও ডিজিটাল প্রথম সংস্করণ ফ্রেমওয়ার্ক</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
