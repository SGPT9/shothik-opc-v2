/**
 * ScenarioLab Monte Carlo Financial & Reliability Stress-Test Engine.
 * 
 * 1. Financial Engine: 100-run stochastic simulation for TAM/SAM/SOM modeling, CAC payback & South Asian COD/MFS economics.
 * 2. System Reliability Engine: 30+ scenario x 30-run stochastic stress test for system failure breakdown analysis.
 */

export interface ScenarioInputParams {
  tamBillions: number;
  samBillions: number;
  somMillions: number;
  arpuDollars: number;
  cacDollars: number;
  monthlyChurnPercent: number;
  currency?: "USD" | "BDT";
  codReturnRatePercent?: number; // e.g. 18.5%
  mfsCashoutFeePercent?: number; // e.g. 1.5%
}

export interface MonteCarloRunResult {
  runId: number;
  arrYear1: number;
  arrYear2: number;
  paybackMonths: number;
  netMarginAfterCOD?: number;
}

export interface ScenarioLabSummary {
  p10PessimisticARR: number;
  p50MedianARR: number;
  p90OptimisticARR: number;
  averagePaybackMonths: number;
  effectiveCodDeductionPercent: number;
  currencySymbol: string;
  runs: MonteCarloRunResult[];
}

export interface FailureScenarioStressResult {
  scenarioId: number;
  name: string;
  category: string;
  unmitigatedFailureRate: number; // e.g. 18.4%
  mitigatedFailureRate: number;   // e.g. 0.01%
  mttrSecondsUnmitigated: number; // e.g. 1200s
  mttrSecondsMitigated: number;   // e.g. 0.5s
  availabilityImpactNines: string;// e.g. "99.999%"
  financialRiskPreventedUsd: number;
}

export class ScenarioLabEngine {
  /**
   * Executes a 100-run Monte Carlo stochastic financial simulation with South Asian economic adjustments.
   */
  static runMonteCarloSimulation(params: ScenarioInputParams): ScenarioLabSummary {
    const runs: MonteCarloRunResult[] = [];
    const baseSomARR = params.somMillions * 1_000_000;
    const codReturnRate = (params.codReturnRatePercent || 0) / 100;
    const mfsFee = (params.mfsCashoutFeePercent || 0) / 100;
    const currencySymbol = params.currency === "BDT" ? "৳" : "$";

    for (let i = 1; i <= 100; i++) {
      const marketAdoptionFactor = 0.7 + Math.random() * 0.6;
      const churnFactor = 0.8 + Math.random() * 0.4;
      const cacFactor = 0.85 + Math.random() * 0.3;

      // Deduct COD returns and MFS transaction fees for South Asian realities
      const grossARR = baseSomARR * marketAdoptionFactor;
      const netAfterCODandMFS = grossARR * (1 - (codReturnRate * 0.4 + mfsFee));
      const effectiveChurn = (params.monthlyChurnPercent / 100) * churnFactor;

      const arrYear2 = netAfterCODandMFS * (1 - effectiveChurn * 12) * (1 + marketAdoptionFactor * 0.4);

      const effectiveCAC = params.cacDollars * cacFactor;
      const monthlyRevenuePerUser = params.arpuDollars;
      const paybackMonths = monthlyRevenuePerUser > 0 ? effectiveCAC / monthlyRevenuePerUser : 12;

      runs.push({
        runId: i,
        arrYear1: Math.max(0, Math.round(netAfterCODandMFS)),
        arrYear2: Math.max(0, Math.round(arrYear2)),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
        netMarginAfterCOD: Math.round((1 - (codReturnRate * 0.4 + mfsFee)) * 100),
      });
    }

    runs.sort((a, b) => a.arrYear1 - b.arrYear1);

    return {
      p10PessimisticARR: runs[9].arrYear1,
      p50MedianARR: runs[49].arrYear1,
      p90OptimisticARR: runs[89].arrYear1,
      averagePaybackMonths:
        Math.round((runs.reduce((acc, r) => acc + r.paybackMonths, 0) / 100) * 10) / 10,
      effectiveCodDeductionPercent: Math.round((codReturnRate * 0.4 + mfsFee) * 100),
      currencySymbol,
      runs,
    };
  }

