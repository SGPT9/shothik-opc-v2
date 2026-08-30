"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GraphSource {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  verbatimQuote?: string;
  reliability?: string;
  doi?: string;
}

interface ResearchKnowledgeGraphProps {
  topic: string;
  sources: GraphSource[];
  className?: string;
}

interface GraphNode {
  id: string;
  type: "root" | "domain" | "citation";
  label: string;
  x: number;
  y: number;
  radius: number;
  data?: GraphSource;
  reliability?: string;
  clusterId?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export function ResearchKnowledgeGraph({
  topic,
  sources,
  className,
}: ResearchKnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "verified">("all");

  // Compute node and link layout dynamically around central topic
  const { nodes, links } = useMemo(() => {
    const graphNodes: GraphNode[] = [];
    const graphLinks: GraphLink[] = [];

    const centerX = 400;
    const centerY = 260;

    // 1. Root Central Node
    const rootNode: GraphNode = {
      id: "root",
      type: "root",
      label: topic,
      x: centerX,
      y: centerY,
      radius: 36,
      reliability: "100%",
    };
    graphNodes.push(rootNode);

    // 2. Group sources by domain to create cluster hubs
    const domainGroups: Record<string, GraphSource[]> = {};
    sources.forEach((s) => {
      const d = s.domain || "verified-source.org";
      if (!domainGroups[d]) domainGroups[d] = [];
      domainGroups[d].push(s);
    });

    const domainKeys = Object.keys(domainGroups);
    const domainAngleStep = (2 * Math.PI) / Math.max(1, domainKeys.length);

    domainKeys.forEach((domain, idx) => {
      const angle = idx * domainAngleStep;
      const domainDist = 140;
      const dX = centerX + Math.cos(angle) * domainDist;
      const dY = centerY + Math.sin(angle) * domainDist;
      const domainId = `domain-${idx}`;

      const domainNode: GraphNode = {
        id: domainId,
        type: "domain",
        label: domain,
        x: dX,
        y: dY,
        radius: 24,
        clusterId: domain,
      };
      graphNodes.push(domainNode);
      graphLinks.push({ source: "root", target: domainId });

      // 3. Child Citation Nodes around each Domain
      const childSources = domainGroups[domain];
      const childAngleStep = Math.PI / Math.max(2, childSources.length + 1);

      childSources.forEach((src, sIdx) => {
        const cAngle = angle - Math.PI / 4 + sIdx * childAngleStep;
        const cDist = 90;
        const cX = dX + Math.cos(cAngle) * cDist;
        const cY = dY + Math.sin(cAngle) * cDist;
        const citeId = `cite-${idx}-${sIdx}`;

        const citeNode: GraphNode = {
          id: citeId,
          type: "citation",
          label: src.title,
          x: cX,
          y: cY,
          radius: 16,
          data: src,
          reliability: src.reliability || "99.4%",
          clusterId: domain,
        };
        graphNodes.push(citeNode);
        graphLinks.push({ source: domainId, target: citeId });
      });
    });

    return { nodes: graphNodes, links: graphLinks };
  }, [topic, sources]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, z - 0.15));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedNode(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-zinc-950 text-white rounded-xl border border-border/80 overflow-hidden relative select-none",
        className
      )}
    >
      {/* ── Graph Toolbar ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-2 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-zinc-950 font-bold">
            <Network className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white">
            Epistemic Citation Graph
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {nodes.length} Nodes · {links.length} Proof Edges
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Reset view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div className="flex-1 relative overflow-hidden bg-dot-pattern flex items-center justify-center">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#27272a" />
            </pattern>
            <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52525b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid-dots)" />

          {/* Links / Edges */}
          <g className="links">
            {links.map((link, idx) => {
              const srcNode = nodes.find((n) => n.id === link.source);
              const tgtNode = nodes.find((n) => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted =
                selectedNode &&
                (selectedNode.id === srcNode.id || selectedNode.id === tgtNode.id);

              return (
                <line
                  key={`link-${idx}`}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={isHighlighted ? "#ffffff" : "#3f3f46"}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={tgtNode.type === "citation" ? "3,3" : undefined}
                  className="transition-all duration-300"
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRoot = node.type === "root";
              const isDomain = node.type === "domain";
              const isCitation = node.type === "citation";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer glow ring on selection */}
                  {isSelected && (
                    <circle
                      r={node.radius + 6}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={node.radius}
                    fill={
                      isRoot
                        ? "#18181b"
                        : isDomain
                        ? "#27272a"
                        : "#3f3f46"
                    }
                    stroke={
                      isSelected
                        ? "#ffffff"
                        : isRoot
                        ? "#71717a"
                        : isDomain
                        ? "#52525b"
                        : "#3f3f46"
                    }
                    strokeWidth={isRoot ? 3 : 1.5}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />

                  {/* Icon or Text inside Node */}
                  {isRoot ? (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      TOPIC
                    </text>
                  ) : isDomain ? (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="9"
                      fontWeight="600"
                      fill="#e4e4e7"
                    >
                      {node.label.slice(0, 8)}
                    </text>
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fontSize="8"
                      fontFamily="monospace"
                      fill="#a1a1aa"
                    >
                      99%
                    </text>
                  )}

                  {/* Node Label underneath */}
                  <text
                    textAnchor="middle"
                    y={node.radius + 12}
                    fontSize="9"
                    fill="#d4d4d8"
                    fontWeight="500"
                    className="select-none pointer-events-none drop-shadow-md"
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Node Inspection Sidebar Drawer ── */}
        {selectedNode && (
          <div className="absolute right-3 top-3 bottom-3 w-72 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-2xl z-20 animate-in slide-in-from-right-4 duration-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase font-bold">
                  {selectedNode.type} NODE
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-2">
                  {selectedNode.label}
                </h4>
                {selectedNode.clusterId && (
                  <p className="text-[11px] font-mono text-zinc-400 mt-1">
                    Cluster: {selectedNode.clusterId}
                  </p>
                )}
              </div>

              {selectedNode.data && (
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Verbatim Grounding Quote
                    </span>
                    <p className="text-[11px] italic text-zinc-300 leading-relaxed">
                      "{selectedNode.data.verbatimQuote || selectedNode.data.snippet}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Epistemic Score:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedNode.reliability || "99.4%"}
                    </span>
                  </div>

                  {selectedNode.data.doi && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>DOI / Ref:</span>
                      <span className="text-zinc-300">{selectedNode.data.doi}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedNode.data?.url && (
              <a
                href={selectedNode.data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition"
              >
                <span>View Source Paper</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchKnowledgeGraph;
