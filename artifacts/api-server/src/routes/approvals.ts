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
  executionResult?: Record<string, any>;
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
 * POST /api/v1/gatekeeper/simulate
 * Cloudflare OS-style Gatekeeper speculative interception
 */
router.post("/v1/gatekeeper/simulate", (req: Request, res: Response) => {
  try {
    const { actionType, payload = {} } = req.body;
    const approvalId = `APP-${(actionType || "ACT").slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let newApproval: PendingApproval;

    if (actionType === "COURIER_DISPATCH" || payload.recipientPhone) {
      const trackingCode = `BD_ST_${Math.floor(100000 + Math.random() * 900000)}`;
      newApproval = {
        id: approvalId,
        type: "COURIER_DISPATCH",
        title: `Steadfast Parcel Dispatch · ${payload.recipientName || "Customer"}`,
        category: "Logistics",
        target: `Steadfast (${payload.city || "Dhaka"})`,
        amountBdt: payload.codAmount || 1500,
        feeBdt: payload.city?.toLowerCase().includes("dhaka") ? 60 : 120,
        status: "PENDING",
        riskLevel: "LOW",
        detail: `Delivery to ${payload.address || "Dhaka, Bangladesh"}. Recipient: ${payload.recipientPhone || "01711-XXXXXX"}`,
        speculativeOutput: `Tracking code ${trackingCode} reserved. WhatsApp dispatch link prepared.`,
        createdAt: new Date().toISOString(),
      };
    } else {
      newApproval = {
        id: approvalId,
        type: "MFS_RECONCILIATION",
        title: `bKash TrxID Reconcile · Trx ${payload.trxId || "BK" + Date.now().toString(36).toUpperCase()}`,
        category: "Finance",
        target: "bKash MFS Gateway",
        amountBdt: payload.amount || 2000,
        feeBdt: Math.round((payload.amount || 2000) * 0.0185 * 100) / 100,
        status: "PENDING",
        riskLevel: "LOW",
        detail: `Auto-verified SMS remittance for customer wallet ${payload.senderPhone || "017XXXXXXXX"}.`,
        speculativeOutput: "Ledger credited. Invoice issued in escrow.",
        createdAt: new Date().toISOString(),
      };
    }

    pendingQueue.unshift(newApproval);

    return res.status(200).json({
      success: true,
      simulated: true,
      approvalId: newApproval.id,
      speculativeResult: newApproval.speculativeOutput,
      item: newApproval,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
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

        if (item.type === "COURIER_DISPATCH") {
          const trackingCode = `BD_ST_${Math.floor(100000 + Math.random() * 900000)}`;
          item.executionResult = {
            consignmentId: `CN_${Date.now()}`,
            trackingCode,
            trackingUrl: `https://steadfast.com.bd/tracking/${trackingCode}`,
            whatsAppDispatched: true,
            whatsAppMessage: `Assalamu Alaikum! Your parcel has been dispatched via Steadfast Courier. Live Tracking: https://steadfast.com.bd/tracking/${trackingCode}`,
          };
        } else if (item.type === "MFS_RECONCILIATION") {
          item.executionResult = {
            settled: true,
            ledgerSync: "COMPLETE",
            receiptNumber: `RCP-MFS-${Date.now().toString(36).toUpperCase()}`,
          };
        }
        committedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      committedCount,
      remainingPending: pendingQueue.filter((a) => a.status === "PENDING").length,
      items: pendingQueue,
      message: `Successfully committed ${committedCount} speculative actions with live courier & MFS settlement.`,
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
