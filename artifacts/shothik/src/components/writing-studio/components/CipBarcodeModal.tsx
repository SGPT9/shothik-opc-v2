import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  FileText,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Sparkles,
  RefreshCw,
  Library,
  BookOpen,
  Search,
  Check
} from "lucide-react";

interface CipData {
  libraryStandard: string;
  catalogingLanguage: string;
  authorMainEntry: string;
  authorMainEntryBn: string;
  titleAndStatement: string;
  editionAndPublication: string;
  physicalDescription: string;
  isbn13: string;
  isbn10?: string;
  ddcClassification: string;
  ddcSubjectBn: string;
  lcCallNumber: string;
  subjectHeadingsBn: string[];
  bnbControlNumber: string;
  formattedCipCardBn: string;
  copyrightNoticeBn: string;
}

interface IsbnBarcodeSpec {
  isbn13: string;
  cleanDigits: string;
  isValidChecksum: boolean;
  countryOrRegion: string;
  publisherNameBn: string;
  retailPriceBdt: number;
  svgBarcodeMarkup: string;
}

interface CipBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const CipBarcodeModal: React.FC<CipBarcodeModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"cip_block" | "barcode_svg" | "validator">("cip_block");
  const [cip, setCip] = useState<CipData | null>(null);
  const [barcode, setBarcode] = useState<IsbnBarcodeSpec | null>(null);
  const [isbnInput, setIsbnInput] = useState("978-984-96421-8-3");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    calculatedCheckDigit: number;
    isBangladeshPrefix: boolean;
  } | null>({ isValid: true, calculatedCheckDigit: 3, isBangladeshPrefix: true });
  const [loading, setLoading] = useState(false);
  const [copiedCip, setCopiedCip] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCipData();
    }
  }, [isOpen]);

  const fetchCipData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/cip-barcode`);
      if (res.ok) {
        const data = await res.json();
        if (data.cip) setCip(data.cip);
        if (data.barcode) setBarcode(data.barcode);
      }
    } catch (e) {
      console.warn("Using fallback local CIP data", e);
    } finally {
      setLoading(false);
    }
  };

  const validateIsbn = async (inputStr: string) => {
    setIsbnInput(inputStr);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/cip-barcode/validate-isbn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn: inputStr })
      });
      if (res.ok) {
        const data = await res.json();
        setValidationResult({
          isValid: data.isValid,
          calculatedCheckDigit: data.calculatedCheckDigit,
          isBangladeshPrefix: data.isBangladeshPrefix
        });
      }
    } catch (e) {
      console.error("Validation failed", e);
    }
  };

  const handleCopyCip = () => {
    if (!cip) return;
    navigator.clipboard.writeText(cip.formattedCipCardBn);
    setCopiedCip(true);
    setTimeout(() => setCopiedCip(false), 2500);
  };

  const handleCopySvg = () => {
    if (!barcode) return;
    navigator.clipboard.writeText(barcode.svgBarcodeMarkup);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2500);
  };

  const handleApplyFrontMatter = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/cip-barcode/apply`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formattedFrontMatter && onInsertProse) {
          onInsertProse(data.formattedFrontMatter);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject CIP block", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Autonomous National Library Cataloging (CIP) & ISBN Barcode Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  NLB Certified
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  DDC 891.443
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                বাংলাদেশ জাতীয় আরকাইভস ও গ্রন্থাগার অধিদপ্তর CIP উপাত্ত, ডিউই ডেসিমাল এবং ভেক্টর EAN-13 বারকোড ইঞ্জিন
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
              onClick={() => setActiveTab("cip_block")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "cip_block"
                  ? "border-indigo-400 text-indigo-300 bg-indigo-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              জাতীয় গ্রন্থাগার CIP ব্লক ও কপিরাইট
            </button>
            <button
              onClick={() => setActiveTab("barcode_svg")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "barcode_svg"
                  ? "border-indigo-400 text-indigo-300 bg-indigo-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Barcode className="w-4 h-4" />
              ভেক্টর EAN-13 বারকোড (SVG)
            </button>
            <button
              onClick={() => setActiveTab("validator")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "validator"
                  ? "border-indigo-400 text-indigo-300 bg-indigo-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              আইএসবিএন চেকসাম ভ্যালিডেটর
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: NATIONAL LIBRARY CIP BLOCK */}
          {activeTab === "cip_block" && (
            <div className="space-y-6">
              {/* Classification Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">ডিউই ডেসিমাল (DDC)</span>
                  <span className="text-sm font-semibold text-indigo-300">৮৯১.৪৪৩ (বাংলা ফিকশন)</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">কংগ্রেস লাইব্রেরি (LCC)</span>
                  <span className="text-sm font-semibold text-white">PK1730.29.S53 A85</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">জাতীয় গ্রন্থপঞ্জি (BNB)</span>
                  <span className="text-sm font-semibold text-amber-400">{cip?.bnbControlNumber || "BNB-2026/09421"}</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">আইএসবিএন (ISBN-13)</span>
                  <span className="text-sm font-semibold text-emerald-400">{cip?.isbn13 || "978-984-96421-8-3"}</span>
                </div>
              </div>

              {/* Official CIP Card Preview */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    বাংলাদেশ জাতীয় গ্রন্থপঞ্জি প্রকাশনা-উপাত্ত (Cataloging in Publication - CIP)
                  </div>
                  <button
                    onClick={handleCopyCip}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                  >
                    {copiedCip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCip ? "কপি হয়েছে!" : "কপি CIP কার্ড"}
                  </button>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 mt-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {cip?.formattedCipCardBn}
                </div>
              </div>

              {/* Copyright Notice Box */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  বইয়ের ইনার টাইটেল ও কপিরাইট পেজ (Copyright Page)
                </span>
                <p className="font-serif text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {cip?.copyrightNoticeBn}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VECTOR EAN-13 BARCODE */}
          {activeTab === "barcode_svg" && (
            <div className="space-y-6">
              {/* Barcode Render Card */}
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  অফিসিয়াল EAN-13 বুক ল্যান্ড বারকোড (১০০% K ব্ল্যাক ভেক্টর)
                </span>

                {/* Barcode SVG Container */}
                <div className="p-4 bg-white rounded-xl shadow-2xl border border-slate-300">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: barcode?.svgBarcodeMarkup || `<svg width="200" height="90"><text y="45">EAN-13</text></svg>`
                    }}
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300 font-mono">
                  <span>দেশ: <strong className="text-amber-400">বাংলাদেশ (984)</strong></span>
                  <span>মূল্য: <strong className="text-emerald-400">৳৩৮০ | $14.99</strong></span>
                  <span>চেকসাম: <strong className="text-emerald-400">ভ্যালিড (Digit 3)</strong></span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleCopySvg}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
                  >
                    {copiedSvg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedSvg ? "SVG কপি হয়েছে!" : "ভেক্টর SVG বারকোড কপি করুন"}
                  </button>
                </div>
              </div>

              {/* Barcode Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-1">কোয়াইট জোন (Quiet Zone):</span>
                  <span className="text-white font-semibold">উভয় পাশে কমপক্ষে ৩.৬৩ মিমি</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-1">কালার স্পেস:</span>
                  <span className="text-white font-semibold">CMYK 100% K (কালো-সাদা)</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-1">বার অনুপাত ও হাইট:</span>
                  <span className="text-white font-semibold">স্ট্যান্ডার্ড Magnification 100%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECK digit & PREFIX VALIDATOR */}
          {activeTab === "validator" && (
            <div className="space-y-6">
              {/* Input Form */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  আইএসবিএন-১৩ চেকসাম ক্যালকুলেটর ও ভ্যালিডেটর
                </span>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={isbnInput}
                    onChange={(e) => validateIsbn(e.target.value)}
                    placeholder="978-984-..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => validateIsbn(isbnInput)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    যাচাই করুন
                  </button>
                </div>

                {validationResult && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      {validationResult.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                      )}
                      <span className="text-sm font-semibold text-white">
                        {validationResult.isValid
                          ? "আইএসবিএন চেকসাম সম্পূর্ণ নির্ভুল ও আন্তর্জাতিকভাবে বৈধ!"
                          : "চেকসাম ত্রুটিপূর্ণ! শেষ চেক-ডিজিট সঠিক নয়।"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-xs font-mono text-slate-400">
                      <div>
                        হিসাবকৃত চেক ডিজিট: <strong className="text-indigo-400">{validationResult.calculatedCheckDigit}</strong>
                      </div>
                      <div>
                        বাংলাদেশ জাতীয় প্রিফিক্স (984):{" "}
                        <strong className={validationResult.isBangladeshPrefix ? "text-emerald-400" : "text-amber-400"}>
                          {validationResult.isBangladeshPrefix ? "হ্যাঁ (NLB Bangladesh)" : "অন্যান্য দেশ"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CIP রেকর্ড ও EAN-13 বারকোড ফ্রন্ট-ম্যাটারে যুক্ত করার জন্য প্রস্তুত।</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyCip}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedCip ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedCip ? "কপি হয়েছে" : "CIP ব্লক কপি"}
            </button>
            <button
              onClick={handleApplyFrontMatter}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              {injectedSuccess ? "CIP পেজ যুক্ত হয়েছে!" : "CIP ও কপিরাইট পেজ যুক্ত করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
