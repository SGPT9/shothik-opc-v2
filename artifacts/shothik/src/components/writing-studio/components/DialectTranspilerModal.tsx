import React, { useState, useEffect } from "react";
import {
  X,
  Languages,
  ArrowRightLeft,
  Sparkles,
  Check,
  Copy,
  BookOpen,
  History,
  Layers,
  HelpCircle,
  FileText,
  BadgeCheck,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export type RegisterId =
  | "cholit_standard"
  | "sadhu_bhasha"
  | "dhakaiya_kutti"
  | "sylheti_nagri"
  | "chittagonian_chatgaya"
  | "barisali"
  | "liberation_war_1971"
  | "cinematic_melodrama_1950s";

export interface RegisterMetadata {
  id: RegisterId;
  nameBangla: string;
  nameEnglish: string;
  historicalPeriod: string;
  geographicRegion: string;
  benchmarkAuthorOrWork: string;
  badgeColor: string;
  sampleInput: string;
  sampleTranspiled: string;
  culturalNote: string;
}

export interface DialectTransformationToken {
  original: string;
  transpiled: string;
  category: "verb_conjugation" | "pronominal_shift" | "regional_lexicon" | "phonetic_mutation" | "period_idiom";
  explanation: string;
}

export interface TranspilationResponse {
  sourceText: string;
  transpiledText: string;
  sourceRegister: RegisterId;
  targetRegister: RegisterId;
  dialogueQuotesOnly: boolean;
  authenticityScore: number;
  transformationsCount: number;
  transformationTokens: DialectTransformationToken[];
  linguisticNotes: string[];
}

export interface BatchComparisonItem {
  registerId: RegisterId;
  metadata: RegisterMetadata;
  transpiledText: string;
  transformationsCount: number;
  authenticityScore: number;
  transformationTokens: DialectTransformationToken[];
}

interface DialectTranspilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (updatedText: string) => void;
  projectId?: string;
}

const REGISTER_INFO: Record<RegisterId, { icon: string; label: string; tag: string }> = {
  sadhu_bhasha: { icon: "📜", label: "সাধু ভাষা", tag: "19th C. Classical" },
  dhakaiya_kutti: { icon: "🏙️", label: "ঢাকাইয়া কুট্টি", tag: "Puran Dhaka" },
  sylheti_nagri: { icon: "🍵", label: "ছিলটি নাগরী", tag: "Surma Valley" },
  chittagonian_chatgaya: { icon: "⚓", label: "চাটগাঁইয়া", tag: "Coastal Port" },
  barisali: { icon: "🌊", label: "বরিশাইল্যা", tag: "Southern Delta" },
  liberation_war_1971: { icon: "🎖️", label: "১৯৭১ রণক্ষেত্র", tag: "Muktijuddho" },
  cinematic_melodrama_1950s: { icon: "🎬", label: "১৯৫০ মেলোড্রামা", tag: "Golden Era" },
  cholit_standard: { icon: "✍️", label: "চলিত প্রমিত", tag: "Modern Standard" },
};

const SAMPLE_PRESETS: Array<{ label: string; text: string; target: RegisterId }> = [
  {
    label: "Classical Sadhu",
    text: "আমরা সেখানে গিয়েছিলাম এবং তাকে দেখেছিলাম। তিনি আমাদের বললেন যে প্রাতঃকালে সেখানে অনেক মানুষ এসেছিল।",
    target: "sadhu_bhasha",
  },
  {
    label: "Puran Dhaka Repartee",
    text: 'তিনি হেসে বললেন, "ভাই কেমন আছেন? আপনি কি খেয়েছেন? ঐটা আমাদের দিন, আমরা তাড়াতাড়ি চলে যাব।"',
    target: "dhakaiya_kutti",
  },
  {
    label: "Sylheti Diaspora",
    text: 'রহমত চাচা ফোন করে বললেন, "কি খবর? ভালো আছেন তো? লন্ডন থেকে টাকা এসেছে, এখন আমি যাচ্ছি।"',
    target: "sylheti_nagri",
  },
  {
    label: "Chatgaya Maritime",
    text: 'জাহাজ ঘাটে মাঝি বলল, "আমি যাবো এবং টাকা পাঠিয়ে দেবো। এটা খুব ভালো জিনিস, কোথায় যাওয়া হবে?"',
    target: "chittagonian_chatgaya",
  },
  {
    label: "Barisali Delta",
    text: 'নৌকার মাঝি চিৎকার করে বলল, "আমাদের সাথে চলো, কোথায় যাবে তুমি? আজ রাতে আমরা কোনো কাজ করব না।"',
    target: "barisali",
  },
  {
    label: "1971 Guerrilla Alert",
    text: 'কমান্ডার তারহীন বার্তায় বললেন, "শত্রুরা আক্রমণ করছে, আমাদের ক্যাম্পে সতর্কতা জারি করো। জয় হোক!"',
    target: "liberation_war_1971",
  },
  {
    label: "1950s Melodrama",
    text: 'নায়িকা অঝোরে কাঁদতে কাঁদতে বলল, "ভগবানের কসম, তুমি এটা কি করলে? ভাগ্যের খেলা দেখে আমি চিরতরে চলে যাব।"',
    target: "cinematic_melodrama_1950s",
  },
];

