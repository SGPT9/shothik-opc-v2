import { Router } from "express";
import { globalActionEngine, proposalPayloadSchema, type ProposalPayload } from "../lib/actions/action-proposal-engine";
import { shadowSimulationEngine, type SimulationAction } from "../lib/simulation/shadow-simulation-engine";

export const actionProposalsRouter = Router();

function mapProposalToSimulationAction(kind: string, data: any): SimulationAction | null {
  if (kind === "bkash.payout") {
    return {
      twinId: "finance_twin",
      actionName: "mfs_disburse",
      params: {
        amountBdt: data.amount,
        recipientPhone: data.recipientPhone,
      },
    };
  }
  if (kind === "courier.dispatch") {
    return {
      twinId: "operations_twin",
      actionName: "book_courier_consignment",
      params: {
        district: "Dhaka",
        recipientPhone: data.recipientPhone,
      },
    };
  }
  if (kind === "invoice.issue") {
    return {
      twinId: "finance_twin",
      actionName: "issue_tax_invoice",
      params: {
        amountBdt: data.totalAmountBdt,
      },
    };
  }
  return null;
}

actionProposalsRouter.get(["/action-proposals", "/v1/action-proposals", "/api/v1/action-proposals"], (req, res) => {
  const owner = req.query.owner as string | undefined;
  const proposals = globalActionEngine.listProposals(owner);
  res.json({ success: true, count: proposals.length, proposals });
});

actionProposalsRouter.post(["/action-proposals", "/v1/action-proposals", "/api/v1/action-proposals"], (req, res) => {
  const owner = (req.body.owner as string) || "default-owner";
  const { kind, data, title, expiresInMinutes } = req.body;

  const parsed = proposalPayloadSchema.safeParse({ kind, data });
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues });
    return;
  }

  const proposal = globalActionEngine.createProposal(
    owner,
    parsed.data,
    title,
    expiresInMinutes,
  );

  // Pre-flight Shadow Simulation rehearsal
  const simAction = mapProposalToSimulationAction(parsed.data.kind, parsed.data.data);
  if (simAction) {
    proposal.simulationReport = shadowSimulationEngine.rehearse([simAction]);
  }

  res.status(201).json({ success: true, proposal });
});

actionProposalsRouter.get(["/action-proposals/:id", "/v1/action-proposals/:id", "/api/v1/action-proposals/:id"], (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const proposal = globalActionEngine.getProposal(id);
  if (!proposal) {
    res.status(404).json({ success: false, error: "Action proposal not found" });
    return;
  }
  res.json({ success: true, proposal });
});

actionProposalsRouter.post(["/action-proposals/:id/approve", "/v1/action-proposals/:id/approve", "/api/v1/action-proposals/:id/approve"], async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = globalActionEngine.getProposal(id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Action proposal not found" });
      return;
    }

    // Shadow simulation invariant check before executing state mutation
    const simAction = mapProposalToSimulationAction(existing.kind, existing.data);
    if (simAction) {
      const report = shadowSimulationEngine.rehearse([simAction]);
      if (report.verdict === "REJECTED_INVARIANT_VIOLATION") {
        res.status(422).json({
          success: false,
          error: `Action proposal blocked by Shadow Simulation: ${report.violations.join("; ")}`,
          simulationReport: report,
        });
        return;
      }
    }

    const proposal = await globalActionEngine.approve(id);
    res.json({ success: true, message: "Action proposal approved & executed", proposal });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

actionProposalsRouter.post(["/action-proposals/:id/deny", "/v1/action-proposals/:id/deny", "/api/v1/action-proposals/:id/deny"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reason = req.body?.reason as string | undefined;
    const proposal = globalActionEngine.deny(id, reason);
    res.json({ success: true, message: "Action proposal rejected", proposal });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
