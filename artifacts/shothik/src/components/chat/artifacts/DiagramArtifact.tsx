import { useState } from "react";
import { Network, Download, Sparkles, ZoomIn, ZoomOut, RefreshCw, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiagramNode {
  id: string;
  label: string;
  type: "user" | "gateway" | "baas" | "ai" | "storage" | "mfs";
  status: "active" | "idle" | "ready";
  latency: string;
  desc: string;
}

interface DiagramArtifactProps {
  initialTitle?: string;
  isStreaming?: boolean;
}

export function DiagramArtifact({
  initialTitle = "Shothik System Architecture & Swarm Data Flow",
  isStreaming = false,
}: DiagramArtifactProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const nodes: DiagramNode[] = [
    { id: "n1", label: "Client Workspace (Next.js 15 / React 18)", type: "user", status: "active", latency: "<1ms", desc: "Low-RAM Edge client with virtualized UI and local IndexedDB state replication." },
    { id: "n2", label: "Hermes API Gateway (Port 8080)", type: "gateway", status: "active", latency: "4ms", desc: "Reverse proxy and rate limiting gateway dispatching client requests to microservices." },
    { id: "n3", label: "InsForge Postgres BaaS + PostgREST", type: "baas", status: "ready", latency: "6ms", desc: "PostgreSQL 17 ACID database with strict Row-Level Security (RLS) enforcement." },
    { id: "n4", label: "DeepSeek / OpenRouter AI Swarm Mesh", type: "ai", status: "active", latency: "140ms", desc: "Multi-agent model orchestrator for autonomous research, slides, and sheets." },
    { id: "n5", label: "Vector RAG Context Memory Store", type: "storage", status: "ready", latency: "12ms", desc: "Embeddings vector cache for grounded citation retrieval and document search." },
    { id: "n6", label: "bKash & Nagad MFS Settlement Engine", type: "mfs", status: "ready", latency: "45ms", desc: "Instant automated TrxID payment validation and Steadfast parcel booking API." },
  ];

  const handleCopyMermaid = () => {
    const mermaidCode = `graph TD
  A[Client Workspace Next.js 15] -->|WebSocket / HTTPS| B[Hermes API Gateway Port 8080]
  B -->|JWT Auth & RLS| C[(InsForge PostgreSQL BaaS)]
  B -->|Streaming Prompts| D[DeepSeek / OpenRouter AI Swarm]
  D -->|Semantic Search| E[(Vector RAG Memory Store)]
  B -->|Instant Webhooks| F[bKash & Nagad MFS Checkout]`;
    navigator.clipboard.writeText(mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  const handleExportSVG = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" style="background:#020617;font-family:sans-serif;">
  <rect width="800" height="600" fill="#020617"/>
  <text x="40" y="50" fill="#38bdf8" font-size="18" font-weight="bold">${initialTitle}</text>
  ${nodes.map((node, i) => `
    <g transform="translate(100, ${90 + i * 80})">
      <rect width="600" height="55" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="30" y="34" fill="#ffffff" font-size="13" font-weight="bold">${node.label}</text>
      <text x="500" y="34" fill="#38bdf8" font-size="11" font-family="monospace">${node.latency}</text>
    </g>
  `).join("")}
</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shothik-architecture-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden select-none relative">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border/60 bg-muted/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Network className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">{initialTitle}</h3>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Interactive Topology · {nodes.length} Operational Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyMermaid}
            className="h-7 px-2 text-[11px] font-semibold gap-1"
            title="Copy Mermaid.js diagram definition"
          >
            {copiedMermaid ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedMermaid ? "Copied" : "Mermaid"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="h-7 w-7 p-0 rounded-lg"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground px-1">{zoom}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="h-7 w-7 p-0 rounded-lg"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSVG}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1 cursor-pointer bg-cyan-600/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-600/20"
          >
            <Download className="h-3 w-3 text-cyan-400" />
            <span>SVG Export</span>
          </Button>
        </div>
      </div>

      {/* Diagram Interactive Canvas */}
      <div className="flex-1 min-h-0 p-6 overflow-auto flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] custom-scrollbar">
        <div
          style={{ transform: `scale(${zoom / 100})` }}
          className="w-full max-w-2xl space-y-3 transition-transform duration-200"
        >
          {nodes.map((node, i) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div key={node.id} className="relative flex flex-col items-center">
                {/* Connector line */}
                {i > 0 && (
                  <div className="h-5 w-0.5 bg-gradient-to-b from-cyan-500 to-indigo-500 my-0.5 animate-pulse" />
                )}

                {/* Diagram Node Card */}
                <div
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={cn(
                    "w-full rounded-2xl border bg-card/80 backdrop-blur-xl p-3.5 shadow-lg flex items-center justify-between gap-4 transition cursor-pointer",
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/10 shadow-cyan-500/20"
                      : "border-border/80 hover:border-cyan-500/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                      0{i + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{node.label}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">Latency: {node.latency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {node.status}
                    </span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Bottom Drawer */}
      {selectedNode && (
        <div className="absolute inset-x-0 bottom-0 bg-background/95 border-t border-border p-4 shadow-2xl backdrop-blur-xl space-y-1.5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> Node Inspection: {selectedNode.label}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted/40 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{selectedNode.desc}</p>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-1">
            <span>Latency: <strong className="text-emerald-400">{selectedNode.latency}</strong></span>
            <span>•</span>
            <span>Security: <strong className="text-cyan-400">Zero-Trust TLS 1.3</strong></span>
            <span>•</span>
            <span>High Availability: <strong className="text-foreground">99.99%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
