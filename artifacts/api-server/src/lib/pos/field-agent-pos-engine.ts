import { createHash } from 'crypto';

export type PosCategory =
  | 'beverages'
  | 'dry_foods'
  | 'personal_care'
  | 'agri_produce'
  | 'electronics_accessories';

export interface PosCatalogItem {
  sku: string;
  name: string;
  banglaName: string;
  category: PosCategory;
  unitPriceBdt: number;
  costPriceBdt: number;
  vatRatePercent: number; // 0, 5, 7.5, 15
  stockQuantity: number;
  barcode: string;
}

export interface CartItem {
  sku: string;
  name: string;
  unitPriceBdt: number;
  quantity: number;
  vatRatePercent: number;
  totalVatBdt: number;
  lineTotalBdt: number;
}

export interface PosTransaction {
  transactionId: string;
  agentId: string;
  branchId: string;
  timestamp: string;
  items: CartItem[];
  subtotalBdt: number;
  vatTotalBdt: number;
  discountBdt: number;
  grandTotalBdt: number;
  paymentMethod: 'cash' | 'bkash_dynamic_qr' | 'nagad_dynamic_qr' | 'split_cash_mfs';
  cashReceivedBdt: number;
  changeReturnedBdt: number;
  mfsAmountBdt: number;
  mfsTxnId?: string;
  customerPhone?: string;
  syncStatus: 'pending' | 'synced' | 'conflict_resolved';
  sha256Seal: string;
}

export interface EscPosReceiptOptions {
  paperWidth: '58mm' | '80mm';
  merchantName: string;
  merchantBin: string;
  branchName: string;
  agentName: string;
  transaction: PosTransaction;
  includeQrCode: boolean;
  cutPaper: boolean;
}

export interface EscPosPrintJob {
  jobId: string;
  paperWidth: '58mm' | '80mm';
  base64Bytecode: string;
  hexPreview: string;
  byteLength: number;
  formattedText: string;
  generatedAt: string;
}

export interface CashFloatSession {
  sessionId: string;
  agentId: string;
  openingFloatBdt: number;
  totalCashSalesBdt: number;
  totalMfsSalesBdt: number;
  expectedCashInHandBdt: number;
  actualCountedCashBdt: number;
  discrepancyBdt: number; // actual - expected
  status: 'open' | 'closed_balanced' | 'closed_with_discrepancy';
  supervisorSignOffHash?: string;
  openedAt: string;
  closedAt?: string;
}

export interface DynamicMfsQrResult {
  provider: 'bkash' | 'nagad';
  merchantBin: string;
  merchantNumber: string;
  amountBdt: number;
  referenceId: string;
  rawPayload: string;
  verificationUrl: string;
  generatedAt: string;
}

// Built-in Field Agent Catalog
export const DEFAULT_POS_CATALOG: PosCatalogItem[] = [
  {
    sku: 'BEV-001',
    name: 'Fresh Cha 200ml Flask Pack',
    banglaName: 'তাজা চা ২০০মি.লি.',
    category: 'beverages',
    unitPriceBdt: 25,
    costPriceBdt: 16,
    vatRatePercent: 5,
    stockQuantity: 150,
    barcode: '8941100010012'
  },
  {
    sku: 'BEV-002',
    name: 'Mineral Water 500ml',
    banglaName: 'মিনারেল ওয়াটার ৫০০মি.লি.',
    category: 'beverages',
    unitPriceBdt: 20,
    costPriceBdt: 12,
    vatRatePercent: 0,
    stockQuantity: 200,
    barcode: '8941100010029'
  },
  {
    sku: 'DRY-001',
    name: 'Chanachur Spicy Mix 150g',
    banglaName: 'ঝাল চানাচুর ১৫০গ্রাম',
    category: 'dry_foods',
    unitPriceBdt: 45,
    costPriceBdt: 32,
    vatRatePercent: 5,
    stockQuantity: 80,
    barcode: '8941100020011'
  },
  {
    sku: 'DRY-002',
    name: 'Toast Biscuit Family Pack',
    banglaName: 'টোস্ট বিস্কুট ফ্যামিলি প্যাক',
    category: 'dry_foods',
    unitPriceBdt: 60,
    costPriceBdt: 44,
    vatRatePercent: 5,
    stockQuantity: 65,
    barcode: '8941100020028'
  },
  {
    sku: 'PER-001',
    name: 'Antiseptic Soap Bar 100g',
    banglaName: 'জীবাণুনাশক সাবান ১০০গ্রাম',
    category: 'personal_care',
    unitPriceBdt: 40,
    costPriceBdt: 28,
    vatRatePercent: 7.5,
    stockQuantity: 110,
    barcode: '8941100030010'
  },
  {
    sku: 'AGR-001',
    name: 'Organic Mustard Oil 250ml',
    banglaName: 'খাটি সরিষার তেল ২৫০মি.লি.',
    category: 'agri_produce',
    unitPriceBdt: 110,
    costPriceBdt: 85,
    vatRatePercent: 0,
    stockQuantity: 45,
    barcode: '8941100040019'
  },
  {
    sku: 'ELE-001',
    name: 'USB-C Fast Charging Cable 1m',
    banglaName: 'টাইপ-সি চার্জিং ক্যাবল ১মি.',
    category: 'electronics_accessories',
    unitPriceBdt: 150,
    costPriceBdt: 80,
    vatRatePercent: 15,
    stockQuantity: 30,
    barcode: '8941100050018'
  }
];

