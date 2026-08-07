import { defineRoute, z } from "@/lib/api-validation";
import { BkashNagadPaymentService } from "@/lib/infrastructure/bkash-nagad-adapter";
import logger from "@/lib/logger";

const MfsPaymentBodySchema = z.object({
  action: z.enum(["create", "verify"]).default("create"),
  provider: z.enum(["bkash", "nagad"]).default("bkash"),
  paymentId: z.string().optional(),
  workspaceId: z.string().default("ws_mfs_default"),
  invoiceId: z.string().optional(),
  amountBdt: z.number().positive().default(999),
  customerMobile: z.string().optional(),
});

/**
 * POST /api/hermes/payments/mfs - Create or verify bKash / Nagad payment sessions
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/payments/mfs",
  summary: "Create or verify bKash / Nagad MFS payment sessions",
  tags: ["Payments", "Hermes"],
  schemas: {
    body: MfsPaymentBodySchema,
  },
  handler: async ({ body }) => {
    try {
      if (body.action === "verify") {
        const verification = await BkashNagadPaymentService.verifyTransaction(
          body.paymentId || `mfs_bkash_${Date.now()}`,
          body.provider
        );
        return Response.json({ data: verification });
      }

      const session = await BkashNagadPaymentService.createCheckoutSession({
        workspaceId: body.workspaceId,
        invoiceId: body.invoiceId || `inv_${Date.now()}`,
        amountBdt: body.amountBdt,
        provider: body.provider,
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
  },
});
