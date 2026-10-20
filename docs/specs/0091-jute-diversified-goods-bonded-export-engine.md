# Spec 0091: Autonomous Golden Fiber (Raw Jute & Diversified Jute Goods / DJG) Sourcing, Baling Press Quality Grading (BJMC/BJMA), EPB 12% Export Cash Subsidy & NBR Bonded Warehouse Compliance Engine

## Summary
An autonomous golden fiber trade and manufacturing compliance engine tailored for Bangladeshi jute exporters, baling presses, and Diversified Jute Goods (DJG) MSMEs. Provides automated raw jute grading (Bangla White & Bangla Tossa with moisture & root-cut deductions), DJG manufacturing yield and conversion costing (Hessian, Sacking, CBC, shopping bags, geo-textiles), Bangladesh Bank FE Circular export cash subsidy calculations (12% for DJG, 7% for yarn/twine, 10% for traditional jute goods), and NBR Customs Bonded Warehouse register management with SHA-256 sealed export shipment dossiers.

## Acceptance Criteria

### AC-1: Raw Jute Grading & Baling Press Quality Assessment
- **Grades Supported**:
  - Bangla White (BW): Special, A, B, C, D, E
  - Bangla Tossa (BT): Special, 1, 2, 3, 4, 5, 6
- **Quality Parameters**:
  - Fiber tensile strength (cN/tex)
  - Retting water clarity index
  - Root cutting deduction percentage ($0\%$ to $25\%$)
  - Moisture content testing: Standard safe storage equilibrium $\le 14\%$. Moisture $>14\%$ incurs a statutory weight penalty deduction ($1.25\times$ excess moisture percentage) up to max reject threshold ($20\%$).
- **Baling Press Packaging**:
  - Kutcha Bale ($120\text{ kg} - 150\text{ kg}$) vs Pucca Export Hydraulic Press Bale ($180\text{ kg} / 400\text{ lbs}$).
  - Computes net marketable weight, bale counts, and spot price appraisal based on key arat benchmarks (Faridpur, Jessore, Rangpur, Tangail).

### AC-2: Diversified Jute Goods (DJG) Manufacturing Yield & Costing
- BOM conversion from raw fiber to finished export products:
  - Hessian Cloth ($200\text{ g/m}^2 - 400\text{ g/m}^2$)
  - Sacking Bags ($B.Twill$, Heavy Cees, Sugar Bags)
  - Carpet Backing Cloth (CBC) ($5.5\text{ oz} - 9\text{ oz}$)
  - Eco-Friendly Diversified Jute Crafts (Jute Shopping Bags, Geo-textiles, Jute Espadrilles)
- Standard spinning, batching oil, and weaving wastage buffers ($8\% - 12\%$).
- Itemized direct manufacturing costing per metric ton and per unit.

### AC-3: Export Promotion Bureau (EPB) & Bangladesh Bank FE Circular Cash Subsidy Engine
- Statutory export cash subsidy rates under Bangladesh Bank Foreign Exchange Circular:
  - Diversified Jute Goods (DJG / বহুমুখী পাটপণ্য): $12\%$
  - Jute Yarn & Twine (পাট সুতা / টুইন): $7\%$
  - Traditional Hessian & Sacking (প্রচলিত পাটপণ্য): $10\%$
  - Raw Jute Exporters: $0\%$ (export duty/statutory restrictions apply)
- Minimum local value addition threshold: $\ge 30\%$ for subsidy eligibility.
- Automated Proceeds Realization Certificate (PRC) audit & EPB statutory claim dossier generator.

### AC-4: NBR Customs Bonded Warehouse Register & Cryptographic Export Dossier
- NBR Customs Bonded Warehouse raw material import/local raw jute purchase ledger (Mushak-6.1 / Bonded Stock Register).
- Zero-leakage domestic diversion validation.
- Cryptographic SHA-256 sealed export shipment certificate and bill of lading payload.

### AC-5: REST API Endpoints under `/api/v1/trade/jute/`
- `POST /api/v1/trade/jute/grading`: Appraise raw jute lot, moisture deductions, and pucca bale yield.
- `POST /api/v1/trade/jute/costing`: Compute DJG production BOM, wastage, and cost per unit.
- `POST /api/v1/trade/jute/subsidy`: Calculate Bangladesh Bank export cash subsidy and EPB compliance requirements.
- `POST /api/v1/trade/jute/bonded-dossier`: Generate NBR bonded warehouse inventory entry and SHA-256 sealed export dossier.
- `GET /api/v1/trade/jute/grades`: Return registered BJMC/BJMA grading matrix and market prices.

### AC-6: Frontend AG-UI Twin Studio Modal (`JuteExportModal.tsx`)
- Responsive mobile-first UI under 2GB RAM constraints.
- Keyboard shortcut `⌘J`.
- WAI-ARIA modal accessibility, role="dialog", aria-modal="true", tab index management, 36px touch targets.
- Interactive moisture slider, grade picker, bale calculator, and live export cash subsidy simulator.

### AC-7: Regression Test Suite
- Comprehensive unit and integration tests verifying all mathematical formulas, moisture deductions, statutory subsidies, bonded warehouse registers, and Express route validation.
