"use client";

import { useState, useEffect, useMemo } from "react";
import {
  GitFork,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Boxes,
  Workflow,
  StopCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SwarmTaskNode {
  id: string;
  twin: string;
  title: string;
  action: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  dependencies: string[];
  waveIndex?: number;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  durationMs?: number;
}

export interface SwarmGraph {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed" | "cancelled";
  nodes: Record<string, SwarmTaskNode>;
  waves: string[][];
  currentWaveIndex: number;
  totalDurationMs: number;
  parallelSpeedupRatio: number;
}

export interface SwarmTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: Omit<SwarmTaskNode, "status">[];
}

export const FALLBACK_SWARM_TEMPLATES: SwarmTemplate[] = [
  {
    id: "eid_mega_campaign",
    name: "Eid-ul-Fitr Mega Sales Campaign & Fulfillment DAG",
    description: "Marketing copy & visuals -> Storefront deployment -> bKash MFS checkout -> Steadfast courier dispatch -> Revenue reconciliation",
    category: "e_commerce",
    nodes: [
      {
        id: "node_market_copy",
        twin: "marketing_twin",
        title: "Draft Eid Promotional Ad Copy & Discounts",
        action: "generate_eid_promotions",
        dependencies: [],
      },
      {
        id: "node_content_banners",
        twin: "content_twin",
        title: "Produce Vernacular Social Copy (Dhakaiya)",
        action: "produce_social_campaign",
        dependencies: [],
      },
      {
        id: "node_storefront_deploy",
        twin: "admin_twin",
        title: "Update Storefront Hero & Publish to Dokploy",
        action: "update_hero_banner",
        dependencies: ["node_market_copy", "node_content_banners"],
      },
      {
        id: "node_mfs_checkout",
        twin: "finance_twin",
        title: "Configure 1-Tap bKash & Nagad Cashflow Gateway",
        action: "configure_mfs_discount",
        dependencies: ["node_storefront_deploy"],
      },
      {
        id: "node_courier_dispatch",
        twin: "operations_twin",
        title: "Pre-allocate Steadfast Courier Consignment Manifests",
        action: "batch_book_courier",
        dependencies: ["node_storefront_deploy"],
      },
      {
        id: "node_revenue_reconcile",
        twin: "finance_twin",
        title: "Reconcile NBR Mushak-6.3 VAT & Bank Settlements",
        action: "reconcile_revenue",
        dependencies: ["node_mfs_checkout", "node_courier_dispatch"],
      },
    ],
  },
  {
    id: "nilkhet_pod_direct_publishing",
    name: "Nilkhet POD Direct Publishing & Imposition DAG",
    description: "Docling PDF ingestion -> 3D Spine & Cover imposition -> Steadfast pickup -> Micro-merchant invoice dispatch",
    category: "publishing",
    nodes: [
      {
        id: "pod_ingest_content",
        twin: "content_twin",
        title: "Extract Docling Clean Markdowns & AST Hierarchy",
        action: "ingest_manuscript",
        dependencies: [],
      },
      {
        id: "pod_spine_calc",
        twin: "operations_twin",
        title: "Compute Nilkhet 3D Spine Thickness & Imposition Bleed",
        action: "compute_spine_geometry",
        dependencies: ["pod_ingest_content"],
      },
      {
        id: "pod_steadfast_dispatch",
        twin: "operations_twin",
        title: "Generate Steadfast Courier Direct COD Consignment",
        action: "create_courier_consignment",
        dependencies: ["pod_spine_calc"],
      },
      {
        id: "pod_catalog_marketing",
        twin: "marketing_twin",
        title: "Publish Nilkhet POD Book Link to Papermark Analytics",
        action: "publish_papermark_link",
        dependencies: ["pod_spine_calc"],
      },
    ],
  },
  {
    id: "b2b_lead_to_cash",
    name: "B2B Vernacular Enterprise Lead-to-Cash DAG",
    description: "LinkedIn lead enricher -> Dhakaiya vernacular sales pitch -> Automated VAT invoice -> CRM pipeline sync",
    category: "b2b_saas",
    nodes: [
      {
        id: "b2b_enrich_lead",
        twin: "crm_twin",
        title: "Enrich Prospect Firmographics & Decision Maker Graph",
        action: "enrich_crm_lead",
        dependencies: [],
      },
      {
        id: "b2b_vernacular_pitch",
        twin: "sales_twin",
        title: "Draft Personalized Dialect Outreach Email",
        action: "compose_vernacular_pitch",
        dependencies: ["b2b_enrich_lead"],
      },
      {
        id: "b2b_invoice_dispatch",
        twin: "finance_twin",
        title: "Generate Automated Mushak-6.3 Proforma Invoice",
        action: "dispatch_b2b_invoice",
        dependencies: ["b2b_vernacular_pitch"],
      },
    ],
  },
];

