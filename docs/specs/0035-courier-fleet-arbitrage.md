# Specification: Slice 35 — Autonomous Courier Fleet Arbitrage & Micro-Hub Dispatcher

## 1. Problem Statement
Bangladeshi e-commerce and F-commerce merchants face significant delivery friction, COD realization delays, and high Return-to-Origin (RTO) rates (15%–30% in rural upazilas). Couriers (Steadfast, Pathao, RedX, Paperfly) offer widely differing pricing structures, COD remittance charges (0.5%–1.5%), delivery speed, and district-by-district delivery success rates (DSR). 

Without automated multi-courier arbitrage, solopreneurs either overpay delivery fees or lose up to ৳30,000/month in dead return shipping and locked inventory.

---

## 2. Mathematical Arbitrage & Dynamic Routing Invariants

### 2.1 Composite Delivery Score (CDS)
For any order $O$ destined to district $d$ with weight $w$, package value $V$, and candidate courier $c \in \{\text{Steadfast}, \text{Pathao}, \text{RedX}, \text{Paperfly}\}$:

$$\text{Net Delivery Cost}(c) = \text{Base Fee}(c, d, w) + (V \times \text{COD Fee \%}(c))$$

$$\text{Expected Value realized}(c) = \text{DSR}(c, d) \times V - (1 - \text{DSR}(c, d)) \times (\text{Base Fee}(c, d, w) + \text{Return Charge}(c))$$

$$\text{Score}(c) = w_{\text{dsr}} \cdot \text{DSR}(c, d) + w_{\text{cost}} \cdot \left(1 - \frac{\text{Net Delivery Cost}(c)}{\max(\text{Costs})}\right) + w_{\text{speed}} \cdot \left(1 - \frac{\text{ETA Hours}(c)}{72}\right)$$

Where weights $w_{\text{dsr}} = 0.50$, $w_{\text{cost}} = 0.30$, $w_{\text{speed}} = 0.20$.

---

## 3. Acceptance Criteria

### AC-1: District-by-District Multi-Carrier Rate & DSR Matrix
- Maintain real-time matrix across 64 districts and 4 carriers.
- Covers:
  - Inside Dhaka (৳60–৳70)
  - Dhaka Suburbs / Savar / Gazipur (৳100–৳110)
  - Chittagong / Sylhet Metro (৳110–৳120)
  - Rest of Bangladesh / Rural Upazilas (৳130–৳150)
  - COD remittance fee: Steadfast (0.9%), Pathao (1.0%), RedX (1.2%), Paperfly (1.5%).

### AC-2: Predictive Delivery Success Rate (DSR) & Fraud Risk Filter
- Computes customer phone risk score based on past delivery realizations.
- Recommends optimal carrier with highest expected net payout.

### AC-3: Automated 1-Click Multi-Carrier Consignment Creation
- Dispatches consignment request to selected optimal carrier.
- Generates unified consignment ID, tracking link, and standardized printable shipping barcode.

### AC-4: RTO Prevention & Automated Customer Rescheduling Webhook
- Live parcel status state machine: `booked` $\rightarrow$ `in_transit` $\rightarrow$ `out_for_delivery` $\rightarrow$ `delivered` / `rto_risk` $\rightarrow$ `returned`.
- On failed attempt (`rto_risk`), triggers automated Banglish SMS/WhatsApp rescheduling prompt.

### AC-5: Express API Endpoints (`/api/v1/logistics/*`)
- `POST /api/v1/logistics/arbitrage/evaluate`: Evaluates all 4 carriers and ranks by optimal score.
- `GET /api/v1/logistics/carriers/matrix`: Returns district rate & performance matrix.
- `POST /api/v1/logistics/consignments/dispatch`: Creates consignment with selected/optimal carrier.
- `GET /api/v1/logistics/consignments`: Returns unified multi-carrier consignment feed.

### AC-6: Frontend Studio Modal (`CourierArbitrageModal.tsx`)
- 4-tab interface:
  1. **Carrier Arbitrage Calculator**: Order input $\rightarrow$ side-by-side cost, DSR & ETA comparison.
  2. **Active Consignments Feed**: Unified multi-carrier parcel tracking list.
  3. **64-District Performance Matrix**: Heatmap of courier delivery success rates.
  4. **RTO Prevention & Rescheduler**: Real-time flagged delivery alerts with 1-click customer outreach.
- Global keyboard shortcut: **`⌘R` / `Ctrl+R`**.
