import { Router, Request, Response } from 'express';
import {
  Mushak43Engine,
  PREDEFINED_MUSHAK43_TEMPLATES,
  Mushak43Declaration
} from '../lib/mushak43/mushak43-engine.js';

export const mushak43Router = Router();

// In-memory store for active Mushak-4.3 declarations
const declarationStore = new Map<string, Mushak43Declaration>();

// Seed default declaration
const defaultDecl = Mushak43Engine.createDeclaration({
  declarationId: 'MUSHAK43-BAKERY-001',
  finishedProductSku: 'SKU-BISCUIT-01',
  finishedProductName: 'Butter Toast Biscuit 250g Family Pack',
  finishedProductBanglaName: 'বাটার টোস্ট বিস্কুট ২৫০গ্রাম',
  finishedProductHsCode: '1905.31.00',
  unitOfSupply: 'Pack (250g)',
  manufacturerBin: '001234567-0101',
  manufacturerName: 'Shothik Foods & Agro Industries Ltd.',
  factoryAddress: 'Plot 45, BSCIC Industrial Estate, Tongi, Gazipur',
  divisionalVatOffice: 'Divisional VAT Office, Tongi Division, Gazipur Circle',
  rawMaterials: [
    {
      materialId: 'MAT-WHEAT-01',
      name: 'Refined Wheat Flour (Maida)',
      banglaName: 'ময়দা',
      hsCode: '1101.00.10',
      unitOfMeasure: 'gram',
      grossConsumptionPerUnit: 200,
      standardWastagePercent: 3.5,
      netEffectiveConsumption: 193,
      unitCostBdt: 0.065,
      totalMaterialCostBdt: 13.0
    },
    {
      materialId: 'MAT-SUGAR-01',
      name: 'Refined Sugar',
      banglaName: 'চিনি',
      hsCode: '1701.99.00',
      unitOfMeasure: 'gram',
      grossConsumptionPerUnit: 45,
      standardWastagePercent: 2.0,
      netEffectiveConsumption: 44.1,
      unitCostBdt: 0.14,
      totalMaterialCostBdt: 6.3
    },
    {
      materialId: 'MAT-BUTTER-01',
      name: 'Bakery Butter & Vegetable Fat',
      banglaName: 'বাটার ও উদ্ভিজ্জ ফ্যাট',
      hsCode: '1517.90.00',
      unitOfMeasure: 'gram',
      grossConsumptionPerUnit: 35,
      standardWastagePercent: 4.0,
      netEffectiveConsumption: 33.6,
      unitCostBdt: 0.38,
      totalMaterialCostBdt: 13.3
    }
  ],
  costingBreakdown: {
    rawMaterialsCostBdt: 32.6,
    directLaborCostBdt: 4.5,
    utilitiesEnergyCostBdt: 3.0,
    packagingMaterialCostBdt: 5.5,
    factoryOverheadCostBdt: 2.5,
    administrativeOverheadCostBdt: 1.5,
    financeCostBdt: 1.0,
    totalCostOfProductionBdt: 50.6,
    profitMarginPercent: 18,
    profitMarginBdt: 9.11,
    declaredSellingPriceExVatBdt: 59.71,
    vatRatePercent: 15,
    vatAmountBdt: 8.96,
    finalSellingPriceIncVatBdt: 68.67,
    valueAdditionPercent: 45.4
  },
  firstSupplyEffectiveDate: '2026-10-01',
  submissionDate: '2026-09-15',
  declaredBy: 'Kazi Farhan Ahmed',
  designation: 'Head of Factory Accounts & Tax Compliance'
});
declarationStore.set(defaultDecl.declarationId, defaultDecl);

/**
 * GET /api/v1/mushak43/templates
 * Fetches predefined BOM industry templates.
 */
mushak43Router.get('/v1/mushak43/templates', (_req: Request, res: Response): void => {
  try {
    res.json({
      success: true,
      templates: PREDEFINED_MUSHAK43_TEMPLATES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch templates'
    });
  }
});

/**
 * GET /api/v1/mushak43/declarations
 * Lists all active Mushak-4.3 product coefficient declarations.
 */
