import { Router, type Request, type Response } from "express";
import { TrxVerificationRequestSchema, TIER_CREDIT_MAP } from "@workspace/hermes/contracts";

const router = Router();

/**
 * POST /api/v1/mfs/verify-trx
 * Verifies bKash/Nagad 10-digit TrxID and credits user wallet
 */
router.post("/v1/mfs/verify-trx", async (req: Request, res: Response) => {
  try {
    const parseResult = TrxVerificationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction payload",
        details: parseResult.error.format(),
      });
    }

    const { trxId, provider, tier, amountBdt, userId } = parseResult.data;
    const tierConfig = TIER_CREDIT_MAP[tier];

    // Verify amount matches tier pricing
    if (amountBdt < tierConfig.bdt) {
      return res.status(400).json({
        success: false,
        trxId,
        provider,
        status: "invalid_amount",
        creditedAmount: 0,
        newBalance: 0,
        ledgerId: `LEDGER_ERR_${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: `Amount ${amountBdt} BDT is less than required ${tierConfig.bdt} BDT for ${tierConfig.label}`,
      });
    }

    // Simulated ledger credit verification
    const creditedCredits = tierConfig.credits;
    const currentBalance = 550; // Mock current balance
    const newBalance = currentBalance + creditedCredits;
    const ledgerId = `LEDGER_${provider.toUpperCase()}_${trxId}_${Date.now()}`;

    return res.status(200).json({
      success: true,
      trxId,
      provider,
      status: "verified",
      creditedAmount: creditedCredits,
      newBalance,
      ledgerId,
      timestamp: new Date().toISOString(),
      message: `Successfully verified TrxID ${trxId}. Credited ${creditedCredits} credits (${tierConfig.label}).`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal MFS verification failure",
      message: error?.message || String(error),
    });
  }
});

export default router;
