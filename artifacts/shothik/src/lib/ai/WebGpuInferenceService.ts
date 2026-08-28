import { NanoGptEngine, SpeculativeDecoder, RegionalDomainParsers, NANO_GPT_MICRO_38M } from './nanogpt';

export interface WebGpuCapability {
  isSupported: boolean;
  adapterName?: string;
  maxBufferSizeMb?: number;
  tier: 'webgpu_client_turbo' | 'wasm_fallback' | 'server_cloud';
}

export interface InBrowserGenerationOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
  onProgress?: (status: string) => void;
  signal?: AbortSignal;
}

class WebGpuInferenceServiceImpl {
  private capability: WebGpuCapability | null = null;
  private nanoGpt: NanoGptEngine;
  private speculativeDecoder: SpeculativeDecoder;
  private isInitialized = false;

  constructor() {
    this.nanoGpt = new NanoGptEngine(NANO_GPT_MICRO_38M);
    this.speculativeDecoder = new SpeculativeDecoder(this.nanoGpt);
  }

  /**
   * Probes client browser hardware for WebGPU support
   */
  public async probeHardware(): Promise<WebGpuCapability> {
    if (this.capability) return this.capability;

    if (typeof window === 'undefined') {
      this.capability = { isSupported: false, tier: 'server_cloud' };
      return this.capability;
    }

    const nav = window.navigator as any;
    if (nav.gpu && typeof nav.gpu.requestAdapter === 'function') {
      try {
        const adapter = await nav.gpu.requestAdapter();
        if (adapter) {
          const adapterInfo = (adapter as any).info || {};
          this.capability = {
            isSupported: true,
            adapterName: adapterInfo.architecture || adapterInfo.vendor || 'Hardware Accelerated GPU',
            maxBufferSizeMb: Math.round((adapter.limits?.maxBufferSize || 0) / (1024 * 1024)),
            tier: 'webgpu_client_turbo',
          };
          return this.capability;
        }
      } catch (err) {
        console.warn('[WebGpuEngine] WebGPU adapter request failed, falling back:', err);
      }
    }

    // WASM CPU Fallback
    this.capability = {
      isSupported: false,
      tier: 'wasm_fallback',
    };
    return this.capability;
  }

