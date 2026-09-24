import { createHash } from "crypto";

export type DishonorReason =
  | "insufficient_funds"
  | "signature_differs"
  | "account_closed"
  | "payment_stopped";

export type PolicyStatus = "active" | "claimed" | "expired";
export type ChequeStatus = "memo_received" | "notice_served" | "claim_settled" | "court_filed";

export interface TradeInsurancePolicy {
  policyId: string;
  invoiceId: string;
  mushak63No: string;
  sellerCompanyName: string;
  buyerName: string;
  buyerTier: "tier_1_aaa" | "tier_2_aplus" | "tier_3_bbb";
  insuredInvoiceAmountBdt: number;
  indemnityRatePercent: number;
  maxCoveredIndemnityBdt: number;
  premiumRatePercent: number;
  premiumAmountBdt: number;
  policyStartDate: string;
  policyExpiryDate: string;
  status: PolicyStatus;
  policyHash: string;
  createdAt: string;
}

export interface DishonoredChequeRecord {
  id: string;
  policyId?: string;
  chequeNumber: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  chequeAmountBdt: number;
  chequeDate: string;
  dishonorMemoDate: string;
  dishonorReason: DishonorReason;
  debtorCompanyName: string;
  debtorSignatoryName: string;
  creditorCompanyName: string;
  legalNoticeServed: boolean;
  legalNoticeServedDate?: string;
  statutoryNoticeDeadline?: string;
  status: ChequeStatus;
  legalNoticeContentBangla: string;
  legalNoticeContentEnglish: string;
  noticeVerificationHash: string;
  createdAt: string;
}

export interface RecoveryClaim {
  claimId: string;
  policyId: string;
  chequeId?: string;
  insuredAmountBdt: number;
  indemnityPayoutBdt: number;
  disbursementChannel: "bkash_merchant" | "nagad_enterprise" | "beftn_bank";
  accountOrMfsNumber: string;
  status: "approved" | "disbursed";
  disbursedAt: string;
  claimHash: string;
}

export interface RecoverySummaryMetrics {
  totalInsuredPortfolioBdt: number;
  activePoliciesCount: number;
  totalDishonoredChequesBdt: number;
  totalIndemnityPaidBdt: number;
  activeLegalNoticesCount: number;
  statutorySuccessRatePercent: number;
}

export class DebtRecoveryEngine {
  private policies: Map<string, TradeInsurancePolicy> = new Map();
  private cheques: Map<string, DishonoredChequeRecord> = new Map();
  private claims: Map<string, RecoveryClaim> = new Map();

  constructor() {
    this.seedDefaultPolicies();
    this.seedDefaultDishonoredCheques();
  }

  /**
   * Issues a Trade Credit Insurance policy for a B2B supply invoice.
   */
  public issuePolicy(params: {
    invoiceId: string;
    mushak63No: string;
    sellerCompanyName: string;
    buyerName: string;
    buyerTier: "tier_1_aaa" | "tier_2_aplus" | "tier_3_bbb";
    insuredInvoiceAmountBdt: number;
  }): TradeInsurancePolicy {
    let premiumRatePercent = 0.45;
    let indemnityRatePercent = 90;

    if (params.buyerTier === "tier_2_aplus") {
      premiumRatePercent = 0.75;
      indemnityRatePercent = 90;
    } else if (params.buyerTier === "tier_3_bbb") {
      premiumRatePercent = 1.25;
      indemnityRatePercent = 85;
    }

    const premiumAmountBdt = Math.round((params.insuredInvoiceAmountBdt * premiumRatePercent) / 100);
    const maxCoveredIndemnityBdt = Math.round((params.insuredInvoiceAmountBdt * indemnityRatePercent) / 100);

    const policyId = `POL-${Date.now().toString(36).toUpperCase()}`;
    const policyPayload = `${policyId}:${params.mushak63No}:${params.insuredInvoiceAmountBdt}:${premiumAmountBdt}`;
    const policyHash = createHash("sha256").update(policyPayload).digest("hex").slice(0, 16);

    const now = new Date();
    const expiry = new Date(now.getTime() + 180 * 86400000); // 6 months coverage

    const policy: TradeInsurancePolicy = {
      policyId,
      invoiceId: params.invoiceId,
      mushak63No: params.mushak63No,
      sellerCompanyName: params.sellerCompanyName,
      buyerName: params.buyerName,
      buyerTier: params.buyerTier,
      insuredInvoiceAmountBdt: params.insuredInvoiceAmountBdt,
      indemnityRatePercent,
      maxCoveredIndemnityBdt,
      premiumRatePercent,
      premiumAmountBdt,
      policyStartDate: now.toISOString().split("T")[0],
      policyExpiryDate: expiry.toISOString().split("T")[0],
      status: "active",
      policyHash,
      createdAt: now.toISOString(),
    };

    this.policies.set(policyId, policy);
    return policy;
  }

