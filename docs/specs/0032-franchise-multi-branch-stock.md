# 🏢 Spec 0032: Multi-Tenant Franchise & Multi-Branch Stock Allocation Engine

**Status**: Approved & Active  
**Monorepo Package**: `@workspace/api-server`, `@workspace/shothik`  
**Governing Standard**: Multi-Branch Inventory Distribution, Commission Splits (Royalty + Franchisee Margin), Inter-Branch Stock Transfers (IBST), and bKash Sub-Merchant Settlements  

---

## 1. Executive Summary & Problem Context

As Bangladeshi One-Person Companies (OPCs) and solo retail brands scale beyond a single fulfillment hub into multi-location franchise outlets (e.g. Dhanmondi, Banani, Mirpur, Chittagong GEC, Sylhet Zindabazar), they encounter severe logistical and accounting friction:
1. **Inventory Fragmentation**: Out-of-stock in one branch while excess dead stock accumulates in another, without automated inter-branch transfers (IBST).
2. **Opaque Commission Splits**: Disputed monthly franchisee payout calculations between the master brand owner (royalty %, COGS replenishment) and the local outlet operator (operating margin %).
3. **Decentralized Payment Collection vs Central Settlement**: Local walk-in POS or regional COD deliveries collected into separate sub-merchant bKash wallets requiring automated daily reconciliation.

Spec 0032 implements a deterministic Multi-Tenant Franchise & Multi-Branch Stock Allocation Engine providing:
- Real-time stock matrix across all franchise nodes.
- Automated inter-branch transfer workflow with transit verification codes.
- Deterministic 3-way commission split engine ($\text{COGS} + \text{Central Royalty} + \text{Franchisee Net Margin}$).
- Decentralized bKash sub-merchant payout ledger.

---

## 2. Commission Split & Royalty Mathematical Model

For every franchise sale:
$$\text{Gross Sale Value (BDT)} = \text{Unit Selling Price} \times \text{Quantity}$$
$$\text{COGS Replenishment (Central)} = \text{Unit Cost Price} \times \text{Quantity}$$
$$\text{Gross Profit} = \text{Gross Sale Value} - \text{COGS Replenishment}$$
$$\text{Master Brand Royalty (BDT)} = \text{Gross Profit} \times \text{Royalty Rate (e.g. 15\%)}$$
$$\text{Franchisee Net Profit (BDT)} = \text{Gross Profit} - \text{Master Brand Royalty}$$

### Example Breakdown:
- Item: Premium Silk Panjabi (Selling Price: ৳3,500, COGS: ৳1,800, Gross Profit: ৳1,700)
- Royalty Rate: 15%
- COGS to Central Hub: **৳1,800**
- Master Brand Royalty: $1,700 \times 0.15 =$ **৳255**
- Franchisee Net Profit: $1,700 - 255 =$ **৳1,445**

---

## 3. High-Velocity Franchise Node Hierarchy

| Node ID | Branch Name & Territory | Type | Manager / Lead | bKash Sub-Merchant Wallet | Default Royalty |
|:---|:---|:---:|:---|:---:|:---:|
| `BRANCH_DHK_CENTRAL` | Tejgaon Central Fulfillment Hub | Central Hub | Master Ops | `+8801700000001` | 0% (Owner) |
| `BRANCH_DHK_DHANMONDI` | Dhanmondi 27 Outlet | Franchisee | Tanvir Hossain | `+8801711223344` | 15% |
| `BRANCH_DHK_BANANI` | Banani Road 11 Boutique | Franchisee | Nusrat Jahan | `+8801822334455` | 18% |
| `BRANCH_DHK_UTTARA` | Uttara Sector 3 Flagship | Franchisee | Rafiqul Islam | `+8801933445566` | 15% |
| `BRANCH_CTG_GEC` | Chittagong GEC Circle Node | Regional Hub | Farhan Karim | `+8801844556677` | 12% |
| `BRANCH_SYL_ZINDA` | Sylhet Zindabazar Outlet | Franchisee | Mahbub Alom | `+8801755667788` | 12% |

---

## 4. Architectural Implementation & Data Contracts

