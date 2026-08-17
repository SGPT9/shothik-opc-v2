"use client";

import { useState } from "react";
import { Network, Download, Sparkles, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiagramNode {
  id: string;
  label: string;
  type: "user" | "gateway" | "baas" | "ai" | "storage";
  status?: "active" | "idle" | "ready";
}

interface DiagramArtifactProps {
  initialTitle?: string;
  isStreaming?: boolean;
}

export function DiagramArtifact({
  initialTitle = "Shothik System Architecture & Data Flow",
  isStreaming = false,
}: DiagramArtifactProps) {
  const [zoom, setZoom] = useState(100);

  const nodes: DiagramNode[] = [
    { id: "n1", label: "Client Workspace (Next.js / Vite)", type: "user", status: "active" },
    { id: "n2", label: "Hermes API Gateway (Port 3000)", type: "gateway", status: "active" },
    { id: "n3", label: "InsForge Postgres BaaS + PostgREST", type: "baas", status: "ready" },
    { id: "n4", label: "OpenRouter LLM Swarm Engine", type: "ai", status: "active" },
    { id: "n5", label: "Vector RAG Context Memory Store", type: "storage", status: "ready" },
  ];

  const handleExportSVG = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" style="background:#020617;font-family:sans-serif;">
  <rect width="800" height="600" fill="#020617"/>
  <text x="40" y="50" fill="#38bdf8" font-size="18" font-weight="bold">${initialTitle}</text>
  ${nodes.map((node, i) => `
    <g transform="translate(100, ${100 + i * 90})">
      <rect width="600" height="60" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="30" y="36" fill="#ffffff" font-size="14" font-weight="bold">${node.label}</text>
      <text x="500" y="36" fill="#38bdf8" font-size="12" font-family="monospace">${node.status}</text>
    </g>
  `).join("")}
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shothik-diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Network className="h-4 w-4 text-cyan-400 shrink-0" />
          <h3 className="text-xs font-bold text-slate-200 truncate">{initialTitle}</h3>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
            Flowchart Stage
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="h-7 w-7 p-0 rounded-lg border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-[10px] font-mono text-slate-400 px-1">{zoom}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="h-7 w-7 p-0 rounded-lg border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSVG}
            className="h-7 px-2.5 text-[11px] font-semibold border-slate-800 text-slate-300 hover:bg-slate-800 gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3 text-cyan-400" />
            <span>SVG Export</span>
          </Button>
        </div>
      </div>

      {/* Diagram Interactive Canvas */}
      <div className="flex-1 min-h-0 p-6 overflow-auto flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          style={{ transform: `scale(${zoom / 100})` }}
          className="w-full max-w-2xl space-y-4 transition-transform duration-200"
        >
          {nodes.map((node, i) => (
            <div key={node.id} className="relative flex flex-col items-center">
              {/* Connector line */}
              {i > 0 && (
                <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500/50 to-indigo-500/50 my-1 animate-pulse" />
              )}

              {/* Diagram Node Card */}
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex items-center justify-between gap-4 hover:border-cyan-500/50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{node.label}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Status: {node.status}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Node
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
