"use client";

import React, { useState } from "react";

export interface ArtifactCanvasProps {
  artifactId?: string;
  title?: string;
  domain?: string;
  initialContent?: string;
  version?: number;
  onSave?: (newContent: string) => void;
  onExport?: (format: "pdf" | "pptx" | "markdown" | "json") => void;
}

export function ArtifactCanvas({
  artifactId = "art_preview_1",
  title = "Untitled Workspace Artifact",
  domain = "research",
  initialContent = "# Shothik Executive Summary\n\nWelcome to your interactive side-by-side artifact workspace.",
  version = 1,
  onSave,
  onExport,
}: ArtifactCanvasProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "history">("preview");
  const [currentVersion, setCurrentVersion] = useState<number>(version);
  const [versionsList, setVersionsList] = useState<Array<{ version: number; timestamp: string; label: string }>>([
    { version: 1, timestamp: new Date().toLocaleTimeString(), label: "Initial Generation" },
  ]);

  const handleCreateVersion = () => {
    const nextVer = currentVersion + 1;
    setCurrentVersion(nextVer);
    setVersionsList((prev) => [
      { version: nextVer, timestamp: new Date().toLocaleTimeString(), label: `Checkpoint v${nextVer}` },
      ...prev,
    ]);
    if (onSave) onSave(content);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <h2 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md">{title}</h2>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {domain}
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            v{currentVersion}
          </span>
        </div>

        {/* Tab Controls & Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "preview" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "edit" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "history" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              History ({versionsList.length})
            </button>
          </div>

          <button
            onClick={handleCreateVersion}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Checkpoint v{currentVersion + 1}
          </button>

          <div className="relative group">
            <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors">
              Export ▾
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl hidden group-hover:block z-50 p-1 space-y-0.5">
              <button
                onClick={() => onExport && onExport("pdf")}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Export PDF
              </button>
              <button
                onClick={() => onExport && onExport("pptx")}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Export PPTX
              </button>
              <button
                onClick={() => onExport && onExport("markdown")}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Export Markdown
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "preview" && (
          <div className="prose prose-invert max-w-none space-y-4">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 leading-relaxed text-slate-200 font-sans whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[450px] p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
            placeholder="Edit artifact content..."
          />
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Version History & Checkpoints</h3>
            <div className="space-y-2">
              {versionsList.map((ver) => (
                <div
                  key={ver.version}
                  onClick={() => setCurrentVersion(ver.version)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    currentVersion === ver.version
                      ? "bg-purple-950/40 border-purple-500 text-purple-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-xs">Version {ver.version}</span>
                    <span className="text-xs text-slate-400">{ver.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{ver.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