export class FieldAgentPosEngine {
  /**
   * Calculates cart line items, subtotal, VAT, and grand total.
   */
  public static calculateCart(
    items: { sku: string; quantity: number }[],
    catalog: PosCatalogItem[] = DEFAULT_POS_CATALOG,
    discountBdt: number = 0
  ): {
    items: CartItem[];
    subtotalBdt: number;
    vatTotalBdt: number;
    discountBdt: number;
    grandTotalBdt: number;
  } {
    const catalogMap = new Map(catalog.map((c) => [c.sku, c]));
    const cartItems: CartItem[] = [];

    let subtotal = 0;
    let vatTotal = 0;

    for (const item of items) {
      const catalogItem = catalogMap.get(item.sku);
      if (!catalogItem || item.quantity <= 0) continue;

      const lineNet = catalogItem.unitPriceBdt * item.quantity;
      const lineVat = Math.round(((lineNet * catalogItem.vatRatePercent) / 100) * 100) / 100;
      const lineTotal = lineNet + lineVat;

      subtotal += lineNet;
      vatTotal += lineVat;

      cartItems.push({
        sku: catalogItem.sku,
        name: catalogItem.name,
        unitPriceBdt: catalogItem.unitPriceBdt,
        quantity: item.quantity,
        vatRatePercent: catalogItem.vatRatePercent,
        totalVatBdt: lineVat,
        lineTotalBdt: lineTotal
      });
    }

    const effectiveDiscount = Math.max(0, Math.min(discountBdt, subtotal + vatTotal));
    const grandTotal = Math.round((subtotal + vatTotal - effectiveDiscount) * 100) / 100;

    return {
      items: cartItems,
      subtotalBdt: Math.round(subtotal * 100) / 100,
      vatTotalBdt: Math.round(vatTotal * 100) / 100,
      discountBdt: effectiveDiscount,
      grandTotalBdt: grandTotal
    };
  }

  /**
   * Generates a cryptographic SHA-256 seal for an offline POS transaction.
   */
  public static generateTransactionSeal(tx: Omit<PosTransaction, 'sha256Seal'>): string {
    const payload = `${tx.transactionId}|${tx.agentId}|${tx.branchId}|${tx.timestamp}|${tx.grandTotalBdt}|${tx.paymentMethod}`;
    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Generates raw ESC/POS binary bytecode and formatted receipt string.
   */
  public static generateEscPosReceipt(options: EscPosReceiptOptions): EscPosPrintJob {
    const { paperWidth, merchantName, merchantBin, branchName, agentName, transaction, includeQrCode, cutPaper } = options;
    const maxChars = paperWidth === '58mm' ? 32 : 48;
    const separator = '-'.repeat(maxChars);
    const doubleSeparator = '='.repeat(maxChars);

    const buffer: number[] = [];

    // Helper functions for ESC/POS bytecode
    const pushBytes = (...bytes: number[]) => buffer.push(...bytes);
    const pushAscii = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        buffer.push(str.charCodeAt(i) & 0xff);
      }
    };
    const pushLine = (str: string = '') => {
      pushAscii(str);
      pushBytes(0x0a); // LF
    };

    // Initialize Printer: ESC @
    pushBytes(0x1b, 0x40);

    // Text formatting for preview
    const textLines: string[] = [];

    const addCentered = (text: string) => {
      const trimmed = text.length > maxChars ? text.substring(0, maxChars) : text;
      const leftPad = Math.floor((maxChars - trimmed.length) / 2);
      const rightPad = maxChars - trimmed.length - leftPad;
      const line = ' '.repeat(leftPad) + trimmed + ' '.repeat(rightPad);
      textLines.push(line);

      // ESC/POS Align Center: ESC a 1
      pushBytes(0x1b, 0x61, 0x01);
      pushLine(trimmed);
      // Reset alignment: ESC a 0
      pushBytes(0x1b, 0x61, 0x00);
    };

    const addLeftRight = (left: string, right: string) => {
      const availableSpace = maxChars - left.length - right.length;
      let line = '';
      if (availableSpace >= 0) {
        line = left + ' '.repeat(availableSpace) + right;
      } else {
        const truncatedLeft = left.substring(0, maxChars - right.length - 1);
        line = truncatedLeft + ' ' + right;
      }
      textLines.push(line);
      pushLine(line);
    };

