import { createHash } from "node:crypto";

/**
 * Shothik Autonomous Freelancer Remittance & Bangladesh Bank ICT Incentive Engine (Slice 36)
 * Calculates 4%-10% statutory export cash subsidies, generates Bangladesh Bank Form-C
 * foreign exchange declarations, reconciles Proceeds Realization Certificates (PRC),
 * and compiles international service escrow contracts.
 */

export type InwardChannel = "wise" | "payoneer" | "swift_wire" | "upwork" | "fiverr" | "direct_ach";
export type ForeignCurrency = "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "SGD";
export type ExporterCategory = "ict_freelancer_individual" | "basis_registered_it_firm" | "general_digital_service";

export interface ExchangeRateQuote {
  currency: ForeignCurrency;
  buyRateBdt: number;
  marketRateBdt: number;
  lastUpdated: string;
}

export const OFFICIAL_FX_RATES: Record<ForeignCurrency, number> = {
  USD: 122.50,
  EUR: 132.80,
  GBP: 158.40,
  AUD: 79.20,
  CAD: 89.50,
  SGD: 94.10,
};

export const INCENTIVE_PERCENTAGES: Record<ExporterCategory, number> = {
  ict_freelancer_individual: 4.0, // 4% individual freelancer incentive
  basis_registered_it_firm: 10.0, // 10% registered IT/ITES company subsidy
  general_digital_service: 4.0,
};

export interface RemittanceRecord {
  remittanceId: string;
  transactionRef: string; // e.g. FT2629104882
  channel: InwardChannel;
  channelName: string;
  sourceCountry: string;
  remitterName: string;
  remitterCompany?: string;
  beneficiaryName: string;
  beneficiaryAccountNo: string;
  beneficiaryBank: string;
  foreignCurrency: ForeignCurrency;
  foreignAmount: number;
  exchangeRateBdt: number;
  grossAmountBdt: number;
  exporterCategory: ExporterCategory;
  incentivePercent: number;
  incentiveAmountBdt: number;
  bankHandlingFeeBdt: number;
  sourceTaxBdt: number; // 0 BDT under Bangladesh ICT export tax holiday Section 52Q
  netDisbursedBdt: number;
  formCNumber: string;
  prcStatus: "pending" | "issued" | "reconciled";
  receivedAt: string;
  purposeCode: string; // e.g. "9801 - Computer Software & IT Enabled Services"
  auditHash: string;
}

export interface FormCDeclaration {
  declarationId: string;
  formCNumber: string;
  dateOfDeclaration: string;
  adBankName: string;
  adBranchName: string;
  adRoutingNumber: string;
  beneficiary: {
    name: string;
    accountNo: string;
    nidOrPassport: string;
    tinNumber: string;
    freelancerIdOrBasisNo?: string;
  };
  remittance: {
    currency: ForeignCurrency;
    foreignAmount: number;
    exchangeRate: number;
    equivalentBdt: number;
    sendingCountry: string;
    remitterName: string;
  };
  purposeOfInward: {
    bopCategory: string;
    hsCode: string;
    descriptionOfWork: string;
  };
  statutoryIncentiveClaimed: {
    category: ExporterCategory;
    percentage: number;
    claimedAmountBdt: number;
  };
  declarationStatement: string;
  verificationSeal: {
    signature: string;
    timestamp: string;
    bbCircularRef: string;
  };
}

export interface EscrowContract {
  contractId: string;
  contractTitle: string;
  clientName: string;
  clientCountry: string;
  freelancerName: string;
  freelancerAddress: string;
  scopeOfWork: string[];
  totalValueCurrency: ForeignCurrency;
  totalValueAmount: number;
  milestones: Array<{
    milestoneId: string;
    title: string;
    amount: number;
    deliverableHash: string;
    status: "pending" | "in_progress" | "approved" | "released";
  }>;
  jurisdiction: string;
  createdDate: string;
  contractHash: string;
}

export class FreelancerIncentiveEngine {
  private static remittances: Map<string, RemittanceRecord> = new Map();
  private static formCDeclarations: Map<string, FormCDeclaration> = new Map();
  private static contracts: Map<string, EscrowContract> = new Map();

