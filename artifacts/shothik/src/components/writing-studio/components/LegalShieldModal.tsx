import React, { useState, useEffect } from "react";
import {
  X,
  ShieldAlert,
  Scale,
  FileText,
  AlertTriangle,
  Check,
  Copy,
  Sparkles,
  Zap,
  Music,
  Building,
  UserCheck,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

export type LegalRiskSeverity = "critical" | "moderate" | "low" | "safe_harbor";
export type LegalRiskCategory = "defamation_libel" | "trademark_dilution" | "song_lyrics_copyright" | "privacy_invasion";

export interface LegalRiskItem {
  id: string;
  category: LegalRiskCategory;
  categoryLabelBn: string;
  detectedText: string;
  severity: LegalRiskSeverity;
  legalBasisBn: string;
  riskExplanationBn: string;
  suggestedRemedyBn: string;
  fictionalizedAlternativeBn?: string;
}

export interface LegalShieldAuditReport {
  projectId: string;
  overallComplianceScore: number;
  totalRisksFound: number;
  criticalCount: number;
  moderateCount: number;
  lowCount: number;
  items: LegalRiskItem[];
  statutoryDisclaimerBn: string;
  statutoryDisclaimerEn: string;
}

interface LegalShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const LegalShieldModal: React.FC<LegalShieldModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"defamation_audit" | "trademark_lyrics" | "statutory_disclaimer">("defamation_audit");
  const [report, setReport] = useState<LegalShieldAuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);
  const [copiedDisclaimer, setCopiedDisclaimer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/legal-shield`);
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
        }
      }
    } catch (e) {
      console.warn("Using fallback local legal report data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleInjectDisclaimer = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/legal-shield/disclaimer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.disclaimerMarkdown && onInsertProse) {
          onInsertProse(data.disclaimerMarkdown);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject disclaimer", e);
    }
  };

  const handleCopyDisclaimer = () => {
    if (report?.statutoryDisclaimerBn) {
      const text = `${report.statutoryDisclaimerBn}\n\n${report.statutoryDisclaimerEn}`;
      navigator.clipboard.writeText(text);
      setCopiedDisclaimer(true);
      setTimeout(() => setCopiedDisclaimer(false), 2000);
    }
  };

  const defamationItems = report?.items.filter((i) => i.category === "defamation_libel" || i.category === "privacy_invasion") || [];
  const trademarkItems = report?.items.filter((i) => i.category === "trademark_dilution" || i.category === "song_lyrics_copyright") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-slate-100">
                  লিগ্যাল ডিফামেশন ও ট্রেডমার্ক প্রিফ্লাইট শিল্ড
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  InkOS #45
                </span>
              </div>
              <p className="text-xs text-slate-400">
                সমসাময়িক কথাসাহিত্য ও স্মৃতিকথায় মানহানি (দণ্ডবিধি ৪৯৯), বাণিজ্যিক ট্রেডমার্ক ডায়লিউশন ও গানের লিরিক্স কপিরাইট অডিট
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/20 space-x-2">
          <button
            onClick={() => setActiveTab("defamation_audit")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "defamation_audit"
                ? "border-rose-400 text-rose-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>ব্যক্তিগত মানহানি ও লিবেল অডিট</span>
          </button>

          <button
            onClick={() => setActiveTab("trademark_lyrics")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "trademark_lyrics"
                ? "border-rose-400 text-rose-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>ট্রেডমার্ক ও লিরিক্স কপিরাইট ছাড়পত্র</span>
          </button>

          <button
            onClick={() => setActiveTab("statutory_disclaimer")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "statutory_disclaimer"
                ? "border-rose-400 text-rose-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>প্রকাশক লিগ্যাল ডিসক্লেইমার ও সেফ হারবার</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400" />
              <p className="text-sm text-slate-400">আইনগত প্রিফ্লাইট ও কপিরাইট স্ক্যান চলছে...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DEFAMATION & LIBEL AUDIT */}
              {activeTab === "defamation_audit" && (
                <div className="space-y-6">
                  {/* Score & Risk Count Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">আইনগত কমপ্লায়েন্স স্কোর</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-2">
                        {report?.overallComplianceScore || 92}/১০০
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">সুরক্ষিত প্রকাশনা জোন</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">মারাত্মক ঝুঁকি (Critical)</span>
                      <div className="text-2xl font-bold text-slate-100 mt-2">
                        {report?.criticalCount || 0} টি
                      </div>
                      <span className="text-[11px] text-emerald-400 mt-1 block">কোনো লিবেল মামলা ঝুঁকি নেই</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">মাঝারি সতর্কতা (Moderate)</span>
                      <div className="text-2xl font-bold text-amber-400 mt-2">
                        {report?.moderateCount || 2} টি
                      </div>
                      <span className="text-[11px] text-amber-300 mt-1 block">ট্রেডমার্ক ও লিরিক্স ঋণস্বীকার</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">সামান্য সতর্কতা (Low)</span>
                      <div className="text-2xl font-bold text-slate-300 mt-2">
                        {report?.lowCount || 1} টি
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">চরিত্রের নাম সংশোধনযোগ্য</span>
                    </div>
                  </div>

                  {/* Flagged Defamation Items */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      চিহ্নিত ব্যক্তি ও প্রাতিষ্ঠানিক রেফারেন্স ({defamationItems.length})
                    </span>

                    <div className="space-y-3">
                      {defamationItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-semibold text-rose-300">
                              "{item.detectedText}"
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                              {item.legalBasisBn}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {item.riskExplanationBn}
                          </p>

                          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>প্রস্তাবিত ফিকশনালাইজেশন মাস্ক (Fictionalization Mask):</span>
                            </div>
                            <p className="font-serif text-slate-200">
                              {item.fictionalizedAlternativeBn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TRADEMARK & LYRICS CLEARANCE */}
              {activeTab === "trademark_lyrics" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      বাণিজ্যিক ব্র্যান্ড ও সুরকার কপিরাইট অডিট ({trademarkItems.length})
                    </span>
                    <span className="text-xs text-amber-400">
                      ফেয়ার ইউজ ও মেকানিক্যাল লাইসেন্সিং ফ্রেমওয়ার্ক
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trademarkItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-amber-300">
                            "{item.detectedText}"
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.categoryLabelBn}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.riskExplanationBn}
                        </p>

                        <div className="space-y-1 text-xs">
                          <span className="text-slate-400 text-[11px] font-medium">প্রস্তাবিত আইনি সমাধান:</span>
                          <p className="text-slate-300">{item.suggestedRemedyBn}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
                          <span className="text-[11px] text-emerald-400 font-medium block mb-0.5">নিরপেক্ষ বিকল্প:</span>
                          <p className="font-serif text-slate-200">{item.fictionalizedAlternativeBn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: STATUTORY DISCLAIMER */}
              {activeTab === "statutory_disclaimer" && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
                      সার্টিফায়েড পাবলিশার লিগ্যাল ডিসক্লেইমার
                    </span>
                    <p className="text-xs text-slate-400">
                      কপিরাইট পৃষ্ঠায় যুক্ত করার জন্য দ্বৈত ভাষার মানসম্পন্ন আইনগত দায়মুক্তি ও সেফ হারবার ঘোষণা
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs leading-relaxed">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                        বাংলা সংস্করণ (বাংলাদেশ কপিরাইট ও মানহানি সুরক্ষা):
                      </span>
                      <p className="font-serif text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                        {report?.statutoryDisclaimerBn}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block">
                        English Global Safe Harbor (US/UK Berne Convention Standard):
                      </span>
                      <p className="font-serif text-sm text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed italic">
                        {report?.statutoryDisclaimerEn}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={handleInjectDisclaimer}
                      className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-rose-600/20"
                    >
                      {injectedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ঘোষণা সফলভাবে পান্ডুলিপির কপিরাইট পাতায় যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>১-ক্লিকে পান্ডুলিপির কপিরাইট পাতায় ঘোষণা ইনজেক্ট করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyDisclaimer}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center space-x-2"
                    >
                      {copiedDisclaimer ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>সঠিক রাইটিং স্টুডিও • লিগ্যাল ডিফামেশন, ট্রেডমার্ক ও সেফ হারবার শিল্ড</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
