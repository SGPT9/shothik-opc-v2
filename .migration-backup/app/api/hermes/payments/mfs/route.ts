import { NextRequest } from "next/server";
import { BkashNagadPaymentService } from "@/lib/infrastructure/bkash-nagad-adapter";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/payments/mfs - Create or verify bKash / Nagad payment sessions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "create";

    if (action === "verify") {
      const verification = await BkashNagadPaymentService.verifyTransaction(
        body.paymentId || `mfs_bkash_${Date.now()}`,
        body.provider || "bkash"
      );
      return Response.json({ data: verification });
    }

    const session = await BkashNagadPaymentService.createCheckoutSession({
      workspaceId: body.workspaceId || "ws_mfs_default",
      invoiceId: body.invoiceId || `inv_${Date.now()}`,
      amountBdt: body.amountBdt || 999,
      provider: body.provider || "bkash",
      customerMobile: body.customerMobile,
    });

    return Response.json({ data: session }, { status: 201 });
  } catch (error) {
    logger.error("[api] MFS payment error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "MFS Payment execution failed",
        code: "MFS_PAYMENT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
