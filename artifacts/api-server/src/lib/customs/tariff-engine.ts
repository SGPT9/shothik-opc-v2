import { createHash, randomUUID } from "node:crypto";

export interface HsCodeEntry {
  hsCode: string;
  description: string;
  banglaDescription: string;
  category: string;
  cd: number; // Customs Duty %
  rd: number; // Regulatory Duty %
  sd: number; // Supplementary Duty %
  vat: number; // VAT % (typically 15%)
  ait: number; // Advance Income Tax % (typically 5%)
  at: number; // Advance Tax % (typically 5%)
  ipoRestrictions: string[];
  mandatoryCertificates: string[];
}

export interface TaxIncidenceBreakdown {
  assessableValueBdt: number;
  hsCode: string;
  description: string;
  cdAmount: number;
  rdAmount: number;
  sdAmount: number;
  vatAmount: number;
  aitAmount: number;
  atAmount: number;
  totalDutyBdt: number;
  totalTaxIncidencePercent: number;
  effectiveLandedCostBdt: number;
}

export interface CommercialInvoiceItem {
  itemDescription: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPriceUsd: number;
  totalPriceUsd: number;
}

export interface CommercialInvoice {
  invoiceNumber: string;
  exporter: { name: string; address: string; country: string };
  importer: { name: string; binNumber: string; tinNumber: string; address: string };
  portOfLoading: string;
  portOfEntry: "Chittagong Port" | "Benapole Land Port" | "Dhaka Airport Cargo" | "Mongla Port";
  currency: string;
  exchangeRateBdt: number;
  items: CommercialInvoiceItem[];
  totalUsd: number;
  totalAssessableValueBdt: number;
  taxBreakdown: TaxIncidenceBreakdown;
  ipoCompliance: { compliant: boolean; requiredClearances: string[]; notes: string[] };
  signedHashSeal: string;
  createdAt: string;
}

export class CustomsTariffEngine {
  private hsDatabase: HsCodeEntry[] = [
    {
      hsCode: "8517.13.00",
      description: "Smartphones and cellular network phones",
      banglaDescription: "স্মার্টফোন এবং সেলুলার নেটওয়ার্ক ফোন",
      category: "Electronics",
      cd: 25,
      rd: 3,
      sd: 20,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["BTRC NOC Mandatory", "IMEI Whitelist Registration"],
      mandatoryCertificates: ["BTRC Type Approval", "BSTI Certificate"],
    },
    {
      hsCode: "8471.30.00",
      description: "Portable automatic data processing machines (Laptops/Notebooks)",
      banglaDescription: "ল্যাপটপ ও বহনযোগ্য কম্পিউটার",
      category: "ICT Hardware",
      cd: 0,
      rd: 0,
      sd: 0,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["Standard ICT clearance"],
      mandatoryCertificates: ["Commercial Invoice", "Packing List"],
    },
    {
      hsCode: "6109.10.00",
      description: "T-shirts, singlets and other vests of cotton, knitted",
      banglaDescription: "সুতি টি-শার্ট ও গেঞ্জি",
      category: "Apparel & Textiles",
      cd: 25,
      rd: 3,
      sd: 45,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["Country of Origin Certification", "Textile Lab Test"],
      mandatoryCertificates: ["Certificate of Origin", "AZO Dye Free Test"],
    },
    {
      hsCode: "3304.99.00",
      description: "Beauty or make-up preparations and skincare cosmetics",
      banglaDescription: "সৌন্দর্যবর্ধক ও স্কিনকেয়ার প্রসাধন সামগ্রী",
      category: "Cosmetics",
      cd: 25,
      rd: 3,
      sd: 45,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["BSTI Clearance Mandatory", "Halal Certificate for Islamic Market"],
      mandatoryCertificates: ["BSTI BDS Standard NOC", "Certificate of Analysis"],
    },
    {
      hsCode: "0902.40.00",
      description: "Black tea (fermented) and other partly fermented tea",
      banglaDescription: "কালো চা পাতা ও প্রক্রিয়াজাত চা",
      category: "Agro Commodities",
      cd: 25,
      rd: 3,
      sd: 20,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["Plant Quarantine Certificate", "Bangladesh Tea Board NOC"],
      mandatoryCertificates: ["Phytosanitary Certificate", "Radiation Test Certificate"],
    },
    {
      hsCode: "4202.21.00",
      description: "Handbags with outer surface of leather",
      banglaDescription: "চামড়ার হ্যান্ডব্যাগ ও পার্স",
      category: "Leather Goods",
      cd: 25,
      rd: 3,
      sd: 30,
      vat: 15,
      ait: 5,
      at: 5,
      ipoRestrictions: ["CITES Wildlife Clearance for Exotic Leathers"],
      mandatoryCertificates: ["Certificate of Origin", "Tannery Chrome Free Seal"],
    },
  ];

