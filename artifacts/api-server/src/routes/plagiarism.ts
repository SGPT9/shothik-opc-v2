import { Router } from "express";
import { BengaliPlagiarismEngine } from "../lib/academic/bengali-plagiarism-engine";

export const plagiarismRouter = Router();

plagiarismRouter.post("/academic/plagiarism/scan", (req, res) => {
  try {
    const { text, title, author } = req.body;
    if (!text) {
      res.status(400).json({ success: false, error: "text content is required" });
      return;
    }

    const report = BengaliPlagiarismEngine.scanManuscript(
      text,
      title || "Research Document",
      author || "Author"
    );

    res.json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