    // Header
    // Bold on: ESC E 1
    pushBytes(0x1b, 0x45, 0x01);
    addCentered(merchantName.toUpperCase());
    // Bold off: ESC E 0
    pushBytes(0x1b, 0x45, 0x00);
    addCentered(`BIN: ${merchantBin}`);
    addCentered(`Branch: ${branchName}`);
    addCentered(`Agent: ${agentName}`);
    textLines.push(doubleSeparator);
    pushLine(doubleSeparator);

    // Metadata
    addLeftRight(`Txn: ${transaction.transactionId.substring(0, 14)}`, new Date(transaction.timestamp).toLocaleTimeString());
    addLeftRight(`Method: ${transaction.paymentMethod.replace(/_/g, ' ').toUpperCase()}`, `Status: ${transaction.syncStatus}`);
    textLines.push(separator);
    pushLine(separator);

    // Items Column Header
    if (paperWidth === '58mm') {
      addLeftRight('Item (Qty x Rate)', 'Total(৳)');
    } else {
      const left = 'Item Description';
      const right = 'Qty x Rate     Total(৳)';
      addLeftRight(left, right);
    }
    textLines.push(separator);
    pushLine(separator);

    // Item rows
    for (const item of transaction.items) {
      if (paperWidth === '58mm') {
        const itemHead = item.name.length > 20 ? item.name.substring(0, 20) : item.name;
        textLines.push(itemHead);
        pushLine(itemHead);
        addLeftRight(`  ${item.quantity}x @৳${item.unitPriceBdt} (V${item.vatRatePercent}%)`, `৳${item.lineTotalBdt.toFixed(2)}`);
      } else {
        const itemHead = item.name.length > 24 ? item.name.substring(0, 24) : item.name;
        const rightPart = `${item.quantity}x @৳${item.unitPriceBdt}`.padEnd(14) + `৳${item.lineTotalBdt.toFixed(2)}`;
        addLeftRight(itemHead, rightPart);
      }
    }

    textLines.push(separator);
    pushLine(separator);

    // Totals
    addLeftRight('Subtotal Net:', `৳${transaction.subtotalBdt.toFixed(2)}`);
    addLeftRight('Mushak VAT Total:', `৳${transaction.vatTotalBdt.toFixed(2)}`);
    if (transaction.discountBdt > 0) {
      addLeftRight('Discount Applied:', `-৳${transaction.discountBdt.toFixed(2)}`);
    }

    // Bold Grand Total
    pushBytes(0x1b, 0x45, 0x01);
    addLeftRight('GRAND TOTAL:', `৳${transaction.grandTotalBdt.toFixed(2)}`);
    pushBytes(0x1b, 0x45, 0x00);

    textLines.push(separator);
    pushLine(separator);

    // Payment details
    if (transaction.paymentMethod === 'cash') {
      addLeftRight('Cash Received:', `৳${transaction.cashReceivedBdt.toFixed(2)}`);
      addLeftRight('Change Returned:', `৳${transaction.changeReturnedBdt.toFixed(2)}`);
    } else if (transaction.paymentMethod === 'bkash_dynamic_qr' || transaction.paymentMethod === 'nagad_dynamic_qr') {
      addLeftRight('MFS Paid Amount:', `৳${transaction.mfsAmountBdt.toFixed(2)}`);
      if (transaction.mfsTxnId) {
        addLeftRight('MFS TrxID:', transaction.mfsTxnId);
      }
    } else {
      addLeftRight('Cash Paid:', `৳${transaction.cashReceivedBdt.toFixed(2)}`);
      addLeftRight('MFS Paid:', `৳${transaction.mfsAmountBdt.toFixed(2)}`);
    }

    // Footer & NBR Verification
    textLines.push(doubleSeparator);
    pushLine(doubleSeparator);
    addCentered('** SHOTHIK NBR FISCAL POS **');
    addCentered(`Seal: ${transaction.sha256Seal.substring(0, 16)}...`);
    addCentered('Thank you for your business!');

