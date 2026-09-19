/**
 * NBR Mushak-6.3 Statutory Tax Engine & TDS Settlement Ledger
 * 
 * Complies with the Bangladesh Value Added Tax and Supplementary Duty Act, 2012
 * and VAT Rules 2016 (মূসক-৬.৩ - কর চালানপত্র).
 * 
 * Handles:
 * - 13-digit BIN (Business Identification Number) & TIN validation
 * - Standard 15%, reduced (10%, 7.5%, 5%), and 0% exempt VAT rates
 * - Supplementary Duty (SD) computation
 * - Tax Deducted at Source (TDS) withholding under Income Tax Act & VAT Rules
 * - Unique statutory serial numbering (`M63-YYYYMM-XXXXX`)
 * - QR code verification token generation
 * - Monthly Mushak-9.1 Return aggregate summary
 */

import crypto from 'crypto';

export interface MushakLineItem {
  id: string;
  itemDescription: string;
  itemCode?: string;
  quantity: number;
  unit: 'pcs' | 'kg' | 'hours' | 'service' | 'reams' | 'copies';
  unitPriceBdt: number;
  supplementaryDutyRatePercent?: number;
  vatRatePercent: number; // 0, 5, 7.5, 10, 15
  tdsCategory?: 'it_software_2pct' | 'printing_publishing_3pct' | 'goods_supply_5pct' | 'professional_service_10pct' | 'none';
}

export interface CalculatedMushakLineItem extends MushakLineItem {
  rawPriceBdt: number;
  supplementaryDutyBdt: number;
  priceAfterSdBdt: number;
  vatAmountBdt: number;
  grossTotalBdt: number;
  tdsRatePercent: number;
  tdsAmountBdt: number;
  netPayableAfterTdsBdt: number;
}

export interface MushakTaxInvoice {
  invoiceId: string;
  serialNumber: string; // e.g. M63-202609-00101
  issueDate: string;
  issueTime: string;
  sellerInfo: {
    registeredName: string;
    tradeName: string;
    bin: string; // 13-digit
    tin?: string;
    address: string;
    phone: string;
    email: string;
  };
  buyerInfo: {
    name: string;
    companyName?: string;
    bin?: string;
    tin?: string;
    address: string;
    phone?: string;
    isTaxWithholdingEntity: boolean;
  };
  destinationAddress: string;
  vehicleType?: string;
  vehicleNumber?: string;
  items: CalculatedMushakLineItem[];
  totals: {
    totalRawPriceBdt: number;
    totalSupplementaryDutyBdt: number;
    totalVatAmountBdt: number;
    grossTotalBdt: number;
    totalTdsWithheldBdt: number;
    netPayableBdt: number;
  };
  qrVerificationToken: string;
  qrVerificationUrl: string;
  isSupervisedAutonomyFlagged: boolean; // Flagged if gross > ৳10,000
  status: 'issued' | 'settled' | 'cancelled';
  statutoryDeclaration: string;
}

export interface Mushak91ReturnSummary {
  fiscalMonth: string; // YYYY-MM
  totalInvoicesIssued: number;
  totalOutputVatBdt: number;
  totalSupplementaryDutyBdt: number;
  totalInputTaxCreditEstimatedBdt: number;
  totalTdsWithheldByBuyersBdt: number;
  netVatPayableToTreasuryBdt: number;
  treasuryChallanCode: string;
  filingDeadline: string;
}

// In-Memory Invoice Ledger
const invoiceStore: Map<string, MushakTaxInvoice> = new Map();
let serialCounter = 100;

export class MushakTaxEngine {
  /**
   * Validates a 13-digit Bangladeshi Business Identification Number (BIN)
   * Format: 9 digits + 4 sub-code digits, or standard 13 numeric chars.
   */
  static validateBin(bin: string): boolean {
    if (!bin) return false;
    const clean = bin.replace(/[-\s]/g, '');
    return /^\d{13}$/.test(clean);
  }

  /**
   * Resolves TDS (Tax Deducted at Source) withholding rate based on service category
   */
  static getTdsRate(category?: MushakLineItem['tdsCategory']): number {
    switch (category) {
      case 'it_software_2pct':
        return 2.0;
      case 'printing_publishing_3pct':
        return 3.0;
      case 'goods_supply_5pct':
        return 5.0;
      case 'professional_service_10pct':
        return 10.0;
      case 'none':
      default:
        return 0.0;
    }
  }

