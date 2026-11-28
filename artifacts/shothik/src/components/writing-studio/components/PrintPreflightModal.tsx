import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  FileCheck2,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  ChevronRight,
  Sliders,
  Maximize2
} from "lucide-react";

export type PrintTrimSize =
  | "us_trade_6x9"
  | "crown_octavo_5_5x8_5"
  | "bangla_academy_5_5x8_75"
  | "a5_standard";

export type PaperStock =
  | "offset_70gsm"
  | "book_cream_80gsm"
  | "art_paper_100gsm";

interface PreflightCheck {
  id: string;
  name: string;
  status: "pass" | "warning" | "fail";
  detail: string;
  recommendation?: string;
}

interface PreflightAuditResult {
  overallPrintReadyScore: number;
  isPdfX1aCompliant: boolean;
  estimatedPageCount: number;
  spineThicknessInches: number;
  spineThicknessMm: number;
  signatureCalculation: {
    formaSize: 8 | 16;
    totalFormas: number;
    exactPagesCovered: number;
    blankPaddingPages: number;
    paperEfficiencyPercent: number;
  };
  checks: PreflightCheck[];
  gutterClearanceStatus: "optimal" | "tight" | "risk_of_binding_clip";
  embeddedFontsDetected: string[];
}

interface PressProductionSpec {
  jobTitle: string;
  pressStandard: string;
  trimBox: { widthMm: number; heightMm: number; widthInches: number; heightInches: number };
  bleedBox: { widthMm: number; heightMm: number; bleedMm: number };
  spineCalculation: {
    pages: number;
    paperGsm: string;
    spineWidthMm: number;
    spineWidthInches: number;
  };
  nilkhetFormaPlan: {
    formaSize: number;
    formasCount: number;
    totalPressPages: number;
    blankPagesAtEnd: number;
  };
  colorProfile: string;
  pdfStandard: string;
  nilkhetPressNotesBn: string;
}

interface PrintPreflightModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  manuscriptText?: string;
  onInsertProse?: (prose: string) => void;
}