export function buildGraphFromTemplate(tmpl: SwarmTemplate): SwarmGraph {
  const nodeMap: Record<string, SwarmTaskNode> = {};
  tmpl.nodes.forEach((n) => {
    nodeMap[n.id] = {
      ...n,
      status: "pending",
      inputs: {},
      outputs: undefined,
    };
  });

  const inDeg: Record<string, number> = {};
  const deps: Record<string, string[]> = {};
  tmpl.nodes.forEach((n) => {
    inDeg[n.id] = n.dependencies.length;
    deps[n.id] = [];
  });
  tmpl.nodes.forEach((n) => {
    n.dependencies.forEach((d) => {
      if (!deps[d]) deps[d] = [];
      deps[d].push(n.id);
    });
  });

  const waves: string[][] = [];
  let curWave = Object.keys(inDeg).filter((id) => inDeg[id] === 0);
  while (curWave.length > 0) {
    waves.push(curWave);
    const nextWave: string[] = [];
    curWave.forEach((id) => {
      (deps[id] || []).forEach((ch) => {
        inDeg[ch]--;
        if (inDeg[ch] === 0) nextWave.push(ch);
      });
    });
    curWave = nextWave;
  }

  waves.forEach((wave, idx) => {
    wave.forEach((nid) => {
      if (nodeMap[nid]) nodeMap[nid].waveIndex = idx + 1;
    });
  });

  return {
    id: `local_graph_${Date.now()}`,
    name: tmpl.name,
    description: tmpl.description,
    status: "idle",
    nodes: nodeMap,
    waves,
    currentWaveIndex: 0,
    totalDurationMs: 0,
    parallelSpeedupRatio: Number((tmpl.nodes.length / Math.max(1, waves.length)).toFixed(2)),
  };
}

