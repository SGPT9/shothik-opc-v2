"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Award,
  DollarSign,
  FileCheck2,
  X,
  TrendingUp,
  MapPin,
  Scale,
  Sparkles,
  ShieldCheck,
  Building2,
  Layers,
  Droplets,
  Boxes,
  ScrollText,
} from "lucide-react";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface JuteExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JuteExportModal: React.FC<JuteExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalA11y({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<"grading" | "costing" | "subsidy" | "bonded">("grading");

  // Raw Jute Grading State
  const [lotId, setLotId] = useState("LOT-FBD-2026-881");
  const [variety, setVariety] = useState<"Bangla Tossa" | "Bangla White">("Bangla Tossa");
  const [gradeCode, setGradeCode] = useState("BT_SPECIAL");
  const [grossWeightKg, setGrossWeightKg] = useState(18000);
  const [moisturePercent, setMoisturePercent] = useState(13.5);
  const [rootCuttingPercent, setRootCuttingPercent] = useState(4.0);
  const [aratLocation, setAratLocation] = useState("Faridpur");
  const [gradingResult, setGradingResult] = useState<any | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  // DJG Costing State
  const [productType, setProductType] = useState<"HESSIAN_CLOTH" | "SACKING_BAGS" | "CARPET_BACKING_CLOTH" | "DIVERSIFIED_SHOPPING_BAGS" | "GEO_TEXTILES" | "JUTE_ESPADRILLES">("DIVERSIFIED_SHOPPING_BAGS");
  const [targetUnits, setTargetUnits] = useState(5000);
  const [costingResult, setCostingResult] = useState<any | null>(null);
  const [costingLoading, setCostingLoading] = useState(false);

  // Export Cash Subsidy State
  const [invoiceNumber, setInvoiceNumber] = useState("EXP-DJG-2026-901");
  const [fobValueUsd, setFobValueUsd] = useState(45000);
  const [productCategory, setProductCategory] = useState<"DIVERSIFIED_JUTE_GOODS" | "JUTE_YARN_TWINE" | "TRADITIONAL_JUTE_GOODS" | "RAW_JUTE">("DIVERSIFIED_JUTE_GOODS");
  const [hasValidPrc, setHasValidPrc] = useState(true);
  const [hasEpbRegistration, setHasEpbRegistration] = useState(true);
  const [subsidyResult, setSubsidyResult] = useState<any | null>(null);
  const [subsidyLoading, setSubsidyLoading] = useState(false);

  // NBR Bonded Warehouse State
  const [buyerName, setBuyerName] = useState("EcoTex Global GmbH");
  const [destinationCountry, setDestinationCountry] = useState("Germany");
  const [bondedResult, setBondedResult] = useState<any | null>(null);
  const [bondedLoading, setBondedLoading] = useState(false);

  // Keyboard shortcut Ctrl+J or Cmd+J
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleGradeLot = async () => {
    setGradingLoading(true);
    try {
      const res = await fetch("/api/v1/trade/jute/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId,
          variety,
          gradeCode,
          grossWeightKg: Number(grossWeightKg),
          moisturePercent: Number(moisturePercent),
          rootCuttingPercent: Number(rootCuttingPercent),
          aratLocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGradingResult(data.data);
      }
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleCalculateCosting = async () => {
    setCostingLoading(true);
    try {
      const res = await fetch("/api/v1/trade/jute/costing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType,
          targetUnits: Number(targetUnits),
          rawJuteGradeCode: gradeCode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCostingResult(data.data);
      }
    } catch (err) {
      console.error("Costing failed:", err);
    } finally {
      setCostingLoading(false);
    }
  };

  const handleCalculateSubsidy = async () => {
    setSubsidyLoading(true);
    try {
      const res = await fetch("/api/v1/trade/jute/subsidy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          fobValueUsd: Number(fobValueUsd),
          exchangeRateUsdToBdt: 122.5,
          productCategory,
          localValueAdditionPercent: 88.5,
          hasValidPrc,
          hasEpbRegistration,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubsidyResult(data.data);
      }
    } catch (err) {
      console.error("Subsidy calculation failed:", err);
    } finally {
      setSubsidyLoading(false);
    }
  };

  const handleGenerateBondedDossier = async () => {
    setBondedLoading(true);
    try {
      const res = await fetch("/api/v1/trade/jute/bonded-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: `SHP-JUTE-${Date.now().toString().slice(-6)}`,
          buyerName,
          destinationCountry,
          portOfLoading: "Chittagong Port",
          hsCode: "6305.10.00",
          productDescription: "100% Biodegradable Diversified Jute Goods",
          totalNetWeightKg: gradingResult ? gradingResult.netMarketableWeightKg : 18000,
          totalPuccaBales: gradingResult ? gradingResult.puccaExportBalesYield : 100,
          fobValueUsd: Number(fobValueUsd),
          bondLicenseNumber: "NBR-BOND-JUTE-902/2026",
          rawJuteLotRef: lotId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBondedResult(data.data);
      }
    } catch (err) {
      console.error("Bonded dossier generation failed:", err);
    } finally {
      setBondedLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="jute-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-neutral-900 border border-amber-500/30 shadow-2xl overflow-hidden text-neutral-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="jute-modal-title" className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                  সোনালী আঁশ · Golden Fiber & Jute Export Studio
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  BJMC / EPB 12% Subsidy
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Raw Jute Grading, Pucca Hydraulic Baling, DJG Conversion Costing & NBR Bonded Warehouse Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("grading")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors min-h-[36px] ${
              activeTab === "grading"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            Raw Jute Grading & Baling
          </button>
          <button
            onClick={() => setActiveTab("costing")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors min-h-[36px] ${
              activeTab === "costing"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Boxes className="w-4 h-4" />
            DJG Manufacturing Yield
          </button>
          <button
            onClick={() => setActiveTab("subsidy")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors min-h-[36px] ${
              activeTab === "subsidy"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            12% Export Cash Subsidy
          </button>
          <button
            onClick={() => setActiveTab("bonded")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors min-h-[36px] ${
              activeTab === "bonded"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            NBR Bonded Dossier
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "grading" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Lot ID / চালান কোড</label>
                  <input
                    type="text"
                    value={lotId}
                    onChange={(e) => setLotId(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Variety / জাত</label>
                  <select
                    value={variety}
                    onChange={(e) => {
                      const v = e.target.value as any;
                      setVariety(v);
                      setGradeCode(v === "Bangla Tossa" ? "BT_SPECIAL" : "BW_SPECIAL");
                    }}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Bangla Tossa">Bangla Tossa (তোষা পাট)</option>
                    <option value="Bangla White">Bangla White (সাদা/দেশী পাট)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Grade Code / গ্রেড</label>
                  <select
                    value={gradeCode}
                    onChange={(e) => setGradeCode(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    {variety === "Bangla Tossa" ? (
                      <>
                        <option value="BT_SPECIAL">Bangla Tossa Special (৳4,200/মন - ৳105/কেজি)</option>
                        <option value="BT_A">Bangla Tossa Grade-A (৳3,800/মন - ৳95/কেজি)</option>
                        <option value="BT_B">Bangla Tossa Grade-B (৳3,400/মন - ৳85/কেজি)</option>
                        <option value="BT_C">Bangla Tossa Grade-C (৳3,000/মন - ৳75/কেজি)</option>
                        <option value="BT_D">Bangla Tossa Grade-D (৳2,600/মন - ৳65/কেজি)</option>
                      </>
                    ) : (
                      <>
                        <option value="BW_SPECIAL">Bangla White Special (৳3,900/মন - ৳97.5/কেজি)</option>
                        <option value="BW_A">Bangla White Grade-A (৳3,500/মন - ৳87.5/কেজি)</option>
                        <option value="BW_B">Bangla White Grade-B (৳3,100/মন - ৳77.5/কেজি)</option>
                        <option value="BW_C">Bangla White Grade-C (৳2,700/মন - ৳67.5/কেজি)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Gross Weight (kg) / মোট ওজন</label>
                  <input
                    type="number"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-neutral-300">Moisture Content ({moisturePercent}%)</label>
                    <span className={`text-[10px] font-semibold ${moisturePercent <= 14 ? "text-emerald-400" : moisturePercent <= 20 ? "text-amber-400" : "text-rose-400"}`}>
                      {moisturePercent <= 14 ? "Safe Standard (≤14%)" : moisturePercent <= 20 ? "Moisture Penalty" : "Reject Risk (>20%)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="25"
                    step="0.5"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Root Cutting Deduct ({rootCuttingPercent}%)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={rootCuttingPercent}
                    onChange={(e) => setRootCuttingPercent(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGradeLot}
                  disabled={gradingLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 min-h-[36px]"
                >
                  {gradingLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                  Appraise Lot & Calculate Pucca Bales
                </button>
              </div>

              {gradingResult && (
                <div className="p-4 rounded-xl bg-neutral-800/80 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-sm text-neutral-100">
                        {gradingResult.gradeInfo.gradeNameBangla} ({gradingResult.gradeInfo.gradeNameEnglish})
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                      TOKEN: {gradingResult.qualityCertificateToken}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Net Marketable Weight</span>
                      <span className="text-base font-bold text-emerald-400">{gradingResult.netMarketableWeightKg.toLocaleString()} kg</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Pucca Export Bales (180kg)</span>
                      <span className="text-base font-bold text-amber-400">{gradingResult.puccaExportBalesYield} Bales</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Moisture Penalty Deduct</span>
                      <span className="text-base font-bold text-neutral-200">{gradingResult.moistureDeductionKg} kg</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Net Valuation (BDT)</span>
                      <span className="text-base font-bold text-amber-300">৳{gradingResult.netPayableBdt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "costing" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Product Category / পাটপণ্যের ধরন</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="DIVERSIFIED_SHOPPING_BAGS">Diversified Jute Shopping Bags (শপিং ব্যাগ)</option>
                    <option value="HESSIAN_CLOTH">Hessian Cloth (চটের কাপড় / হেসিয়ান)</option>
                    <option value="SACKING_BAGS">Sacking B.Twill Bags (বস্তা / সেকিং)</option>
                    <option value="CARPET_BACKING_CLOTH">Carpet Backing Cloth (CBC কার্পেট ব্যাকিং)</option>
                    <option value="GEO_TEXTILES">Jute Geo-Textiles (জিও-টেক্সটাইল)</option>
                    <option value="JUTE_ESPADRILLES">Jute Footwear / Espadrilles (পাটের জুতা)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Target Production Units / লক্ষ্যমাত্রা</label>
                  <input
                    type="number"
                    value={targetUnits}
                    onChange={(e) => setTargetUnits(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCalculateCosting}
                  disabled={costingLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 min-h-[36px]"
                >
                  {costingLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Boxes className="w-4 h-4" />}
                  Calculate Manufacturing BOM & Yield
                </button>
              </div>

              {costingResult && (
                <div className="p-4 rounded-xl bg-neutral-800/80 border border-amber-500/30 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Raw Fiber Required</span>
                      <span className="text-base font-bold text-amber-400">{costingResult.rawFiberRequiredKg.toLocaleString()} kg</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Unit Cost (BDT)</span>
                      <span className="text-base font-bold text-emerald-400">৳{costingResult.costPerUnitBdt}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Total Production Cost</span>
                      <span className="text-base font-bold text-amber-300">৳{costingResult.totalProductionCostBdt.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Local Value Addition</span>
                      <span className="text-base font-bold text-teal-400">{costingResult.localValueAdditionPercent}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "subsidy" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Export Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">FOB Export Value ($ USD)</label>
                  <input
                    type="number"
                    value={fobValueUsd}
                    onChange={(e) => setFobValueUsd(Number(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Export Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value as any)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="DIVERSIFIED_JUTE_GOODS">Diversified Jute Goods (12% Cash Incentive)</option>
                    <option value="TRADITIONAL_JUTE_GOODS">Traditional Hessian/Sacking (10% Cash Incentive)</option>
                    <option value="JUTE_YARN_TWINE">Jute Yarn & Twine (7% Cash Incentive)</option>
                    <option value="RAW_JUTE">Raw Jute (0% - Statutory Ineligible)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasValidPrc}
                    onChange={(e) => setHasValidPrc(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <span>Bank Proceeds Realization Certificate (PRC)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEpbRegistration}
                    onChange={(e) => setHasEpbRegistration(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <span>Export Promotion Bureau (EPB) Registration</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCalculateSubsidy}
                  disabled={subsidyLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 min-h-[36px]"
                >
                  {subsidyLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Audit Subsidy & Generate Claim
                </button>
              </div>

              {subsidyResult && (
                <div className="p-4 rounded-xl bg-neutral-800/80 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3">
                    <span className="font-bold text-xs text-neutral-200">
                      Ref: {subsidyResult.bangladeshBankCircularRef}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded font-bold ${subsidyResult.isEligibleForSubsidy ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {subsidyResult.isEligibleForSubsidy ? `ELIGIBLE (${subsidyResult.statutorySubsidyRatePercent}%)` : "INELIGIBLE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">FOB Realization (BDT)</span>
                      <span className="text-base font-bold text-neutral-100">৳{subsidyResult.fobValueBdt.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Gross Subsidy ({subsidyResult.statutorySubsidyRatePercent}%)</span>
                      <span className="text-base font-bold text-amber-400">৳{subsidyResult.grossCashSubsidyBdt.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">10% AIT Deduction</span>
                      <span className="text-base font-bold text-rose-400">-৳{subsidyResult.aitDeductionBdt.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700">
                      <span className="text-neutral-400 block mb-1">Net Cash Disbursable</span>
                      <span className="text-base font-bold text-emerald-400">৳{subsidyResult.netCashSubsidyDisbursableBdt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "bonded" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Foreign Importer / Buyer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Destination Country</label>
                  <input
                    type="text"
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateBondedDossier}
                  disabled={bondedLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 min-h-[36px]"
                >
                  {bondedLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Generate NBR Bonded Export Dossier & SHA-256 Seal
                </button>
              </div>

              {bondedResult && (
                <div className="p-4 rounded-xl bg-neutral-800/80 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-700/60 pb-3">
                    <span className="font-bold text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      NBR Customs Bond Clearance Verified
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded bg-neutral-900 text-amber-300 font-mono">
                      {bondedResult.nbrCustomsReleaseToken}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-700/40">
                      <span className="text-neutral-400">Bond License Number</span>
                      <span className="text-neutral-200 font-mono">{bondedResult.bondLicenseNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-700/40">
                      <span className="text-neutral-400">Bonded Fiber Inventory Deducted</span>
                      <span className="text-neutral-200">{bondedResult.bondedStockDeductedKg.toLocaleString()} kg ({bondedResult.totalPuccaBales} Pucca Bales)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-700/40">
                      <span className="text-neutral-400">Domestic Leakage Risk</span>
                      <span className="text-emerald-400 font-bold">0% (Zero Divergence Pass)</span>
                    </div>
                    <div className="py-2">
                      <span className="text-neutral-400 block mb-1">Cryptographic SHA-256 Dossier Seal</span>
                      <span className="font-mono text-[11px] text-amber-400 break-all bg-neutral-950 p-2 rounded block">
                        {bondedResult.sha256DossierSeal}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