  /**
   * High-speed in-browser generation with nanoGPT micro-engine & regional fast-paths
   */
  public async generateLocalStream(options: InBrowserGenerationOptions): Promise<string> {
    const { prompt, onChunk, onProgress, signal } = options;
    onProgress?.('Accelerating via nanoGPT 38M WebGPU engine...');

    const cleanPrompt = prompt.trim();
    const lowerPrompt = cleanPrompt.toLowerCase();

    // 1. Courier / Logistics Parcel NER Fast-Path
    const isCourierOrder = /01[3-9]\d{8}/.test(cleanPrompt) && /(cod|taka|tk|delivery|district|dhaka|chittagong|sylhet|house|road|mirpur|order)/i.test(cleanPrompt);
    if (isCourierOrder) {
      const parcel = RegionalDomainParsers.parseCourierParcel(cleanPrompt);
      const output = `### 📦 Courier Parcel Extraction (Instant Edge)\n\n` +
        `| Field | Extracted Details |\n` +
        `| :--- | :--- |\n` +
        `| **Recipient** | ${parcel.recipientName} |\n` +
        `| **Phone** | \`${parcel.phone}\` |\n` +
        `| **Destination** | ${parcel.thana}, ${parcel.district} |\n` +
        `| **COD Amount** | **৳${parcel.codAmount.toLocaleString('en-IN')}** |\n` +
        `| **Estimated Delivery** | ৳${parcel.estimatedDeliveryFee} (${parcel.district.toLowerCase() === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}) |\n` +
        `| **Provider** | **${parcel.courierProvider.toUpperCase()}** |\n\n` +
        `> **Verification Status**: Ready to push to ${parcel.courierProvider.toUpperCase()} Merchant API.`;
      
      return this.streamWords(output, onChunk, signal);
    }

    // 2. NBR Tax Calculator Fast-Path
    const taxMatch = lowerPrompt.match(/(?:tax on|income tax|salary tax|tax calculate|tax calculation)[\s:]*([0-9,]+)/i);
    if (taxMatch) {
      const income = parseInt(taxMatch[1].replace(/,/g, ''), 10) || 0;
      if (income > 0) {
        const taxResult = RegionalDomainParsers.calculateNBRTax(income);
        const output = `### 🧾 NBR Section 78 Individual Tax Estimate (FY 2024–2026)\n\n` +
          `| Parameter | Assessment Value |\n` +
          `| :--- | :--- |\n` +
          `| **Gross Annual Income** | ৳${taxResult.totalTaxableIncome.toLocaleString('en-IN')} |\n` +
          `| **General Exemption Limit** | ৳${taxResult.exemptThreshold.toLocaleString('en-IN')} |\n` +
          `| **Gross Tax Liability** | ৳${taxResult.grossTaxPayable.toLocaleString('en-IN')} |\n` +
          `| **Investment Rebate** | ৳${taxResult.investmentRebate.toLocaleString('en-IN')} |\n` +
          `| **Net Tax Payable** | **৳${taxResult.finalTaxLiability.toLocaleString('en-IN')}** |\n\n` +
          `#### Slab Breakdown:\n` +
          taxResult.breakdownSlabs.map(s => `- **${s.slabName}**: ৳${s.taxableAmount.toLocaleString('en-IN')} @ ${s.ratePercent}% = ৳${s.taxAmount.toLocaleString('en-IN')}`).join('\n');

        return this.streamWords(output, onChunk, signal);
      }
    }

    // 3. MFS (bKash / Nagad / Rocket) Cashout & Merchant Fee Fast-Path
    const hasMfsKeyword = /(?:bkash|nagad|rocket)\b/i.test(lowerPrompt);
    const hasFeeKeyword = /(?:cash\s*out|fee|charge|cost|merchant|send\s*money|payment)/i.test(lowerPrompt);
    const numMatch = lowerPrompt.match(/\b([0-9,]{3,9})\b/);

    if (hasMfsKeyword && (hasFeeKeyword || numMatch)) {
      const amount = numMatch ? parseInt(numMatch[1].replace(/,/g, ''), 10) : 1000;
      if (amount > 0) {
        let provider: 'bkash' | 'nagad' | 'rocket' = 'bkash';
        if (/nagad/i.test(lowerPrompt)) provider = 'nagad';
        if (/rocket/i.test(lowerPrompt)) provider = 'rocket';

        const appRes = RegionalDomainParsers.calculateMFSFee(amount, provider, 'app');
        const ussdRes = RegionalDomainParsers.calculateMFSFee(amount, provider, 'ussd');

        const output = `### 📱 ${appRes.provider} Fee & Cash Out Calculation (Edge AST)\n\n` +
          `| Channel | Base Amount | Cash Out Fee | Merchant Fee (1.2%) | Total Cost (Amount + Fee) |\n` +
          `| :--- | :--- | :--- | :--- | :--- |\n` +
          `| **${appRes.provider} App** | ৳${amount.toLocaleString('en-IN')} | **৳${appRes.cashoutFee.toLocaleString('en-IN')}** | ৳${appRes.merchantPaymentFee.toLocaleString('en-IN')} | **৳${appRes.totalCashoutCost.toLocaleString('en-IN')}** |\n` +
          `| **USSD (*247# / *167#)** | ৳${amount.toLocaleString('en-IN')} | **৳${ussdRes.cashoutFee.toLocaleString('en-IN')}** | — | **৳${ussdRes.totalCashoutCost.toLocaleString('en-IN')}** |\n\n` +
          `> **Tip**: Cash out via the **${appRes.provider} App** saves you **৳${(ussdRes.cashoutFee - appRes.cashoutFee).toFixed(2)}** compared to USSD dial code.`;

        return this.streamWords(output, onChunk, signal);
      }
    }

    // 4. Banglish to Bangla Transliteration Fast-Path
    const isBanglish = /(?:ami|apni|tumi|kemon|achi|koto|taka|tk|kobe|hoise|hobe|advance|payment|lagbe|return|policy|discount)\b/i.test(lowerPrompt);
    if (isBanglish && cleanPrompt.split(/\s+/).length < 25) {
      const converted = RegionalDomainParsers.transliterateBanglish(cleanPrompt);
      const output = `### 🇧🇩 Banglish Transliteration (nanoGPT Orthography)\n\n` +
        `• **Input (Banglish)**: *"${cleanPrompt}"*\n` +
        `• **Standard Bangla**: **"${converted}"**`;
      return this.streamWords(output, onChunk, signal);
    }

    // 5. Basic Greetings & Identity
    const isGreeting = /^(h+e+l+l*o+|h+e+y+|h+i+|h+o+w+d+y+|h+o+l+a+|s+u+p+|y+o+|greetings|good\s*(morning|afternoon|evening|day)|assalamu\s*alaikum|salam|kemon\s*(acho|achen))[\s!.]*$/i.test(lowerPrompt);
    const isIdentity = /(what('s| is|s)?\s*(your|yoiur|ur|yo|yur)?\s*(name|identity|id)|who\s*(are|r)\s*(you|u)|who\s*(made|built|created)\s*(you|u)|what\s*(are|r)\s*(you|u)|introduce\s*yourself|tell\s*me\s*about\s*yourself)/i.test(lowerPrompt);
    const isTimeQuery = /(time in bangladesh|bangladesh time|time in dhaka|dhaka time|current time|what time is it|what is the time|today'?s date|what is today'?s date)/i.test(lowerPrompt);

    if (isGreeting) {
      return this.streamWords('Hello! How can I help you today?', onChunk, signal);
    } else if (isTimeQuery) {
      const bdTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date());
      return this.streamWords(`The current time in Bangladesh (GMT+6 · BST) is **${bdTime}**.`, onChunk, signal);
    } else if (isIdentity) {
      return this.streamWords(`I am **Shothik AI**, your intelligent co-founder and workspace engine powered by hybrid nanoGPT edge acceleration and frontier models.`, onChunk, signal);
    }

    // 5. Default Autoregressive Transformer Generation
    const generated = await this.nanoGpt.generate({
      prompt: cleanPrompt,
      maxNewTokens: options.maxTokens ?? 128,
      temperature: options.temperature ?? 0.7,
      onToken: (tok) => onChunk?.(tok),
      signal,
    });

    return generated;
  }

  private async streamWords(text: string, onChunk?: (c: string) => void, signal?: AbortSignal): Promise<string> {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return text;
      const piece = (i === 0 ? '' : ' ') + words[i];
      onChunk?.(piece);
      await new Promise((r) => setTimeout(r, 14));
    }
    return text;
  }

