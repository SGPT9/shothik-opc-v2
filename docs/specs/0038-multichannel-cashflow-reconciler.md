# Spec 0038: Autonomous Multi-Channel Cashflow & COD Settlement Reconciler

## Overview
Bangladeshi One-Person Companies (OPCs) face fragmented cashflow delays and hidden margin leakage across multiple payment and logistics channels:
- **Cash on Delivery (COD) In-Transit Receivables**: Steadfast and Pathao hold funds for 3-7 days before periodic bank/bKash disbursement, deducting delivery fees and 1% COD collection commission.
- **RTO (Return to Origin) Losses**: When customers reject COD parcels, merchants lose both forward and return freight costs (৳100–৳160/parcel), which directly erodes net profits if not tracked per unit.
- **MFS Processing Fees**: bKash Merchant accounts charge 1.50% and Nagad Sheba charges 1.20% on incoming gross transactions.
- **Working Capital & Inventory Restocking Runway**: Merchants struggle to forecast how many days of inventory replenishment and ad spend they can fund before their cash runs out.

Slice 38 introduces the **Autonomous Multi-Channel Cashflow & COD Settlement Reconciler**, offering real-time liquidity aggregation, carrier settlement manifest reconciliation, automated RTO loss absorption, carrier underpayment auditing, and predictive 30-day working capital runway forecasting.

---

## Acceptance Criteria

### AC-1: Multi-Channel Liquid Balance Aggregator
- Real-time consolidation across all OPC monetary channels:
  - bKash Merchant Wallet (`017XXXXXXXX` - Live Balance & 1.5% settlement reserve)
  - Nagad Sheba Merchant Wallet (`018XXXXXXXX` - Live Balance & 1.2% fee deduction)
  - Commercial Bank Account (e.g. City Bank / BRAC Bank / Eastern Bank PLC)
  - In-Transit Courier COD Receivables (Steadfast + Pathao pending disbursements)
  - Supplier Payable Liabilities (e.g. 1688 / Taobao / Nilkhet POD / Local Wholesale)

### AC-2: Courier Settlement Manifest Reconciler
- Ingestion and matching of carrier settlement payment batches:
  - Gross COD collected per tracking number
  - (-) Base Delivery Freight (৳60 inside Dhaka, ৳100-150 outside Dhaka)
  - (-) 1% COD Collection Fee
  - (-) RTO Return Penalty on failed consignments
  - (=) Net Bank/bKash Disbursed Payout
- Automatic cross-referencing against booked consignments to detect underpayments or weight overcharges.

### AC-3: True Real-Time Unit Economics & Daily Net PnL Waterfall
- Granular daily PnL breakdown:
  - Gross Delivered Revenue
  - (-) Cost of Goods Sold (COGS)
  - (-) Courier Delivery & COD Fees
  - (-) RTO Failed Delivery Freight Loss ($N_{\text{returned}} \times \text{Return Penalty}$)
  - (-) MFS Gateway Fees (1.5% bKash / 1.2% Nagad)
  - (-) Ad Spend & Packaging Overheads
  - (=) Net Realized Operating Cashflow & Margin %.

### AC-4: Discrepancy Auditor & Underpayment Claim Generator
- Flags discrepancies between expected COD vs. carrier settlement payout.
- One-click claim brief generator for disputed weight adjustments or unremitted parcels.

### AC-5: 30-Day Working Capital Runway & Liquidity Burn Predictor
- Calculates daily net burn/inflow rate.
- Projects working capital runway (in days) based on liquid cash + in-transit receivables vs. scheduled supplier payables and ad spend.

### AC-6: Express API Endpoints (`/api/v1/cashflow/*`)
- `GET /api/v1/cashflow/summary`: Unified liquid balances across wallets, banks, and courier in-transit funds.
- `POST /api/v1/cashflow/reconcile-batch`: Upload and reconcile carrier settlement manifests.
- `GET /api/v1/cashflow/daily-pnl`: Real-time daily PnL waterfall with RTO margin leakage metrics.
- `GET /api/v1/cashflow/discrepancies`: List carrier underpayment flags and claims.
- `GET /api/v1/cashflow/runway-forecast`: 30-day working capital runway projections.

### AC-7: Frontend Studio Modal (`MultiChannelCashflowModal.tsx`) & Twin Integration
- Interactive Twin Studio modal accessible via `⌘M` / `Ctrl+M` shortcut.
- Visual channel cards, settlement reconciler simulator, daily PnL waterfall, discrepancy auditor, and 30-day runway chart.
- Full integration into `TwinCommandPalette.tsx` and `twin/page.tsx`.

---

## Technical Design

### Data Structures
```typescript
export interface ChannelBalance {
  channelId: 'bkash_merchant' | 'nagad_sheba' | 'bank_city' | 'steadfast_transit' | 'pathao_transit';
  channelName: string;
  accountNumber: string;
  currency: 'BDT';
  currentBalanceBdt: number;
  pendingReceivableBdt: number;
  settlementFeePercent: number;
  lastUpdated: string;
}

export interface CourierSettlementBatch {
  batchId: string;
  carrier: 'steadfast' | 'pathao' | 'redx' | 'paperfly';
  settlementDate: string;
  totalConsignments: number;
  grossCodCollectedBdt: number;
  deliveryFeesDeductedBdt: number;
  codCommissionDeductedBdt: number;
  rtoReturnFeesDeductedBdt: number;
  netPayoutBdt: number;
  status: 'reconciled' | 'discrepancy_detected' | 'pending_disbursement';
}

export interface DailyPnLSummary {
  date: string;
  grossDeliveredRevenueBdt: number;
  cogsBdt: number;
  courierDeliveryFeesBdt: number;
  codCommissionFeesBdt: number;
  rtoFreightLossBdt: number;
  mfsProcessingFeesBdt: number;
  adSpendBdt: number;
  packagingCostBdt: number;
  netOperatingProfitBdt: number;
  netMarginPercent: number;
  deliveredOrdersCount: number;
  returnedOrdersCount: number;
  rtoRatePercent: number;
}
```
