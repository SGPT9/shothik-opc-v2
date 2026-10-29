"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Send,
  Battery,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  X,
  Radio,
  Zap,
} from "lucide-react";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface HyperlocalFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface VehicleUI {
  id: string;
  name: string;
  type: "cargo_bike" | "drone";
  status: "available" | "in_transit" | "charging" | "maintenance" | "rtb";
  batteryPercent: number;
  maxPayloadGrams: number;
  maxRangeKm: number;
  currentLocation: { lat: number; lng: number; corridor: string };
  odometerKm: number;
}

export interface CorridorUI {
  id: string;
  name: string;
  division: string;
  baseDistanceKmFromHub: number;
  currentTrafficMultiplier: number;
  droneFlightAllowed: boolean;
  weather: string;
}

export const HyperlocalFleetModal: React.FC<HyperlocalFleetModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalA11y({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<"fleet" | "dispatch" | "corridors">("fleet");
  const [vehicles, setVehicles] = useState<VehicleUI[]>([]);
  const [corridors, setCorridors] = useState<CorridorUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  // Dispatch Form State
  const [originHub, setOriginHub] = useState("hub_gulshan_01");
  const [destCorridor, setDestCorridor] = useState("corridor_gulshan_banani");
  const [destAddress, setDestAddress] = useState("House 12, Road 7, Banani");
  const [recipientName, setRecipientName] = useState("Tanvir Ahmed");
  const [recipientPhone, setRecipientPhone] = useState("01711223344");
  const [weightGrams, setWeightGrams] = useState(1200);
  const [isUrgent, setIsUrgent] = useState(true);
  const [codAmount, setCodAmount] = useState(2500);

  // Keyboard shortcut ⌘H / Ctrl+H
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Initial Data Load
  useEffect(() => {
    if (isOpen) {
      loadFleetData();
    }
  }, [isOpen]);

  const loadFleetData = async () => {
    try {
      setLoading(true);
      const [vRes, cRes] = await Promise.all([
        fetch("/api/v1/logistics/hyperlocal-fleet/vehicles"),
        fetch("/api/v1/logistics/hyperlocal-fleet/corridors"),
      ]);

      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.vehicles) setVehicles(vData.vehicles);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.corridors) setCorridors(cData.corridors);
      }
    } catch {
      // Fallback local mock data
      setVehicles([
        {
          id: "BIKE-DHK-01",
          name: "VoltCargo Bike 01 (Gulshan)",
          type: "cargo_bike",
          status: "available",
          batteryPercent: 92,
          maxPayloadGrams: 25000,
          maxRangeKm: 35,
          currentLocation: { lat: 23.7925, lng: 90.4078, corridor: "Gulshan-Banani" },
          odometerKm: 342,
        },
        {
          id: "DRONE-DHK-01",
          name: "AeroExpress Falcon-2 (Gulshan SkyPad)",
          type: "drone",
          status: "available",
          batteryPercent: 95,
          maxPayloadGrams: 1800,
          maxRangeKm: 8,
          currentLocation: { lat: 23.7925, lng: 90.4078, corridor: "Gulshan-Banani" },
          odometerKm: 128,
        },
      ]);
      setCorridors([
        {
          id: "corridor_gulshan_banani",
          name: "Gulshan - Banani - Baridhara Corridor",
          division: "Dhaka",
          baseDistanceKmFromHub: 3.5,
          currentTrafficMultiplier: 1.4,
          droneFlightAllowed: true,
          weather: "clear",
        },
        {
          id: "corridor_dhanmondi",
          name: "Dhanmondi - Mohammadpur Corridor",
          division: "Dhaka",
          baseDistanceKmFromHub: 4.8,
          currentTrafficMultiplier: 1.8,
          droneFlightAllowed: true,
          weather: "clear",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchLoading(true);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/v1/logistics/hyperlocal-fleet/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originHubId: originHub,
          destinationCorridor: destCorridor,
          destinationAddress: destAddress,
          recipientName,
          recipientPhone,
          weightGrams: Number(weightGrams),
          isUrgent,
          codAmountBdt: Number(codAmount),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchResult(data);
        await loadFleetData();
      } else {
        alert(data.error || "Failed to dispatch parcel");
      }
    } catch {
      // Mock result
      setDispatchResult({
        dispatchId: "DSP-LOCAL-MOCK",
        dispatchType: weightGrams > 2000 ? "internal_fleet" : "internal_fleet",
        vehicle: {
          id: "DRONE-DHK-01",
          name: "AeroExpress Falcon-2",
          type: "drone",
          remainingBatteryPercent: 88,
        },
        estimatedMinutes: 12,
        costBdt: 135,
        distanceKm: 3.5,
        trafficMultiplier: 1.4,
        consignmentTrackingCode: "HYP-DRONE-MOCK88",
        notes: "Dispatched via Autonomous Line-of-Sight Micro-Drone to Gulshan.",
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleTriggerRtb = async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/v1/logistics/hyperlocal-fleet/vehicles/${vehicleId}/rtb`, {
        method: "POST",
      });
      if (res.ok) {
        await loadFleetData();
      }
    } catch {
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, status: "rtb" } : v)),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hyperlocal-fleet-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="hyperlocal-fleet-modal-title" className="font-semibold text-base text-slate-100">
                  Hyperlocal Delivery Fleet & Drone Dispatch
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Dhaka & Chittagong Mesh
                </span>
              </div>
              <p className="text-xs text-slate-400">
                VoltCargo Electric Bikes · AeroExpress Micro-Drones · Multi-Carrier Overflow Fallback
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab("fleet")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "fleet"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" /> Fleet Cockpit
            </button>
            <button
              onClick={() => setActiveTab("dispatch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "dispatch"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Console
            </button>
            <button
              onClick={() => setActiveTab("corridors")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "corridors"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Urban Corridors
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: FLEET COCKPIT */}
          {activeTab === "fleet" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Active Units</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">{vehicles.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Available For Dispatch</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {vehicles.filter((v) => v.status === "available").length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">In Transit</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {vehicles.filter((v) => v.status === "in_transit").length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Charging / RTB</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {vehicles.filter((v) => v.status === "charging" || v.status === "rtb").length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-mono uppercase ${
                              v.type === "drone"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {v.type === "drone" ? "Micro-Drone" : "Cargo Bike"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-mono uppercase ${
                              v.status === "available"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : v.status === "in_transit"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Battery className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{v.batteryPercent}% SOC</span>
                        </div>
                      </div>

                      <h4 className="font-semibold text-base text-slate-100 mt-3">{v.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {v.id}</p>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-slate-400">
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <span className="block text-[10px] text-slate-500">Max Payload</span>
                          <span className="font-medium text-slate-200">
                            {(v.maxPayloadGrams / 1000).toFixed(1)} kg
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <span className="block text-[10px] text-slate-500">Range</span>
                          <span className="font-medium text-slate-200">{v.maxRangeKm} km</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <span className="block text-[10px] text-slate-500">Odometer</span>
                          <span className="font-medium text-slate-200">{v.odometerKm} km</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {v.currentLocation.corridor}
                      </span>
                      {v.status !== "rtb" && (
                        <button
                          onClick={() => handleTriggerRtb(v.id)}
                          className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded border border-amber-500/30 transition min-h-[36px]"
                        >
                          Trigger RTB
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DISPATCH CONSOLE */}
          {activeTab === "dispatch" && (
            <div className="grid grid-cols-3 gap-6">
              {/* Dispatch Form */}
              <form
                onSubmit={handleDispatch}
                className="col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
              >
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="font-semibold text-sm text-slate-200">New Hyperlocal Consignment</h4>
                  <p className="text-xs text-slate-400">
                    Input delivery requirements to calculate optimal vehicle or trigger courier fallback.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Origin Express Hub</label>
                    <select
                      value={originHub}
                      onChange={(e) => setOriginHub(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    >
                      <option value="hub_gulshan_01">Gulshan-2 Central Express Hub</option>
                      <option value="hub_dhanmondi_01">Dhanmondi 27 Micro-Hub</option>
                      <option value="hub_uttara_01">Uttara Sector 11 Air & Bike Node</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Destination Corridor</label>
                    <select
                      value={destCorridor}
                      onChange={(e) => setDestCorridor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    >
                      {corridors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.currentTrafficMultiplier}x traffic)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Recipient Destination Address</label>
                  <input
                    type="text"
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Weight (grams)</label>
                    <input
                      type="number"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                      min="50"
                      max="50000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">COD Amount (BDT)</label>
                    <input
                      type="number"
                      value={codAmount}
                      onChange={(e) => setCodAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 py-2">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-600"
                      />
                      <span>Urgent Express Delivery</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={dispatchLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 min-h-[36px]"
                >
                  <Send className="w-4 h-4" />
                  {dispatchLoading ? "Calculating Route..." : "Dispatch Hyperlocal Parcel"}
                </button>
              </form>

              {/* Dispatch Output Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">Dispatch Telemetry & Route</h4>
                  <p className="text-xs text-slate-400 mb-4">Live routing evaluation result.</p>

                  {dispatchResult ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase">Dispatch Type</div>
                        <div className="font-semibold text-xs text-cyan-300 mt-0.5">
                          {dispatchResult.dispatchType === "internal_fleet"
                            ? "Autonomous Internal Fleet"
                            : "3rd-Party Overflow Fallback"}
                        </div>
                      </div>

                      {dispatchResult.vehicle && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase">Assigned Unit</div>
                          <div className="font-semibold text-xs text-slate-200 mt-0.5">
                            {dispatchResult.vehicle.name} ({dispatchResult.vehicle.type})
                          </div>
                        </div>
                      )}

                      {dispatchResult.fallbackCarrier && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="text-[10px] text-amber-400 uppercase">Fallback Carrier</div>
                          <div className="font-semibold text-xs text-amber-300 mt-0.5 uppercase">
                            {dispatchResult.fallbackCarrier} API Auto-Booked
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-[10px] text-slate-500 block">Est. Delivery</span>
                          <span className="font-medium text-emerald-400">
                            {dispatchResult.estimatedMinutes} mins
                          </span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded">
                          <span className="text-[10px] text-slate-500 block">Cost (BDT)</span>
                          <span className="font-medium text-slate-200">৳{dispatchResult.costBdt}</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-400 break-all">
                        Tracking: {dispatchResult.consignmentTrackingCode}
                      </div>

                      <p className="text-xs text-slate-400 italic">{dispatchResult.notes}</p>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <Radio className="w-8 h-8 mb-2 opacity-50" />
                      Awaiting consignment parameters...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CORRIDORS */}
          {activeTab === "corridors" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-semibold text-sm text-slate-200">Urban Geofenced Delivery Corridors</h4>
                <p className="text-xs text-slate-400">
                  Live traffic multipliers and Civil Aviation Authority Bangladesh (CAAB) flight zones.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {corridors.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{c.division}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono ${
                          c.currentTrafficMultiplier > 2.0
                            ? "bg-red-500/20 text-red-300"
                            : c.currentTrafficMultiplier > 1.4
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {c.currentTrafficMultiplier}x Traffic
                      </span>
                    </div>

                    <h5 className="font-medium text-sm text-slate-100 mt-2">{c.name}</h5>
                    <p className="text-xs text-slate-400 mt-1">Base Distance: {c.baseDistanceKmFromHub} km</p>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Airspace Status:</span>
                      <span
                        className={`font-medium ${
                          c.droneFlightAllowed ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {c.droneFlightAllowed ? "Drones Permitted" : "No-Fly (Ground Only)"}
                      </span>
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

export default HyperlocalFleetModal;
