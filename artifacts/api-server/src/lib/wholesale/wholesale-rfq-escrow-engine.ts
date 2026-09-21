import crypto from 'node:crypto';

export type WholesaleHubId =
  | 'chawkbazar'
  | 'islampur'
  | 'keraniganj'
  | 'tongi_industrial'
  | 'crossborder_1688';

export type WholesaleCategory =
  | 'textiles'
  | 'packaging'
  | 'cosmetics_hardware'
  | 'apparel'
  | 'electronics_raw';

export interface WholesaleSupplier {
  id: string;
  name: string;
  hub: WholesaleHubId;
  category: WholesaleCategory;
  reliabilityScore: number; // 0 - 100
  qualityRating: number;    // 0 - 100
  onTimeDeliveryRate: number; // 0 - 100
  disputeRate: number;      // 0 - 100
  verifiedTradeLicence: string;
  phone: string;
  address: string;
  establishedYear: number;
  averageLeadTimeDays: number;
}

export interface VolumePriceTier {
  minQty: number;
  maxQty?: number;
  unitPriceBdt: number;
  discountPercent: number;
  totalCostBdt: number;
  marginalSavingsBdt: number;
}

export interface RfqDraft {
  rfqId: string;
  title: string;
  hub: WholesaleHubId;
  category: WholesaleCategory;
  skuName: string;
  specifications: string;
  targetQuantity: number;
  maxBudgetBdt: number;
  deliverySlaDays: number;
  sampleRequired: boolean;
  incoterm: 'ex_factory' | 'fob_dhaka' | 'ddp_warehouse';
  volumeTiers: VolumePriceTier[];
  sha256Seal: string;
  createdAt: string;
}

export interface SupplierBid {
  bidId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  hub: WholesaleHubId;
  unitPriceBdt: number;
  volumeTiers: VolumePriceTier[];
  leadTimeDays: number;
  sampleFeeBdt: number;
  moq: number;
  compositeScore: number; // calculated SRI
  recommended: boolean;
  bidNotes: string;
}

export interface MilestoneEscrowContract {
  contractId: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  buyerName: string;
  skuName: string;
  totalQuantity: number;
  unitPriceBdt: number;
  totalContractValueBdt: number;
  incoterm: string;
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

export const VERIFIED_WHOLESALE_SUPPLIERS: WholesaleSupplier[] = [
  {
    id: 'SUP_CHAWK_01',
    name: 'M/S Al-Madina Hardware & Moulding Complex',
    hub: 'chawkbazar',
    category: 'cosmetics_hardware',
    reliabilityScore: 94.5,
    qualityRating: 92.0,
    onTimeDeliveryRate: 95.0,
    disputeRate: 1.2,
    verifiedTradeLicence: 'TRAD/DSCC/019283/2022',
    phone: '+8801711998877',
    address: '42/A Water Works Road, Chawkbazar, Dhaka 1211',
    establishedYear: 2008,
    averageLeadTimeDays: 7
  },
  {
    id: 'SUP_ISLAM_01',
    name: 'Bismillah Silk & Cotton Mills Ltd.',
    hub: 'islampur',
    category: 'textiles',
    reliabilityScore: 96.2,
    qualityRating: 95.5,
    onTimeDeliveryRate: 96.0,
    disputeRate: 0.8,
    verifiedTradeLicence: 'TRAD/DSCC/048821/2019',
    phone: '+8801819223344',
    address: '88 Islampur Road, Lalbagh, Dhaka 1100',
    establishedYear: 2004,
    averageLeadTimeDays: 10
  },
  {
    id: 'SUP_KERAN_01',
    name: 'Bengal Stitch & Garments Syndicate',
    hub: 'keraniganj',
    category: 'apparel',
    reliabilityScore: 91.8,
    qualityRating: 89.5,
    onTimeDeliveryRate: 93.0,
    disputeRate: 2.1,
    verifiedTradeLicence: 'TRAD/KERAN/002914/2021',
    phone: '+8801912445566',
    address: 'East Aganagar, South Keraniganj, Dhaka 1310',
    establishedYear: 2012,
    averageLeadTimeDays: 14
  },
  {
    id: 'SUP_TONGI_01',
    name: 'Apex Corrugated Packaging & Paper Mills',
    hub: 'tongi_industrial',
    category: 'packaging',
    reliabilityScore: 97.4,
    qualityRating: 96.0,
    onTimeDeliveryRate: 98.0,
    disputeRate: 0.4,
    verifiedTradeLicence: 'TRAD/GCC/099182/2018',
    phone: '+8801700112233',
    address: 'Plot 14-16, Tongi I/A, Gazipur 1710',
    establishedYear: 2001,
    averageLeadTimeDays: 5
  },
  {
    id: 'SUP_1688_01',
    name: 'Shenzhen MicroTech Sourcing (Dhaka Bonded Forwarder)',
    hub: 'crossborder_1688',
    category: 'electronics_raw',
    reliabilityScore: 93.0,
    qualityRating: 94.0,
    onTimeDeliveryRate: 91.0,
    disputeRate: 1.8,
    verifiedTradeLicence: 'TRAD/DNCC/110293/2023',
    phone: '+8801311002299',
    address: 'Level 6, Uttara Sector 3, Dhaka (China Sourcing Desk)',
    establishedYear: 2017,
    averageLeadTimeDays: 21
  }
];

export class WholesaleRfqEscrowEngine {
  /**
   * Calculates progressive volume discount tiers based on base unit price and target MOQ.
   */
  static calculateVolumeTiers(basePriceBdt: number, moq: number): VolumePriceTier[] {
    const tiers: VolumePriceTier[] = [
      {
        minQty: moq,
        maxQty: moq * 2 - 1,
        unitPriceBdt: basePriceBdt,
        discountPercent: 0,
        totalCostBdt: basePriceBdt * moq,
        marginalSavingsBdt: 0
      },
      {
        minQty: moq * 2,
        maxQty: moq * 5 - 1,
        unitPriceBdt: Math.round(basePriceBdt * 0.94 * 100) / 100, // 6% off
        discountPercent: 6,
        totalCostBdt: Math.round(basePriceBdt * 0.94 * (moq * 2)),
        marginalSavingsBdt: Math.round(basePriceBdt * 0.06 * (moq * 2))
      },
      {
        minQty: moq * 5,
        maxQty: moq * 10 - 1,
        unitPriceBdt: Math.round(basePriceBdt * 0.88 * 100) / 100, // 12% off
        discountPercent: 12,
        totalCostBdt: Math.round(basePriceBdt * 0.88 * (moq * 5)),
        marginalSavingsBdt: Math.round(basePriceBdt * 0.12 * (moq * 5))
      },
      {
        minQty: moq * 10,
        maxQty: undefined,
        unitPriceBdt: Math.round(basePriceBdt * 0.80 * 100) / 100, // 20% off
        discountPercent: 20,
        totalCostBdt: Math.round(basePriceBdt * 0.80 * (moq * 10)),
        marginalSavingsBdt: Math.round(basePriceBdt * 0.20 * (moq * 10))
      }
    ];

    return tiers;
  }

