# Spec 0087: Autonomous Inland Waterway Cargo & River Vessel Telemetry Engine
## BIWTA River Corridors, Shoal Grounding Prevention & Bulk Cargo Demurrage

### Context & Problem Statement
In Bangladesh, over 24,000 km of navigable rivers and inland waterways governed by the Bangladesh Inland Water Transport Authority (BIWTA) form the primary artery for heavy bulk commerce. Over 70% of vital raw materials—including cement clinker, dredging sand, urea fertilizer, food grains, steel coils, and imported edible oil—are transported via river barges and coaster vessels between Chittagong/Mongla seaports and industrial river ghats in Narayanganj, Munshiganj, Dhaka, Barisal, and Ashuganj.

However, micro-enterprises and One-Person Companies (OPCs) navigating river logistics face acute friction:
1. **Unpredictable River Draught & Shoal Grounding**: Seasonal river silting and shifting shoals (*চর*) can trap loaded vessels if draft clearance drops below safety margins (< 0.5m), leading to costly salvage operations.
2. **Stevedoring Laytime Disputes & Demurrage Fees**: High-tonnage offloading at river ghats often suffers severe demurrage penalties (৳25,000–৳50,000/day) due to unverified Notice of Readiness (NOR) acceptance, poor weather working day (WWD) exception logging during monsoon storm signals (BIWTA Warning Signal 4+), and lack of transparent laytime ledgers.
3. **Manual BIWTA River Conservation Toll Auditing**: Calculating statutory port dues, berthing fees, pilotage rates, and inland water conservancy tolls requires complex tariff matching and NBR 5% VAT withholding.

### Success Criteria & Acceptance Criteria
- **AC-1: River Corridors & AIS Telemetry Ingestion**: Ingest live vessel position, speed over ground, river kilometer marker, current water depth, and vessel draft. Calculate under-keel draft clearance; trigger `critical_grounding_risk` with automated anchoring advisory when clearance is < 0.3m.
- **AC-2: Deterministic Laytime & Demurrage Audit**: Ingest cargo tonnage, NOR acceptance timestamp, discharge completion, and monsoon weather interruption hours. Calculate net laytime against contractual free hours; determine demurrage penalty or despatch incentive rebate.
- **AC-3: Statutory BIWTA River Conservation & Port Dues Compiler**: Compute official BIWTA river conservancy tolls based on DWT and corridor classification, pilotage and ghat berthing charges, 5% statutory VAT, and generate a tamper-evident SHA-256 seal.
- **AC-4: REST API Endpoints**: Expose clean endpoints under `/api/v1/logistics/waterway/` for corridors, telemetry ingestion, laytime audit, and BIWTA receipt generation.
- **AC-5: Accessible AG-UI Frontend Twin Modal**: Deliver `WaterwayCargoModal.tsx` with keyboard shortcut `⌘W` / `Ctrl+W`, WAI-ARIA compliance, 36px minimum touch targets, and full screen-reader accessibility.
- **AC-6: 100% Quality & Reliability**: Zero TypeScript errors, 100% unit test pass rate across API and UI test suites, integrated into the continuous overnight validation daemon.

### Domain Models & Interfaces
```typescript
export type VesselType = 
  | 'bulk_coaster'
  | 'dumb_barge'
  | 'cargo_coaster'
  | 'oil_tanker'
  | 'container_feeder';

export type RiverCorridorId =
  | 'chittagong_dhaka_meghna'
  | 'mongla_khulna_barisal'
  | 'paturia_daulatdia_padma'
  | 'narayanganj_ashuganj_surma'
  | 'chattogram_chandpur';

export type GroundingRiskStatus = 'safe' | 'caution' | 'critical_grounding_risk';

export interface InlandVessel {
  vesselId: string;
  vesselName: string;
  registrationNo: string;
  vesselType: VesselType;
  deadweightTonnage: number;
  maxPermissibleDraftMeters: number;
  currentDraftMeters: number;
}
```
