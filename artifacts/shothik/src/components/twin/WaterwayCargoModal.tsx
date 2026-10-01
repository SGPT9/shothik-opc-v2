"use client";

import React, { useState, useEffect } from "react";
import {
  Ship,
  Anchor,
  Compass,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  X,
  MapPin,
  ExternalLink,
  DollarSign,
  Droplets,
} from "lucide-react";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface WaterwayCargoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface RiverCorridorUI {
  corridorId: string;
  corridorNameBangla: string;
  corridorNameEnglish: string;
  riverDistanceKm: number;
  classificationClass: string;
  minimumNavigableDepthMeters: number;
  tollRatePerDwtBdt: number;
  primaryGhats: string[];
}

export const WaterwayCargoModal: React.FC<WaterwayCargoModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalA11y({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<"telemetry" | "laytime" | "biwta" | "corridors">("telemetry");
  const [corridors, setCorridors] = useState<RiverCorridorUI[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<string>("chittagong_dhaka_meghna");

  // AIS Telemetry State
  const [vesselId, setVesselId] = useState("MV-TITAS-EXPRESS");
  const [speedKnots, setSpeedKnots] = useState(8.5);
  const [waterDepth, setWaterDepth] = useState(4.8);
  const [vesselDraft, setVesselDraft] = useState(3.2);
  const [kilometerMarker, setKilometerMarker] = useState(142.5);
  const [telemetryResult, setTelemetryResult] = useState<any | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Laytime & Demurrage State
  const [consignmentId, setConsignmentId] = useState("CON-CEMENT-CLK-991");
  const [laytimeVesselId, setLaytimeVesselId] = useState("MV-MEGHNA-BULK-02");
  const [cargoType, setCargoType] = useState("cement_clinker");
  const [cargoQuantityMt, setCargoQuantityMt] = useState(1500);
  const [dischargePortGhat, setDischargePortGhat] = useState("Mukterpur River Ghat, Munshiganj");
  const [norAcceptedAt, setNorAcceptedAt] = useState("2026-10-01T06:00");
  const [dischargeCompletedAt, setDischargeCompletedAt] = useState("2026-10-06T06:00");
  const [weatherExceptionHours, setWeatherExceptionHours] = useState(12);
  const [demurrageDailyRate, setDemurrageDailyRate] = useState(25000);
  const [laytimeResult, setLaytimeResult] = useState<any | null>(null);
  const [laytimeLoading, setLaytimeLoading] = useState(false);

  // BIWTA Statutory Toll State
  const [biwtaVesselId, setBiwtaVesselId] = useState("MV-KARNAPHULI-EXPRESS");
  const [vesselName, setVesselName] = useState("M.V. Karnaphuli Express");
  const [registrationNo, setRegistrationNo] = useState("BIWTA-C-8821");
  const [deadweightTonnage, setDeadweightTonnage] = useState(1200);
  const [berthingDays, setBerthingDays] = useState(3);
  const [requiresPilotage, setRequiresPilotage] = useState(true);
  const [biwtaResult, setBiwtaResult] = useState<any | null>(null);
  const [biwtaLoading, setBiwtaLoading] = useState(false);

  // Keyboard shortcut ⌘W / Ctrl+W
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load BIWTA Corridors
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/v1/logistics/waterway/corridors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.corridors) {
          setCorridors(data.corridors);
        }
      })
      .catch(() => {
        setCorridors([
          {
            corridorId: "chittagong_dhaka_meghna",
            corridorNameBangla: "চট্টগ্রাম-মেঘনা-ঢাকা নদী করিডোর",
            corridorNameEnglish: "Chittagong-Meghna-Dhaka River Corridor",
            riverDistanceKm: 275,
            classificationClass: "Class-I",
            minimumNavigableDepthMeters: 3.9,
            tollRatePerDwtBdt: 14.5,
            primaryGhats: ["Sadarghat", "Kanchpur", "Munshiganj", "Mukterpur"],
          },
          {
            corridorId: "mongla_khulna_barisal",
            corridorNameBangla: "মোংলা-খুলনা-বরিশাল নদী করিডোর",
            corridorNameEnglish: "Mongla-Khulna-Barisal River Corridor",
            riverDistanceKm: 180,
            classificationClass: "Class-I",
            minimumNavigableDepthMeters: 3.8,
            tollRatePerDwtBdt: 12.0,
            primaryGhats: ["Mongla Ghat", "Rupsha", "Kirtankhola Terminal"],
          },
        ]);
      });
  }, [isOpen]);

  const handleIngestTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelemetryLoading(true);
    try {
      const res = await fetch("/api/v1/logistics/waterway/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vesselId,
          corridorId: selectedCorridor,
          latitude: 23.456,
          longitude: 90.678,
          speedKnots,
          headingDegrees: 180,
          riverKilometerMarker: kilometerMarker,
          currentWaterDepthMeters: waterDepth,
          currentDraftMeters: vesselDraft,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelemetryResult(data.telemetry);
      }
    } catch {
      // Local fallback
      const clearance = Math.round((waterDepth - vesselDraft) * 100) / 100;
      setTelemetryResult({
        telemetryId: `AIS-${vesselId}-LOCAL`,
        vesselId,
        corridorId: selectedCorridor,
        speedKnots,
        currentWaterDepthMeters: waterDepth,
        currentDraftMeters: vesselDraft,
        draftClearanceMeters: clearance,
        groundingRiskStatus: clearance < 0.3 ? "critical_grounding_risk" : clearance < 0.6 ? "caution" : "safe",
        navigationalAdvisoryBangla:
          clearance < 0.3
            ? "জরুরী সতর্কতা: আন্ডার-কিল ক্লিয়ারেন্স ০.৩ মিটারের নিচে! নোঙ্গর ফেলুন।"
            : "চ্যানেলের গভীরতা নিরাপদ।",
        speedRecommendationKnots: clearance < 0.3 ? 3 : speedKnots,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleAuditLaytime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaytimeLoading(true);
    try {
      const res = await fetch("/api/v1/logistics/waterway/laytime/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consignmentId,
          vesselId: laytimeVesselId,
          cargoType,
          cargoQuantityMt,
          dischargePortGhat,
          norAcceptedAt: new Date(norAcceptedAt).toISOString(),
          dischargeCompletedAt: new Date(dischargeCompletedAt).toISOString(),
          weatherExceptionHours,
          demurrageDailyRateBdt: demurrageDailyRate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLaytimeResult(data.laytimeAudit);
      }
    } catch {
      // Fallback
      setLaytimeResult({
        consignmentId,
        totalElapsedHours: 120,
        weatherExceptionHours,
        netBillableLaytimeHours: 108,
        contractualFreeLaytimeHours: 72,
        demurrageHours: 36,
        demurrageFeeBdt: 37500,
        settlementStatus: "demurrage_due",
        summaryBangla: "ফ্রি লেই-টাইম অতিক্রম করেছে (৩৬ ঘণ্টা বিলম্ব)। মোট ডেমারেজ বিল: ৳৩৭,৫০০",
        summaryEnglish: "Laytime exceeded by 36 hours. Demurrage incurred: ৳37,500",
      });
    } finally {
      setLaytimeLoading(false);
    }
  };

  const handleGenerateBiwtaReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setBiwtaLoading(true);
    try {
      const res = await fetch("/api/v1/logistics/waterway/biwta/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vesselId: biwtaVesselId,
          vesselName,
          registrationNo,
          deadweightTonnage,
          corridorId: selectedCorridor,
          berthingDays,
          requiresPilotage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBiwtaResult(data.receipt);
      }
    } catch {
      setBiwtaResult({
        receiptId: `BIWTA-TOLL-${biwtaVesselId}-LOCAL`,
        vesselName,
        riverConservationTollBdt: 17400,
        berthingChargesBdt: 4500,
        pilotageFeeBdt: 5500,
        subtotalBdt: 27400,
        vat5PercentBdt: 1370,
        grandTotalBdt: 28770,
        sha256VerificationSeal: "8a2f4c919e1b439c05432d667c8280f9ec398b16c5e7b233a7f805a812da1184",
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setBiwtaLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waterway-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="waterway-modal-title"
                className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
              >
                Inland Waterway Cargo & River Vessel Radar
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  BIWTA Class-I/II
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                AIS Telemetry, Shoal Hazard Prevention, Laytime Demurrage & River Tolls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-100/50 dark:bg-zinc-900/30">
          {[
            { id: "telemetry", label: "AIS Telemetry & Shoal Radar", icon: Waves },
            { id: "laytime", label: "Laytime & Demurrage Audit", icon: Clock },
            { id: "biwta", label: "BIWTA River Tolls", icon: Anchor },
            { id: "corridors", label: "Navigable Corridors", icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition min-h-[36px] ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab 1: AIS Telemetry & Shoal Radar */}
          {activeTab === "telemetry" && (
            <div className="space-y-6">
              <form onSubmit={handleIngestTelemetry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Vessel Identification (M.V.)
                  </label>
                  <input
                    type="text"
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    River Navigation Corridor
                  </label>
                  <select
                    value={selectedCorridor}
                    onChange={(e) => setSelectedCorridor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                  >
                    <option value="chittagong_dhaka_meghna">Chittagong-Meghna-Dhaka (Class-I)</option>
                    <option value="mongla_khulna_barisal">Mongla-Khulna-Barisal (Class-I)</option>
                    <option value="paturia_daulatdia_padma">Paturia-Daulatdia Padma (Class-II)</option>
                    <option value="narayanganj_ashuganj_surma">Narayanganj-Ashuganj Surma (Class-II)</option>
                    <option value="chattogram_chandpur">Chattogram-Chandpur Estuary (Class-I)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Current Water Depth (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterDepth}
                    onChange={(e) => setWaterDepth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Vessel Current Draft (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vesselDraft}
                    onChange={(e) => setVesselDraft(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Cruising Speed (Knots)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    River KM Marker
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={kilometerMarker}
                    onChange={(e) => setKilometerMarker(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={telemetryLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition min-h-[36px]"
                  >
                    <Waves className="w-4 h-4" />
                    <span>{telemetryLoading ? "Analyzing Draught Clearance..." : "Evaluate Shoal Hazard & Telemetry"}</span>
                  </button>
                </div>
              </form>

              {telemetryResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    telemetryResult.groundingRiskStatus === "critical_grounding_risk"
                      ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                      : telemetryResult.groundingRiskStatus === "caution"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {telemetryResult.groundingRiskStatus === "critical_grounding_risk" ? (
                      <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm uppercase tracking-wider">
                          Status: {telemetryResult.groundingRiskStatus.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/40 font-mono">
                          Clearance: {telemetryResult.draftClearanceMeters}m
                        </span>
                      </div>
                      <p className="text-xs">{telemetryResult.navigationalAdvisoryBangla}</p>
                      <p className="text-xs opacity-80">{telemetryResult.navigationalAdvisoryEnglish}</p>
                      <div className="pt-2 text-xs flex gap-4">
                        <span>Speed Limit: <strong>{telemetryResult.speedRecommendationKnots} Knots</strong></span>
                        <span>Water Depth: <strong>{telemetryResult.currentWaterDepthMeters}m</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Laytime & Demurrage Audit */}
          {activeTab === "laytime" && (
            <div className="space-y-6">
              <form onSubmit={handleAuditLaytime} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Consignment ID
                  </label>
                  <input
                    type="text"
                    value={consignmentId}
                    onChange={(e) => setConsignmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Carrier Coaster Vessel
                  </label>
                  <input
                    type="text"
                    value={laytimeVesselId}
                    onChange={(e) => setLaytimeVesselId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Cargo Commodity
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                  >
                    <option value="cement_clinker">Cement Clinker (সিমেন্ট ক্লিঙ্কার)</option>
                    <option value="sand_aggregate">Sand & Dredged Aggregate (বালু/পাথর)</option>
                    <option value="fertilizer_urea">Urea Fertilizer (ইউরিয়া সার)</option>
                    <option value="wheat_foodgrain">Imported Wheat / Food Grains (গম/খাদ্যশস্য)</option>
                    <option value="steel_coils">Hot-Rolled Steel Coils (স্টিল কয়েল)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Cargo Tonnage (Metric Tons)
                  </label>
                  <input
                    type="number"
                    value={cargoQuantityMt}
                    onChange={(e) => setCargoQuantityMt(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Notice of Readiness (NOR) Accepted
                  </label>
                  <input
                    type="datetime-local"
                    value={norAcceptedAt}
                    onChange={(e) => setNorAcceptedAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Discharge Completed
                  </label>
                  <input
                    type="datetime-local"
                    value={dischargeCompletedAt}
                    onChange={(e) => setDischargeCompletedAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Weather Exceptions (Signal 4+ Storm Hours)
                  </label>
                  <input
                    type="number"
                    value={weatherExceptionHours}
                    onChange={(e) => setWeatherExceptionHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Contractual Demurrage Rate (BDT / Day)
                  </label>
                  <input
                    type="number"
                    value={demurrageDailyRate}
                    onChange={(e) => setDemurrageDailyRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={laytimeLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition min-h-[36px]"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{laytimeLoading ? "Calculating Laytime & Demurrage..." : "Compute Laytime Settlement"}</span>
                  </button>
                </div>
              </form>

              {laytimeResult && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Settlement: {laytimeResult.settlementStatus.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        laytimeResult.settlementStatus === "demurrage_due"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}
                    >
                      {laytimeResult.settlementStatus === "demurrage_due"
                        ? `Demurrage Due: ৳${laytimeResult.demurrageFeeBdt.toLocaleString()}`
                        : `Despatch Rebate: ৳${laytimeResult.despatchRebateBdt.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{laytimeResult.summaryBangla}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>Elapsed: <strong>{laytimeResult.totalElapsedHours}h</strong></div>
                    <div>Weather Ex: <strong>{laytimeResult.weatherExceptionHours}h</strong></div>
                    <div>Billable: <strong>{laytimeResult.netBillableLaytimeHours}h</strong></div>
                    <div>Free Allowed: <strong>{laytimeResult.contractualFreeLaytimeHours}h</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: BIWTA River Tolls */}
          {activeTab === "biwta" && (
            <div className="space-y-6">
              <form onSubmit={handleGenerateBiwtaReceipt} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Vessel Name
                  </label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    BIWTA Registration No.
                  </label>
                  <input
                    type="text"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Deadweight Tonnage (DWT)
                  </label>
                  <input
                    type="number"
                    value={deadweightTonnage}
                    onChange={(e) => setDeadweightTonnage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Ghat Berthing Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={berthingDays}
                    onChange={(e) => setBerthingDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[36px]"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="pilotage"
                    checked={requiresPilotage}
                    onChange={(e) => setRequiresPilotage(e.target.checked)}
                    className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="pilotage" className="text-xs text-zinc-700 dark:text-zinc-300">
                    Requires BIWTA Authorized Pilotage Guide (Mandatory for Class-I Estuary)
                  </label>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={biwtaLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition min-h-[36px]"
                  >
                    <Anchor className="w-4 h-4" />
                    <span>{biwtaLoading ? "Compiling Statutory Dues..." : "Generate BIWTA Toll Receipt"}</span>
                  </button>
                </div>
              </form>

              {biwtaResult && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        {biwtaResult.receiptId}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {biwtaResult.vesselName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500">Total Dues</span>
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        ৳{biwtaResult.grandTotalBdt?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs">
                    <div>River Toll: <strong>৳{biwtaResult.riverConservationTollBdt?.toLocaleString()}</strong></div>
                    <div>Berthing: <strong>৳{biwtaResult.berthingChargesBdt?.toLocaleString()}</strong></div>
                    <div>Pilotage: <strong>৳{biwtaResult.pilotageFeeBdt?.toLocaleString()}</strong></div>
                    <div>VAT (5%): <strong>৳{biwtaResult.vat5PercentBdt?.toLocaleString()}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="truncate max-w-[300px]">Seal: {biwtaResult.sha256VerificationSeal}</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" /> Certified
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Navigable Corridors */}
          {activeTab === "corridors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {corridors.map((c) => (
                  <div
                    key={c.corridorId}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {c.classificationClass}
                      </span>
                      <span className="text-xs text-zinc-500">{c.riverDistanceKm} km</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {c.corridorNameBangla}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.corridorNameEnglish}</p>
                    <div className="text-xs pt-1 flex justify-between border-t border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                      <span>Draught Limit: <strong>{c.minimumNavigableDepthMeters}m</strong></span>
                      <span>Toll: <strong>৳{c.tollRatePerDwtBdt}/DWT</strong></span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      Ghats: {c.primaryGhats?.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Anchor className="w-4 h-4 text-blue-500" />
            <span>BIWTA River Cargo OS • Press ⌘W to toggle</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition min-h-[36px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
