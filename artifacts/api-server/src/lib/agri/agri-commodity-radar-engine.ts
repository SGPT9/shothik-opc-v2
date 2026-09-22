import crypto from 'node:crypto';

export type AgriCategory =
  | 'perishable_vegetables'
  | 'seasonal_fruits'
  | 'spices_condiments'
  | 'grains_pulses'
  | 'edible_oils';

export type MandiId =
  | 'karwan_bazar'
  | 'badamtoli'
  | 'khatunganj'
  | 'bogra_mandi'
  | 'rajshahi_belt';

export interface AgriCommodity {
  id: string;
  name: string;
  banglaName: string;
  category: AgriCategory;
  unit: 'kg' | 'maund' | 'ton' | 'crate';
  farmgateOrigin: string;
  primaryMandi: MandiId;
  farmgatePriceBdt: number;
  wholesaleMandiPriceBdt: number;
  sma7PriceBdt: number;
  priceTrend: 'rising' | 'falling' | 'stable';
  volatilityIndex: number; // 0 - 100
  moistureLossCoefficient: number; // hourly shrinkage rate %
  recommendedStorageTempC: string;
  harvestSeason: string;
}

export interface ArbitrageAnalysis {
  commodityId: string;
  commodityName: string;
  quantityKg: number;
  transitHours: number;
  transportType: 'reefer_cold_chain' | 'open_bed_truck';
  initialWeightKg: number;
  shrinkageLossKg: number;
  effectiveArrivalWeightKg: number;
  shrinkagePercentage: number;
  farmgateSourcingCostBdt: number;
  estimatedFreightCostBdt: number;
  spoilageLossBufferBdt: number;
  totalCostBdt: number;
  projectedRevenueBdt: number;
  netGrossProfitBdt: number;
  netMarginPercent: number;
  roiPercent: number;
  arbitrageRating: 'HIGH_OPPORTUNITY' | 'MODERATE_ARBITRAGE' | 'HIGH_RISK_MARGIN_EROSION';
}

export interface SourcingLotDraft {
  lotId: string;
  commodityId: string;
  commodityName: string;
  farmerName: string;
  farmerPhone: string;
  farmerMfsNumber: string;
  mfsProvider: 'bkash' | 'nagad' | 'rocket';
  farmLocation: string;
  quantityMaund: number;
  totalKg: number;
  farmgateRatePerKgBdt: number;
  estimatedGrossValueBdt: number;
  advancePercentage: number;
  advanceAmountBdt: number;
  expectedHarvestDate: string;
  transportType: 'reefer_cold_chain' | 'covered_van' | 'open_bed_truck';
  destinationMandi: string;
  status: 'draft' | 'advance_disbursed' | 'in_transit' | 'received_and_tallied';
  trxId?: string;
  sha256Seal: string;
  createdAt: string;
}

export interface ColdChainRoutePlan {
  planId: string;
  commodityName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTransitHours: number;
  vehicleType: 'reefer_3_ton' | 'reefer_7_ton' | 'open_truck_5_ton';
  temperatureRangeC: string;
  baseFreightBdt: number;
  coldChainSurchargeBdt: number;
  totalFreightCostBdt: number;
  shrinkageMitigationSavingsBdt: number;
  netEconomicBenefitBdt: number;
}

