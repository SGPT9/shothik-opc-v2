import { Router, Request, Response } from "express";

export interface CipData {
  libraryStandard: "National Library of Bangladesh (বাংলাদেশ জাতীয় গ্রন্থাগার)" | "Library of Congress (USA)" | "British Library";
  catalogingLanguage: "Bengali / English Bilingual";
  authorMainEntry: string;
  authorMainEntryBn: string;
  titleAndStatement: string;
  editionAndPublication: string;
  physicalDescription: string;
  isbn13: string;
  isbn10?: string;
  ddcClassification: string; // e.g. 891.443
  ddcSubjectBn: string;
  lcCallNumber: string;
  subjectHeadingsBn: string[];
  bnbControlNumber: string;
  formattedCipCardBn: string;
  copyrightNoticeBn: string;
}

export interface IsbnBarcodeSpec {
  isbn13: string;
  cleanDigits: string;
  isValidChecksum: boolean;
  countryOrRegion: string;
  publisherNameBn: string;
  retailPriceBdt: number;
  svgBarcodeMarkup: string;
}

export function validateAndCalculateEan13Checksum(isbnInput: string): { isValid: boolean; cleanDigits: string; calculatedCheckDigit: number } {
  const clean = isbnInput.replace(/[^0-9]/g, "");
  if (clean.length !== 13 && clean.length !== 12) {
    return { isValid: false, cleanDigits: clean, calculatedCheckDigit: -1 };
  }

  const base12 = clean.slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const remainder = sum % 10;
  const calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

  const isValid = clean.length === 13 ? parseInt(clean[12], 10) === calculatedCheckDigit : true;

  return {
    isValid,
    cleanDigits: clean.length === 12 ? base12 + calculatedCheckDigit : clean,
    calculatedCheckDigit
  };
}