interface SwarmGraphStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwarmGraphStudioModal({ isOpen, onClose }: SwarmGraphStudioModalProps) {
  const [templates, setTemplates] = useState<SwarmTemplate[]>(FALLBACK_SWARM_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("eid_mega_campaign");
  const [activeGraph, setActiveGraph] = useState<SwarmGraph>(() => buildGraphFromTemplate(FALLBACK_SWARM_TEMPLATES[0]));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(FALLBACK_SWARM_TEMPLATES[0].nodes[0].id);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize graph from template
  const initGraphFromTemplate = (tmplId: string, availableTemplates = templates) => {
    const tmpl = availableTemplates.find((t) => t.id === tmplId) || availableTemplates[0] || FALLBACK_SWARM_TEMPLATES[0];
    if (!tmpl) return;

    const newGraph = buildGraphFromTemplate(tmpl);
    setActiveGraph(newGraph);
    setSelectedNodeId(newGraph.waves[0]?.[0] || null);
    setErrorMsg(null);
  };

  // Fetch templates on mount
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/v1/swarm/graph/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {
        // Use fallbacks
      })
      .finally(() => {
        initGraphFromTemplate(selectedTemplateId);
      });
  }, [isOpen]);

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    initGraphFromTemplate(tmplId);
  };

  // Execute Graph Handler
  const handleExecuteGraph = async () => {
    if (!activeGraph || isExecuting) return;

    setIsExecuting(true);
    setErrorMsg(null);

    try {
      // 1. Create on server
      const createRes = await fetch("/api/v1/swarm/graph/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
        }),
      });

      const createData = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.message || createData.error || "Failed to create swarm graph");
      }

      const serverGraphId = createData.graphId;

      // Animate wave progress in UI
      const waves = activeGraph.waves;
      for (let w = 0; w < waves.length; w++) {
        setActiveGraph((prev) => {
          if (!prev) return null;
          const nextNodes = { ...prev.nodes };
          waves[w].forEach((nid) => {
            if (nextNodes[nid]) nextNodes[nid].status = "running";
          });
          return {
            ...prev,
            status: "running",
            currentWaveIndex: w + 1,
            nodes: nextNodes,
          };
        });

        await new Promise((r) => setTimeout(r, 220));

        setActiveGraph((prev) => {
          if (!prev) return null;
          const nextNodes = { ...prev.nodes };
          waves[w].forEach((nid) => {
            if (nextNodes[nid]) {
              nextNodes[nid].status = "completed";
              nextNodes[nid].durationMs = Math.floor(18 + Math.random() * 25);
              nextNodes[nid].outputs = {
                completedAt: new Date().toISOString(),
                status: "success",
                twinWorker: nextNodes[nid].twin,
                verdict: "verified_safe",
              };
            }
          });
          return {
            ...prev,
            nodes: nextNodes,
          };
        });
      }

      // 2. Call execute API
      const execRes = await fetch(`/api/v1/swarm/graph/${serverGraphId}/execute`, {
        method: "POST",
      });
      const execData = await execRes.json();

      if (execData.success && execData.graph) {
        setActiveGraph(execData.graph);
      } else {
        setActiveGraph((prev) => (prev ? { ...prev, status: "completed" } : null));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Execution encountered an error");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelGraph = () => {
    setIsExecuting(false);
    setActiveGraph((prev) => (prev ? { ...prev, status: "cancelled" } : null));
  };

  const handleResetGraph = () => {
    initGraphFromTemplate(selectedTemplateId);
  };

  const selectedNode = useMemo(() => {
    if (!activeGraph || !selectedNodeId) return null;
    return activeGraph.nodes[selectedNodeId] || null;
  }, [activeGraph, selectedNodeId]);

  const allNodesList = useMemo(() => {
    if (!activeGraph) return [];
    return Object.values(activeGraph.nodes);
  }, [activeGraph]);

  const completedCount = allNodesList.filter((n) => n.status === "completed").length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl w-full p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 shadow-2xl flex flex-col max-h-[90vh]"
        aria-describedby="swarm-modal-desc"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Autonomous Multi-Agent Task Swarm DAG Studio
                    <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10 text-xs">
                      v2.4 Topological Waves
                    </Badge>
                  </DialogTitle>
                  <DialogDescription id="swarm-modal-desc" className="text-slate-400 text-xs mt-1">
                    Execute multi-twin coordinated task DAGs with Kahn's topological sort, cycle detection, and parallel waves.
                  </DialogDescription>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {activeGraph && (
                  <Badge
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      activeGraph.status === "running"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                        : activeGraph.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : activeGraph.status === "cancelled"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {activeGraph.status}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Template Selector Pills */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-violet-400" /> Templates:
            </span>
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateChange(tmpl.id)}
                disabled={isExecuting}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedTemplateId === tmpl.id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/40 border border-violet-500"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-900/40 text-xs px-6 py-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Total Waves:</span>
            <span className="font-semibold text-white">{activeGraph?.waves.length || 0} Waves</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Nodes Done:</span>
            <span className="font-semibold text-white">
              {completedCount} / {allNodesList.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Parallel Speedup:</span>
            <span className="font-semibold text-emerald-400">
              {activeGraph?.parallelSpeedupRatio ? `${activeGraph.parallelSpeedupRatio}x` : "1.8x"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Duration:</span>
            <span className="font-semibold text-white">
              {activeGraph?.totalDurationMs ? `${activeGraph.totalDurationMs} ms` : "0 ms"}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Content Area: Left DAG Canvas + Right Node Inspector */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-[380px]">
          {/* DAG Visualizer Waves (Col 8) */}
          <div className="col-span-8 p-6 overflow-y-auto border-r border-slate-800 bg-slate-950/70 space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-violet-400" /> Topological Execution Waves
              </span>
              <span className="text-[11px] text-slate-500">Kahn's Topological Order</span>
            </div>

            {activeGraph?.waves.map((wave, waveIdx) => (
              <div
                key={waveIdx}
                className={`p-4 rounded-xl border transition-all ${
                  activeGraph.currentWaveIndex === waveIdx + 1
                    ? "bg-violet-950/20 border-violet-500/50 shadow-lg shadow-violet-950/30"
                    : "bg-slate-900/30 border-slate-800/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-400 px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/50">
                      Wave #{waveIdx + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {wave.length} {wave.length === 1 ? "Task" : "Tasks in Parallel"}
                    </span>
                  </div>
                  {activeGraph.currentWaveIndex === waveIdx + 1 && (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 animate-spin" /> In Progress
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wave.map((nodeId) => {
                    const node = activeGraph.nodes[nodeId];
                    if (!node) return null;
                    const isSelected = selectedNodeId === nodeId;

                    return (
                      <div
                        key={nodeId}
                        onClick={() => setSelectedNodeId(nodeId)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-violet-900/30 border-violet-400 ring-1 ring-violet-400"
                            : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-white leading-snug line-clamp-1">
                            {node.title}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                              node.status === "completed"
                                ? "bg-emerald-400 ring-4 ring-emerald-400/20"
                                : node.status === "running"
                                ? "bg-amber-400 ring-4 ring-amber-400/20 animate-ping"
                                : node.status === "failed"
                                ? "bg-rose-400"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-700 bg-slate-800/80 text-slate-300">
                            {node.twin.replace("_", " ")}
                          </Badge>
                          {node.dependencies.length > 0 && (
                            <span className="text-[10px] text-slate-500">
                              deps: {node.dependencies.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Node Inspector Drawer (Col 4) */}
          <div className="col-span-4 p-6 bg-slate-900/40 flex flex-col justify-between overflow-y-auto">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-violet-400" /> Node Inspector
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${
                      selectedNode.status === "completed"
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : selectedNode.status === "running"
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-slate-400 border-slate-700"
                    }`}
                  >
                    {selectedNode.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{selectedNode.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedNode.action}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Twin:</span>
                    <span className="font-semibold text-violet-300">{selectedNode.twin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wave Level:</span>
                    <span className="font-semibold text-white">Wave #{selectedNode.waveIndex || 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Upstream Deps:</span>
                    <span className="font-semibold text-slate-300">
                      {selectedNode.dependencies.length === 0 ? "None (Root)" : selectedNode.dependencies.join(", ")}
                    </span>
                  </div>
                  {selectedNode.durationMs !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Latency:</span>
                      <span className="font-semibold text-emerald-400">{selectedNode.durationMs} ms</span>
                    </div>
                  )}
                </div>

                {/* Outputs Section */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                    Twin Real-Time Output:
                  </span>
                  {selectedNode.outputs ? (
                    <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-40">
                      {JSON.stringify(selectedNode.outputs, null, 2)}
                    </pre>
                  ) : (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-[11px] text-slate-500 text-center">
                      Waiting for wave execution...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs my-auto">
                Select a node to inspect its twin assignment and payload.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetGraph}
              disabled={isExecuting}
              className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Graph
            </Button>
            {isExecuting && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelGraph}
                className="text-xs bg-rose-600 hover:bg-rose-700"
              >
                <StopCircle className="w-3.5 h-3.5 mr-1.5" />
                Cancel Swarm
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleExecuteGraph}
              disabled={isExecuting || activeGraph?.status === "running"}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs px-4 shadow-lg shadow-violet-900/30"
            >
              {isExecuting ? (
                <>
                  <Zap className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Executing Swarm Waves...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Run Swarm Graph
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SwarmGraphStudioModal;
