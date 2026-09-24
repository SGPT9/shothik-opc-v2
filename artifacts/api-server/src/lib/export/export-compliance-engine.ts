import crypto from 'crypto';

export type PortOfShipment =
  | 'chittagong_seaport'
  | 'mongla_seaport'
  | 'dhaka_airport'
  | 'benapole_landport'
  | 'pyra_seaport';

export type ExportPaymentTerm =
  | 'letter_of_credit'
  | 'cash_against_documents'
  | 'advance_tt'
  | 'open_account';

export type FormExpStatus =
  | 'draft'
  | 'ad_certified'
  | 'customs_passed'
  | 'shipped_onboard'
  | 'realized'
  | 'overdue';

export interface FormExpItem {
  itemDescription: string;
  banglaDescription: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPriceUsd: number;
  fobValueUsd: number;
}

export interface FormExpRecord {
  expNumber: string;
  exporterBin: string;
  ercNumber: string;
  exporterName: string;
  exporterAddress: string;
  adBankCode: string;
  adBankName: string;
  adBranchName: string;
  consigneeName: string;
  consigneeAddress: string;
  destinationCountry: string;
  portOfShipment: PortOfShipment;
  portOfDischarge: string;
  paymentTerm: ExportPaymentTerm;
  lcOrContractNumber: string;
  lcDate?: string;
  items: FormExpItem[];
  totalFobUsd: number;
  exchangeRateBdt: number;
  totalFobBdt: number;
  status: FormExpStatus;
  shipmentDate?: string;
  repatriationDeadlineDate: string;
  daysRemainingRepatriation: number;
  realizedAmountUsd: number;
  prcCertificateNumber?: string;
  cashIncentiveEligiblePercent: number;
  cashIncentiveAccruedBdt: number;
  verificationHash: string;
  createdAt: string;
}

export interface ExportSummaryMetrics {
  totalExportsCount: number;
  totalTurnoverUsd: number;
  totalTurnoverBdt: number;
  totalRealizedUsd: number;
  pendingRepatriationUsd: number;
  overdueRepatriationCount: number;
  totalExportSubsidiesEarnedBdt: number;
}

export class ExportComplianceEngine {
  private records: Map<string, FormExpRecord> = new Map();

  constructor() {
    this.seedDefaultRecords();
  }

  /**
   * Validates 10-digit Export Registration Certificate (ERC) with CCI&E & BIN rules
   */
  public validateErc(
    ercNumber: string,
    bin: string
  ): {
    valid: boolean;
    message: string;
    expiryDate: string;
    ccieStatus: 'active' | 'suspended' | 'expired';
  } {
    const cleanErc = (ercNumber || '').trim().replace(/[^0-9A-Za-z]/g, '');
    const cleanBin = (bin || '').trim().replace(/[^0-9]/g, '');

    if (cleanBin.length !== 13) {
      return {
        valid: false,
        message: 'Invalid Exporter 13-Digit Business Identification Number (BIN/মূসক-২.৮).',
        expiryDate: '',
        ccieStatus: 'suspended',
      };
    }

    if (cleanErc.length < 8) {
      return {
        valid: false,
        message: 'ERC Number must be at least 8 alphanumeric characters registered with CCI&E.',
        expiryDate: '',
        ccieStatus: 'expired',
      };
    }

    // Mock active validity until end of current financial year (June 30)
    return {
      valid: true,
      message: 'ERC is verified and in active standing with Chief Controller of Imports & Exports (CCI&E).',
      expiryDate: '2027-06-30',
      ccieStatus: 'active',
    };
  }

