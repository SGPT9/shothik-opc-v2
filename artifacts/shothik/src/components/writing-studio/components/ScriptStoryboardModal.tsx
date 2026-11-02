import React, { useState, useEffect } from "react";
import {
  Film,
  Clapperboard,
  BookOpen,
  Copy,
  Download,
  Sparkles,
  Layers,
  Camera,
  Check,
  RefreshCw,
  X,
  FileText,
  Sliders,
  Maximize2
} from "lucide-react";

interface FountainElement {
  type: 'scene_heading' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition';
  text: string;
}

interface ComicPanel {
  panelNumber: number;
  cameraShot: string;
  visualDescription: string;
  charactersPresent: string[];
  dialogueBalloons: Array<{ character: string; text: string; isWhisper?: boolean; isShout?: boolean }>;
  captionBox?: string;
  sfxSoundEffect?: string;
}

interface ScriptStoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertToManuscript?: (text: string) => void;
  currentManuscriptText?: string;
}

export const ScriptStoryboardModal: React.FC<ScriptStoryboardModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertToManuscript,
  currentManuscriptText = ""
}) => {
  const [activeTab, setActiveTab] = useState<"screenplay" | "comic" | "transmute">("screenplay");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [artStyle, setArtStyle] = useState<string>("Dhaka Noir Chiaroscuro (মহাখালী ও ধানমন্ডি ড্রামাটিক শ্যাডো)");

  const [fountainScript, setFountainScript] = useState<string>("");
  const [fountainElements, setFountainElements] = useState<FountainElement[]>([]);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [estimatedRuntime, setEstimatedRuntime] = useState<number>(1.5);
  const [stats, setStats] = useState({ sceneCount: 2, dialogueCount: 4, panelCount: 5, wordCount: 120 });

  // Transmutation sandbox inputs
  const [sandboxText, setSandboxText] = useState<string>(
    currentManuscriptText ||
    `INT. DHANMONDI RESIDENCE - NIGHT\n\nবাইরে অবিশ্রান্ত শ্রাবণের বৃষ্টি। পুরনো ড্রয়িংরুমের কাচের জানালায় বৃষ্টির ফোঁটা আছড়ে পড়ছে। হলুদ পাঞ্জাবি পরা হিমু জানালার ধারে দাঁড়িয়ে সোডিয়াম বাতির হলুদ আলোর দিকে তাকিয়ে আছে।\n\nবাদল: হিমু ভাই, আপনি কি সত্যিই ওই লোকটার সাথে দেখা করতে যাচ্ছেন?\n\nহিমু: (ধীর মৃদু হাসি) যে মানুষ রাতের অন্ধকারে হলুদ আলো ভালোবাসে, সে কখনো ভয়ঙ্কর হতে পারে না, বাদল।`
  );
  const [isTransmuting, setIsTransmuting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    loadDefaultStoryboard();
  }, [isOpen, projectId]);

  const loadDefaultStoryboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8080/api/v1/projects/${projectId}/script-storyboard`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setFountainScript(json.data.fountainScript);
          setFountainElements(json.data.fountainElements || []);
          setComicPanels(json.data.comicPanels || []);
          setEstimatedRuntime(json.data.estimatedRuntimeMinutes || 1.5);
          setStats(json.data.statistics || { sceneCount: 2, dialogueCount: 4, panelCount: 5, wordCount: 120 });
          if (json.data.comicArtStyle) setArtStyle(json.data.comicArtStyle);
        }
      }
    } catch (e) {
      console.warn("Failed to load script storyboard, using local fallback", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransmute = async () => {
    try {
      setIsTransmuting(true);
      const res = await fetch(`http://127.0.0.1:8080/api/v1/projects/${projectId}/script-storyboard/transmute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: sandboxText,
          targetFormat: "both",
          title: "TRANSMUTED MANUSCRIPT"
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setFountainScript(json.data.fountainScript);
          setFountainElements(json.data.fountainElements || []);
          setComicPanels(json.data.comicPanels || []);
          setEstimatedRuntime(json.data.estimatedRuntimeMinutes || 1);
          setStats(json.data.statistics || stats);
          setActiveTab("screenplay");
        }
      }
    } catch (e) {
      console.error("Transmutation failed", e);
    } finally {
      setIsTransmuting(false);
    }
  };

  const handleCopyFountain = () => {
    navigator.clipboard.writeText(fountainScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFountain = () => {
    const blob = new Blob([fountainScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `manuscript_screenplay_${Date.now()}.fountain`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Novel-to-Screenplay & Comic Storyboard Transmuter
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  Dual-Format Engine
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  ~{estimatedRuntime} Min Screenplay
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bidirectional conversion between prose, standard Fountain screenplay formatting, and comic book panel layouts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDefaultStoryboard}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Transmutation"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950 border-b border-slate-800 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("screenplay")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === "screenplay"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Hollywood Screenplay (Fountain)</span>
            </button>

            <button
              onClick={() => setActiveTab("comic")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === "comic"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Comic Storyboard Grid ({comicPanels.length} Panels)</span>
            </button>

            <button
              onClick={() => setActiveTab("transmute")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition ${
                activeTab === "transmute"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Prose Transmutation Sandbox</span>
            </button>
          </div>

          {activeTab === "screenplay" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFountain}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Fountain"}</span>
              </button>
              <button
                onClick={handleDownloadFountain}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .fountain</span>
              </button>
              {onInsertToManuscript && (
                <button
                  onClick={() => onInsertToManuscript(fountainScript)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-md border border-amber-500/40 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Insert to Editor</span>
                </button>
              )}
            </div>
          )}

          {activeTab === "comic" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Style:</span>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="Dhaka Noir Chiaroscuro (মহাখালী ও ধানমন্ডি ড্রামাটিক শ্যাডো)">Dhaka Noir Chiaroscuro</option>
                <option value="Manga Neo-Dhaka Screentone (মাঙ্গা ইনকিং)">Manga Neo-Dhaka</option>
                <option value="Franco-Belgian Ligne Claire (টিনটিন ক্লাসিক লাইন)">Franco-Belgian Ligne Claire</option>
                <option value="Vintage Bengali Pulp Magazine Art (সচিত্র শুকতারা রেট্রো)">Vintage Bengali Pulp</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Transmuting prose to screenplay & comic layout...</p>
            </div>
          ) : activeTab === "screenplay" ? (
            /* TAB 1: Screenplay View */
            <div className="max-w-3xl mx-auto bg-slate-950 p-8 rounded-xl border border-slate-800 shadow-inner font-mono text-slate-200 leading-relaxed text-sm">
              <div className="text-center text-xs text-slate-400 pb-6 border-b border-slate-800/80 mb-6">
                <span className="font-bold tracking-widest text-slate-300 uppercase">THE SILENT WITNESS: SCREENPLAY</span>
                <span className="mx-2">•</span>
                <span>Fountain Standard 1.1</span>
                <span className="mx-2">•</span>
                <span>Estimated Runtime: {estimatedRuntime} Minutes</span>
              </div>

              <div className="space-y-4">
                {fountainElements.map((el, idx) => {
                  if (el.type === "scene_heading") {
                    return (
                      <div key={idx} className="font-bold text-amber-300 tracking-wider pt-3 pb-1 uppercase border-l-2 border-amber-500/50 pl-3">
                        {el.text}
                      </div>
                    );
                  }
                  if (el.type === "character") {
                    return (
                      <div key={idx} className="font-bold text-indigo-300 text-center uppercase pt-2 tracking-widest">
                        {el.text}
                      </div>
                    );
                  }
                  if (el.type === "parenthetical") {
                    return (
                      <div key={idx} className="text-slate-400 text-center italic text-xs">
                        {el.text}
                      </div>
                    );
                  }
                  if (el.type === "dialogue") {
                    return (
                      <div key={idx} className="max-w-md mx-auto text-center text-slate-100 font-sans leading-normal pb-2">
                        "{el.text}"
                      </div>
                    );
                  }
                  if (el.type === "transition") {
                    return (
                      <div key={idx} className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                        &gt; {el.text}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="text-slate-300 font-sans text-sm pl-4 leading-relaxed">
                      {el.text}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === "comic" ? (
            /* TAB 2: Comic Storyboard Grid */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-amber-400">Art Direction:</span>
                  <span>{artStyle}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {comicPanels.length} Panels • 6-Panel Page Template
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comicPanels.map((panel) => (
                  <div
                    key={panel.panelNumber}
                    className="relative flex flex-col justify-between bg-slate-950 border-2 border-slate-800 hover:border-amber-500/50 rounded-xl p-4 shadow-lg transition group"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                      <span className="px-2 py-0.5 text-xs font-extrabold bg-slate-800 text-amber-400 rounded">
                        PANEL {panel.panelNumber}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                        <Camera className="w-3 h-3" />
                        <span>{panel.cameraShot}</span>
                      </div>
                    </div>

                    {/* SFX sound effect sticker */}
                    {panel.sfxSoundEffect && (
                      <div className="absolute top-12 right-3 -rotate-12 px-2 py-0.5 bg-rose-600 text-white font-black text-xs rounded shadow-md border border-rose-400 transform scale-110 tracking-widest uppercase">
                        ⚡ {panel.sfxSoundEffect}
                      </div>
                    )}

                    {/* Caption Box */}
                    {panel.captionBox && (
                      <div className="mb-2 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200 text-xs font-serif italic">
                        CAPTION: {panel.captionBox}
                      </div>
                    )}

                    {/* Visual Description */}
                    <div className="flex-1 bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 mb-3 text-xs text-slate-300 leading-relaxed font-sans">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Visual Staging:
                      </span>
                      {panel.visualDescription}
                    </div>

                    {/* Speech Balloons */}
                    <div className="space-y-1.5">
                      {panel.dialogueBalloons.map((balloon, bIdx) => (
                        <div
                          key={bIdx}
                          className={`relative p-2.5 rounded-xl text-xs font-sans border ${
                            balloon.isShout
                              ? "bg-rose-950/40 border-rose-500/40 text-rose-200 font-semibold"
                              : "bg-slate-800/90 border-slate-700 text-slate-100"
                          }`}
                        >
                          <span className="font-bold text-amber-300 block text-[10px] uppercase">
                            {balloon.character}:
                          </span>
                          <span>"{balloon.text}"</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer characters */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>In Frame:</span>
                      <div className="flex gap-1 flex-wrap">
                        {panel.charactersPresent.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 3: Transmutation Sandbox */
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Paste Raw Manuscript Prose or Fountain Script:
                </label>
                <textarea
                  rows={10}
                  value={sandboxText}
                  onChange={(e) => setSandboxText(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  placeholder="Paste chapter dialogue or action here..."
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    Characters: {sandboxText.length} • Words: {sandboxText.split(/\s+/).filter(Boolean).length}
                  </span>
                  <button
                    onClick={handleTransmute}
                    disabled={isTransmuting || !sandboxText.trim()}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-lg transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isTransmuting ? "Transmuting..." : "Transmute to Screenplay & Comic"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-slate-200">How the InkOS Transmuter Works:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Detects speaker dialogue tags (<code className="text-amber-300">হিমু:</code>) and centers them as Hollywood character cue blocks.</li>
                  <li>Parses parenthetical gestures (<code className="text-amber-300">(ধীর মৃদু হাসি)</code>) into script direction.</li>
                  <li>Generates cinematic comic panels with dynamic shot variety (<code className="text-indigo-300">ESTABLISHING WIDE</code>, <code className="text-indigo-300">CLOSE UP</code>, <code className="text-indigo-300">DUTCH ANGLE</code>).</li>
                  <li>Extracts auditory cues into bold comic SFX sound stickers (<code className="text-rose-300">⚡ ঝমঝম!</code>, <code className="text-rose-300">⚡ দড়াম!</code>).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Scenes: <strong className="text-slate-200">{stats.sceneCount}</strong></span>
            <span>Dialogues: <strong className="text-slate-200">{stats.dialogueCount}</strong></span>
            <span>Comic Panels: <strong className="text-slate-200">{stats.panelCount}</strong></span>
            <span>Est. Film Runtime: <strong className="text-amber-400">{estimatedRuntime} min</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
