import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

export const bkashPayoutSchema = z.object({
  recipientPhone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, "Valid Bangladesh mobile number required"),
  amount: z.number().positive().max(250000),
  reference: z.string().max(50).default("OPC_SETTLEMENT"),
  notes: z.string().max(200).optional(),
});

export const courierDispatchSchema = z.object({
  courier: z.enum(["steadfast", "pathao", "redx", "paperfly"]),
  recipientName: z.string().min(2),
  recipientPhone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/),
  deliveryAddress: z.string().min(5),
  codAmount: z.number().nonnegative(),
  itemDescription: z.string().min(2),
});

export const whatsappBroadcastSchema = z.object({
  audienceSegment: z.string().min(2),
  recipientCount: z.number().int().positive().max(5000),
  messageTemplate: z.string().min(5).max(1024),
  previewSample: z.string().min(5),
});

export const invoiceIssueSchema = z.object({
  customerName: z.string().min(2),
  customerBinVat: z.string().optional(),
  totalAmountBdt: z.number().positive(),
  vatRatePercent: z.number().nonnegative().default(7.5),
  items: z.array(z.object({ name: z.string(), quantity: z.number(), unitPrice: z.number() })).min(1),
});

export const proposalPayloadSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bkash.payout"), data: bkashPayoutSchema }),
  z.object({ kind: z.literal("courier.dispatch"), data: courierDispatchSchema }),
  z.object({ kind: z.literal("whatsapp.broadcast"), data: whatsappBroadcastSchema }),
  z.object({ kind: z.literal("invoice.issue"), data: invoiceIssueSchema }),
]);

export type ProposalPayload = z.infer<typeof proposalPayloadSchema>;

export type ActionStatus =
  | "awaiting_review"
  | "executing"
  | "succeeded"
  | "failed"
  | "outcome_unknown"
  | "denied"
  | "cancelled"
  | "expired";

export interface ActionProposal {
  id: string;
  owner: string;
  title: string;
  kind: ProposalPayload["kind"];
  data: Record<string, unknown>;
  status: ActionStatus;
  hash: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt?: string;
  result?: string;
  error?: string;
  simulationReport?: any;
}

export class ActionProposalEngine {
  private proposals = new Map<string, ActionProposal>();

  private computeHash(kind: string, data: Record<string, unknown>): string {
    return createHash("sha256").update(`${kind}:${JSON.stringify(data)}`).digest("hex");
  }

  createProposal(
    owner: string,
    payload: ProposalPayload,
    title?: string,
    expiresInMinutes = 15,
  ): ActionProposal {
    const id = randomUUID();
    const hash = this.computeHash(payload.kind, payload.data as Record<string, unknown>);
    const now = Date.now();

    const proposal: ActionProposal = {
      id,
      owner,
      title: title || `Authorize ${payload.kind.replace(".", " ").toUpperCase()}`,
      kind: payload.kind,
      data: payload.data as Record<string, unknown>,
      status: "awaiting_review",
      hash,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + expiresInMinutes * 60000).toISOString(),
    };

    this.proposals.set(id, proposal);
    return proposal;
  }

  getProposal(id: string): ActionProposal | null {
    const proposal = this.proposals.get(id);
    if (!proposal) return null;

    if (proposal.status === "awaiting_review" && Date.parse(proposal.expiresAt) <= Date.now()) {
      proposal.status = "expired";
      this.proposals.set(id, proposal);
    }

    return proposal;
  }

  listProposals(owner?: string): ActionProposal[] {
    const list: ActionProposal[] = [];
    const now = Date.now();
    for (const p of this.proposals.values()) {
      if (p.status === "awaiting_review" && Date.parse(p.expiresAt) <= now) {
        p.status = "expired";
      }
      if (!owner || p.owner === owner) {
        list.push(p);
      }
    }
    return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  async approve(id: string, executionSimulate?: () => Promise<string>): Promise<ActionProposal> {
    const proposal = this.getProposal(id);
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.status !== "awaiting_review") {
      throw new Error(`Cannot approve proposal in status: ${proposal.status}`);
    }

    proposal.status = "executing";
    proposal.reviewedAt = new Date().toISOString();

    try {
      if (executionSimulate) {
        proposal.result = await executionSimulate();
      } else {
        proposal.result = `Action ${proposal.kind} executed successfully with hash seal ${proposal.hash.slice(0, 12)}`;
      }
      proposal.status = "succeeded";
    } catch (err: any) {
      proposal.status = "failed";
      proposal.error = err?.message || "Execution failed";
    }

    this.proposals.set(id, proposal);
    return proposal;
  }

  deny(id: string, reason?: string): ActionProposal {
    const proposal = this.getProposal(id);
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.status !== "awaiting_review") {
      throw new Error(`Cannot deny proposal in status: ${proposal.status}`);
    }

    proposal.status = "denied";
    proposal.reviewedAt = new Date().toISOString();
    proposal.error = reason || "Explicitly rejected by operator";
    this.proposals.set(id, proposal);
    return proposal;
  }

  recoverInterruptedActions(): number {
    let count = 0;
    for (const p of this.proposals.values()) {
      if (p.status === "executing") {
        p.status = "outcome_unknown";
        p.error = "Server restarted during execution. Check downstream gateway before re-executing.";
        count++;
      }
    }
    return count;
  }
}

export const globalActionEngine = new ActionProposalEngine();