  /**
   * Generates a statutory Bangladesh Bank Form-EXP export manifest document
   */
  public generateFormExp(input: Partial<FormExpRecord>): FormExpRecord {
    const exchangeRateBdt = input.exchangeRateBdt || 121.5;
    const items = input.items || [
      {
        itemDescription: 'Handcrafted Jute Tote Bags with Leather Trim',
        banglaDescription: 'হাতে তৈরি পাট ও চামড়ার ব্যাগ',
        hsCode: '4202.92.00',
        quantity: 500,
        unit: 'Pcs',
        unitPriceUsd: 14.5,
        fobValueUsd: 7250,
      },
    ];

    const totalFobUsd = items.reduce((acc, it) => acc + (it.fobValueUsd || it.quantity * it.unitPriceUsd), 0);
    const totalFobBdt = Number((totalFobUsd * exchangeRateBdt).toFixed(2));

    const expNumber =
      input.expNumber ||
      `EXP-${input.adBankCode || '0420'}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const shipmentDate = input.shipmentDate || new Date().toISOString().split('T')[0];
    const shipmentTime = new Date(shipmentDate).getTime();
    const repatriationDeadlineTime = shipmentTime + 120 * 24 * 60 * 60 * 1000; // 120 days FERA rule
    const repatriationDeadlineDate = new Date(repatriationDeadlineTime).toISOString().split('T')[0];
    const daysRemainingRepatriation = Math.max(
      0,
      Math.ceil((repatriationDeadlineTime - Date.now()) / (24 * 60 * 60 * 1000))
    );

    // Export subsidy incentive % under BB FE Circular (e.g. 10% for Jute/Leather, 4% for RMG)
    const cashIncentiveEligiblePercent = input.cashIncentiveEligiblePercent ?? 10.0;
    const cashIncentiveAccruedBdt = Number(((totalFobBdt * cashIncentiveEligiblePercent) / 100).toFixed(2));

    const verificationHash = crypto
      .createHash('sha256')
      .update(`${expNumber}:${input.exporterBin}:${totalFobUsd}:${repatriationDeadlineDate}`)
      .digest('hex');

    const record: FormExpRecord = {
      expNumber,
      exporterBin: input.exporterBin || '001234567-0101',
      ercNumber: input.ercNumber || 'ERC-EXP-2026-9041',
      exporterName: input.exporterName || 'Shothik Export & Heritage Crafts Ltd.',
      exporterAddress: input.exporterAddress || 'House 14, Road 7, Sector 3, Uttara, Dhaka-1230',
      adBankCode: input.adBankCode || '0420',
      adBankName: input.adBankName || 'BRAC Bank PLC',
      adBranchName: input.adBranchName || 'Gulshan Corporate Branch, Dhaka',
      consigneeName: input.consigneeName || 'Nordic Lifestyle ApS',
      consigneeAddress: input.consigneeAddress || 'Ostergade 24, 1100 Copenhagen, Denmark',
      destinationCountry: input.destinationCountry || 'Denmark',
      portOfShipment: input.portOfShipment || 'chittagong_seaport',
      portOfDischarge: input.portOfDischarge || 'Port of Hamburg / Copenhagen',
      paymentTerm: input.paymentTerm || 'letter_of_credit',
      lcOrContractNumber: input.lcOrContractNumber || 'LC-NORDIC-2026-091',
      lcDate: input.lcDate || new Date().toISOString().split('T')[0],
      items,
      totalFobUsd,
      exchangeRateBdt,
      totalFobBdt,
      status: input.status || 'ad_certified',
      shipmentDate,
      repatriationDeadlineDate,
      daysRemainingRepatriation,
      realizedAmountUsd: input.realizedAmountUsd || 0,
      cashIncentiveEligiblePercent,
      cashIncentiveAccruedBdt,
      verificationHash,
      createdAt: new Date().toISOString(),
    };

    this.records.set(expNumber, record);
    return record;
  }

  /**
   * Updates an export consignment's Letter of Credit or Repatriation status
   */
  public updateLcMilestone(
    expNumber: string,
    status: FormExpStatus,
    realizedUsd?: number,
    shipmentDate?: string
  ): FormExpRecord {
    const record = this.records.get(expNumber);
    if (!record) {
      throw new Error(`Form-EXP record #${expNumber} not found.`);
    }

    record.status = status;
    if (shipmentDate) {
      record.shipmentDate = shipmentDate;
      const shipmentTime = new Date(shipmentDate).getTime();
      const repatriationDeadlineTime = shipmentTime + 120 * 24 * 60 * 60 * 1000;
      record.repatriationDeadlineDate = new Date(repatriationDeadlineTime).toISOString().split('T')[0];
    }

    if (realizedUsd !== undefined) {
      record.realizedAmountUsd = realizedUsd;
      if (realizedUsd >= record.totalFobUsd) {
        record.status = 'realized';
        record.prcCertificateNumber = `PRC-BB-${Date.now().toString().slice(-6)}`;
      }
    }

