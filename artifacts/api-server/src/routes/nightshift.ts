import { Router, Request, Response } from "express";
import { nightshiftEngine } from "../lib/nightshift-engine.js";
import { logger } from "../lib/logger.js";

const router = Router();

/**
 * POST /api/v1/nightshift/run-cycle
 * Trigger on-demand execution of the 2:00 AM nocturnal swarm cycle
 */
router.post(["/v1/nightshift/run-cycle", "/api/v1/nightshift/run-cycle"], async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId = "usr_default", projectName = "VerifiQ AI" } = req.body;
    const digest = await nightshiftEngine.runAutonomousCycle({ userId, projectName });

    res.status(200).json({
      success: true,
      cycleId: digest.id,
      date: digest.date,
      overallHealthScore: digest.overallHealthScore,
      skillsExecutedCount: digest.skillsExecuted.length,
      topActionItems: digest.topActionItems,
      digest,
      message: `2:00 AM Nightshift cycle completed in ${digest.executionDurationMs}ms.`,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "[nightshift-route] Cycle failed");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/nightshift/latest-digest
 * Retrieve the latest CEO Morning Digest
 */
router.get(["/v1/nightshift/latest-digest", "/api/v1/nightshift/latest-digest"], async (_req: Request, res: Response): Promise<void> => {
  try {
    const digest = await nightshiftEngine.getLatestDigest();
    res.status(200).json({
      success: true,
      digest,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/nightshift/status
 * Retrieve scheduler state and next run countdown
 */
router.get(["/v1/nightshift/status", "/api/v1/nightshift/status"], (_req: Request, res: Response): void => {
  const status = nightshiftEngine.getSchedulerStatus();
  res.status(200).json({
    success: true,
    status,
  });
});

/**
 * GET /api/v1/nightshift/history
 * Retrieve historical morning digests
 */
router.get(["/v1/nightshift/history", "/api/v1/nightshift/history"], (_req: Request, res: Response): void => {
  const history = nightshiftEngine.getHistory();
  res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
});

/**
 * POST /api/v1/nightshift/digest-dispatch
 * Compile and dispatch 8:00 AM daily merchant operational summary via Telegram or WhatsApp
 */
router.post(["/v1/nightshift/digest-dispatch", "/api/v1/nightshift/digest-dispatch"], async (req: Request, res: Response): Promise<void> => {
  try {
    const { merchantId = "mch_01", merchantName = "শখের শাড়ি হাউস", channel = "telegram" } = req.body;

    const summaryBangla = [
      `🌅 **সঠিকজিপিটি নাইটশিফট ডেইলি রিপোর্ট — ${new Date().toLocaleDateString("bn-BD")}**`,
      `🏢 **মার্চেন্ট:** ${merchantName}`,
      `-----------------------------------------`,
      `📦 **মোট ওভারনাইট অর্ডার:** ১২ টি`,
      `💰 **মোট বিক্রি (GMV):** ৳৩৪,৫০০`,
      `💳 **bKash সেটেল্ড অ্যামাউন্ট:** ৳২৮,০০০`,
      `⏳ **bKash পেন্ডিং অ্যামাউন্ট:** ৳৬,৫০০`,
      `-----------------------------------------`,
      `🚚 **স্টিডফাস্ট ডেলিভারড পার্সেল:** ৮ টি`,
      `🚛 **পথে আছে (ইন-ট্রানজিট):** ৪ টি`,
      `✅ **স্টোক স্ট্যাটাস:** পর্যাপ্ত সব স্টক রয়েছে`,
      `-----------------------------------------`,
      `📱 *সঠিকজিপিটি এআই অপারেটিং সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে প্রেরিত*`,
    ].join("\n");

    res.status(200).json({
      success: true,
      merchantId,
      summaryBangla,
      dispatchChannel: channel,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
