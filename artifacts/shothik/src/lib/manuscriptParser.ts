import { convertBijoyToUnicode } from "./BijoyConverter";

export interface ParsedChapter {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  wordCount: number;
}

export interface ParsedManuscript {
  title: string;
  chapters: ParsedChapter[];
  totalWords: number;
  detectedFormat: "unicode" | "bijoy_ansi" | "markdown" | "plain";
}

/**
 * Robust regex matching chapter headers across English and Bengali manuscripts:
 * - "Chapter 1: The Beginning"
 * - "অধ্যায় ১ : প্রথম সূচনা"
 * - "১ম পরিচ্ছেদ"
 * - "# Chapter 1"
 * - "ACT I - SCENE 1"
 */
const CHAPTER_HEADER_REGEX = /^(?:#+\s*)?(?:(?:Chapter|CHAPTER|অধ্যায়|পরিচ্ছেদ|পর্যায়|Act|ACT|Scene|SCENE)\s*[:\-\s]?\s*[\d০-৯IVXLCDMivxlcdm]+(?:[^\n]*)|(?:[১-৯১২৩৪৫৬৭৮৯০]+(?:ম|য়|র্থ|ষ্ঠ|তম)\s*(?:অধ্যায়|পরিচ্ছেদ)[^\n]*))$/im;

export function parseRawManuscript(
  rawText: string,
  fileName: string = "Imported Manuscript"
): ParsedManuscript {
  if (!rawText || !rawText.trim()) {
    return {
      title: fileName.replace(/\.[^/.]+$/, ""),
      chapters: [],
      totalWords: 0,
      detectedFormat: "plain",
    };
  }

  // Detect and convert Bijoy ANSI if needed
  let cleanedText = rawText;
  let detectedFormat: "unicode" | "bijoy_ansi" | "markdown" | "plain" = "plain";

  // Check for Bijoy ASCII signature characters (e.g. 'Av', 'w', 'v', '‡')
  if (/[Av|~w]{3,}/.test(rawText) && !/[\u0980-\u09FF]/.test(rawText)) {
    cleanedText = convertBijoyToUnicode(rawText);
    detectedFormat = "bijoy_ansi";
  } else if (/^#+\s+/m.test(rawText)) {
    detectedFormat = "markdown";
  } else if (/[\u0980-\u09FF]/.test(rawText)) {
    detectedFormat = "unicode";
  }

  const lines = cleanedText.split(/\r?\n/);
  const chapters: ParsedChapter[] = [];
  let currentChapterTitle = "Chapter 1: The Inciting Incident";
  let currentChapterLines: string[] = [];
  let chapterIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (CHAPTER_HEADER_REGEX.test(line)) {
      // Save previous chapter if it had content
      if (currentChapterLines.length > 0) {
        const fullContent = currentChapterLines.join("\n").trim();
        const words = fullContent.split(/\s+/).filter(Boolean).length;
        const firstPara = currentChapterLines.find((l) => l.trim().length > 20) || "";

        chapters.push({
          id: `ch-${chapterIndex}`,
          title: currentChapterTitle,
          synopsis: firstPara.slice(0, 140) + (firstPara.length > 140 ? "…" : ""),
          content: fullContent,
          wordCount: words,
        });
        chapterIndex++;
      }

      currentChapterTitle = line.replace(/^#+\s*/, "").trim();
      currentChapterLines = [];
    } else {
      currentChapterLines.push(lines[i]);
    }
  }

  // Add the final chapter
  if (currentChapterLines.length > 0) {
    const fullContent = currentChapterLines.join("\n").trim();
    const words = fullContent.split(/\s+/).filter(Boolean).length;
    const firstPara = currentChapterLines.find((l) => l.trim().length > 20) || "";

    chapters.push({
      id: `ch-${chapterIndex}`,
      title: currentChapterTitle,
      synopsis: firstPara.slice(0, 140) + (firstPara.length > 140 ? "…" : ""),
      content: fullContent,
      wordCount: words,
    });
  }

  // Fallback: If no explicit chapter headers were found, split by word count (approx 2,500 words per chapter)
  if (chapters.length <= 1 && cleanedText.length > 6000) {
    const paragraphs = cleanedText.split(/\n\s*\n/);
    const chunkedChapters: ParsedChapter[] = [];
    let currentChunk: string[] = [];
    let chunkWords = 0;
    let chunkIdx = 1;

    for (const para of paragraphs) {
      currentChunk.push(para);
      chunkWords += para.split(/\s+/).length;

      if (chunkWords >= 2000) {
        const chunkText = currentChunk.join("\n\n");
        chunkedChapters.push({
          id: `ch-${chunkIdx}`,
          title: `Chapter ${chunkIdx}`,
          synopsis: currentChunk[0].slice(0, 120) + "…",
          content: chunkText,
          wordCount: chunkWords,
        });
        currentChunk = [];
        chunkWords = 0;
        chunkIdx++;
      }
    }

    if (currentChunk.length > 0) {
      chunkedChapters.push({
        id: `ch-${chunkIdx}`,
        title: `Chapter ${chunkIdx}`,
        synopsis: currentChunk[0].slice(0, 120) + "…",
        content: currentChunk.join("\n\n"),
        wordCount: chunkWords,
      });
    }

    if (chunkedChapters.length > 1) {
      return {
        title: fileName.replace(/\.[^/.]+$/, ""),
        chapters: chunkedChapters,
        totalWords: chunkedChapters.reduce((acc, c) => acc + c.wordCount, 0),
        detectedFormat,
      };
    }
  }

  const totalWords = chapters.reduce((acc, c) => acc + c.wordCount, 0);

  return {
    title: fileName.replace(/\.[^/.]+$/, ""),
    chapters: chapters.length > 0 ? chapters : [
      {
        id: "ch-1",
        title: "Chapter 1",
        synopsis: cleanedText.slice(0, 120) + "…",
        content: cleanedText,
        wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
      },
    ],
    totalWords: totalWords || cleanedText.split(/\s+/).filter(Boolean).length,
    detectedFormat,
  };
}
