import crypto from 'crypto';

export type SupportedCarrier = 'steadfast' | 'pathao' | 'redx' | 'paperfly';

export type CanonicalParcelStatus =
  | 'in_transit'
  | 'delivered'
  | 'partial_delivered'
  | 'cancelled'
  | 'return_in_transit'
  | 'returned'
  | 'settled'
  | 'unknown';

export interface NormalizedCarrierEvent {
  eventId: string;
  carrier: SupportedCarrier;
  consignmentId: string;
  orderId: string;
  invoiceId?: string;
  trackingCode: string;
  status: CanonicalParcelStatus;
  originalStatus: string;
  recipientPhone?: string;
  hubLocation?: string;
  collectedAmount: number;
  deliveryFee: number;
  codFee: number;
  returnFee: number;
  netDisbursed: number;
  timestamp: string;
  rawPayload: Record<string, any>;
}

export interface LedgerJournalEntry {
  entryNumber: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceConsignmentId: string;
}

export interface DiscrepancyReport {
  discrepancyId: string;
  consignmentId: string;
  carrier: SupportedCarrier;
  expectedAmount: number;
  actualAmount: number;
  variance: number;
  reason: string;
  disputeClaimDraftBangla: string;
  disputeClaimDraftEnglish: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface ReconciliationSummary {
  totalEvents: number;
  totalCollectedCod: number;
  totalDeliveryFees: number;
  totalCodFees: number;
  totalSettledDisbursements: number;
  pendingReceivables: number;
  activeDiscrepanciesCount: number;
  totalDiscrepancyAmount: number;
  carrierBreakdown: Record<
    SupportedCarrier,
    {
      deliveredCount: number;
      returnedCount: number;
      collectedAmount: number;
      feePaid: number;
      activeDisputes: number;
    }
  >;
}

export class MultiCarrierWebhookEngine {
  private events: NormalizedCarrierEvent[] = [];
  private journalEntries: LedgerJournalEntry[] = [];
  private discrepancies: DiscrepancyReport[] = [];
  private secretKeys: Record<SupportedCarrier, string> = {
    steadfast: process.env.STEADFAST_WEBHOOK_SECRET || 'test_steadfast_secret_key',
    pathao: process.env.PATHAO_WEBHOOK_SECRET || 'test_pathao_secret_key',
    redx: process.env.REDX_WEBHOOK_SECRET || 'test_redx_secret_key',
    paperfly: process.env.PAPERFLY_WEBHOOK_SECRET || 'test_paperfly_secret_key',
  };