export const PrintPreflightModal: React.FC<PrintPreflightModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  manuscriptText = "",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"spread" | "preflight" | "press_specs">("spread");
  const [selectedTrim, setSelectedTrim] = useState<PrintTrimSize>("crown_octavo_5_5x8_5");
  const [selectedPaper, setSelectedPaper] = useState<PaperStock>("book_cream_80gsm");
  const [formaSize, setFormaSize] = useState<8 | 16>(16);
  const [audit, setAudit] = useState<PreflightAuditResult | null>(null);
  const [specs, setSpecs] = useState<PressProductionSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPrintState();
    }
  }, [isOpen, selectedTrim, selectedPaper, formaSize]);

  const fetchPrintState = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/print-preflight`);
      if (res.ok) {
        const data = await res.json();
        if (data.audit) setAudit(data.audit);
        if (data.specs) setSpecs(data.specs);
      }
    } catch (e) {
      console.warn("Using fallback local audit state", e);
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/print-preflight/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptText,
          config: {
            trimSize: selectedTrim,
            paperStock: selectedPaper,
            signatureFormaSize: formaSize
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audit) setAudit(data.audit);
      }
    } catch (e) {
      console.error("Failed to run preflight audit", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySpec = () => {
    if (!specs) return;
    const specText = `[নীলক্ষেত অফসেট প্রেস প্রিন্ট স্পেসিফিকেশন]\nবইয়ের নাম: ${specs.jobTitle}\nসাইজ: ${specs.trimBox.widthInches}" × ${specs.trimBox.heightInches}" (${specs.trimBox.widthMm} × ${specs.trimBox.heightMm} মিমি)\nকাগজ: ${specs.spineCalculation.paperGsm}\nপৃষ্ঠা সংখ্যা: ${specs.spineCalculation.pages}\nস্পাইন পুরুত্ব: ${specs.spineCalculation.spineWidthMm} মিমি (${specs.spineCalculation.spineWidthInches} ইঞ্চি)\nফরমা হিসাব: ${specs.nilkhetFormaPlan.formasCount} টি (${specs.nilkhetFormaPlan.formaSize}-পৃষ্ঠা ফরমা) | মোট পৃষ্ঠা: ${specs.nilkhetFormaPlan.totalPressPages} (খালি: ${specs.nilkhetFormaPlan.blankPagesAtEnd})\nরং প্রোফাইল: ${specs.colorProfile}\nপিডিএফ স্ট্যান্ডার্ড: ${specs.pdfStandard}\n\nপ্রেস নোট:\n${specs.nilkhetPressNotesBn}`;
    navigator.clipboard.writeText(specText);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  const handleApplyFormatting = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/print-preflight/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptText,
          dropCapLetter: "ব"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formattedSnippet && onInsertProse) {
          onInsertProse(data.formattedSnippet);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to apply print formatting", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  One-Click Print Preflight & 6x9 Layout Typesetter
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PDF/X-1a Certified
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Nilkhet Press Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                মিরর্ড কাটিং গাটার, ড্রপ-ক্যাপ হরফ, ডায়নামিক রানিং হেডার এবং ১৬-পৃষ্ঠার ফরমা ইম্পোজিশন ইঞ্জিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("spread")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "spread"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              লাইভ ২-পৃষ্ঠা স্প্রেড ও মিরর্ড গাটার
            </button>
            <button
              onClick={() => setActiveTab("preflight")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "preflight"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              PDF/X-1a প্রিফ্লাইট চেকলিস্ট
              {audit && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300">
                  {audit.overallPrintReadyScore}%
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("press_specs")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "press_specs"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              নীলক্ষেত ফরমা (Forma) ও স্পাইন শীট
            </button>
          </div>

          {/* Quick Selectors */}
          <div className="flex items-center gap-3 pb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">সাইজ:</span>
              <select
                value={selectedTrim}
                onChange={(e) => setSelectedTrim(e.target.value as PrintTrimSize)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="crown_octavo_5_5x8_5">5.5 × 8.5" Crown Octavo (বাংলা ফিকশন)</option>
                <option value="bangla_academy_5_5x8_75">5.5 × 8.75" বাংলা একাডেমি সাইজ</option>
                <option value="us_trade_6x9">6.0 × 9.0" Royal Demy / US Trade</option>
                <option value="a5_standard">5.8 × 8.3" A5 International</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">কাগজ:</span>
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value as PaperStock)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="book_cream_80gsm">৮০ GSM সুইডিশ মুনকেন ক্রিম</option>
                <option value="offset_70gsm">৭০ GSM হোয়াইট অফসেট</option>
                <option value="art_paper_100gsm">১০০ GSM আর্ট পেপার</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: SPREAD & MIRRORED GUTTERS */}
          {activeTab === "spread" && (
            <div className="space-y-6">
              {/* Dimensions Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">কাটিং সাইজ (Trim Size)</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedTrim === "crown_octavo_5_5x8_5" ? '5.5" × 8.5" (140×216mm)' :
                     selectedTrim === "bangla_academy_5_5x8_75" ? '5.5" × 8.75" (140×222mm)' :
                     selectedTrim === "us_trade_6x9" ? '6.0" × 9.0" (152×229mm)' : '5.8" × 8.3" (148×210mm)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">ভেতরের গাটার (Inside Gutter)</span>
                  <span className="text-sm font-semibold text-amber-400">
                    0.85" (21.6 mm) — বাইন্ডিং নিরাপদ
                  </span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">বাইরের মার্জিন (Outside)</span>
                  <span className="text-sm font-semibold text-slate-300">0.55" (14.0 mm)</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">স্পাইন পুরুত্ব (Spine Thickness)</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {audit ? `${audit.spineThicknessMm} mm (${audit.spineThicknessInches}")` : "12.8 mm"}
                  </span>
                </div>
              </div>

              {/* Interactive Two-Page Spread Mockup */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span>
                    ভার্সো (Verso / বাম পৃষ্ঠা - জোড়)
                  </span>
                  <span className="font-mono text-slate-500">স্পাইন ভাঁজ রেখা (Spine Crease)</span>
                  <span className="flex items-center gap-1.5">
                    রেকটো (Recto / ডান পৃষ্ঠা - বিজোড়)
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500"></span>
                  </span>
                </div>

                {/* Book Spread */}
                <div className="flex bg-[#fcf9f2] text-slate-900 rounded-lg shadow-2xl overflow-hidden border border-[#e6dfcb] min-h-[360px]">
                  {/* Left Page (Verso - Even) */}
                  <div className="flex-1 p-6 border-r border-[#ded8c4] flex flex-col justify-between relative bg-gradient-to-r from-[#fbf8f0] to-[#f4eee0]">
                    {/* Running Header */}
                    <div className="flex justify-between items-center text-[10px] text-slate-600 border-b border-slate-400/40 pb-1.5 mb-4 font-serif">
                      <span className="font-semibold">৪৬</span>
                      <span>শহীদুল ইসলাম • অনন্ত নক্ষত্রবীথি</span>
                    </div>

                    {/* Prose Body */}
                    <div className="text-[12px] leading-relaxed text-justify space-y-2.5 font-serif text-slate-800">
                      <p className="indent-4">
                        সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে। বুড়িগঙ্গার কালো পানির ওপর ভেসে থাকা তেলের আস্তরণ যেন এক অচেনা মানচিত্র।
                      </p>
                      <p className="indent-4">
                        ওসি রফিক হাতের ভেজা সিগারেটটা ড্রেনে ফেলে দিয়ে বললেন, "হিমু সাহেব, আপনার এই খামখেয়ালি কিন্তু সবাইকে বিপদে ফেলবে। নদীর ওপারে যা ঘটছে, তা সাধারণ কোনো চোরাচালান নয়।"
                      </p>
                      <p className="indent-4">
                        হিমু একটু হাসল। তার সেই শান্ত, উদাসীন হাসি যা মানুষকে বিভ্রান্ত করে। "রফিক সাহেব, পৃথিবীতে কোনো কিছুই সাধারণ নয়। নদীর পানিরও নিজস্ব স্মৃতি থাকে।"
                      </p>
                    </div>

                    {/* Gutter Guide Overlay Visual */}
                    <div className="text-[9px] text-slate-400 mt-4 text-center">
                      ← বাম মার্জিন: ০.৫৫" | স্পাইন গাটার: ০.৮৫" →
                    </div>
                  </div>

                  {/* Spine Crease / Binding Line */}
                  <div className="w-4 bg-gradient-to-r from-[#e0d6c0] via-[#c8bc9e] to-[#e0d6c0] shadow-inner flex items-center justify-center">
                    <div className="w-[1px] h-full bg-[#ad9f7d]/60"></div>
                  </div>

                  {/* Right Page (Recto - Odd) */}
                  <div className="flex-1 p-6 border-l border-[#ded8c4] flex flex-col justify-between relative bg-gradient-to-l from-[#fbf8f0] to-[#f4eee0]">
                    {/* Running Header */}
                    <div className="flex justify-between items-center text-[10px] text-slate-600 border-b border-slate-400/40 pb-1.5 mb-4 font-serif">
                      <span>অধ্যায় ৩: বুড়িগঙ্গার তীরে শেষ প্রহর</span>
                      <span className="font-semibold">৪৭</span>
                    </div>

                    {/* Prose Body with Drop Cap */}
                    <div className="text-[12px] leading-relaxed text-justify space-y-2.5 font-serif text-slate-800">
                      <p className="first-letter:float-left first-letter:text-3xl first-letter:font-bold first-letter:pr-2 first-letter:leading-none first-letter:text-amber-900 first-letter:font-serif">
                        বৃষ্টির ভারী ধারা যখন সদরঘাটের টিনের চালে শেষবারের মতো আঘাত হানছিল, তখন ঘড়ির কাঁটায় রাত আড়াইটা। ভাটায় ভেসে আসা বাদামি কুয়াশা টার্মিনালের নিভু নিভু সোডিয়াম বাতিগুলোকে ঘিরে রহস্যময় আভা তৈরি করেছে।
                      </p>
                      <p className="indent-4">
                        কাঠের বেঞ্চে বসে থাকা লোকটার হলুদ পাঞ্জাবি একেবারে ভিজে সপসপ করছে। হিমু চোখ তুলে তাকাল। "রফিক সাহেব, মেঘ কিন্তু এখনও কাটেনি। আকাশ আরও কিছু কথা জমা রেখে দিয়েছে।"
                      </p>
                    </div>

                    {/* Gutter Guide Overlay Visual */}
                    <div className="text-[9px] text-slate-400 mt-4 text-center">
                      ← স্পাইন গাটার: ০.৮৫" | ডান মার্জিন: ০.৫৫" →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREFLIGHT AUDIT CHECKLIST */}
          {activeTab === "preflight" && (
            <div className="space-y-6">
              {/* Scorecard Header */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xl">
                    {audit?.overallPrintReadyScore || 95}%
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      প্রিফ্লাইট প্রস্তুতি সূচক (Preflight Readiness Index)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {audit?.isPdfX1aCompliant
                        ? "আন্তর্জাতিক ISO 15930-1 (PDF/X-1a:2001) স্ট্যান্ডার্ড ও নীলক্ষেত প্রেসে প্রিন্ট উপযোগী।"
                        : "কিছু সংশোধনী প্রয়োজন। নিচের সতর্কতাগুলো লক্ষ্য করুন।"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={runAudit}
                  disabled={loading}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  পুনরায় অডিট চালান
                </button>
              </div>

              {/* Checklist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {audit?.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-4 rounded-xl border bg-slate-950/40 border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {chk.status === "pass" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-slate-200">
                            {chk.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                            chk.status === "pass"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {chk.detail}
                      </p>
                    </div>
                    {chk.recommendation && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-amber-400/90 flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        <span>{chk.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Embedded Fonts List */}
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  সনাক্তকৃত বাংলা ওপেনটাইপ ইউনিকোড ফন্ট (Subset Embedded OpenType):
                </span>
                <div className="flex flex-wrap gap-2">
                  {audit?.embeddedFontsDetected.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 font-mono"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESS SPECS & NILKHET FORMA CALCULATOR */}
          {activeTab === "press_specs" && (
            <div className="space-y-6">
              {/* Forma Formula Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">মোট বইয়ের পৃষ্ঠা (Pages)</span>
                  <div className="text-2xl font-bold text-white">
                    {audit?.signatureCalculation.exactPagesCovered || 160}{" "}
                    <span className="text-xs font-normal text-slate-400">পৃষ্ঠা</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    (আসল ড্রাফট: {audit?.estimatedPageCount || 158} পৃষ্ঠা)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">১৬-পৃষ্ঠার মোট ফরমা (Formas)</span>
                  <div className="text-2xl font-bold text-amber-400">
                    {audit?.signatureCalculation.totalFormas || 10}{" "}
                    <span className="text-xs font-normal text-slate-400">ফরমা</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    কাগজ ব্যবহার দক্ষতা: {audit?.signatureCalculation.paperEfficiencyPercent || 98.7}%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">শেষ ফরমায় খালি পৃষ্ঠা (Blank End)</span>
                  <div className="text-2xl font-bold text-emerald-400">
                    {audit?.signatureCalculation.blankPaddingPages || 2}{" "}
                    <span className="text-xs font-normal text-slate-400">পৃষ্ঠা</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    প্রকাশকের বিজ্ঞাপন বা নোটসের জন্য উপযোগী
                  </span>
                </div>
              </div>

              {/* Nilkhet CTP Order Sheet */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-amber-400 font-bold uppercase tracking-wider">
                    নীলক্ষেত সিটিপি ও অফসেট প্রেস অর্ডার শিট (Nilkhet CTP Imposition Sheet)
                  </span>
                  <button
                    onClick={handleCopySpec}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                  >
                    {copiedSpec ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSpec ? "অনুলিপিত!" : "কপি প্রেস স্পেক"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500">বইয়ের নাম: </span>
                    <span className="text-white font-medium">{specs?.jobTitle || "অনন্ত নক্ষত্রবীথি"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">স্ট্যান্ডার্ড: </span>
                    <span className="text-white">{specs?.pdfStandard || "PDF/X-1a:2001 (ISO 15930-1)"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">কাটিং ট্রিম সাইজ: </span>
                    <span className="text-white">{specs?.trimBox.widthInches}" × {specs?.trimBox.heightInches}"</span>
                  </div>
                  <div>
                    <span className="text-slate-500">কাটিং ব্লিড: </span>
                    <span className="text-white">{specs?.bleedBox.bleedMm} mm (0.125")</span>
                  </div>
                  <div>
                    <span className="text-slate-500">স্পাইন পুরুত্ব: </span>
                    <span className="text-amber-400 font-semibold">{specs?.spineCalculation.spineWidthMm} mm ({specs?.spineCalculation.spineWidthInches}")</span>
                  </div>
                  <div>
                    <span className="text-slate-500">কাগজের মান: </span>
                    <span className="text-white">{specs?.spineCalculation.paperGsm}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 whitespace-pre-line leading-relaxed font-sans">
                  {specs?.nilkhetPressNotesBn}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-xs text-slate-400">
            {audit?.isPdfX1aCompliant ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                পাণ্ডুলিপি অফসেট প্রেসে পাঠানোর জন্য সম্পূর্ণ প্রস্তুত।
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4" />
                মার্জিন ও ফরমা পূর্ণতা যাচাই করুন।
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopySpec}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedSpec ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedSpec ? "স্পেক কপি হয়েছে" : "প্রেস স্পেক অনুলিপি"}
            </button>
            <button
              onClick={handleApplyFormatting}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {injectedSuccess ? "ড্রপ-ক্যাপ ও মার্জিন যুক্ত হয়েছে!" : "ড্রপ-ক্যাপ ও প্রিন্ট সেকশন যুক্ত করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