export const DialectTranspilerModal: React.FC<DialectTranspilerModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "default",
}) => {
  const [activeTab, setActiveTab] = useState<"transpiler" | "matrix">("transpiler");
  const [inputText, setInputText] = useState(
    activeEditorText.trim().length > 15
      ? activeEditorText.slice(0, 450)
      : 'তিনি শান্ত গলায় বললেন, "ভাই কেমন আছেন? আপনি কি খেয়েছেন? আমাদের সাথে চলো।"'
  );
  const [selectedTarget, setSelectedTarget] = useState<RegisterId>("sadhu_bhasha");
  const [preserveQuotesOnly, setPreserveQuotesOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const [transpileResult, setTranspileResult] = useState<TranspilationResponse | null>(null);
  const [matrixResults, setMatrixResults] = useState<BatchComparisonItem[]>([]);
  const [catalog, setCatalog] = useState<RegisterMetadata[]>([]);

  // Fetch register catalog once
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/v1/projects/${projectId}/dialect-registers`)
      .then((res) => res.json())
      .then((data) => {
        if (data.registers) {
          setCatalog(data.registers);
        }
      })
      .catch((err) => console.error("Failed to load dialect catalog", err));
  }, [isOpen, projectId]);

  // Execute single transpilation
  const handleTranspile = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/dialect-transpile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          targetRegister: selectedTarget,
          preserveDialogueQuotesOnly: preserveQuotesOnly,
        }),
      });
      const data = await res.json();
      setTranspileResult(data);
    } catch (err) {
      console.error("Transpilation failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Execute batch matrix comparison
  const handleBatchCompare = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/dialect-batch-compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          preserveDialogueQuotesOnly: preserveQuotesOnly,
        }),
      });
      const data = await res.json();
      if (data.comparisons) {
        setMatrixResults(data.comparisons);
      }
    } catch (err) {
      console.error("Batch comparison failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount or target change
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "transpiler") {
        handleTranspile();
      } else {
        handleBatchCompare();
      }
    }
  }, [isOpen, selectedTarget, preserveQuotesOnly, activeTab]);

  if (!isOpen) return null;

  const currentMetadata = catalog.find((c) => c.id === selectedTarget);

  const handleCopy = () => {
    if (transpileResult?.transpiledText) {
      navigator.clipboard.writeText(transpileResult.transpiledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = (textToApply: string) => {
    if (onApplyToManuscript) {
      onApplyToManuscript(textToApply);
      setApplied(true);
      setTimeout(() => setApplied(false), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                  Vernacular Dialect & Historical Register Transpiler
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                  Capability #20
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full">
                  8 Registers
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আঞ্চলিক উপভাষা ও ঐতিহাসিক রূপান্তরক — Classical Sadhu, Old Dhaka, Sylheti, Chatgaya, Barisali & 1971 Wartime
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setActiveTab("transpiler")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "transpiler"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Single Transpile</span>
              </button>
              <button
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === "matrix"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Omni-Matrix</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Strip */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/60 overflow-x-auto text-xs">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Presets:
            </span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setInputText(preset.text);
                  setSelectedTarget(preset.target);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-md transition-all shrink-0 text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 shrink-0 ml-4">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300 hover:text-slate-100 select-none">
              <input
                type="checkbox"
                checked={preserveQuotesOnly}
                onChange={(e) => setPreserveQuotesOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px] font-medium">Dialogue Quotes Only ("...")</span>
            </label>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "transpiler" ? (
            <div className="space-y-6">
              {/* Dialect Selector Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 block">
                  Select Target Sociolect / Historical Era
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(REGISTER_INFO) as RegisterId[]).map((regId) => {
                    const info = REGISTER_INFO[regId];
                    const isSelected = selectedTarget === regId;
                    return (
                      <button
                        key={regId}
                        onClick={() => setSelectedTarget(regId)}
                        className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 text-amber-200"
                            : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <span className="text-xl shrink-0">{info.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{info.label}</p>
                          <p className="text-[10px] text-slate-400 truncate">{info.tag}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Side-by-side Transpiler Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Source Column */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Manuscript Input (Colloquial / Standard)
                    </span>
                    <span className="text-[11px] text-slate-500">{inputText.length} chars</span>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter dialogue or prose in standard Bengali..."
                    className="w-full h-48 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 resize-none font-sans text-sm leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleTranspile}
                      disabled={loading}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                      <span>Re-Transpile</span>
                    </button>
                  </div>
                </div>

                {/* Target Column */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Transpiled Result (
                      {REGISTER_INFO[selectedTarget]?.label})
                    </span>
                    {transpileResult && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <BadgeCheck className="w-3 h-3" />
                        {transpileResult.authenticityScore}% Realism
                      </span>
                    )}
                  </div>
                  <div className="relative w-full h-48 p-3.5 bg-slate-950/90 border border-amber-500/30 rounded-xl text-slate-100 overflow-y-auto font-sans text-sm leading-relaxed selection:bg-amber-500/30">
                    {loading ? (
                      <div className="flex items-center justify-center h-full text-slate-500 space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Transpiling phonetic and lexical shifts...</span>
                      </div>
                    ) : (
                      transpileResult?.transpiledText || "Transpiled text will appear here..."
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {transpileResult?.transformationsCount || 0} transformations applied
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        disabled={!transpileResult}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all border border-slate-700"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                      <button
                        onClick={() => transpileResult && handleApply(transpileResult.transpiledText)}
                        disabled={!transpileResult}
                        className="flex items-center space-x-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold transition-all shadow-md shadow-amber-500/10"
                      >
                        {applied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{applied ? "Applied!" : "Apply to Manuscript"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token-Level Audit Breakdown */}
              {transpileResult && transpileResult.transformationTokens.length > 0 && (
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                      Linguistic Mutation Breakdown ({transpileResult.transformationTokens.length} Tokens)
                    </h3>
                    <span className="text-[11px] text-slate-500">Grammar & Phonetic Rule Verification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {transpileResult.transformationTokens.map((token, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col justify-between text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-red-400 line-through font-mono text-[11px]">{token.original}</span>
                          <span className="text-slate-500 text-[10px]">→</span>
                          <span className="text-emerald-300 font-semibold font-mono text-[11px]">{token.transpiled}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{token.explanation}</p>
                        <span className="self-start text-[9px] px-1.5 py-0.5 rounded uppercase font-medium tracking-wider bg-slate-800 text-slate-400">
                          {token.category.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Context Card */}
              {currentMetadata && (
                <div className="p-4 bg-gradient-to-r from-amber-500/5 via-slate-950/40 to-slate-950/40 border border-amber-500/20 rounded-xl text-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-amber-400 shrink-0" />
                    <h4 className="font-semibold text-slate-200">
                      Cultural Lore & Register Provenance: {currentMetadata.nameBangla}
                    </h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{currentMetadata.culturalNote}</p>
                  <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 font-medium">Historical Period:</span>{" "}
                      <span className="text-slate-300">{currentMetadata.historicalPeriod}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Geographic Epicenter:</span>{" "}
                      <span className="text-slate-300">{currentMetadata.geographicRegion}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Literary Benchmark:</span>{" "}
                      <span className="text-amber-300 font-serif">{currentMetadata.benchmarkAuthorOrWork}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Omni-Matrix View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Omni-Matrix Multi-Register Comparator</h3>
                  <p className="text-xs text-slate-400">
                    Transpiles your sentence across all 8 registers simultaneously for instantaneous stylistic audition.
                  </p>
                </div>
                <button
                  onClick={handleBatchCompare}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh Matrix</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matrixResults.map((item) => (
                  <div
                    key={item.registerId}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">{REGISTER_INFO[item.registerId]?.icon}</span>
                          <h4 className="text-xs font-semibold text-slate-200">
                            {REGISTER_INFO[item.registerId]?.label}
                          </h4>
                        </div>
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                          {item.authenticityScore}% Realism
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
                        {item.transpiledText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                      <span className="text-slate-500">{item.transformationsCount} shifts applied</span>
                      <button
                        onClick={() => handleApply(item.transpiledText)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded font-medium transition-all"
                      >
                        Apply this register
                      </button>
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
