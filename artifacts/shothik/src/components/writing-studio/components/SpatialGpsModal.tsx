import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Navigation,
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Ship,
  Train,
  Footprints,
  Car,
  CloudRain,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileText
} from "lucide-react";

interface GeoLocation {
  id: string;
  name: string;
  nameBn: string;
  category: "urban" | "riverine" | "forest" | "highland" | "coastal";
  lat: number;
  lng: number;
  description: string;
}

interface TransitMode {
  id: string;
  label: string;
  labelBn: string;
  speedKmh: number;
  allowedTerrains: string[];
  maxRangeKm: number;
  sensoryFootprint: string;
}

interface ActiveJourney {
  id: string;
  character: string;
  origin: string;
  destination: string;
  transitMode: string;
  departureTime: string;
  estimatedArrival: string;
  distanceKm: number;
  claimedDurationHours: number;
  realisticDurationHours: number;
  anomalyDetected: boolean;
  anomalySeverity: "none" | "minor_delay" | "physically_impossible" | "chronological_paradox";
  anomalyMessage: string;
  generatedProse: string;
}

interface SpatialGpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const SpatialGpsModal: React.FC<SpatialGpsModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"journeys" | "calculator" | "waypoints">("journeys");
  const [locations, setLocations] = useState<GeoLocation[]>([]);
  const [transitModes, setTransitModes] = useState<TransitMode[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<ActiveJourney[]>([]);
  const [temporalCycle, setTemporalCycle] = useState<{
    diegeticTime: string;
    solarAngle: number;
    moonPhase: string;
    visibility: string;
  } | null>(null);

  // Form states for calculator
  const [origin, setOrigin] = useState("Sadarghat River Terminal");
  const [destination, setDestination] = useState("Barisal Rocket Steamer Ghat");
  const [transitMode, setTransitMode] = useState("river_launch");
  const [departureTime, setDepartureTime] = useState("21:30");
  const [claimedDuration, setClaimedDuration] = useState("8.5");
  const [weather, setWeather] = useState("calm");
  const [calculating, setCalculating] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch(`/api/v1/projects/${projectId}/spatial-gps`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLocations(data.locations || []);
          setTransitModes(data.transitModes || []);
          setActiveJourneys(data.activeJourneys || []);
          setTemporalCycle(data.temporalCycle || null);
        }
      })
      .catch((err) => console.error("Failed to load spatial GPS state:", err));
  }, [isOpen, projectId]);

  const handleAuditCalculate = () => {
    setCalculating(true);
    fetch(`/api/v1/projects/${projectId}/spatial-gps/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        transitMode,
        departureTime,
        claimedDurationHours: claimedDuration ? parseFloat(claimedDuration) : undefined,
        weather
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setCalculating(false);
        if (data.success) {
          setAuditResult(data.audit);
        }
      })
      .catch((err) => {
        setCalculating(false);
        console.error("Audit calculation failed:", err);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Interactive Map & Spatial Timeline GPS
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Capability #34
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                ভৌগোলিক দূরত্ব, ট্রানজিট গতি ও স্থান-কাল অসঙ্গতি নিরীক্ষক (Transit Physics & Day/Night Auditor)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Diegetic Environment Ribbon */}
        {temporalCycle && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-emerald-950/20 border-b border-emerald-900/30 text-xs text-emerald-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                কাহিনির বর্তমান প্রহর: {temporalCycle.diegeticTime}
              </span>
              <span className="flex items-center gap-1 text-neutral-400">
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                চন্দ্রকলা: {temporalCycle.moonPhase}
              </span>
              <span className="flex items-center gap-1 text-neutral-400">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                আবহাওয়া ও দৃশ্যমানতা: {temporalCycle.visibility}
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400/80">
              Solar Zenith: {temporalCycle.solarAngle}° (অদৃশ্য সূর্য)
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab("journeys")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "journeys"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Navigation className="w-4 h-4" />
            Active Journeys & Anomalies ({activeJourneys.length})
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "calculator"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Compass className="w-4 h-4" />
            Route Distance & Physics Auditor
          </button>
          <button
            onClick={() => setActiveTab("waypoints")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "waypoints"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            World Atlas & Waypoints ({locations.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ACTIVE JOURNEYS */}
          {activeTab === "journeys" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  কাহিনির বর্তমান সক্রিয় যাত্রা ও ট্রানজিট নিরীক্ষা (Active Chapter Journeys)
                </h3>
                <span className="text-xs text-neutral-400">
                  {activeJourneys.filter((j) => j.anomalyDetected).length} টি অসঙ্গতি সনাক্ত
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {activeJourneys.map((jrn) => (
                  <div
                    key={jrn.id}
                    className={`p-5 rounded-xl border transition-all ${
                      jrn.anomalySeverity === "chronological_paradox"
                        ? "bg-red-950/20 border-red-500/40 hover:border-red-500/60"
                        : jrn.anomalySeverity === "physically_impossible"
                        ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60"
                        : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-100 text-sm">
                            {jrn.character}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {jrn.transitMode.replace("_", " ").toUpperCase()}
                          </span>
                          {jrn.anomalyDetected ? (
                            <span
                              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                                jrn.anomalySeverity === "chronological_paradox"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {jrn.anomalySeverity === "chronological_paradox"
                                ? "সময়-ভ্রমণ প্যারাডক্স (Impossible)"
                                : "ভৌগোলিক সীমাবদ্ধতা"}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              পদার্থবিজ্ঞানসম্মত (Consistent)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span className="text-neutral-200">{jrn.origin}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-neutral-200">{jrn.destination}</span>
                          <span className="text-neutral-500">•</span>
                          <span>দূরত্ব: {jrn.distanceKm} কিমি</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono text-emerald-400">
                          রওনা: {jrn.departureTime} → পৌঁছানো: {jrn.estimatedArrival}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          বাস্তব সময়: {jrn.realisticDurationHours}h | পাণ্ডুলিপির দাবি:{" "}
                          {jrn.claimedDurationHours}h
                        </div>
                      </div>
                    </div>

                    {/* Anomaly banner if detected */}
                    {jrn.anomalyDetected && (
                      <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-900/50 text-xs text-red-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">অসঙ্গতি সতর্কতা: </span>
                          {jrn.anomalyMessage}
                        </div>
                      </div>
                    )}

                    {/* Atmospheric generated prose */}
                    <div className="mt-3 p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-serif italic">
                      "{jrn.generatedProse}"
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInsertProse?.(jrn.generatedProse)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        পাণ্ডুলিপিতে যাত্রা দৃশ্য যোগ করুন (Insert Prose)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATOR & AUDITOR */}
          {activeTab === "calculator" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  নতুন যাত্রার স্থান-কাল ও গতি নিরীক্ষক (Transit Physics Calculator)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      যাত্রার প্রারম্ভ (Origin Location)
                    </label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      গন্তব্যস্থল (Destination Location)
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transit Mode */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      পরিবহন মাধ্যম (Transit Mode)
                    </label>
                    <select
                      value={transitMode}
                      onChange={(e) => setTransitMode(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      {transitModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label} ({mode.labelBn}) — {mode.speedKmh} km/h
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Departure Time */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      রওনার সময় (Diegetic Departure Time, 24h)
                    </label>
                    <input
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="e.g. 21:30"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Claimed Duration */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      পাণ্ডুলিপিতে দাবি করা সময় (Claimed Duration in Hours)
                    </label>
                    <input
                      type="text"
                      value={claimedDuration}
                      onChange={(e) => setClaimedDuration(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Weather Condition */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      আবহাওয়ার পরিস্থিতি (Weather Conditions)
                    </label>
                    <select
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="calm">স্বাভাবিক শান্ত আবহাওয়া (Calm Weather)</option>
                      <option value="monsoon_flood">বর্ষার ঢল ও প্রতিকূল স্রোত (+45% Delay)</option>
                      <option value="heavy_fog">ঘন কুয়াশা ও নদী পথ অস্পষ্ট (+30% Delay)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAuditCalculate}
                    disabled={calculating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {calculating ? "গতি ও সময় গণনা হচ্ছে..." : "পদার্থবিজ্ঞানসম্মত ট্রানজিট অডিট চালান (Audit Physics)"}
                  </button>
                </div>
              </div>

              {/* Audit Result Display */}
              {auditResult && (
                <div className="p-5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-100 text-sm">
                        নিরীক্ষা ফলাফল (Audit Report)
                      </span>
                      {auditResult.anomalyDetected ? (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {auditResult.anomalySeverity}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          সম্পূর্ণ যৌক্তিক ও প্রাকৃতিক
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-emerald-400">
                      আনুমানিক পৌঁছানোর সময়: {auditResult.estimatedArrival}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500">প্রকৃত দূরত্ব (Detour Adjusted)</span>
                      <p className="text-base font-bold text-neutral-200 mt-1">
                        {auditResult.distanceKm} km
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500">বাস্তব প্রয়োজনীয় সময়</span>
                      <p className="text-base font-bold text-emerald-400 mt-1">
                        {auditResult.realisticDurationHours} hours
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500">পরিবহন মাধ্যম গতি</span>
                      <p className="text-base font-bold text-cyan-400 mt-1">
                        {auditResult.mode?.speedKmh} km/h
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-500">সর্বোচ্চ কার্যক্ষম দূরত্ব</span>
                      <p className="text-base font-bold text-neutral-200 mt-1">
                        {auditResult.mode?.maxRangeKm} km
                      </p>
                    </div>
                  </div>

                  {auditResult.anomalyDetected && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-xs text-red-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>{auditResult.anomalyMessage}</div>
                    </div>
                  )}

                  {/* Generated Prose */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-neutral-400">
                      প্রস্তুতকৃত স্থান-কাল পরিবেশ দৃশ্য (Generated Sensory Journey Prose):
                    </span>
                    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-serif leading-relaxed italic">
                      "{auditResult.generatedProse}"
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onInsertProse?.(auditResult.generatedProse)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      এই দৃশ্যটি পাণ্ডুলিপিতে যোগ করুন (Inject Scene)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WAYPOINTS MATRIX */}
          {activeTab === "waypoints" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  বিশ্বের ভৌগোলিক স্থান ও পরিবেশ ডিরেক্টরি (World Atlas & Waypoints)
                </h3>
                <span className="text-xs text-neutral-400">মোট স্থান: {locations.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-neutral-100">{loc.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {loc.category.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-emerald-400/90">{loc.nameBn}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{loc.description}</p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono border-t border-neutral-800/60">
                      <span>Latitude: {loc.lat}° N</span>
                      <span>Longitude: {loc.lng}° E</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
