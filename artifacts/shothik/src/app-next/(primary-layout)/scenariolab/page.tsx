"use client";

import React, { useState } from "react";
import { ScenarioLabModal } from "@/components/scenariolab/ScenarioLabModal";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, Zap, TrendingUp, Sparkles, Server, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ScenarioLabPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="w-full min-h-screen p-4 sm:p-8 bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/80 to-slate-950 -z-10" />

      <div className="w-full max-w-4xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Autonomous Systems Testing Matrix</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          ScenarioLab™ Stress-Test & Resilience Studio
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Simulate 30 catastrophic edge-case vectors across South Asian payments (COD & MFS),
          intermittent connectivity, token volatility, and high-concurrency swarm architectures.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Server className="w-4 h-4" />
              <span>30 Resilience Vectors</span>
            </div>
            <p className="text-xs text-slate-400">
              Covers SRE & Infra, Client Memory, Security & RLS, Billing & Growth, and WebGPU fallbacks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Monte Carlo Financials</span>
            </div>
            <p className="text-xs text-slate-400">
              TAM/SAM/SOM modeling with Bangladesh COD return rates (18.5%) and bKash cashout fees.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>Live Stress Engine</span>
            </div>
            <p className="text-xs text-slate-400">
              Calculates unmitigated vs. mitigated failure rates and exact financial risk averted in USD.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Launch 30-Scenario Stress Test
          </Button>

          <Link
            href="/twin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm font-medium no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Founder Cockpit
          </Link>
        </div>
      </div>

      {/* Scenario Lab Modal */}
      <ScenarioLabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
