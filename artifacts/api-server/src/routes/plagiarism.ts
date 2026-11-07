import { Router } from "express";
import { BengaliPlagiarismEngine } from "../lib/academic/bengali-plagiarism-engine";
import { db, plagiarismScansTable } from "@workspace/db";
import { desc } from "drizzle-orm";

export const plagiarismRouter = Router();

plagiarismRouter.post(
  ["/academic/plagiarism/scan", "/v1/nlp/plagiarism:analyze", "/v1/nlp/plagiarism/scan"],
  async (req, res) => {
    try {
      const { text, title, author } = req.body;
      if (!text) {
        res.status(400).json({ success: false, error: "text content is required" });
        return;
      }

      const isLiveWeb =
        req.body.liveWeb === true ||
        req.body.liveWeb === "true" ||
        req.query.liveWeb === "true";

      const report = isLiveWeb
        ? await BengaliPlagiarismEngine.scanWithLiveWeb(
            text,
            title || "Research Document",
            author || "Author"
          )
        : BengaliPlagiarismEngine.scanManuscript(
            text,
            title || "Research Document",
            author || "Author"
          );

      if (db) {
        try {
          await db.insert(plagiarismScansTable).values({
            scanId: report.reportId,
            documentTitle: report.documentTitle,
            authorName: report.authorName,
            totalWords: report.wordCount,
            similarityScorePercent: String(report.overallSimilarityPercent),
            ugcCompliant: report.ugcComplianceStatus === "PASSED" ? "true" : "false",
            auditSealSha256: `sha256:${report.auditHashSha256}`,
          });
        } catch {
          // Non-fatal persistence fallback
        }
      }

      res.json({ success: true, report });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

plagiarismRouter.get(["/academic/plagiarism/scans", "/v1/nlp/plagiarism/scans"], async (_req, res) => {
  try {
    if (db) {
      const scans = await db
        .select()
        .from(plagiarismScansTable)
        .orderBy(desc(plagiarismScansTable.scannedAt))
        .limit(50);
      res.json({ success: true, count: scans.length, scans });
      return;
    }
    res.json({ success: true, count: 0, scans: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