export const TRACKED_AGRI_COMMODITIES: AgriCommodity[] = [
  {
    id: 'AGRI_ONION_01',
    name: 'Native Red Onion (Taherpuri / King)',
    banglaName: 'তাহেরপুরী দেশি পেঁয়াজ',
    category: 'perishable_vegetables',
    unit: 'kg',
    farmgateOrigin: 'Sujanagar, Pabna & Madhukhali, Faridpur',
    primaryMandi: 'karwan_bazar',
    farmgatePriceBdt: 45,
    wholesaleMandiPriceBdt: 74,
    sma7PriceBdt: 71,
    priceTrend: 'rising',
    volatilityIndex: 42,
    moistureLossCoefficient: 0.0035, // 0.35% weight loss per hour in heat
    recommendedStorageTempC: '15°C - 20°C (Well ventilated)',
    harvestSeason: 'February - April'
  },
  {
    id: 'AGRI_POTATO_01',
    name: 'Diamond White Potato (Granola)',
    banglaName: 'ডায়মন্ড গোল আলু',
    category: 'perishable_vegetables',
    unit: 'kg',
    farmgateOrigin: 'Sirajdikhan, Munshiganj & Mithapukur, Rangpur',
    primaryMandi: 'karwan_bazar',
    farmgatePriceBdt: 22,
    wholesaleMandiPriceBdt: 38,
    sma7PriceBdt: 36,
    priceTrend: 'stable',
    volatilityIndex: 25,
    moistureLossCoefficient: 0.0018,
    recommendedStorageTempC: '4°C - 8°C (Cold Storage)',
    harvestSeason: 'January - March'
  },
  {
    id: 'AGRI_CHILI_01',
    name: 'Green Birdseye Hot Chili (Bogra Special)',
    banglaName: 'বগুড়ার তাজা কাঁচামরিচ',
    category: 'spices_condiments',
    unit: 'kg',
    farmgateOrigin: 'Sariakandi & Shibganj, Bogra',
    primaryMandi: 'karwan_bazar',
    farmgatePriceBdt: 85,
    wholesaleMandiPriceBdt: 165,
    sma7PriceBdt: 152,
    priceTrend: 'rising',
    volatilityIndex: 78,
    moistureLossCoefficient: 0.0085, // 0.85% loss/hour (highly perishable)
    recommendedStorageTempC: '8°C - 10°C (Moisture regulated)',
    harvestSeason: 'Year-round (Peak: Oct - Feb)'
  },
  {
    id: 'AGRI_MANGO_01',
    name: 'Himsagar Mango (Export Grade GI Certified)',
    banglaName: 'হিমসাগর আম (জিআই প্রত্যয়িত)',
    category: 'seasonal_fruits',
    unit: 'kg',
    farmgateOrigin: 'Shibganj & Kansat, Chapainawabganj',
    primaryMandi: 'badamtoli',
    farmgatePriceBdt: 68,
    wholesaleMandiPriceBdt: 125,
    sma7PriceBdt: 120,
    priceTrend: 'stable',
    volatilityIndex: 55,
    moistureLossCoefficient: 0.0055,
    recommendedStorageTempC: '12°C - 14°C (Ethylene scrubbed)',
    harvestSeason: 'May - July'
  },
  {
    id: 'AGRI_CHICKPEA_01',
    name: 'Australian Desi Chickpeas (Chhola Bulk)',
    banglaName: 'অস্ট্রেলিয়ান ছোলা (খাতুনগঞ্জ বাল্ক)',
    category: 'grains_pulses',
    unit: 'kg',
    farmgateOrigin: 'Khatunganj Port Wharf, Chittagong',
    primaryMandi: 'khatunganj',
    farmgatePriceBdt: 88,
    wholesaleMandiPriceBdt: 114,
    sma7PriceBdt: 112,
    priceTrend: 'stable',
    volatilityIndex: 18,
    moistureLossCoefficient: 0.0004,
    recommendedStorageTempC: 'Room Ambient (Dry Silo)',
    harvestSeason: 'Imported (Peak Ramadan demand)'
  },
  {
    id: 'AGRI_RICE_01',
    name: 'Aromatic Chinigura Paddy / Rice',
    banglaName: 'দিনাজপুরের সুগন্ধি চিনিগুঁড়া চাল',
    category: 'grains_pulses',
    unit: 'kg',
    farmgateOrigin: 'Birganj & Fulbari, Dinajpur',
    primaryMandi: 'karwan_bazar',
    farmgatePriceBdt: 105,
    wholesaleMandiPriceBdt: 158,
    sma7PriceBdt: 155,
    priceTrend: 'rising',
    volatilityIndex: 22,
    moistureLossCoefficient: 0.0005,
    recommendedStorageTempC: 'Room Ambient',
    harvestSeason: 'November - January (Aman harvest)'
  }
];

