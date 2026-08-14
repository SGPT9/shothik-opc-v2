/**
 * Bijoy ANSI (ASCII) <-> Bengali Unicode Bidirectional Converter
 * High-performance mapping for South Asian / Bengali publishing workflows.
 */

const BIJOY_TO_UNICODE_MAP: Record<string, string> = {
  'A': 'া', 'B': 'ি', 'C': 'ী', 'D': 'ু', 'E': 'ূ', 'F': 'ৃ', 'G': 'ে', 'H': 'ৈ', 'I': 'ো', 'J': 'ৌ',
  'a': 'ং', 'b': 'ঃ', 'c': 'ঁ', 'd': '্', 'e': 'ত', 'f': 'থ', 'g': 'দ', 'h': 'ধ', 'i': 'ন', 'j': 'প',
  'k': 'ফ', 'l': 'ব', 'm': 'ভ', 'n': 'ম', 'o': 'য', 'p': 'র', 'q': 'ল', 'r': 'শ', 's': 'ষ', 't': 'স',
  'u': 'হ', 'v': 'ড়', 'w': 'ঢ়', 'x': 'য়', 'y': 'ৎ', 'z': 'জ্ঞ',
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  'K': 'ক', 'L': 'খ', 'M': 'গ', 'N': 'ঘ', 'O': 'ঙ', 'P': 'চ', 'Q': 'ছ', 'R': 'জ', 'S': 'ঝ', 'T': 'ঞ',
  'U': 'ট', 'V': 'ঠ', 'W': 'ড', 'X': 'ঢ', 'Y': 'ণ', 'Z': 'ক্ষ',
};

const UNICODE_TO_BIJOY_MAP: Record<string, string> = Object.entries(BIJOY_TO_UNICODE_MAP).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k }),
  {}
);

export function convertBijoyToUnicode(src: string): string {
  if (!src) return '';
  let result = '';
  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    result += BIJOY_TO_UNICODE_MAP[char] || char;
  }
  return result;
}

export function convertUnicodeToBijoy(src: string): string {
  if (!src) return '';
  let result = '';
  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    result += UNICODE_TO_BIJOY_MAP[char] || char;
  }
  return result;
}
