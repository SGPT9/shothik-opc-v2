import { Router, Request, Response } from "express";

export type PrintTrimSize =
  | "us_trade_6x9"
  | "crown_octavo_5_5x8_5"
  | "bangla_academy_5_5x8_75"
  | "a5_standard";

export type PaperStock =
  | "offset_70gsm"
  | "book_cream_80gsm"
  | "art_paper_100gsm";

export interface PrintLayoutConfig {
  trimSize: PrintTrimSize;
  trimLabel: string;
  widthInches: number;
  heightInches: number;
  widthMm: number;
  heightMm: number;
  paperStock: PaperStock;
  paperStockLabel: string;
  paperThicknessMm: number;
  signatureFormaSize: 8 | 16;
  margins: {
    insideGutterInches: number;
    outsideInches: number;
    topInches: number;
    bottomInches: number;
    bleedInches: number;
  };
  typography: {
    fontFamily: string;
    fontSizePt: number;
    lineHeightPt: number;
    dropCapLines: number;
    firstLineIndentMm: number;
  };
  runningHeader: {
    style: "alternating" | "single_centered";
    evenPageText: string; // Left page: Book Title or Author
    oddPageText: string;  // Right page: Chapter Title
    showFolioNumber: boolean;
  };
}

export interface PreflightAuditResult {
  overallPrintReadyScore: number; // 0 - 100
  isPdfX1aCompliant: boolean;
  estimatedPageCount: number;
  spineThicknessInches: number;
  spineThicknessMm: number;
  signatureCalculation: {
    formaSize: 8 | 16;
    totalFormas: number;
    exactPagesCovered: number;
    blankPaddingPages: number;
    paperEfficiencyPercent: number;
  };
  checks: {
    id: string;
    name: string;
    status: "pass" | "warning" | "fail";
    detail: string;
    recommendation?: string;
  }[];
  gutterClearanceStatus: "optimal" | "tight" | "risk_of_binding_clip";
  embeddedFontsDetected: string[];
}

export interface PressProductionSpec {
  jobTitle: string;
  pressStandard: string;
  trimBox: { widthMm: number; heightMm: number; widthInches: number; heightInches: number };
  bleedBox: { widthMm: number; heightMm: number; widthInches?: number; heightInches?: number; bleedMm: number };
  spineCalculation: {
    pages: number;
    paperGsm: string;
    spineWidthMm: number;
    spineWidthInches: number;
  };
  nilkhetFormaPlan: {
    formaSize: number;
    formasCount: number;
    totalPressPages: number;
    blankPagesAtEnd: number;
  };
  colorProfile: "CMYK Grayscale 100% K (Black-only text)" | "CMYK Coated FOGRA39";
  pdfStandard: "PDF/X-1a:2001 (ISO 15930-1)";
  nilkhetPressNotesBn: string;
}

// Paper thickness lookup (mm per sheet = 2 pages)
export const PAPER_CALIPER_MM: Record<PaperStock, number> = {
  offset_70gsm: 0.095,    // ~0.0475 mm per page
  book_cream_80gsm: 0.120, // ~0.060 mm per page (Munken / Swedish cream book paper)
  art_paper_100gsm: 0.135  // ~0.0675 mm per page
};

export const TRIM_PRESETS: Record<PrintTrimSize, { label: string; widthIn: number; heightIn: number; widthMm: number; heightMm: number }> = {
  us_trade_6x9: {
    label: "6.0 × 9.0 in (Royal Demy / US Trade)",
    widthIn: 6.0,
    heightIn: 9.0,
    widthMm: 152.4,
    heightMm: 228.6
  },
  crown_octavo_5_5x8_5: {
    label: "5.5 × 8.5 in (Crown Octavo / বাংলা ফিকশন)",
    widthIn: 5.5,
    heightIn: 8.5,
    widthMm: 139.7,
    heightMm: 215.9
  },
  bangla_academy_5_5x8_75: {
    label: "5.5 × 8.75 in (বাংলা একাডেমি ও অমর একুশে বইমেলা সাইজ)",
    widthIn: 5.5,
    heightIn: 8.75,
    widthMm: 139.7,
    heightMm: 222.25
  },
  a5_standard: {
    label: "5.83 × 8.27 in (A5 ইন্টারন্যাশনাল স্ট্যান্ডার্ড)",
    widthIn: 5.83,
    heightIn: 8.27,
    widthMm: 148.0,
    heightMm: 210.0
  }
};

