/**
 * ScenarioLab Monte Carlo Financial & Growth Engine.
 * Runs 100 stochastic simulation runs for TAM/SAM/SOM modeling, CAC payback, and pricing elasticity.
 */

export interface ScenarioInputParams {
  tamBillions: number;
  samBillions: number;
  somMillions: number;
  arpuDollars: number;
  cacDollars: number;
  monthlyChurnPercent: number;
}

export interface MonteCarloRunResult {
  runId: number;
  arrYear1: number;
  arrYear2: number;
  paybackMonths: number;
}

export interface ScenarioLabSummary {
  p10PessimisticARR: number;
  p50MedianARR: number;
  p90OptimisticARR: number;
  averagePaybackMonths: number;
  runs: MonteCarloRunResult[];
}

export class ScenarioLabEngine {
  /**
   * Executes a 100-run Monte Carlo stochastic financial simulation.
   */
  static runMonteCarloSimulation(params: ScenarioInputParams): ScenarioLabSummary {
    const runs: MonteCarloRunResult[] = [];
    const baseSomARR = params.somMillions * 1_000_000;

    for (let i = 1; i <= 100; i++) {
      // Stochastic variance factors (gaussian random)
      const marketAdoptionFactor = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x
      const churnFactor = 0.8 + Math.random() * 0.4;          // variance in churn
      const cacFactor = 0.85 + Math.random() * 0.3;         // variance in CAC

      const effectiveARRYear1 = baseSomARR * marketAdoptionFactor;
      const effectiveChurn = (params.monthlyChurnPercent / 100) * churnFactor;

      const arrYear2 = effectiveARRYear1 * (1 - effectiveChurn * 12) * (1 + marketAdoptionFactor * 0.4);

      const effectiveCAC = params.cacDollars * cacFactor;
      const monthlyRevenuePerUser = params.arpuDollars;
      const paybackMonths = monthlyRevenuePerUser > 0 ? effectiveCAC / monthlyRevenuePerUser : 12;

      runs.push({
        runId: i,
        arrYear1: Math.max(0, Math.round(effectiveARRYear1)),
        arrYear2: Math.max(0, Math.round(arrYear2)),
        paybackMonths: Math.round(paybackMonths * 10) / 10,
      });
    }

    // Sort by Year 1 ARR to extract percentiles
    runs.sort((a, b) => a.arrYear1 - b.arrYear1);

    const p10 = runs[9].arrYear1;      // 10th percentile
    const p50 = runs[49].arrYear1;     // 50th percentile (median)
    const p90 = runs[89].arrYear1;     // 90th percentile

    const averagePaybackMonths =
      Math.round((runs.reduce((acc, r) => acc + r.paybackMonths, 0) / 100) * 10) / 10;

    return {
      p10PessimisticARR: p10,
      p50MedianARR: p50,
      p90OptimisticARR: p90,
      averagePaybackMonths,
      runs,
    };
  }
}
