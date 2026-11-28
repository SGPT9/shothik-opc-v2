import { describe, it, expect, vi, beforeEach } from "vitest";
import { BengaliPlagiarismEngine } from "../bengali-plagiarism-engine";
import { WigoloWebIntelligenceService } from "../../wigolo-service";
import { executeJobByType } from "../../queue/task-processors";

describe("BengaliPlagiarismEngine.scanWithLiveWeb", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles short text gracefully with 0% similarity", async () => {
    const report = await BengaliPlagiarismEngine.scanWithLiveWeb("খুব ছোট লেখা।", "সংক্ষিপ্ত নথি", "লেখক");
    expect(report).toBeDefined();
    expect(report.overallSimilarityPercent).toBe(0);
    expect(report.originalityScore).toBe(100);
    expect(report.plagiarismTier).toBe("CLEAN");
    expect(report.ugcComplianceStatus).toBe("PASSED");
    expect(report.matches).toEqual([]);
    expect(report.auditHashSha256).toHaveLength(64);
  });

  it("detects web plagiarism matches and reports authentic web sources", async () => {
    const sampleText =
      "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা মানব বুদ্ধিমত্তার অনুকরণ করে। " +
      "মেশিন লার্নিং অ্যালগরিদম ব্যবহারের মাধ্যমে ডেটা থেকে স্বয়ংক্রিয়ভাবে জ্ঞান আহরণ করা সম্ভব হয়। " +
      "প্রাকৃতিক ভাষা প্রক্রিয়াকরণ বাংলা সাহিত্যের আধুনিক গবেষণায় বিশেষ ভূমিকা পালন করে থাকে। " +
      "গভীর শিখন প্রযুক্তি বর্তমান বিশ্বের প্রযুক্তি বিপ্লবে এক অভূতপূর্ব পরিবর্তন সূচিত করেছে।";

    const searchSpy = vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockImplementation(async (params) => {
      const queryStr = String(params.query);
      if (queryStr.includes("কৃত্রিম বুদ্ধিমত্তা")) {
        return {
          query: queryStr,
          results: [
            {
              title: "উইকিপিডিয়া - কৃত্রিম বুদ্ধিমত্তা ও ভাষা প্রক্রিয়াকরণ",
              url: "https://bn.wikipedia.org/wiki/Artificial_Intelligence",
              excerpt: "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা মানব বুদ্ধিমত্তার অনুকরণ করে থাকে।",
              citationId: "src-1",
              evidenceScore: 0.98,
              engine: "searxng-wikipedia",
            },
          ],
          totalFound: 1,
          engineUsed: "searxng",
          cached: false,
          executedAt: new Date().toISOString(),
        };
      }
      return {
        query: queryStr,
        results: [],
        totalFound: 0,
        engineUsed: "searxng",
        cached: false,
        executedAt: new Date().toISOString(),
      };
    });

    const progressUpdates: number[] = [];
    const report = await BengaliPlagiarismEngine.scanWithLiveWeb(
      sampleText,
      "বাংলা কৃত্রিম বুদ্ধিমত্তা সমীক্ষা",
      "ড. মুহম্মদ শহীদুল্লাহ",
      {
        onProgress: (p) => {
          progressUpdates.push(p);
        },
        maxQueries: 3,
        minSimilarityThreshold: 0.2,
      }
    );

    expect(searchSpy).toHaveBeenCalled();
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(100);

    expect(report.documentTitle).toBe("বাংলা কৃত্রিম বুদ্ধিমত্তা সমীক্ষা");
    expect(report.authorName).toBe("ড. মুহম্মদ শহীদুল্লাহ");
    expect(report.matches.length).toBeGreaterThanOrEqual(1);

    const firstMatch = report.matches[0];
    expect(firstMatch.sourceTitle).toBe("উইকিপিডিয়া - কৃত্রিম বুদ্ধিমত্তা ও ভাষা প্রক্রিয়াকরণ");
    expect(firstMatch.sourceUrl).toBe("https://bn.wikipedia.org/wiki/Artificial_Intelligence");
    expect(firstMatch.pageOrParagraphHint).toContain("bn.wikipedia.org");
    expect(firstMatch.similarityPercent).toBeGreaterThan(50);
    expect(["exact", "paraphrased"]).toContain(firstMatch.matchType);

    expect(report.generatedCitations.apa).toContain("bn.wikipedia.org");
    expect(report.generatedCitations.banglaAcademic).toContain("উইকিপিডিয়া");
    expect(report.auditHashSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns clean originality report when no web matches exceed threshold", async () => {
    vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockResolvedValue({
      query: "test",
      results: [
        {
          title: "ভিন্ন বিষয়",
          url: "https://example.org/completely-different",
          excerpt: "পদার্থবিজ্ঞান ও মহাকাশ গবেষণা বিষয়ক সাধারণ নিবন্ধমালা।",
          citationId: "src-1",
          evidenceScore: 0.5,
          engine: "searxng",
        },
      ],
      totalFound: 1,
      engineUsed: "searxng",
      cached: false,
      executedAt: new Date().toISOString(),
    });

    const report = await BengaliPlagiarismEngine.scanWithLiveWeb(
      "আমাদের নতুন উদ্ভাবিত বাংলা রূপতাত্ত্বিক বিশ্লেষণ মডেল শতভাগ অনন্য মৌলিক রচনা হিসেবে বিবেচিত। এই গবেষণায় কোন বহিরাগত অনুকরণ নেই।",
      "মৌলিক গবেষণা পত্র",
      "গবেষক দল",
      { minSimilarityThreshold: 0.5 }
    );

    expect(report.matches).toEqual([]);
    expect(report.overallSimilarityPercent).toBe(0);
    expect(report.originalityScore).toBe(100);
    expect(report.plagiarismTier).toBe("CLEAN");
    expect(report.ugcComplianceStatus).toBe("PASSED");
  });

  it("integrates with task-processors handlePlagiarismScan with liveWeb dynamic progress tracking", async () => {
    vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockResolvedValue({
      query: "কৃত্রিম বুদ্ধিমত্তা",
      results: [
        {
          title: "গুগল স্কলার বাংলা রেফারেন্স",
          url: "https://scholar.google.com/citations?view_op=search",
          excerpt: "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা মানব বুদ্ধিমত্তার অনুকরণ করে থাকে।",
          citationId: "src-scholar-1",
          evidenceScore: 0.99,
          engine: "searxng-scholar",
        },
      ],
      totalFound: 1,
      engineUsed: "searxng",
      cached: false,
      executedAt: new Date().toISOString(),
    });

    const progressLogs: number[] = [];
    const mockJob = {
      data: {
        jobType: "plagiarism-scan",
        payload: {
          text: "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি গুরুত্বপূর্ণ শাখা যা মানব বুদ্ধিমত্তার অনুকরণ করে। বাংলা ভাষায় এই প্রযুক্তির বিকাশ দিন দিন বৃদ্ধি পাচ্ছে।",
          title: "বাংলা এআই গবেষণা",
          author: "তানভীর আহমেদ",
          liveWeb: true,
        },
      },
      updateProgress: vi.fn(async (p: number) => {
        progressLogs.push(p);
      }),
    };

    const res = await executeJobByType("plagiarism-scan", mockJob, mockJob.data.payload);

    expect(res.success).toBe(true);
    expect(res.jobType).toBe("plagiarism-scan");
    expect(res.data).toBeDefined();
    expect(res.data.report).toBeDefined();
    expect(res.data.similarityScore).toBe(res.data.report.overallSimilarityPercent);
    expect(res.data.originalityScore).toBe(res.data.report.originalityScore);
    expect(res.data.matches).toEqual(res.data.report.matches);
    expect(res.data.totalNgramsAudited).toBe(res.data.report.wordCount);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    expect(progressLogs).toContain(100);
  });
});
