# Spec 0063: Nilkhet Print-on-Demand (POD) 300-DPI Spine & CMYK Press Engine

## 1. Overview
Automated spine caliper and print production calculator for Dhaka Nilkhet commercial book printing, supporting softcover perfect binding and hardcover casebound books with CMYK bleed margins and weight estimation.

## 2. Acceptance Criteria
- **AC-1**: Calculate spine width in millimeters based on page count, paper stock (offset 70/80gsm, art paper 100/120/150gsm, newsprint 55gsm), and binding method (perfect bind vs casebound board).
- **AC-2**: Compute 300-DPI press print dimensions including 3mm standard bleed margins.
- **AC-3**: Validate Bengali Unicode font embedding (e.g. SolaimanLipi, Kalpurush, Nikosh).
- **AC-4**: Estimate parcel net/gross weight in grams for domestic postal & Steadfast delivery.

## 3. Implementation
- Engine: `lib/office-engine/spine-calculator.ts`
- Tests: `lib/office-engine/spine-calculator.test.ts`
