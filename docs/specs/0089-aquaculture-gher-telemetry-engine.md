# Spec 0089: Autonomous Coastal Aquaculture, Shrimp Gher Telemetry & Seafood Processing Escrow Engine
## Black Tiger Bagda, Golda Prawn & DoF EU Export Traceability

### Context & Problem Statement
Bangladesh's southern coastal saline belt—encompassing Satkhira (Shyamnagar, Kaliganj), Khulna (Paikgachha, Dacope), Bagerhat (Mongla, Rampal), and Cox's Bazar (Chakaria, Maheshkhali)—is a global epicenter for **Black Tiger Shrimp (*বাগদা চিংড়ি*)** and **Giant Freshwater Prawn (*গলদা চিংড়ি*)**. These coastal ponds (*ঘের - Gher*) represent over $500M+ in annual seafood exports to the European Union, United States, and Japan.

However, artisanal gher owners, aquaculture cooperatives, and seafood export One-Person Companies (OPCs) face acute existential risks:
1. **Sudden Overnight Hypoxia Fish Kill & Water Quality Spikes**: Dissolved Oxygen (DO) levels routinely plummet in pre-dawn hours (< 3.5 mg/L), suffocating entire shrimp populations in hours. Unmonitored salinity shocks during monsoon deluges and toxic unionized ammonia ($NH_3 > 0.05$ mg/L) cause catastrophic crop mortality.
2. **Antibiotic Contamination & EU Port Rejection**: Strict European Commission (DG SANTE) and US FDA regulations prohibit residues of nitrofuran metabolites and chloramphenicol. A single contaminated consignment triggers severe port rejections and costly product incinerations.
3. **Cold Chain Integrity & Middlemen Factory Price Gouging**: Harvested shrimp must maintain ice-slurry temperatures below 4°C during transport to processing plants in Rupsha (Khulna) or Chittagong. Gher farmers frequently face unfair post-harvest weight and grade deductions without a transparent quality-controlled escrow release mechanism.

### Success Criteria & Acceptance Criteria
- **AC-1: Real-Time Water Quality Telemetry & Hypoxia Alerting**: Ingest DO, salinity, pH, water temperature, and ammonia. Trigger automated `hypoxia_kill_risk` when DO drops below 3.5 mg/L, advising immediate paddlewheel aeration and oxygen tableting.
- **AC-2: Harvest Size Grading & Cold Chain Valuation**: Calculate FOB factory gate valuation based on count/kg size bands (U-10, 16/20, 21/25, 31/40) and enforce ice-slurry temperature compliance ($\le 4^\circ\text{C}$).
- **AC-3: Seafood Processing Plant Milestone Escrow**: Manage 3-stage payment escrow (30% gate delivery advance, 40% certified lab antibiotic clearance pass, 30% blast freeze acceptance).
- **AC-4: Department of Fisheries (DoF) & EU Traceability Passport**: Generate tamper-evident digital export traceability passports with biometric gher coordinates, batch origin, and SHA-256 seal.
- **AC-5: REST API Endpoints**: Expose clean endpoints under `/api/v1/agri/aquaculture/` for gher catalog, water telemetry, harvest grading, and export passport generation.
- **AC-6: Accessible AG-UI Frontend Twin Modal**: Deliver `AquacultureGherModal.tsx` with keyboard shortcut `⌘Q` / `Ctrl+Q`, WAI-ARIA compliance, 36px touch targets, and screen-reader accessibility.
- **AC-7: 100% Quality & Continuous Daemon Health**: Zero TypeScript errors, 100% unit test pass rate across API and UI test suites, integrated into the continuous overnight validation loop and synced across both remotes (`origin` and `frontend`).

### Domain Models & Interfaces
```typescript
export type AquacultureSpecies =
  | 'bagda_black_tiger'
  | 'golda_giant_freshwater'
  | 'vannamei_whiteleg'
  | 'ruhi_carp'
  | 'tilapia_biofloc';

export type WaterQualityRisk = 'normal' | 'caution' | 'hypoxia_kill_risk' | 'ammonia_toxicity' | 'salinity_shock';

export type ShrimpSizeGrade = 'U_10' | 'count_16_20' | 'count_21_25' | 'count_31_40' | 'count_41_50';

export interface GherWaterTelemetryInput {
  gherId: string;
  species: AquacultureSpecies;
  dissolvedOxygenMgL: number;
  waterTemperatureCelsius: number;
  salinityPpt: number;
  phLevel: number;
  ammoniaMgL: number;
}
```
