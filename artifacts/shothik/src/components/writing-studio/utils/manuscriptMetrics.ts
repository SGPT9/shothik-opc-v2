/**
 * Shothik Manuscript Metrics & Word-Parity Counter
 * Adapted from GenOffice (Apache-2.0)
 * High-precision statistics for Bengali, English, CJK, and mixed multilingual texts.
 */

// Bengali characters & conjuncts
const BENGALI_WORD_RE = /[\u0980-\u09FF]+(?:['\-][\u0980-\u09FF]+)*/g;

// Latin / alphanumeric words
const LATIN_WORD_RE = /[A-Za-z0-9À-ɏ]+(?:['\-][A-Za-z0-9À-ɏ]+)*/g;

// Han, Kana, Hangul, CJK ideographs
const ASIAN_RE =
  /[ᄀ-ᇿ⺀-⿟、-〿぀-ヿ㄀-ㄯ㄰-㆏㇀-ㇿ㐀-䶿一-鿿가-힯豈-﫿！-｠￠-￦]|[\uD840-\uD87F][\uDC00-\uDFFF]/g;

export interface ManuscriptStats {
  totalWords: number;
  bengaliWords: number;
  latinWords: number;
  asianChars: number;
  characterCount: number;
  characterCountNoSpaces: number;
  estimatedReadingTimeMinutes: number;
  estimatedPrintPages: number;
}

export function computeManuscriptStats(text: string = ''): ManuscriptStats {
  if (!text || text.trim() === '') {
    return {
      totalWords: 0,
      bengaliWords: 0,
      latinWords: 0,
      asianChars: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      estimatedReadingTimeMinutes: 0,
      estimatedPrintPages: 0,
    };
  }

  const bengaliWords = (text.match(BENGALI_WORD_RE) ?? []).length;
  const latinWords = (text.match(LATIN_WORD_RE) ?? []).length;
  const asianChars = (text.match(ASIAN_RE) ?? []).length;

  const totalWords = bengaliWords + latinWords + asianChars;
  const characterCount = text.length;
  const characterCountNoSpaces = text.replace(/\s+/g, '').length;

  // Average reading speed: 200 words per minute
  const estimatedReadingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

  // Average standard book page: 250 words per page
  const estimatedPrintPages = Math.max(1, Math.ceil(totalWords / 250));

  return {
    totalWords,
    bengaliWords,
    latinWords,
    asianChars,
    characterCount,
    characterCountNoSpaces,
    estimatedReadingTimeMinutes,
    estimatedPrintPages,
  };
}
