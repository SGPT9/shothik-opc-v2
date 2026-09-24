import crypto from "crypto";

export type ContractType = 
  | "vendor_supply" 
  | "property_lease" 
  | "nda" 
  | "founder_vesting" 
  | "freelancer";

export interface SignerParty {
  name: string;
  designation?: string;
  companyName?: string;
  nidOrTin: string;
  phone: string;
  email?: string;
  address: string;
  signedAt?: string;
  signatureOtp?: string;
  ipAddress?: string;
}

export interface StampDutyDetails {
  stampValueBdt: number;
  statutoryArticle: string;
  stampCategory: "Non-Judicial Stamp";
  complianceNote: string;
  isCompliant: boolean;
}

export interface ContractRecord {
  id: string;
  contractNumber: string;
  type: ContractType;
  titleEn: string;
  titleBn: string;
  firstParty: SignerParty;
  secondParty: SignerParty;
  contractValueBdt: number;
  durationMonths: number;
  effectiveDate: string;
  expiryDate: string;
  governingLaw: string;
  disputeResolution: string;
  stampDuty: StampDutyDetails;
  clausesEn: string[];
  clausesBn: string[];
  status: "draft" | "partially_signed" | "executed" | "expired";
  digitalSealHash?: string;
  ictActCompliant: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryMetrics {
  totalContracts: number;
  executedContracts: number;
  pendingSignature: number;
  totalContractValueBdt: number;
  totalStampDutyPaidBdt: number;
  contractTypeBreakdown: Record<ContractType, number>;
}

export class LegalContractsEngine {
  private contracts: Map<string, ContractRecord> = new Map();

  constructor() {
    this.seedInitialContracts();
  }

  public calculateStampDuty(type: ContractType, contractValueBdt: number = 0): StampDutyDetails {
    switch (type) {
      case "nda":
        return {
          stampValueBdt: 300,
          statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5 - Agreement / Affidavit)",
          stampCategory: "Non-Judicial Stamp",
          complianceNote: "Mandatory non-judicial stamp duty of ৳300 for binding NDA admissibility under Section 35.",
          isCompliant: true,
        };

      case "founder_vesting":
        return {
          stampValueBdt: 300,
          statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5 & Article 23 - Share & IP Assignment)",
          stampCategory: "Non-Judicial Stamp",
          complianceNote: "৳300 Non-Judicial stamp duty required for equity covenant and IP assignment.",
          isCompliant: true,
        };

