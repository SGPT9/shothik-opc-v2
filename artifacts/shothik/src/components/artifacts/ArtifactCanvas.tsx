

import React, { useState } from "react";

export interface ArtifactCanvasProps {
  artifactId?: string;
  title?: string;
  domain?: string;
  initialContent?: string;
  liveUrl?: string;
  docsUrl?: string;
  version?: number;
  onSave?: (newContent: string) => void;
  onExport?: (format: "pdf" | "pptx" | "markdown" | "json") => void;
}

export type CanvasTab = "preview" | "edit" | "live_web" | "docs" | "analytics" | "history";
export type DeviceViewport = "desktop" | "tablet" | "mobile";

export function ArtifactCanvas({
  artifactId = "art_preview_1",
  title = "Untitled Workspace Artifact",
  domain = "research",
  initialContent = "# Shothik Executive Summary\n\nWelcome to your interactive side-by-side artifact workspace.",
  liveUrl = "https://app-demo.shothik.app",
  docsUrl = "https://app-demo.shothik.app/docs",
  version = 1,
  onSave,
  onExport,
}: ArtifactCanvasProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [activeTab, setActiveTab] = useState<CanvasTab>("preview");
  const [viewport, setViewport] = useState<DeviceViewport>("desktop");
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 gap-3">
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
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "preview" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "edit" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("live_web")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "live_web" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Web
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "docs" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              OpenAPI Docs
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "analytics" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
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

        {activeTab === "live_web" && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-300">{liveUrl}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewport("desktop")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    viewport === "desktop" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Desktop
                </button>
                <button
                  onClick={() => setViewport("tablet")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    viewport === "tablet" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Tablet
                </button>
                <button
                  onClick={() => setViewport("mobile")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    viewport === "mobile" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  Mobile
                </button>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-500"
                >
                  Open ↗
                </a>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[450px]">
              <div
                className={`h-full border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
                  viewport === "desktop" ? "w-full" : viewport === "tablet" ? "w-[768px]" : "w-[375px]"
                }`}
              >
                <iframe src={liveUrl} title="Live Deployed Site" className="w-full h-full min-h-[420px] bg-slate-900" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">Interactive OpenAPI 3.0 REST Playground</h3>
                <p className="text-slate-400 text-xs mt-1">{docsUrl}</p>
              </div>
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Open Swagger UI ↗
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                  POST
                </span>
                <span className="text-slate-200">/api/v1/generate</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-bold">
                  GET
                </span>
                <span className="text-slate-200">/api/v1/health</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Traffic & Latency Panel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">24h Requests</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">14,290</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">18ms</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400">Uptime SLA</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">99.99%</p>
              </div>
            </div>
          </div>
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