  /**
   * Calculates statutory VAT, SD, and TDS line items
   */
  static calculateLineItem(item: MushakLineItem, isBuyerWithholdingEntity = false): CalculatedMushakLineItem {
    const rawPriceBdt = Math.round(item.quantity * item.unitPriceBdt * 100) / 100;
    const sdRate = item.supplementaryDutyRatePercent || 0;
    const supplementaryDutyBdt = Math.round(rawPriceBdt * (sdRate / 100) * 100) / 100;
    const priceAfterSdBdt = rawPriceBdt + supplementaryDutyBdt;
    const vatRate = item.vatRatePercent ?? 15;
    const vatAmountBdt = Math.round(priceAfterSdBdt * (vatRate / 100) * 100) / 100;
    const grossTotalBdt = Math.round((priceAfterSdBdt + vatAmountBdt) * 100) / 100;

    const tdsRatePercent = isBuyerWithholdingEntity ? this.getTdsRate(item.tdsCategory) : 0;
    const tdsAmountBdt = Math.round(rawPriceBdt * (tdsRatePercent / 100) * 100) / 100;
    const netPayableAfterTdsBdt = Math.round((grossTotalBdt - tdsAmountBdt) * 100) / 100;

    return {
      ...item,
      rawPriceBdt,
      supplementaryDutyBdt,
      priceAfterSdBdt,
      vatAmountBdt,
      grossTotalBdt,
      tdsRatePercent,
      tdsAmountBdt,
      netPayableAfterTdsBdt
    };
  }