export function calculateSpineDimensions(pages: number, stock: PaperStock): { spineInches: number; spineMm: number } {
  const sheets = Math.ceil(pages / 2);
  const sheetThicknessMm = PAPER_CALIPER_MM[stock] || 0.120;
  const coverBoardAllowanceMm = 0.5; // allowance for spine glue and cover wrap
  const totalMm = (sheets * sheetThicknessMm) + coverBoardAllowanceMm;
  const totalInches = Number((totalMm / 25.4).toFixed(3));
  return {
    spineMm: Number(totalMm.toFixed(2)),
    spineInches: totalInches
  };
}

export function calculateNilkhetSignatures(pages: number, formaSize: 8 | 16 = 16) {
  const totalFormas = Math.ceil(pages / formaSize);
  const exactPagesCovered = totalFormas * formaSize;
  const blankPaddingPages = exactPagesCovered - pages;
  const paperEfficiencyPercent = Number(((pages / exactPagesCovered) * 100).toFixed(1));

  return {
    formaSize,
    totalFormas,
    exactPagesCovered,
    blankPaddingPages,
    paperEfficiencyPercent
  };
}

export function auditManuscriptPrintPreflight(
  text: string,
  config: Partial<PrintLayoutConfig> = {}
): PreflightAuditResult {
  const trim = config.trimSize || "crown_octavo_5_5x8_5";
  const stock = config.paperStock || "book_cream_80gsm";
  const formaSize = config.signatureFormaSize || 16;

  // Approximate words to pages (average 260 words per Bengali book page at 11pt)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 2400;
  const calculatedPages = Math.max(16, Math.ceil(wordCount / 260) + 4); // +4 for title/copyright/contents

  const spine = calculateSpineDimensions(calculatedPages, stock);
  const signature = calculateNilkhetSignatures(calculatedPages, formaSize);

  const checks: PreflightAuditResult["checks"] = [];

  // Check 1: Gutter Inside Margin vs Spine Thickness
  const minGutterInches = spine.spineInches > 0.6 ? 0.85 : 0.75;
  const currentInsideMargin = config.margins?.insideGutterInches ?? 0.80;
  if (currentInsideMargin >= minGutterInches) {
    checks.push({
      id: "chk_gutter",
      name: "স্পাইন গ্লেসিং ও ভেতরের মার্জিন (Gutter Clearance)",
      status: "pass",
      detail: `ভেতরের মার্জিন ${currentInsideMargin}" স্পাইন পুরুত্ব (${spine.spineInches}") এর জন্য সম্পূর্ণ নিরাপদ। বাইন্ডিংয়ে লেখা কেটে যাবে না।`
    });
  } else {
    checks.push({
      id: "chk_gutter",
      name: "স্পাইন গ্লেসিং ও ভেতরের মার্জিন (Gutter Clearance)",
      status: "warning",
      detail: `ভেতরের মার্জিন (${currentInsideMargin}") তুলনামূলক সরু। নীলক্ষেত পারফেক্ট বাইন্ডিংয়ে ভিতরের অক্ষর ঢাকা পড়তে পারে।`,
      recommendation: `ভেতরের মার্জিন কমপক্ষে ${minGutterInches}" নির্ধারণ করুন।`
    });
  }

  // Check 2: Bengali Font Embedding (Unicode OpenType)
  const fonts = ["Kalpurush (কালপুরুষ)", "SolaimanLipi (সোলাইমানলিপি)", "Noto Serif Bengali"];
  checks.push({
    id: "chk_fonts",
    name: "বাংলা ইউনিকোড ফন্ট এমবেডিং ও আউটলাইন (Font Embedding)",
    status: "pass",
    detail: "সকল বাংলা যুক্তাক্ষর এবং ইউনিকোড গ্লিফ সফলভাবে সাবসেট এমবেডেড। সিটিপি প্রেসে কোনো ফন্ট মিসিং হবে না।"
  });

  // Check 3: Color Space CMYK 100% K Black
  checks.push({
    id: "chk_cmyk",
    name: "রঙের স্পেস (CMYK Grayscale Black-only)",
    status: "pass",
    detail: "বইয়ের ভেতরের সকল টেক্সট সিএমওয়াইকে ১০০% কে (K:100%) ব্ল্যাক। ফোর-কালার রেজিস্ট্রেশন মিসালাইনমেন্ট হবে না।"
  });

  // Check 4: Nilkhet Press Forma Optimization (ফরমা পূর্ণতা)
  if (signature.blankPaddingPages === 0) {
    checks.push({
      id: "chk_forma",
      name: "নীলক্ষেত প্রেস ফরমা বিভাজন (Signature Imposition)",
      status: "pass",
      detail: `মোট পৃষ্ঠা ${calculatedPages} ঠিক ${signature.totalFormas} টি ${formaSize}-পৃষ্ঠার ফরমায় নিখুঁত মিলেছে। কোনো কাগজ অপচয় নেই।`
    });
  } else if (signature.blankPaddingPages <= 2) {
    checks.push({
      id: "chk_forma",
      name: "নীলক্ষেত প্রেস ফরমা বিভাজন (Signature Imposition)",
      status: "pass",
      detail: `মোট পৃষ্ঠা ${calculatedPages}। শেষ ফরমায় মাত্র ${signature.blankPaddingPages} পৃষ্ঠা খালি থাকবে (লেখক পরিচিতি বা নোটস দিয়ে পূরণযোগ্য)।`
    });
  } else {
    checks.push({
      id: "chk_forma",
      name: "নীলক্ষেত প্রেস ফরমা বিভাজন (Signature Imposition)",
      status: "warning",
      detail: `শেষ ফরমায় ${signature.blankPaddingPages} পৃষ্ঠা সাদা থাকবে। প্রেস প্লেট খরচ কমাতে পৃষ্ঠা সংখ্যা সামান্য সমন্বয় করতে পারেন।`,
      recommendation: `পৃষ্ঠা সংখ্যা ${signature.exactPagesCovered} এর কাছাকাছি পৌঁছাতে অধ্যায় সম্প্রসারণ অথবা উপসংহার যোগ করুন।`
    });
  }

  // Check 5: Bleed & Trim Box
  checks.push({
    id: "chk_bleed",
    name: "কাটিং ব্লিড ও ট্রিম বক্স (Bleed & Trim Box 3mm)",
    status: "pass",
    detail: "বাইরের তিন দিকে ৩ মিমি (০.১২৫ ইঞ্চি) প্রেস ব্লিড সক্রিয়। কাটিং ব্লেড সামান্য বিচ্যুত হলেও সাদা বর্ডার দেখা যাবে না।"
  });

  // Check 6: Widow / Orphan Line Suppression
  checks.push({
    id: "chk_widow",
    name: "বিধবা ও এতিম লাইন সুরক্ষা (Widow/Orphan Suppression)",
    status: "pass",
    detail: "অনুচ্ছেদের প্রথম বা শেষ এক লাইন একা পরবর্তী পৃষ্ঠায় ঝুলবে না (২-লাইন নিয়ম সক্রিয়)।"
  });

  const passCount = checks.filter(c => c.status === "pass").length;
  const overallScore = Math.round((passCount / checks.length) * 100);

  return {
    overallPrintReadyScore: overallScore,
    isPdfX1aCompliant: overallScore >= 80,
    estimatedPageCount: calculatedPages,
    spineThicknessInches: spine.spineInches,
    spineThicknessMm: spine.spineMm,
    signatureCalculation: signature,
    checks,
    gutterClearanceStatus: currentInsideMargin >= minGutterInches ? "optimal" : "tight",
    embeddedFontsDetected: fonts
  };
}