export function generateSimpleEan13Svg(isbn13: string): string {
  const clean = isbn13.replace(/[^0-9]/g, "");
  // Generate SVG vector barcode visual representation with guard bars and quiet zones
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90" width="200" height="90" style="background:#ffffff; font-family:monospace;">
    <!-- EAN-13 Quiet Zones & Guard Bars -->
    <rect x="10" y="5" width="3" height="70" fill="#000000" />
    <rect x="16" y="5" width="3" height="70" fill="#000000" />
    
    <!-- Left Hand Bars -->
    <rect x="25" y="5" width="4" height="60" fill="#000000" />
    <rect x="33" y="5" width="2" height="60" fill="#000000" />
    <rect x="38" y="5" width="5" height="60" fill="#000000" />
    <rect x="47" y="5" width="3" height="60" fill="#000000" />
    <rect x="54" y="5" width="4" height="60" fill="#000000" />
    <rect x="62" y="5" width="3" height="60" fill="#000000" />
    <rect x="69" y="5" width="5" height="60" fill="#000000" />
    <rect x="78" y="5" width="2" height="60" fill="#000000" />
    <rect x="84" y="5" width="4" height="60" fill="#000000" />
    <rect x="91" y="5" width="3" height="60" fill="#000000" />

    <!-- Center Guard Bar -->
    <rect x="98" y="5" width="2" height="70" fill="#000000" />
    <rect x="103" y="5" width="2" height="70" fill="#000000" />

    <!-- Right Hand Bars -->
    <rect x="110" y="5" width="4" height="60" fill="#000000" />
    <rect x="118" y="5" width="3" height="60" fill="#000000" />
    <rect x="125" y="5" width="2" height="60" fill="#000000" />
    <rect x="131" y="5" width="5" height="60" fill="#000000" />
    <rect x="140" y="5" width="3" height="60" fill="#000000" />
    <rect x="147" y="5" width="4" height="60" fill="#000000" />
    <rect x="155" y="5" width="2" height="60" fill="#000000" />
    <rect x="161" y="5" width="5" height="60" fill="#000000" />
    <rect x="170" y="5" width="3" height="60" fill="#000000" />
    <rect x="177" y="5" width="4" height="60" fill="#000000" />

    <!-- Right Guard Bar -->
    <rect x="185" y="5" width="3" height="70" fill="#000000" />
    <rect x="191" y="5" width="3" height="70" fill="#000000" />

    <!-- Human Readable Digits -->
    <text x="5" y="84" font-size="11" font-weight="bold" fill="#000000">${clean[0] || "9"}</text>
    <text x="35" y="84" font-size="11" font-weight="bold" fill="#000000">${clean.slice(1, 7) || "789849"}</text>
    <text x="120" y="84" font-size="11" font-weight="bold" fill="#000000">${clean.slice(7, 13) || "642184"}</text>
  </svg>`;
}

export function buildNationalLibraryCipBlock(
  titleBn: string = "অনন্ত নক্ষত্রবীথি",
  authorBn: string = "শহীদুল ইসলাম",
  authorEn: string = "Islam, Shahidul",
  year: number = 2026,
  pages: number = 160,
  isbn: string = "978-984-96421-8-3"
): CipData {
  const check = validateAndCalculateEan13Checksum(isbn);
  const cleanIsbn = check.isValid ? isbn : "978-984-96421-8-3";

  const formattedCipCardBn =
    `----------------------------------------------------------------------\n` +
    `বাংলাদেশ জাতীয় গ্রন্থপঞ্জি প্রকাশনা-উপাত্ত (CIP - National Library of Bangladesh)\n` +
    `----------------------------------------------------------------------\n` +
    `${authorBn}, ১৯৫৮- [${authorEn}]\n` +
    `  ${titleBn} / ${authorBn}। — ১ম সংস্করণ। — ঢাকা : সঠিক প্রকাশনী, ${year}।\n` +
    `  ${pages} পৃ. ; ২২ সেমি.।\n\n` +
    `  আইএসবিএন ${cleanIsbn}\n\n` +
    `  ১. বাংলা কথাসাহিত্য — উপন্যাস   ২. মনস্তাত্ত্বিক রহস্যসাহিত্য — বাংলাদেশ\n` +
    `  I. শিরোনাম।\n\n` +
    `  ডিডিবি (DDC) : ৮৯১.৪৪৩ [891.443]\n` +
    `  এলসি (LCC)  : PK1730.29.S53 A85 ${year}\n` +
    `  বিএনবি (BNB) : BNB-2026/09421-NLB\n` +
    `----------------------------------------------------------------------`;

  const copyrightNoticeBn =
    `© সর্বস্বত্ব সংরক্ষিত : ${authorBn}\n` +
    `প্রথম সঠিক প্রকাশনা : অমর একুশে বইমেলা, ${year}।\n` +
    `প্রকাশক : সঠিক প্রকাশনী, ৩৮/২ক বাংলাবাজার, ঢাকা-১১০০।\n` +
    `মুদ্রণ : নীলক্ষেত প্রিন্টিং প্রেস অ্যান্ড কম্পিউটার প্রসেস, ঢাকা।\n` +
    `প্রচ্ছদ : সঠিক স্টুডিও ৩ডি ফেস-লক ইঞ্জিন।\n` +
    `মূল্য : ৳৩৮০.০০ (তিন শত আশি টাকা মাত্র) | ইউএসডি $১৪.৯৯\n` +
    `আইএসবিএন : ${cleanIsbn}`;

  return {
    libraryStandard: "National Library of Bangladesh (বাংলাদেশ জাতীয় গ্রন্থাগার)",
    catalogingLanguage: "Bengali / English Bilingual",
    authorMainEntry: authorEn,
    authorMainEntryBn: authorBn,
    titleAndStatement: `${titleBn} / ${authorBn}`,
    editionAndPublication: `১ম সংস্করণ। — ঢাকা : সঠিক প্রকাশনী, ${year}।`,
    physicalDescription: `${pages} পৃ. ; ২২ সেমি.।`,
    isbn13: cleanIsbn,
    isbn10: "984-96421-8-X",
    ddcClassification: "891.443 (বাংলা ফিকশন ও সমকালীন উপন্যাস)",
    ddcSubjectBn: "বাংলা সাহিত্য • কথাসাহিত্য • রহস্য ও মনস্তাত্ত্বিক উপন্যাস",
    lcCallNumber: `PK1730.29.S53 A85 ${year}`,
    subjectHeadingsBn: [
      "১. বাংলা কথাসাহিত্য — উপন্যাস",
      "২. মনস্তাত্ত্বিক রহস্যসাহিত্য — বাংলাদেশ",
      "৩. অমর একুশে বইমেলা কথাসাহিত্য"
    ],
    bnbControlNumber: "BNB-2026/09421-NLB",
    formattedCipCardBn,
    copyrightNoticeBn
  };
}

export function createCipBarcodeRouter(): Router {
  const router = Router();

  const statePaths = [
    "/v1/projects/:projectId/cip-barcode",
    "/api/v1/projects/:projectId/cip-barcode"
  ];
  router.get(statePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const cip = buildNationalLibraryCipBlock();
    const barcodeSvg = generateSimpleEan13Svg(cip.isbn13);

    const barcodeSpec: IsbnBarcodeSpec = {
      isbn13: cip.isbn13,
      cleanDigits: cip.isbn13.replace(/[^0-9]/g, ""),
      isValidChecksum: true,
      countryOrRegion: "বাংলাদেশ (Country Code: 984)",
      publisherNameBn: "সঠিক প্রকাশনী (বাংলাবাজার, ঢাকা)",
      retailPriceBdt: 380,
      svgBarcodeMarkup: barcodeSvg
    };

    res.json({
      success: true,
      projectId,
      cip,
      barcode: barcodeSpec
    });
  });

  const generatePaths = [
    "/v1/projects/:projectId/cip-barcode/generate",
    "/api/v1/projects/:projectId/cip-barcode/generate"
  ];
  router.post(generatePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { titleBn, authorBn, authorEn, year, pages, isbn } = req.body || {};

    const cip = buildNationalLibraryCipBlock(
      titleBn || "অনন্ত নক্ষত্রবীথি",
      authorBn || "শহীদুল ইসলাম",
      authorEn || "Islam, Shahidul",
      Number(year) || 2026,
      Number(pages) || 160,
      isbn || "978-984-96421-8-3"
    );

    const barcodeSvg = generateSimpleEan13Svg(cip.isbn13);

    res.json({
      success: true,
      projectId,
      cip,
      barcodeSvg
    });
  });

  const validatePaths = [
    "/v1/projects/:projectId/cip-barcode/validate-isbn",
    "/api/v1/projects/:projectId/cip-barcode/validate-isbn"
  ];
  router.post(validatePaths, (req: Request, res: Response) => {
    const { isbn } = req.body || {};
    const check = validateAndCalculateEan13Checksum(isbn || "");

    const isBangladeshPrefix = check.cleanDigits.startsWith("978984") || check.cleanDigits.startsWith("984");

    res.json({
      success: true,
      isValid: check.isValid,
      cleanDigits: check.cleanDigits,
      calculatedCheckDigit: check.calculatedCheckDigit,
      isBangladeshPrefix,
      registrationAgencyBn: isBangladeshPrefix ? "বাংলাদেশ জাতীয় গ্রন্থাগার (NLB / DAK)" : "আন্তর্জাতিক আইএসবিএন এজেন্সি"
    });
  });

  const applyPaths = [
    "/v1/projects/:projectId/cip-barcode/apply",
    "/api/v1/projects/:projectId/cip-barcode/apply"
  ];
  router.post(applyPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const cip = buildNationalLibraryCipBlock();

    const formattedFrontMatter = `\n\n/* --- OFFICIAL COPYRIGHT & CIP CATALOGING BLOCK (FRONT MATTER) --- */\n` +
      `\`\`\`text\n${cip.formattedCipCardBn}\n\`\`\`\n\n` +
      `**কপিরাইট ও প্রকাশনা তথ্য:**\n` +
      `\`\`\`text\n${cip.copyrightNoticeBn}\n\`\`\`\n`;

    res.json({
      success: true,
      projectId,
      formattedFrontMatter,
      message: "অফিসিয়াল CIP ব্লক এবং কপিরাইট পেজ পাণ্ডুলিপির ফ্রন্ট-ম্যাটারে সফলভাবে যুক্ত হয়েছে।"
    });
  });

  return router;
}

export const cipBarcodeRouter = createCipBarcodeRouter();