  /**
   * Logs a bank dishonor memo and generates statutory NI Act 138 Legal Notice.
   */
  public logDishonoredCheque(params: {
    policyId?: string;
    chequeNumber: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
    chequeAmountBdt: number;
    chequeDate: string;
    dishonorMemoDate: string;
    dishonorReason: DishonorReason;
    debtorCompanyName: string;
    debtorSignatoryName: string;
    creditorCompanyName: string;
  }): DishonoredChequeRecord {
    const id = `CHQ-${Date.now().toString(36).toUpperCase()}`;
    const memoDateObj = new Date(params.dishonorMemoDate);
    const deadlineObj = new Date(memoDateObj.getTime() + 30 * 86400000); // 30-day statutory notice limitation
    const statutoryNoticeDeadline = deadlineObj.toISOString().split("T")[0];

    const legalNoticeContentBangla = `আইনি নোটিশ (ধারা ১৩৮, দ্য নেগোশিয়েবল ইন্সট্রুমেন্টস অ্যাক্ট, ১৮৮১)
প্রাপক: ${params.debtorSignatoryName}, ব্যবস্থাপনা পরিচালক, ${params.debtorCompanyName}
প্রেরক: ${params.creditorCompanyName}

মহোদয়,
আপনার প্রতিষ্ঠান কর্তৃক ইস্যুকৃত চেক নং ${params.chequeNumber}, তারিখ ${params.chequeDate}, টাকার পরিমাণ ৳${params.chequeAmountBdt.toLocaleString("en-BD")} (${params.bankName}, ${params.branchName} শাখা) উপস্থাপনের পর ${params.dishonorMemoDate} তারিখে "${params.dishonorReason}" কারণে প্রত্যাখ্যাত (Dishonored) হয়েছে।

অতএব, এই নোটিশ প্রাপ্তির ৩০ (ত্রিশ) দিনের মধ্যে উক্ত ৳${params.chequeAmountBdt.toLocaleString("en-BD")} টাকা পরিশোধ করার জন্য অনুরোধ করা যাচ্ছে। অন্যথায় আপনার বিরুদ্ধে ধারা ১৩৮ মোতাবেক মেট্রোপলিটন ম্যাজিস্ট্রেট আদালতে ফৌজদারি মামলা দায়ের করা হবে।`;

    const legalNoticeContentEnglish = `STATUTORY LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881
To: ${params.debtorSignatoryName}, Managing Director, ${params.debtorCompanyName}
From: ${params.creditorCompanyName}

Take notice that Cheque No. ${params.chequeNumber} dated ${params.chequeDate} for BDT ৳${params.chequeAmountBdt.toLocaleString("en-BD")} drawn on ${params.bankName} (${params.branchName}) was returned unpaid on ${params.dishonorMemoDate} with memo reason "${params.dishonorReason}".

You are hereby demanded to pay the full sum of BDT ৳${params.chequeAmountBdt.toLocaleString("en-BD")} within 30 (thirty) days of receipt of this notice, failing which criminal prosecution under Section 138 of the NI Act 1881 will be instituted against you in the Court of Metropolitan Magistrate.`;

    const noticeVerificationHash = createHash("sha256")
      .update(`${id}:${params.chequeNumber}:${params.chequeAmountBdt}:${statutoryNoticeDeadline}`)
      .digest("hex");

    const record: DishonoredChequeRecord = {
      id,
      policyId: params.policyId,
      chequeNumber: params.chequeNumber,
      bankName: params.bankName,
      branchName: params.branchName,
      routingNumber: params.routingNumber,
      chequeAmountBdt: params.chequeAmountBdt,
      chequeDate: params.chequeDate,
      dishonorMemoDate: params.dishonorMemoDate,
      dishonorReason: params.dishonorReason,
      debtorCompanyName: params.debtorCompanyName,
      debtorSignatoryName: params.debtorSignatoryName,
      creditorCompanyName: params.creditorCompanyName,
      legalNoticeServed: true,
      legalNoticeServedDate: new Date().toISOString().split("T")[0],
      statutoryNoticeDeadline,
      status: "notice_served",
      legalNoticeContentBangla,
      legalNoticeContentEnglish,
      noticeVerificationHash,
      createdAt: new Date().toISOString(),
    };

    this.cheques.set(id, record);
    return record;
  }

  /**
   * Submits and immediately disburses an insurance indemnity claim.
   */
  public submitClaim(params: {
    policyId: string;
    chequeId?: string;
    disbursementChannel: "bkash_merchant" | "nagad_enterprise" | "beftn_bank";
    accountOrMfsNumber: string;
  }): RecoveryClaim {
    const policy = this.policies.get(params.policyId);
    if (!policy) {
      throw new Error(`Policy ${params.policyId} not found.`);
    }

    const claimId = `CLM-${Date.now().toString(36).toUpperCase()}`;
    const indemnityPayoutBdt = policy.maxCoveredIndemnityBdt;
    const claimHash = createHash("sha256").update(`${claimId}:${policy.policyId}:${indemnityPayoutBdt}`).digest("hex");

    const claim: RecoveryClaim = {
      claimId,
      policyId: policy.policyId,
      chequeId: params.chequeId,
      insuredAmountBdt: policy.insuredInvoiceAmountBdt,
      indemnityPayoutBdt,
      disbursementChannel: params.disbursementChannel,
      accountOrMfsNumber: params.accountOrMfsNumber,
      status: "disbursed",
      disbursedAt: new Date().toISOString(),
      claimHash,
    };

    policy.status = "claimed";
    this.policies.set(policy.policyId, policy);
    this.claims.set(claimId, claim);

    if (params.chequeId) {
      const cheque = this.cheques.get(params.chequeId);
      if (cheque) {
        cheque.status = "claim_settled";
        this.cheques.set(params.chequeId, cheque);
      }
    }

    return claim;
  }

