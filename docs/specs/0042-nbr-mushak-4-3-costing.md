# Spec 0042: Autonomous NBR Mushak-4.3 Input-Output Coefficient Declarator & Factory Costing Engine

## Problem Statement
Bangladeshi SME manufacturers, cloud kitchens, apparel makers, and FMCG brands face severe regulatory penalties and VAT input tax credit (Mushak-6.3) disallowance if they fail to comply with statutory input-output declarations:
1. **Mandatory NBR Mushak-4.3 Filing**: Under Section 46 of the VAT & Supplementary Duty Act 2012 and Rule 21 of the VAT Rules 2016, every manufacturer or processor must submit a formal **Mushak-4.3 (মূসক-৪.৩)** declaration to the Divisional VAT Officer 15 days before supplying any new manufactured product or when raw material input costs change by more than 7.5%.
2. **Complex Bill of Materials (BOM) & Wastage Calculations**: Converting raw material batches (fabric in yards, oil in liters, chemicals in kg, packaging in gross) into precise unit finished goods requires tracking normal vs. abnormal process wastage percentages (e.g., 2%–12%). Manual spreadsheets frequently fail NBR audit cross-examinations.
3. **Statutory Value Addition & Overhead Amortization**: NBR requires clear breakdown of direct materials, direct labor, utility/energy consumption, packaging costs, administrative overhead, and net profit margin to substantiate the declared unit selling price and 15% / 7.5% / 5% VAT rate.
4. **Production Batch COGS Variance Auditing**: Discrepancies between declared Mushak-4.3 ratios and actual factory floor consumption cause VAT revenue officers to treat input tax rebates as invalid and impose retrospective VAT demands with 2% monthly interest penalties.

## Solution Architecture
An autonomous NBR Mushak-4.3 input-output coefficient declaration and factory costing engine providing:
1. **BOM & Raw Material Decomposition Matrix**: Structured raw material inputs with HS codes, units of measurement, gross consumption, standard wastage percentages, and net effective input quantities per unit finished good.
2. **Value Addition & Overhead Amortization Engine**: Comprehensive calculation of raw material cost, direct labor, utilities/fuel, packaging amortization, factory overhead, finance cost, profit margin, and statutory value addition percentage ($\text{VA}\% = \frac{\text{Selling Price} - \text{Raw Material Cost}}{\text{Selling Price}} \times 100$).
3. **NBR Divisional VAT Office Submission Packet Compiler**: Compiles the formal bilingual Bengali/English **মূসক-৪.৩ (ইনপুট-আউটপুট সহগ ঘোষণা)** statutory form with 13-digit BIN validation, declaration date, effective date, authorized signatory credentials, and cryptographic SHA-256 seal.
4. **Production Batch Variance Auditor**: Compares actual shop-floor batch consumption against declared Mushak-4.3 coefficients, flagging positive/negative material yield variances and triggering mandatory declaration revision alerts if cost fluctuation exceeds $\pm 7.5\%$.
5. **Mushak-4.3 Factory Costing Studio UI (`Mushak43DeclarationModal.tsx`)**: 5-tab control center with keyboard shortcut `⌘4` / `Ctrl+4` in Twin Command Palette.

## Data Structures & Interfaces
```typescript
export interface RawMaterialInput {
  materialId: string;
  name: string;
  banglaName: string;
  hsCode: string;
  unitOfMeasure: 'kg' | 'liter' | 'yard' | 'meter' | 'piece' | 'gram' | 'ml';
  grossConsumptionPerUnit: number;
  standardWastagePercent: number; // e.g. 5%
  netEffectiveConsumption: number; // gross * (1 - wastage/100)
  unitCostBdt: number;
  totalMaterialCostBdt: number; // gross * unitCostBdt
}

export interface ValueAdditionBreakdown {
  rawMaterialsCostBdt: number;
  directLaborCostBdt: number;
  utilitiesEnergyCostBdt: number;
  packagingMaterialCostBdt: number;
  factoryOverheadCostBdt: number;
  administrativeOverheadCostBdt: number;
  financeCostBdt: number;
  totalCostOfProductionBdt: number;
  profitMarginPercent: number;
  profitMarginBdt: number;
  declaredSellingPriceExVatBdt: number;
  vatRatePercent: number; // 15%, 7.5%, 5%, 0%
  vatAmountBdt: number;
  finalSellingPriceIncVatBdt: number;
  valueAdditionPercent: number; // ((SellingPrice - RawMaterialsCost) / SellingPrice) * 100
}

export interface Mushak43Declaration {
  declarationId: string;
  formNumber: 'মূসক-৪.৩';
  finishedProductSku: string;
  finishedProductName: string;
  finishedProductBanglaName: string;
  finishedProductHsCode: string;
  unitOfSupply: string;
  manufacturerBin: string; // 13-digit BIN
  manufacturerName: string;
  factoryAddress: string;
  divisionalVatOffice: string;
  rawMaterials: RawMaterialInput[];
  costingBreakdown: ValueAdditionBreakdown;
  firstSupplyEffectiveDate: string;
  submissionDate: string;
  declaredBy: string;
  designation: string;
  status: 'draft' | 'submitted_to_vat_office' | 'accepted_by_nbr' | 'revision_required';
  revisionReason?: string;
  sha256Seal: string;
  createdAt: string;
}

export interface BatchVarianceAudit {
  auditId: string;
  declarationId: string;
  batchNumber: string;
  actualUnitsProduced: number;
  standardExpectedCostBdt: number;
  actualRecordedCostBdt: number;
  varianceBdt: number; // actual - standard
  variancePercent: number;
  thresholdExceeded: boolean; // > 7.5% fluctuation
  actionRequired: 'none' | 'refile_mushak_4_3_declaration' | 'investigate_wastage_leakage';
  auditedAt: string;
}
```

## API Endpoints
- `GET /api/v1/mushak43/declarations`: List all declared Mushak-4.3 product coefficients.
- `POST /api/v1/mushak43/calculate`: Calculate BOM, standard wastage, value addition %, and unit factory costing.
- `POST /api/v1/mushak43/declarations/create`: Compile and seal official Mushak-4.3 statutory declaration form with SHA-256 seal.
- `POST /api/v1/mushak43/batch-audit`: Audit production batch consumption against declared coefficient and verify 7.5% NBR threshold.
- `GET /api/v1/mushak43/templates`: Fetch predefined BOM templates for common Bangladeshi manufacturing categories (Bakery/FMCG, Garments/Apparel, Agro-processing, Cosmetics/Soap).

## Acceptance Criteria
1. Engine correctly calculates gross/net consumption, process wastage, and value addition percentage ($\text{VA}\% \ge 0$).
2. Validates manufacturer 13-digit BIN and generates official NBR Mushak-4.3 statutory form layout with SHA-256 seal.
3. Production batch variance auditor flags any cost delta exceeding the $\pm 7.5\%$ statutory refiling threshold under VAT Rules 2016.
4. 100% test coverage across `@workspace/api-server` and `@workspace/shothik`.