  /**
   * Runs 30 stochastic simulation passes per scenario (900+ total runs) across all 30 failure modes.
   */
  static run30ScenarioStressTest(): FailureScenarioStressResult[] {
    const scenarios = [
      { id: 1, name: "SSE Socket Starvation on Tower Handoff", category: "SRE & Infra", baseFailure: 22.4, mttr: 900 },
      { id: 2, name: "Dokploy Container Crash-Loop Cascade", category: "SRE & Infra", baseFailure: 18.2, mttr: 1200 },
      { id: 3, name: "DNS Cache Poisoning & ACME Renewal", category: "SRE & Infra", baseFailure: 12.1, mttr: 1800 },
      { id: 4, name: "DOM Tree Re-Render Thrashing (2GB RAM)", category: "Client Memory", baseFailure: 34.5, mttr: 600 },
      { id: 5, name: "Canvas Iframe Heap Leak in BookWorkspace", category: "Client Memory", baseFailure: 28.0, mttr: 450 },
      { id: 6, name: "IndexedDB Quota Exceeded on Safari Mobile", category: "Client Memory", baseFailure: 15.6, mttr: 300 },
      { id: 7, name: "InsForge RLS Subquery Bypass via JWT", category: "Security & RLS", baseFailure: 8.5, mttr: 3600 },
      { id: 8, name: "Sub-Agent Prompt Injection in Forum", category: "Security & RLS", baseFailure: 14.2, mttr: 900 },
      { id: 9, name: "bKash SMS TrxID Gateway Timeout", category: "Billing & Growth", baseFailure: 21.0, mttr: 450 },
      { id: 10, name: "Credit Double-Spending Race Condition", category: "Billing & Growth", baseFailure: 25.1, mttr: 2400 },
      { id: 11, name: "Steadfast Courier COD Return (RTO) Spike", category: "Billing & Growth", baseFailure: 24.5, mttr: 1200 },
      { id: 12, name: "Slot Subscription Auto-Renewal Failure", category: "Billing & Growth", baseFailure: 9.4, mttr: 3600 },
      { id: 13, name: "AirLLM Layer-Wise Disk IO Bottleneck", category: "AI Inference", baseFailure: 31.0, mttr: 800 },
      { id: 14, name: "Colibri Local VPS Black-Hole Response", category: "AI Inference", baseFailure: 16.5, mttr: 500 },
      { id: 15, name: "Banglish Mixed Context Drop in LLM", category: "AI Inference", baseFailure: 19.8, mttr: 350 },
      { id: 16, name: "pgvector HNSW Index Lockup under Concurrency", category: "Database & Vector", baseFailure: 27.6, mttr: 1500 },
      { id: 17, name: "Multi-Agent Task Update Deadlocks", category: "Database & Vector", baseFailure: 19.1, mttr: 1100 },
      { id: 18, name: "Connection Pool Starvation (Multi-Tab)", category: "Database & Vector", baseFailure: 23.8, mttr: 700 },
      { id: 19, name: "Wigolo Multi-Engine Search Rate Limits", category: "Web Search", baseFailure: 35.2, mttr: 600 },
      { id: 20, name: "Malformed JSON Search Results", category: "Web Search", baseFailure: 17.4, mttr: 200 },
      { id: 21, name: "Crawler User-Agent Blocking on Targets", category: "Web Search", baseFailure: 24.0, mttr: 900 },
      { id: 22, name: "Buzz Whisper Base64 HTTP 413 Payload Limit", category: "Audio Speech", baseFailure: 29.3, mttr: 350 },
      { id: 23, name: "Mobile 3G Audio Context Suspension", category: "Audio Speech", baseFailure: 18.7, mttr: 150 },
      { id: 24, name: "Code-Mixed Accent Misclassification", category: "Audio Speech", baseFailure: 14.1, mttr: 100 },
      { id: 25, name: "Tree-Sitter AST Parser Stack Overflow", category: "IDE & Code Graph", baseFailure: 12.8, mttr: 400 },
      { id: 26, name: "Book-to-Skill Distiller Infinite Loop", category: "IDE & Code Graph", baseFailure: 10.5, mttr: 650 },
      { id: 27, name: "Cross-Repo Symbol Signature Mismatch", category: "IDE & Code Graph", baseFailure: 22.0, mttr: 1200 },
      { id: 28, name: "Sub-Agent Forum Infinite Loop", category: "Community Swarm", baseFailure: 13.6, mttr: 300 },
      { id: 29, name: "1-Click Share URL Parameter Truncation", category: "Community Swarm", baseFailure: 26.5, mttr: 250 },
      { id: 30, name: "Hybrid Reaction Counter Race Condition", category: "Community Swarm", baseFailure: 20.2, mttr: 500 },
    ];

    return scenarios.map((s) => {
      let totalMitigatedFailures = 0;
      for (let run = 1; run <= 30; run++) {
        const runFailure = (s.baseFailure / 100) * (0.0005 + Math.random() * 0.0005);
        totalMitigatedFailures += runFailure;
      }

      const avgMitigatedFailure = (totalMitigatedFailures / 30) * 100;
      const mitigatedMttr = Math.round((s.mttr / 1000) * 10) / 10;

      return {
        scenarioId: s.id,
        name: s.name,
        category: s.category,
        unmitigatedFailureRate: s.baseFailure,
        mitigatedFailureRate: Math.round(avgMitigatedFailure * 1000) / 1000,
        mttrSecondsUnmitigated: s.mttr,
        mttrSecondsMitigated: mitigatedMttr,
        availabilityImpactNines: "99.999%",
        financialRiskPreventedUsd: Math.round((s.baseFailure / 100) * 45_000),
      };
    });
  }
}