    // Refresh remaining days
    const deadlineTime = new Date(record.repatriationDeadlineDate).getTime();
    record.daysRemainingRepatriation = Math.max(0, Math.ceil((deadlineTime - Date.now()) / (24 * 60 * 60 * 1000)));

    if (record.daysRemainingRepatriation === 0 && record.status !== 'realized') {
      record.status = 'overdue';
    }

    this.records.set(expNumber, record);
    return record;
  }

  /**
   * Returns aggregate export performance, pending repatriation, and subsidy accruals
   */
  public getSummaryMetrics(): ExportSummaryMetrics {
    let totalTurnoverUsd = 0;
    let totalTurnoverBdt = 0;
    let totalRealizedUsd = 0;
    let pendingRepatriationUsd = 0;
    let overdueRepatriationCount = 0;
    let totalExportSubsidiesEarnedBdt = 0;

    for (const r of this.records.values()) {
      totalTurnoverUsd += r.totalFobUsd;
      totalTurnoverBdt += r.totalFobBdt;
      totalRealizedUsd += r.realizedAmountUsd;

      const pending = Math.max(0, r.totalFobUsd - r.realizedAmountUsd);
      pendingRepatriationUsd += pending;

      if (r.status === 'overdue' || (r.daysRemainingRepatriation === 0 && r.status !== 'realized')) {
        overdueRepatriationCount += 1;
      }

      if (r.status === 'realized') {
        totalExportSubsidiesEarnedBdt += r.cashIncentiveAccruedBdt;
      }
    }

    return {
      totalExportsCount: this.records.size,
      totalTurnoverUsd: Number(totalTurnoverUsd.toFixed(2)),
      totalTurnoverBdt: Number(totalTurnoverBdt.toFixed(2)),
      totalRealizedUsd: Number(totalRealizedUsd.toFixed(2)),
      pendingRepatriationUsd: Number(pendingRepatriationUsd.toFixed(2)),
      overdueRepatriationCount,
      totalExportSubsidiesEarnedBdt: Number(totalExportSubsidiesEarnedBdt.toFixed(2)),
    };
  }

  public listFormExp(filter?: { status?: FormExpStatus }): FormExpRecord[] {
    const list = Array.from(this.records.values());
    if (!filter?.status) return list;
    return list.filter((r) => r.status === filter.status);
  }

  public getFormExpByNumber(expNumber: string): FormExpRecord | undefined {
    return this.records.get(expNumber);
  }

  public resetStore(): void {
    this.records.clear();
  }

  private seedDefaultRecords(): void {
    this.generateFormExp({
      expNumber: 'EXP-0420-2026-00891',
      exporterName: 'Shothik Export & Heritage Crafts Ltd.',
      consigneeName: 'Nordic Lifestyle ApS',
      destinationCountry: 'Denmark',
      portOfShipment: 'chittagong_seaport',
      paymentTerm: 'letter_of_credit',
      status: 'shipped_onboard',
      items: [
        {
          itemDescription: 'Handcrafted Jute Tote Bags with Leather Trim',
          banglaDescription: 'হাতে তৈরি পাট ও চামড়ার ব্যাগ',
          hsCode: '4202.92.00',
          quantity: 1200,
          unit: 'Pcs',
          unitPriceUsd: 12.5,
          fobValueUsd: 15000,
        },
      ],
      cashIncentiveEligiblePercent: 10,
    });

    this.generateFormExp({
      expNumber: 'EXP-0115-2026-00452',
      exporterName: 'Shothik Apparels & Knitwear Hub',
      consigneeName: 'Hanseatic Retail GmbH',
      destinationCountry: 'Germany',
      portOfShipment: 'dhaka_airport',
      paymentTerm: 'cash_against_documents',
      status: 'realized',
      realizedAmountUsd: 28400,
      items: [
        {
          itemDescription: 'Organic Cotton Polo Shirts (Bio-Washed)',
          banglaDescription: 'অর্গানিক কটন পোলো শার্ট',
          hsCode: '6105.10.00',
          quantity: 3500,
          unit: 'Pcs',
          unitPriceUsd: 8.1143,
          fobValueUsd: 28400,
        },
      ],
      cashIncentiveEligiblePercent: 4,
    });
  }
}

export const exportComplianceEngine = new ExportComplianceEngine();
