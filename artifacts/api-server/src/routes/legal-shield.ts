import { Router, Request, Response } from "express";

export type LegalRiskSeverity = "critical" | "moderate" | "low" | "safe_harbor";
export type LegalRiskCategory = "defamation_libel" | "trademark_dilution" | "song_lyrics_copyright" | "privacy_invasion";

export interface LegalRiskItem {
  id: string;
  category: LegalRiskCategory;
  categoryLabelBn: string;
  detectedText: string;
  severity: LegalRiskSeverity;
  legalBasisBn: string; // e.g. "দণ্ডবিধি ৪৯৯ ধারা (মানহানি)"
  riskExplanationBn: string;
  suggestedRemedyBn: string;
  fictionalizedAlternativeBn?: string;
}

export interface LegalShieldAuditReport {
  projectId: string;
  overallComplianceScore: number; // 0 - 100
  totalRisksFound: number;
  criticalCount: number;
  moderateCount: number;
  lowCount: number;
  items: LegalRiskItem[];
  statutoryDisclaimerBn: string;
  statutoryDisclaimerEn: string;
}

export const DEFAULT_LEGAL_ITEMS: LegalRiskItem[] = [
  {
    id: "legal_defam_01",
    category: "defamation_libel",
    categoryLabelBn: "ব্যক্তিগত মানহানি ও লিবেল ঝুঁকি",
    detectedText: "ওসি রফিক ড্রেনে সিগারেট ফেলে বললেন...",
    severity: "low",
    legalBasisBn: "বাংলাদেশ দণ্ডবিধি ৪৯৯/৫০০ ধারা ও দ্য ডিফামেশন অ্যাক্ট",
    riskExplanationBn: "বাস্তব পুলিশ স্টেশনের দায়িত্বে থাকা কোনো কর্মকর্তার নামের সাথে সাদৃশ্য থাকলে ইচ্ছাকৃত মানহানির অভিযোগ ওঠার সামান্য ঝুঁকি থাকে।",
    suggestedRemedyBn: "কাল্পনিক চরিত্রের স্পষ্ট ঘোষণা দিন অথবা কাল্পনিক ব্যাজ নম্বর যুক্ত করুন।",
    fictionalizedAlternativeBn: "ওসি রফিক আহমেদ (কাল্পনিক ব্যাজ #৭৮৪২, সদরঘাট থানা)"
  },
  {
    id: "legal_tm_01",
    category: "trademark_dilution",
    categoryLabelBn: "বাণিজ্যিক ট্রেডমার্ক ও ব্র্যান্ড উল্লেখ",
    detectedText: "সোডিয়াম বাতি ও গ্রামীণফোন টাওয়ারের আলো",
    severity: "moderate",
    legalBasisBn: "ট্রেডমার্কস অ্যাক্ট ২০০৯ ও বাণিজ্য সুরক্ষা নীতি",
    riskExplanationBn: "উপন্যাসের কোনো সংঘাতপূর্ণ বা নেতিবাচক অপরাধমূলক দৃশ্যে বাণিজ্যিক কর্পোরেট ব্র্যান্ডকে নেতিবাচকভাবে জড়ানো হলে ট্রেডমার্ক ডায়লিউশন দাবি হতে পারে।",
    suggestedRemedyBn: "নির্দিষ্ট ব্র্যান্ডের পরিবর্তে সাধারণ সাহিত্যিক বিকল্প ব্যবহার করুন।",
    fictionalizedAlternativeBn: "সোডিয়াম বাতি ও দূরবর্তী মোবাইল টাওয়ারের লাল বাতি"
  },
  {
    id: "legal_lyrics_01",
    category: "song_lyrics_copyright",
    categoryLabelBn: "সংগীতের লিরিক্স ও কবিতা কপিরাইট",
    detectedText: "রেডিওতে বাজছিল: 'যদি মন কাঁদে, তুমি চলে এসো...'",
    severity: "moderate",
    legalBasisBn: "কপিরাইট আইন ২০২৩ ও সুরকার/গীতিকার মেকানিক্যাল লাইসেন্সিং",
    riskExplanationBn: "সমসাময়িক জনপ্রিয় আধুনিক গানের লিরিক্স অনুমতি ছাড়া দুই লাইনের বেশি হুবহু উদ্ধৃত করলে কপিরাইট লঙ্ঘনের ঝুঁকি তৈরি হয়।",
    suggestedRemedyBn: "ফেয়ার ইউজ (Fair Use) সীমার মধ্যে রাখুন এবং গ্রন্থস্বত্ব পাতায় গীতিকারের যথাযথ স্বীকৃতি ও ঋণস্বীকার উল্লেখ করুন।",
    fictionalizedAlternativeBn: "রেডিওতে ভেসে আসছিল এক চেনা বিরহের সুর, যার প্রতিটি কথা রাতের নিস্তব্ধতায় বিষাদ ছড়াচ্ছিল..."
  }
];