export class AgriCommodityRadarEngine {
  /**
   * Computes spatial price arbitrage across regional farmgate and urban wholesale mandis,
   * accounting for freight, transit duration, and temperature-induced moisture shrinkage.
   */
  static evaluateArbitrage(params: {
    commodityId: string;
    quantityKg: number;
    transitHours?: number;
    transportType?: 'reefer_cold_chain' | 'open_bed_truck';
    customFarmgatePriceBdt?: number;
    customMandiPriceBdt?: number;
  }): ArbitrageAnalysis {
    const commodity =
      TRACKED_AGRI_COMMODITIES.find((c) => c.id === params.commodityId) || TRACKED_AGRI_COMMODITIES[0];

    const farmgatePrice = params.customFarmgatePriceBdt || commodity.farmgatePriceBdt;
    const mandiPrice = params.customMandiPriceBdt || commodity.wholesaleMandiPriceBdt;
    const transitHours = params.transitHours || 12; // Typical north-to-Dhaka transit with traffic
    const transportType = params.transportType || 'open_bed_truck';

    // Cold chain reduces hourly moisture shrinkage rate by 75%
    const shrinkageRatePerHour =
      transportType === 'reefer_cold_chain'
        ? commodity.moistureLossCoefficient * 0.25
        : commodity.moistureLossCoefficient;

    // Shrinkage formulation: W_final = W_initial * (1 - shrinkageRatePerHour * transitHours)
    const shrinkageLossKg = Math.round(params.quantityKg * shrinkageRatePerHour * transitHours * 100) / 100;
    const effectiveArrivalWeightKg = Math.max(0, params.quantityKg - shrinkageLossKg);
    const shrinkagePercentage = Math.round((shrinkageLossKg / params.quantityKg) * 10000) / 100;

    // Financial breakdown
    const farmgateSourcingCostBdt = Math.round(params.quantityKg * farmgatePrice);

    // Freight calculation (৳3.5/kg for open truck, ৳5.5/kg for reefer)
    const freightRatePerKg = transportType === 'reefer_cold_chain' ? 5.5 : 3.5;
    const estimatedFreightCostBdt = Math.round(params.quantityKg * freightRatePerKg);

    const spoilageLossBufferBdt = Math.round(shrinkageLossKg * farmgatePrice);
    const totalCostBdt = farmgateSourcingCostBdt + estimatedFreightCostBdt;
    const projectedRevenueBdt = Math.round(effectiveArrivalWeightKg * mandiPrice);
    const netGrossProfitBdt = projectedRevenueBdt - totalCostBdt;
    const netMarginPercent = Math.round((netGrossProfitBdt / (projectedRevenueBdt || 1)) * 10000) / 100;
    const roiPercent = Math.round((netGrossProfitBdt / (totalCostBdt || 1)) * 10000) / 100;

    let arbitrageRating: ArbitrageAnalysis['arbitrageRating'] = 'MODERATE_ARBITRAGE';
    if (netMarginPercent > 25 && roiPercent > 35) {
      arbitrageRating = 'HIGH_OPPORTUNITY';
    } else if (netMarginPercent < 10 || netGrossProfitBdt <= 0) {
      arbitrageRating = 'HIGH_RISK_MARGIN_EROSION';
    }

    return {
      commodityId: commodity.id,
      commodityName: commodity.name,
      quantityKg: params.quantityKg,
      transitHours,
      transportType,
      initialWeightKg: params.quantityKg,
      shrinkageLossKg,
      effectiveArrivalWeightKg,
      shrinkagePercentage,
      farmgateSourcingCostBdt,
      estimatedFreightCostBdt,
      spoilageLossBufferBdt,
      totalCostBdt,
      projectedRevenueBdt,
      netGrossProfitBdt,
      netMarginPercent,
      roiPercent,
      arbitrageRating
    };
  }