  /**
   * Generates a structured Request for Quotation (RFQ) with cryptographic seal.
   */
  static generateRfqDraft(params: {
    title: string;
    hub: WholesaleHubId;
    category: WholesaleCategory;
    skuName: string;
    specifications: string;
    targetQuantity: number;
    estimatedBasePriceBdt: number;
    deliverySlaDays?: number;
    sampleRequired?: boolean;
    incoterm?: 'ex_factory' | 'fob_dhaka' | 'ddp_warehouse';
  }): RfqDraft {
    const rfqId = `RFQ_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const moq = Math.max(100, Math.floor(params.targetQuantity * 0.2));
    const volumeTiers = this.calculateVolumeTiers(params.estimatedBasePriceBdt, moq);

    const maxBudgetBdt = params.estimatedBasePriceBdt * params.targetQuantity;

    const rawPayload = `${rfqId}|${params.hub}|${params.skuName}|${params.targetQuantity}|${maxBudgetBdt}`;
    const sha256Seal = crypto.createHash('sha256').update(rawPayload).digest('hex');

    return {
      rfqId,
      title: params.title,
      hub: params.hub,
      category: params.category,
      skuName: params.skuName,
      specifications: params.specifications,
      targetQuantity: params.targetQuantity,
      maxBudgetBdt,
      deliverySlaDays: params.deliverySlaDays || 10,
      sampleRequired: params.sampleRequired ?? true,
      incoterm: params.incoterm || 'ddp_warehouse',
      volumeTiers,
      sha256Seal,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates competing supplier bids for an RFQ using weighted Supplier Reliability Index (SRI).
   */
  static evaluateSupplierBids(
    rfq: RfqDraft,
    customBids?: Partial<SupplierBid>[]
  ): {
    rfqId: string;
    totalBids: number;
    recommendedBid: SupplierBid;
    rankedBids: SupplierBid[];
  } {
    // Generate realistic competing bids from suppliers matching hub or category
    const eligibleSuppliers = VERIFIED_WHOLESALE_SUPPLIERS.filter(
      (s) => s.hub === rfq.hub || s.category === rfq.category
    );

    const suppliersToUse = eligibleSuppliers.length > 0 ? eligibleSuppliers : VERIFIED_WHOLESALE_SUPPLIERS.slice(0, 3);

    const bids: SupplierBid[] = suppliersToUse.map((sup, idx) => {
      // Dynamic variance in quote
      const priceMultiplier = 0.92 + (idx * 0.05);
      const estUnit = rfq.volumeTiers[0]?.unitPriceBdt || 500;
      const unitPriceBdt = Math.round(estUnit * priceMultiplier);
      const moq = Math.max(50, Math.floor(rfq.targetQuantity * 0.15));
      const volumeTiers = this.calculateVolumeTiers(unitPriceBdt, moq);
      const leadTimeDays = Math.max(3, sup.averageLeadTimeDays + (idx * 2));

      // Calculate SRI Composite Score (0 - 100)
      // Quality: 35%, SLA: 30%, Price: 20%, Dispute safety: 15%
      const priceScore = Math.max(0, Math.min(100, 100 - ((unitPriceBdt - estUnit) / estUnit) * 100));
      const slaScore = Math.max(0, Math.min(100, 100 - ((leadTimeDays - rfq.deliverySlaDays) / rfq.deliverySlaDays) * 50));
      const disputeSafety = 100 - (sup.disputeRate * 10);

      const compositeScore = Math.round(
        (0.35 * sup.qualityRating +
         0.30 * slaScore +
         0.20 * priceScore +
         0.15 * disputeSafety) * 10
      ) / 10;

      return {
        bidId: `BID_${Date.now().toString(36).toUpperCase()}_${idx + 1}`,
        rfqId: rfq.rfqId,
        supplierId: sup.id,
        supplierName: sup.name,
        hub: sup.hub,
        unitPriceBdt,
        volumeTiers,
        leadTimeDays,
        sampleFeeBdt: sup.hub === 'crossborder_1688' ? 2500 : 800,
        moq,
        compositeScore,
        recommended: false,
        bidNotes: `Direct factory rate from ${sup.address}. Includes pre-shipment quality audit and standard master carton packing.`
      };
    });

    // Merge any custom bids provided
    if (customBids && customBids.length > 0) {
      customBids.forEach((cb, i) => {
        if (cb.unitPriceBdt && cb.supplierId) {
          const sup = VERIFIED_WHOLESALE_SUPPLIERS.find((s) => s.id === cb.supplierId);
          const compScore = cb.compositeScore || 88.0;
          bids.push({
            bidId: cb.bidId || `BID_CUSTOM_${i + 1}`,
            rfqId: rfq.rfqId,
            supplierId: cb.supplierId,
            supplierName: cb.supplierName || sup?.name || 'Custom Wholesale Supplier',
            hub: cb.hub || sup?.hub || 'chawkbazar',
            unitPriceBdt: cb.unitPriceBdt,
            volumeTiers: this.calculateVolumeTiers(cb.unitPriceBdt, cb.moq || 100),
            leadTimeDays: cb.leadTimeDays || 7,
            sampleFeeBdt: cb.sampleFeeBdt || 500,
            moq: cb.moq || 100,
            compositeScore: compScore,
            recommended: false,
            bidNotes: cb.bidNotes || 'Custom quote submitted by buyer'
          });
        }
      });
    }

    // Sort by composite score descending
    bids.sort((a, b) => b.compositeScore - a.compositeScore);

    if (bids.length > 0) {
      bids[0].recommended = true;
    }

    return {
      rfqId: rfq.rfqId,
      totalBids: bids.length,
      recommendedBid: bids[0],
      rankedBids: bids
    };
  }

  /**
   * Compiles an enforceable 3-stage milestone escrow agreement with cryptographic seal.
   */
  static compileMilestoneEscrowContract(params: {
    rfq: RfqDraft;
    bid: SupplierBid;
    buyerName: string;
    arbitrationJurisdiction?: string;
    defectLiabilityDays?: number;
  }): MilestoneEscrowContract {
    const contractId = `CTR_ESCROW_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const totalContractValueBdt = params.bid.unitPriceBdt * params.rfq.targetQuantity;

    // Milestone 1: 30% Deposit upon contract signing (Raw material lock)
    // Milestone 2: 40% Inspection release upon pre-shipment sample passing QC
    // Milestone 3: 30% Final release upon warehouse delivery and physical tally
    const milestone1Amt = Math.round(totalContractValueBdt * 0.30);
    const milestone2Amt = Math.round(totalContractValueBdt * 0.40);
    const milestone3Amt = totalContractValueBdt - milestone1Amt - milestone2Amt;

    const milestones: MilestoneEscrowContract['milestones'] = [
      {
        milestoneIndex: 1,
        title: 'Milestone 1: Raw Material Procurement & Production Kickoff',
        percentage: 30,
        amountBdt: milestone1Amt,
        triggerCondition: 'Contract digital signature + Advance deposit into Shothik Escrow Vault.',
        status: 'funded'
      },
      {
        milestoneIndex: 2,
        title: 'Milestone 2: Pre-Shipment Quality Inspection (QC) Pass',
        percentage: 40,
        amountBdt: milestone2Amt,
        triggerCondition: 'Approval of golden batch production sample / lab test report.',
        status: 'pending'
      },
      {
        milestoneIndex: 3,
        title: 'Milestone 3: Final Warehouse Delivery & Physical Tally',
        percentage: 30,
        amountBdt: milestone3Amt,
        triggerCondition: 'Physical verification and goods receipt note (GRN) generated at Buyer warehouse.',
        status: 'pending'
      }
    ];

    const rawContract = `${contractId}|${params.rfq.rfqId}|${params.bid.supplierId}|${params.buyerName}|${totalContractValueBdt}|${milestones.length}`;
    const sha256Seal = crypto.createHash('sha256').update(rawContract).digest('hex');

    return {
      contractId,
      rfqId: params.rfq.rfqId,
      supplierId: params.bid.supplierId,
      supplierName: params.bid.supplierName,
      buyerName: params.buyerName,
      skuName: params.rfq.skuName,
      totalQuantity: params.rfq.targetQuantity,
      unitPriceBdt: params.bid.unitPriceBdt,
      totalContractValueBdt,
      incoterm: params.rfq.incoterm,
      milestones,
      sha256Seal,
      arbitrationJurisdiction: params.arbitrationJurisdiction || 'Dhaka, Bangladesh (Arbitration Act 2001)',
      defectLiabilityDays: params.defectLiabilityDays || 30,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Returns wholesale market hub metadata and average lead times.
   */
  static getWholesaleHubsOverview(): {
    hubs: {
      id: WholesaleHubId;
      name: string;
      location: string;
      specialty: string;
      activeSuppliersCount: number;
      averageLeadTimeDays: number;
      priceAdvantageVsRetail: string;
    }[];
  } {
    return {
      hubs: [
        {
          id: 'chawkbazar',
          name: 'Chawkbazar Wholesale Hub',
          location: 'Old Dhaka (Water Works / Chawk Circular Rd)',
          specialty: 'Plastics, Hardware, Cosmetic Containers, Packaging Jars, Toys',
          activeSuppliersCount: 420,
          averageLeadTimeDays: 5,
          priceAdvantageVsRetail: '40% - 65% below retail MRP'
        },
        {
          id: 'islampur',
          name: 'Islampur Textile & Fabric District',
          location: 'Lalbagh / Sadarghat, Old Dhaka',
          specialty: 'Cotton, Linen, Georgette, Denim, Silk, Embroidery Fabrics',
          activeSuppliersCount: 680,
          averageLeadTimeDays: 7,
          priceAdvantageVsRetail: '35% - 55% below retail fabric stores'
        },
        {
          id: 'keraniganj',
          name: 'Keraniganj RMG & Apparel Cluster',
          location: 'South Keraniganj / Aganagar, Dhaka',
          specialty: 'Ready-Made Garments, Jeans, Panjabis, Hoodies, T-Shirts',
          activeSuppliersCount: 1250,
          averageLeadTimeDays: 12,
          priceAdvantageVsRetail: '50% - 70% below brand retail'
        },
        {
          id: 'tongi_industrial',
          name: 'Tongi & Gazipur Industrial Manufacturing Belt',
          location: 'Tongi / Board Bazar, Gazipur',
          specialty: 'Master Cartons, Poly Mailers, Bubble Wrap, Shoe Soles, Bulk Assembly',
          activeSuppliersCount: 310,
          averageLeadTimeDays: 6,
          priceAdvantageVsRetail: '30% - 45% factory direct'
        },
        {
          id: 'crossborder_1688',
          name: '1688 / Yiwu Direct Factory Import Gateway',
          location: 'Guangdong / Zhejiang (via Chittagong Port & DAC Air)',
          specialty: 'Electronic Modules, Smart Wearables, Injection Molds, Tools',
          activeSuppliersCount: 5400,
          averageLeadTimeDays: 18,
          priceAdvantageVsRetail: '60% - 80% source factory FOB'
        }
      ]
    };
  }
}
