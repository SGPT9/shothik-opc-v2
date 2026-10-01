# Spec 0080: Nilkhet Commercial Print-on-Demand (POD) Press Network, Automated 300-DPI CMYK Preflight & Steadfast Press-to-Door Book Courier Fulfillment Engine

## 1. Problem Statement & Domain Reality
Nilkhet Book Market and Katabon Press Lane in Dhaka represent the primary epicenter of commercial, academic, and literary book production in South Asia. Solopreneur authors, independent publishers, researchers, and One-Person Companies (OPCs) generating books, training manuals, and academic dissertations encounter recurring pre-press friction:

1. **Spine Caliper Miscalculation**: Miscalculating spine bulk thickness across varying paper grammages (offset 70/80gsm, book cream 80gsm, art paper 100/120gsm, newsprint 55gsm) and binding styles (paperback glue, hardcover casebound board, spiral) leads to spine text drift, gutter cut-off, and damaged binding runs.
2. **Pre-Press 300-DPI CMYK Bleed Incompatibilities**: Digital PDF uploads frequently lack the required 3mm outer bleed, resulting in white border slivers during high-speed guillotine trimming.
3. **Bengali Complex Typography (যুক্তবর্ণ) Dropouts**: Incomplete font embedding in print-ready PDFs causes complex Bengali conjunct ligatures (e.g., ক্ষ, হ্ম, ঙ্ক, ঙ্গ, ত্র্য) to rasterize improperly on CTP (Computer-to-Plate) offset units.
4. **Opaque Nilkhet Press Quotations**: Solopreneurs lack transparent production costing across printing press clusters (Bakushah Market, Katabon Monograph Works, Babupura Commercial Hub).
5. **Disconnected Last-Mile Courier Handshake**: After press run completion, bundling and dispatching books to readers across 64 districts requires manual logistics booking. Without automatic tare/gross weight calculation, merchants face shipping surcharges and COD return penalties.

---

## 2. Core Architectural Pillars & Acceptance Criteria

### AC-1: Automated Nilkhet Spine Caliper & 300-DPI Dimension Calculator
- Calculates exact spine thickness ($S_{\text{mm}}$) using paper caliper indices:
  - $70\text{ gsm offset}$: $0.095\text{ mm/leaf}$
  - $80\text{ gsm offset}$: $0.108\text{ mm/leaf}$
  - $80\text{ gsm book cream}$: $0.125\text{ mm/leaf}$ (high-bulk literary paper)
  - $100\text{ gsm art paper}$: $0.100\text{ mm/leaf}$
  - $120\text{ gsm art paper}$: $0.120\text{ mm/leaf}$
  - $55\text{ gsm newsprint}$: $0.080\text{ mm/leaf}$
- For hardcover casebound books, adds $+3.0\text{ mm}$ for 32oz/36oz greyboard backing + hinge allowance.
- Calculates exact 300-DPI pixel dimensions for front, spine, back, and 3mm outer bleed.
- Supports standard South Asian trim sizes: `6" × 9"`, `A5 (5.83" × 8.27")`, `Royal Demy (6.25" × 9.5")`.

### AC-2: Pre-Press CMYK & Bengali Font Preflight Validator
- Verifies document color space profile (FOGRA39 / GRACoL CMYK target).
- Validates embedded Bengali Unicode font subsets (SolaimanLipi, Kalpurush, Nikosh, Shothik Bengali, Anek Bangla).
- Detects missing glyph warnings for complex conjunct ligatures and pre-base vowel markers.
- Evaluates minimum 300 DPI resolution threshold on embedded raster images and cover artwork.

### AC-3: Nilkhet Press Cluster Quoting & Production Routing Engine
- Computes itemized production cost in BDT:
  - CTP Plate preparation charges per 16-page forme / signature.
  - Paper ream stock consumption based on trim size imposition.
  - Binding cost (perfect hot-melt glue vs stitch-and-bound hardcover board vs spiral).
  - Lamination finish (thermal matte, high-gloss, spot UV cover treatment).
- Matches orders with verified Nilkhet press hubs:
  - `hub_bakushah_press_01`: Bakushah Market Digital & Offset Press Complex (Heidelberg Speedmaster, Horizon BQ-470)
  - `hub_katabon_monograph_02`: Katabon Academic & Monograph Press Works (Komori Lithrone G40, Kolbus Casemaker)
  - `hub_babupura_sheetfed_03`: Babupura Commercial Sheetfed Offset Hub (Mitsubishi Diamond 3000, Muller Martini Pantera)

### AC-4: Press-to-Door Steadfast & Pathao Courier Bulk Dispatch
- Calculates precise book net and gross tare weight in grams:
  - Net page block weight + cover board weight + protective bubble/corrugated carton tare.
- Integrates directly with Steadfast Courier and Pathao logistics APIs for automated 1-click press pickup booking.
- Generates compliant shipping labels with barcode, order reference, COD collection amount, and 64-district routing codes.
- Prepares SHA-256 sealed digital delivery challan conforming to Mushak-6.3 commercial invoice standards.

### AC-5: REST API Endpoints (`artifacts/api-server`)
- `POST /api/v1/publishing/nilkhet-pod/quote`: Generate itemized press production quote with caliper metrics and turnaround estimate.
- `POST /api/v1/publishing/nilkhet-pod/preflight`: Analyze print PDF for CMYK compliance, 3mm bleed, 300 DPI image density, and font subset embedding.
- `POST /api/v1/publishing/nilkhet-pod/dispatch`: Book automated press-to-door courier consignment (Steadfast/Pathao) with parcel weight calculation and consignment tracking token.
- `GET /api/v1/publishing/nilkhet-pod/press-hubs`: Retrieve list of active Nilkhet/Katabon press hubs with operational machinery and turnaround status.

### AC-6: Frontend AG-UI Twin Studio Cockpit (`NilkhetPodModal.tsx`)
- Registered in `TwinCommandPalette.tsx` under `nilkhet-pod` / `print-on-demand` with shortcut `⌘B` / `Ctrl+B`.
- Interactive spine bulk caliper slider and real-time 3D book cover visualizer.
- Instant press pricing breakdown (paper, plate, binding, lamination, and delivery fees in BDT).
- Direct pre-press validation checklist with font embedding and bleed margin indicators.
- One-click Steadfast press-to-door courier dispatch trigger with printable consignment manifests.
- WAI-ARIA accessibility integration with `useModalA11y`, mobile touch target compliance (min-h-[36px]/min-h-[44px]), and offline draft persistence.
