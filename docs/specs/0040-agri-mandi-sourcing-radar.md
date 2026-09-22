# Spec 0040: Autonomous Agri-Commodity Sourcing & Wholesale Mandi Price Radar

## Problem Statement
Bangladeshi agro-merchants, food D2C brands, and cloud kitchens face extreme price volatility and margin erosion when sourcing fresh farm produce and agri-commodities:
1. **Opaque Mandi Pricing & Middlemen Cartels**: Wholesale market arats (Karwan Bazar, Badamtoli, Khatunganj) fluctuate daily without centralized digital price discovery, allowing middlemen (farias/aratdars) to capture 40–60% of consumer value while shortchanging farmers.
2. **Perishable Spoilage & Transit Shrinkage**: High heat and humidity cause 10–25% weight and quality loss during long hauls from northern belts (Bogra, Dinajpur, Rajshahi) without real-time moisture shrinkage buffering.
3. **Logistics Inefficiency**: Lack of dynamic cold-chain reefer booking forces merchants to use open-bed trucks, exacerbating transit loss during traffic congestion on highways.
4. **Farmer Cash Flow Distress**: Smallholder farmers struggle with working capital for harvesting labor and packaging, requiring direct digital micro-advances via bKash/Nagad.

## Solution Architecture
An autonomous agri-commodity price discovery and direct sourcing engine that automates:
1. **Live Mandi Spot Price & Arbitrage Radar**: Indexes spot prices across Khatunganj, Badamtoli, Karwan Bazar, Bogra, and Rajshahi, comparing farmgate rates against urban wholesale to highlight positive arbitrage opportunities ($\Delta_{\text{arbitrage}} > 0$).
2. **Moisture & Spoilage Shrinkage Buffer Calculator**: Simulates temperature-induced transit mass loss ($W_{\text{loss}} = W_0 \times (1 - e^{-\kappa \cdot T})$) and automatically adjusts target selling prices to protect gross margins.
3. **Cold-Chain Reefer Logistics Dispatch Scheduler**: Schedules temperature-controlled Reefer transport (2°C–8°C) vs. regular cargo trucks, estimating route durations, fuel surcharges, and temperature tolerance alerts.
4. **Farmer Micro-Advance Payout Engine**: Facilitates direct bKash/Nagad harvesting advances (25–40%) to verified farmers, linking disbursements to expected harvest yield and delivery dates.
5. **Agri-Commodity Sourcing Studio UI (`AgriMandiRadarModal.tsx`)**: 5-tab control center with keyboard shortcut `⌘A` / `Ctrl+A` in Twin Command Palette.

## Data Structures & Interfaces
```typescript
export interface AgriCommodity {
  id: string;
  name: string;
  category: 'perishable_vegetables' | 'seasonal_fruits' | 'spices_condiments' | 'grains_pulses' | 'edible_oils';
  unit: 'kg' | 'maund' | 'ton' | 'crate';
  farmgateOrigin: string;
  primaryMandi: 'karwan_bazar' | 'badamtoli' | 'khatunganj' | 'bogra_mandi' | 'rajshahi_belt';
  farmgatePriceBdt: number;
  wholesaleMandiPriceBdt: number;
  sma7PriceBdt: number;
  priceTrend: 'rising' | 'falling' | 'stable';
  volatilityIndex: number; // 0 - 100
  moistureLossCoefficient: number; // hourly shrinkage rate
  recommendedStorageTempC: string;
  harvestSeason: string;
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
  sha256Seal: string;
  createdAt: string;
}

export interface ColdChainRoutePlan {
  planId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTransitHours: number;
  vehicleType: 'reefer_3_ton' | 'reefer_7_ton' | 'covered_truck_5_ton';
  temperatureRangeC: string;
  baseFreightBdt: number;
  coldChainSurchargeBdt: number;
  totalFreightCostBdt: number;
  shrinkageMitigationSavingsBdt: number;
  netEconomicBenefitBdt: number;
}
```

## API Endpoints
- `GET /api/v1/agri/commodities`: List live tracked commodities and regional mandi spot rates.
- `POST /api/v1/agri/arbitrage/evaluate`: Compute regional farmgate vs. urban mandi arbitrage with shrinkage buffer.
- `POST /api/v1/agri/lots/create`: Draft farm sourcing lot with automated farmer micro-advance calculation.
- `POST /api/v1/agri/lots/disburse-advance`: Execute simulated bKash/Nagad advance payout to farmer.
- `POST /api/v1/agri/logistics/cold-chain-plan`: Compute cold-chain reefer routing vs. open cargo economic benefit.
- `GET /api/v1/agri/mandis/overview`: Aggregated market stats across Khatunganj, Badamtoli, Karwan Bazar, and northern hubs.

## Acceptance Criteria
1. Backend engine computes spot arbitrage, shrinkage buffers, and reefer economics with sub-10ms response time.
2. Sourcing lot drafts and farmer payouts emit verifiable SHA-256 cryptographic seals.
3. 100% unit and integration test coverage across `@workspace/api-server` and `@workspace/shothik`.
4. Certified with pre-commit ECC gate and mirrored across all 9 canonical remotes.