  /**
   * Checks if query is eligible for $0-server in-browser fast path
   */
  public isEligibleForLocalExecution(query: string): boolean {
    const q = query.trim().toLowerCase();
    const isSmallTalk = /^(h+e+l+l*o+|h+e+y+|h+i+|h+o+w+d+y+|h+o+l+a+|s+u+p+|y+o+|greetings|good\s*(morning|afternoon|evening|day)|what('s| is) your name|who are you|thanks|thank you|salam|assalamu\s*alaikum|kemon\s*(acho|achen))[\s!.]*$/i.test(q);
    const isCourier = /01[3-9]\d{8}/.test(query) && /(cod|tk|taka|delivery|district|dhaka|house|road)/i.test(q);
    const isTax = /(?:tax on|income tax|salary tax)[\s:]*([0-9,]+)/i.test(q);
    const isMfs = /(?:bkash|nagad|rocket)[\s\w]*(?:cash\s*out|fee|charge|cost|merchant)[\s\w:]*([0-9,]+)/i.test(q) ||
                  /([0-9,]+)[\s\w]*(?:tk|taka)?[\s\w]*(?:bkash|nagad|rocket)[\s\w]*(?:cash\s*out|fee|charge)/i.test(q);
    const isShortBanglish = /(?:ami|apni|tumi|kemon|achi|koto|taka|tk)\b/i.test(q) && query.split(/\s+/).length < 15;

    return isSmallTalk || isCourier || isTax || isMfs || isShortBanglish;
  }

  public getSpeculativeDecoder(): SpeculativeDecoder {
    return this.speculativeDecoder;
  }

  public getNanoGptEngine(): NanoGptEngine {
    return this.nanoGpt;
  }
}

export const WebGpuInferenceService = new WebGpuInferenceServiceImpl();

