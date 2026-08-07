"use client";

import React, { useState } from "react";
import { Wand2, Sparkles, ShoppingBag, DollarSign, Megaphone, MessageSquare, CheckSquare, RefreshCw } from "lucide-react";

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
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Ponytail Zero-Prompt Intent Synthesizer <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-zinc-400">1 Sentence ➔ Full Business Infrastructure & Ad Campaign</p>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Autonomous Engine
        </span>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300">Enter Your Business Idea (1 Sentence):</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            placeholder="e.g. Sell organic honey or custom hoodies in Chittagong"
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
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
        <div className="space-y-4 pt-2">
          {/* Supplier & Margin Box */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-500 flex items-center gap-1 font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Supplier Quote:
              </span>
              <p className="font-bold text-zinc-200">{result.wholesaleSupplierQuote?.supplierName}</p>
              <p className="text-zinc-400">Unit Cost: ৳{result.wholesaleSupplierQuote?.itemUnitCostBdt} BDT</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-zinc-500 flex items-center justify-end gap-1 font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Profit Margin:
              </span>
              <p className="font-bold text-emerald-400">৳{result.wholesaleSupplierQuote?.unitProfitBdt} BDT / unit</p>
              <p className="text-emerald-500/80 font-mono">({result.wholesaleSupplierQuote?.marginPercentage}% Margin)</p>
            </div>
          </div>

          {/* Ad Copy Box */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-xs">
            <span className="text-purple-300 font-bold flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-purple-400" /> Generated Social Ad Copy:
            </span>
            <p className="font-bold text-zinc-100">{result.generatedAdCopy?.headline}</p>
            <p className="text-zinc-300 leading-relaxed">{result.generatedAdCopy?.primaryText}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {result.generatedAdCopy?.hashtags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Starter Twin Tasks */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-cyan-400" /> Auto-Seeded Starter Digital Twin Tasks:
            </span>
            <ul className="space-y-1.5 pt-1">
              {result.starterTwinTasks?.map((task: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
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
