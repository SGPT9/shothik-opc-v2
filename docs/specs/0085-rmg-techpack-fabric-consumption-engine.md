# Specification 0085: Autonomous RMG Merchandising, Tech Pack Generator, Fabric Consumption & Factory Subcontracting Escrow Engine

## 1. Executive Summary & Problem Context
The Readymade Garment (RMG) and textile sector in Bangladesh constitutes over $47 billion in annual exports and employs over 4 million workers. Beyond massive Tier-1 composite conglomerates in Savar, Gazipur, and Chittagong EPZ, hundreds of thousands of SME fashion entrepreneurs, boutique owners, buying house merchandisers, and One-Person Companies (OPCs) in Mirpur, Narayanganj, and Uttara operate small-batch manufacturing and export-quality subcontracting.

These entrepreneurs face severe operational friction:
1. **Manual Tech Pack Generation**: Lack of standardized specification sheets with Points of Measure (POM), grading tolerances, and Bill of Materials (BOM).
2. **Fabric Consumption Calculations**: Calculating yarn and knitted fabric consumption per dozen garments (kg/dozen) often suffers from manual errors, leading to fabric shortages or deadstock wastage.
3. **Subcontracting & CM Disputes**: Factory subcontracting for Cost of Making (CM) suffers from delayed payments, lack of milestone visibility, and quality disputes during AQL 2.5 audits.
4. **Statutory Input-Output Ratio**: NBR Mushak-4.3 declarations require accurate input coefficients for fabric, sewing thread, labels, and polybags.

Slice 85 implements an autonomous RMG merchandising engine that resolves these friction points.

---

## 2. Technical Architecture & Domain Models

### 2.1 Garment Styles & Bill of Materials
```typescript
export type GarmentType = "basic_tshirt" | "polo_shirt" | "hoodie" | "denim_jeans" | "twill_chino" | "woven_shirt";

export interface MeasurementPoint {
  code: string;
  name: string;
  baseToleranceCm: number;
  gradeStepCm: number;
  sizeValuesCm: Record<"XS" | "S" | "M" | "L" | "XL" | "XXL", number>;
}

export interface TechPackSpecification {
  styleCode: string;
  styleName: string;
  garmentType: GarmentType;
  fabricComposition: string; // e.g., "100% Combed Ringspun Cotton"
  fabricGsm: number;         // e.g., 180 GSM
  fabricType: "single_jersey" | "pique" | "french_terry" | "fleece" | "denim" | "twill";
  yarnCount: string;         // e.g., "30s/1 Ne"
  orderQuantityPcs: number;
  measurements: MeasurementPoint[];
  cmCostPerDozenBdt: number;
}
```

### 2.2 Fabric Consumption & Yield Formula
Fabric consumption per dozen garments is calculated via the international garment costing standard:
$$\text{Body Consumption (kg/dz)} = \frac{(\text{Body Length} + \text{Allowance}) \times (\frac{1}{2}\text{Chest} + \text{Allowance}) \times 2 \times \text{GSM} \times 12}{10,000,000 \times \text{Marker Efficiency}}$$
$$\text{Sleeve Consumption (kg/dz)} = \frac{(\text{Sleeve Length} + \text{Allowance}) \times (\text{Muscle Width} + \text{Allowance}) \times 2 \times \text{GSM} \times 12}{10,000,000 \times \text{Marker Efficiency}}$$
$$\text{Total Fabric (kg)} = (\text{Unit Consumption} \times \frac{\text{Order Quantity}}{12}) \times (1 + \text{Wastage Allowance})$$

- **Marker Efficiency**: 82% to 92% (depending on CAD nesting).
- **Cutting Wastage**: 5% to 8%.
- **Dyeing & Shrinkage Allowance**: 3% to 5%.

### 2.3 Subcontracting CM 4-Stage Milestone Escrow
To prevent cash-flow defaults and quality fraud:
1. **Stage 1 (Cutting Advance - 25%)**: Disbursed upon fabric inspection & lay cutting start.
2. **Stage 2 (Sewing Progress - 35%)**: Disbursed upon 50% assembly line bundle pass.
3. **Stage 3 (Finishing & AQL 2.5 - 25%)**: Disbursed after iron, packaging, and AQL 2.5 pass.
4. **Stage 4 (Dispatch & Delivery - 15%)**: Disbursed upon warehouse receipt or courier handover.

---

## 3. Acceptance Criteria

- **AC-1 (Tech Pack Generator)**: Generates complete apparel technical sheet with POMs, grading steps (XS to XXL), and Bill of Materials with SHA-256 seal.
- **AC-2 (Fabric Consumption Engine)**: Calculates body and sleeve fabric consumption (kg/dozen), total required fabric rolls, yarn weight, and marker wastage buffers.
- **AC-3 (4-Tier CM Milestone Escrow)**: Enforces 25/35/25/15 milestone release states with bKash/Nagad/Bank guarantee allocations.
- **AC-4 (Mushak-4.3 Coefficient Compiler)**: Generates statutory NBR input-output coefficient summary for export rebate compliance.
- **AC-5 (REST API Mount)**: Exposes endpoints under `/api/v1/apparel/rmg/...` mounted in `artifacts/api-server/src/routes/index.ts`.
- **AC-6 (Frontend Studio Modal)**: Responsive modal `RmgMerchandisingModal.tsx` in `artifacts/shothik/src/components/twin/` with shortcut `⌘R` / `Ctrl+R`, WAI-ARIA role `dialog`, and 36px touch targets.
- **AC-7 (Quality & Regression)**: 100% test coverage across both API route suites and React component suites.