  static {
    // Seed initial demo remittance records
    const sample1: RemittanceRecord = {
      remittanceId: "REM_UPW_882910",
      transactionRef: "FT2629104882",
      channel: "upwork",
      channelName: "Upwork Global Escrow Inc.",
      sourceCountry: "United States",
      remitterName: "Apex Software Labs LLC",
      beneficiaryName: "Tanvir Ahmed",
      beneficiaryAccountNo: "1501204899201001",
      beneficiaryBank: "BRAC Bank PLC (Gulshan Branch)",
      foreignCurrency: "USD",
      foreignAmount: 2500,
      exchangeRateBdt: 122.50,
      grossAmountBdt: 306250,
      exporterCategory: "ict_freelancer_individual",
      incentivePercent: 4.0,
      incentiveAmountBdt: 12250,
      bankHandlingFeeBdt: 250,
      sourceTaxBdt: 0,
      netDisbursedBdt: 318250, // 306,250 + 12,250 - 250
      formCNumber: "FC-BB-2026-99014",
      prcStatus: "reconciled",
      receivedAt: new Date(Date.now() - 86400000).toISOString(),
      purposeCode: "9801 - Software Development & UI/UX Design",
      auditHash: "a1b2c3d4e5f67890abcdef1234567890abcdef12",
    };

    const sample2: RemittanceRecord = {
      remittanceId: "REM_PAY_882911",
      transactionRef: "PAY88291042",
      channel: "payoneer",
      channelName: "Payoneer Europe Limited",
      sourceCountry: "Germany",
      remitterName: "Berlin Fintech Solutions GmbH",
      beneficiaryName: "Shothik Cloud Systems",
      beneficiaryAccountNo: "2050119283746001",
      beneficiaryBank: "Eastern Bank PLC (Principal Branch)",
      foreignCurrency: "EUR",
      foreignAmount: 4800,
      exchangeRateBdt: 132.80,
      grossAmountBdt: 637440,
      exporterCategory: "basis_registered_it_firm",
      incentivePercent: 10.0,
      incentiveAmountBdt: 63744,
      bankHandlingFeeBdt: 500,
      sourceTaxBdt: 0,
      netDisbursedBdt: 700684,
      formCNumber: "FC-BB-2026-99015",
      prcStatus: "issued",
      receivedAt: new Date(Date.now() - 172800000).toISOString(),
      purposeCode: "9801 - Cloud Infrastructure & AI Pipeline Export",
      auditHash: "f6e5d4c3b2a10987fedcba0987654321fedcba09",
    };

    this.remittances.set(sample1.remittanceId, sample1);
    this.remittances.set(sample2.remittanceId, sample2);
  }

  /**
   * Calculate Cash Incentive and Net Disbursed BDT for incoming foreign remittance
   */
  static calculateIncentive(params: {
    foreignCurrency: ForeignCurrency;
    foreignAmount: number;
    exporterCategory: ExporterCategory;
    customExchangeRate?: number;
    channel?: InwardChannel;
  }): {
    foreignCurrency: ForeignCurrency;
    foreignAmount: number;
    exchangeRateBdt: number;
    grossAmountBdt: number;
    exporterCategory: ExporterCategory;
    incentivePercent: number;
    incentiveAmountBdt: number;
    bankHandlingFeeBdt: number;
    sourceTaxBdt: number;
    netDisbursedBdt: number;
    statutoryNotes: string;
  } {
    const rate = params.customExchangeRate || OFFICIAL_FX_RATES[params.foreignCurrency] || 122.50;
    const grossBdt = Math.round(params.foreignAmount * rate * 100) / 100;
    const incentivePercent = INCENTIVE_PERCENTAGES[params.exporterCategory] || 4.0;
    const incentiveBdt = Math.round(grossBdt * (incentivePercent / 100) * 100) / 100;
    const bankFee = 250; // Nominal standard clearing fee
    const sourceTax = 0; // 0% tax holiday under Income Tax Act for ITES / Freelancers

    const netBdt = Math.round((grossBdt + incentiveBdt - bankFee) * 100) / 100;

    const statutoryNotes =
      params.exporterCategory === "basis_registered_it_firm"
        ? "Eligible for 10% Cash Subsidy under Bangladesh Bank FE Circular No. 02/2024. Basis membership & Form C required."
        : "Eligible for 4% ICT Freelancer Cash Subsidy under Bangladesh Bank Foreign Exchange Guidelines. Form C auto-certified.";

    return {
      foreignCurrency: params.foreignCurrency,
      foreignAmount: params.foreignAmount,
      exchangeRateBdt: rate,
      grossAmountBdt: grossBdt,
      exporterCategory: params.exporterCategory,
      incentivePercent,
      incentiveAmountBdt: incentiveBdt,
      bankHandlingFeeBdt: bankFee,
      sourceTaxBdt: sourceTax,
      netDisbursedBdt: netBdt,
      statutoryNotes,
    };
  }