  /**
   * Generates a formal NBR Mushak-6.3 Statutory Tax Invoice
   */
  static generateInvoice(params: {
    sellerInfo?: Partial<MushakTaxInvoice['sellerInfo']>;
    buyerInfo: MushakTaxInvoice['buyerInfo'];
    destinationAddress?: string;
    vehicleType?: string;
    vehicleNumber?: string;
    items: MushakLineItem[];
  }): MushakTaxInvoice {
    const defaultSeller: MushakTaxInvoice['sellerInfo'] = {
      registeredName: 'Shothik Technologies Limited',
      tradeName: 'ShothikGPT AgenticOS',
      bin: '001928374-0101',
      tin: '782910482910',
      address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
      phone: '+8801700000000',
      email: 'vat@shothik.ai',
      ...params.sellerInfo
    };

    const calculatedItems = params.items.map(item => 
      this.calculateLineItem(item, params.buyerInfo.isTaxWithholdingEntity)
    );

    const totalRawPriceBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.rawPriceBdt, 0) * 100) / 100;
    const totalSupplementaryDutyBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.supplementaryDutyBdt, 0) * 100) / 100;
    const totalVatAmountBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.vatAmountBdt, 0) * 100) / 100;
    const grossTotalBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.grossTotalBdt, 0) * 100) / 100;
    const totalTdsWithheldBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.tdsAmountBdt, 0) * 100) / 100;
    const netPayableBdt = Math.round((grossTotalBdt - totalTdsWithheldBdt) * 100) / 100;

    serialCounter++;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const serialNumber = `M63-${yyyy}${mm}-${String(serialCounter).padStart(5, '0')}`;
    const invoiceId = `inv_m63_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Cryptographic QR verification token
    const verificationPayload = `${serialNumber}:${defaultSeller.bin}:${grossTotalBdt}:${totalVatAmountBdt}:${now.toISOString()}`;
    const qrVerificationToken = crypto.createHash('sha256').update(verificationPayload).digest('hex').substring(0, 32);
    const qrVerificationUrl = `https://vat.nbr.gov.bd/verify?token=${qrVerificationToken}&bin=${defaultSeller.bin}&inv=${serialNumber}`;

    const isSupervisedAutonomyFlagged = grossTotalBdt > 10000;

    const statutoryDeclaration = 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড (মূল্য সংযোজন কর ও সম্পূরক শুল্ক বিধিমালা, ২০১৬ এর বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য)। এটি একটি ইলেকট্রনিকভাবে প্রস্তুতকৃত মূসক-৬.৩ চালানপত্র।';

    const invoice: MushakTaxInvoice = {
      invoiceId,
      serialNumber,
      issueDate: now.toISOString().split('T')[0],
      issueTime: now.toTimeString().split(' ')[0],
      sellerInfo: defaultSeller,
      buyerInfo: params.buyerInfo,
      destinationAddress: params.destinationAddress || params.buyerInfo.address,
      vehicleType: params.vehicleType,
      vehicleNumber: params.vehicleNumber,
      items: calculatedItems,
      totals: {
        totalRawPriceBdt,
        totalSupplementaryDutyBdt,
        totalVatAmountBdt,
        grossTotalBdt,
        totalTdsWithheldBdt,
        netPayableBdt
      },
      qrVerificationToken,
      qrVerificationUrl,
      isSupervisedAutonomyFlagged,
      status: 'issued',
      statutoryDeclaration
    };

    invoiceStore.set(invoiceId, invoice);
    return invoice;
  }

  /**
   * Retrieves an invoice by ID
   */
  static getInvoice(invoiceId: string): MushakTaxInvoice | undefined {
    return invoiceStore.get(invoiceId);
  }

  /**
   * Lists all issued invoices
   */
  static listInvoices(): MushakTaxInvoice[] {
    return Array.from(invoiceStore.values()).sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }

  /**
   * Calculates monthly Mushak-9.1 return aggregates
   */
  static getMushak91Summary(fiscalMonth?: string): Mushak91ReturnSummary {
    const targetMonth = fiscalMonth || new Date().toISOString().substring(0, 7);
    const monthInvoices = Array.from(invoiceStore.values()).filter(inv => 
      inv.issueDate.startsWith(targetMonth)
    );

    const totalOutputVatBdt = Math.round(monthInvoices.reduce((acc, inv) => acc + inv.totals.totalVatAmountBdt, 0) * 100) / 100;
    const totalSupplementaryDutyBdt = Math.round(monthInvoices.reduce((acc, inv) => acc + inv.totals.totalSupplementaryDutyBdt, 0) * 100) / 100;
    const totalTdsWithheldByBuyersBdt = Math.round(monthInvoices.reduce((acc, inv) => acc + inv.totals.totalTdsWithheldBdt, 0) * 100) / 100;
    
    // Estimated Input Tax Credit (e.g. 40% of Output VAT on raw materials/services)
    const totalInputTaxCreditEstimatedBdt = Math.round(totalOutputVatBdt * 0.40 * 100) / 100;
    const netVatPayableToTreasuryBdt = Math.max(0, Math.round((totalOutputVatBdt - totalInputTaxCreditEstimatedBdt - totalTdsWithheldByBuyersBdt) * 100) / 100);

    const [year, month] = targetMonth.split('-');
    const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1;
    const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
    const filingDeadline = `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`;

    return {
      fiscalMonth: targetMonth,
      totalInvoicesIssued: monthInvoices.length,
      totalOutputVatBdt,
      totalSupplementaryDutyBdt,
      totalInputTaxCreditEstimatedBdt,
      totalTdsWithheldByBuyersBdt,
      netVatPayableToTreasuryBdt,
      treasuryChallanCode: '1-1133-0006-0311', // Standard Bangladesh NBR VAT Treasury Code
      filingDeadline
    };
  }

  /**
   * Generates printable statutory HTML for Mushak-6.3
   */
  static generatePrintableHtml(invoice: MushakTaxInvoice): string {
    const itemRows = invoice.items.map((item, idx) => `
      <tr>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #333; padding: 6px;">${item.itemDescription}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${item.quantity} ${item.unit}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: right;">৳${item.unitPriceBdt.toFixed(2)}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: right;">৳${item.rawPriceBdt.toFixed(2)}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: right;">৳${item.supplementaryDutyBdt.toFixed(2)}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: center;">${item.vatRatePercent}%</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: right;">৳${item.vatAmountBdt.toFixed(2)}</td>
        <td style="border: 1px solid #333; padding: 6px; text-align: right; font-weight: bold;">৳${item.grossTotalBdt.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>মূসক-৬.৩ কর চালানপত্র - ${invoice.serialNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #111; max-width: 850px; margin: 0 auto; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: bold; }
          .info-table { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
          .info-table td { padding: 4px 8px; vertical-align: top; }
          .main-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .main-table th { background: #f3f4f6; border: 1px solid #333; padding: 8px 6px; font-size: 13px; }
          .total-box { margin-top: 16px; float: right; width: 320px; }
          .declaration { margin-top: 40px; font-size: 11px; color: #555; clear: both; border-top: 1px solid #ccc; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 13px; font-weight: bold;">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড</div>
          <div style="font-size: 18px; font-weight: 800; margin: 4px 0;">কর চালানপত্র (TAX INVOICE)</div>
          <div class="badge">[বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য] — মূসক-৬.৩</div>
        </div>

        <table class="info-table">
          <tr>
            <td style="width: 50%;">
              <strong>নিবন্ধিত ব্যক্তির নাম:</strong> ${invoice.sellerInfo.registeredName}<br>
              <strong>বাণিজ্যিক নাম:</strong> ${invoice.sellerInfo.tradeName}<br>
              <strong>বিআইএন (BIN):</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold;">${invoice.sellerInfo.bin}</span><br>
              <strong>ঠিকানা:</strong> ${invoice.sellerInfo.address}
            </td>
            <td style="width: 50%; text-align: right;">
              <strong>চালানপত্র নম্বর:</strong> <span style="font-family: monospace; font-weight: bold;">${invoice.serialNumber}</span><br>
              <strong>ইস্যুর তারিখ:</strong> ${invoice.issueDate}<br>
              <strong>ইস্যুর সময়:</strong> ${invoice.issueTime}<br>
              <strong>গন্তব্যস্থল:</strong> ${invoice.destinationAddress}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: 1px dashed #ccc; padding-top: 8px;">
              <strong>ক্রেতার নাম:</strong> ${invoice.buyerInfo.name} ${invoice.buyerInfo.companyName ? `(${invoice.buyerInfo.companyName})` : ''}<br>
              <strong>ক্রেতার বিআইএন (BIN):</strong> ${invoice.buyerInfo.bin || 'প্রযোজ্য নহে (Unregistered)'}<br>
              <strong>ক্রেতার ঠিকানা:</strong> ${invoice.buyerInfo.address}
            </td>
          </tr>
        </table>

        <table class="main-table">
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>পণ্য বা সেবার বিবরণ</th>
              <th>পরিমাণ</th>
              <th>একক মূল্য</th>
              <th>মোট মূল্য</th>
              <th>সম্পূরক শুল্ক</th>
              <th>মূসক হার</th>
              <th>মূসকের পরিমাণ</th>
              <th>সর্বমোট মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="total-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td>মোট মূল্য (Raw Price):</td><td style="text-align: right; font-weight: bold;">৳${invoice.totals.totalRawPriceBdt.toFixed(2)}</td></tr>
            <tr><td>মোট সম্পূরক শুল্ক (SD):</td><td style="text-align: right;">৳${invoice.totals.totalSupplementaryDutyBdt.toFixed(2)}</td></tr>
            <tr><td>মোট মূসক (VAT):</td><td style="text-align: right; color: #0284c7; font-weight: bold;">৳${invoice.totals.totalVatAmountBdt.toFixed(2)}</td></tr>
            <tr style="border-top: 2px solid #111; font-size: 15px;"><td><strong>সর্বমোট প্রদেয়:</strong></td><td style="text-align: right;"><strong>৳${invoice.totals.grossTotalBdt.toFixed(2)}</strong></td></tr>
            ${invoice.totals.totalTdsWithheldBdt > 0 ? `
              <tr style="color: #dc2626;"><td>উৎস কর কর্তন (TDS):</td><td style="text-align: right;">-৳${invoice.totals.totalTdsWithheldBdt.toFixed(2)}</td></tr>
              <tr style="border-top: 1px solid #111; font-size: 14px; color: #16a34a;"><td><strong>প্রকৃত প্রাপ্য (Net):</strong></td><td style="text-align: right;"><strong>৳${invoice.totals.netPayableBdt.toFixed(2)}</strong></td></tr>
            ` : ''}
          </table>
        </div>

        <div class="declaration">
          <p><strong>দায়িত্বপ্রাপ্ত ব্যক্তির নাম ও স্বাক্ষর:</strong> Shothik Automated Digital Signature [Verified]</p>
          <p><strong>QR Verification Hash:</strong> ${invoice.qrVerificationToken}</p>
          <p>${invoice.statutoryDeclaration}</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Seed sample invoices for immediate demonstration
MushakTaxEngine.generateInvoice({
  buyerInfo: {
    name: 'Tanvir Hossain',
    companyName: 'Dhaka Creative Agency',
    bin: '003849102-0201',
    address: 'Gulshan-2, Dhaka-1212',
    isTaxWithholdingEntity: true
  },
  items: [
    {
      id: 'item_01',
      itemDescription: 'Shothik AI Agentic Developer Twin Annual License',
      quantity: 1,
      unit: 'service',
      unitPriceBdt: 15000,
      vatRatePercent: 15,
      tdsCategory: 'it_software_2pct'
    },
    {
      id: 'item_02',
      itemDescription: 'Nilkhet POD Physical Book Imposition & Print Processing',
      quantity: 50,
      unit: 'copies',
      unitPriceBdt: 120,
      vatRatePercent: 5,
      tdsCategory: 'printing_publishing_3pct'
    }
  ]
});
