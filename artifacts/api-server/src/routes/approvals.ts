import { Router, type Request, type Response } from "express";

export interface PendingApproval {
  id: string;
  type: "MFS_RECONCILIATION" | "COURIER_DISPATCH" | "AST_CODE_PATCH" | "SCHEMA_MIGRATION";
  title: string;
  category: "Finance" | "Logistics" | "System" | "Database";
  target: string;
  amountBdt?: number;
  feeBdt?: number;
  status: "PENDING" | "COMMITTED" | "REJECTED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  detail: string;
  speculativeOutput: string;
  createdAt: string;
  committedAt?: string;
}

const pendingQueue: PendingApproval[] = [
  {
    id: "APP-MFS-8891",
    type: "MFS_RECONCILIATION",
    title: "bKash TrxID Reconciliation · Order #ORD-8891",
    category: "Finance",
    target: "bKash Ledger (Trx: BK99281726X)",
    amountBdt: 1850,
    feeBdt: 34.22,
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Customer 01711-XXXXXX paid ৳1,850 via bKash personal send money. SMS verified.",
    speculativeOutput: "Order marked as PAID. Ready to release inventory.",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "APP-MFS-8892",
    type: "MFS_RECONCILIATION",
    title: "Nagad TrxID Reconciliation · Order #ORD-8892",
    category: "Finance",
    target: "Nagad Merchant (Trx: NG44810291Y)",
    amountBdt: 3200,
    feeBdt: 48.0,
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Customer 01922-XXXXXX paid ৳3,200 via Nagad online payment.",
    speculativeOutput: "Invoice generated and emailed. Inventory deducted.",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "APP-LOG-7554",
    type: "COURIER_DISPATCH",
    title: "Steadfast Courier Booking · 2 Consignments",
    category: "Logistics",
    target: "Steadfast API (Dhaka Hub)",
    amountBdt: 2800,
    feeBdt: 120,
    status: "PENDING",
    riskLevel: "MEDIUM",
    detail: "Auto-generated consignment labels for Chittagong & Sylhet deliveries.",
    speculativeOutput: "Tracking codes BD_ST_755448 & BD_ST_755449 reserved. WhatsApp DMs queued.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "APP-AST-4091",
    type: "AST_CODE_PATCH",
    title: "AST Self-Healing Patch · Rate-Limit Backoff",
    category: "System",
    target: "artifacts/api-server/src/lib/ollama-service.ts",
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Surgical AST patch introducing exponential jitter backoff on local port 11434 retries.",
    speculativeOutput: "All 14 unit tests pass. MTTR: 22ms.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

const router = Router();

/**
 * GET /api/v1/approvals/pending
 */
router.get("/v1/approvals/pending", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    totalPending: pendingQueue.filter((a) => a.status === "PENDING").length,
    items: pendingQueue,
  });
});

/**
 * POST /api/v1/approvals/commit
 */
router.post("/v1/approvals/commit", (req: Request, res: Response) => {
  try {
    const { ids = [], all = false } = req.body;
    let committedCount = 0;

    pendingQueue.forEach((item) => {
      if (item.status === "PENDING" && (all || ids.includes(item.id))) {
        item.status = "COMMITTED";
        item.committedAt = new Date().toISOString();
        committedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      committedCount,
      remainingPending: pendingQueue.filter((a) => a.status === "PENDING").length,
      items: pendingQueue,
      message: `Successfully committed ${committedCount} speculative actions.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/approvals/reject
 */
router.post("/v1/approvals/reject", (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const item = pendingQueue.find((a) => a.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: "Approval item not found" });
    }

    item.status = "REJECTED";
    return res.status(200).json({
      success: true,
      rejectedId: id,
      remainingPending: pendingQueue.filter((a) => a.status === "PENDING").length,
      items: pendingQueue,
      message: `Rejected speculative action ${id}. State reverted.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