  /**
   * Record a new Inward Remittance Transaction
   */
  static recordRemittance(params: {
    transactionRef: string;
    channel: InwardChannel;
    sourceCountry: string;
    remitterName: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryBank: string;
    foreignCurrency: ForeignCurrency;
    foreignAmount: number;
    exporterCategory?: ExporterCategory;
    customExchangeRate?: number;
    purposeCode?: string;
  }): RemittanceRecord {
    const category = params.exporterCategory || "ict_freelancer_individual";
    const calc = this.calculateIncentive({
      foreignCurrency: params.foreignCurrency,
      foreignAmount: params.foreignAmount,
      exporterCategory: category,
      customExchangeRate: params.customExchangeRate,
      channel: params.channel,
    });

    const remittanceId = `REM_${params.channel.toUpperCase().substring(0, 3)}_${Date.now().toString(36).toUpperCase()}`;
    const formCNumber = `FC-BB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const channelNames: Record<InwardChannel, string> = {
      wise: "Wise Inc. (Direct Payout)",
      payoneer: "Payoneer Global Merchant Escrow",
      swift_wire: "International SWIFT MT103 Wire",
      upwork: "Upwork Global Direct to Local Bank",
      fiverr: "Fiverr International Revenue Card",
      direct_ach: "Direct US/EU ACH Clearing",
    };

    const auditHash = createHash("sha256")
      .update(`${remittanceId}:${params.transactionRef}:${calc.grossAmountBdt}:${calc.incentiveAmountBdt}`)
      .digest("hex");

    const record: RemittanceRecord = {
      remittanceId,
      transactionRef: params.transactionRef,
      channel: params.channel,
      channelName: channelNames[params.channel] || params.channel,
      sourceCountry: params.sourceCountry,
      remitterName: params.remitterName,
      beneficiaryName: params.beneficiaryName,
      beneficiaryAccountNo: params.beneficiaryAccountNo,
      beneficiaryBank: params.beneficiaryBank,
      foreignCurrency: params.foreignCurrency,
      foreignAmount: params.foreignAmount,
      exchangeRateBdt: calc.exchangeRateBdt,
      grossAmountBdt: calc.grossAmountBdt,
      exporterCategory: category,
      incentivePercent: calc.incentivePercent,
      incentiveAmountBdt: calc.incentiveAmountBdt,
      bankHandlingFeeBdt: calc.bankHandlingFeeBdt,
      sourceTaxBdt: calc.sourceTaxBdt,
      netDisbursedBdt: calc.netDisbursedBdt,
      formCNumber,
      prcStatus: "issued",
      receivedAt: new Date().toISOString(),
      purposeCode: params.purposeCode || "9801 - Software Development & IT Services Export",
      auditHash,
    };

    this.remittances.set(record.remittanceId, record);
    return record;
  }

  /**
   * List all inward remittances
   */
  static listRemittances(): RemittanceRecord[] {
    return Array.from(this.remittances.values()).sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }

  /**
   * Generate Bangladesh Bank Form-C Declaration
   */
  static generateFormC(params: {
    remittanceId?: string;
    beneficiaryName: string;
    beneficiaryAccountNo: string;
    beneficiaryNidOrPassport: string;
    tinNumber: string;
    freelancerIdOrBasisNo?: string;
    adBankName: string;
    adBranchName: string;
    adRoutingNumber: string;
    foreignCurrency: ForeignCurrency;
    foreignAmount: number;
    sendingCountry: string;
    remitterName: string;
    descriptionOfWork: string;
    exporterCategory?: ExporterCategory;
  }): FormCDeclaration {
    const category = params.exporterCategory || "ict_freelancer_individual";
    const calc = this.calculateIncentive({
      foreignCurrency: params.foreignCurrency,
      foreignAmount: params.foreignAmount,
      exporterCategory: category,
    });

    const declarationId = `DECL_FC_${Date.now().toString(36).toUpperCase()}`;
    const formCNumber = `FC-BB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const declarationStatement =
      `I hereby declare that the inward remittance of ${params.foreignCurrency} ${params.foreignAmount.toLocaleString()} ` +
      `(Equivalent BDT ৳${calc.grossAmountBdt.toLocaleString()}) received from ${params.remitterName} (${params.sendingCountry}) ` +
      `represents bona fide digital service/software export earnings under BOP Category 9801 (Computer & Information Services). ` +
      `I claim the statutory ${calc.incentivePercent}% Bangladesh Bank Cash Subsidy (BDT ৳${calc.incentiveAmountBdt.toLocaleString()}) ` +
      `pursuant to Foreign Exchange Regulation Act 1947 & BB FE Circulars.`;

    const rawSignature = `${declarationId}:${formCNumber}:${params.beneficiaryNidOrPassport}:${calc.grossAmountBdt}`;
    const signature = createHash("sha256").update(rawSignature).digest("hex");

    const declaration: FormCDeclaration = {
      declarationId,
      formCNumber,
      dateOfDeclaration: new Date().toISOString().split("T")[0],
      adBankName: params.adBankName,
      adBranchName: params.adBranchName,
      adRoutingNumber: params.adRoutingNumber,
      beneficiary: {
        name: params.beneficiaryName,
        accountNo: params.beneficiaryAccountNo,
        nidOrPassport: params.beneficiaryNidOrPassport,
        tinNumber: params.tinNumber,
        freelancerIdOrBasisNo: params.freelancerIdOrBasisNo || "N/A (Individual Freelancer)",
      },
      remittance: {
        currency: params.foreignCurrency,
        foreignAmount: params.foreignAmount,
        exchangeRate: calc.exchangeRateBdt,
        equivalentBdt: calc.grossAmountBdt,
        sendingCountry: params.sendingCountry,
        remitterName: params.remitterName,
      },
      purposeOfInward: {
        bopCategory: "9801 - Computer & Information Services Export",
        hsCode: "9801.00.00",
        descriptionOfWork: params.descriptionOfWork,
      },
      statutoryIncentiveClaimed: {
        category,
        percentage: calc.incentivePercent,
        claimedAmountBdt: calc.incentiveAmountBdt,
      },
      declarationStatement,
      verificationSeal: {
        signature,
        timestamp: new Date().toISOString(),
        bbCircularRef: "BB-FE-CIR-02/2024-ICT-SUBSIDY",
      },
    };

    this.formCDeclarations.set(declaration.declarationId, declaration);
    return declaration;
  }