      case "freelancer":
      case "vendor_supply":
        if (contractValueBdt < 500000) {
          return {
            stampValueBdt: 500,
            statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5(c) - Service/Supply < ৳5L)",
            stampCategory: "Non-Judicial Stamp",
            complianceNote: "৳500 Non-Judicial stamp duty for commercial contracts with value under ৳5,00,000.",
            isCompliant: true,
          };
        } else {
          return {
            stampValueBdt: 1000,
            statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5(d) - Commercial Supply ≥ ৳5L)",
            stampCategory: "Non-Judicial Stamp",
            complianceNote: "৳1,000 Non-Judicial stamp duty for major commercial contracts exceeding ৳5,00,000.",
            isCompliant: true,
          };
        }

      case "property_lease": {
        const annualRent = contractValueBdt;
        const rate = annualRent > 500000 ? 0.01 : 0.005; // 0.5% to 1.0%
        const calculated = Math.max(1000, Math.round(annualRent * rate));
        return {
          stampValueBdt: calculated,
          statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 35 - Commercial Lease)",
          stampCategory: "Non-Judicial Stamp",
          complianceNote: `Lease stamp duty evaluated at ${(rate * 100).toFixed(1)}% of annual rent (min ৳1,000). Admissible under Registration Act 1908.`,
          isCompliant: true,
        };
      }

      default:
        return {
          stampValueBdt: 300,
          statutoryArticle: "The Stamp Act, 1899",
          stampCategory: "Non-Judicial Stamp",
          complianceNote: "Standard agreement stamp duty.",
          isCompliant: true,
        };
    }
  }

  public generateContract(params: {
    type: ContractType;
    firstParty: SignerParty;
    secondParty: SignerParty;
    contractValueBdt?: number;
    durationMonths?: number;
    effectiveDate?: string;
    customTermsEn?: string[];
    customTermsBn?: string[];
  }): ContractRecord {
    const id = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const contractNumber = `SHT-LAW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const contractValueBdt = params.contractValueBdt || 0;
    const durationMonths = params.durationMonths || 12;
    const effectiveDate = params.effectiveDate || new Date().toISOString().split("T")[0];

    const effDateObj = new Date(effectiveDate);
    const expDateObj = new Date(effDateObj);
    expDateObj.setMonth(expDateObj.getMonth() + durationMonths);
    const expiryDate = expDateObj.toISOString().split("T")[0];

    const stampDuty = this.calculateStampDuty(params.type, contractValueBdt);

    const { titleEn, titleBn, defaultClausesEn, defaultClausesBn } = this.getTemplateContent(
      params.type,
      params.firstParty,
      params.secondParty,
      contractValueBdt,
      durationMonths
    );

    const clausesEn = [...defaultClausesEn, ...(params.customTermsEn || [])];
    const clausesBn = [...defaultClausesBn, ...(params.customTermsBn || [])];

    const contract: ContractRecord = {
      id,
      contractNumber,
      type: params.type,
      titleEn,
      titleBn,
      firstParty: params.firstParty,
      secondParty: params.secondParty,
      contractValueBdt,
      durationMonths,
      effectiveDate,
      expiryDate,
      governingLaw: "Laws of the People's Republic of Bangladesh (Contract Act 1872 & ICT Act 2006)",
      disputeResolution: "Arbitration Act 2001 (Dhaka Jurisdiction)",
      stampDuty,
      clausesEn,
      clausesBn,
      status: "draft",
      ictActCompliant: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contracts.set(id, contract);
    return contract;
  }

  public signContract(params: {
    contractId: string;
    party: "firstParty" | "secondParty";
    signerName: string;
    nidOrTin: string;
    otpCode: string;
    ipAddress?: string;
  }): ContractRecord {
    const contract = this.contracts.get(params.contractId);
    if (!contract) {
      throw new Error(`Contract with ID ${params.contractId} not found`);
    }

    const now = new Date().toISOString();
    if (params.party === "firstParty") {
      contract.firstParty.signedAt = now;
      contract.firstParty.signatureOtp = params.otpCode;
      contract.firstParty.ipAddress = params.ipAddress || "127.0.0.1";
    } else {
      contract.secondParty.signedAt = now;
      contract.secondParty.signatureOtp = params.otpCode;
      contract.secondParty.ipAddress = params.ipAddress || "127.0.0.1";
    }

    // Update status
    if (contract.firstParty.signedAt && contract.secondParty.signedAt) {
      contract.status = "executed";
      // Generate SHA-256 seal
      const sealPayload = `${contract.id}|${contract.contractNumber}|${contract.firstParty.signedAt}|${contract.secondParty.signedAt}|${contract.stampDuty.stampValueBdt}|${contract.contractValueBdt}`;
      contract.digitalSealHash = crypto.createHash("sha256").update(sealPayload).digest("hex");
    } else {
      contract.status = "partially_signed";
    }

    contract.updatedAt = now;
    this.contracts.set(contract.id, contract);
    return contract;
  }

  public getContracts(): ContractRecord[] {
    return Array.from(this.contracts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getContractById(id: string): ContractRecord | undefined {
    return this.contracts.get(id);
  }

  public getSummaryMetrics(): SummaryMetrics {
    const list = Array.from(this.contracts.values());
    const totalContracts = list.length;
    const executedContracts = list.filter((c) => c.status === "executed").length;
    const pendingSignature = list.filter((c) => c.status === "draft" || c.status === "partially_signed").length;
    const totalContractValueBdt = list.reduce((sum, c) => sum + (c.contractValueBdt || 0), 0);
    const totalStampDutyPaidBdt = list
      .filter((c) => c.status === "executed")
      .reduce((sum, c) => sum + (c.stampDuty?.stampValueBdt || 0), 0);

    const contractTypeBreakdown: Record<ContractType, number> = {
      vendor_supply: 0,
      property_lease: 0,
      nda: 0,
      founder_vesting: 0,
      freelancer: 0,
    };

    list.forEach((c) => {
      if (contractTypeBreakdown[c.type] !== undefined) {
        contractTypeBreakdown[c.type]++;
      }
    });

    return {
      totalContracts,
      executedContracts,
      pendingSignature,
      totalContractValueBdt,
      totalStampDutyPaidBdt,
      contractTypeBreakdown,
    };
  }

  private getTemplateContent(
    type: ContractType,
    p1: SignerParty,
    p2: SignerParty,
    val: number,
    duration: number
  ) {
    switch (type) {
      case "vendor_supply":
        return {
          titleEn: "Commercial Vendor Supply & Goods Distribution Agreement",
          titleBn: "বাণিজ্যিক ভেন্ডর সরবরাহ ও পণ্য বিতরণ চুক্তিপত্র",
          defaultClausesEn: [
            `1. SCOPE OF SUPPLY: The First Party (${p1.name}) engages the Second Party (${p2.name}) for statutory supply of contracted merchandise under Bangladesh VAT Act 2012 (Mushak 6.3).`,
            `2. CONSIDERATION: The aggregate contract value is ৳${val.toLocaleString()} BDT, payable via BEFTN / NPSB / A/C Payee Cheque net of statutory TDS under Income Tax Act 2023.`,
            `3. QUALITY & DEFECT LIABILITY: Goods failing quality benchmarks shall be returned at Second Party expense within 7 calendar days.`,
            `4. STATUTORY COMPLIANCE: Both parties shall comply with Bangladesh Competition Act 2012 and Consumer Rights Protection Act 2009.`,
            `5. JURISDICTION: This contract is governed by the laws of Bangladesh. Any dispute shall be settled by sole arbitrator in Dhaka under the Arbitration Act, 2001.`
          ],
          defaultClausesBn: [
            `১. সরবরাহের পরিধি: ১ম পক্ষ (${p1.name}) ২য় পক্ষ (${p2.name})-কে মূসক ৬.৩ চালান সহযোগে অনুমোদিত পণ্য সরবরাহের দায়িত্ব প্রদান করিল।`,
            `২. মোট মূল্য ও পরিশোধ: মোট চুক্তি মূল্য ৳${val.toLocaleString()} টাকা, যা আয়কর আইন ২০২৩ অনুযায়ী প্রযোজ্য উৎসে কর কর্তন সাপেক্ষে ব্যাংক মারফত পরিশোধযোগ্য।`,
            `৩. মান নিয়ন্ত্রণ ও দায়বদ্ধতা: কোনো ত্রুটিপূর্ণ পণ্য পাওয়া গেলে ৭ কার্যদিবসের মধ্যে ২য় পক্ষের খরচে ফেরতযোগ্য হইবে।`,
            `৪. আইনি বাধ্যবাধকতা: উভয় পক্ষ প্রতিযোগিতা আইন ২০১২ এবং ভোক্তা অধিকার সংরক্ষণ আইন ২০০৯ মানিয়া চলিবে।`,
            `৫. বিরোধ নিষ্পত্তি: এই চুক্তিপত্র বাংলাদেশ সালিশি আইন ২০০১ মোতাবেক ঢাকা আদালতের এখতিয়ারাধীন থাকিবে।`
          ]
        };

      case "property_lease":
        return {
          titleEn: "Commercial Warehouse & Office Property Lease Deed",
          titleBn: "বাণিজ্যিক ওয়্যারহাউস ও অফিস ভাড়ার চুক্তিপত্র",
          defaultClausesEn: [
            `1. DEMISED PREMISES: The Landlord (${p1.name}) hereby leases the commercial property situated at ${p1.address} to Tenant (${p2.name}) for a term of ${duration} months.`,
            `2. RENT & ADVANCE SECURITY: The monthly rent is fixed at ৳${Math.round(val / 12).toLocaleString()} BDT. Total annual consideration is ৳${val.toLocaleString()} BDT.`,
            `3. NON-JUDICIAL STAMP ACT 1899: Non-judicial stamp duty under Article 35 has been duly affixed for registration under Registration Act 1908.`,
            `4. SUB-LETTING RESTRICTION: The Tenant shall not assign or sub-let the demised premises without prior written consent.`,
            `5. TERMINATION NOTICE: Either party may terminate this tenancy by serving 60 (sixty) days advance written notice.`
          ],
          defaultClausesBn: [
            `১. ভাড়াকৃত সম্পত্তির বিবরণ: বাড়িওয়ালা (${p1.name}) ভাড়াটিয়া (${p2.name})-কে ${duration} মাসের মেয়াদে বর্ণিত বাণিজ্যিক প্রাঙ্গণ ভাড়া প্রদান করিলেন।`,
            `২. মাসিক ভাড়া ও নিরাপত্তা জামানত: মাসিক ভাড়া ৳${Math.round(val / 12).toLocaleString()} টাকা এবং বার্ষিক মোট ভাড়া ৳${val.toLocaleString()} টাকা নির্ধারিত হইল।`,
            `৩. স্ট্যাম্প আইন ১৮৯৯: স্ট্যাম্প আইন ১৮৯৯ এর ৩৫ নম্বর অনুচ্ছেদ অনুসারে প্রযোজ্য নন-জুডিশিয়াল স্ট্যাম্প সংযুক্ত করা হইয়াছে।`,
            `৪. উপ-ভাড়া নিষেধাজ্ঞা: বাড়িওয়ালার লিখিত সম্মতি ব্যতিরেকে কোনো অবস্থাতেই সাব-লেট বা হস্তান্তর করা যাইবে না।`,
            `৫. চুক্তি সমাপ্তি: যেকোনো পক্ষ ৬০ (ষাট) দিনের অগ্রিম লিখিত নোটিশ প্রদানের মাধ্যমে চুক্তি সমাপ্ত করিতে পারিবে।`
          ]
        };

      case "nda":
        return {
          titleEn: "Mutual Non-Disclosure & Proprietary Information Protection Agreement",
          titleBn: "পারস্পরিক গোপনীয়তা রক্ষা ও বুদ্ধিবৃত্তিক সম্পত্তি সংরক্ষণ চুক্তি",
          defaultClausesEn: [
            `1. CONFIDENTIAL INFORMATION: Includes all source code, client lists, financial records, algorithms, and business strategy shared between ${p1.name} and ${p2.name}.`,
            `2. NON-DISCLOSURE OBLIGATION: The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for a period of 36 months.`,
            `3. ICT ACT 2006 & IP PROTECTION: Unauthorized disclosure or data theft shall incur statutory penalties under Section 54-66 of the Bangladesh ICT Act 2006.`,
            `4. INJUNCTIVE RELIEF: The Disclosing Party shall be entitled to seek immediate injunctive relief and damages in Dhaka Courts.`,
            `5. GOVERNING LAW: Governed by the Contract Act 1872 and Evidence Act 1872.`
          ],
          defaultClausesBn: [
            `১. গোপনীয় তথ্যের সংজ্ঞা: ১ম পক্ষ (${p1.name}) এবং ২য় পক্ষ (${p2.name})-এর মধ্যে আদান-প্রদানকৃত সকল সোর্স কোড, ক্লায়েন্ট তালিকা ও ব্যবসায়িক কৌশল গোপনীয় বলিয়া গণ্য হইবে।`,
            `২. সুরক্ষার মেয়াদ: কোনো পক্ষই অপর পক্ষের লিখিত অনুমতি ব্যতীত আগামী ৩৬ মাস এই তথ্য তৃতীয় কোনো পক্ষের নিকট প্রকাশ করিবে না।`,
            `৩. আইসিটি আইন ২০০৬: তথ্য চুরি বা অনুমোদনহীন ফাঁসের ক্ষেত্রে আইসিটি আইন ২০০৬ এর ৫৪-৬৬ ধারা অনুযায়ী অপরাধ বলিয়া গণ্য হইবে।`,
            `৪. নিষেধাজ্ঞা ও ক্ষতিপূরণ: চুক্তি ভঙ্গের ক্ষেত্রে ক্ষতিগ্রস্ত পক্ষ ঢাকা জজ কোর্টে সরাসরি নিষেধাজ্ঞা ও ক্ষতিপূরণ দাবি করিতে পারিবে।`,
            `৫. পরিচালনা আইন: এই চুক্তি বাংলাদেশ চুক্তি আইন ১৮৭২ এবং সাক্ষ্য আইন ১৮৭২ দ্বারা পরিচালিত হইবে।`
          ]
        };

      case "founder_vesting":
        return {
          titleEn: "Co-Founder Equity Vesting & Intellectual Property Assignment Agreement",
          titleBn: "সহ-প্রতিষ্ঠাতা ইক্যুইটি ভেস্টিং ও মেধাস্বত্ব হস্তান্তর চুক্তিপত্র",
          defaultClausesEn: [
            `1. EQUITY ALLOCATION & VESTING: Co-Founders agree to a standard 4-year vesting schedule with a 1-year cliff (25% vesting after 12 months, remaining monthly thereafter).`,
            `2. IP ASSIGNMENT: All code, designs, trademarks, trade secrets, and patents created shall irrevocably belong exclusively to the Company under Bangladesh Copyright Act 2000.`,
            `3. NON-COMPETE & NON-SOLICITATION: Co-Founders shall not engage in competing ventures or solicit company talent during tenure and for 12 months post-departure.`,
            `4. ACCELERATION CLAUSE: Single-trigger or double-trigger vesting acceleration upon qualified M&A exit or change of control.`,
            `5. JURISDICTION: Companies Act 1994 and High Court Division (Company Bench) of Bangladesh.`
          ],
          defaultClausesBn: [
            `১. শেয়ার বণ্টন ও ভেস্টিং: সহ-প্রতিষ্ঠাতাগণের ইক্যুইটি ৪ বছরের ভেস্টিং এবং ১ বছরের ক্লিফ শর্তে অর্জিত হইবে।`,
            `২. মেধাস্বত্ব হস্তান্তর: কাজের অংশ হিসেবে তৈরিকৃত সকল কোড, ডিজাইন ও কপিরাইট কোম্পানি আইন ও কপিরাইট আইন ২০০০ অনুযায়ী এককভাবে কোম্পানির সম্পত্তি হইবে।`,
            `৩. নন-কম্পিট শর্ত: সহ-প্রতিষ্ঠাতাগণ কোম্পানির সাথে যুক্ত থাকাকালীন এবং প্রস্থানের পরবর্তী ১২ মাস পর্যন্ত সমজাতীয় কোনো প্রতিযোগিতামূলক ব্যবসা করিতে পারিবেন না।`,
            `৪. কোম্পানি নিয়ন্ত্রণ পরিবর্তন: অধিগ্রহণ বা নিয়ন্ত্রক মালিকানা পরিবর্তনের ক্ষেত্রে শেয়ার ভেস্টিং ত্বরান্বিত হইবে।`,
            `৫. এখতিয়ার: কোম্পানি আইন ১৯৯৪ এবং বাংলাদেশ সুপ্রিম কোর্টের হাইকোর্ট বিভাগের কোম্পানি বেঞ্চের আওতাধীন।`
          ]
        };

      case "freelancer":
      default:
        return {
          titleEn: "Independent Software Developer & Professional Services Master Agreement",
          titleBn: "স্বাধীন সফটওয়্যার ডেভেলপার ও প্রযুক্তি সেবা চুক্তিপত্র",
          defaultClausesEn: [
            `1. SERVICES & MILESTONES: The Contractor (${p2.name}) agrees to deliver specified software modules to the Client (${p1.name}) as per milestone backlog.`,
            `2. COMPENSATION & WITHHOLDING: Total fee of ৳${val.toLocaleString()} BDT, payable upon code review and QA approval. Contractor responsible for personal income tax filing under Income Tax Act 2023.`,
            `3. WORK-FOR-HIRE & IP: All deliverables constitute work-made-for-hire; all copyright and patent rights assign to Client upon milestone payment.`,
            `4. CONFIDENTIALITY: Contractor agrees to maintain zero disclosure of client repositories, database credentials, and proprietary logic.`,
            `5. TERMINATION: Either party may terminate with 14 calendar days notice upon payment of approved milestone work completed.`
          ],
          defaultClausesBn: [
            `১. সেবার বিবরণ: ফ্রিল্যান্স ডেভেলপার (${p2.name}) ক্লায়েন্ট (${p1.name})-কে নির্ধারিত প্রযুক্তিগত মডিউল সময়মতো হস্তান্তর করিতে অঙ্গীকারবদ্ধ।`,
            `২. পারিশ্রমিক ও কর: মোট চুক্তি মূল্য ৳${val.toLocaleString()} টাকা, যা মাইলস্টোন অনুমোদনের পর পরিশোধযোগ্য। আয়কর আইন ২০২৩ মোতাবেক ডেভেলপার নিজের ব্যক্তিগত আয়কর প্রদান করিবেন।`,
            `৩. কপিরাইট হস্তান্তর: বিল পরিশোধের সাথে সাথে তৈরিকৃত সফটওয়্যার কোডের পূর্ণ মালিকানা ক্লায়েন্টের হইবে।`,
            `৪. গোপনীয়তা রক্ষা: ক্লায়েন্টের কোনো ডাটাবেজ, ক্রেডেনশিয়াল বা কোড উন্মুক্ত করা যাইবে না।`,
            `৫. চুক্তি বাতিল: যেকোনো পক্ষ ১৪ দিনের লিখিত নোটিশ প্রদান করিয়া অসমাপ্ত কাজ সমন্বয় সাপেক্ষে চুক্তি সমাপ্ত করিতে পারিবে।`
          ]
        };
    }
  }

  private seedInitialContracts() {
    const seed1 = this.generateContract({
      type: "vendor_supply",
      firstParty: {
        name: "Shothik Mart Ltd",
        companyName: "Shothik Mart Ltd",
        nidOrTin: "TIN-789456123012",
        phone: "+8801711000001",
        email: "legal@shothikmart.com",
        address: "Gulshan-2, Dhaka-1212",
      },
      secondParty: {
        name: "Bengal Organic Foods Ltd",
        companyName: "Bengal Organic Foods Ltd",
        nidOrTin: "TIN-998877665544",
        phone: "+8801819000002",
        email: "supply@bengalorganic.com",
        address: "Tejgaon I/A, Dhaka-1208",
      },
      contractValueBdt: 1250000,
      durationMonths: 12,
      effectiveDate: "2026-01-01",
    });

    this.signContract({
      contractId: seed1.id,
      party: "firstParty",
      signerName: "Tanvir Ahmed (Managing Director)",
      nidOrTin: "NID-1985269450012",
      otpCode: "948271",
      ipAddress: "103.14.24.89",
    });

    this.signContract({
      contractId: seed1.id,
      party: "secondParty",
      signerName: "Rafiqul Islam (Director Supply Chain)",
      nidOrTin: "NID-1988269450099",
      otpCode: "837192",
      ipAddress: "103.14.24.90",
    });

    const seed2 = this.generateContract({
      type: "property_lease",
      firstParty: {
        name: "Haji Nurul Islam Properties",
        nidOrTin: "TIN-112233445566",
        phone: "+8801911223344",
        address: "Uttara Sector 7, Dhaka-1230",
      },
      secondParty: {
        name: "Shothik Logistics Hub",
        nidOrTin: "TIN-789456123012",
        phone: "+8801711000001",
        address: "Gulshan-2, Dhaka-1212",
      },
      contractValueBdt: 720000, // 60k/month
      durationMonths: 24,
      effectiveDate: "2026-03-01",
    });

    this.signContract({
      contractId: seed2.id,
      party: "firstParty",
      signerName: "Haji Nurul Islam (Owner)",
      nidOrTin: "NID-1965269450012",
      otpCode: "492018",
    });

    this.generateContract({
      type: "nda",
      firstParty: {
        name: "Shothik AI Labs",
        nidOrTin: "TIN-789456123012",
        phone: "+8801711000001",
        address: "Banani, Dhaka-1213",
      },
      secondParty: {
        name: "FinTech Innovations BD",
        nidOrTin: "TIN-445566778899",
        phone: "+8801611889900",
        address: "Dhanmondi 27, Dhaka-1209",
      },
      contractValueBdt: 0,
      durationMonths: 36,
      effectiveDate: "2026-06-01",
    });
  }
}

export const legalContractsEngine = new LegalContractsEngine();