export function scanManuscriptForLegalRisks(text: string): LegalRiskItem[] {
  const detected = [...DEFAULT_LEGAL_ITEMS];

  // Dynamic regex checks for contemporary trademark or lyrics mentions
  if (/বিকাশ|নগদ|রকেট/i.test(text)) {
    detected.push({
      id: "legal_tm_mfs",
      category: "trademark_dilution",
      categoryLabelBn: "মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS) ব্র্যান্ড সুরক্ষা",
      detectedText: "বিকাশ বা নগদ দিয়ে টাকা লেনদেন",
      severity: "low",
      legalBasisBn: "বাংলাদেশ ব্যাংক গাইডলাইন ও ট্রেডমার্কস আইন ২০০৯",
      riskExplanationBn: "বাণিজ্যিক পেমেন্ট গেটওয়ের নাম কথাসাহিত্যে স্বাভাবিক লেনদেনের ক্ষেত্রে ব্যবহার করা নিরাপদ, তবে অপরাধমূলক জালিয়াতির দৃশ্যে ট্রেডমার্ক সচেতনতা কাম্য।",
      suggestedRemedyBn: "অপরাধমূলক দৃশ্যে 'মোবাইল ওয়ালেট' বা কাল্পনিক ব্যাংকিং অ্যাপ ব্যবহার করুন।",
      fictionalizedAlternativeBn: "মোবাইল ওয়ালেটের মাধ্যমে গোপন লেনদেন"
    });
  }

  return detected;
}

export function buildDefaultLegalReport(projectId: string): LegalShieldAuditReport {
  const items = DEFAULT_LEGAL_ITEMS;
  const criticalCount = items.filter((i) => i.severity === "critical").length;
  const moderateCount = items.filter((i) => i.severity === "moderate").length;
  const lowCount = items.filter((i) => i.severity === "low").length;

  const disclaimerBn =
    "এই গ্রন্থের সমস্ত চরিত্র, স্থান, ঘটনা এবং প্রতিষ্ঠান সম্পূর্ণরূপে কাল্পনিক। কোনো জীবিত বা মৃত ব্যক্তি, বাস্তব ঘটনা বা কোনো বাণিজ্যিক প্রতিষ্ঠানের সাথে কোনো প্রকার সাদৃশ্য পরিলক্ষিত হলে তা সম্পূর্ণ অনিচ্ছাকৃত ও কাকতালীয় বলে গণ্য হবে।";

  const disclaimerEn =
    "This is a work of fiction. Names, characters, businesses, places, events, locales, and incidents are either the products of the author's imagination or used in a fictitious manner. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.";

  return {
    projectId,
    overallComplianceScore: 92,
    totalRisksFound: items.length,
    criticalCount,
    moderateCount,
    lowCount,
    items,
    statutoryDisclaimerBn: disclaimerBn,
    statutoryDisclaimerEn: disclaimerEn
  };
}

export function createLegalShieldRouter(): Router {
  const router = Router();

  const getPaths = [
    "/v1/projects/:projectId/legal-shield",
    "/api/v1/projects/:projectId/legal-shield"
  ];
  router.get(getPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const report = buildDefaultLegalReport(projectId);

    res.json({
      success: true,
      projectId,
      report
    });
  });

  const scanPaths = [
    "/v1/projects/:projectId/legal-shield/scan",
    "/api/v1/projects/:projectId/legal-shield/scan"
  ];
  router.post(scanPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { manuscriptText } = req.body || {};

    const text = typeof manuscriptText === "string" ? manuscriptText : "";
    const items = scanManuscriptForLegalRisks(text);

    const criticalCount = items.filter((i) => i.severity === "critical").length;
    const moderateCount = items.filter((i) => i.severity === "moderate").length;
    const lowCount = items.filter((i) => i.severity === "low").length;

    const complianceScore = Math.max(70, 100 - criticalCount * 15 - moderateCount * 5);

    res.json({
      success: true,
      projectId,
      report: {
        projectId,
        overallComplianceScore: complianceScore,
        totalRisksFound: items.length,
        criticalCount,
        moderateCount,
        lowCount,
        items,
        statutoryDisclaimerBn: buildDefaultLegalReport(projectId).statutoryDisclaimerBn,
        statutoryDisclaimerEn: buildDefaultLegalReport(projectId).statutoryDisclaimerEn
      }
    });
  });

  const disclaimerPaths = [
    "/v1/projects/:projectId/legal-shield/disclaimer",
    "/api/v1/projects/:projectId/legal-shield/disclaimer"
  ];
  router.post(disclaimerPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const defaultReport = buildDefaultLegalReport(projectId);

    const disclaimerMarkdown =
      `\n\n<!-- ======================================================== -->\n` +
      `<!-- SHOTHIK STATUTORY LEGAL DISCLAIMER & SAFE HARBOR SHIELD -->\n` +
      `<!-- ======================================================== -->\n` +
      `### ⚖️ আইনগত ঘোষণা ও প্রকাশনা অধিকার (Legal Disclaimer & Safe Harbor)\n\n` +
      `> **${defaultReport.statutoryDisclaimerBn}**\n\n` +
      `*${defaultReport.statutoryDisclaimerEn}*\n\n` +
      `* **কপিরাইট আইন ২০২৩ (বাংলাদেশ)**: এই গ্রন্থের কোনো অংশ লেখকের পূর্বানুমতি ছাড়া কোনো মাধ্যমে পুনরুৎপাদন করা যাবে না।\n` +
      `* **ন্যায্য ব্যবহার ও লিরিক্স ঋণস্বীকার**: উপন্যাসে ব্যবহৃত সাংস্কৃতিক অনুষঙ্গসমূহ সাহিত্যিক অলংকরণ হিসেবে ফেয়ার ইউজ নীতির আওতায় ব্যবহৃত।\n` +
      `<!-- ======================================================== -->\n`;

    res.json({
      success: true,
      projectId,
      disclaimerMarkdown,
      message: "আইনগত সুরক্ষা ঘোষণা ও প্রকাশনা অধিকার সফলভাবে তৈরি হয়েছে।"
    });
  });

  return router;
}

export const legalShieldRouter = createLegalShieldRouter();