  /**
   * Cryptographically verifies webhook integrity using HMAC-SHA256 or Bearer token
   */
  public verifySignature(
    carrier: SupportedCarrier,
    payload: any,
    signatureHeader?: string,
    overrideSecret?: string
  ): boolean {
    const secret = overrideSecret || this.secretKeys[carrier];
    if (!signatureHeader || !secret) {
      // In dev/test environments without header, allow fallback if matching explicit dev token
      return false;
    }

    // Direct token check (e.g. Bearer auth)
    if (signatureHeader === secret || signatureHeader === `Bearer ${secret}`) {
      return true;
    }

    try {
      const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const computed = crypto.createHmac('sha256', secret).update(rawString).digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(computed, 'utf-8'),
        Buffer.from(signatureHeader.replace(/^sha256=/, ''), 'utf-8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Normalizes disparate carrier JSON structures into canonical schema
   */
  public normalizePayload(
    carrier: SupportedCarrier,
    rawPayload: Record<string, any>
  ): NormalizedCarrierEvent {
    const timestamp = new Date().toISOString();
    let consignmentId = '';
    let orderId = '';
    let trackingCode = '';
    let originalStatus = '';
    let status: CanonicalParcelStatus = 'unknown';
    let collectedAmount = 0;
    let deliveryFee = 0;
    let codFee = 0;
    let returnFee = 0;
    let recipientPhone = '';
    let hubLocation = 'Dhaka Central';

    switch (carrier) {
      case 'steadfast': {
        // Steadfast Webhook payload shape
        consignmentId = String(rawPayload.consignment_id || rawPayload.id || '');
        orderId = String(rawPayload.invoice || rawPayload.order_id || '');
        trackingCode = String(rawPayload.tracking_code || consignmentId);
        originalStatus = String(rawPayload.status || '').toLowerCase();
        collectedAmount = Number(rawPayload.cod_amount || rawPayload.collected_amount || 0);
        deliveryFee = Number(rawPayload.delivery_charge || 70);
        codFee = Number(rawPayload.cod_charge || collectedAmount * 0.01);
        recipientPhone = String(rawPayload.recipient_phone || '');
        hubLocation = String(rawPayload.delivery_zone || rawPayload.district || 'Dhaka');

        if (originalStatus.includes('delivered')) status = 'delivered';
        else if (originalStatus.includes('partial')) status = 'partial_delivered';
        else if (originalStatus.includes('cancelled')) status = 'cancelled';
        else if (originalStatus.includes('return_in_transit')) status = 'return_in_transit';
        else if (originalStatus.includes('returned') || originalStatus.includes('return')) status = 'returned';
        else if (originalStatus.includes('transit') || originalStatus.includes('pickup')) status = 'in_transit';
        else if (originalStatus.includes('settled') || originalStatus.includes('paid')) status = 'settled';
        break;
      }

      case 'pathao': {
        // Pathao Courier Webhook payload shape
        consignmentId = String(rawPayload.consignment_id || rawPayload.merchant_order_id || '');
        orderId = String(rawPayload.merchant_order_id || rawPayload.order_id || '');
        trackingCode = String(rawPayload.tracking_id || rawPayload.consignment_id || '');
        originalStatus = String(rawPayload.event_type || rawPayload.order_status || '').toLowerCase();
        collectedAmount = Number(rawPayload.collected_amount || rawPayload.price || 0);
        deliveryFee = Number(rawPayload.delivery_fee || 60);
        codFee = Number(rawPayload.cod_charge || (collectedAmount > 0 ? collectedAmount * 0.01 : 0));
        recipientPhone = String(rawPayload.recipient_phone || '');
        hubLocation = String(rawPayload.recipient_city || 'Dhaka');

        if (originalStatus.includes('delivered')) status = 'delivered';
        else if (originalStatus.includes('partial')) status = 'partial_delivered';
        else if (originalStatus.includes('return_confirmed') || originalStatus.includes('returned')) status = 'returned';
        else if (originalStatus.includes('return')) status = 'return_in_transit';
        else if (originalStatus.includes('in_transit') || originalStatus.includes('pickup')) status = 'in_transit';
        else if (originalStatus.includes('payment_invoice') || originalStatus.includes('settled')) status = 'settled';
        break;
      }

      case 'redx': {
        // RedX Webhook payload shape
        consignmentId = String(rawPayload.tracking_id || rawPayload.parcel_id || '');
        orderId = String(rawPayload.customer_order_id || rawPayload.order_id || '');
        trackingCode = String(rawPayload.tracking_id || '');
        originalStatus = String(rawPayload.status || '').toLowerCase();
        collectedAmount = Number(rawPayload.cash_collection_amount || rawPayload.cash_collected || 0);
        deliveryFee = Number(rawPayload.delivery_charge || 80);
        codFee = Number(rawPayload.cod_fee || collectedAmount * 0.01);
        recipientPhone = String(rawPayload.customer_phone || '');
        hubLocation = String(rawPayload.delivery_hub || 'Dhaka');

        if (originalStatus.includes('delivered')) status = 'delivered';
        else if (originalStatus.includes('returned')) status = 'returned';
        else if (originalStatus.includes('returning')) status = 'return_in_transit';
        else if (originalStatus.includes('dispatched') || originalStatus.includes('in-transit')) status = 'in_transit';
        else if (originalStatus.includes('disbursed') || originalStatus.includes('paid')) status = 'settled';
        break;
      }

      case 'paperfly': {
        // Paperfly Webhook payload shape
        consignmentId = String(rawPayload.order_id || rawPayload.barcode || '');
        orderId = String(rawPayload.merchant_order_ref || consignmentId);
        trackingCode = String(rawPayload.barcode || consignmentId);
        originalStatus = String(rawPayload.package_status || '').toLowerCase();
        collectedAmount = Number(rawPayload.collection_amount || 0);
        deliveryFee = Number(rawPayload.shipping_cost || 65);
        codFee = Number(rawPayload.cod_cost || collectedAmount * 0.01);
        recipientPhone = String(rawPayload.customer_phone || '');
        hubLocation = String(rawPayload.thana || 'Dhaka');

        if (originalStatus.includes('successful') || originalStatus.includes('delivered')) status = 'delivered';
        else if (originalStatus.includes('partial')) status = 'partial_delivered';
        else if (originalStatus.includes('returned')) status = 'returned';
        else if (originalStatus.includes('transit')) status = 'in_transit';
        else if (originalStatus.includes('settled')) status = 'settled';
        break;
      }
    }

    const netDisbursed = Math.max(0, collectedAmount - deliveryFee - codFee - returnFee);
    const eventId = `EVT-${carrier.toUpperCase()}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    return {
      eventId,
      carrier,
      consignmentId: consignmentId || `CNS-${Date.now()}`,
      orderId: orderId || `ORD-${Date.now()}`,
      trackingCode: trackingCode || `TRK-${Date.now()}`,
      status,
      originalStatus,
      recipientPhone,
      hubLocation,
      collectedAmount,
      deliveryFee,
      codFee,
      returnFee,
      netDisbursed,
      timestamp,
      rawPayload,
    };
  }

  /**
   * Processes a normalized event, generates double-entry general ledger postings and audits discrepancies
   */
  public processEvent(event: NormalizedCarrierEvent): {
    event: NormalizedCarrierEvent;
    journalEntries: LedgerJournalEntry[];
    discrepancy?: DiscrepancyReport;
  } {
    this.events.unshift(event);
    const generatedEntries: LedgerJournalEntry[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    // Double-Entry GL Ledger Posting Logic
    if (event.status === 'delivered' || event.status === 'partial_delivered') {
      const entry: LedgerJournalEntry = {
        entryNumber: `JE-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        date: dateStr,
        description: `COD collected for Order #${event.orderId} via ${event.carrier.toUpperCase()} (${event.consignmentId})`,
        debitAccount: `1130 - Accounts Receivable: Courier COD (${event.carrier.toUpperCase()})`,
        creditAccount: `4100 - Customer Sales Revenue`,
        amount: event.collectedAmount,
        referenceConsignmentId: event.consignmentId,
      };
      this.journalEntries.push(entry);
      generatedEntries.push(entry);
    } else if (event.status === 'settled') {
      // Payout disbursement to merchant bank account
      if (event.netDisbursed > 0) {
        const bankDisbursementEntry: LedgerJournalEntry = {
          entryNumber: `JE-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          date: dateStr,
          description: `Bank Payout Received from ${event.carrier.toUpperCase()} for Consignment ${event.consignmentId}`,
          debitAccount: `1010 - Cash at Bank (bKash/BRAC Bank Commercial Account)`,
          creditAccount: `1130 - Accounts Receivable: Courier COD (${event.carrier.toUpperCase()})`,
          amount: event.netDisbursed,
          referenceConsignmentId: event.consignmentId,
        };
        this.journalEntries.push(bankDisbursementEntry);
        generatedEntries.push(bankDisbursementEntry);
      }

      // Expense recognition for courier freight fee
      if (event.deliveryFee > 0) {
        const freightExpenseEntry: LedgerJournalEntry = {
          entryNumber: `JE-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          date: dateStr,
          description: `Logistics Freight Delivery Expense for Consignment ${event.consignmentId}`,
          debitAccount: `5210 - Logistics & Shipping Freight Expense`,
          creditAccount: `1130 - Accounts Receivable: Courier COD (${event.carrier.toUpperCase()})`,
          amount: event.deliveryFee,
          referenceConsignmentId: event.consignmentId,
        };
        this.journalEntries.push(freightExpenseEntry);
        generatedEntries.push(freightExpenseEntry);
      }

      // Expense recognition for COD commission fee (typically 1%)
      if (event.codFee > 0) {
        const codCommissionEntry: LedgerJournalEntry = {
          entryNumber: `JE-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          date: dateStr,
          description: `COD Handling Collection Commission for Consignment ${event.consignmentId}`,
          debitAccount: `5220 - Courier COD Collection Commission Expense`,
          creditAccount: `1130 - Accounts Receivable: Courier COD (${event.carrier.toUpperCase()})`,
          amount: event.codFee,
          referenceConsignmentId: event.consignmentId,
        };
        this.journalEntries.push(codCommissionEntry);
        generatedEntries.push(codCommissionEntry);
      }
    } else if (event.status === 'returned') {
      const returnEntry: LedgerJournalEntry = {
        entryNumber: `JE-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        date: dateStr,
        description: `Parcel Return Adjustment for Consignment ${event.consignmentId}`,
        debitAccount: `5230 - Failed Delivery & Return Freight Expense`,
        creditAccount: `1130 - Accounts Receivable: Courier COD (${event.carrier.toUpperCase()})`,
        amount: event.deliveryFee || 50,
        referenceConsignmentId: event.consignmentId,
      };
      this.journalEntries.push(returnEntry);
      generatedEntries.push(returnEntry);
    }

    // Audit Discrepancies if any unexpected variance occurs
    let discrepancy: DiscrepancyReport | undefined;
    if (event.status === 'settled' || event.status === 'delivered') {
      const expectedNet = Math.max(0, event.collectedAmount - event.deliveryFee - event.codFee);
      if (Math.abs(expectedNet - event.netDisbursed) > 5) {
        discrepancy = this.auditVariance(
          event.consignmentId,
          expectedNet,
          event.netDisbursed,
          event.deliveryFee,
          event.codFee,
          event.carrier
        );
      }
    }

    return {
      event,
      journalEntries: generatedEntries,
      discrepancy,
    };
  }

  /**
   * Audits variance and drafts bilingual dispute letters
   */
  public auditVariance(
    consignmentId: string,
    expectedAmount: number,
    actualAmount: number,
    deliveryFee: number,
    codFee: number,
    carrier: SupportedCarrier
  ): DiscrepancyReport {
    const variance = Number((expectedAmount - actualAmount).toFixed(2));
    const discrepancyId = `DISP-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const severity: 'info' | 'warning' | 'critical' =
      variance > 500 ? 'critical' : variance > 50 ? 'warning' : 'info';

    const disputeClaimDraftBangla = `বিষয়: কনসাইনমেন্ট #${consignmentId}-এর সিওডি ডিসবার্সমেন্টে ৳${variance} টাকার গরমিল দাবি।

প্রিয় ${carrier.toUpperCase()} মার্চেন্ট সাপোর্ট টিম,
আমাদের শোধিক সিস্টেমে কনসাইনমেন্ট নং ${consignmentId}-এর মোট সিওডি আদায় ছিল ৳${expectedAmount + deliveryFee + codFee}। নিয়মমাফিক ডেলিভারি চার্জ (৳${deliveryFee}) ও সিওডি ফি (৳${codFee}) বাদে প্রদেয় নিট অর্থ ছিল ৳${expectedAmount}। কিন্তু স্টেটমেন্টে পাওয়া গেছে ৳${actualAmount}, অর্থাৎ ৳${variance} টাকা কর্তন করা হয়েছে। অনুগ্রহ করে বিস্তারিত চালানের ব্রেকডাউন প্রদান করে বকেয়া টাকা আমাদের মার্চেন্ট অ্যাকাউন্টে রিফান্ড করুন।`;

    const disputeClaimDraftEnglish = `Subject: Dispute Claim for COD Disbursement Variance (BDT ${variance}) on Consignment #${consignmentId}

Dear ${carrier.toUpperCase()} Merchant Support,
According to our automated ledger logs, Consignment #${consignmentId} was marked delivered with expected net disbursement of BDT ${expectedAmount} (after deducting BDT ${deliveryFee} freight and BDT ${codFee} COD handling). The actual disbursed amount in your invoice is BDT ${actualAmount}, creating an unexplained variance of BDT ${variance}. Please review the attached manifest and credit the delta to our registered settlement bank account.`;

    const report: DiscrepancyReport = {
      discrepancyId,
      consignmentId,
      carrier,
      expectedAmount,
      actualAmount,
      variance,
      reason: `Unexplained fee deduction or rate bracket surcharge on ${carrier.toUpperCase()} settlement`,
      disputeClaimDraftBangla,
      disputeClaimDraftEnglish,
      severity,
      createdAt: new Date().toISOString(),
    };

    this.discrepancies.unshift(report);
    return report;
  }

  /**
   * Computes holistic reconciliation metrics across all integrated couriers
   */
  public getReconciliationSummary(): ReconciliationSummary {
    let totalCollectedCod = 0;
    let totalDeliveryFees = 0;
    let totalCodFees = 0;
    let totalSettledDisbursements = 0;

    const carrierBreakdown: Record<
      SupportedCarrier,
      {
        deliveredCount: number;
        returnedCount: number;
        collectedAmount: number;
        feePaid: number;
        activeDisputes: number;
      }
    > = {
      steadfast: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
      pathao: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
      redx: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
      paperfly: { deliveredCount: 0, returnedCount: 0, collectedAmount: 0, feePaid: 0, activeDisputes: 0 },
    };

    for (const evt of this.events) {
      const brk = carrierBreakdown[evt.carrier];
      if (evt.status === 'delivered' || evt.status === 'partial_delivered') {
        brk.deliveredCount += 1;
        brk.collectedAmount += evt.collectedAmount;
        totalCollectedCod += evt.collectedAmount;
      } else if (evt.status === 'returned') {
        brk.returnedCount += 1;
      }

      if (evt.status === 'settled') {
        totalSettledDisbursements += evt.netDisbursed;
        totalDeliveryFees += evt.deliveryFee;
        totalCodFees += evt.codFee;
        brk.feePaid += evt.deliveryFee + evt.codFee;
      }
    }

    for (const disp of this.discrepancies) {
      if (carrierBreakdown[disp.carrier]) {
        carrierBreakdown[disp.carrier].activeDisputes += 1;
      }
    }

    const pendingReceivables = Math.max(
      0,
      totalCollectedCod - (totalSettledDisbursements + totalDeliveryFees + totalCodFees)
    );
    const totalDiscrepancyAmount = this.discrepancies.reduce((acc, d) => acc + d.variance, 0);

    return {
      totalEvents: this.events.length,
      totalCollectedCod,
      totalDeliveryFees,
      totalCodFees,
      totalSettledDisbursements,
      pendingReceivables,
      activeDiscrepanciesCount: this.discrepancies.length,
      totalDiscrepancyAmount,
      carrierBreakdown,
    };
  }

  public getEvents(filter?: { carrier?: SupportedCarrier; status?: CanonicalParcelStatus }): NormalizedCarrierEvent[] {
    if (!filter) return this.events;
    return this.events.filter((e) => {
      if (filter.carrier && e.carrier !== filter.carrier) return false;
      if (filter.status && e.status !== filter.status) return false;
      return true;
    });
  }

  public getJournalEntries(): LedgerJournalEntry[] {
    return this.journalEntries;
  }

  public getDiscrepancies(): DiscrepancyReport[] {
    return this.discrepancies;
  }

  public resetMemoryStore(): void {
    this.events = [];
    this.journalEntries = [];
    this.discrepancies = [];
  }
}

export const multiCarrierWebhookEngine = new MultiCarrierWebhookEngine();
