import { describe, it, expect } from 'vitest';
import {
  NanoGptTokenizer,
  NanoGptEngine,
  SpeculativeDecoder,
  RegionalDomainParsers,
  NANO_GPT_MICRO_38M,
  NANO_GPT_MINI_85M,
} from '../nanogpt';
import { WebGpuInferenceService } from '../WebGpuInferenceService';

describe('nanoGPT Edge Subsystem Suite', () => {
  describe('NanoGptTokenizer', () => {
    it('initializes and encodes ASCII text into valid token IDs', () => {
      const tokenizer = new NanoGptTokenizer(8192);
      const text = 'Hello world order 1250 tk';
      const tokens = tokenizer.encode(text);
      expect(tokens.length).toBeGreaterThan(0);
      const decoded = tokenizer.decode(tokens);
      expect(decoded).toBe(text);
    });

    it('correctly encodes and decodes Unicode Bangla text', () => {
      const tokenizer = new NanoGptTokenizer(8192);
      const banglaText = 'ঢাকা থেকে চট্টগ্রাম ডেলিভারি চার্জ কত টাকা?';
      const tokens = tokenizer.encode(banglaText);
      expect(tokens.length).toBeGreaterThan(0);
      const decoded = tokenizer.decode(tokens);
      expect(decoded).toBe(banglaText);
    });

    it('handles special tokens properly', () => {
      const tokenizer = new NanoGptTokenizer(8192);
      expect(tokenizer.eosTokenId).toBeGreaterThanOrEqual(0);
      expect(tokenizer.bosTokenId).toBeGreaterThanOrEqual(0);
    });
  });

  describe('NanoGptEngine', () => {
    it('initializes 38M micro-configuration and allocates KV Cache', async () => {
      const engine = new NanoGptEngine(NANO_GPT_MICRO_38M);
      await engine.initialize();
      const cache = engine.createKVCache();
      expect(cache.keys.length).toBe(NANO_GPT_MICRO_38M.nLayer);
      expect(cache.values.length).toBe(NANO_GPT_MICRO_38M.nLayer);
    });

    it('generates autoregressive tokens within max token limits', async () => {
      const engine = new NanoGptEngine(NANO_GPT_MICRO_38M);
      const tokensEmitted: string[] = [];
      const output = await engine.generate({
        prompt: 'Order status query',
        maxNewTokens: 10,
        temperature: 0.5,
        onToken: (tok) => tokensEmitted.push(tok),
      });

      expect(typeof output).toBe('string');
      expect(tokensEmitted.length).toBeLessThanOrEqual(10);
    });
  });

  describe('SpeculativeDecoder', () => {
    it('generates lookahead draft tokens and tracks speedup telemetry', async () => {
      const decoder = new SpeculativeDecoder(new NanoGptEngine(NANO_GPT_MICRO_38M), {
        lookaheadDraftTokens: 4,
      });

      const { draftTokens, draftText } = await decoder.generateDraftTokens([12, 45, 67]);
      expect(draftTokens.length).toBe(4);
      expect(typeof draftText).toBe('string');

      // Verify drafts against matching target
      const verification = decoder.verifyDrafts(draftTokens, [...draftTokens]);
      expect(verification.acceptedCount).toBe(4);
      expect(verification.speedupRatio).toBeGreaterThan(2.0);

      const metrics = decoder.getMetrics();
      expect(metrics.totalDrafts).toBe(4);
      expect(metrics.totalAccepted).toBe(4);
      expect(metrics.acceptanceRate).toBe(1.0);
    });
  });

  describe('RegionalDomainParsers', () => {
    it('transliterates common Banglish phrases to Bangla Unicode', () => {
      const banglish = 'ami bhalo achi koto tk lagbe';
      const bangla = RegionalDomainParsers.transliterateBanglish(banglish);
      expect(bangla).toContain('আমি ভালো আছি');
      expect(bangla).toContain('টাকা');
    });

    it('accurately parses Steadfast courier order details and 11-digit phone numbers', () => {
      const orderText = 'Customer: Tanvir Ahmed, 01711223344, House 12 Road 5 Dhanmondi Dhaka. COD 1500 taka';
      const parcel = RegionalDomainParsers.parseCourierParcel(orderText);

      expect(parcel.phone).toBe('01711223344');
      expect(parcel.district).toBe('Dhaka');
      expect(parcel.thana).toBe('Dhanmondi');
      expect(parcel.codAmount).toBe(1500);
      expect(parcel.estimatedDeliveryFee).toBe(70);
      expect(parcel.confidence).toBeGreaterThan(0.7);
    });

    it('calculates NBR Section 78 Individual Income Tax with rebate breakdown', () => {
      // ৳12,00,000 Annual Income, ৳1,00,000 Eligible Investment
      const tax = RegionalDomainParsers.calculateNBRTax(1200000, 100000, 'general', 'dhaka_chattogram');

      expect(tax.totalTaxableIncome).toBe(1200000);
      expect(tax.exemptThreshold).toBe(350000);
      expect(tax.grossTaxPayable).toBeGreaterThan(0);
      expect(tax.investmentRebate).toBe(15000); // 15% of 1,00,000
      expect(tax.finalTaxLiability).toBe(Math.max(tax.netTaxPayable, 5000));
      expect(tax.breakdownSlabs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('WebGpuInferenceService Integration', () => {
    it('correctly flags regional courier and tax queries for local execution', () => {
      expect(WebGpuInferenceService.isEligibleForLocalExecution('tax on 1500000')).toBe(true);
      expect(WebGpuInferenceService.isEligibleForLocalExecution('01711223344 delivery Dhaka COD 500')).toBe(true);
      expect(WebGpuInferenceService.isEligibleForLocalExecution('ami kemon achi')).toBe(true);
      expect(WebGpuInferenceService.isEligibleForLocalExecution('hello')).toBe(true);
    });

    it('generates instant structured stream for courier parcels', async () => {
      const chunks: string[] = [];
      const result = await WebGpuInferenceService.generateLocalStream({
        prompt: '01812345678 Sajjad Chittagong COD 1200 tk',
        onChunk: (c) => chunks.push(c),
      });

      expect(result).toContain('Courier Parcel Extraction');
      expect(result).toContain('01812345678');
      expect(result).toContain('Chattogram');
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
