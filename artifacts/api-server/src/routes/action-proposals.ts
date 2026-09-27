import { Router } from "express";
import { globalActionEngine, proposalPayloadSchema } from "../lib/actions/action-proposal-engine";

export const actionProposalsRouter = Router();

actionProposalsRouter.get("/action-proposals", (req, res) => {
  const owner = req.query.owner as string | undefined;
  const proposals = globalActionEngine.listProposals(owner);
  res.json({ success: true, count: proposals.length, proposals });
});

actionProposalsRouter.post("/action-proposals", (req, res) => {
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

  res.status(201).json({ success: true, proposal });
});

actionProposalsRouter.get("/action-proposals/:id", (req, res) => {
  const proposal = globalActionEngine.getProposal(req.params.id);
  if (!proposal) {
    res.status(404).json({ success: false, error: "Action proposal not found" });
    return;
  }
  res.json({ success: true, proposal });
});

actionProposalsRouter.post("/action-proposals/:id/approve", async (req, res) => {
  try {
    const proposal = await globalActionEngine.approve(req.params.id);
    res.json({ success: true, message: "Action proposal approved & executed", proposal });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

actionProposalsRouter.post("/action-proposals/:id/deny", (req, res) => {
  try {
    const reason = req.body?.reason as string | undefined;
    const proposal = globalActionEngine.deny(req.params.id, reason);
    res.json({ success: true, message: "Action proposal rejected", proposal });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
