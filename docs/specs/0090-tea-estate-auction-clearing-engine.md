# Spec 0090: Autonomous Tea Estate Auction Bidding, Leaf Grade Quality Index & Chittagong/Sreemangal Tea Auction Clearing Engine

## 1. Domain Overview
The Bangladesh Tea Industry represents one of the oldest formal commodity agro-industrial ecosystems in South Asia, governed by the **Bangladesh Tea Board (BTB)** under the Ministry of Commerce. With over 168 registered commercial tea estates across Greater Sylhet (Sreemangal, Moulvibazar, Habiganj), Chittagong, and emerging northern flatland smallholder clusters in Panchagarh and Thakurgaon, over 95 million kilograms of made tea are produced and auctioned annually.

Public trading of tea in Bangladesh is strictly conducted through licensed auction centers:
1. **Chittagong Tea Auction Center** (administered by Chittagong Tea Traders Association - CTTA in Agrabad)
2. **Sreemangal Tea Auction Center** (second national e-auction platform in Moulvibazar)
3. **Panchagarh Tea Center** (dedicated northern smallholder green leaf & made tea hub)

This engine automates tea estate cataloging, leaf grade sensory appraisal (Tea Taster Quality Index), competitive real-time auction bidding, statutory tea cess deductions (BTB cess), broker commission calculations, warehouse delivery order (DO) generation, and smallholder flatland green leaf fair pricing safeguards.

---

## 2. Core Architecture & Modules

### 2.1 Tea Estate Registry & Regional Profiling
- **Estates Profiled**:
  - `finlay_sreemangal`: James Finlay Tea Estates, Sreemangal, Moulvibazar (Sylhet valley, orthodox & premium CTC)
  - `ispahani_mirzapore`: Ispahani Tea Estate, Mirzapore / Chittagong (Premier CTC blenders & estates)
  - `duncan_camellia`: Duncan Brothers / Camellia Estates, Habiganj (High yield CTC Fannings & Dust)
  - `ntc_patrokhola`: National Tea Company (NTC) Patrokhola, Kamalganj, Moulvibazar (Public sector heritage garden)
  - `kazi_panchagarh`: Kazi & Kazi Tea Estate, Tetulia, Panchagarh (Certified organic bio-dynamic flatland whole leaf)
  - `tetulia_smallholder_coop`: Panchagarh Smallholder Tea Grower Cooperative (Flatland green leaf small growers)

### 2.2 Leaf Grades & Classification
- **CTC (Crush, Tear, Curl) Commercial Grades**:
  - Broken: `BOP` (Broken Orange Pekoe), `GBOP` (Golden Broken Orange Pekoe), `FBOP` (Flowery Broken Orange Pekoe)
  - Fannings: `OF` (Orange Fannings), `PF` (Pekoe Fannings), `FOF` (Flowery Orange Fannings)
  - Dust: `PD` (Pekoe Dust), `RD` (Red Dust), `D` (Dust), `CD` (Churamoni Dust)
- **Specialty & Orthodox Grades**:
  - `FTGFOP`: Fine Tippy Golden Flowery Orange Pekoe (Whole leaf specialty)
  - `GREEN_TEA_SENCHA`: Organic steamed green leaf (Northern terroir)

### 2.3 Tea Taster Quality Index (TTQI)
Appraises sensory characteristics on a 0–100 scale:
- **Leaf Appearance** (0–25): Uniformity of size, color, bloom, absence of fiber/stalk.
- **Infused Coppery Aroma** (0–25): Bright coppery brightness upon steeping, absence of sourness or smokiness.
- **Liquor Color & Brightness** (0–25): Golden-amber depth, clarity in water, absence of muddy turbidity.
- **Briskness & Strength** (0–25): Palate snap, punch, caffeine kick, and astringency balance.

Quality Tiers:
- `>= 85`: `prime_export`
- `75 - 84`: `premium_domestic`
- `60 - 74`: `standard_commercial`
- `< 60`: `substandard_blend`

### 2.4 Competitive Auction Lot Bidding & Clearance
- Floor Reserve Price Calculation based on grade baseline, TTQI score, and market demand.
- Bid Increment Enforcement: Minimum BDT 2.00/kg increment above high bid.
- Statutory Settlement Breakdown:
  - **Gross Hammer Value** = `winningBidPerKg * totalWeightKg`
  - **BTB Tea Cess** = `1.50 BDT/kg` statutory development levy
  - **Broker Commission** = `1.25%` of gross hammer value
  - **Bonded Warehouse Handling & Storage** = `0.75 BDT/kg`
  - **Advance Income Tax (AIT)** = `1.0%` of gross hammer value
  - **Net Buyer Outlay** = `Gross + Cess + Commission + Warehouse + AIT`
  - **Net Estate Proceeds** = `Gross - Commission - Cess - Warehouse`

### 2.5 Smallholder Flatland Tea Grower Fair Price Formula
To prevent predatory factory pricing of fresh plucked green leaf in Panchagarh and Thakurgaon:
$$\text{Fair Green Leaf Price (BDT/kg)} = \left(\frac{\text{Average Made Tea Auction Price}}{4.5}\right) \times 0.90$$
Where 4.5 kg of green leaf yields ~1.0 kg of made tea, ensuring smallholders receive at least 90% of equivalent factory net realizations.

### 2.6 Bonded Warehouse Delivery Order (DO) Release
- Issues cryptographic SHA-256 signed Delivery Order containing release QR token, lot ID, winning bidder license, warehouse location (Agrabad / Sreemangal bonded depot), and customs clearance status.

---

## 3. API Endpoints
- `GET /api/v1/agri/tea/estates` - Returns registered tea estate profiles and auction center associations.
- `POST /api/v1/agri/tea/taster-appraisal` - Appraises tea sensory metrics and computes TTQI score, quality tier, and recommended reserve price.
- `POST /api/v1/agri/tea/auction/bid` - Places competitive auction bid, checks increment, and computes clearing breakdown.
- `POST /api/v1/agri/tea/auction/clear-lot` - Finalizes hammer clearance, calculates statutory cess/commission/AIT, and generates signed Delivery Order.
- `POST /api/v1/agri/tea/smallholder/fair-price` - Computes statutory green leaf fair support price for smallholder farmers.

---

## 4. Frontend Component
- `TeaAuctionModal.tsx`:
  - Registered under Twin shortcut `⌘T` (or accessible via palette).
  - WAI-ARIA role="dialog", keyboard navigation, tablist navigation.
  - Tabs:
    1. **Live Auction Bidding** (interactive bidding console with live hammer calculation, cess & AIT breakdown).
    2. **Tea Taster Appraisal** (interactive sliders for Appearance, Aroma, Liquor, Briskness with TTQI dial).
    3. **Smallholder Green Leaf** (fair pricing calculator for Panchagarh/Thakurgaon tea farmers).
    4. **Registered Tea Estates** (Sylhet, Sreemangal, Chittagong, Panchagarh profiles).