  classifyHsCode(query: string): { matches: (HsCodeEntry & { confidence: number })[] } {
    const q = query.toLowerCase().trim();
    const results = this.hsDatabase
      .map((entry) => {
        let score = 0;
        if (entry.hsCode.includes(q)) score += 0.9;
        if (entry.description.toLowerCase().includes(q)) score += 0.7;
        if (entry.banglaDescription.includes(q)) score += 0.8;
        if (entry.category.toLowerCase().includes(q)) score += 0.5;

        // Keyword tokens match
        const tokens = q.split(/\s+/);
        for (const t of tokens) {
          if (entry.description.toLowerCase().includes(t)) score += 0.2;
          if (entry.banglaDescription.includes(t)) score += 0.2;
        }

        return { ...entry, confidence: Math.min(1.0, Math.round(score * 100) / 100) };
      })
      .filter((e) => e.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence);

    return { matches: results.length > 0 ? results : [{ ...this.hsDatabase[0], confidence: 0.5 }] };
  }

  calculateTaxIncidence(params: { assessableValueBdt: number; hsCode: string }): TaxIncidenceBreakdown {
    const { assessableValueBdt, hsCode } = params;
    const entry = this.hsDatabase.find((e) => e.hsCode === hsCode) || this.hsDatabase[0];

    const av = assessableValueBdt;
    const cdAmount = Math.round((av * entry.cd) / 100);
    const rdAmount = Math.round((av * entry.rd) / 100);

    const baseForSd = av + cdAmount + rdAmount;
    const sdAmount = Math.round((baseForSd * entry.sd) / 100);

    const baseForVat = baseForSd + sdAmount;
    const vatAmount = Math.round((baseForVat * entry.vat) / 100);

    const aitAmount = Math.round((av * entry.ait) / 100);
    const atAmount = Math.round((baseForVat * entry.at) / 100);

    const totalDutyBdt = cdAmount + rdAmount + sdAmount + vatAmount + aitAmount + atAmount;
    const totalTaxIncidencePercent = Math.round((totalDutyBdt / av) * 10000) / 100;
    const effectiveLandedCostBdt = av + totalDutyBdt;

    return {
      assessableValueBdt: av,
      hsCode: entry.hsCode,
      description: entry.description,
      cdAmount,
      rdAmount,
      sdAmount,
      vatAmount,
      aitAmount,
      atAmount,
      totalDutyBdt,
      totalTaxIncidencePercent,
      effectiveLandedCostBdt,
    };
  }

  screenIpoCompliance(hsCode: string, countryOfOrigin = "China"): {
    compliant: boolean;
    requiredClearances: string[];
    notes: string[];
  } {
    const entry = this.hsDatabase.find((e) => e.hsCode === hsCode) || this.hsDatabase[0];
    const clearances = [...entry.mandatoryCertificates, ...entry.ipoRestrictions];
    const notes: string[] = [];

    notes.push(`Applicable under Bangladesh Import Policy Order (IPO) for ${entry.category}`);
    if (countryOfOrigin.toLowerCase().includes("israel")) {
      return {
        compliant: false,
        requiredClearances: clearances,
        notes: ["Statutory Embargo: Import from Israel is strictly prohibited under Section 3 of IPO."],
      };
    }

    notes.push(`Customs Assessment Port Verification required at port of entry.`);
    return {
      compliant: true,
      requiredClearances: clearances,
      notes,
    };
  }

  generateCommercialInvoice(params: {
    exporter: { name: string; address: string; country: string };
    importer: { name: string; binNumber: string; tinNumber: string; address: string };
    portOfEntry: CommercialInvoice["portOfEntry"];
    items: CommercialInvoiceItem[];
    exchangeRateBdt?: number;
  }): CommercialInvoice {
    const invoiceNumber = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const rate = params.exchangeRateBdt || 122.5; // USD to BDT
    const totalUsd = params.items.reduce((acc, it) => acc + it.totalPriceUsd, 0);
    const totalAssessableValueBdt = Math.round(totalUsd * rate);

    const primaryHsCode = params.items[0]?.hsCode || "8517.13.00";
    const taxBreakdown = this.calculateTaxIncidence({
      assessableValueBdt: totalAssessableValueBdt,
      hsCode: primaryHsCode,
    });

    const ipoCompliance = this.screenIpoCompliance(primaryHsCode, params.exporter.country);

    const createdAt = new Date().toISOString();
    const hashData = `${invoiceNumber}:${params.importer.binNumber}:${totalUsd}:${taxBreakdown.totalDutyBdt}:${createdAt}`;
    const signedHashSeal = createHash("sha256").update(hashData).digest("hex");

    return {
      invoiceNumber,
      exporter: params.exporter,
      importer: params.importer,
      portOfLoading: `${params.exporter.country} Main Port`,
      portOfEntry: params.portOfEntry,
      currency: "USD",
      exchangeRateBdt: rate,
      items: params.items,
      totalUsd,
      totalAssessableValueBdt,
      taxBreakdown,
      ipoCompliance,
      signedHashSeal,
      createdAt,
    };
  }
}

export const globalTariffEngine = new CustomsTariffEngine();