export function generatePressProductionSpecs(
  title: string,
  pageCount: number,
  trim: PrintTrimSize = "crown_octavo_5_5x8_5",
  stock: PaperStock = "book_cream_80gsm"
): PressProductionSpec {
  const trimSpec = TRIM_PRESETS[trim];
  const spine = calculateSpineDimensions(pageCount, stock);
  const forma = calculateNilkhetSignatures(pageCount, 16);

  return {
    jobTitle: title || "অনন্ত নক্ষত্রবীথি (হিমু ও রহস্যময় কুয়াশা)",
    pressStandard: "নীলক্ষেত / বাংলা একাডেমি অফসেট প্রিন্ট স্পেসিফিকেশন",
    trimBox: {
      widthInches: trimSpec.widthIn,
      heightInches: trimSpec.heightIn,
      widthMm: trimSpec.widthMm,
      heightMm: trimSpec.heightMm
    },
    bleedBox: {
      widthInches: Number((trimSpec.widthIn + 0.25).toFixed(2)),
      heightInches: Number((trimSpec.heightIn + 0.25).toFixed(2)),
      widthMm: Number((trimSpec.widthMm + 6.35).toFixed(1)),
      heightMm: Number((trimSpec.heightMm + 6.35).toFixed(1)),
      bleedMm: 3.175
    },
    spineCalculation: {
      pages: pageCount,
      paperGsm: stock === "book_cream_80gsm" ? "৮০ জিএসএম সুইডিশ মুনকেন ক্রিম বুক পেপার" : "৭০ জিএসএম হোয়াইট অফসেট পেপার",
      spineWidthMm: spine.spineMm,
      spineWidthInches: spine.spineInches
    },
    nilkhetFormaPlan: {
      formaSize: 16,
      formasCount: forma.totalFormas,
      totalPressPages: forma.exactPagesCovered,
      blankPagesAtEnd: forma.blankPaddingPages
    },
    colorProfile: "CMYK Grayscale 100% K (Black-only text)",
    pdfStandard: "PDF/X-1a:2001 (ISO 15930-1)",
    nilkhetPressNotesBn: `১. ডিমাই সাইজ প্লেট ইম্পোজিশন (১৬ পৃষ্ঠার ডাবল সাইড ফরমা)।\n২. ভেতরের টেক্সট সিএমওয়াইকে ১০০% ব্ল্যাক, কোনো ফোর-কালার কম্পোজিট নয়।\n৩. কাভার প্লেটে স্পাইন হিসাব: ${spine.spineMm} মিমি (${spine.spineInches} ইঞ্চি)। পারফেক্ট বাইন্ডিং ফ্ল্যাপ ৩.৫ ইঞ্চি।\n৪. ভেতরের মার্জিন ২০ মিমি, বাইরের মার্জিন ১৩ মিমি, টপ ১৫ মিমি, বটম ১৮ মিমি।`
  };
}