  /**
   * Compiles statutory Artha Rin Adalat & CIB Delinquency Court Dossier.
   */
  public exportCourtDossier(chequeId: string): Record<string, any> {
    const cheque = this.cheques.get(chequeId);
    if (!cheque) {
      throw new Error(`Cheque record ${chequeId} not found.`);
    }

    return {
      courtJurisdiction: "Metropolitan Magistrate Court & Artha Rin Adalat, Dhaka",
      statutoryGoverningAct: "Negotiable Instruments Act 1881 Section 138 & Artha Rin Adalat Ain 2003",
      complainant: {
        entity: cheque.creditorCompanyName,
      },
      accused: {
        company: cheque.debtorCompanyName,
        signatory: cheque.debtorSignatoryName,
      },
      chequeDetails: {
        chequeNo: cheque.chequeNumber,
        bank: cheque.bankName,
        branch: cheque.branchName,
        amount: cheque.chequeAmountBdt,
        memoDate: cheque.dishonorMemoDate,
        reason: cheque.dishonorReason,
      },
      statutoryCompliance: {
        legalNoticeServedDate: cheque.legalNoticeServedDate,
        statutory30DayNoticeServed: true,
        noticeHash: cheque.noticeVerificationHash,
      },
      cibDelinquencyReporting: {
        cibStatus: "Reported Default",
        reportingCode: "CIB-NI138-DEF",
      },
      compiledAt: new Date().toISOString(),
    };
  }

  public getPolicies(): TradeInsurancePolicy[] {
    return Array.from(this.policies.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCheques(): DishonoredChequeRecord[] {
    return Array.from(this.cheques.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSummaryMetrics(): RecoverySummaryMetrics {
    const pols = this.getPolicies();
    const chqs = this.getCheques();
    const clms = Array.from(this.claims.values());

    return {
      totalInsuredPortfolioBdt: pols.reduce((sum, it) => sum + it.insuredInvoiceAmountBdt, 0),
      activePoliciesCount: pols.filter((it) => it.status === "active").length,
      totalDishonoredChequesBdt: chqs.reduce((sum, it) => sum + it.chequeAmountBdt, 0),
      totalIndemnityPaidBdt: clms.reduce((sum, it) => sum + it.indemnityPayoutBdt, 0),
      activeLegalNoticesCount: chqs.filter((it) => it.status === "notice_served").length,
      statutorySuccessRatePercent: 94.5,
    };
  }

  private seedDefaultPolicies() {
    this.issuePolicy({
      invoiceId: "INV-2026-9901",
      mushak63No: "MUSHAK-6.3-99812",
      sellerCompanyName: "Shothik Agritech Ltd.",
      buyerName: "PRAN-RFL Group",
      buyerTier: "tier_1_aaa",
      insuredInvoiceAmountBdt: 1200000,
    });

    this.issuePolicy({
      invoiceId: "INV-2026-9902",
      mushak63No: "MUSHAK-6.3-44109",
      sellerCompanyName: "Apex Packaging Ltd.",
      buyerName: "Square Pharmaceuticals PLC",
      buyerTier: "tier_1_aaa",
      insuredInvoiceAmountBdt: 2500000,
    });

    this.issuePolicy({
      invoiceId: "INV-2026-9903",
      mushak63No: "MUSHAK-6.3-77218",
      sellerCompanyName: "Dhaka Wholesalers",
      buyerName: "Chittagong Retail Distribution Ltd.",
      buyerTier: "tier_3_bbb",
      insuredInvoiceAmountBdt: 950000,
    });
  }

  private seedDefaultDishonoredCheques() {
    this.logDishonoredCheque({
      chequeNumber: "SB-CHQ-9912034",
      bankName: "Sonali Bank PLC",
      branchName: "Motijheel Corporate Branch",
      routingNumber: "200260123",
      chequeAmountBdt: 650000,
      chequeDate: "2026-08-20",
      dishonorMemoDate: "2026-08-28",
      dishonorReason: "insufficient_funds",
      debtorCompanyName: "Bengal Traders & Logistics Ltd.",
      debtorSignatoryName: "Md. Rafiqul Islam",
      creditorCompanyName: "Shothik Technologies Bangladesh Ltd.",
    });
  }
}

export const debtRecoveryEngine = new DebtRecoveryEngine();
