import { useState, useCallback, useMemo } from "react";
import {
  ScenarioLabEngine,
  type ScenarioInputParams,
  type ScenarioLabSummary,
  type FailureScenarioStressResult,
} from "../lib/infrastructure/scenario-lab-engine";

export type ScenarioCategoryFilter =
  | "ALL"
  | "SRE & Infra"
  | "Client Memory"
  | "Security & RLS"
  | "Billing & Growth"
  | "AI Inference"
  | "Database & Vector"
  | "Web Search"
  | "Audio Speech"
  | "IDE & Code Graph"
  | "Community Swarm";

export function useScenarioLab(initialParams?: Partial<ScenarioInputParams>) {
  const [params, setParams] = useState<ScenarioInputParams>({
    tamBillions: initialParams?.tamBillions || 42.8,
    samBillions: initialParams?.samBillions || 8.2,
    somMillions: initialParams?.somMillions || 150,
    arpuDollars: initialParams?.arpuDollars || 29,
    cacDollars: initialParams?.cacDollars || 120,
    monthlyChurnPercent: initialParams?.monthlyChurnPercent || 3.5,
    currency: initialParams?.currency || "USD",
    codReturnRatePercent: initialParams?.codReturnRatePercent || 18.5,
    mfsCashoutFeePercent: initialParams?.mfsCashoutFeePercent || 1.5,
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ScenarioCategoryFilter>("ALL");

  const simulationSummary: ScenarioLabSummary = useMemo(() => {
    return ScenarioLabEngine.runMonteCarloSimulation(params);
  }, [params]);

  const [stressTestResults, setStressTestResults] = useState<FailureScenarioStressResult[]>(() => {
    return ScenarioLabEngine.run30ScenarioStressTest();
  });

  const filteredStressTestResults = useMemo(() => {
    if (activeCategory === "ALL") return stressTestResults;
    return stressTestResults.filter((r) => r.category === activeCategory);
  }, [stressTestResults, activeCategory]);

  const reliabilityMetrics = useMemo(() => {
    const totalRiskPrevented = stressTestResults.reduce(
      (acc, r) => acc + r.financialRiskPreventedUsd,
      0
    );
    const avgUnmitigatedFailure =
      stressTestResults.reduce((acc, r) => acc + r.unmitigatedFailureRate, 0) /
      stressTestResults.length;
    const avgMitigatedFailure =
      stressTestResults.reduce((acc, r) => acc + r.mitigatedFailureRate, 0) /
      stressTestResults.length;
    const avgMitigatedMTTR =
      stressTestResults.reduce((acc, r) => acc + r.mttrSecondsMitigated, 0) /
      stressTestResults.length;

    return {
      totalRiskPreventedUsd: Math.round(totalRiskPrevented),
      avgUnmitigatedFailureRate: Math.round(avgUnmitigatedFailure * 10) / 10,
      avgMitigatedFailureRate: Math.round(avgMitigatedFailure * 1000) / 1000,
      avgMitigatedMTTRSeconds: Math.round(avgMitigatedMTTR * 10) / 10,
      availabilityTarget: "99.999%",
      totalSimulationsCount: 900,
    };
  }, [stressTestResults]);

  const updateParam = useCallback(<K extends keyof ScenarioInputParams>(key: K, value: ScenarioInputParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const triggerSimulation = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      setStressTestResults(ScenarioLabEngine.run30ScenarioStressTest());
      setIsSimulating(false);
    }, 450);
  }, []);

  return {
    params,
    simulationSummary,
    stressTestResults: filteredStressTestResults,
    allStressTestResults: stressTestResults,
    reliabilityMetrics,
    activeCategory,
    setActiveCategory,
    isSimulating,
    updateParam,
    triggerSimulation,
  };
}