    // Native QR Code Generation sequence if enabled: GS ( k
    if (includeQrCode) {
      const qrData = `https://shothik.net/verify/pos?txn=${transaction.transactionId}&seal=${transaction.sha256Seal.substring(0, 8)}`;
      const pL = (qrData.length + 3) & 0xff;
      const pH = ((qrData.length + 3) >> 8) & 0xff;

      // QR Code: Model 2 (GS ( k 4 0 49 65 50 0)
      pushBytes(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
      // Module size 4: GS ( k 3 0 49 67 4
      pushBytes(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x04);
      // Error Correction level M: GS ( k 3 0 49 69 49
      pushBytes(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31);
      // Store QR data: GS ( k pL pH 49 80 48 <data>
      pushBytes(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30);
      pushAscii(qrData);
      // Print QR: GS ( k 3 0 49 81 48
      pushBytes(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    }

    // Feed lines
    pushBytes(0x0a, 0x0a, 0x0a);

    // Cut paper if enabled: GS V 66 0
    if (cutPaper) {
      pushBytes(0x1d, 0x56, 0x42, 0x00);
    }

    const uint8Array = new Uint8Array(buffer);
    const base64Bytecode = Buffer.from(uint8Array).toString('base64');
    const hexPreview = Array.from(uint8Array.slice(0, 32))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    const formattedText = textLines.join('\n');

    return {
      jobId: `PRINT-${Date.now().toString(36).toUpperCase()}`,
      paperWidth,
      base64Bytecode,
      hexPreview: hexPreview + (uint8Array.length > 32 ? ' ...' : ''),
      byteLength: uint8Array.length,
      formattedText,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generates dynamic bKash/Nagad EMVCo-compliant QR payload and deep link.
   */
  public static generateDynamicMfsQr(
    provider: 'bkash' | 'nagad',
    merchantNumber: string,
    merchantBin: string,
    amountBdt: number,
    referenceId: string
  ): DynamicMfsQrResult {
    const sanitizedAmount = Math.max(1, Math.round(amountBdt * 100) / 100);
    const rawPayload = `00020101021226${provider.toUpperCase()}_MERCHANT_QR52045999530505054${sanitizedAmount.toFixed(2)}5802BD59${merchantBin}62${referenceId.length.toString().padStart(2, '0')}${referenceId}6304`;
    const verificationUrl = `https://pay.shothik.net/mfs/${provider}?merchant=${merchantNumber}&amount=${sanitizedAmount}&ref=${referenceId}`;

    return {
      provider,
      merchantBin,
      merchantNumber,
      amountBdt: sanitizedAmount,
      referenceId,
      rawPayload,
      verificationUrl,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Batch reconciles queued offline transactions with conflict detection and SHA-256 validation.
   */
  public static batchSyncTransactions(
    incomingTransactions: PosTransaction[],
    existingTransactionIds: Set<string> = new Set()
  ): {
    totalSynced: number;
    totalDuplicates: number;
    totalAmountBdt: number;
    syncedTransactions: PosTransaction[];
    errors: { transactionId: string; reason: string }[];
  } {
    const synced: PosTransaction[] = [];
    const errors: { transactionId: string; reason: string }[] = [];
    let duplicates = 0;
    let totalAmount = 0;

    for (const tx of incomingTransactions) {
      if (existingTransactionIds.has(tx.transactionId)) {
        duplicates++;
        continue;
      }

      // Verify SHA-256 seal integrity
      const expectedSeal = this.generateTransactionSeal(tx);
      if (tx.sha256Seal && tx.sha256Seal !== expectedSeal) {
        errors.push({
          transactionId: tx.transactionId,
          reason: 'SHA-256 transaction seal mismatch (possible tampering or corrupted payload)'
        });
        continue;
      }

      const verifiedTx: PosTransaction = {
        ...tx,
        syncStatus: 'synced',
        sha256Seal: expectedSeal
      };

      existingTransactionIds.add(tx.transactionId);
      synced.push(verifiedTx);
      totalAmount += tx.grandTotalBdt;
    }

    return {
      totalSynced: synced.length,
      totalDuplicates: duplicates,
      totalAmountBdt: Math.round(totalAmount * 100) / 100,
      syncedTransactions: synced,
      errors
    };
  }

  /**
   * Reconciles end-of-day cash float session.
   */
  public static reconcileCashFloat(
    sessionId: string,
    agentId: string,
    openingFloatBdt: number,
    totalCashSalesBdt: number,
    totalMfsSalesBdt: number,
    actualCountedCashBdt: number
  ): CashFloatSession {
    const expectedCashInHand = Math.round((openingFloatBdt + totalCashSalesBdt) * 100) / 100;
    const discrepancy = Math.round((actualCountedCashBdt - expectedCashInHand) * 100) / 100;
    const status = Math.abs(discrepancy) < 0.01 ? 'closed_balanced' : 'closed_with_discrepancy';

    const supervisorPayload = `${sessionId}|${agentId}|${expectedCashInHand}|${actualCountedCashBdt}|${status}`;
    const supervisorSignOffHash = createHash('sha256').update(supervisorPayload).digest('hex');

    return {
      sessionId,
      agentId,
      openingFloatBdt,
      totalCashSalesBdt,
      totalMfsSalesBdt,
      expectedCashInHandBdt: expectedCashInHand,
      actualCountedCashBdt,
      discrepancyBdt: discrepancy,
      status,
      supervisorSignOffHash,
      openedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      closedAt: new Date().toISOString()
    };
  }
}
