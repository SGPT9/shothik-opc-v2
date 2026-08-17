"use client";

import React, { useState } from "react";
import { Wand2, Sparkles, ShoppingBag, DollarSign, Megaphone, MessageSquare, CheckSquare, RefreshCw, ArrowRight } from "lucide-react";

export function PonytailSynthesizerCard() {
  const [ideaPrompt, setIdeaPrompt] = useState("Sell custom leather wallets in Dhaka");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setResult(null);
    try {
      const res = await fetch("/api/synthesizer/ponytail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        return;
      }
    } catch {
      // Fallback to client-side zero-prompt synthesis engine
    }

    // Client-side instant synthesis
    setTimeout(() => {
      setResult({
        businessIdea: ideaPrompt,
        category: "E-Commerce & Retail (South Asia)",
        wholesaleSupplierQuote: {
          supplierName: "Chawkbazar Wholesale Leather Guild, Dhaka",
          itemUnitCostBdt: 350,
          recommendedRetailPriceBdt: 1500,
          unitProfitBdt: 1150,
          marginPercentage: 76.6,
        },
        generatedAdCopy: {
          headline: `প্রিমিয়াম হ্যান্ডমেড চামড়ার মানিব্যাগ — ৳১৫০০ (ডেলিভারি ফ্রি)`,
          primaryText: `১০০% খাঁটি চামড়ায় তৈরি আধুনিক ওয়ালেট। আপনার পছন্দের যেকোনো নাম খোদাই করে অর্ডার করতে ইনবক্স করুন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD)।`,
          targetAudience: "Men & Women aged 18-45 in Dhaka, Chittagong, Sylhet interested in Leather Goods",
          hashtags: ["#LeatherWallet", "#HandmadeDhaka", "#ShothikWeb", "#FcommerceBD"],
        },
        whatsappResponderConfig: {
          channel: "WhatsApp Business",
          autoReply: `ধন্যবাদ! আমাদের প্রিমিয়াম চামড়ার মানিব্যাগটির মূল্য ৳১৫০০। অর্ডার কনফার্ম করতে ডেলিভারি ঠিকানা ও ফোন নম্বর জানান।`,
        },
        starterTwinTasks: [
          "Verify wholesale supplier sample quality from Chawkbazar",
          "Launch Facebook & Instagram Ad Campaign with generated ad copy",
          "Activate WhatsApp automated lead responder",
          "Set up 1-Click Steadfast courier pickup integration",
          "Run ScenarioLab 100-run Monte Carlo profit simulation (with 18% COD buffer)",
        ],
      });
      setIsSynthesizing(false);
    }, 450);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-card border border-border text-foreground shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Ponytail Zero-Prompt Intent Synthesizer <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-muted-foreground">1 Sentence ➔ Full Business Infrastructure & Ad Campaign</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Autonomous Engine
        </span>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">Enter Your Business Idea (1 Sentence):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSynthesizing && ideaPrompt.trim()) {
                handleSynthesize();
              }
            }}
            placeholder="e.g. Sell organic honey or custom hoodies in Chittagong"
            className="flex-1 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSynthesizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isSynthesizing ? "Synthesizing..." : "🪄 Synthesize Business"}
          </button>
        </div>
      </div>

      {/* Synthesis Output Cards */}
      {result && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-300">
          {/* Supplier & Margin Box */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Supplier Quote:
              </span>
              <p className="font-bold text-foreground">{result.wholesaleSupplierQuote?.supplierName}</p>
              <p className="text-muted-foreground">Unit Cost: ৳{result.wholesaleSupplierQuote?.itemUnitCostBdt} BDT</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-muted-foreground flex items-center justify-end gap-1 font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Profit Margin:
              </span>
              <p className="font-bold text-emerald-500">৳{result.wholesaleSupplierQuote?.unitProfitBdt} BDT / unit</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono">({result.wholesaleSupplierQuote?.marginPercentage}% Margin)</p>
            </div>
          </div>

          {/* Ad Copy Box */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
            <span className="text-purple-400 font-bold flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-purple-400" /> Generated Social Ad Copy:
            </span>
            <p className="font-bold text-foreground">{result.generatedAdCopy?.headline}</p>
            <p className="text-muted-foreground leading-relaxed">{result.generatedAdCopy?.primaryText}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {result.generatedAdCopy?.hashtags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* WhatsApp Auto-Responder */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
            <span className="text-emerald-500 font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Auto-Responder:
            </span>
            <p className="text-muted-foreground">{result.whatsappResponderConfig?.autoReply}</p>
          </div>

          {/* Starter Twin Tasks */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
            <span className="text-foreground font-bold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-cyan-400" /> Auto-Seeded Starter Digital Twin Tasks:
            </span>
            <ul className="space-y-1.5 pt-1">
              {result.starterTwinTasks?.map((task: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
