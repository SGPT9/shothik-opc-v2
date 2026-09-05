/**
 * Autonomous Multi-Agent Task Swarm DAG Scheduler
 * 
 * Implements a Directed Acyclic Graph (DAG) runtime execution engine
 * for coordinating parallelized tasks across the 9 Specialized Twins:
 * - Marketing Twin (Campaign generation, meta ad copy, promo assets)
 * - Sales Twin (Lead qualification, deal negotiation, conversion)
 * - Customer Support Twin (Customer inquiries, SLA tickets, refunds)
 * - CRM Twin (Customer records, retention cadences, enrichment)
 * - Finance Twin (bKash/Nagad PGW reconciliation, invoicing, VAT)
 * - Operations Twin (Steadfast Courier dispatch, inventory, tracking)
 * - Content Twin (Bangla/English copy, documentation, scripts)
 * - Analytics Twin (Telemetry, cohort analysis, conversion metrics)
 * - Admin Twin (Access control, key vault, system configuration)
 * 
 * Features:
 * - Kahn's algorithm topological sorting into parallel execution waves
 * - Strict cycle detection and dependency deadlock prevention
 * - Cross-twin data pipeline (pipes upstream outputs to downstream inputs)
 * - Real-time execution wave telemetry & parallel speedup ratio calculation
 * - Pre-packaged enterprise templates (Eid Campaign, Nilkhet POD, B2B Lead-to-Cash)
 */

export type SpecializedTwinType =
  | "marketing_twin"
  | "sales_twin"
  | "support_twin"
  | "crm_twin"
  | "finance_twin"
  | "operations_twin"
  | "content_twin"
  | "analytics_twin"
  | "admin_twin";

export type TaskStatus = "pending" | "scheduled" | "running" | "completed" | "failed" | "cancelled";

