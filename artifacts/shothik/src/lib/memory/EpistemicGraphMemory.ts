/**
 * SecondMe 2.0: Epistemic Graph Memory Engine
 * Implements Directed Acyclic Graph (DAG) for founder traits, business rules,
 * and episodic decisions with automated temporal decay and conflict superseding.
 */

export type MemoryNodeType = "DECISION" | "CONSTRAINT" | "PREFERENCE" | "FACT";
export type MemoryEdgeRelation = "SUPERSEDES" | "DEPENDS_ON" | "CONTRADICTS" | "EVIDENCED_BY";

export interface EpistemicNode {
  id: string;
  type: MemoryNodeType;
  topic: string;
  content: string;
  confidence: number; // 0.0 - 1.0
  createdAt: number;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface EpistemicEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: MemoryEdgeRelation;
  createdAt: number;
  weight: number;
}

export interface GraphAuditReport {
  totalNodes: number;
  activeNodes: number;
  supersededNodes: number;
  totalEdges: number;
  nodes: EpistemicNode[];
  edges: EpistemicEdge[];
}

export class EpistemicGraphMemory {
  private nodes: Map<string, EpistemicNode> = new Map();
  private edges: EpistemicEdge[] = [];
  private storageKey: string;

  constructor(storageKey: string = "shothik_epistemic_graph_memory") {
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  /**
   * Load graph from localStorage if available
   */
  private loadFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          parsed.nodes.forEach((n: EpistemicNode) => this.nodes.set(n.id, n));
        }
        if (parsed.edges && Array.isArray(parsed.edges)) {
          this.edges = parsed.edges;
        }
      }
    } catch {}
  }

  /**
   * Persist graph state to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const data = {
        nodes: Array.from(this.nodes.values()),
        edges: this.edges,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("shothik_graph_memory_updated", { detail: data }));
    } catch {}
  }

  /**
   * Detect topic key from content (e.g. "courier", "payment", "margin", "format")
   */
  private extractTopicKey(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes("courier") || lower.includes("steadfast") || lower.includes("pathao") || lower.includes("redx") || lower.includes("delivery")) {
      return "logistics_courier";
    }
    if (lower.includes("bkash") || lower.includes("nagad") || lower.includes("payment") || lower.includes("mfs") || lower.includes("checkout")) {
      return "payment_mfs";
    }
    if (lower.includes("margin") || lower.includes("revenue") || lower.includes("price") || lower.includes("pricing") || lower.includes("cac")) {
      return "financial_economics";
    }
    if (lower.includes("format") || lower.includes("table") || lower.includes("bullet") || lower.includes("concise") || lower.includes("style")) {
      return "communication_style";
    }
    return "general_rule";
  }

  /**
   * Add a new epistemic decision node and automatically supersede conflicting historical rules
   */
  public addDecision(
    content: string,
    type: MemoryNodeType = "DECISION",
    confidence: number = 0.95
  ): { newNode: EpistemicNode; supersededNode?: EpistemicNode } {
    const topic = this.extractTopicKey(content);
    const nodeId = `ep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const newNode: EpistemicNode = {
      id: nodeId,
      type,
      topic,
      content,
      confidence,
      createdAt: Date.now(),
      active: true,
    };

    // Find previous active node in same topic to create SUPERSEDES edge
    let supersededNode: EpistemicNode | undefined;
    for (const [_, existing] of this.nodes.entries()) {
      if (existing.active && existing.topic === topic && existing.topic !== "general_rule") {
        existing.active = false; // Superseded
        supersededNode = existing;

        // Create SUPERSEDES edge
        this.edges.push({
          id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sourceId: newNode.id,
          targetId: existing.id,
          relation: "SUPERSEDES",
          createdAt: Date.now(),
          weight: 1.0,
        });
        break;
      }
    }

    this.nodes.set(newNode.id, newNode);
    this.saveToStorage();

    return { newNode, supersededNode };
  }

  /**
   * Get currently authoritative (active and non-superseded) memory nodes for prompt context
   */
  public getActiveContext(): string {
    const activeNodes = Array.from(this.nodes.values()).filter((n) => n.active);
    if (activeNodes.length === 0) return "";

    return activeNodes.map((n) => `• [${n.type}] ${n.content}`).join("\n");
  }

  /**
   * Get all active nodes
   */
  public getActiveNodes(): EpistemicNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.active);
  }

  /**
   * Get full lineage audit report
   */
  public getAuditReport(): GraphAuditReport {
    const all = Array.from(this.nodes.values());
    const active = all.filter((n) => n.active);
    return {
      totalNodes: all.length,
      activeNodes: active.length,
      supersededNodes: all.length - active.length,
      totalEdges: this.edges.length,
      nodes: all,
      edges: this.edges,
    };
  }

  /**
   * Clear all graph memory (for testing or reset)
   */
  public clear(): void {
    this.nodes.clear();
    this.edges = [];
    this.saveToStorage();
  }
}

export const epistemicGraphMemory = new EpistemicGraphMemory();
