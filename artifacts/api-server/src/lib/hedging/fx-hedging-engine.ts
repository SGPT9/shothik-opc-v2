import crypto from 'crypto';

export type ForwardTenorDays = 30 | 60 | 90 | 180;

export type ForwardContractStatus = 'active' | 'settled' | 'cancelled' | 'matured';

export interface ForwardRateQuote {
  tenorDays: ForwardTenorDays;
  spotRate: number;
  bdtInterestRatePercent: number;
  usdInterestRatePercent: number;
  forwardRate: number;
  forwardPointsBdt: number;
  annualizedPremiumPercent: number;
  maturityDate: string;
}

export interface ForwardContractRecord {
  contractNumber: string;
  adBankCode: string;
  adBankName: string;
  exporterName: string;
  underlyingExpNumber: string;
  underlyingLcNumber: string;
  notionalAmountUsd: number;
  spotRateAtBooking: number;
  lockedForwardRate: number;
  lockedValueBdt: number;
  tenorDays: ForwardTenorDays;
  bookingDate: string;
  maturityDate: string;
  marginLienPercent: number;
  marginLienAmountBdt: number;
  currentMtmValueBdt: number;
  unrealizedMtmGainLossBdt: number;
  status: ForwardContractStatus;
  settlementDate?: string;
  realizedGainLossBdt?: number;
  verificationHash: string;
  createdAt: string;
}

export interface FxHedgingSummary {
  totalOpenHedgedUsd: number;
  totalLockedValueBdt: number;
  weightedAverageForwardRate: number;
  totalUnrealizedMtmGainLossBdt: number;
  totalRealizedGainLossBdt: number;
  totalMarginLienCollateralBdt: number;
  activeContractsCount: number;
  settledContractsCount: number;
}

export class FxHedgingEngine {
  private contracts: Map<string, ForwardContractRecord> = new Map();
  private baseSpotRate: number = 121.5;
  private bdtYieldPercent: number = 11.5; // SMART + Spread
  private usdSofrPercent: number = 5.25; // US SOFR Rate

  constructor() {
    this.seedDefaultContracts();
  }

  /**
   * Computes Covered Interest Rate Parity (CIRP) forward rates for 30/60/90/180-day tenors
   */
  public calculateForwardQuotes(
    spotRate: number = this.baseSpotRate,
    bdtRate: number = this.bdtYieldPercent,
    usdRate: number = this.usdSofrPercent
  ): Record<ForwardTenorDays, ForwardRateQuote> {
    const tenors: ForwardTenorDays[] = [30, 60, 90, 180];
    const quotes = {} as Record<ForwardTenorDays, ForwardRateQuote>;

    for (const t of tenors) {
      const bdtFactor = 1 + (bdtRate / 100) * (t / 360);
      const usdFactor = 1 + (usdRate / 100) * (t / 360);
      const forwardRate = Number((spotRate * (bdtFactor / usdFactor)).toFixed(4));
      const forwardPointsBdt = Number((forwardRate - spotRate).toFixed(4));
      const annualizedPremiumPercent = Number((((forwardRate - spotRate) / spotRate) * (360 / t) * 100).toFixed(2));

      const maturityTime = Date.now() + t * 24 * 60 * 60 * 1000;
      const maturityDate = new Date(maturityTime).toISOString().split('T')[0];

      quotes[t] = {
        tenorDays: t,
        spotRate,
        bdtInterestRatePercent: bdtRate,
        usdInterestRatePercent: usdRate,
        forwardRate,
        forwardPointsBdt,
        annualizedPremiumPercent,
        maturityDate,
      };
    }

    return quotes;
  }

  /**
   * Books a forward exchange contract with an Authorized Dealer bank
   */
  public bookForwardContract(input: Partial<ForwardContractRecord>): ForwardContractRecord {
    const spotRate = input.spotRateAtBooking || this.baseSpotRate;
    const tenorDays = (input.tenorDays || 90) as ForwardTenorDays;
    const quotes = this.calculateForwardQuotes(spotRate);
    const quote = quotes[tenorDays];

    const notionalAmountUsd = input.notionalAmountUsd || 10000;
    const lockedForwardRate = input.lockedForwardRate || quote.forwardRate;
    const lockedValueBdt = Number((notionalAmountUsd * lockedForwardRate).toFixed(2));

    const marginLienPercent = input.marginLienPercent ?? 5.0; // 5% standard bank cash lien
    const marginLienAmountBdt = Number(((lockedValueBdt * marginLienPercent) / 100).toFixed(2));

    const contractNumber =
      input.contractNumber ||
      `FWD-${input.adBankCode || '0420'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingDate = input.bookingDate || new Date().toISOString().split('T')[0];
    const maturityDate = quote.maturityDate;

    // Current MTM revaluation assuming current spot rate
    const currentSpotValueBdt = notionalAmountUsd * spotRate;
    const unrealizedMtmGainLossBdt = Number((lockedValueBdt - currentSpotValueBdt).toFixed(2));

    const verificationHash = crypto
      .createHash('sha256')
      .update(`${contractNumber}:${notionalAmountUsd}:${lockedForwardRate}:${maturityDate}`)
      .digest('hex');

    const contract: ForwardContractRecord = {
      contractNumber,
      adBankCode: input.adBankCode || '0420',
      adBankName: input.adBankName || 'BRAC Bank PLC',
      exporterName: input.exporterName || 'Shothik Export & Heritage Crafts Ltd.',
      underlyingExpNumber: input.underlyingExpNumber || 'EXP-0420-2026-00891',
      underlyingLcNumber: input.underlyingLcNumber || 'LC-NORDIC-2026-091',
      notionalAmountUsd,
      spotRateAtBooking: spotRate,
      lockedForwardRate,
      lockedValueBdt,
      tenorDays,
      bookingDate,
      maturityDate,
      marginLienPercent,
      marginLienAmountBdt,
      currentMtmValueBdt: lockedValueBdt,
      unrealizedMtmGainLossBdt,
      status: input.status || 'active',
      verificationHash,
      createdAt: new Date().toISOString(),
    };

    this.contracts.set(contractNumber, contract);
    return contract;
  }

  /**
   * Settles an active forward contract upon inward foreign currency remittance realization
   */
  public settleForwardContract(contractNumber: string, settlementSpotRate: number = this.baseSpotRate): ForwardContractRecord {
    const contract = this.contracts.get(contractNumber);
    if (!contract) {
      throw new Error(`Forward contract #${contractNumber} not found.`);
    }

