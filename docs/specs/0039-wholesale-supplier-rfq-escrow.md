# Spec 0039: Autonomous Wholesale Supplier RFQ & B2B Escrow Negotiation Engine

## Problem Statement
One-Person Companies (OPCs) and growing D2C brands in Bangladesh face severe friction when procuring inventory and raw materials at wholesale scale:
1. **Opaque Pricing & Informal Sourcing**: Wholesale markets like Chawkbazar (plastics/hardware), Islampur (textiles/fabrics), Keraniganj (garments), and Tongi (packaging) lack standardized price discovery, requiring manual bargaining without transparent volume discount tiers.
2. **Supplier Quality & Fulfillment Risk**: Suppliers frequently deliver sub-standard sample variances or delayed batches with zero contractual accountability.
3. **Unsafe Advance Payments**: Wholesale transactions typically demand 50-100% upfront cash without escrow protection, exposing solo entrepreneurs to catastrophic capital loss.
4. **Cross-Border Complexity (1688 / Yiwu)**: Direct factory sourcing from China requires currency conversion (CNY to BDT), freight forwarder coordination, and customs CIF estimation.

## Solution Architecture
An autonomous wholesale procurement engine that automates:
1. **B2B RFQ Generator**: Structured Requests for Quotation specifying target volume tiers ($Q \ge 500, 1000, 5000$), material specs, and lead times across major Bangladeshi wholesale clusters & 1688 cross-border.
2. **Tiered Volume Discount Curve Engine**: Calculates progressive unit discounts, marginal cost savings, and optimal order quantities (EOQ).
3. **Supplier Bid Evaluator & Reliability Scoring**: Compares vendor quotations using a weighted Supplier Reliability Index ($SRI = 0.35 \times \text{Quality} + 0.30 \times \text{SLA} + 0.20 \times \text{Price} + 0.15 \times \text{DisputeScore}$).
4. **Bilingual Milestone Escrow Contract Compiler**: Generates 3-stage milestone agreements (Deposit 30% -> Sample Quality Pass 40% -> Final Warehouse Acceptance 30%) with SHA-256 cryptographic seal.
5. **Wholesale Sourcing Studio UI (`WholesaleRfqEscrowModal.tsx`)**: Dedicated modal with keyboard shortcut `⌘W` / `Ctrl+W` integrated into Twin Command Center.

## Data Structures & Interfaces
```typescript
export interface WholesaleSupplier {
  id: string;
  name: string;
  hub: 'chawkbazar' | 'islampur' | 'keraniganj' | 'tongi_industrial' | 'crossborder_1688';
  category: 'textiles' | 'packaging' | 'cosmetics_hardware' | 'apparel' | 'electronics_raw';
  reliabilityScore: number; // 0 - 100
  qualityRating: number;    // 0 - 100
  onTimeDeliveryRate: number; // 0 - 100
  disputeRate: number;      // 0 - 100
  verifiedTradeLicence: string;
  phone: string;
  address: string;
}

export interface RfqDraft {
  rfqId: string;
  title: string;
  hub: string;
  category: string;
  skuName: string;
  specifications: string;
  targetQuantity: number;
  maxBudgetBdt: number;
  deliverySlaDays: number;
  sampleRequired: boolean;
  incoterm: 'ex_factory' | 'fob_dhaka' | 'ddp_warehouse';
}

export interface VolumePriceTier {
  minQty: number;
  maxQty?: number;
  unitPriceBdt: number;
  discountPercent: number;
  totalCostBdt: number;
  marginalSavingsBdt: number;
}

export interface SupplierBid {
  bidId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  hub: string;
  unitPriceBdt: number;
  volumeTiers: VolumePriceTier[];
  leadTimeDays: number;
  sampleFeeBdt: number;
  moq: number;
  compositeScore: number; // calculated SRI
  recommended: boolean;
}

export interface MilestoneEscrowContract {
  contractId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  buyerName: string;
  totalContractValueBdt: number;
  milestones: {
    milestoneIndex: number;
    title: string;
    percentage: number;
    amountBdt: number;
    triggerCondition: string;
    status: 'pending' | 'funded' | 'released' | 'disputed';
  }[];
  sha256Seal: string;
  arbitrationJurisdiction: string;
  defectLiabilityDays: number;
  createdAt: string;
}
```

## API Endpoints
- `GET /api/v1/wholesale/suppliers`: List verified suppliers by hub and category.
- `POST /api/v1/wholesale/rfq/generate`: Create structured RFQ draft with volume tiers.
- `POST /api/v1/wholesale/rfq/evaluate-bids`: Evaluate competing supplier bids and rank by composite score.
- `POST /api/v1/wholesale/escrow/compile-contract`: Compile 3-stage milestone escrow agreement with cryptographic seal.
- `GET /api/v1/wholesale/hubs/overview`: Aggregated market stats across Chawkbazar, Islampur, Keraniganj, Tongi, and 1688.

## Acceptance Criteria
1. Backend engine computes tiered volume discounts and supplier composite scores with sub-10ms latency.
2. RFQ drafts and milestone escrow contracts emit verified SHA-256 seals.
3. 100% unit and integration test coverage across `@workspace/api-server` and `@workspace/shothik`.
4. Certified with pre-commit ECC gate and mirrored across all 9 canonical remotes.
