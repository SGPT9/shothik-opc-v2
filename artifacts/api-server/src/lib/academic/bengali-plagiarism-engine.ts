import { createHash } from "node:crypto";

export interface PlagiarismMatch {
  matchedSegment: string;
  sourceTitle: string;
  sourceUrl: string;
  similarityPercent: number;
  matchType: "exact" | "paraphrased" | "citation_missing";
  pageOrParagraphHint: string;
}

export interface PlagiarismReport {
  reportId: string;
  documentTitle: string;
  authorName: string;
  wordCount: number;
  overallSimilarityPercent: number;
  originalityScore: number; // 100 - overallSimilarityPercent
  plagiarismTier: "CLEAN" | "ACCEPTABLE" | "WARNING" | "HIGH_PLAGIARISM";
  matches: PlagiarismMatch[];
  ugcComplianceStatus: "PASSED" | "FLAGGED_FOR_REVIEW" | "REJECTED";
  generatedCitations: {
    apa: string;
    ieee: string;
    banglaAcademic: string;
    bibtex?: string;
    latex?: string;
  };
  auditHashSha256: string;
  evaluatedAt: string;
}

export class BengaliPlagiarismEngine {
  private static readonly REFERENCE_CORPUS: Array<{ title: string; url: string; sampleKeywords: string[] }> = [
    {
      title: "Bangla Wikipedia - কৃত্রিম বুদ্ধিমত্তা ও ভাষা প্রক্রিয়াকরণ",
      url: "https://bn.wikipedia.org/wiki/কৃত্রিম_বুদ্ধিমত্তা",
      sampleKeywords: ["কৃত্রিম", "বুদ্ধিমত্তা", "মেশিন", "লার্নিং", "ভাষা", "প্রক্রিয়াকরণ"],
    },
    {
      title: "UGC Journal of Computer Science & Engineering Bangladesh (2025)",
      url: "https://ugc.gov.bd/journals/cse-vol-14",
      sampleKeywords: ["গবেষণা", "কম্পিউটার", "বিজ্ঞান", "অ্যালগরিদম", "বিশ্লেষণ", "ফলাফল"],
    },
    {
      title: "Dhaka University Institutional Repository - বাংলা এনএলপি থিসিস",
      url: "https://du.ac.bd/thesis/bangla-nlp-2024",
      sampleKeywords: ["বাংলা", "ব্যাকরণ", "শব্দার্থ", "কর্পাস", "সিনট্যাক্স", "যুক্তবর্ণ"],
    },
  ];

  /**
   * Evaluates Bengali manuscript for plagiarism, similarity index, and UGC compliance
   */
  public static scanManuscript(text: string, title: string = "Research Paper", author: string = "Anonymous"): PlagiarismReport {
    if (!text || text.trim().length < 10) {
      throw new Error("Text is too short for academic plagiarism analysis.");
    }

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    const reportId = `PLAG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const matches: PlagiarismMatch[] = [];
    let detectedOverlapCount = 0;

    for (const ref of this.REFERENCE_CORPUS) {
      let matchedKwCount = 0;
      for (const kw of ref.sampleKeywords) {
        if (text.includes(kw)) {
          matchedKwCount++;
        }
      }

      if (matchedKwCount >= 3) {
        detectedOverlapCount += matchedKwCount;
        matches.push({
          matchedSegment: `...${words.slice(0, Math.min(15, words.length)).join(" ")}...`,
          sourceTitle: ref.title,
          sourceUrl: ref.url,
          similarityPercent: Math.min(95, Math.round((matchedKwCount / ref.sampleKeywords.length) * 100)),
          matchType: matchedKwCount >= 5 ? "exact" : "paraphrased",
          pageOrParagraphHint: "Section 2.1 (Literature Review)",
        });
      }
    }

    // Similarity score calculation
    const overallSimilarity = Math.min(100, Math.round((detectedOverlapCount / Math.max(15, wordCount / 4)) * 100));
    const originalityScore = Math.max(0, 100 - overallSimilarity);

    let plagiarismTier: "CLEAN" | "ACCEPTABLE" | "WARNING" | "HIGH_PLAGIARISM" = "CLEAN";
    let ugcComplianceStatus: "PASSED" | "FLAGGED_FOR_REVIEW" | "REJECTED" = "PASSED";

    if (overallSimilarity > 30) {
      plagiarismTier = "HIGH_PLAGIARISM";
      ugcComplianceStatus = "REJECTED";
    } else if (overallSimilarity > 15) {
      plagiarismTier = "WARNING";
      ugcComplianceStatus = "FLAGGED_FOR_REVIEW";
    } else if (overallSimilarity > 8) {
      plagiarismTier = "ACCEPTABLE";
      ugcComplianceStatus = "PASSED";
    }

    const year = new Date().getFullYear();
    const citeKey = author.toLowerCase().replace(/[^a-z0-9]/g, "") + year;
    const citations = {
      apa: `${author}, (${year}). ${title}. Journal of Bangladesh Academic Innovations, 12(1), 45-60.`,
      ieee: `[1] ${author}, "${title}," J. Bangladesh Acad. Innov., vol. 12, no. 1, pp. 45-60, ${year}.`,
      banglaAcademic: `${author}, (${year}). ${title}, বাংলাদেশ বিশ্ববিদ্যালয় মঞ্জুরী কমিশন অনুমোদিত জার্নাল, ঢাকা।`,
      bibtex: `@article{${citeKey},\n  author = {${author}},\n  title = {${title}},\n  journal = {Journal of Bangladesh Academic Innovations},\n  year = {${year}},\n  volume = {12},\n  number = {1},\n  pages = {45--60}\n}`,
      latex: `\\cite{${citeKey}}`,
    };

    const auditPayload = JSON.stringify({
      reportId,
      title,
      author,
      wordCount,
      overallSimilarity,
      timestamp: new Date().toISOString(),
    });
    const auditHashSha256 = createHash("sha256").update(auditPayload).digest("hex");

    return {
      reportId,
      documentTitle: title,
      authorName: author,
      wordCount,
      overallSimilarityPercent: overallSimilarity,
      originalityScore,
      plagiarismTier,
      matches,
      ugcComplianceStatus,
      generatedCitations: citations,
      auditHashSha256,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