    if (contract.status !== 'active') {
      throw new Error(`Forward contract #${contractNumber} is already ${contract.status}.`);
    }

    // Realized exchange gain/loss: locked forward amount minus spot equivalent on settlement day
    const spotEquivalentBdt = contract.notionalAmountUsd * settlementSpotRate;
    const realizedGainLossBdt = Number((contract.lockedValueBdt - spotEquivalentBdt).toFixed(2));

    contract.status = 'settled';
    contract.settlementDate = new Date().toISOString().split('T')[0];
    contract.realizedGainLossBdt = realizedGainLossBdt;
    contract.unrealizedMtmGainLossBdt = 0;

    this.contracts.set(contractNumber, contract);
    return contract;
  }

  /**
   * Revalues all active forward contracts under current market spot rate
   */
  public revalueMtm(currentSpotRate: number): void {
    this.baseSpotRate = currentSpotRate;
    for (const contract of this.contracts.values()) {
      if (contract.status === 'active') {
        const spotEquivalentBdt = contract.notionalAmountUsd * currentSpotRate;
        contract.unrealizedMtmGainLossBdt = Number((contract.lockedValueBdt - spotEquivalentBdt).toFixed(2));
      }
    }
  }

  /**
   * Returns portfolio aggregate hedging metrics
   */
  public getSummaryMetrics(currentSpotRate: number = this.baseSpotRate): FxHedgingSummary {
    let totalOpenHedgedUsd = 0;
    let totalLockedValueBdt = 0;
    let totalUnrealizedMtmGainLossBdt = 0;
    let totalRealizedGainLossBdt = 0;
    let totalMarginLienCollateralBdt = 0;
    let activeContractsCount = 0;
    let settledContractsCount = 0;

    for (const c of this.contracts.values()) {
      if (c.status === 'active') {
        activeContractsCount += 1;
        totalOpenHedgedUsd += c.notionalAmountUsd;
        totalLockedValueBdt += c.lockedValueBdt;
        totalMarginLienCollateralBdt += c.marginLienAmountBdt;

        const spotEquivalent = c.notionalAmountUsd * currentSpotRate;
        totalUnrealizedMtmGainLossBdt += c.lockedValueBdt - spotEquivalent;
      } else if (c.status === 'settled') {
        settledContractsCount += 1;
        totalRealizedGainLossBdt += c.realizedGainLossBdt || 0;
      }
    }

    const weightedAverageForwardRate =
      totalOpenHedgedUsd > 0 ? Number((totalLockedValueBdt / totalOpenHedgedUsd).toFixed(4)) : this.baseSpotRate;

    return {
      totalOpenHedgedUsd,
      totalLockedValueBdt: Number(totalLockedValueBdt.toFixed(2)),
      weightedAverageForwardRate,
      totalUnrealizedMtmGainLossBdt: Number(totalUnrealizedMtmGainLossBdt.toFixed(2)),
      totalRealizedGainLossBdt: Number(totalRealizedGainLossBdt.toFixed(2)),
      totalMarginLienCollateralBdt: Number(totalMarginLienCollateralBdt.toFixed(2)),
      activeContractsCount,
      settledContractsCount,
    };
  }

  public listContracts(filter?: { status?: ForwardContractStatus }): ForwardContractRecord[] {
    const list = Array.from(this.contracts.values());
    if (!filter?.status) return list;
    return list.filter((c) => c.status === filter.status);
  }

  public getContractByNumber(contractNumber: string): ForwardContractRecord | undefined {
    return this.contracts.get(contractNumber);
  }

  public resetStore(): void {
    this.contracts.clear();
  }

  private seedDefaultContracts(): void {
    this.bookForwardContract({
      contractNumber: 'FWD-0420-2026-0041',
      adBankName: 'BRAC Bank PLC',
      exporterName: 'Shothik Export & Heritage Crafts Ltd.',
      underlyingExpNumber: 'EXP-0420-2026-00891',
      underlyingLcNumber: 'LC-NORDIC-2026-091',
      notionalAmountUsd: 15000,
      spotRateAtBooking: 121.5,
      lockedForwardRate: 123.38,
      tenorDays: 90,
      marginLienPercent: 5,
      status: 'active',
    });

    this.bookForwardContract({
      contractNumber: 'FWD-0115-2026-0019',
      adBankName: 'Eastern Bank PLC',
      exporterName: 'Shothik Apparels & Knitwear Hub',
      underlyingExpNumber: 'EXP-0115-2026-00452',
      underlyingLcNumber: 'CAD-DE-2026-118',
      notionalAmountUsd: 28400,
      spotRateAtBooking: 120.8,
      lockedForwardRate: 122.65,
      tenorDays: 60,
      marginLienPercent: 5,
      status: 'settled',
    });
  }
}

export const fxHedgingEngine = new FxHedgingEngine();