mushak43Router.get('/v1/mushak43/declarations', (_req: Request, res: Response): void => {
  try {
    const declarations = Array.from(declarationStore.values());
    res.json({
      success: true,
      count: declarations.length,
      declarations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch declarations'
    });
  }
});

/**
 * POST /api/v1/mushak43/calculate
 * Calculates raw material net consumption, overhead allocations, and statutory value addition percentage.
 */
mushak43Router.post('/v1/mushak43/calculate', (req: Request, res: Response): void => {
  try {
    const { rawMaterials, overheads } = req.body;

    if (!Array.isArray(rawMaterials) || rawMaterials.length === 0) {
      res.status(400).json({
        success: false,
        error: 'rawMaterials must be a non-empty array'
      });
      return;
    }

    const calculated = Mushak43Engine.calculateCosting(rawMaterials, overheads || {});

    res.json({
      success: true,
      result: calculated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Costing calculation failed'
    });
  }
});

/**
 * POST /api/v1/mushak43/declarations/create
 * Compiles and cryptographically seals a formal Mushak-4.3 declaration.
 */
mushak43Router.post('/v1/mushak43/declarations/create', (req: Request, res: Response): void => {
  try {
    const {
      finishedProductSku,
      finishedProductName,
      finishedProductBanglaName,
      finishedProductHsCode,
      unitOfSupply,
      manufacturerBin,
      manufacturerName,
      factoryAddress,
      divisionalVatOffice,
      rawMaterials,
      overheads,
      firstSupplyEffectiveDate,
      declaredBy,
      designation
    } = req.body;

    if (!finishedProductName || !manufacturerBin || !Array.isArray(rawMaterials)) {
      res.status(400).json({
        success: false,
        error: 'Missing mandatory Mushak-4.3 declaration fields'
      });
      return;
    }

    const costing = Mushak43Engine.calculateCosting(rawMaterials, overheads || {});

    const declaration = Mushak43Engine.createDeclaration({
      finishedProductSku: finishedProductSku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      finishedProductName,
      finishedProductBanglaName: finishedProductBanglaName || finishedProductName,
      finishedProductHsCode: finishedProductHsCode || '1905.90.00',
      unitOfSupply: unitOfSupply || 'Piece',
      manufacturerBin,
      manufacturerName: manufacturerName || 'Shothik Manufacturing Ltd',
      factoryAddress: factoryAddress || 'Dhaka Industrial Zone, Bangladesh',
      divisionalVatOffice: divisionalVatOffice || 'Divisional VAT Office, Dhaka Circle',
      rawMaterials: costing.rawMaterials,
      costingBreakdown: costing.costingBreakdown,
      firstSupplyEffectiveDate: firstSupplyEffectiveDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      declaredBy: declaredBy || 'Managing Director',
      designation: designation || 'Authorized Representative'
    });

    declarationStore.set(declaration.declarationId, declaration);

    res.json({
      success: true,
      declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create declaration'
    });
  }
});

/**
 * POST /api/v1/mushak43/batch-audit
 * Audits production batch consumption against declared standard and validates 7.5% NBR refiling threshold.
 */
mushak43Router.post('/v1/mushak43/batch-audit', (req: Request, res: Response): void => {
  try {
    const { declarationId, batchNumber, actualUnitsProduced, actualTotalCostRecordedBdt } = req.body;

    if (!declarationId || !batchNumber || !actualUnitsProduced || !actualTotalCostRecordedBdt) {
      res.status(400).json({
        success: false,
        error: 'declarationId, batchNumber, actualUnitsProduced, and actualTotalCostRecordedBdt are required'
      });
      return;
    }

    const declaration = declarationStore.get(declarationId);
    if (!declaration) {
      res.status(404).json({
        success: false,
        error: `Declaration with ID "${declarationId}" not found`
      });
      return;
    }

    const audit = Mushak43Engine.auditBatchVariance(
      declaration,
      String(batchNumber),
      Number(actualUnitsProduced),
      Number(actualTotalCostRecordedBdt)
    );

    res.json({
      success: true,
      audit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch audit failed'
    });
  }
});

export default mushak43Router;