### 4.1 Data Schema (`lib/franchise/types.ts`)

```typescript
export type BranchType = "central_hub" | "franchise_outlet" | "regional_warehouse" | "pop_up";

export interface FranchiseBranch {
  branchId: string;
  branchName: string;
  territory: string;
  address: string;
  type: BranchType;
  managerName: string;
  managerPhone: string;
  subMerchantWallet: string; // bKash / Nagad merchant number
  royaltyRatePct: number; // e.g. 15 for 15%
  status: "active" | "inactive" | "suspended";
  stockHoldings: Record<string, number>; // sku -> quantity
  totalSalesVolumeBdt: number;
  totalRoyaltyOwedBdt: number;
  totalRoyaltyPaidBdt: number;
}

export interface InterBranchTransfer {
  transferId: string;
  sku: string;
  productName: string;
  quantity: number;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  status: "pending_dispatch" | "in_transit" | "received" | "rejected";
  courierProvider?: "internal_van" | "steadfast" | "pathao_courier";
  trackingCode?: string;
  verificationCode: string;
  initiatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface FranchiseSaleRecord {
  saleId: string;
  branchId: string;
  branchName: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCostPriceBdt: number;
  unitSellingPriceBdt: number;
  grossTotalBdt: number;
  cogsTotalBdt: number;
  grossProfitBdt: number;
  masterRoyaltyBdt: number;
  franchiseeNetProfitBdt: number;
  paymentMethod: "cash_pos" | "bkash_sub_merchant" | "nagad" | "card";
  recordedAt: string;
}
```

---

## 5. API Routes

| HTTP Verb | Path | Description |
|:---|:---|:---|
| `GET` | `/api/v1/franchise/branches` | Lists all franchise branches and their live stock holdings |
| `POST` | `/api/v1/franchise/branches/create` | Registers a new franchise outlet node |
| `POST` | `/api/v1/franchise/sales/record` | Ingests a sale, executes 3-way commission split, and updates stock |
| `GET` | `/api/v1/franchise/sales/ledger` | Returns sales records and royalty settlement breakdown |
| `POST` | `/api/v1/franchise/transfers/initiate` | Initiates an Inter-Branch Stock Transfer (IBST) |
| `POST` | `/api/v1/franchise/transfers/receive` | Verifies and receives transit stock into destination branch |
| `GET` | `/api/v1/franchise/transfers` | Lists active and historical stock transfers |
| `POST` | `/api/v1/franchise/settlement/disburse` | Disburses bKash sub-merchant royalty payout |

---

## 6. Frontend Twin Integration

- **Component**: `artifacts/shothik/src/components/twin/FranchiseMultiBranchModal.tsx`
- **Keyboard Shortcut**: `⌘M` or `Ctrl+M` (Multi-Branch & Franchise)
- **Tabs**:
  1. **Branch Stock Matrix**: Multi-outlet live inventory grid with low-stock warnings and quick-transfer actions.
  2. **Commission Split Ledger**: Sales journal with deterministic breakdown ($\text{COGS} + \text{Royalty} + \text{Franchisee Net}$).
  3. **Inter-Branch Transfers (IBST)**: Active stock transit tracker with verification code reception.
  4. **Sub-Merchant Payouts**: bKash wallet disbursement console with 1-click settlement.

---

## 7. Acceptance Criteria (AC)

- **AC-1 (Deterministic 3-Way Commission Split)**: Accurate calculation of COGS replenishment, master brand royalty, and franchisee net profit.
- **AC-2 (Atomic Stock Transfer Ledger)**: Source stock decrements upon dispatch, transit state tracked, destination stock increments upon verification code confirmation.
- **AC-3 (Multi-Branch Matrix)**: Clean overview of stock distribution across Central Hub and all franchise nodes.
- **AC-4 (bKash Sub-Merchant Settlement)**: Automated royalty ledger balance tracking with payout disbursement records.
- **AC-5 (Twin Studio Modal & Shortcut)**: `FranchiseMultiBranchModal` wired with `⌘M` / `Ctrl+M`.
- **AC-6 (Test Suite)**: Comprehensive Vitest unit tests verifying commission mathematics, stock transfers, and branch registrations.
