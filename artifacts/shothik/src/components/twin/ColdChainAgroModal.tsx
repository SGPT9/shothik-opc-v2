"use client";

import React, { useState, useEffect } from "react";
import {
  ThermometerSnowflake,
  Send,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  X,
  FileCheck2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface ColdChainAgroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ColdChainShipmentUI {
  id: string;
  lotNumber: string;
  commodity: string;
  commodityNameBangla: string;
  originFarm: string;
  destinationMandi: string;
  quantityKg: number;
  totalValueBdt: number;
  advancePayoutBdt: number;
  balancePayoutBdt: number;
  farmerPhone: string;
  carrierName: string;
  vehiclePlate: string;
  status: "loaded" | "in_transit" | "arrived" | "settled" | "rejected";
  spoilageRiskIndex: number;
  excursionCount: number;
  gradeVerdict: string;
  readings: Array<{
    timestamp: string;
    temperatureCelsius: number;
    humidityPercent: number;
    locationName?: string;
  }>;
  sha256AuditSeal: string;
}

export const ColdChainAgroModal: React.FC<ColdChainAgroModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalA11y({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<"shipments" | "register" | "certificate">("shipments");
  const [shipments, setShipments] = useState<ColdChainShipmentUI[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ColdChainShipmentUI | null>(null);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Form State
  const [commodity, setCommodity] = useState<"mango" | "potato" | "tomato" | "strawberry" | "fish_hilsa">("mango");
  const [originFarm, setOriginFarm] = useState("Charghat Orchards, Rajshahi");
  const [destinationMandi, setDestinationMandi] = useState("Badamtoli Fruit Wholesale Market, Dhaka");
  const [quantityKg, setQuantityKg] = useState(3500);
  const [totalValueBdt, setTotalValueBdt] = useState(385000);
  const [farmerPhone, setFarmerPhone] = useState("01712345678");
  const [carrierName, setCarrierName] = useState("Bismillah Reefer Cold Transport");
  const [vehiclePlate, setVehiclePlate] = useState("Dhaka Metro-U-11-2045");

  // Keyboard shortcut ⌘A / Ctrl+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
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
      loadShipments();
    }
  }, [isOpen]);

  const loadShipments = async () => {
    try {
      const res = await fetch("/api/v1/agri/cold-chain/shipments");
      if (res.ok) {
        const data = await res.json();
        if (data.shipments) {
          setShipments(data.shipments);
          if (data.shipments.length > 0 && !selectedShipment) {
            setSelectedShipment(data.shipments[0]);
          }
        }
      }
    } catch {
      // Mock fallback data
      const mockList: ColdChainShipmentUI[] = [
        {
          id: "CC-MOCK-01",
          lotNumber: "LOT-MANGO-RAJ01",
          commodity: "mango",
          commodityNameBangla: "রাজশাহী হিমসাগর / ফজলি আম",
          originFarm: "Charghat Orchards, Rajshahi",
          destinationMandi: "Badamtoli Fruit Wholesale Market, Dhaka",
          quantityKg: 3500,
          totalValueBdt: 385000,
          advancePayoutBdt: 115500,
          balancePayoutBdt: 269500,
          farmerPhone: "01712345678",
          carrierName: "Bismillah Reefer Cold Transport",
          vehiclePlate: "Dhaka Metro-U-11-2045",
          status: "in_transit",
          spoilageRiskIndex: 0.12,
          excursionCount: 0,
          gradeVerdict: "Grade A (Prime)",
          readings: [
            { timestamp: new Date(Date.now() - 7200000).toISOString(), temperatureCelsius: 9.8, humidityPercent: 86, locationName: "Natore Bypass" },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), temperatureCelsius: 10.4, humidityPercent: 85, locationName: "Bangabandhu Bridge" },
          ],
          sha256AuditSeal: "a9f838bc89456214ef9892019ab921c567812903ab",
        },
      ];
      setShipments(mockList);
      setSelectedShipment(mockList[0]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    try {
      const res = await fetch("/api/v1/agri/cold-chain/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity,
          originFarm,
          destinationMandi,
          quantityKg: Number(quantityKg),
          totalValueBdt: Number(totalValueBdt),
          farmerPhone,
          carrierName,
          vehiclePlate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await loadShipments();
        setSelectedShipment(data.shipment);
        setActiveTab("shipments");
      } else {
        alert(data.error || "Failed to register cold chain shipment");
      }
    } catch {
      alert("Network error creating consignment");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSettle = async (shipmentId: string) => {
    try {
      const res = await fetch(`/api/v1/agri/cold-chain/shipments/${shipmentId}/settle`, {
        method: "POST",
      });
      if (res.ok) {
        await loadShipments();
      }
    } catch {
      // Mock settle
      setShipments((prev) =>
        prev.map((s) => (s.id === shipmentId ? { ...s, status: "settled" } : s)),
      );
    }
  };

  const handleViewCertificate = async (shipmentId: string) => {
    try {
      const res = await fetch(`/api/v1/agri/cold-chain/shipments/${shipmentId}/vat-exemption`);
      if (res.ok) {
        const data = await res.json();
        setCertificateData(data.certificate);
        setActiveTab("certificate");
      }
    } catch {
      setCertificateData({
        certificateId: "VAT-EXEMPT-SEC26-MOCK89",
        statutoryRule: "NBR VAT & SD Act 2012, Section 26, First Schedule (Unprocessed Farm Produce)",
        vatRatePercent: 0,
        totalExemptAmountBdt: selectedShipment?.totalValueBdt || 385000,
        digitalSeal: "9f8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a",
      });
      setActiveTab("certificate");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cold-chain-agro-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cold-chain-agro-modal-title" className="font-semibold text-base text-slate-100">
                  Cold Chain Telemetry & Farm-to-Table Traceability
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Agri Mandi Network
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IoT Reefer Telemetry · Arrhenius Spoilage Kinetic Index · 30/70 Milestone Escrow · NBR Sec 26 Exemption
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab("shipments")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "shipments"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Consignments
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "register"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Register Lot
            </button>
            <button
              onClick={() => setActiveTab("certificate")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition min-h-[36px] ${
                activeTab === "certificate"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" /> NBR Certificate
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
          {/* TAB 1: CONSIGNMENTS & TELEMETRY */}
          {activeTab === "shipments" && (
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Left Column: Shipment List */}
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Active Reefer Transports ({shipments.length})
                </div>
                {shipments.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShipment(s)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      selectedShipment?.id === s.id
                        ? "bg-slate-900 border-emerald-500/80 shadow-md"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-emerald-300">
                        {s.commodity}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono uppercase ${
                          s.status === "settled"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : s.status === "in_transit"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <h5 className="font-semibold text-sm text-slate-100 mt-2">{s.commodityNameBangla}</h5>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Lot: {s.lotNumber}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span>{(s.quantityKg / 1000).toFixed(1)} MT</span>
                      <span className="font-semibold text-slate-200">৳{s.totalValueBdt.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Detailed Telemetry & Escrow */}
              {selectedShipment && (
                <div className="col-span-2 space-y-5">
                  {/* Quality & Spoilage Header Card */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Arrhenius Spoilage Risk Index (SRI)</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-bold text-slate-100 font-mono">
                          {selectedShipment.spoilageRiskIndex}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            selectedShipment.spoilageRiskIndex < 0.25
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : selectedShipment.spoilageRiskIndex < 0.55
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {selectedShipment.gradeVerdict}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Excursions: {selectedShipment.excursionCount} breaches outside thermal envelope
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCertificate(selectedShipment.id)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition min-h-[36px]"
                      >
                        NBR Certificate
                      </button>
                      {selectedShipment.status !== "settled" && (
                        <button
                          onClick={() => handleSettle(selectedShipment.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow min-h-[36px]"
                        >
                          Settle Mandi Arrival
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Escrow Milestone Settlement Box */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">30% Loading Advance</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        ৳{selectedShipment.advancePayoutBdt.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Disbursed to Farm Gate</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">70% Mandi Escrow Balance</div>
                      <div className="text-lg font-bold text-cyan-400 mt-1">
                        ৳{selectedShipment.balancePayoutBdt.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Released upon Seal Check</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">Total Lot Value</div>
                      <div className="text-lg font-bold text-slate-100 mt-1">
                        ৳{selectedShipment.totalValueBdt.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">0% VAT under Section 26</div>
                    </div>
                  </div>

                  {/* Telemetry Sensor Log */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-slate-200">IoT Sensor Telemetry Log</h4>
                      <span className="text-xs text-slate-400">BLE/RFID Compartment Sensors</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedShipment.readings.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-300 font-mono">
                              {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-slate-400">· {r.locationName || "Transit Waypoint"}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-mono text-emerald-400 font-medium">
                              {r.temperatureCelsius}°C
                            </span>
                            <span className="font-mono text-cyan-400 font-medium">
                              {r.humidityPercent}% RH
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTER LOT */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="max-w-2xl mx-auto p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="font-semibold text-sm text-slate-200">Register New Farm-to-Mandi Shipment</h4>
                <p className="text-xs text-slate-400">
                  Locks 30% loading advance escrow and initializes Reefer compartment telemetry tracking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Agro-Commodity</label>
                  <select
                    value={commodity}
                    onChange={(e: any) => setCommodity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                  >
                    <option value="mango">Rajshahi Mangoes (8 - 12°C)</option>
                    <option value="potato">Bogra Seed Potatoes (3 - 7°C)</option>
                    <option value="tomato">Jessore Tomatoes (10 - 14°C)</option>
                    <option value="strawberry">Dinajpur Strawberries (0 - 4°C)</option>
                    <option value="fish_hilsa">Chandpur Hilsa Fish (-2 - 2°C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantity (Kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Origin Farm Location</label>
                  <input
                    type="text"
                    value={originFarm}
                    onChange={(e) => setOriginFarm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination Wholesale Mandi</label>
                  <input
                    type="text"
                    value={destinationMandi}
                    onChange={(e) => setDestinationMandi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total Lot Value (BDT)</label>
                  <input
                    type="number"
                    value={totalValueBdt}
                    onChange={(e) => setTotalValueBdt(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Farmer bKash Phone</label>
                  <input
                    type="text"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Vehicle Plate No</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[36px]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 min-h-[36px]"
              >
                <Send className="w-4 h-4" />
                {registerLoading ? "Locking Escrow..." : "Register Lot & Disburse 30% Advance"}
              </button>
            </form>
          )}

          {/* TAB 3: NBR SECTION 26 CERTIFICATE */}
          {activeTab === "certificate" && (
            <div className="max-w-2xl mx-auto p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-semibold text-sm text-slate-200">
                    NBR Statutory Agricultural Exemption Certificate
                  </h4>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  0% Statutory VAT
                </span>
              </div>

              {certificateData ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Certificate ID</span>
                    <span className="font-mono text-emerald-300 font-semibold">{certificateData.certificateId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Governing Law</span>
                      <span className="text-slate-300">{certificateData.statutoryRule}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Exempt Valuation</span>
                      <span className="font-semibold text-slate-100 text-sm">
                        ৳{certificateData.totalExemptAmountBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                    SHA-256 Seal: {certificateData.digitalSeal}
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg text-slate-400 italic">
                    Certified compliant under Section 26 of the Value Added Tax and Supplementary Duty Act 2012 for
                    unmanufactured farm produce transported under refrigerated cold chain.
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  Select a consignment to view its certified NBR exemption dossier.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColdChainAgroModal;
