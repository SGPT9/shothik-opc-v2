import React, { useState, useEffect } from "react";
import {
  X,
  PackageCheck,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Flame,
  Key,
  Coins,
  Scale,
  Sparkles,
  PlusCircle,
  FileText,
  MinusCircle,
  RefreshCw
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  nameBn: string;
  category: "weapon" | "ammunition" | "survival" | "clue" | "currency" | "relic";
  owner: string;
  quantity: number;
  maxCapacity?: number;
  currentCharges?: number;
  weightKg: number;
  condition: "pristine" | "worn" | "depleted" | "damaged" | "lost";
  originChapter: number;
  lastUsedChapter: number;
  isEquipped: boolean;
  notes: string;
}

interface InventoryAuditAnomaly {
  id: string;
  item: string;
  character: string;
  severity: "critical_depletion" | "over_capacity" | "phantom_item" | "encumbrance_overload";
  severityLabelBn: string;
  chapter: number;
  message: string;
  resolutionSuggestion: string;
}

interface ItemLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  manuscriptText?: string;
  onInsertProse?: (prose: string) => void;
}

export const ItemLedgerModal: React.FC<ItemLedgerModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  manuscriptText = "",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "audit" | "encumbrance">("inventory");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [audit, setAudit] = useState<{
    totalItems: number;
    totalEncumbranceKg: number;
    anomalies: InventoryAuditAnomaly[];
    generatedInventoryScene: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditText, setAuditText] = useState(manuscriptText);

  const fetchLedgerState = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/item-ledger`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setItems(data.items || []);
          setAudit(data.audit || null);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Failed to load item ledger:", err);
      });
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchLedgerState();
    setAuditText(manuscriptText);
  }, [isOpen, projectId, manuscriptText]);

  const handleAuditManuscript = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/item-ledger/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manuscriptText: auditText })
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setAudit(data.audit || null);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Audit failed:", err);
      });
  };

  const handleConsume = (itemId: string, amount: number = 1) => {
    fetch(`/api/v1/projects/${projectId}/item-ledger/consume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, amount })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchLedgerState();
        }
      })
      .catch((err) => console.error("Consumption failed:", err));
  };

  if (!isOpen) return null;

  // Group items by owner for encumbrance calculations
  const weightByOwner: Record<string, { weight: number; items: InventoryItem[] }> = {};
  items.forEach((item) => {
    if (!weightByOwner[item.owner]) {
      weightByOwner[item.owner] = { weight: 0, items: [] };
    }
    weightByOwner[item.owner].weight += item.weightKg;
    weightByOwner[item.owner].items.push(item);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Strict Physical Item Economy & Ammunition Ledger
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Capability #35
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                বাস্তবসম্মত বস্তু অর্থনীতি, কার্তুজ ট্র্যাকার ও ভারবহন নিরীক্ষক (Ammo & Encumbrance Physics)
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

        {/* Global Stats Ribbon */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-amber-950/20 border-b border-amber-900/30 text-xs text-amber-300">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-amber-200">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              মোট সরঞ্জাম: {items.length} টি আইটেম
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              মোট কাফেলা ওজন: {audit?.totalEncumbranceKg || 0} কেজি
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              শনাক্তকৃত অসঙ্গতি: {audit?.anomalies.length || 0} টি
            </span>
          </div>
          <button
            onClick={fetchLedgerState}
            className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "inventory"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Character Armory & Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Crosshair className="w-4 h-4" />
            Ammunition & Conservation Auditor ({audit?.anomalies.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("encumbrance")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "encumbrance"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            Encumbrance & Stamina Load
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: INVENTORY ITEMS */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  চরিত্রভিত্তিক অস্ত্রাগার ও সরঞ্জামের খতিয়ান (Active Physical Inventory)
                </h3>
                <span className="text-xs text-neutral-400">
                  সংরক্ষণ সূত্র: বস্তুর অবিনাশিতা নীতি (Conservation of Matter)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-100">{item.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                            {item.category.toUpperCase()}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.condition === "pristine"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : item.condition === "depleted"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {item.condition}
                        </span>
                      </div>

                      <div className="text-xs text-amber-400/90 font-medium">
                        {item.nameBn} • বাহক: {item.owner}
                      </div>

                      <p className="text-xs text-neutral-400 leading-relaxed">{item.notes}</p>

                      {/* Capacity / Ammo Visualizer if weapon/charges */}
                      {item.maxCapacity && (
                        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">
                              {item.category === "weapon" ? "সিলিন্ডার কার্তুজ সংখ্যা" : "অবশিষ্ট জ্বালানি/ক্ষমতা"}
                            </span>
                            <span className="font-mono font-bold text-amber-300">
                              {item.currentCharges} / {item.maxCapacity}
                            </span>
                          </div>

                          {/* Visual Ammo Dots if small revolver/capacity */}
                          {item.maxCapacity <= 12 && (
                            <div className="flex items-center gap-2 pt-1">
                              {Array.from({ length: item.maxCapacity }).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                    idx < (item.currentCharges || 0)
                                      ? "bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/50"
                                      : "bg-neutral-800 border-neutral-700 opacity-40"
                                  }`}
                                  title={idx < (item.currentCharges || 0) ? "Loaded Round" : "Spent Chamber"}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">ওজন: {item.weightKg} kg</span>
                      <div className="flex items-center gap-2">
                        {item.currentCharges !== undefined && item.currentCharges > 0 && (
                          <button
                            onClick={() => handleConsume(item.id, 1)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-colors"
                          >
                            <MinusCircle className="w-3 h-3" />
                            গুলি/ব্যবহার করুন (Fire -1)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT & ANOMALIES */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    পাণ্ডুলিপি বস্তু ও কার্তুজ সংরক্ষণ অডিট (Conservation Auditor)
                  </h3>
                  <button
                    onClick={handleAuditManuscript}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-950 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {loading ? "অডিট হচ্ছে..." : "পাণ্ডুলিপি স্ক্যান করুন (Audit Manuscript)"}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    স্ক্যান করার জন্য পাণ্ডুলিপির দৃশ্য বা অধ্যায় পাঠ্য (Manuscript Scene):
                  </label>
                  <textarea
                    rows={4}
                    value={auditText}
                    onChange={(e) => setAuditText(e.target.value)}
                    placeholder="পাণ্ডুলিপির দৃশ্য এখানে পেস্ট করুন..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 leading-relaxed font-serif"
                  />
                </div>
              </div>

              {/* Anomalies List */}
              {audit && audit.anomalies.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    শনাক্তকৃত ভৌত অসঙ্গতিসমূহ ({audit.anomalies.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {audit.anomalies.map((anom) => (
                      <div
                        key={anom.id}
                        className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            {anom.severityLabelBn}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300">
                            {anom.item} • {anom.character}
                          </span>
                        </div>
                        <p className="text-red-200 leading-relaxed">{anom.message}</p>
                        <div className="pt-2 border-t border-red-900/40 text-neutral-300">
                          <span className="font-semibold text-emerald-400">সংশোধনের পরামর্শ: </span>
                          {anom.resolutionSuggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">কোনো ভৌত অসঙ্গতি বা ভৌতিক কার্তুজ পাওয়া যায়নি!</span>
                    <p className="text-neutral-400 mt-0.5">
                      পাণ্ডুলিপির দৃশ্য চরিত্রের বর্তমান গোলাবারুদ ও বহন ক্ষমতার সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ।
                    </p>
                  </div>
                </div>
              )}

              {/* Generated sensory inventory scene */}
              {audit?.generatedInventoryScene && (
                <div className="space-y-2 p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    বাস্তবসম্মত বস্তু-সংরক্ষণ দৃশ্য (Realistic Inventory & Reload Scene):
                  </span>
                  <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-serif leading-relaxed italic">
                    "{audit.generatedInventoryScene}"
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onInsertProse?.(audit.generatedInventoryScene)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      দৃশ্যের সাথে পাণ্ডুলিপিতে যোগ করুন (Inject Scene)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENCUMBRANCE & STAMINA */}
          {activeTab === "encumbrance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  চরিত্রের শারীরিক ভারবহন ক্ষমতা ও ক্লান্তি সূচক (Encumbrance Load & Fatigue)
                </h3>
                <span className="text-xs text-neutral-400">সর্বোচ্চ আদর্শ ভার: ২৫ কেজি</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(weightByOwner).map(([owner, data]) => {
                  const percent = Math.min(100, Math.round((data.weight / 25) * 100));
                  const isOverburdened = data.weight > 25;

                  return (
                    <div
                      key={owner}
                      className="p-5 rounded-xl bg-neutral-950/50 border border-neutral-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-100 text-sm">{owner}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isOverburdened
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {data.weight.toFixed(1)} kg ({percent}%)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverburdened ? "bg-red-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/60 text-xs">
                        <span className="text-neutral-500">বহনকৃত সরঞ্জামাদি:</span>
                        {data.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-neutral-300">
                            <span>{it.name}</span>
                            <span className="font-mono text-neutral-400">{it.weightKg} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
