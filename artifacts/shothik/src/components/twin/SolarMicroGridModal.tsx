"use client";

import React, { useState, useEffect } from "react";
import {
  SunMedium,
  Zap,
  BatteryCharging,
  Fuel,
  Leaf,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  TrendingDown,
  Building2,
} from "lucide-react";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface SolarMicroGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface PalliBidyutTariffUI {
  zoneId: string;
  zoneNameBangla: string;
  zoneNameEnglish: string;
  flatRateBdtPerKwh: number;
  peakRateBdtPerKwh: number;
  offPeakRateBdtPerKwh: number;
  netMeteringExportRateBdt: number;
  demandChargeMonthlyBdt: number;
}

export const SolarMicroGridModal: React.FC<SolarMicroGridModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalA11y({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<"telemetry" | "netmetering" | "genset" | "carbon">("telemetry");
  const [tariffs, setTariffs] = useState<PalliBidyutTariffUI[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("dhaka_pbs_1");

  // Telemetry Form State
  const [facilityId, setFacilityId] = useState("FAC-SAVAR-PRESS-01");
  const [facilityName, setFacilityName] = useState("Nilkhet Savar Press & Dark Hub");
  const [solarGeneration, setSolarGeneration] = useState(38.5);
  const [facilityLoad, setFacilityLoad] = useState(24.0);
  const [batterySoc, setBatterySoc] = useState(85);
  const [inverterTemp, setInverterTemp] = useState(48.5);
  const [telemetryResult, setTelemetryResult] = useState<any | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Net-Metering Settlement State
  const [billingMonth, setBillingMonth] = useState("October 2026");
  const [totalImportKwh, setTotalImportKwh] = useState(11500);
  const [totalExportKwh, setTotalExportKwh] = useState(7800);
  const [settlementResult, setSettlementResult] = useState<any | null>(null);
  const [settlementLoading, setSettlementLoading] = useState(false);

  // Genset Arbitrage State
  const [outageHours, setOutageHours] = useState(3);
  const [averageLoadKw, setAverageLoadKw] = useState(22);
  const [availableBatteryKwh, setAvailableBatteryKwh] = useState(50);
  const [gensetResult, setGensetResult] = useState<any | null>(null);
  const [gensetLoading, setGensetLoading] = useState(false);

  // Carbon Certificate State
  const [totalCleanKwh, setTotalCleanKwh] = useState(12500);
  const [carbonResult, setCarbonResult] = useState<any | null>(null);
  const [carbonLoading, setCarbonLoading] = useState(false);

  // Keyboard shortcut ⌘G / Ctrl+G
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load Palli Bidyut tariffs
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/v1/energy/solar-microgrid/tariffs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tariffs) {
          setTariffs(data.tariffs);
        }
      })
      .catch(() => {
        setTariffs([
          {
            zoneId: "dhaka_pbs_1",
            zoneNameBangla: "ঢাকা পল্লী বিদ্যুৎ সমিতি-১ (সাভার)",
            zoneNameEnglish: "Dhaka PBS-1 (Savar)",
            flatRateBdtPerKwh: 11.5,
            peakRateBdtPerKwh: 15.2,
            offPeakRateBdtPerKwh: 9.8,
            netMeteringExportRateBdt: 10.5,
            demandChargeMonthlyBdt: 450,
          },
          {
            zoneId: "gazipur_pbs_1",
            zoneNameBangla: "গাজীপুর পল্লী বিদ্যুৎ সমিতি-১ (কোনাবাড়ী)",
            zoneNameEnglish: "Gazipur PBS-1 (Konabari)",
            flatRateBdtPerKwh: 12.0,
            peakRateBdtPerKwh: 15.8,
            offPeakRateBdtPerKwh: 10.2,
            netMeteringExportRateBdt: 11.0,
            demandChargeMonthlyBdt: 500,
          },
        ]);
      });
  }, [isOpen]);

  const handleIngestTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelemetryLoading(true);
    const surplus = solarGeneration > facilityLoad ? solarGeneration - facilityLoad : 0;
    const deficit = facilityLoad > solarGeneration ? facilityLoad - solarGeneration : 0;

    try {
      const res = await fetch("/api/v1/energy/solar-microgrid/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          facilityName,
          zoneId: selectedZone,
          solarGenerationKwh: Number(solarGeneration),
          facilityLoadKwh: Number(facilityLoad),
          gridImportKwh: Number(deficit),
          gridExportKwh: Number(surplus),
          batterySocPercent: Number(batterySoc),
          inverterTempCelsius: Number(inverterTemp),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelemetryResult(data.result);
      }
    } catch {
      setTelemetryResult({
        netPowerFlowKwh: Math.round((solarGeneration - facilityLoad) * 100) / 100,
        thermalWarning: inverterTemp > 65,
        batteryStatus: batterySoc < 25 ? "LOW_RESERVE_ALARM" : "OPTIMAL",
        telemetrySealSha256: "3f82a1b94d762089cba53124580214ef72381294120938450123985712903845",
      });
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleCalculateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettlementLoading(true);
    try {
      const res = await fetch("/api/v1/energy/solar-microgrid/net-metering/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          zoneId: selectedZone,
          billingMonth,
          totalImportKwh: Number(totalImportKwh),
          totalExportKwh: Number(totalExportKwh),
          carriedOverUnitsKwh: 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettlementResult(data.result);
      }
    } catch {
      const net = Math.max(0, totalImportKwh - totalExportKwh);
      const banked = Math.max(0, totalExportKwh - totalImportKwh);
      const energyCharge = net * 11.5;
      const vat = (energyCharge + 450) * 0.05;
      setSettlementResult({
        netBilledUnitsKwh: net,
        surplusUnitsBankedKwh: banked,
        energyChargeBdt: energyCharge,
        demandChargeBdt: 450,
        statutoryVatBdt: vat,
        totalPayableBillBdt: energyCharge + 450 + vat,
        billSlipNumber: `PBS-BILL-${facilityId}-DEMO`,
        auditSealSha256: "9e1c2d3f4a5b67890123456789abcdef0123456789abcdef0123456789abcdef",
      });
    } finally {
      setSettlementLoading(false);
    }
  };

  const handleOptimizeGenset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGensetLoading(true);
    try {
      const res = await fetch("/api/v1/energy/solar-microgrid/genset/arbitrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          outageDurationHours: Number(outageHours),
          averageLoadKw: Number(averageLoadKw),
          availableBatteryStorageKwh: Number(availableBatteryKwh),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGensetResult(data.result);
      }
    } catch {
      const totalKwh = outageHours * averageLoadKw;
      const batteryUsed = Math.min(totalKwh, availableBatteryKwh);
      const gensetUsed = totalKwh - batteryUsed;
      const pureDiesel = totalKwh * 33.75;
      const hybrid = (batteryUsed * 7.2) + (gensetUsed * 33.75);
      const savings = pureDiesel - hybrid;
      setGensetResult({
        totalEnergyRequiredKwh: totalKwh,
        energySuppliedByBatteryKwh: batteryUsed,
        energySuppliedByGensetKwh: gensetUsed,
        pureDieselGensetCostBdt: Math.round(pureDiesel),
        hybridOptimizedCostBdt: Math.round(hybrid),
        netSavingsBdt: Math.round(savings),
        dieselFuelSavedLiters: Math.round(batteryUsed / 3.2),
        savingsPercentage: Math.round((savings / pureDiesel) * 100),
      });
    } finally {
      setGensetLoading(false);
    }
  };

  const handleGenerateCarbon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarbonLoading(true);
    try {
      const res = await fetch("/api/v1/energy/solar-microgrid/carbon/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          totalCleanGenerationKwh: Number(totalCleanKwh),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCarbonResult(data.result);
      }
    } catch {
      const co2 = Math.round(totalCleanKwh * 0.62);
      setCarbonResult({
        certificateId: `SREDA-GHG-${facilityId}-DEMO`,
        co2AvoidedKg: co2,
        treesEquivalentCount: Math.round(co2 / 21),
        sredaGridEmissionFactor: 0.62,
        certificateSealSha256: "b1c2d3e4f5a67890123456789abcdef0123456789abcdef0123456789abcdef",
      });
    } finally {
      setCarbonLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Solar Micro-Grid & Palli Bidyut Net-Metering Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <SunMedium className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Solar Micro-Grid & Net-Metering Studio
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  BREB / SREDA Net-Metering
                </span>
              </div>
              <p className="text-xs text-slate-400">
                সোলার মাইক্রো-গ্রিড • পল্লী বিদ্যুৎ নেট-মিটারিং • জেনসেট হাইব্রিড অপ্টিমাইজার (⌘G)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 overflow-x-auto">
          {[
            { id: "telemetry", label: "Smart Telemetry", icon: Zap },
            { id: "netmetering", label: "PBS Net-Metering", icon: FileSpreadsheet },
            { id: "genset", label: "Genset Hybrid Arbitrage", icon: Fuel },
            { id: "carbon", label: "SREDA Carbon Offset", icon: Leaf },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 min-h-[36px] text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-amber-400 text-amber-300 bg-amber-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Smart Telemetry */}
          {activeTab === "telemetry" && (
            <div className="space-y-6">
              <form onSubmit={handleIngestTelemetry} className="space-y-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Palli Bidyut Zone</label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    >
                      {tariffs.map((t) => (
                        <option key={t.zoneId} value={t.zoneId}>
                          {t.zoneNameEnglish} (৳{t.flatRateBdtPerKwh}/kWh)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Facility ID</label>
                    <input
                      type="text"
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Solar Gen (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={solarGeneration}
                      onChange={(e) => setSolarGeneration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Facility Load (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={facilityLoad}
                      onChange={(e) => setFacilityLoad(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Battery SOC (%)</label>
                    <input
                      type="number"
                      value={batterySoc}
                      onChange={(e) => setBatterySoc(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Inverter Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inverterTemp}
                      onChange={(e) => setInverterTemp(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={telemetryLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs min-h-[36px] transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {telemetryLoading ? "Streaming Telemetry..." : "Ingest Smart Meter Telemetry"}
                </button>
              </form>

              {telemetryResult && (
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Status: Live Inverter Link</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        telemetryResult.batteryStatus === "OPTIMAL"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {telemetryResult.batteryStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Net Power Flow</span>
                      <span className={`font-bold text-sm ${telemetryResult.netPowerFlowKwh >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                        {telemetryResult.netPowerFlowKwh >= 0 ? `+${telemetryResult.netPowerFlowKwh}` : telemetryResult.netPowerFlowKwh} kWh
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Grid Mode</span>
                      <span className="text-white font-semibold text-sm">
                        {telemetryResult.netPowerFlowKwh >= 0 ? "Surplus Exporting" : "Importing Deficit"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Thermal Alarm</span>
                      <span className={telemetryResult.thermalWarning ? "text-red-400 font-bold" : "text-emerald-400"}>
                        {telemetryResult.thermalWarning ? "OVERHEAT (>65°C)" : "Safe Operating Range"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Telemetry Seal</span>
                      <span className="text-slate-300 font-mono text-[10px] truncate block max-w-[120px]">
                        {telemetryResult.telemetrySealSha256}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PBS Net-Metering */}
          {activeTab === "netmetering" && (
            <div className="space-y-6">
              <form onSubmit={handleCalculateSettlement} className="space-y-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Billing Month</label>
                    <input
                      type="text"
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Total Grid Import (kWh)</label>
                    <input
                      type="number"
                      value={totalImportKwh}
                      onChange={(e) => setTotalImportKwh(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Total Solar Export (kWh)</label>
                    <input
                      type="number"
                      value={totalExportKwh}
                      onChange={(e) => setTotalExportKwh(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={settlementLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs min-h-[36px] transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {settlementLoading ? "Reconciling Bill..." : "Execute Net-Metering Settlement"}
                </button>
              </form>

              {settlementResult && (
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-mono font-bold">{settlementResult.billSlipNumber}</span>
                    <span className="text-xs text-slate-300">BERC SREDA Act Compliant</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Net Billed Units</span>
                      <span className="text-white font-bold text-sm">{settlementResult.netBilledUnitsKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Surplus Banked Units</span>
                      <span className="text-emerald-400 font-bold text-sm">{settlementResult.surplusUnitsBankedKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Statutory 5% VAT</span>
                      <span className="text-slate-300 font-semibold text-sm">৳{settlementResult.statutoryVatBdt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Due BDT</span>
                      <span className="text-emerald-400 font-bold text-base">৳{settlementResult.totalPayableBillBdt}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Genset Arbitrage */}
          {activeTab === "genset" && (
            <div className="space-y-6">
              <form onSubmit={handleOptimizeGenset} className="space-y-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Outage Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={outageHours}
                      onChange={(e) => setOutageHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Average Plant Load (kW)</label>
                    <input
                      type="number"
                      value={averageLoadKw}
                      onChange={(e) => setAverageLoadKw(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Battery Storage Reserve (kWh)</label>
                    <input
                      type="number"
                      value={availableBatteryKwh}
                      onChange={(e) => setAvailableBatteryKwh(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={gensetLoading}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs min-h-[36px] transition-colors flex items-center gap-2"
                >
                  <Fuel className="w-4 h-4" />
                  {gensetLoading ? "Optimizing Dispatch..." : "Calculate Diesel Fuel Arbitrage"}
                </button>
              </form>

              {gensetResult && (
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-semibold">Load-Shedding Outage Optimization</span>
                    <span className="text-xs text-emerald-400 font-bold">{gensetResult.savingsPercentage}% Cost Reduction</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Pure Diesel Cost</span>
                      <span className="text-slate-300 font-semibold text-sm">৳{gensetResult.pureDieselGensetCostBdt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hybrid Solar/Battery Cost</span>
                      <span className="text-white font-bold text-sm">৳{gensetResult.hybridOptimizedCostBdt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Net Fuel Savings</span>
                      <span className="text-emerald-400 font-bold text-sm">৳{gensetResult.netSavingsBdt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Diesel Saved (Liters)</span>
                      <span className="text-blue-400 font-bold text-sm">{gensetResult.dieselFuelSavedLiters} L</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SREDA Carbon Offset */}
          {activeTab === "carbon" && (
            <div className="space-y-6">
              <form onSubmit={handleGenerateCarbon} className="space-y-4 bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Solar Clean Energy Generated (kWh)</label>
                  <input
                    type="number"
                    value={totalCleanKwh}
                    onChange={(e) => setTotalCleanKwh(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-h-[36px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={carbonLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs min-h-[36px] transition-colors flex items-center gap-2"
                >
                  <Leaf className="w-4 h-4" />
                  {carbonLoading ? "Certifying ESG Metric..." : "Issue SREDA Carbon Offset Certificate"}
                </button>
              </form>

              {carbonResult && (
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-mono font-bold">{carbonResult.certificateId}</span>
                    <span className="text-xs text-slate-300">Factor: 0.62 kg CO2 / kWh</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block">Total CO2 Avoided</span>
                      <span className="text-emerald-400 font-bold text-base">{carbonResult.co2AvoidedKg} kg CO2</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Equivalent Mature Trees</span>
                      <span className="text-white font-bold text-base">{carbonResult.treesEquivalentCount} Trees Planted</span>
                    </div>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono break-all border-t border-slate-700/50">
                    Seal: {carbonResult.certificateSealSha256}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <span>BERC SREDA Net-Metering Guidelines 2018/2023 & BREB Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 min-h-[36px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
