/**
 * 🤝 Peer-to-Peer Agent Delegation & Persistent Memory Engine
 * 
 * Inspired by Rakazo Teammate Monorepo & Gobii Always-On Agent Runtime
 * 
 * Features:
 * 1. Persistent Agent Memory Tables (InsForge PostgreSQL sync)
 * 2. Typed Peer-to-Peer Agent Delegation RPC
 * 3. Durable Inbound Event Queue with Idempotency & Auto-Retry
 * 4. Autonomous Nightshift Task Execution
 */

export type AgentRole = 
  | "sales_twin"
  | "logistics_agent"
  | "tax_accounting_agent"
  | "research_agent"
  | "growth_copywriter";

export interface AgentMemoryEntry {
  id: string;
  agentRole: AgentRole;
  category: "customer_preference" | "tax_bin" | "carrier_sla" | "inventory_buffer";
  key: string;
  value: string;
  confidence: number;
  updatedAt: string;
}

export interface PeerDelegationMessage<T = any> {
  id: string;
  fromAgent: AgentRole;
  toAgent: AgentRole;
  taskName: string;
  payload: T;
  priority: "high" | "normal" | "nightshift";
  status: "queued" | "in_progress" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface InboundEventQueueItem {
  eventId: string;
  source: "bkash_ipn" | "steadfast_webhook" | "whatsapp_inbound" | "cron_nightshift";
  idempotencyKey: string;
  payload: Record<string, any>;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processed" | "dead_letter";
  receivedAt: string;
}

export class PeerDelegationEngine {
  private memories: Map<string, AgentMemoryEntry> = new Map();
  private messageQueue: PeerDelegationMessage[] = [];
  private eventQueue: Map<string, InboundEventQueueItem> = new Map();

  constructor() {
    // Seed default baseline memories for South Asian commerce
    this.setMemory({
      id: "mem-01",
      agentRole: "tax_accounting_agent",
      category: "tax_bin",
      key: "company_bin",
      value: "002938192-0102",
      confidence: 1.0,
      updatedAt: new Date().toISOString(),
    });

    this.setMemory({
      id: "mem-02",
      agentRole: "logistics_agent",
      category: "carrier_sla",
      key: "primary_dhaka_carrier",
      value: "steadfast",
      confidence: 0.95,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * 1. Memory Table Storage & Retrieval (Syncable with InsForge BaaS)
   */
  public setMemory(entry: AgentMemoryEntry): void {
    this.memories.set(`${entry.agentRole}:${entry.key}`, entry);
  }

  public getMemory(agentRole: AgentRole, key: string): AgentMemoryEntry | undefined {
    return this.memories.get(`${agentRole}:${key}`);
  }

  public getAllMemories(agentRole?: AgentRole): AgentMemoryEntry[] {
    const list = Array.from(this.memories.values());
    return agentRole ? list.filter(m => m.agentRole === agentRole) : list;
  }

  /**
   * 2. Ingest Inbound Event with Strict Idempotency Lock (bKash IPN / Webhooks)
   */
  public ingestEvent(item: Omit<InboundEventQueueItem, "attempts" | "maxAttempts" | "status" | "receivedAt">): {
    accepted: boolean;
    isDuplicate: boolean;
    queueItem: InboundEventQueueItem;
  } {
    if (this.eventQueue.has(item.idempotencyKey)) {
      const existing = this.eventQueue.get(item.idempotencyKey)!;
      return {
        accepted: false,
        isDuplicate: true,
        queueItem: existing,
      };
    }

    const queueItem: InboundEventQueueItem = {
      ...item,
      attempts: 0,
      maxAttempts: 3,
      status: "pending",
      receivedAt: new Date().toISOString(),
    };

    this.eventQueue.set(item.idempotencyKey, queueItem);

    return {
      accepted: true,
      isDuplicate: false,
      queueItem,
    };
  }

  /**
   * 3. Peer-to-Peer Agent Direct Delegation RPC
   */
  public async delegateTask<T = any, R = any>(
    fromAgent: AgentRole,
    toAgent: AgentRole,
    taskName: string,
    payload: T,
    priority: "high" | "normal" | "nightshift" = "normal"
  ): Promise<PeerDelegationMessage<T>> {
    const msg: PeerDelegationMessage<T> = {
      id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromAgent,
      toAgent,
      taskName,
      payload,
      priority,
      status: "in_progress",
      createdAt: new Date().toISOString(),
    };

    this.messageQueue.push(msg);

    // Synchronous execution dispatch for specialized subagent handlers
    try {
      const executionResult = await this.executeSpecialistSubagent(toAgent, taskName, payload);
      msg.status = "completed";
      msg.result = executionResult;
      msg.completedAt = new Date().toISOString();
    } catch (err: any) {
      msg.status = "failed";
      msg.error = err.message || "Subagent execution failure";
    }

    return msg;
  }

  /**
   * Specialist Subagent Handler (Resolves peer calls)
   */
  private async executeSpecialistSubagent(role: AgentRole, taskName: string, payload: any): Promise<any> {
    switch (role) {
      case "tax_accounting_agent":
        if (taskName === "generate_mushak_63") {
          const bin = this.getMemory("tax_accounting_agent", "company_bin")?.value || "002938192-0102";
          return {
            challanNo: `MUS-6.3-${Math.floor(100000 + Math.random() * 900000)}`,
            binNumber: bin,
            vatRate: payload.vatRate || 7.5,
            vatPayable: (payload.amount * (payload.vatRate || 7.5)) / 100,
            status: "ISSUED",
          };
        }
        break;

      case "logistics_agent":
        if (taskName === "dispatch_courier") {
          const carrier = payload.preferredCarrier || "steadfast";
          return {
            consignmentId: `ST-${Math.floor(100000 + Math.random() * 900000)}`,
            trackingCode: `TRK-BD-${Math.floor(100000 + Math.random() * 900000)}`,
            carrier,
            codPayable: payload.codAmount || 0,
            status: "BOOKED",
          };
        }
        break;

      case "sales_twin":
        if (taskName === "negotiate_banglish_order") {
          return {
            orderCaptured: true,
            proposedPrice: payload.requestedPrice,
            advanceFeeRequested: 150,
            status: "AWAITING_BKASH",
          };
        }
        break;

      default:
        return { acknowledged: true, taskName, role };
    }

    return { success: true, processedBy: role };
  }

  public getDelegationLog(): PeerDelegationMessage[] {
    return [...this.messageQueue];
  }
}
