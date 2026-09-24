# Spec 0041: Autonomous Micro-Franchise Field Agent POS & Offline Bluetooth Thermal Print Engine

## Problem Statement
Micro-franchise roadside pop-ups, van sellers, and rural field sales agents in Bangladesh face significant operational hurdles when conducting transactions:
1. **Intermittent Rural Connectivity**: 3G/4G network dropouts in peri-urban and haor/char regions cause cloud-only POS systems to freeze or drop checkout flows, resulting in lost sales and merchant frustration.
2. **Thermal Receipt Generation**: Field agents use portable battery-powered 58mm and 80mm Bluetooth thermal printers (ESC/POS protocol). Existing web apps lack client-side raw ESC/POS byte-level command formatting, barcode rendering, and dynamic QR encoding.
3. **MFS Dynamic QR Payments**: Manual typing of merchant bKash/Nagad personal/merchant numbers leads to typos and slow queue clearance. Instant dynamic QR codes with exact transaction amount and merchant reference accelerate roadside checkout.
4. **Offline Conflict Resolution & Float Reconciliation**: When offline sales sync back to the cloud, order IDs, inventory deductions, and cash float balances must reconcile deterministically without double-charging or data loss.

## Solution Architecture
An offline-first field agent POS and Bluetooth thermal printing engine providing:
1. **Catalog & Cart Management**: Fast search, category filtering, barcode scanning simulation, quantity adjustments, and automated Mushak tax calculation.
2. **Offline-First Transaction & CRDT Ledger**: Local-first transaction queue with unique client UUIDs, vector clocks, SHA-256 cryptographic verification seals, and sync state tracking (`pending`, `synced`, `conflict_resolved`).
3. **ESC/POS Thermal Print Command Engine**: Generates raw 58mm & 80mm ESC/POS command sequences (hex/base64 bytecode) including printer initialization (`ESC @`), text alignment (`ESC a`), bolding (`ESC E`), tabular line items, feed & cut (`GS V`), and native QR/Barcode generation (`GS ( k` / `GS k`).
4. **Dynamic bKash / Nagad EMVCo QR Code Engine**: Generates standardized payment QR payloads containing Merchant BIN, transaction reference, dynamic amount in BDT, and instant verification URL.
5. **Cash Float & End-of-Day Tally Reconciler**: Opening cash float entry, cash vs. MFS collection segregation, expected cash-in-hand vs. counted cash discrepancy calculation, and supervisor sign-off seal.
6. **Field Agent POS Studio UI (`FieldAgentPosModal.tsx`)**: 5-tab responsive control center with keyboard shortcut `⌘P` / `Ctrl+P` in Twin Command Palette.

## Data Structures & Interfaces
```typescript
export interface PosCatalogItem {
  sku: string;
  name: string;
  banglaName: string;
  category: 'beverages' | 'dry_foods' | 'personal_care' | 'agri_produce' | 'electronics_accessories';
  unitPriceBdt: number;
  costPriceBdt: number;
  vatRatePercent: number; // 0%, 5%, 7.5%, 15%
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
```

## API Endpoints
- `GET /api/v1/pos/catalog`: Fetch field catalog items with prices and VAT rates.
- `POST /api/v1/pos/receipt/escpos`: Generate raw 58mm/80mm ESC/POS bytecode and hex stream for Bluetooth thermal printer.
- `POST /api/v1/pos/qr/dynamic`: Generate dynamic bKash/Nagad EMVCo QR code payload and verification string.
- `POST /api/v1/pos/transactions/sync`: Batch synchronize queued offline transactions with conflict detection and SHA-256 validation.
- `POST /api/v1/pos/float/reconcile`: Calculate end-of-day cash float tally, discrepancy, and supervisor cryptographic seal.
- `GET /api/v1/pos/metrics`: Summary of offline queue length, total daily volume, and agent performance.

## Acceptance Criteria
1. Backend engine compiles ESC/POS bytecode (58mm and 80mm) with valid binary control codes (`ESC @`, `ESC a`, `GS V`, `GS ( k`).
2. Dynamic QR generation complies with standard bKash/Nagad merchant parameters and includes exact transaction totals.
3. Offline sync reconciles batch transactions, validates SHA-256 cryptographic seals, and identifies duplicate transaction IDs.
4. Float reconciliation calculates cash discrepancy and issues supervisor seal.
5. 100% unit and integration test coverage across `@workspace/api-server` and `@workspace/shothik`.
