# 📦 Spec 0030: Cross-Border Sourcing & Bangladesh Customs Declaration Engine

**Status**: Approved & Active  
**Monorepo Package**: `@workspace/api-server`, `@workspace/shothik`  
**Governing Standard**: Bangladesh Customs Act 2023, National Board of Revenue (NBR) First Schedule Tariff, and BTRC/BSTI Import Policies  

---

## 1. Executive Summary & Problem Context
Bangladeshi solo-founders, F-Commerce merchants, and boutique electronics/apparel importers face extreme unpredictability when sourcing products from China (1688, Taobao, AliExpress) or international suppliers. The primary pain points are:
1. **Uncertain Landed Cost**: Importers do not know the actual unit cost until customs clearance is completed, leading to mispriced goods or negative profit margins.
2. **Complex NBR Statutory Tariff Cascades**: Bangladesh Customs computes duties in a strict compound cascade (Assessable Value $\rightarrow$ CD $\rightarrow$ RD $\rightarrow$ SD $\rightarrow$ VAT $\rightarrow$ AIT $\rightarrow$ AT).
3. **C&F Agent Misalignment**: Inaccurate HS codes or incomplete packing lists cause customs demurrage at Chittagong Seaport or Dhaka Airport Cargo Village.

Spec 0030 delivers a deterministic, automated Cross-Border Sourcing & Customs Declaration Engine that calculates statutory landed costs, resolves 8-digit HS codes, warns against import restrictions (BSTI/BTRC noc required), and compiles a certified C&F clearance brief.

---

## 2. Statutory NBR Customs Tariff Formula

### 2.1 Assessable Value (AV)
$$\text{FOB Value (BDT)} = \text{Product Price (USD)} \times \text{Exchange Rate (BDT/USD)}$$
$$\text{Freight (BDT)} = \text{Shipping Cost (USD)} \times \text{Exchange Rate (BDT/USD)}$$
$$\text{Insurance (BDT)} = 1\% \times (\text{FOB} + \text{Freight})$$
$$\text{Assessable Value (AV)} = \text{FOB} + \text{Freight} + \text{Insurance}$$

### 2.2 Cascading Duty Components
1. **Customs Duty (CD)**:
   $$\text{CD} = \text{AV} \times \text{CD Rate (e.g. 25\%)}$$
2. **Regulatory Duty (RD)**:
   $$\text{RD} = \text{AV} \times \text{RD Rate (e.g. 3\%)}$$
3. **Supplementary Duty (SD)**:
   $$\text{SD} = (\text{AV} + \text{CD} + \text{RD}) \times \text{SD Rate (e.g. 20\%)}$$
4. **Value Added Tax (VAT)**:
   $$\text{VAT} = (\text{AV} + \text{CD} + \text{RD} + \text{SD}) \times 15\%$$
5. **Advance Income Tax (AIT)**:
   $$\text{AIT} = \text{AV} \times 5\%$$
6. **Advance Tax (AT)**:
   $$\text{AT} = (\text{AV} + \text{CD} + \text{RD} + \text{SD}) \times 5\%$$

### 2.3 Total Customs Duty & Tax (TCDT) and Landed Cost
$$\text{Total Duty \& Tax (TCDT)} = \text{CD} + \text{RD} + \text{SD} + \text{VAT} + \text{AIT} + \text{AT}$$
$$\text{Total Commercial Landed Cost} = \text{Assessable Value} + \text{TCDT} + \text{Port Handling / C\&F Fees}$$
$$\text{Landed Cost Per Unit} = \frac{\text{Total Commercial Landed Cost}}{\text{Quantity}}$$

---

## 3. High-Volume E-Commerce HS Code Catalog

| HS Code (8-digit) | Category & Description | CD | RD | SD | VAT | AIT | AT | Regulatory Warning |
|---|---|---|---|---|---|---|---|---|
| `8517.13.00` | Smartphones & Cellular Handsets | 25% | 3% | 0% | 15% | 5% | 5% | BTRC NOC Mandatory |
| `8518.30.00` | TWS Earbuds, Headphones & Earphones | 25% | 3% | 20% | 15% | 5% | 5% | BTRC Type Approval |
| `8504.40.90` | Fast GaN Chargers & Power Banks | 15% | 0% | 0% | 15% | 5% | 5% | BSTI Standard (BDS IEC) |
| `6109.10.00` | Cotton T-Shirts & Knitted Apparel | 25% | 3% | 45% | 15% | 5% | 5% | NBR Minimum Tariff Value |
| `3304.99.00` | Skincare, Serums & Cosmetics | 25% | 3% | 60% | 15% | 5% | 5% | BSTI Mandatory Certification |
| `9503.00.90` | Toys & Educational STEM Kits | 25% | 3% | 20% | 15% | 5% | 5% | Non-Toxic Material Declaration |
| `8471.30.00` | Laptops & Portable Data Processing | 5% | 0% | 0% | 15% | 5% | 5% | Duty Concession Tier |

---

## 4. API Endpoints Catalog (`/api/v1/customs`)

- `POST /api/v1/customs/calculate-landed-cost` — Computes full statutory waterfall in BDT and unit landed cost.
- `GET /api/v1/customs/hs-codes` — Searchable catalog of 8-digit Bangladesh HS codes.
- `POST /api/v1/customs/generate-cf-brief` — Compiles a printable, timestamped C&F clearing brief.
- `GET /api/v1/customs/exchange-rates` — BDT reference exchange rates (USD, CNY, EUR).

---

## 5. Acceptance Criteria

- **AC-1**: Statutory tariff calculation accurately reproduces the compound cascade for CD, RD, SD, VAT, AIT, and AT.
- **AC-2**: HS code catalog resolves common e-commerce items and flags regulatory NOC prerequisites (BTRC, BSTI).
- **AC-3**: Currency conversion supports USD, CNY, and EUR with fallback to Bangladesh Bank reference rates.
- **AC-4**: C&F clearing brief compiles essential shipping manifest data, assessable values, and port clearance checklist.
- **AC-5**: Frontend Twin Modal (`CrossBorderCustomsModal.tsx`) opens via `⌘U` / `Ctrl+U`, supports tab navigation, and provides copyable brief outputs.
