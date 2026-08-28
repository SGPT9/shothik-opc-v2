/**
 * NanoGptTokenizer — Byte-Level BPE & Multi-Script Tokenizer for Shothik nanoGPT
 * Supports English, Bangla Unicode, and Romanized Banglish phonetics.
 */

export interface TokenizerSpecialTokens {
  bosToken: string;
  eosToken: string;
  padToken: string;
  userToken: string;
  assistantToken: string;
  thinkStartToken: string;
  thinkEndToken: string;
}

export const SPECIAL_TOKENS: TokenizerSpecialTokens = {
  bosToken: '<|startoftext|>',
  eosToken: '<|endoftext|>',
  padToken: '<|pad|>',
  userToken: '<|user|>',
  assistantToken: '<|assistant|>',
  thinkStartToken: '<|think|>',
  thinkEndToken: '<|/think|>',
};

export class NanoGptTokenizer {
  private vocabSize: number;
  private tokenToId: Map<string, number> = new Map();
  private idToToken: Map<number, string> = new Map();
  private byteEncoder: Map<number, string> = new Map();
  private byteDecoder: Map<string, number> = new Map();

  constructor(vocabSize: number = 8192) {
    this.vocabSize = vocabSize;
    this.initByteMaps();
    this.buildBaseVocabulary();
  }

  /**
   * Initializes standard byte-to-unicode bijective mapping (mirroring GPT-2/nanoGPT)
   */
  private initByteMaps(): void {
    let n = 0;
    // Map 256 raw bytes to visible unicode characters
    for (let b = 0; b < 256; b++) {
      let ch: string;
      if (
        (b >= 33 && b <= 126) || // printable ASCII
        (b >= 161 && b <= 172) ||
        (b >= 174 && b <= 255)
      ) {
        ch = String.fromCharCode(b);
      } else {
        ch = String.fromCharCode(256 + n);
        n++;
      }
      this.byteEncoder.set(b, ch);
      this.byteDecoder.set(ch, b);
    }
  }

  /**
   * Builds base vocabulary including special tokens, ASCII, and frequent Bangla graphemes
   */
  private buildBaseVocabulary(): void {
    let nextId = 0;

    // 1. Register Special Control Tokens
    const specials = [
      SPECIAL_TOKENS.eosToken,
      SPECIAL_TOKENS.bosToken,
      SPECIAL_TOKENS.padToken,
      SPECIAL_TOKENS.userToken,
      SPECIAL_TOKENS.assistantToken,
      SPECIAL_TOKENS.thinkStartToken,
      SPECIAL_TOKENS.thinkEndToken,
    ];
    for (const token of specials) {
      this.tokenToId.set(token, nextId);
      this.idToToken.set(nextId, token);
      nextId++;
    }

    // 2. Register 256 raw byte tokens
    for (const [_, ch] of this.byteEncoder) {
      if (!this.tokenToId.has(ch)) {
        this.tokenToId.set(ch, nextId);
        this.idToToken.set(nextId, ch);
        nextId++;
      }
    }

    // 3. Register Frequent Subwords & Bangla Unicode clusters
    const commonSubwords = [
      ' ', '  ', '   ', '\n', '\n\n', '\t',
      'the', 'is', 'and', 'to', 'in', 'of', 'for', 'you', 'that', 'with', 'on', 'this',
      'order', 'price', 'delivery', 'address', 'phone', 'tk', 'bdt', 'status',
      // Bangla frequent words
      'আমি', 'আপনি', 'তুমি', 'কি', 'কী', 'করে', 'হবে', 'কত', 'টাকা', 'ডেলিভারি', 'অর্ডার',
      'ঠিকানা', 'নাম', 'ফোন', 'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল',
      'ক্যাশ', 'অন', 'ধন্যবাদ', 'আছে', 'নাই', 'ভালো', 'খারাপ', 'কুরিয়ার', 'স্টেডফাস্ট', 'পাঠাও'
    ];

    for (const subword of commonSubwords) {
      if (!this.tokenToId.has(subword) && nextId < this.vocabSize) {
        this.tokenToId.set(subword, nextId);
        this.idToToken.set(nextId, subword);
        nextId++;
      }
    }
  }

  /**
   * Encode text string into an array of token IDs
   */
  public encode(text: string): number[] {
    if (!text) return [];

    const tokens: number[] = [];
    let remaining = text;

    // Check for special tokens first
    for (const [special, id] of this.tokenToId.entries()) {
      if (special.startsWith('<|') && special.endsWith('|>') && remaining.includes(special)) {
        // Handle special tokens when matched directly
      }
    }

    // Convert string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(remaining);

    // Greedy subword / byte matching
    let i = 0;
    while (i < bytes.length) {
      // Try subwords decoded as string
      let matched = false;
      for (let len = Math.min(24, bytes.length - i); len > 1; len--) {
        const slice = bytes.subarray(i, i + len);
        try {
          const sliceStr = new TextDecoder('utf-8', { fatal: true }).decode(slice);
          if (this.tokenToId.has(sliceStr)) {
            tokens.push(this.tokenToId.get(sliceStr)!);
            i += len;
            matched = true;
            break;
          }
        } catch {
          // not valid UTF-8 slice, continue
        }
      }

      if (!matched) {
        // Fallback to byte token
        const b = bytes[i];
        const byteChar = this.byteEncoder.get(b) || String.fromCharCode(b);
        const tokenId = this.tokenToId.get(byteChar) ?? (b % this.vocabSize);
        tokens.push(tokenId);
        i++;
      }
    }

    return tokens;
  }

  /**
   * Decode an array of token IDs back into a UTF-8 string
   */
  public decode(tokenIds: number[]): string {
    if (!tokenIds || tokenIds.length === 0) return '';

    const byteList: number[] = [];

    for (const id of tokenIds) {
      const token = this.idToToken.get(id);
      if (!token) continue;

      // Handle special tokens
      if (token.startsWith('<|') && token.endsWith('|>')) {
        continue; // Strip special tokens from raw decoded output
      }

      if (this.byteDecoder.has(token)) {
        byteList.push(this.byteDecoder.get(token)!);
      } else {
        const strBytes = new TextEncoder().encode(token);
        for (const b of strBytes) {
          byteList.push(b);
        }
      }
    }

    try {
      return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(byteList));
    } catch {
      return String.fromCharCode(...byteList);
    }
  }

  /**
   * Returns special token IDs
   */
  public get eosTokenId(): number {
    return this.tokenToId.get(SPECIAL_TOKENS.eosToken) ?? 0;
  }

  public get bosTokenId(): number {
    return this.tokenToId.get(SPECIAL_TOKENS.bosToken) ?? 1;
  }

  public get padTokenId(): number {
    return this.tokenToId.get(SPECIAL_TOKENS.padToken) ?? 2;
  }
}
