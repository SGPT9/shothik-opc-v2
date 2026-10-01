# Specification 0084: Autonomous Cross-Border Land Port Clearing, Port Health & Customs Electronic Cargo Tracking System (ECTS)

## 1. Executive Overview & Problem Statement
Over 85% of Bangladesh's bilateral overland trade with India, Bhutan, and Nepal flows through Land Customs Stations (LCS) managed by the Bangladesh Land Port Authority (বাংলাদেশ স্থলবন্দর কর্তৃপক্ষ - BSLPA) and the National Board of Revenue (NBR) Customs:
- **Benapole / Petrapole** (Jeshore corridor - 70% volume)
- **Bhomra / Ghojadanga** (Satkhira corridor - perishable agro and bulk stone)
- **Tamabil / Dawki** (Sylhet / Meghalaya corridor - coal, limestone, spices)
- **Burimari / Changrabandha** (Lalmonirhat corridor - Bhutan transit corridor)
- **Akhaura / Agartala** (Brahmanbaria corridor - North-East India transit)

SME importers, agro-traders, and One-Person Companies (OPCs) face heavy manual delays, demurrage port charges (৳500–৳2,500/truck/day), weighbridge discrepancies, quarantine clearance bottlenecks, and complex Electronic Cargo Tracking System (ECTS) transit locks.

Slice 84 implements an autonomous clearing and compliance engine that orchestrates:
1. **BSLPA Port Gate-Pass & Automated Weighbridge Tare/Gross Audit**
2. **Plant Quarantine & Food Safety Port Health Clearance with SHA-256 Seals**
3. **ECTS Electronic RFID/GPS Transit Lock & Corridor Geofence Monitoring**
4. **BBIN Motor Vehicles Agreement (BBIN-MVA) Cross-Border Truck Permits & Demurrage Escrow**
5. **Accessible AG-UI Twin Studio Modal (`LandPortClearingModal.tsx`) with keyboard shortcut `⌘L`**

---

## 2. Domain Models & Technical Architecture

### 2.1 Land Port Stations
```typescript
export type LandPortStationId = "benapole" | "bhomra" | "tamabil" | "burimari" | "akhaura";

export interface LandPortStation {
  id: LandPortStationId;
  nameBangla: string;
  nameEnglish: string;
  counterpartPort: string; // e.g. "Petrapole, India"
  division: string;
  primaryCargo: string[];
  basePortFeeBdt: number;
  demurrageRatePerDayBdt: number;
  freeHours: number; // e.g. 72 hours
}
```

### 2.2 Weighbridge Gross/Tare Audit
- **Gross Weight**: Truck + Cargo.
- **Tare Weight**: Empty truck weight.
- **Net Weight**: Gross - Tare.
- **Declared Weight**: Manifest declared weight.
- **Discrepancy Formula**: $\Delta = \frac{|\text{Net Weight} - \text{Declared Weight}|}{\text{Declared Weight}} \times 100\%$
- **Discrepancy Tolerance**: If $\Delta > 1.5\%$, trigger inspection audit and surcharge under BSLPA Regulations.

### 2.3 Plant Quarantine & Port Health Clearance
- Plant Quarantine Act 2011 and Bangladesh Food Safety Act 2013 compliance.
- Clearance levels: `CLEARED_GREEN`, `TREATMENT_REQUIRED_ORANGE`, `REJECTED_RED`.
- Generates SHA-256 tamper-proof Port Health Certificate.

### 2.4 ECTS Electronic Lock & Route Corridor Monitoring
- GPS/GSM electronic cargo tracking lock ID.
- Waypoints: Border Entry -> Weighbridge -> Customs Examination Yard -> Inland Container Depot (ICD) / Delivery Point.
- Tamper alert: Any unauthorized unsealing or route deviation $> 2\text{ km}$ triggers Section 128 Customs Act 2023 violation alarm.

### 2.5 BBIN-MVA Cross-Border Truck Permit & Demurrage
- BBIN (Bangladesh-Bhutan-India-Nepal) Motor Vehicles Agreement permit.
- Temporary entry permit fee: ৳2,000 base.
- Demurrage calculation: Days beyond `freeHours` $\times$ `demurrageRatePerDayBdt`.

---

## 3. Acceptance Criteria

- **AC-1 (Weighbridge Audit)**: Calculate Net Weight, verify against manifest declared weight, compute discrepancy percentage, and flag overweight violations beyond 1.5% tolerance.
- **AC-2 (Quarantine & Health Clearance)**: Evaluate agricultural and consumable cargo against pest/pathogen thresholds and generate SHA-256 digital clearance certificates.
- **AC-3 (ECTS Transit Lock & Corridor Telemetry)**: Ingest lock status, verify corridor geofencing, and flag route breach or tamper alarms.
- **AC-4 (BBIN-MVA Permit & Demurrage Escrow)**: Calculate permit fees, demurrage liability, and bKash/bank escrow requirements.
- **AC-5 (REST API Mount)**: Expose endpoints under `/api/v1/trade/land-port/...` mounted in `artifacts/api-server/src/routes/index.ts`.
- **AC-6 (Frontend Studio Modal)**: Responsive modal `LandPortClearingModal.tsx` in `artifacts/shothik/src/components/twin/` with shortcut `⌘L` / `Ctrl+L`, WAI-ARIA role `dialog`, and 36px touch targets.
- **AC-7 (Quality & Regression)**: 100% test coverage across both API route suites and React component suites.
