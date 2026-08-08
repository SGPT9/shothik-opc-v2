import { useState, useCallback, useMemo } from "react";
import { ScenarioLabEngine, type ScenarioInputParams, type ScenarioLabSummary } from "@/lib/infrastructure/scenario-lab-engine";

export function useScenarioLab(initialParams?: Partial<ScenarioInputParams>) {
  const [params, setParams] = useState<ScenarioInputParams>({
    tamBillions: initialParams?.tamBillions || 42.8,
    samBillions: initialParams?.samBillions || 8.2,
    somMillions: initialParams?.somMillions || 150,
    arpuDollars: initialParams?.arpuDollars || 29,
    cacDollars: initialParams?.cacDollars || 120,
    monthlyChurnPercent: initialParams?.monthlyChurnPercent || 3.5,
  });

  const [isSimulating, setIsSimulating] = useState(false);

  const simulationSummary: ScenarioLabSummary = useMemo(() => {
    return ScenarioLabEngine.runMonteCarloSimulation(params);
  }, [params]);

  const updateParam = useCallback((key: keyof ScenarioInputParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const triggerSimulation = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 300);
  }, []);

  return {
    params,
    simulationSummary,
    isSimulating,
    updateParam,
    triggerSimulation,
  };
}
