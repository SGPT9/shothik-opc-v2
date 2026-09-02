import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * GET /api/v1/marketing/ambassador/leaderboard
 * Returns inter-campus referral leaderboard
 */
router.get("/v1/marketing/ambassador/leaderboard", (_req: Request, res: Response) => {
  const leaderboard = [
    {
      id: "amb_du_01",
      studentName: "আরিফুর রহমান",
      universityName: "Dhaka University (DU)",
      referralCode: "SHOTHIK_DU_ARIF",
      totalReferralsCount: 42,
      totalEarnedCommissionBdt: 6300,
      unpaidCommissionBdt: 1200,
    },
    {
      id: "amb_buet_02",
      studentName: "নাসরিন সুলতানা",
      universityName: "BUET",
      referralCode: "SHOTHIK_BUET_NASRIN",
      totalReferralsCount: 68,
      totalEarnedCommissionBdt: 10200,
      unpaidCommissionBdt: 2400,
    },
  ];

  return res.status(200).json({
    success: true,
    leaderboard,
  });
});

/**
 * POST /api/v1/marketing/ambassador/redeem
 * Process referral code redemption and award 15% bKash commission
 */
router.post("/v1/marketing/ambassador/redeem", (req: Request, res: Response) => {
  const { referralCode, purchaseBdt = 1000 } = req.body;

  if (!referralCode) {
    return res.status(400).json({ success: false, error: "referralCode is required" });
  }

  const ambassadorCommissionBdt = Math.round(purchaseBdt * 0.15);
  const buyerBonusCredits = 500;

  return res.status(200).json({
    success: true,
    referralCode,
    buyerBonusCredits,
    ambassadorCommissionBdt,
    timestamp: new Date().toISOString(),
  });
});

export default router;