export interface SwarmTaskNode {
  id: string;
  twin: SpecializedTwinType;
  title: string;
  description?: string;
  action: string;
  dependencies: string[]; // Prerequisite node IDs
  status: TaskStatus;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  waveIndex?: number;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface SwarmGraph {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed" | "cancelled";
  nodes: Record<string, SwarmTaskNode>;
  waves: string[][]; // Node IDs per parallel execution wave
  currentWaveIndex: number;
  totalDurationMs: number;
  parallelSpeedupRatio: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphTemplate {
  id: string;
  name: string;
  description: string;
  category: "e_commerce" | "publishing" | "b2b_saas";
  nodes: Omit<SwarmTaskNode, "status">[];
}

export const PREBUILT_SWARM_TEMPLATES: GraphTemplate[] = [
  {
    id: "eid_mega_campaign",
    name: "Eid-ul-Fitr Mega Sales Campaign & Fulfillment DAG",
    description: "Multi-twin coordinated campaign: Meta ad copy & visuals -> Storefront deployment -> bKash MFS checkout -> Steadfast courier batch booking -> Finance reconciliation.",
    category: "e_commerce",
    nodes: [
      {
        id: "node_market_copy",
        twin: "marketing_twin",
        title: "Draft Eid Promotional Ad Copy & Discounts",
        action: "generate_eid_promotions",
        dependencies: [],
        inputs: { discountPercent: 20, targetAudience: "Dhaka & Chittagong Shoppers" },
      },
      {
        id: "node_content_banners",
        twin: "content_twin",
        title: "Produce Vernacular Social Copy (Dhakaiya & Standard)",
        action: "produce_social_campaign",
        dependencies: [],
        inputs: { theme: "Festive Joy & Rapid Delivery" },
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
        id: "node_analytics_reconcile",
        twin: "analytics_twin",
        title: "Track Campaign ROAS, Conversion Lift & Net Margin",
        action: "compute_campaign_telemetry",
        dependencies: ["node_mfs_checkout", "node_courier_dispatch"],
      },
    ],
  },
  {
    id: "nilkhet_pod_direct_publishing",
    name: "Nilkhet POD Book Imposition & Press Hub Dispatch DAG",
    description: "End-to-end publishing swarm: Manuscript formatting -> 16-Up CMYK Imposition -> Nilkhet Press Hub Dispatch -> Steadfast COD Delivery.",
    category: "publishing",
    nodes: [
      {
        id: "node_manuscript_prep",
        twin: "content_twin",
        title: "Compile Manuscript Chapters & Typesetting Layout",
        action: "format_manuscript",
        dependencies: [],
        inputs: { trimSize: "6x9", pageCount: 192, paperStock: "80gsm_cream" },
      },
      {
        id: "node_spine_geometry",
        twin: "operations_twin",
        title: "Calculate Sub-Millimeter Spine Math & Creep Margin",
        action: "calculate_spine_geometry",
        dependencies: ["node_manuscript_prep"],
      },
      {
        id: "node_cmyk_imposition",
        twin: "operations_twin",
        title: "Render 16-Up Signature Imposition & JDF Job Ticket",
        action: "generate_signatures",
        dependencies: ["node_spine_geometry"],
      },
      {
        id: "node_press_dispatch",
        twin: "sales_twin",
        title: "Dispatch Print Order to Bakushah Market Press Complex",
        action: "dispatch_nilkhet_hub",
        dependencies: ["node_cmyk_imposition"],
      },
      {
        id: "node_cod_courier",
        twin: "finance_twin",
        title: "Link Steadfast Courier COD Consignment & MFS Settlement",
        action: "book_steadfast_cod",
        dependencies: ["node_press_dispatch"],
      },
    ],
  },
  {
    id: "b2b_lead_to_cash",
    name: "B2B Enterprise Lead-to-Cash Automation DAG",
    description: "Cross-twin enterprise pipeline: Competitor ad spy -> Lead qualification CRM -> 3-step personalized outreach sequence -> Mushak-6.3 VAT invoicing.",
    category: "b2b_saas",
    nodes: [
      {
        id: "node_ad_spy",
        twin: "marketing_twin",
        title: "Scrape Competitor Ad Spends & Creative Strategy",
        action: "scrape_competitor_ads",
        dependencies: [],
        inputs: { domain: "fintech_bd" },
      },
      {
        id: "node_crm_enrich",
        twin: "crm_twin",
        title: "Enrich B2B Target Leads with Phone, BIN & Decision Maker",
        action: "enrich_crm_leads",
        dependencies: ["node_ad_spy"],
      },
      {
        id: "node_cold_outreach",
        twin: "sales_twin",
        title: "Dispatch 3-Step Cold Email Sequences via EmailOutreachEngine",
        action: "dispatch_email_sequence",
        dependencies: ["node_crm_enrich"],
      },
      {
        id: "node_vat_invoice",
        twin: "finance_twin",
        title: "Issue Mushak-6.3 Compliant Tax Invoice & MFS Link",
        action: "generate_mushak_invoice",
        dependencies: ["node_cold_outreach"],
      },
    ],
  },
];

export class SwarmDagScheduler {
  private static instance: SwarmDagScheduler;
  private graphs: Map<string, SwarmGraph> = new Map();

  static getInstance(): SwarmDagScheduler {
    if (!SwarmDagScheduler.instance) {
      SwarmDagScheduler.instance = new SwarmDagScheduler();
    }
    return SwarmDagScheduler.instance;
  }

  /**
   * Returns pre-packaged DAG templates.
   */
  getTemplates(): GraphTemplate[] {
    return PREBUILT_SWARM_TEMPLATES;
  }

  /**
   * Computes topological sorting and execution waves using Kahn's algorithm.
   */
  computeTopologicalWaves(nodesMap: Record<string, SwarmTaskNode>): {
    waves: string[][];
    hasCycle: boolean;
  } {
    const nodeIds = Object.keys(nodesMap);
    const inDegree: Map<string, number> = new Map();
    const dependents: Map<string, string[]> = new Map();

    for (const id of nodeIds) {
      inDegree.set(id, 0);
      dependents.set(id, []);
    }

    // Build graph edges and calculate in-degrees
    for (const id of nodeIds) {
      const node = nodesMap[id];
      const deps = node.dependencies || [];
      inDegree.set(id, deps.length);

      for (const parentId of deps) {
        if (!dependents.has(parentId)) {
          dependents.set(parentId, []);
        }
        dependents.get(parentId)!.push(id);
      }
    }

    const waves: string[][] = [];
    let processedCount = 0;

    // Queue nodes with 0 in-degree
    let currentWave: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        currentWave.push(id);
      }
    }

    while (currentWave.length > 0) {
      waves.push(currentWave);
      processedCount += currentWave.length;

      const nextWave: string[] = [];

      for (const completedId of currentWave) {
        const downstream = dependents.get(completedId) || [];
        for (const childId of downstream) {
          const currentDeg = inDegree.get(childId)! - 1;
          inDegree.set(childId, currentDeg);

          if (currentDeg === 0) {
            nextWave.push(childId);
          }
        }
      }

      currentWave = nextWave;
    }

    return {
      waves,
      hasCycle: processedCount < nodeIds.length,
    };
  }

