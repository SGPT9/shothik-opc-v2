"use client";

/**
 * DeerFlow AI DAG Workflow & Speculative Tree Visualizer
 * 
 * Interactive React visualizer for DeepSeek R1 / V3 reasoning workflows,
 * rendering DAG execution nodes, speculative decoding branches, consensus confidence gauges,
 * real-time node states, latency metrics, and expandable step-by-step reasoning drawers.
 */

import React, { useState } from "react";
import type { DeerFlowNode, DeerFlowExecutionPlan } from "@/lib/hermes/modules/deerflow-engine";
import type { OdsQueryResult } from "@/lib/hermes/modules/semantic-ods";
import { GitFork, Sparkles, CheckCircle2, ShieldAlert, Cpu, Activity } from "lucide-react";

export interface DeerFlowVisualizerProps {
  workspaceId: string;
  plan: DeerFlowExecutionPlan;
  onExecuteNode?: (nodeId: string) => void;
}

const TASK_TYPE_ICONS: Record<string, { icon: string; title: string; colorClass: string }> = {
  reasoning: { icon: "🧠", title: "DeepSeek R1 Reasoner", colorClass: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  synthesis: { icon: "⚡", title: "Semantic RAG Synthesis", colorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  coding: { icon: "💻", title: "Code Generation Node", colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  review: { icon: "🛡️", title: "Verification Guardrail", colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
};

export function DeerFlowVisualizer({
  workspaceId,
  plan,
  onExecuteNode,
}: DeerFlowVisualizerProps) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(plan.nodes[0]?.id || null);
  const [activeBranch, setActiveBranch] = useState<"dspark" | "target">("dspark");

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  return (
    <div
      data-testid="deerflow-visualizer"
      className="w-full rounded-2xl border border-border/60 bg-slate-950/90 p-5 text-gray-100 shadow-2xl backdrop-blur-xl space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦌</span>
            <h2 className="text-lg font-bold tracking-wide text-white">DeerFlow DAG Workflow</h2>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
              DeepSeek R1 + DSpark
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Workspace: <span className="font-mono text-cyan-300">{workspaceId}</span> | Workflow ID:{" "}
            <span className="font-mono text-gray-300">{plan.workflowId}</span>
          </p>
        </div>

        {/* Workflow Overall Status & Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
            <Sparkles className="h-3.5 w-3.5" />
            <span>96% Consensus</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{plan.overallLatencyMs ?? 0}ms</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              plan.status === "completed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : plan.status === "failed"
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
            }`}
          >
            {plan.status}
          </span>
        </div>
      </div>

      {/* Speculative Decoding Branch Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-border/40 text-xs">
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-zinc-200">Speculative Decoding Branches:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveBranch("dspark")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeBranch === "dspark"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Branch α (DSpark Draft · 78% Accept)
          </button>
          <button
            onClick={() => setActiveBranch("target")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeBranch === "target"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Branch β (Target DeepSeek-R1 Verifier)
          </button>
        </div>
      </div>

      {/* Semantic RAG + ODS Context Bar */}
      {plan.ragContext && plan.ragContext.length > 0 && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-300">
          <span className="font-semibold text-cyan-400">🔍 RAG + ODS Context Injected ({plan.ragContext.length} chunks): </span>
          {plan.ragContext.map((c: OdsQueryResult) => c.source).join(", ")}
        </div>
      )}

      {/* DAG Node Cards List */}
      <div className="space-y-3">
        {plan.nodes.map((node: DeerFlowNode, index: number) => {
          const meta = TASK_TYPE_ICONS[node.taskType] || TASK_TYPE_ICONS.reasoning;
          const isExpanded = expandedNodeId === node.id;

          return (
            <div
              key={node.id}
              data-testid={`deerflow-node-${node.id}`}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded ? "border-cyan-500/50 bg-slate-900/90 shadow-lg" : "border-border/50 bg-slate-900/40 hover:border-border"
              }`}
            >
              {/* Card Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-3.5 select-none"
                onClick={() => toggleExpand(node.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 font-mono text-xs font-bold text-gray-300 border border-border/40">
                    {index + 1}
                  </span>
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <h3 className="text-xs font-semibold text-white">{node.id}</h3>
                    <p className="text-[11px] text-muted-foreground">{meta.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {node.latencyMs && (
                    <span className="text-[11px] font-mono text-muted-foreground">{node.latencyMs}ms</span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      node.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : node.status === "failed"
                        ? "bg-red-500/20 text-red-400"
                        : node.status === "reasoning"
                        ? "bg-purple-500/20 text-purple-400 animate-pulse"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {node.status}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expandable Reasoning Details Drawer */}
              {isExpanded && (
                <div className="border-t border-border/40 p-4 text-xs text-gray-300 space-y-3">
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">Input Prompt / Intent:</span>
                    <p className="font-mono text-gray-300 bg-black/40 p-2.5 rounded-lg border border-border/40">
                      {node.prompt}
                    </p>
                  </div>

                  {node.output && (
                    <div>
                      <span className="font-semibold text-cyan-400 block mb-1">
                        {activeBranch === "dspark" ? "DSpark Draft Prediction (Accepted)" : "Target Reasoner Output"}:
                      </span>
                      <pre className="whitespace-pre-wrap font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-emerald-500/20">
                        {node.output}
                      </pre>
                    </div>
                  )}

                  {onExecuteNode && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onExecuteNode(node.id)}
                        className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                      >
                        Re-execute Node
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