  /**
   * Generate International Milestone Escrow Contract
   */
  static generateEscrowContract(params: {
    contractTitle: string;
    clientName: string;
    clientCountry: string;
    freelancerName: string;
    freelancerAddress: string;
    scopeOfWork: string[];
    totalValueCurrency: ForeignCurrency;
    milestones: Array<{ title: string; amount: number }>;
  }): EscrowContract {
    const contractId = `CTR_ESCROW_${Date.now().toString(36).toUpperCase()}`;
    const totalAmount = params.milestones.reduce((acc, m) => acc + m.amount, 0);

    const compiledMilestones = params.milestones.map((m, idx) => {
      const milestoneId = `MS_${idx + 1}`;
      const deliverableHash = createHash("sha256")
        .update(`${contractId}:${milestoneId}:${m.title}:${m.amount}`)
        .digest("hex")
        .substring(0, 16);
      return {
        milestoneId,
        title: m.title,
        amount: m.amount,
        deliverableHash,
        status: idx === 0 ? ("in_progress" as const) : ("pending" as const),
      };
    });

    const contractHash = createHash("sha256")
      .update(`${contractId}:${params.clientName}:${params.freelancerName}:${totalAmount}`)
      .digest("hex");

    const contract: EscrowContract = {
      contractId,
      contractTitle: params.contractTitle,
      clientName: params.clientName,
      clientCountry: params.clientCountry,
      freelancerName: params.freelancerName,
      freelancerAddress: params.freelancerAddress,
      scopeOfWork: params.scopeOfWork,
      totalValueCurrency: params.totalValueCurrency,
      totalValueAmount: totalAmount,
      milestones: compiledMilestones,
      jurisdiction: "International Commercial Arbitration / Bangladesh ICT Act 2006",
      createdDate: new Date().toISOString().split("T")[0],
      contractHash,
    };

    this.contracts.set(contract.contractId, contract);
    return contract;
  }

  /**
   * Reconcile Remittance PRC / FFC Certificate
   */
  static reconcilePrc(remittanceId: string): { success: boolean; remittance?: RemittanceRecord; message: string } {
    const record = this.remittances.get(remittanceId);
    if (!record) {
      return { success: false, message: `Remittance ID ${remittanceId} not found` };
    }
    record.prcStatus = "reconciled";
    return {
      success: true,
      remittance: record,
      message: `Proceeds Realization Certificate (PRC) for ${record.transactionRef} successfully reconciled with Bank Credit.`,
    };
  }
}