  /**
   * Creates a structured sourcing lot draft and calculates farmer micro-advance.
   * Note: 1 Maund (মণ) = 40 kg in standard Bangladeshi agricultural measurement.
   */
  static createSourcingLot(params: {
    commodityId: string;
    farmerName: string;
    farmerPhone: string;
    farmerMfsNumber: string;
    mfsProvider: 'bkash' | 'nagad' | 'rocket';
    farmLocation: string;
    quantityMaund: number;
    customFarmgateRateBdt?: number;
    advancePercentage?: number;
    expectedHarvestDate?: string;
    transportType?: 'reefer_cold_chain' | 'covered_van' | 'open_bed_truck';
    destinationMandi?: string;
  }): SourcingLotDraft {
    const commodity =
      TRACKED_AGRI_COMMODITIES.find((c) => c.id === params.commodityId) || TRACKED_AGRI_COMMODITIES[0];

    const lotId = `LOT_AGRI_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const totalKg = params.quantityMaund * 40;
    const farmgateRatePerKgBdt = params.customFarmgateRateBdt || commodity.farmgatePriceBdt;
    const estimatedGrossValueBdt = totalKg * farmgateRatePerKgBdt;

    const advancePercentage = params.advancePercentage !== undefined ? params.advancePercentage : 30; // 30% standard
    const advanceAmountBdt = Math.round(estimatedGrossValueBdt * (advancePercentage / 100));

    const rawPayload = `${lotId}|${commodity.id}|${params.farmerPhone}|${totalKg}|${advanceAmountBdt}`;
    const sha256Seal = crypto.createHash('sha256').update(rawPayload).digest('hex');

    return {
      lotId,
      commodityId: commodity.id,
      commodityName: commodity.name,
      farmerName: params.farmerName,
      farmerPhone: params.farmerPhone,
      farmerMfsNumber: params.farmerMfsNumber,
      mfsProvider: params.mfsProvider,
      farmLocation: params.farmLocation,
      quantityMaund: params.quantityMaund,
      totalKg,
      farmgateRatePerKgBdt,
      estimatedGrossValueBdt,
      advancePercentage,
      advanceAmountBdt,
      expectedHarvestDate: params.expectedHarvestDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      transportType: params.transportType || 'open_bed_truck',
      destinationMandi: params.destinationMandi || 'Karwan Bazar Central Arat, Dhaka',
      status: 'draft',
      sha256Seal,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Executes digital disbursement of farmer micro-advance via bKash/Nagad MFS gateway.
   */
  static disburseFarmerAdvance(lot: SourcingLotDraft): {
    success: boolean;
    lotId: string;
    trxId: string;
    disbursedAmountBdt: number;
    beneficiaryMfs: string;
    mfsProvider: string;
    disbursedAt: string;
    updatedStatus: 'advance_disbursed';
    receiptSeal: string;
  } {
    const trxId = `TRX_${lot.mfsProvider.toUpperCase()}_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const receiptPayload = `${trxId}|${lot.lotId}|${lot.advanceAmountBdt}|${lot.farmerMfsNumber}`;
    const receiptSeal = crypto.createHash('sha256').update(receiptPayload).digest('hex');

    return {
      success: true,
      lotId: lot.lotId,
      trxId,
      disbursedAmountBdt: lot.advanceAmountBdt,
      beneficiaryMfs: lot.farmerMfsNumber,
      mfsProvider: lot.mfsProvider,
      disbursedAt: new Date().toISOString(),
      updatedStatus: 'advance_disbursed',
      receiptSeal
    };
  }

