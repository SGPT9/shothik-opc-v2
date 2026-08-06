"use client";

import React, { useState, useEffect } from "react";
import { CanvasArtifact } from "../../api/hermes/canvas/artifacts/route";

export default function CanvasWorkspacePage() {
  const [artifacts, setArtifacts] = useState<CanvasArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<CanvasArtifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hermes/canvas/artifacts").then((r) => r.json());
      if (res.success && res.artifacts.length > 0) {
        setArtifacts(res.artifacts);
        setSelectedArtifact(res.artifacts[0]);
      }
    } catch (err) {
      console.error("Failed to load canvas artifacts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/hermes/canvas/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 35) + "...",
          type: prompt.toLowerCase().includes("slide") ? "slide" : "document",
          content: {
            slides: [
              {
                title: prompt,
                bullets: [
                  "Generated via Hermes Dynamic Canvas Engine",
                  "Real-time state persisted to InsForge database",
                  "Exportable across formats (PDF, PPTX, HTML)",
                ],
              },
            ],
            docMarkdown: `# ${prompt}\n\nGenerated artifact workspace created automatically from user prompt.`,
          },
        }),
      }).then((r) => r.json());

      if (res.success) {
        setArtifacts((prev) => [res.artifact, ...prev]);
        setSelectedArtifact(res.artifact);
        setPrompt("");
      }
    } catch (err) {
      console.error("Error generating artifact", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Prompt Panel" : "Collapse Prompt Panel (Full Canvas)"}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono border border-slate-700"
          >
            {isSidebarCollapsed ? "▶ Expand Panel" : "◀ Collapse Panel"}
          </button>
          <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Pillar 3: Dynamic Artifact Canvas
          </span>
          <h1 className="text-lg font-bold text-white hidden sm:block">Side-by-Side Agent Canvas</h1>
        </div>

        {selectedArtifact && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 hidden sm:inline">Version {selectedArtifact.version}</span>
            <button className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
              Export (PDF / PPTX)
            </button>
          </div>
        )}
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Agent Prompt & Artifact List (Collapsible) */}
        {!isSidebarCollapsed && (
          <div className="w-full lg:w-[38%] border-r border-slate-800 bg-slate-900/50 flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80">
              <h3 className="text-sm font-semibold text-white mb-2">Saved Canvas Artifacts</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {artifacts.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtifact(art)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedArtifact?.id === art.id
                        ? "bg-cyan-600 text-white shadow"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {art.type.toUpperCase()}: {art.title.slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Chat / Instruction Workspace */}
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
                  <div className="font-semibold text-cyan-400">🤖 Agent Canvas Assistant</div>
                  <p>
                    Any research, slide generation, or document editing task will instantly render as a persistent live canvas artifact on the right pane.
                  </p>
                </div>

                {selectedArtifact && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Active Focus Artifact</span>
                    <h4 className="font-bold text-white text-base">{selectedArtifact.title}</h4>
                    <p className="text-xs text-slate-400">Type: {selectedArtifact.type} • Updated: {new Date(selectedArtifact.updatedAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleGenerateArtifact} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Ask the agent to generate or update slides, spreadsheets, or documents..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg disabled:opacity-50"
                >
                  {isGenerating ? "Synthesizing Artifact..." : "Generate Live Canvas Artifact"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Live Artifact Viewer (Full Width when collapsed) */}
        <div className={`flex-1 bg-slate-950 p-8 overflow-y-auto flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? "w-full" : ""}`}>
          {loading ? (
            <div className="text-slate-500 animate-pulse">Loading Artifact Canvas...</div>
          ) : selectedArtifact ? (
            <div className={`w-full ${isSidebarCollapsed ? "max-w-5xl" : "max-w-3xl"} space-y-6 transition-all`}>
              {/* Slide Artifact Render */}
              {selectedArtifact.type === "slide" && selectedArtifact.content.slides && (
                <div className="space-y-6">
                  {selectedArtifact.content.slides.map((slide, idx) => (
                    <div
                      key={idx}
                      className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div>
                        <span className="text-xs font-mono text-cyan-400">SLIDE {idx + 1}</span>
                        <h2 className="text-2xl font-bold text-white mt-2">{slide.title}</h2>
                        <ul className="mt-6 space-y-3 text-slate-300 text-sm">
                          {slide.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span className="text-cyan-400 font-bold">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {slide.notes && <div className="text-xs text-slate-500 border-t border-slate-800/80 pt-3">Notes: {slide.notes}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Document Artifact Render */}
              {selectedArtifact.type === "document" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
                  <div className="text-xs font-mono text-cyan-400">DOCUMENT ARTIFACT</div>
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm whitespace-pre-line">
                    {selectedArtifact.content.docMarkdown}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500">No artifact selected</div>
          )}
        </div>
      </div>
    </div>
  );
}