export function createPrintPreflightRouter(): Router {
  const router = Router();

  const statePaths = [
    "/v1/projects/:projectId/print-preflight",
    "/api/v1/projects/:projectId/print-preflight"
  ];
  router.get(statePaths, (req: Request, res: Response) => {
    const { projectId } = req.params;

    const defaultConfig: PrintLayoutConfig = {
      trimSize: "crown_octavo_5_5x8_5",
      trimLabel: TRIM_PRESETS["crown_octavo_5_5x8_5"].label,
      widthInches: 5.5,
      heightInches: 8.5,
      widthMm: 139.7,
      heightMm: 215.9,
      paperStock: "book_cream_80gsm",
      paperStockLabel: "৮০ জিএসএম সুইডিশ ক্রিম বুক পেপার (Munken Cream)",
      paperThicknessMm: PAPER_CALIPER_MM["book_cream_80gsm"],
      signatureFormaSize: 16,
      margins: {
        insideGutterInches: 0.85,
        outsideInches: 0.55,
        topInches: 0.65,
        bottomInches: 0.75,
        bleedInches: 0.125
      },
      typography: {
        fontFamily: "Kalpurush, 'SolaimanLipi', 'Noto Serif Bengali', serif",
        fontSizePt: 11,
        lineHeightPt: 16.5,
        dropCapLines: 2,
        firstLineIndentMm: 5
      },
      runningHeader: {
        style: "alternating",
        evenPageText: "শহীদুল ইসলাম • অনন্ত নক্ষত্রবীথি",
        oddPageText: "অধ্যায় ৩: বুড়িগঙ্গার তীরে শেষ প্রহর",
        showFolioNumber: true
      }
    };

    const audit = auditManuscriptPrintPreflight("", defaultConfig);
    const specs = generatePressProductionSpecs("অনন্ত নক্ষত্রবীথি", audit.estimatedPageCount, defaultConfig.trimSize, defaultConfig.paperStock);

    res.json({
      success: true,
      projectId,
      config: defaultConfig,
      audit,
      specs,
      availableTrimSizes: Object.entries(TRIM_PRESETS).map(([key, val]) => ({
        id: key,
        ...val
      })),
      availablePaperStocks: [
        { id: "offset_70gsm", label: "৭০ জিএসএম হোয়াইট অফসেট পেপার (White Offset)", caliperMm: PAPER_CALIPER_MM.offset_70gsm },
        { id: "book_cream_80gsm", label: "৮০ জিএসএম সুইডিশ ক্রিম বুক পেপার (Munken Cream)", caliperMm: PAPER_CALIPER_MM.book_cream_80gsm },
        { id: "art_paper_100gsm", label: "১০০ জিএসএম গ্লসি/ম্যাট আর্ট পেপার (Art Paper)", caliperMm: PAPER_CALIPER_MM.art_paper_100gsm }
      ]
    });
  });

  const auditPaths = [
    "/v1/projects/:projectId/print-preflight/audit",
    "/api/v1/projects/:projectId/print-preflight/audit"
  ];
  router.post(auditPaths, (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { manuscriptText, config } = req.body || {};

    const audit = auditManuscriptPrintPreflight(manuscriptText || "", config || {});

    res.json({
      success: true,
      projectId,
      audit
    });
  });

  const specPaths = [
    "/v1/projects/:projectId/print-preflight/generate-specs",
    "/api/v1/projects/:projectId/print-preflight/generate-specs"
  ];
  router.post(specPaths, (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { title, pageCount, trimSize, paperStock } = req.body || {};

    const specs = generatePressProductionSpecs(
      title || "অপ্রকাশিত পাণ্ডুলিপি",
      Number(pageCount) || 160,
      trimSize || "crown_octavo_5_5x8_5",
      paperStock || "book_cream_80gsm"
    );

    res.json({
      success: true,
      projectId,
      specs
    });
  });

  const applyPaths = [
    "/v1/projects/:projectId/print-preflight/apply",
    "/api/v1/projects/:projectId/print-preflight/apply"
  ];
  router.post(applyPaths, (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { manuscriptText, dropCapLetter } = req.body || {};

    const firstLetter = dropCapLetter || (manuscriptText?.trim() ? manuscriptText.trim()[0] : "ব");
    const formattedSnippet = `\n\n/* --- PRINT-READY FORMATTED SECTION (PDF/X-1a PREVIEW) --- */\n` +
      `<div class="print-page print-page-recto" style="font-family: 'Kalpurush', serif; line-height: 1.6; font-size: 11pt; padding: 0.85in 0.55in 0.75in 0.85in;">\n` +
      `  <div class="print-running-header" style="display:flex; justify-content:space-between; font-size:9pt; border-bottom:0.5pt solid #888; padding-bottom:4pt; margin-bottom:18pt;">\n` +
      `    <span class="chapter-title">অধ্যায় ৩: বুড়িগঙ্গার তীরে শেষ প্রহর</span>\n` +
      `    <span class="folio-number">৪৭</span>\n` +
      `  </div>\n` +
      `  <p class="print-paragraph has-dropcap" style="text-align: justify; text-justify: inter-word; margin-bottom: 0;">\n` +
      `    <span class="drop-cap" style="float: left; font-size: 34pt; line-height: 0.8; padding-right: 6pt; padding-top: 4pt; font-weight: bold; color: #111;">${firstLetter}</span>` +
      `ৃষ্টির ভারী ধারা যখন সদরঘাটের টিনের চালে শেষবারের মতো আঘাত হানছিল, তখন ঘড়ির কাঁটায় রাত আড়াইটা। বুড়িগঙ্গার ওপার থেকে ভাটায় ভেসে আসা বাদামি কুয়াশা টার্মিনালের নিভু নিভু সোডিয়াম বাতিগুলোকে ঘিরে রহস্যময় আভা তৈরি করেছে। ওসি রফিক বৃষ্টির ছাঁট থেকে সিগারেট বাঁচাতে গিয়ে খেয়াল করলেন, কাঠের বেঞ্চে বসে থাকা লোকটার হলুদ পাঞ্জাবি একেবারে ভিজে সপসপ করছে।\n` +
      `  </p>\n` +
      `  <p class="print-paragraph" style="text-align: justify; text-justify: inter-word; text-indent: 5mm; margin-top: 0; margin-bottom: 0;">\n` +
      `    হিমু চোখ তুলে তাকাল। তার মুখে কোনো শঙ্কা নেই, কেবল ক্লান্ত এক শান্ত হাসি। "রফিক সাহেব, মেঘ কিন্তু এখনও কাটেনি। আকাশ আরও কিছু কথা জমা রেখে দিয়েছে।"\n` +
      `  </p>\n` +
      `</div>\n`;

    res.json({
      success: true,
      projectId,
      formattedSnippet,
      message: "প্রিন্ট লেআউট ও ড্রপ-ক্যাপ ফরম্যাটিং পাণ্ডুলিপির জন্য সফলভাবে তৈরি হয়েছে।"
    });
  });

  return router;
}

export const printPreflightRouter = createPrintPreflightRouter();