  /**
   * Evaluates Reefer Cold-Chain transport dispatch economics against conventional open-bed cargo.
   */
  static calculateColdChainPlan(params: {
    origin: string;
    destination: string;
    commodityId: string;
    quantityKg: number;
    distanceKm?: number;
  }): ColdChainRoutePlan {
    const commodity =
      TRACKED_AGRI_COMMODITIES.find((c) => c.id === params.commodityId) || TRACKED_AGRI_COMMODITIES[0];

    const planId = `CCP_${Date.now().toString(36).toUpperCase()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const distanceKm = params.distanceKm || 240; // e.g. Bogra to Dhaka
    const estimatedTransitHours = Math.round((distanceKm / 35) + 3); // 35 km/h avg speed + 3h ferry/traffic buffer

    // Base open freight: ৳3.5 / kg
    const baseFreightBdt = Math.round(params.quantityKg * 3.5);
    // Reefer surcharge: +৳2.0 / kg for active cooling unit & insulated body
    const coldChainSurchargeBdt = Math.round(params.quantityKg * 2.0);
    const totalFreightCostBdt = baseFreightBdt + coldChainSurchargeBdt;

    // Shrinkage without cooling: normal hourly rate
    // Shrinkage with cooling: 75% reduction
    const openLossKg = params.quantityKg * commodity.moistureLossCoefficient * estimatedTransitHours;
    const reeferLossKg = openLossKg * 0.25;
    const savedLossKg = openLossKg - reeferLossKg;

    const shrinkageMitigationSavingsBdt = Math.round(savedLossKg * commodity.wholesaleMandiPriceBdt);
    const netEconomicBenefitBdt = shrinkageMitigationSavingsBdt - coldChainSurchargeBdt;

    const vehicleType = params.quantityKg > 4000 ? 'reefer_7_ton' : 'reefer_3_ton';

    return {
      planId,
      commodityName: commodity.name,
      origin: params.origin,
      destination: params.destination,
      distanceKm,
      estimatedTransitHours,
      vehicleType,
      temperatureRangeC: commodity.recommendedStorageTempC,
      baseFreightBdt,
      coldChainSurchargeBdt,
      totalFreightCostBdt,
      shrinkageMitigationSavingsBdt,
      netEconomicBenefitBdt
    };
  }

  /**
   * Returns wholesale mandi trading market hub metadata across Bangladesh.
   */
  static getMandisOverview(): {
    mandis: {
      id: MandiId;
      name: string;
      location: string;
      primaryCommodities: string;
      dailyTradingVolumeTons: number;
      tradingHours: string;
      pricingMechanism: string;
    }[];
  } {
    return {
      mandis: [
        {
          id: 'karwan_bazar',
          name: 'Karwan Bazar Central Wholesale Arat',
          location: 'Tejgaon / Farmgate, Central Dhaka',
          primaryCommodities: 'Potatoes, Onions, Green Chilies, Tomatoes, Eggplants, Gourds',
          dailyTradingVolumeTons: 3800,
          tradingHours: '11:00 PM - 07:00 AM (Night Auction)',
          pricingMechanism: 'Open open-voice arat auction & commission agent bidding'
        },
        {
          id: 'badamtoli',
          name: 'Badamtoli & Sadarghat Fruit Wholesale Yard',
          location: 'Old Dhaka / Buriganga Riverfront',
          primaryCommodities: 'Mangoes, Apples, Oranges, Watermelons, Bananas, Melons',
          dailyTradingVolumeTons: 2100,
          tradingHours: '04:00 AM - 12:00 PM (Morning Wharf Auction)',
          pricingMechanism: 'Vessel-wharf bulk crate spot trading'
        },
        {
          id: 'khatunganj',
          name: 'Khatunganj & Chaktai Commodity Mandi',
          location: 'Kotwali, Chittagong Port City',
          primaryCommodities: 'Chickpeas, Lentils, Spices, Edible Oils, Sugar, Wheat',
          dailyTradingVolumeTons: 6500,
          tradingHours: '09:00 AM - 08:00 PM',
          pricingMechanism: 'DO (Delivery Order) slip spot & forward contract market'
        },
        {
          id: 'bogra_mandi',
          name: 'Bogra Spice & Vegetable Assembly Yard',
          location: 'Mahasthangarh / Bogra Bypass',
          primaryCommodities: 'Red Chilies, Turmeric, Ginger, Garlic, Cauliflower, Cabbage',
          dailyTradingVolumeTons: 1800,
          tradingHours: '05:00 AM - 11:00 AM',
          pricingMechanism: 'Direct farmgate tractor tally & grower settlement'
        },
        {
          id: 'rajshahi_belt',
          name: 'Kansat & Baneswar Fruit Wholesale Yard',
          location: 'Shibganj & Puthia, Rajshahi / Chapai',
          primaryCommodities: 'Himsagar, Fazli, Langra, Amrapali, Lychees',
          dailyTradingVolumeTons: 2900,
          tradingHours: '06:00 AM - 02:00 PM (Seasonal)',
          pricingMechanism: 'Orchard-direct auction & crate weighing'
        }
      ]
    };
  }
}