  /**
   * Instantiates a new DAG graph from custom nodes or a prebuilt template.
   */
  createGraph(payload: {
    name: string;
    description?: string;
    templateId?: string;
    nodes?: SwarmTaskNode[];
  }): SwarmGraph {
    let rawNodes: SwarmTaskNode[] = [];
    const template = payload.templateId ? PREBUILT_SWARM_TEMPLATES.find((t) => t.id === payload.templateId) : undefined;

    if (payload.templateId) {
      if (!template) {
        throw new Error(`Template not found: ${payload.templateId}`);
      }
      rawNodes = template.nodes.map((n) => ({
        ...n,
        status: "pending" as TaskStatus,
      }));
    } else if (payload.nodes && payload.nodes.length > 0) {
      rawNodes = payload.nodes.map((n: any) => ({
        id: n.id,
        twin: n.twin || n.assignedAgentRole || "marketing_twin",
        title: n.title || n.label || n.id,
        action: n.action || "execute_task",
        status: "pending" as TaskStatus,
        dependencies: n.dependencies || [],
        inputs: n.inputs || n.inputPayload || {},
      }));
    } else {
      throw new Error("Either templateId or nodes must be provided");
    }

    const nodesMap: Record<string, SwarmTaskNode> = {};
    for (const node of rawNodes) {
      nodesMap[node.id] = { ...node };
    }

    const { waves, hasCycle } = this.computeTopologicalWaves(nodesMap);
    if (hasCycle) {
      throw new Error("Circular dependency detected in Swarm DAG graph");
    }

    // Assign waveIndex to each node
    waves.forEach((wave, waveIdx) => {
      wave.forEach((nodeId) => {
        if (nodesMap[nodeId]) {
          nodesMap[nodeId].waveIndex = waveIdx + 1;
        }
      });
    });

    const graphId = `graph_swarm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const graph: SwarmGraph = {
      id: graphId,
      name: payload.name || template?.name || "Autonomous Swarm DAG Execution",
      description: payload.description || template?.description || "Topological parallel swarm graph",
      status: "idle",
      nodes: nodesMap,
      waves,
      currentWaveIndex: 0,
      totalDurationMs: 0,
      parallelSpeedupRatio: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.graphs.set(graphId, graph);
    return graph;
  }

  /**
   * Retrieves a graph by ID.
   */
  getGraph(graphId: string): SwarmGraph | undefined {
    return this.graphs.get(graphId);
  }

  /**
   * Executes a single task node by simulating the assigned Specialized Twin's operation.
   */
  private async executeTaskNode(node: SwarmTaskNode, upstreamOutputs: Record<string, any>): Promise<Record<string, any>> {
    node.status = "running";
    node.startedAt = new Date().toISOString();
    const start = Date.now();

    // Simulated task execution latency (sub-50ms for tests/benchmarks)
    await new Promise((r) => setTimeout(r, 20));

    let output: Record<string, any> = {};

    switch (node.twin) {
      case "marketing_twin":
        output = {
          adHeadline: "ঈদের সেরা অফারে ২০% ছাড় — শঠিক ওয়ান-ট্যাপ বিকাশ পেমেন্ট",
          roasProjected: 4.8,
          campaignId: `mkt_${Date.now()}`,
          ...upstreamOutputs,
        };
        break;
      case "content_twin":
        output = {
          vernacularCopy: "মামা, এক ট্যাপে বিকাশ মারেন, পার্সেল লগে লগে পৌঁছে যাবে!",
          wordCount: 145,
          status: "published",
        };
        break;
      case "finance_twin":
        output = {
          mfsTrxId: `TRX_${Date.now()}_BK`,
          vatInvoiceMushak63: `MUS-6.3-${Math.floor(100000 + Math.random() * 900000)}`,
          codAmount: 12500,
          status: "settled",
        };
        break;
      case "operations_twin":
        output = {
          consignmentId: `ST_${Date.now().toString().slice(-6)}`,
          courier: "Steadfast Courier Ltd",
          spineThicknessMm: 12.4,
          status: "dispatched",
        };
        break;
      case "sales_twin":
        output = {
          leadsConverted: 14,
          dealValueBdt: 78500,
          status: "closed_won",
        };
        break;
      case "crm_twin":
        output = {
          enrichedProfiles: 28,
          highValueProspects: 6,
          status: "synced",
        };
        break;
      case "admin_twin":
        output = {
          dokployDeployment: "active",
          containerPort: 3000,
          healthy: true,
        };
        break;
      case "analytics_twin":
        output = {
          retentionLiftPercent: 18.5,
          netMarginBdt: 42300,
          churnRisk: "low",
        };
        break;
      default:
        output = { success: true, timestamp: Date.now() };
    }

    node.status = "completed";
    node.completedAt = new Date().toISOString();
    node.durationMs = Date.now() - start;
    node.outputs = output;

    return output;
  }

  /**
   * Executes the full DAG wave-by-wave in topological parallel batches.
   */
  async executeGraph(graphId: string): Promise<SwarmGraph> {
    const graph = this.getGraph(graphId);
    if (!graph) {
      throw new Error(`Graph not found: ${graphId}`);
    }

    graph.status = "running";
    graph.updatedAt = new Date().toISOString();
    const overallStart = Date.now();
    let serialDurationEstimate = 0;

    const cumulativeOutputs: Record<string, any> = {};

    for (let waveIdx = 0; waveIdx < graph.waves.length; waveIdx++) {
      if ((graph.status as string) === "cancelled") {
        break;
      }

      graph.currentWaveIndex = waveIdx + 1;
      const waveNodeIds = graph.waves[waveIdx];

      // Execute all nodes in the current wave in PARALLEL
      await Promise.all(
        waveNodeIds.map(async (nodeId) => {
          const node = graph.nodes[nodeId];
          if (!node) return;

          // Merge parent outputs into node inputs
          const parentOutputs: Record<string, any> = {};
          for (const depId of node.dependencies) {
            if (graph.nodes[depId]?.outputs) {
              Object.assign(parentOutputs, graph.nodes[depId].outputs);
            }
          }

          const out = await this.executeTaskNode(node, { ...cumulativeOutputs, ...parentOutputs });
          Object.assign(cumulativeOutputs, out);
          serialDurationEstimate += node.durationMs || 25;
        })
      );
    }

    const totalElapsed = Date.now() - overallStart;
    graph.totalDurationMs = totalElapsed;
    graph.parallelSpeedupRatio = Number((serialDurationEstimate / Math.max(1, totalElapsed)).toFixed(2));
    graph.status = (graph.status as string) === "cancelled" ? "cancelled" : "completed";
    graph.updatedAt = new Date().toISOString();

    return graph;
  }

  /**
   * Cancels an active or pending graph execution.
   */
  cancelGraph(graphId: string): SwarmGraph {
    const graph = this.getGraph(graphId);
    if (!graph) {
      throw new Error(`Graph not found: ${graphId}`);
    }

    graph.status = "cancelled";
    for (const node of Object.values(graph.nodes)) {
      if (node.status === "pending" || node.status === "running") {
        node.status = "cancelled";
      }
    }
    graph.updatedAt = new Date().toISOString();
    return graph;
  }
}

export const swarmDagScheduler = SwarmDagScheduler.getInstance();
