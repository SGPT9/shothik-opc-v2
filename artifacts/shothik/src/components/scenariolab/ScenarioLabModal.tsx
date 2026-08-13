"use client";

import React, { useState } from "react";
import {
  useScenarioLab,
  type ScenarioCategoryFilter,
} from "../../hooks/useScenarioLab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp,
  RotateCw,
  Sparkles,
  Server,
  Cpu,
  Lock,
  CreditCard,
  Search,
  Volume2,
  Code,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ScenarioLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CHIPS: { label: string; value: ScenarioCategoryFilter; icon: React.ElementType }[] = [
  { label: "All 30 Scenarios", value: "ALL", icon: Sparkles },
  { label: "SRE & Infra", value: "SRE & Infra", icon: Server },
  { label: "Client Memory", value: "Client Memory", icon: Cpu },
  { label: "Security & RLS", value: "Security & RLS", icon: Lock },
  { label: "Billing & Growth", value: "Billing & Growth", icon: CreditCard },
  { label: "AI Inference", value: "AI Inference", icon: Zap },
  { label: "Database & Vector", value: "Database & Vector", icon: Activity },
  { label: "Web Search", value: "Web Search", icon: Search },
  { label: "Audio Speech", value: "Audio Speech", icon: Volume2 },
  { label: "IDE & Code Graph", value: "IDE & Code Graph", icon: Code },
  { label: "Community Swarm", value: "Community Swarm", icon: Users },
];

export function ScenarioLabModal({ isOpen, onClose }: ScenarioLabModalProps) {
  const {
    params,
    simulationSummary,
    stressTestResults,
    reliabilityMetrics,
    activeCategory,
    setActiveCategory,
    isSimulating,
    updateParam,
    triggerSimulation,
  } = useScenarioLab();

  const [activeTab, setActiveTab] = useState<"reliability" | "financial">("reliability");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950/95 text-slate-100 border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/30 border border-indigo-500/30 text-indigo-400">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ScenarioLab™ Stress-Test & Financial Engine
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  900 Monte Carlo Runs Locked
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Stochastic reliability modeling across 30 failure modes & TAM/SAM/SOM CAC payback engine.
              </DialogDescription>
            </div>
          </div>

          <Button
            size="sm"
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
          >
            <RotateCw className={cn("h-4 w-4", isSimulating && "animate-spin")} />
            {isSimulating ? "Simulating 900 Runs..." : "Re-Run 900 Monte Carlo Simulations"}
          </Button>
        </DialogHeader>

        {/* Main Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 mb-6">
            <TabsTrigger
              value="reliability"
              className="rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition"
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              30-Scenario System Reliability (900-Run Monte Carlo)
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-lg text-xs font-semibold py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Financial TAM / SAM / SOM CAC Payback Engine
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: System Reliability Stress Test */}
          <TabsContent value="reliability" className="space-y-6 focus-visible:outline-none">
            {/* Executive KPI Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-slate-900/60 border-slate-800/80 rounded-xl p-3.5">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                    System Availability Target
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </span>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">
                      {reliabilityMetrics.availabilityTarget}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Five-Nines (&lt;5 mins downtime/yr)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 rounded-xl p-3.5">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                    Mitigated Failure Rate
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </span>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-indigo-400 tracking-tight">
                      {reliabilityMetrics.avgMitigatedFailureRate}%
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reduced from {reliabilityMetrics.avgUnmitigatedFailureRate}% baseline
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 rounded-xl p-3.5">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                    Mitigated MTTR (Recovery)
                    <Clock className="h-4 w-4 text-cyan-400" />
                  </span>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-cyan-400 tracking-tight">
                      {reliabilityMetrics.avgMitigatedMTTRSeconds}s
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sub-second recovery resume</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 rounded-xl p-3.5">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                    Financial Risk Prevented
                    <DollarSign className="h-4 w-4 text-purple-400" />
                  </span>
                  <div className="mt-2">
                    <p className="text-2xl font-black text-purple-400 tracking-tight">
                      ${reliabilityMetrics.totalRiskPreventedUsd.toLocaleString()}/yr
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Per 10,000 active users</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORY_CHIPS.map(({ label, value, icon: ChipIcon }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border",
                    activeCategory === value
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  <ChipIcon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Interactive Output Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-inner">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-12 text-center">ID</th>
                    <th className="py-3 px-4">Failure Scenario Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Unmitigated %</th>
                    <th className="py-3 px-4 text-right">Mitigated %</th>
                    <th className="py-3 px-4 text-right">MTTR Delta</th>
                    <th className="py-3 px-4 text-right">Risk Prevented ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                  {stressTestResults.map((scenario) => (
                    <tr
                      key={scenario.scenarioId}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center text-slate-500 font-semibold">
                        {scenario.scenarioId}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                        {scenario.name}
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {scenario.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-rose-400 font-medium">
                        {scenario.unmitigatedFailureRate}%
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">
                        {scenario.mitigatedFailureRate}%
                      </td>
                      <td className="py-2.5 px-4 text-right text-cyan-400 font-medium">
                        {scenario.mttrSecondsUnmitigated}s &rarr;{" "}
                        <span className="font-bold">{scenario.mttrSecondsMitigated}s</span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-purple-300 font-semibold">
                        ${scenario.financialRiskPreventedUsd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 2: Financial TAM / SAM / SOM Modeling */}
          <TabsContent value="financial" className="space-y-6 focus-visible:outline-none">
            {/* Financial Parameters Inputs */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  TAM (Total Addressable Market)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.tamBillions}
                    onChange={(e) => updateParam("tamBillions", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">$B</span>
                </div>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  SAM (Serviceable Addressable Market)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.samBillions}
                    onChange={(e) => updateParam("samBillions", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">$B</span>
                </div>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  SOM (Serviceable Obtainable Market)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.somMillions}
                    onChange={(e) => updateParam("somMillions", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">$M</span>
                </div>
              </Card>
            </div>

            {/* ARPU, CAC, Churn */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  ARPU (Avg Revenue Per User)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.arpuDollars}
                    onChange={(e) => updateParam("arpuDollars", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">$/mo</span>
                </div>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  CAC (Customer Acquisition Cost)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={params.cacDollars}
                    onChange={(e) => updateParam("cacDollars", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">$</span>
                </div>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-xl p-4">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Monthly Churn Rate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={params.monthlyChurnPercent}
                    onChange={(e) => updateParam("monthlyChurnPercent", parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>
              </Card>
            </div>

            {/* Financial ARR Percentile Projections */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 rounded-xl p-5">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  P10 Pessimistic ARR (Yr 1)
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  ${(simulationSummary.p10PessimisticARR / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-slate-500 mt-1">10th percentile adoption rate</p>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500/30 rounded-xl p-5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  P50 Median ARR (Yr 1)
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  ${(simulationSummary.p50MedianARR / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Payback: <strong className="text-indigo-300">{simulationSummary.averagePaybackMonths} months</strong>
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30 rounded-xl p-5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  P90 Optimistic ARR (Yr 1)
                </span>
                <p className="text-3xl font-black text-white mt-2">
                  ${(simulationSummary.p90OptimisticARR / 1_000_000).toFixed(2)}M
                </p>
                <p className="text-xs text-slate-400 mt-1">90th percentile adoption rate</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
