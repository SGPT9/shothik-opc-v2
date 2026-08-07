"use client";

/**
 * DeerFlow AI DAG Workflow Visualizer UI Component
 * 
 * Interactive React visualizer for DeepSeek R1 reasoning workflows,
 * rendering DAG execution nodes, real-time node states, latency metrics,
 * and expandable step-by-step reasoning output drawers.
 */

import React, { useState } from "react";
import type { DeerFlowNode, DeerFlowExecutionPlan } from "@/lib/hermes/modules/deerflow-engine";
import type { OdsQueryResult } from "@/lib/hermes/modules/semantic-ods";

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

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  return (
    <div
      data-testid="deerflow-visualizer"
      className="w-full rounded-xl border border-gray-800 bg-slate-950 p-6 text-gray-100 shadow-2xl backdrop-blur-lg"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦌</span>
            <h2 className="text-xl font-bold tracking-wide text-white">DeerFlow DAG Workflow</h2>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/30">
              DeepSeek R1 / V3
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Workspace: <span className="font-mono text-cyan-300">{workspaceId}</span> | Workflow ID:{" "}
            <span className="font-mono text-gray-300">{plan.workflowId}</span>
          </p>
        </div>

        {/* Workflow Overall Status */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Total Latency: {plan.overallLatencyMs ?? 0}ms</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
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

      {/* Semantic RAG + ODS Context Bar */}
      {plan.ragContext && plan.ragContext.length > 0 && (
        <div className="mb-6 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-300">
          <span className="font-semibold text-cyan-400">🔍 RAG + ODS Context Injected ({plan.ragContext.length} chunks): </span>
          {plan.ragContext.map((c: OdsQueryResult) => c.source).join(", ")}
        </div>
      )}

      {/* DAG Node Cards List */}
      <div className="space-y-4">
        {plan.nodes.map((node: DeerFlowNode, index: number) => {
          const meta = TASK_TYPE_ICONS[node.taskType] || TASK_TYPE_ICONS.reasoning;
          const isExpanded = expandedNodeId === node.id;

          return (
            <div
              key={node.id}
              data-testid={`deerflow-node-${node.id}`}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded ? "border-cyan-500/50 bg-slate-900/90 shadow-lg" : "border-gray-800 bg-slate-900/40 hover:border-gray-700"
              }`}
            >
              {/* Card Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => toggleExpand(node.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 font-mono text-sm font-bold text-gray-300">
                    {index + 1}
                  </span>
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{node.id}</h3>
                    <p className="text-xs text-gray-400">{meta.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {node.latencyMs && (
                    <span className="text-xs font-mono text-gray-400">{node.latencyMs}ms</span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
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

                  <button
                    type="button"
                    className="text-gray-400 hover:text-white"
                    aria-label={isExpanded ? "Collapse node details" : "Expand node details"}
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {/* Expandable Reasoning Details Drawer */}
              {isExpanded && (
                <div className="border-t border-gray-800/60 p-4 text-xs text-gray-300">
                  <div className="mb-3">
                    <span className="font-semibold text-gray-400">Input Prompt:</span>
                    <p className="mt-1 font-mono text-gray-300 bg-black/40 p-2 rounded border border-gray-800">
                      {node.prompt}
                    </p>
                  </div>

                  {node.output && (
                    <div>
                      <span className="font-semibold text-cyan-400">DeepSeek R1 Output:</span>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-emerald-500/20">
                        {node.output}
                      </pre>
                    </div>
                  )}

                  {onExecuteNode && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onExecuteNode(node.id)}
                        className="rounded-lg bg-cyan-600 px-3 py-1.5 font-medium text-white hover:bg-cyan-500 transition-colors"
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
